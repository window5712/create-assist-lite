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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error("Missing OAuth parameters");
    }

    // Decode and verify state parameter
    const stateData = JSON.parse(atob(state));
    const { platform, account_id, organization_id, user_id, sig } = stateData;
    const isValid = await verifyState(
      { platform, account_id, organization_id, user_id },
      sig
    );
    if (!isValid) {
      throw new Error("Invalid OAuth state");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Exchange code for access token
    let accessToken = "";
    let refreshToken = "";
    let expiresAt = "";

    switch (platform) {
      case "facebook":
      case "instagram":
        const fbResponse = await fetch(
          "https://graph.facebook.com/v18.0/oauth/access_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: Deno.env.get("FACEBOOK_APP_ID") || "",
              client_secret: Deno.env.get("FACEBOOK_APP_SECRET") || "",
              code: code,
              redirect_uri: `${Deno.env.get(
                "SUPABASE_URL"
              )}/functions/v1/oauth-callback`,
            }),
          }
        );

        const fbData = await fbResponse.json();
        if (fbData.error) {
          throw new Error(`Facebook OAuth error: ${fbData.error.message}`);
        }

        accessToken = fbData.access_token;
        expiresAt = new Date(
          Date.now() + fbData.expires_in * 1000
        ).toISOString();
        break;

      case "linkedin":
        const liResponse = await fetch(
          "https://www.linkedin.com/oauth/v2/accessToken",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: Deno.env.get("LINKEDIN_CLIENT_ID") || "",
              client_secret: Deno.env.get("LINKEDIN_CLIENT_SECRET") || "",
              code: code,
              redirect_uri: `${Deno.env.get(
                "SUPABASE_URL"
              )}/functions/v1/oauth-callback`,
            }),
          }
        );

        const liData = await liResponse.json();
        if (liData.error) {
          throw new Error(`LinkedIn OAuth error: ${liData.error_description}`);
        }

        accessToken = liData.access_token;
        refreshToken = liData.refresh_token || "";
        expiresAt = new Date(
          Date.now() + liData.expires_in * 1000
        ).toISOString();
        break;

      default:
        throw new Error("Unsupported platform");
    }

    // Get account details from platform
    let accountDetails = {} as {
      account_name: string;
      account_username?: string;
      account_avatar_url?: string;
    };

    switch (platform) {
      case "facebook":
        const fbAccountResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=id,name,username&access_token=${accessToken}`
        );
        const fbAccountData = await fbAccountResponse.json();
        accountDetails = {
          account_name: fbAccountData.name,
          account_username: fbAccountData.username,
          account_avatar_url: `https://graph.facebook.com/v18.0/${fbAccountData.id}/picture?type=large&access_token=${accessToken}`,
        };
        break;

      case "instagram":
        const igAccountResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,username&access_token=${accessToken}`
        );
        const igAccountData = await igAccountResponse.json();
        if (igAccountData.data && igAccountData.data.length > 0) {
          const account = igAccountData.data[0];
          accountDetails = {
            account_name: account.name,
            account_username: account.username,
            account_avatar_url: `https://graph.facebook.com/v18.0/${account.id}/picture?type=large&access_token=${accessToken}`,
          };
        }
        break;

      case "linkedin":
        const liAccountResponse = await fetch(
          "https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture)",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Restli-Protocol-Version": "2.0.0",
            },
          }
        );
        const liAccountData = await liAccountResponse.json();
        accountDetails = {
          account_name: `${liAccountData.firstName.localized.en_US} ${liAccountData.lastName.localized.en_US}`,
          account_username: liAccountData.id,
          account_avatar_url:
            liAccountData.profilePicture?.["displayImage~"]?.elements?.[0]
              ?.identifiers?.[0]?.identifier || "",
        };
        break;
    }

    // Save or update social account in database
    const { data: existingAccount } = await supabaseClient
      .from("social_accounts")
      .select("*")
      .eq("organization_id", organization_id)
      .eq("platform", platform)
      .eq("account_id", account_id)
      .single();

    // Encrypt tokens before storing
    const access_token_encrypted = await encryptToken(accessToken);
    const refresh_token_encrypted = refreshToken
      ? await encryptToken(refreshToken)
      : null;

    const accountData = {
      organization_id,
      platform,
      account_id: account_id,
      account_name: accountDetails.account_name,
      account_username: accountDetails.account_username || null,
      account_avatar_url: accountDetails.account_avatar_url || null,
      access_token_encrypted,
      refresh_token_encrypted,
      token_expires_at: expiresAt || null,
      is_active: true,
      last_refresh_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    } as const;

    if (existingAccount) {
      const { error: updateError } = await supabaseClient
        .from("social_accounts")
        .update(accountData)
        .eq("id", existingAccount.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseClient
        .from("social_accounts")
        .insert(accountData);
      if (insertError) throw insertError;
    }

    // Redirect to dashboard with success message
    const redirectUrl = `${
      Deno.env.get("FRONTEND_URL") || "http://localhost:5173"
    }/dashboard/social-accounts?success=true&platform=${platform}`;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Account Connected Successfully</title>
          <meta http-equiv="refresh" content="2;url=${redirectUrl}">
        </head>
        <body>
          <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h1>✅ Account Connected Successfully!</h1>
            <p>Your ${platform} account has been connected. Redirecting to dashboard...</p>
            <p><a href="${redirectUrl}">Click here if you're not redirected automatically</a></p>
          </div>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("OAuth callback error:", error);

    const redirectUrl = `${
      Deno.env.get("FRONTEND_URL") || "http://localhost:5173"
    }/dashboard/social-accounts?error=${encodeURIComponent(error.message)}`;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Connection Failed</title>
          <meta http-equiv="refresh" content="3;url=${redirectUrl}">
        </head>
        <body>
          <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h1>❌ Connection Failed</h1>
            <p>Error: ${error.message}</p>
            <p>Redirecting to dashboard...</p>
            <p><a href="${redirectUrl}">Click here if you're not redirected automatically</a></p>
          </div>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
        status: 400,
      }
    );
  }
});

async function verifyState(
  payload: {
    platform: string;
    account_id: string;
    organization_id: string;
    user_id: string;
  },
  signature: string
): Promise<boolean> {
  try {
    const secret = (Deno.env.get("STATE_SECRET") || "")
      .padEnd(32, "0")
      .slice(0, 32);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const data = `${payload.platform}|${payload.account_id}|${payload.organization_id}|${payload.user_id}`;
    const expectedBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(data)
    );
    const expected = btoa(String.fromCharCode(...new Uint8Array(expectedBuf)));
    return expected === signature;
  } catch {
    return false;
  }
}

async function encryptToken(token: string): Promise<string> {
  const keyMaterial = new TextEncoder().encode(
    (Deno.env.get("ENCRYPTION_KEY") || "").padEnd(32, "0").slice(0, 32)
  );
  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(token)
  );

  // Prepend IV to ciphertext and base64 encode
  const combined = new Uint8Array(
    iv.byteLength + (encrypted as ArrayBuffer).byteLength
  );
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted as ArrayBuffer), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}
