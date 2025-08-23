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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting post scheduling job...')

    // Get pending jobs that are due to be published
    const now = new Date().toISOString()
    const { data: pendingJobs, error: jobsError } = await supabase
      .from('job_queue')
      .select(`
        *,
        post:posts(*),
        social_account:social_accounts(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(10) // Process 10 jobs at a time

    if (jobsError) {
      throw new Error(`Failed to fetch pending jobs: ${jobsError.message}`)
    }

    console.log(`Found ${pendingJobs?.length || 0} pending jobs to process`)

    const results = []

    for (const job of pendingJobs || []) {
      try {
        // Mark job as processing
        await supabase
          .from('job_queue')
          .update({ 
            status: 'processing',
            last_attempt_at: new Date().toISOString(),
            attempts: job.attempts + 1
          })
          .eq('id', job.id)

        console.log(`Processing job ${job.id} for platform ${job.platform}`)

        // Decrypt access token
        const accessToken = await decryptToken(job.social_account.access_token_encrypted)
        
        // Get platform-specific content
        const content = getPlatformContent(job.post, job.platform)
        
        let publishResult

        switch (job.platform) {
          case 'facebook':
            publishResult = await publishToFacebook(accessToken, job.social_account.account_id, content)
            break
          
          case 'instagram':
            publishResult = await publishToInstagram(accessToken, job.social_account.account_id, content)
            break
          
          case 'linkedin':
            publishResult = await publishToLinkedIn(accessToken, job.social_account.account_id, content)
            break
          
          default:
            throw new Error(`Unsupported platform: ${job.platform}`)
        }

        // Mark job as completed
        await supabase
          .from('job_queue')
          .update({
            status: 'completed',
            platform_post_id: publishResult.postId,
            platform_response: publishResult.response,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id)

        // Update post status
        await supabase
          .from('posts')
          .update({
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', job.post_id)

        results.push({ jobId: job.id, status: 'success', postId: publishResult.postId })
        console.log(`Successfully published job ${job.id} to ${job.platform}`)

      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error)
        
        // Determine if we should retry or mark as failed
        const shouldRetry = job.attempts < job.max_attempts
        const newStatus = shouldRetry ? 'pending' : 'failed'
        
        await supabase
          .from('job_queue')
          .update({
            status: newStatus,
            last_error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id)

        // If max attempts reached, mark post as failed
        if (!shouldRetry) {
          await supabase
            .from('posts')
            .update({ status: 'failed' })
            .eq('id', job.post_id)
        }

        results.push({ 
          jobId: job.id, 
          status: 'error', 
          error: error.message,
          willRetry: shouldRetry
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: results.length,
        results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Schedule posts error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function getPlatformContent(post: any, platform: string) {
  // Use platform-specific content if available, otherwise use default content
  const platformVariants = post.platform_variants || {}
  
  return {
    content: platformVariants[platform]?.content || post.content,
    media_urls: platformVariants[platform]?.media_urls || post.media_urls || [],
    hashtags: platformVariants[platform]?.hashtags || post.hashtags || [],
    call_to_action: platformVariants[platform]?.call_to_action || post.call_to_action
  }
}

async function publishToFacebook(accessToken: string, pageId: string, content: any): Promise<any> {
  const postData: any = {
    message: content.content,
    access_token: accessToken
  }

  // Add media if provided
  if (content.media_urls && content.media_urls.length > 0) {
    if (content.media_urls.length === 1) {
      // Single image/video
      const mediaUrl = content.media_urls[0]
      if (mediaUrl.includes('.mp4') || mediaUrl.includes('video')) {
        postData.source = mediaUrl
        // Use video endpoint
        const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        })
        return await handleFacebookResponse(response)
      } else {
        postData.url = mediaUrl
      }
    } else {
      // Multiple images - create album
      postData.attached_media = content.media_urls.map((url: string, index: number) => ({
        media_fbid: `photo_${index}`, // This would need to be uploaded first
        url
      }))
    }
  }

  const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  })

  return await handleFacebookResponse(response)
}

async function publishToInstagram(accessToken: string, igAccountId: string, content: any): Promise<any> {
  // Instagram publishing is a two-step process: create media, then publish

  let mediaId: string

  if (content.media_urls && content.media_urls.length > 0) {
    const mediaUrl = content.media_urls[0]
    
    // Step 1: Create media container
    const createMediaResponse = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: mediaUrl,
        caption: content.content,
        access_token: accessToken
      })
    })

    const mediaData = await createMediaResponse.json()
    if (mediaData.error) {
      throw new Error(`Instagram media creation failed: ${mediaData.error.message}`)
    }
    
    mediaId = mediaData.id
  } else {
    throw new Error('Instagram posts require at least one image')
  }

  // Step 2: Publish the media
  const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: mediaId,
      access_token: accessToken
    })
  })

  const publishData = await publishResponse.json()
  if (publishData.error) {
    throw new Error(`Instagram publish failed: ${publishData.error.message}`)
  }

  return {
    postId: publishData.id,
    response: publishData
  }
}

async function publishToLinkedIn(accessToken: string, personUrn: string, content: any): Promise<any> {
  const postData = {
    author: `urn:li:person:${personUrn}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content.content
        },
        shareMediaCategory: content.media_urls && content.media_urls.length > 0 ? 'IMAGE' : 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  }

  // Add media if provided
  if (content.media_urls && content.media_urls.length > 0) {
    postData.specificContent['com.linkedin.ugc.ShareContent'].media = content.media_urls.map((url: string) => ({
      status: 'READY',
      description: {
        text: 'Image'
      },
      media: url,
      title: {
        text: 'Image'
      }
    }))
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify(postData)
  })

  const responseData = await response.json()
  
  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${responseData.message || 'Unknown error'}`)
  }

  return {
    postId: responseData.id,
    response: responseData
  }
}

async function handleFacebookResponse(response: Response): Promise<any> {
  const data = await response.json()
  
  if (data.error) {
    throw new Error(`Facebook API error: ${data.error.message}`)
  }

  return {
    postId: data.id,
    response: data
  }
}

async function decryptToken(encryptedToken: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(Deno.env.get('ENCRYPTION_KEY') || 'default-key-32-chars-long-here'),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )
  
  // Decode base64
  const combined = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0))
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12)
  const encryptedData = combined.slice(12)
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  )
  
  return new TextDecoder().decode(decryptedData)
}