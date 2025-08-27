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

    // For now, we'll skip organization validation to avoid RLS issues
    // In production, you should implement proper organization validation

    // Get existing connected accounts (skip organization_id filter for now)
    const { data: connectedAccounts } = await supabaseClient
      .from("social_accounts")
      .select("platform_account_id, platform")
      .eq("platform", platform)
      .eq("is_active", true);

    const connectedIds =
      connectedAccounts?.map((acc) => acc.platform_account_id) || [];

    // Mock data for demonstration - in real implementation, this would call the platform APIs
    let accounts = [];

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

    return new Response(JSON.stringify({ accounts }), {
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
