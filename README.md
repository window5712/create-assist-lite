# Create Assist Lite - Social Media Management Platform

A comprehensive social media management platform with AI-powered content generation and scheduling capabilities.

## Features

### 🎯 Core Features

- **Content Calendar**: Visual calendar for scheduling posts across multiple platforms
- **Analytics Dashboard**: Track performance and engagement metrics
- **Social Accounts Management**: Connect and manage Facebook, Instagram, and LinkedIn accounts
- **AI-Powered Content Generation**: Create engaging posts with Google's Gemini AI
- **Multi-Platform Publishing**: Schedule posts to Facebook, Instagram, and LinkedIn

### 🤖 AI Features

- **Content Generation**: Generate posts based on topics, tone, and length preferences
- **Content Analysis**: Analyze existing content for engagement potential and optimization
- **Content Ideas**: Get creative content suggestions for any topic
- **Hashtag Optimization**: Receive relevant hashtag recommendations
- **Sentiment Analysis**: Understand the tone and impact of your content

### 📊 Dashboard Pages

- **Calendar**: Visual content calendar with AI-powered post generation
- **Analytics**: Performance tracking with AI content suggestions
- **Social Accounts**: Account management with AI content creation
- **Settings**: Platform configuration and preferences

## Project info

**URL**: https://lovable.dev/projects/a7f1ed72-c5a2-46d0-9a03-89bd037c82a6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a7f1ed72-c5a2-46d0-9a03-89bd037c82a6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React
- **UI Components**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Edge Functions)
- **AI Integration**: Google Gemini API
- **Social Media APIs**: Facebook, Instagram, LinkedIn
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Date Handling**: date-fns
- **Charts**: Recharts

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key (for AI features)
- Supabase account (for backend services)

### Installation

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd create-assist-lite
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### AI Features Setup

For AI-powered content generation, you'll need to set up Google's Gemini API:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

See [AI_SETUP.md](./AI_SETUP.md) for detailed AI setup instructions.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a7f1ed72-c5a2-46d0-9a03-89bd037c82a6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
