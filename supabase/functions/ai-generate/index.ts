import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      prompt, 
      topic, 
      tone = 'professional',
      platforms = ['facebook', 'instagram', 'linkedin'],
      language = 'en',
      includeHashtags = true,
      includeCTA = true,
      templateId
    } = await req.json();

    // Get user's organization and AI settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, organizations(ai_settings)')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiSettings = profile.organizations?.ai_settings || {
      model: 'llama3.1:8b',
      creativity: 0.7,
      brand_voice: 'professional'
    };

    // Prepare system prompt based on requirements
    const systemPrompt = `You are an expert social media content creator. Generate ${language === 'ur' ? 'Urdu' : 'English'} posts that are:
- Brand-safe and professional
- Optimized for ${platforms.join(', ')} platforms
- Written in a ${tone} tone with ${aiSettings.brand_voice} brand voice
- Engaging and conversion-focused
- Culturally appropriate and respectful

Topic: ${topic}
Tone: ${tone}
Language: ${language === 'ur' ? 'Urdu' : 'English'}
Platforms: ${platforms.join(', ')}

Generate variations optimized for each platform with appropriate character limits:
- Facebook: 500 characters optimal
- Instagram: 150 characters + hashtags
- LinkedIn: 1300 characters professional tone

${includeHashtags ? 'Include relevant hashtags for each platform.' : ''}
${includeCTA ? 'Include compelling call-to-action.' : ''}

Return a JSON object with platform-specific variants.`;

    // Call Ollama API (assuming it's running locally or accessible)
    const ollamaEndpoint = Deno.env.get('OLLAMA_ENDPOINT') || 'http://localhost:11434';
    
    const ollamaResponse = await fetch(`${ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiSettings.model,
        prompt: `${systemPrompt}\n\nUser Request: ${prompt}`,
        stream: false,
        options: {
          temperature: aiSettings.creativity,
          top_p: 0.9,
          top_k: 40
        }
      }),
    });

    if (!ollamaResponse.ok) {
      console.error('Ollama API error:', await ollamaResponse.text());
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ollamaData = await ollamaResponse.json();
    let generatedText = ollamaData.response;

    // Try to parse as JSON, fallback to simple text processing
    let platformVariants;
    try {
      platformVariants = JSON.parse(generatedText);
    } catch {
      // Fallback: create platform variants from the generated text
      const baseContent = generatedText.trim();
      platformVariants = {
        facebook: {
          content: baseContent.substring(0, 500),
          hashtags: includeHashtags ? extractHashtags(baseContent) : [],
          cta: includeCTA ? extractCTA(baseContent) : ''
        },
        instagram: {
          content: baseContent.substring(0, 150),
          hashtags: includeHashtags ? extractHashtags(baseContent, 15) : [],
          cta: includeCTA ? extractCTA(baseContent) : ''
        },
        linkedin: {
          content: baseContent.substring(0, 1300),
          hashtags: includeHashtags ? extractHashtags(baseContent, 5) : [],
          cta: includeCTA ? extractCTA(baseContent) : ''
        }
      };
    }

    // Update template usage if templateId provided
    if (templateId) {
      await supabase
        .from('templates')
        .update({ usage_count: supabase.sql`usage_count + 1` })
        .eq('id', templateId);
    }

    // Log the generation for analytics
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        resource_type: 'ai_generation',
        action: 'generate_content',
        new_values: {
          prompt,
          topic,
          tone,
          platforms,
          language,
          template_id: templateId
        }
      });

    return new Response(JSON.stringify({
      success: true,
      variants: platformVariants,
      metadata: {
        topic,
        tone,
        language,
        platforms,
        model: aiSettings.model,
        template_id: templateId
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-generate function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractHashtags(text: string, maxCount: number = 10): string[] {
  const hashtagRegex = /#[\w\u0600-\u06FF]+/g;
  const matches = text.match(hashtagRegex) || [];
  return matches.slice(0, maxCount);
}

function extractCTA(text: string): string {
  const ctaPatterns = [
    /(?:call to action|cta):\s*(.+?)(?:\n|$)/i,
    /(visit|click|learn|shop|download|sign up).{0,50}(?:\n|$)/i,
    /(now|today|here).{0,30}$/i
  ];
  
  for (const pattern of ctaPatterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0];
  }
  
  return '';
}