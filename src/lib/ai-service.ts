// AI Service using Google Gemini API
export interface AIGenerateRequest {
  prompt: string;
  platform?: "facebook" | "instagram" | "linkedin";
  tone?: "professional" | "casual" | "friendly" | "formal";
  length?: "short" | "medium" | "long";
  includeHashtags?: boolean;
  includeCallToAction?: boolean;
}

export interface AIGenerateResponse {
  content: string;
  hashtags?: string[];
  suggestedTime?: string;
  engagementTips?: string[];
}

export interface AIContentAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  engagementScore: number;
  readabilityScore: number;
  suggestions: string[];
  bestPostingTime?: string;
}

class AIService {
  private apiKey: string;
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async generateSocialMediaPost(
    request: AIGenerateRequest
  ): Promise<AIGenerateResponse> {
    const platform = request.platform || "general";
    const tone = request.tone || "professional";
    const length = request.length || "medium";

    const prompt = `
Generate a social media post for ${platform} with the following requirements:
- Topic: ${request.prompt}
- Tone: ${tone}
- Length: ${length}
- Include hashtags: ${request.includeHashtags ? "Yes" : "No"}
- Include call-to-action: ${request.includeCallToAction ? "Yes" : "No"}

Please provide the response in JSON format with the following structure:
{
  "content": "The main post content",
  "hashtags": ["hashtag1", "hashtag2"],
  "suggestedTime": "Best time to post",
  "engagementTips": ["tip1", "tip2"]
}
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error("Error generating content:", error);
      throw new Error("Failed to generate content");
    }
  }

  async analyzeContent(
    content: string,
    platform: string
  ): Promise<AIContentAnalysis> {
    const prompt = `
Analyze this social media content for ${platform}:
"${content}"

Provide analysis in JSON format:
{
  "sentiment": "positive/negative/neutral",
  "engagementScore": 0-100,
  "readabilityScore": 0-100,
  "suggestions": ["suggestion1", "suggestion2"],
  "bestPostingTime": "recommended time"
}
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error("Error analyzing content:", error);
      throw new Error("Failed to analyze content");
    }
  }

  async generateContentIdeas(
    topic: string,
    platform: string,
    count: number = 5
  ): Promise<string[]> {
    const prompt = `
Generate ${count} creative content ideas for ${platform} about "${topic}".
Provide only the ideas, one per line, without numbering.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return response
        .split("\n")
        .filter((idea: string) => idea.trim().length > 0);
    } catch (error) {
      console.error("Error generating ideas:", error);
      throw new Error("Failed to generate content ideas");
    }
  }

  async optimizeHashtags(content: string, platform: string): Promise<string[]> {
    const prompt = `
Suggest relevant hashtags for this ${platform} post:
"${content}"

Provide only the hashtags, separated by commas, without the # symbol.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return response
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
    } catch (error) {
      console.error("Error optimizing hashtags:", error);
      throw new Error("Failed to optimize hashtags");
    }
  }

  async generateCaptionForImage(
    imageDescription: string,
    platform: string
  ): Promise<string> {
    const prompt = `
Generate an engaging caption for a ${platform} post with this image: "${imageDescription}"
Make it engaging and platform-appropriate.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return response.trim();
    } catch (error) {
      console.error("Error generating caption:", error);
      throw new Error("Failed to generate caption");
    }
  }
}

export const aiService = new AIService();
