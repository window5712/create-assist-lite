import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      throw new Error(`OAuth error: ${error}`)
    }

    if (!code || !state) {
      throw new Error('Missing code or state parameter')
    }

    // Parse state to get platform and organization_id
    const [platform, organization_id] = state.split('_')

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify state and get organization_id
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single()

    if (stateError || !oauthState) {
      throw new Error('Invalid or expired state')
    }

    // Clean up the state
    await supabase.from('oauth_states').delete().eq('state', state)

    let accessToken: string
    let refreshToken: string | null = null
    let expiresAt: Date | null = null
    let accountInfo: any

    const redirectUri = `${url.origin}/oauth/callback`

    switch (platform) {
      case 'facebook':
      case 'instagram':
        // Exchange code for access token
        const fbAppId = Deno.env.get('FACEBOOK_APP_ID')
        const fbAppSecret = Deno.env.get('FACEBOOK_APP_SECRET')
        
        const fbTokenResponse = await fetch(
          `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${fbAppId}&client_secret=${fbAppSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
        )
        const fbTokenData = await fbTokenResponse.json()
        
        if (fbTokenData.error) {
          throw new Error(fbTokenData.error.message)
        }
        
        accessToken = fbTokenData.access_token
        if (fbTokenData.expires_in) {
          expiresAt = new Date(Date.now() + fbTokenData.expires_in * 1000)
        }

        // Get user info and pages
        const fbUserResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`
        )
        const fbUserData = await fbUserResponse.json()

        if (platform === 'facebook') {
          // Get Facebook Pages
          const pagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
          )
          const pagesData = await pagesResponse.json()
          
          for (const page of pagesData.data) {
            await storeSocialAccount(supabase, {
              organization_id: oauthState.organization_id,
              platform: 'facebook',
              account_id: page.id,
              account_name: page.name,
              access_token: page.access_token, // Use page token
              scopes: ['pages_manage_posts', 'pages_read_engagement'],
            })
          }
        } else {
          // Instagram Business accounts
          const igAccountsResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
          )
          const igAccountsData = await igAccountsResponse.json()
          
          for (const page of igAccountsData.data) {
            if (page.instagram_business_account) {
              const igId = page.instagram_business_account.id
              const igInfoResponse = await fetch(
                `https://graph.facebook.com/v18.0/${igId}?fields=id,username,name,profile_picture_url&access_token=${accessToken}`
              )
              const igInfo = await igInfoResponse.json()
              
              await storeSocialAccount(supabase, {
                organization_id: oauthState.organization_id,
                platform: 'instagram',
                account_id: igId,
                account_name: igInfo.name || igInfo.username,
                account_username: igInfo.username,
                account_avatar_url: igInfo.profile_picture_url,
                access_token: accessToken,
                scopes: ['instagram_basic', 'instagram_content_publish'],
              })
            }
          }
        }
        break

      case 'linkedin':
        const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID')
        const linkedinClientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')
        
        // Exchange code for access token
        const linkedinTokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: linkedinClientId!,
            client_secret: linkedinClientSecret!,
          }),
        })
        
        const linkedinTokenData = await linkedinTokenResponse.json()
        
        if (linkedinTokenData.error) {
          throw new Error(linkedinTokenData.error_description)
        }
        
        accessToken = linkedinTokenData.access_token
        refreshToken = linkedinTokenData.refresh_token
        if (linkedinTokenData.expires_in) {
          expiresAt = new Date(Date.now() + linkedinTokenData.expires_in * 1000)
        }

        // Get user profile
        const linkedinProfileResponse = await fetch(
          'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )
        const linkedinProfile = await linkedinProfileResponse.json()
        
        await storeSocialAccount(supabase, {
          organization_id: oauthState.organization_id,
          platform: 'linkedin',
          account_id: linkedinProfile.id,
          account_name: `${linkedinProfile.firstName.localized.en_US} ${linkedinProfile.lastName.localized.en_US}`,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          scopes: ['w_member_social', 'r_liteprofile'],
        })
        break

      default:
        throw new Error('Unsupported platform')
    }

    // Redirect to success page
    const successUrl = `${url.origin}/social-accounts?connected=${platform}`
    return new Response(null, {
      status: 302,
      headers: {
        'Location': successUrl,
      },
    })

  } catch (error) {
    console.error('OAuth callback error:', error)
    
    // Redirect to error page
    const errorUrl = `${url.origin}/social-accounts?error=${encodeURIComponent(error.message)}`
    return new Response(null, {
      status: 302,
      headers: {
        'Location': errorUrl,
      },
    })
  }
})

async function storeSocialAccount(supabase: any, accountData: any) {
  // Encrypt the access token
  const encryptedAccessToken = await encryptToken(accountData.access_token)
  const encryptedRefreshToken = accountData.refresh_token 
    ? await encryptToken(accountData.refresh_token) 
    : null

  const { error } = await supabase
    .from('social_accounts')
    .upsert({
      organization_id: accountData.organization_id,
      platform: accountData.platform,
      account_id: accountData.account_id,
      account_name: accountData.account_name,
      account_username: accountData.account_username,
      account_avatar_url: accountData.account_avatar_url,
      access_token_encrypted: encryptedAccessToken,
      refresh_token_encrypted: encryptedRefreshToken,
      token_expires_at: accountData.expires_at,
      scopes: accountData.scopes,
      is_active: true,
      last_refresh_at: new Date().toISOString(),
    }, {
      onConflict: 'organization_id,platform,account_id'
    })

  if (error) {
    throw new Error(`Failed to store account: ${error.message}`)
  }
}

async function encryptToken(token: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(Deno.env.get('ENCRYPTION_KEY') || 'default-key-32-chars-long-here'),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encodedToken = new TextEncoder().encode(token)
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedToken
  )
  
  // Combine iv and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedData), iv.length)
  
  // Return as base64
  return btoa(String.fromCharCode.apply(null, Array.from(combined)))
}