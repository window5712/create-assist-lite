import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, organization_id } = await req.json()
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user has access to organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('organization_id', organization_id)
      .single()

    if (profileError || !profile) {
      throw new Error('Unauthorized access to organization')
    }

    let authUrl: string
    const redirectUri = `${req.headers.get('origin')}/oauth/callback`
    const state = `${platform}_${organization_id}_${crypto.randomUUID()}`

    switch (platform) {
      case 'facebook':
        const fbAppId = Deno.env.get('FACEBOOK_APP_ID')
        const fbScopes = 'pages_manage_posts,pages_read_engagement,pages_show_list,instagram_basic,instagram_content_publish'
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${fbScopes}&state=${state}&response_type=code`
        break

      case 'linkedin':
        const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID')
        const linkedinScopes = 'w_member_social,r_liteprofile,r_organization_social,w_organization_social'
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${linkedinScopes}`
        break

      case 'instagram':
        // Instagram uses Facebook OAuth
        const igAppId = Deno.env.get('FACEBOOK_APP_ID')
        const igScopes = 'instagram_basic,instagram_content_publish'
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${igAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${igScopes}&state=${state}&response_type=code`
        break

      default:
        throw new Error('Unsupported platform')
    }

    // Store the state in a temporary table for verification
    await supabase.from('oauth_states').insert({
      state,
      platform,
      organization_id,
      expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    })

    return new Response(
      JSON.stringify({ authUrl, state }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('OAuth connect error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})