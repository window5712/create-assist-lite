# Social Media Integration Setup Guide

This guide will help you set up real social media account connections for automated posting on Facebook, Instagram, and LinkedIn.

## 🚀 Features Added

### ✅ Real Account Connection

- **OAuth Flow**: Secure authentication with Facebook, Instagram, and LinkedIn
- **Account Selection**: Choose which pages/profiles to connect
- **Token Management**: Automatic token refresh and validation
- **Permission Management**: Clear display of required permissions

### ✅ Account Management

- **Connect/Disconnect**: Easy account management
- **Status Monitoring**: Real-time connection status
- **Error Handling**: Clear error messages and troubleshooting
- **Token Refresh**: Automatic token renewal

### ✅ Security Features

- **Secure Storage**: Encrypted token storage in database
- **Permission Scopes**: Minimal required permissions
- **User Authorization**: Organization-based access control

## 📋 Prerequisites

### 1. Social Media Developer Accounts

#### Facebook/Instagram

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Get App ID and App Secret

#### LinkedIn

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Configure OAuth 2.0 settings
4. Get Client ID and Client Secret

### 2. Environment Variables

Add these to your `.env` file:

```env
# Facebook/Instagram OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173
```

## 🔧 Setup Instructions

### Step 1: Configure Facebook App

1. **App Settings**

   ```
   App Domains: localhost
   Privacy Policy URL: https://yourdomain.com/privacy
   Terms of Service URL: https://yourdomain.com/terms
   ```

2. **Facebook Login Settings**

   ```
   Valid OAuth Redirect URIs:
   - https://your-supabase-project.supabase.co/functions/v1/oauth-callback
   - http://localhost:5173/dashboard/social-accounts
   ```

3. **Required Permissions**
   - `pages_manage_posts` - Post to Facebook Pages
   - `pages_read_engagement` - Read page insights
   - `pages_show_list` - List user's pages
   - `instagram_basic` - Access Instagram basic data
   - `instagram_content_publish` - Post to Instagram

### Step 2: Configure LinkedIn App

1. **OAuth 2.0 Settings**

   ```
   Redirect URLs:
   - https://your-supabase-project.supabase.co/functions/v1/oauth-callback
   - http://localhost:5173/dashboard/social-accounts
   ```

2. **Required Permissions**
   - `w_member_social` - Post to LinkedIn
   - `r_liteprofile` - Read basic profile
   - `w_organization_social` - Post to company pages

### Step 3: Deploy Supabase Functions

```bash
# Deploy all edge functions
supabase functions deploy get-accounts
supabase functions deploy connect-account
supabase functions deploy oauth-callback
supabase functions deploy disconnect-account
supabase functions deploy refresh-account
```

### Step 4: Update Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Update social_accounts table to support OAuth
ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS platform_account_id TEXT,
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_username TEXT,
ADD COLUMN IF NOT EXISTS account_avatar_url TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform_org
ON social_accounts(platform, organization_id);

CREATE INDEX IF NOT EXISTS idx_social_accounts_platform_account
ON social_accounts(platform, platform_account_id);
```

## 🎯 How to Use

### 1. Connect Accounts

1. Go to **Dashboard → Social Accounts**
2. Click **Connect** on any platform
3. Select the accounts you want to connect
4. Authorize the required permissions
5. You'll be redirected back with connected accounts

### 2. Manage Accounts

- **View Status**: See connection status and last sync time
- **Refresh**: Manually refresh account tokens
- **Disconnect**: Remove account access
- **Error Handling**: View and resolve connection errors

### 3. Automated Posting

Once connected, your accounts will be available in:

- **Composer**: Select connected accounts for posting
- **Calendar**: Schedule posts to connected accounts
- **Analytics**: Track performance across platforms

## 🔒 Security Considerations

### Token Storage

- Access tokens are stored encrypted in the database
- Refresh tokens are used for automatic renewal
- Tokens are automatically cleaned up when disconnected

### Permission Scopes

- Only minimal required permissions are requested
- Users can see exactly what permissions are granted
- Easy to revoke access at any time

### User Authorization

- Only organization members can connect accounts
- Account access is scoped to the organization
- Audit trail for all connection activities

## 🐛 Troubleshooting

### Common Issues

#### 1. "App not configured for OAuth"

- Ensure your Facebook/LinkedIn app is properly configured
- Check that redirect URIs match exactly
- Verify app is in development mode (for testing)

#### 2. "Invalid redirect URI"

- Update your app's OAuth settings with correct redirect URLs
- Ensure HTTPS for production URLs
- Check for trailing slashes

#### 3. "Permission denied"

- User may have denied required permissions
- Check if account has admin access to pages
- Verify business account status for Instagram

#### 4. "Token expired"

- Tokens are automatically refreshed
- Manual refresh available in account settings
- Re-authenticate if refresh fails

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG_SOCIAL_AUTH=true
```

## 📱 Platform-Specific Notes

### Facebook

- Supports both personal profiles and business pages
- Long-lived access tokens (60 days)
- Automatic token refresh available

### Instagram

- Requires Instagram Business accounts
- Connected through Facebook app
- Supports stories and feed posts

### LinkedIn

- Supports personal profiles and company pages
- 60-day access tokens
- Refresh tokens for automatic renewal

## 🚀 Production Deployment

### 1. Update Environment Variables

```env
FRONTEND_URL=https://yourdomain.com
SUPABASE_URL=https://your-project.supabase.co
```

### 2. Configure Production Apps

- Move apps from development to live mode
- Update privacy policy and terms URLs
- Configure production redirect URIs

### 3. Security Review

- Enable RLS policies on social_accounts table
- Configure proper CORS settings
- Set up monitoring and alerting

## 📊 Monitoring

### Key Metrics to Track

- Connection success/failure rates
- Token refresh success rates
- Posting success rates by platform
- User engagement with connected accounts

### Error Monitoring

- OAuth callback failures
- Token refresh errors
- API rate limit hits
- Permission changes

## 🔄 Updates and Maintenance

### Regular Tasks

- Monitor token expiration dates
- Review and update permission scopes
- Check for API changes from platforms
- Update error handling as needed

### Platform Updates

- Facebook API version updates
- LinkedIn API changes
- Instagram feature additions
- Security policy updates

---

## 🎉 Success!

Once configured, users can:

1. **Connect real social media accounts** with secure OAuth
2. **Manage multiple accounts** per platform
3. **Schedule automated posts** to connected accounts
4. **Track performance** across all platforms
5. **Maintain secure access** with automatic token refresh

The integration provides a complete social media management solution with enterprise-grade security and user experience.
