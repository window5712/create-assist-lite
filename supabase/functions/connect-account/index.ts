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

    const { platform, account_id, organization_id } = await req.json();

    if (!platform || !account_id || !organization_id) {
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

    // Check if account is already connected
    const { data: existingAccount } = await supabaseClient
      .from("social_accounts")
      .select("*")
      .eq("organization_id", organization_id)
      .eq("platform", platform)
      .eq("platform_account_id", account_id)
      .single();

    if (existingAccount && existingAccount.is_active) {
      return new Response(
        JSON.stringify({ message: "Account already connected" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate OAuth URL for the platform
    const redirectUri = `${Deno.env.get(
      "SUPABASE_URL"
    )}/functions/v1/oauth-callback`;

    const statePayload = {
      platform,
      account_id,
      organization_id,
      user_id: user.id,
    } as const;
    const signature = await signState(statePayload);
    const state = btoa(JSON.stringify({ ...statePayload, sig: signature }));

    let authUrl = "";

    switch (platform) {
      case "facebook":
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${Deno.env.get(
          "FACEBOOK_APP_ID"
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&state=${state}&scope=pages_manage_posts,pages_read_engagement,pages_show_list`;
        break;

      case "instagram":
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${Deno.env.get(
          "FACEBOOK_APP_ID"
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&state=${state}&scope=instagram_basic,instagram_content_publish,pages_show_list`;
        break;

      case "linkedin":
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${Deno.env.get(
          "LINKEDIN_CLIENT_ID"
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&state=${state}&scope=w_member_social,r_liteprofile,w_organization_social`;
        break;

      default:
        throw new Error("Unsupported platform");
    }

    return new Response(
      JSON.stringify({
        requires_oauth: true,
        auth_url: authUrl,
      }),
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

async function signState(payload: {
  platform: string;
  account_id: string;
  organization_id: string;
  user_id: string;
}): Promise<string> {
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
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
}
