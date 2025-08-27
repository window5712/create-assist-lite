import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { account_id, organization_id } = await req.json();

    if (!account_id || !organization_id) {
      throw new Error("Missing required parameters");
    }

    // Get user from auth
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user has access to organization
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.organization_id !== organization_id) {
      throw new Error("Unauthorized");
    }

    // Get the account to refresh
    const { data: account, error: accountError } = await supabaseClient
      .from("social_accounts")
      .select("*")
      .eq("id", account_id)
      .eq("organization_id", organization_id)
      .single();

    if (accountError || !account) {
      throw new Error("Account not found");
    }

    // Decrypt existing tokens
    const decrypt = async (encrypted: string | null) =>
      encrypted ? await decryptToken(encrypted) : "";

    // Check if token is expired and refresh if needed
    let accessToken = await decrypt(account.access_token_encrypted);
    let refreshToken = await decrypt(account.refresh_token_encrypted);
    let expiresAt = account.token_expires_at;

    if (
      account.token_expires_at &&
      new Date(account.token_expires_at) <= new Date()
    ) {
      // Token is expired, try to refresh it
      try {
        switch (account.platform) {
          case "facebook":
          case "instagram":
            // Facebook tokens are long-lived, but we can refresh if needed
            const fbRefreshResponse = await fetch(
              "https://graph.facebook.com/v18.0/oauth/access_token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  grant_type: "fb_exchange_token",
                  client_id: Deno.env.get("FACEBOOK_APP_ID") || "",
                  client_secret: Deno.env.get("FACEBOOK_APP_SECRET") || "",
                  fb_exchange_token: accessToken,
                }),
              }
            );

            const fbRefreshData = await fbRefreshResponse.json();
            if (fbRefreshData.error) {
              throw new Error(
                `Facebook token refresh failed: ${fbRefreshData.error.message}`
              );
            }

            accessToken = fbRefreshData.access_token;
            expiresAt = new Date(
              Date.now() + fbRefreshData.expires_in * 1000
            ).toISOString();
            break;

          case "linkedin":
            if (!refreshToken) {
              throw new Error("No refresh token available for LinkedIn");
            }

            const liRefreshResponse = await fetch(
              "https://www.linkedin.com/oauth/v2/accessToken",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  grant_type: "refresh_token",
                  client_id: Deno.env.get("LINKEDIN_CLIENT_ID") || "",
                  client_secret: Deno.env.get("LINKEDIN_CLIENT_SECRET") || "",
                  refresh_token: refreshToken,
                }),
              }
            );

            const liRefreshData = await liRefreshResponse.json();
            if (liRefreshData.error) {
              throw new Error(
                `LinkedIn token refresh failed: ${liRefreshData.error_description}`
              );
            }

            accessToken = liRefreshData.access_token;
            refreshToken = liRefreshData.refresh_token || refreshToken;
            expiresAt = new Date(
              Date.now() + liRefreshData.expires_in * 1000
            ).toISOString();
            break;

          default:
            throw new Error("Unsupported platform for token refresh");
        }
      } catch (refreshError) {
        // If refresh fails, mark account as inactive
        await supabaseClient
          .from("social_accounts")
          .update({
            is_active: false,
            last_error: `Token refresh failed: ${refreshError.message}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", account_id);

        throw new Error(`Account refresh failed: ${refreshError.message}`);
      }
    }

    // Update account with new token and sync timestamp
    const encrypt = async (token: string | null) =>
      token ? await encryptToken(token) : null;

    const { error: updateError } = await supabaseClient
      .from("social_accounts")
      .update({
        access_token_encrypted: await encrypt(accessToken),
        refresh_token_encrypted: await encrypt(refreshToken),
        token_expires_at: expiresAt,
        last_sync: new Date().toISOString(),
        last_error: null,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account_id);

    if (updateError) {
      throw new Error("Failed to update account");
    }

    return new Response(
      JSON.stringify({ message: "Account refreshed successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function encryptToken(token: string): Promise<string> {
  const keyMaterial = new TextEncoder().encode(
    (Deno.env.get("ENCRYPTION_KEY") || "").padEnd(32, "0").slice(0, 32),
  );
  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(token),
  );
  const combined = new Uint8Array(iv.byteLength + (encrypted as ArrayBuffer).byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted as ArrayBuffer), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptToken(encryptedToken: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode((Deno.env.get('ENCRYPTION_KEY') || '').padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )
  const combined = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encryptedData = combined.slice(12)
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  )
  return new TextDecoder().decode(decryptedData)
}
