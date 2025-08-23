import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  Image, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  Hash,
  AtSign,
  MessageSquare,
  Send,
  Save,
  Eye,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Composer = () => {
  const [postData, setPostData] = useState({
    content: "",
    topic: "",
    tone: "professional",
    hashtags: "",
    cta: "",
    platforms: ["twitter"] as string[],
    scheduleDate: "",
    scheduleTime: "",
  });

  const { toast } = useToast();

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual & Friendly" },
    { value: "humorous", label: "Humorous" },
    { value: "inspirational", label: "Inspirational" },
    { value: "educational", label: "Educational" },
  ];

  const platforms = [
    { id: "twitter", name: "Twitter", icon: Twitter, color: "bg-blue-500", limit: 280 },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600", limit: 2000 },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-500", limit: 2200 },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-700", limit: 3000 },
  ];

  const togglePlatform = (platformId: string) => {
    setPostData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const updateField = (field: string, value: string) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const generateContent = () => {
    // Simulate AI content generation
    const sampleContent = `🚀 Exciting news! We're revolutionizing the way you manage your social media presence. 

Our new AI-powered features help you:
✨ Create engaging content faster
📊 Analyze performance in real-time
🎯 Reach your target audience effectively

Ready to transform your social strategy? 

#SocialMedia #AI #Marketing #Innovation`;

    setPostData(prev => ({ ...prev, content: sampleContent }));
    toast({
      title: "Content generated!",
      description: "AI has created engaging content based on your topic and tone.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Draft saved",
      description: "Your post has been saved to drafts.",
    });
  };

  const handleSchedule = () => {
    if (!postData.scheduleDate || !postData.scheduleTime) {
      toast({
        title: "Schedule time required",
        description: "Please select both date and time for scheduling.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Post scheduled!",
      description: `Your post will be published on ${postData.scheduleDate} at ${postData.scheduleTime}`,
    });
  };

  const handlePublish = () => {
    toast({
      title: "Post published!",
      description: "Your content is now live across selected platforms.",
    });
  };

  const getCharacterCount = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.limit : 280;
  };

  const renderPlatformPreview = (platform: any) => {
    const Icon = platform.icon;
    const characterLimit = getCharacterCount(platform.id);
    const remainingChars = characterLimit - postData.content.length;
    
    return (
      <Card key={platform.id} className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 ${platform.color} rounded flex items-center justify-center`}>
              <Icon className="w-3 h-3 text-white" />
            </div>
            <CardTitle className="text-sm">{platform.name}</CardTitle>
            <Badge variant={remainingChars < 0 ? "destructive" : "secondary"} className="text-xs ml-auto">
              {remainingChars} chars
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg min-h-[120px]">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-primary-foreground font-medium">YU</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Your Account</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {postData.content || "Your post content will appear here..."}
                  </p>
                  {postData.hashtags && (
                    <p className="text-sm text-primary mt-2">
                      {postData.hashtags.split(' ').map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>Reply</span>
                </span>
                <span>Share</span>
                <span>Like</span>
              </div>
              <span>Preview</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold">Content Composer</h1>
                <p className="text-sm text-muted-foreground">Create and schedule your social media posts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" onClick={handleSchedule}>
                <Clock className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button onClick={handlePublish}>
                <Send className="w-4 h-4 mr-2" />
                Publish Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Composer Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Compose Your Post</span>
                </CardTitle>
                <CardDescription>
                  Use AI-powered suggestions to create engaging content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Topic and Tone */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="What's your post about?"
                      value={postData.topic}
                      onChange={(e) => updateField("topic", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={postData.tone} onValueChange={(value) => updateField("tone", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Generation */}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={generateContent} className="flex-1">
                    <Zap className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                  <Button variant="outline" size="icon">
                    <Image className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your post content here..."
                    value={postData.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                {/* Hashtags and CTA */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hashtags" className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span>Hashtags</span>
                    </Label>
                    <Input
                      id="hashtags"
                      placeholder="#socialmedia #marketing"
                      value={postData.hashtags}
                      onChange={(e) => updateField("hashtags", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta" className="flex items-center space-x-1">
                      <AtSign className="w-4 h-4" />
                      <span>Call to Action</span>
                    </Label>
                    <Input
                      id="cta"
                      placeholder="Learn more at..."
                      value={postData.cta}
                      onChange={(e) => updateField("cta", e.target.value)}
                    />
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="space-y-3">
                  <Label>Select Platforms</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = postData.platforms.includes(platform.id);
                      
                      return (
                        <div
                          key={platform.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                            isSelected ? "border-primary bg-primary-light" : "border-border"
                          }`}
                          onClick={() => togglePlatform(platform.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 ${platform.color} rounded flex items-center justify-center`}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium">{platform.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="space-y-3">
                  <Label className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule (Optional)</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={postData.scheduleDate}
                      onChange={(e) => updateField("scheduleDate", e.target.value)}
                    />
                    <Input
                      type="time"
                      value={postData.scheduleTime}
                      onChange={(e) => updateField("scheduleTime", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Platform Previews</span>
                </CardTitle>
                <CardDescription>
                  See how your post will look on each platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="twitter">Twitter</TabsTrigger>
                    <TabsTrigger value="facebook">Facebook</TabsTrigger>
                    <TabsTrigger value="instagram">Instagram</TabsTrigger>
                    <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {platforms
                        .filter(platform => postData.platforms.includes(platform.id))
                        .map(platform => renderPlatformPreview(platform))}
                    </div>
                  </TabsContent>
                  
                  {platforms.map(platform => (
                    <TabsContent key={platform.id} value={platform.id} className="mt-4">
                      {postData.platforms.includes(platform.id) ? (
                        renderPlatformPreview(platform)
                      ) : (
                        <Card>
                          <CardContent className="flex items-center justify-center h-40">
                            <p className="text-muted-foreground">
                              Platform not selected for posting
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Composer;