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

    const { platform, organization_id } = await req.json();

    if (!platform) {
      throw new Error("Missing platform parameter");
    }

    // Get user from auth
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Validate user has access to organization
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();
    if (!profile || profile.organization_id !== organization_id) {
      throw new Error("Unauthorized");
    }

    // Get existing connected accounts for org with health fields
    const { data: connectedAccounts } = await supabaseClient
      .from("social_accounts")
      .select(
        "id, account_id, platform, is_active, last_refresh_at, last_error, token_expires_at"
      )
      .eq("platform", platform)
      .eq("organization_id", organization_id)
      .eq("is_active", true);

    const connectedIds = connectedAccounts?.map((acc) => acc.account_id) || [];

    // Return only accounts that are connected in the database for this org
    const accounts = (connectedAccounts || []).map((a: any) => ({
      id: a.account_id,
      name: a.account_id,
      username: undefined,
      avatar_url: undefined,
      type: platform,
      followers_count: undefined,
    }));

    switch (platform) {
      case "facebook":
        accounts = [
          {
            id: "page_1",
            name: "My Business Page",
            username: "mybusiness",
            avatar_url: "https://via.placeholder.com/40",
            type: "page",
            followers_count: 1250,
            is_connected: connectedIds.includes("page_1"),
          },
          {
            id: "page_2",
            name: "Personal Profile",
            username: "john.doe",
            avatar_url: "https://via.placeholder.com/40",
            type: "profile",
            followers_count: 450,
            is_connected: connectedIds.includes("page_2"),
          },
        ];
        break;

      case "instagram":
        accounts = [
          {
            id: "ig_1",
            name: "Business Instagram",
            username: "mybusiness_ig",
            avatar_url: "https://via.placeholder.com/40",
            type: "business",
            followers_count: 3200,
            is_connected: connectedIds.includes("ig_1"),
          },
        ];
        break;

      case "linkedin":
        accounts = [
          {
            id: "li_1",
            name: "Company Page",
            username: "mycompany",
            avatar_url: "https://via.placeholder.com/40",
            type: "business",
            followers_count: 8500,
            is_connected: connectedIds.includes("li_1"),
          },
        ];
        break;

      default:
        accounts = [];
    }

    // Merge health info into connected accounts list
    const healthMap = new Map(
      (connectedAccounts || []).map((a: any) => [
        a.account_id,
        {
          account_id: a.account_id,
          id: a.id,
          is_active: a.is_active,
          last_refresh_at: a.last_refresh_at,
          token_expires_at: a.token_expires_at,
          last_error: a.last_error,
          health: deriveHealth(a),
        },
      ])
    );

    const accountsWithHealth = accounts.map((acc: any) => ({
      ...acc,
      is_connected: connectedIds.includes(acc.id),
      connection: healthMap.get(acc.id) || null,
    }));

    return new Response(JSON.stringify({ accounts: accountsWithHealth }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

function deriveHealth(a: any): "healthy" | "expiring" | "expired" | "error" {
  if (a.last_error) return "error";
  if (!a.token_expires_at) return "healthy";
  const now = new Date();
  const exp = new Date(a.token_expires_at);
  if (exp <= now) return "expired";
  const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays < 7 ? "expiring" : "healthy";
}
