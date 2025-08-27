# AI Features Setup Guide

This application includes AI-powered features using Google's Gemini API for content generation and optimization.

## Setup Instructions

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Other Configuration
VITE_APP_NAME=Create Assist Lite
VITE_APP_VERSION=1.0.0
```

### 3. AI Features Available

#### Content Generation

- Generate social media posts based on topics
- Customize tone (professional, casual, friendly, formal)
- Control content length (short, medium, long)
- Include hashtags and call-to-action buttons

#### Content Analysis

- Analyze existing content for engagement potential
- Get sentiment analysis
- Receive readability scores
- Get optimization suggestions
- Best posting time recommendations

#### Content Ideas

- Generate creative content ideas for any topic
- Platform-specific suggestions
- Multiple ideas at once

#### Hashtag Optimization

- Get relevant hashtag suggestions
- Platform-optimized hashtags
- Trending hashtag recommendations

### 4. Usage

The AI Assistant is available on all dashboard pages:

- **Calendar**: Generate content for scheduled posts
- **Analytics**: Analyze performance and get content suggestions
- **Social Accounts**: Create content for connected platforms

### 5. API Limits

- Google Gemini API has rate limits
- Free tier includes 15 requests per minute
- Consider upgrading for production use

### 6. Privacy & Security

- API keys are stored in environment variables
- Content is sent to Google's servers for processing
- No content is stored permanently on Google's servers
- Review Google's privacy policy for more details

## Troubleshooting

### API Key Issues

- Ensure the API key is correctly set in `.env`
- Check that the key has proper permissions
- Verify the key is not expired

### Rate Limiting

- If you hit rate limits, wait before making new requests
- Consider implementing request caching
- Monitor API usage in Google AI Studio

### Content Generation Issues

- Ensure prompts are clear and specific
- Try different tones or lengths
- Check network connectivity

## Support

For issues with:

- **Google Gemini API**: Contact Google AI Studio support
- **Application Features**: Check the main README.md
- **Setup Issues**: Review this guide carefully
