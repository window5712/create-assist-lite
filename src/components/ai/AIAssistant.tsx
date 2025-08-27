import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Wand2,
  Lightbulb,
  Hash,
  Image,
  TrendingUp,
  Clock,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import {
  aiService,
  AIGenerateRequest,
  AIContentAnalysis,
} from "@/lib/ai-service";

interface AIAssistantProps {
  onContentGenerated?: (content: string, hashtags?: string[]) => void;
  platform?: "facebook" | "instagram" | "linkedin";
}

export function AIAssistant({
  onContentGenerated,
  platform,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [contentIdeas, setContentIdeas] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AIContentAnalysis | null>(null);
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  // Form states
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<AIGenerateRequest["tone"]>("professional");
  const [length, setLength] = useState<AIGenerateRequest["length"]>("medium");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [contentToAnalyze, setContentToAnalyze] = useState("");
  const [topicForIdeas, setTopicForIdeas] = useState("");

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or prompt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const request: AIGenerateRequest = {
        prompt: prompt.trim(),
        platform,
        tone,
        length,
        includeHashtags,
        includeCallToAction: includeCTA,
      };

      const response = await aiService.generateSocialMediaPost(request);
      setGeneratedContent(response.content);
      setHashtags(response.hashtags || []);

      toast({
        title: "Content Generated",
        description: "AI has created your social media post!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeContent = async () => {
    if (!contentToAnalyze.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.analyzeContent(
        contentToAnalyze,
        platform || "general"
      );
      setAnalysis(result);

      toast({
        title: "Analysis Complete",
        description: "Content has been analyzed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateIdeas = async () => {
    if (!topicForIdeas.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for content ideas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const ideas = await aiService.generateContentIdeas(
        topicForIdeas,
        platform || "general",
        5
      );
      setContentIdeas(ideas);

      toast({
        title: "Ideas Generated",
        description: "AI has created content ideas for you!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const useGeneratedContent = () => {
    if (onContentGenerated) {
      onContentGenerated(generatedContent, hashtags);
      setIsOpen(false);
      toast({
        title: "Content Applied",
        description: "Generated content has been applied to your post",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Content Assistant
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Ideas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Topic or Prompt</label>
                <Textarea
                  placeholder="Describe what you want to post about..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <Select
                    value={tone}
                    onValueChange={(value: any) => setTone(value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Length</label>
                  <Select
                    value={length}
                    onValueChange={(value: any) => setLength(value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                  />
                  <span className="text-sm">Include hashtags</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeCTA}
                    onChange={(e) => setIncludeCTA(e.target.checked)}
                  />
                  <span className="text-sm">Include call-to-action</span>
                </label>
              </div>

              <Button
                onClick={generateContent}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Generate Content
                  </div>
                )}
              </Button>
            </div>

            {generatedContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated Content
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedContent)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {onContentGenerated && (
                        <Button size="sm" onClick={useGeneratedContent}>
                          Use Content
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{generatedContent}</p>
                  </div>

                  {hashtags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Suggested Hashtags:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {hashtags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analyze" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Content to Analyze</label>
              <Textarea
                placeholder="Paste your content here for analysis..."
                value={contentToAnalyze}
                onChange={(e) => setContentToAnalyze(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

            <Button
              onClick={analyzeContent}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analyze Content
                </div>
              )}
            </Button>

            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Content Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Sentiment</p>
                      <Badge
                        variant={
                          analysis.sentiment === "positive"
                            ? "default"
                            : analysis.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {analysis.sentiment}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Best Posting Time</p>
                      <p className="text-sm text-muted-foreground">
                        {analysis.bestPostingTime}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Engagement Score</p>
                    <Progress
                      value={analysis.engagementScore}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {analysis.engagementScore}/100
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      Readability Score
                    </p>
                    <Progress
                      value={analysis.readabilityScore}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {analysis.readabilityScore}/100
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Suggestions</p>
                    <ul className="space-y-1">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ideas" className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Topic for Content Ideas
              </label>
              <Input
                placeholder="Enter a topic to generate content ideas..."
                value={topicForIdeas}
                onChange={(e) => setTopicForIdeas(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={generateIdeas}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating Ideas...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Generate Ideas
                </div>
              )}
            </Button>

            {contentIdeas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Content Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentIdeas.map((idea, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="text-sm">{idea}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            setPrompt(idea);
                            setActiveTab("generate");
                          }}
                        >
                          Use This Idea
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
