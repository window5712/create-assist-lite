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

    // Get the account to disconnect
    const { data: account, error: accountError } = await supabaseClient
      .from("social_accounts")
      .select("*")
      .eq("id", account_id)
      .eq("organization_id", organization_id)
      .single();

    if (accountError || !account) {
      throw new Error("Account not found");
    }

    // Deactivate the account
    const { error: updateError } = await supabaseClient
      .from("social_accounts")
      .update({
        is_active: false,
        last_error: "Account disconnected by user",
        updated_at: new Date().toISOString(),
      })
      .eq("id", account_id);

    if (updateError) {
      throw new Error("Failed to disconnect account");
    }

    return new Response(
      JSON.stringify({ message: "Account disconnected successfully" }),
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
