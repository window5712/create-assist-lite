import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  Send,
  Save,
  Wand2,
  X,
  Hash,
  MessageSquare,
  Camera,
  Sparkles,
  FileText,
  Languages,
  Target,
  ArrowLeft
} from 'lucide-react';

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Link } from "react-router-dom"

interface Template {
  id: string;
  name: string;
  content: string;
  template_type: string;
  platforms: string[];
  language: string;
}

export default function Composer() {
  const { user, organization } = useAuth();
  const { toast } = useToast();

  // Initialize postData with default values
  const [postData, setPostData] = useState({
    content: '',
    topic: '',
    tone: 'professional',
    hashtags: '',
    callToAction: '',
    selectedPlatforms: ['facebook'],
    scheduledDate: '',
    scheduledTime: '',
    language: 'en',
    aiGenerated: false,
    templateId: null as string | null
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (user && organization) {
      fetchTemplates();
    }
  }, [user, organization]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Data definitions
  const tones = [
    'professional', 'casual', 'friendly', 'authoritative', 
    'inspirational', 'humorous', 'educational', 'promotional'
  ];

  const platforms = [
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', limit: 2000 },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', limit: 2200 },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', limit: 3000 },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-400', limit: 280 },
  ];

  // Helper functions
  const togglePlatform = (platformId: string) => {
    setPostData(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(p => p !== platformId)
        : [...prev.selectedPlatforms, platformId]
    }));
  };

  const updateField = (field: string, value: string) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  // Action handlers
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for AI generation",
        variant: "destructive"
      });
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt: aiPrompt,
          topic: postData.topic,
          tone: postData.tone,
          platforms: postData.selectedPlatforms,
          language: postData.language,
          includeHashtags: true,
          includeCTA: true,
          templateId: postData.templateId
        }
      });

      if (error) throw error;

      if (data?.success && data.variants) {
        // Use the first platform's variant as the main content
        const mainPlatform = postData.selectedPlatforms[0] || 'facebook';
        const variant = data.variants[mainPlatform];
        
        if (variant) {
          updateField('content', variant.content);
          if (variant.hashtags?.length) {
            updateField('hashtags', variant.hashtags.join(' '));
          }
          if (variant.cta) {
            updateField('callToAction', variant.cta);
          }
          
          setPostData(prev => ({ ...prev, aiGenerated: true }));
          toast({
            title: "Success",
            description: "AI content generated successfully!"
          });
        }
      }

      setShowAiDialog(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const generateContent = () => {
    // Legacy method for backwards compatibility
    const generatedContent = `🚀 Exciting news! We're thrilled to share our latest ${postData.topic || 'innovation'} with you. This represents months of hard work and dedication from our amazing team.

Key highlights:
✅ Enhanced user experience
✅ Improved performance
✅ New features you'll love

${postData.callToAction || 'Learn more about how this can benefit you!'} 

#Innovation #Technology #${postData.topic?.replace(/\s+/g, '') || 'Update'}`;
    
    updateField('content', generatedContent);
  };

  const useTemplate = (template: Template) => {
    updateField('content', template.content);
    setPostData(prev => ({ 
      ...prev, 
      templateId: template.id,
      language: template.language
    }));
    
    toast({
      title: "Template Applied",
      description: `Template "${template.name}" has been applied`
    });
    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!postData.content.trim()) {
      toast({
        title: "Error",
        description: "Content is required to save as draft",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: postData.content,
          title: postData.topic,
          tone: postData.tone,
          hashtags: postData.hashtags.split(' ').filter(tag => tag.trim()),
          call_to_action: postData.callToAction,
          target_platforms: postData.selectedPlatforms,
          ai_generated: postData.aiGenerated,
          template_id: postData.templateId,
          organization_id: organization.id,
          created_by: user.id,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post saved as draft"
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    }
  };

  const handleSchedule = async () => {
    if (!postData.scheduledDate || !postData.scheduledTime) {
      toast({
        title: "Error",
        description: "Please select both date and time for scheduling",
        variant: "destructive"
      });
      return;
    }

    if (!postData.content.trim()) {
      toast({
        title: "Error",
        description: "Content is required to schedule post",
        variant: "destructive"
      });
      return;
    }

    try {
      const scheduledFor = new Date(`${postData.scheduledDate}T${postData.scheduledTime}`);
      
      const { error } = await supabase
        .from('posts')
        .insert({
          content: postData.content,
          title: postData.topic,
          tone: postData.tone,
          hashtags: postData.hashtags.split(' ').filter(tag => tag.trim()),
          call_to_action: postData.callToAction,
          target_platforms: postData.selectedPlatforms,
          ai_generated: postData.aiGenerated,
          template_id: postData.templateId,
          organization_id: organization.id,
          created_by: user.id,
          status: 'scheduled',
          scheduled_for: scheduledFor.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Post scheduled for ${postData.scheduledDate} at ${postData.scheduledTime}`
      });
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async () => {
    if (!postData.content.trim()) {
      toast({
        title: "Error",
        description: "Content is required to publish",
        variant: "destructive"
    });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: postData.content,
          title: postData.topic,
          tone: postData.tone,
          hashtags: postData.hashtags.split(' ').filter(tag => tag.trim()),
          call_to_action: postData.callToAction,
          target_platforms: postData.selectedPlatforms,
          ai_generated: postData.aiGenerated,
          template_id: postData.templateId,
          organization_id: organization.id,
          created_by: user.id,
          status: 'published',
          published_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post published successfully!"
      });
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive"
      });
    }
  };

  // Rendering logic
  const getCharacterCount = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.limit : 280;
  };

  const renderPlatformPreview = (platform: any) => {
    const characterLimit = getCharacterCount(platform.id);
    const remainingChars = characterLimit - postData.content.length;
    
    return (
      <Card key={platform.id} className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 ${platform.color} rounded flex items-center justify-center`}>
              <span className="text-xs text-white font-bold">{platform.name.charAt(0)}</span>
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
    <DashboardLayout 
      title="Composer"
      description="Create and schedule your social media posts"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={handleSave} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={handleSchedule} className="w-full sm:w-auto">
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button onClick={handlePublish} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Send className="h-4 w-4 mr-2" />
              Publish Now
            </Button>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Composer Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <span>Content Details</span>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <FileText className="h-4 w-4 mr-2" />
                          Templates
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Choose a Template</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                          {templates.map((template) => (
                            <Card key={template.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => useTemplate(template)}>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium">{template.name}</h3>
                                <div className="flex gap-1">
                                  <Badge variant="secondary" className="text-xs">{template.template_type}</Badge>
                                  <Badge variant="outline" className="text-xs uppercase">{template.language}</Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                              {template.platforms.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {template.platforms.map(platform => (
                                    <Badge key={platform} variant="secondary" className="text-xs capitalize">{platform}</Badge>
                                  ))}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-primary border-primary/30 w-full sm:w-auto">
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Generate
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Generate Content with AI</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="ai-prompt">What would you like to create?</Label>
                            <Textarea 
                              id="ai-prompt"
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                              placeholder="e.g., Create a post about our new product launch..."
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              onClick={generateWithAI} 
                              disabled={aiLoading}
                              className="flex-1"
                            >
                              {aiLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Generate
                                </>
                              )}
                            </Button>
                            <Button variant="outline" onClick={() => setShowAiDialog(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={postData.topic}
                      onChange={(e) => updateField('topic', e.target.value)}
                      placeholder="What's this post about?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={postData.tone} onValueChange={(value) => updateField('tone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map(tone => (
                          <SelectItem key={tone} value={tone} className="capitalize">
                            {tone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={postData.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    placeholder="Write your post content here..."
                    rows={8}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{postData.content.length} characters</span>
                    <Button variant="ghost" size="sm" onClick={generateContent}>
                      <Wand2 className="h-4 w-4 mr-1" />
                      Quick Generate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hashtags">Hashtags</Label>
                    <Input
                      id="hashtags"
                      value={postData.hashtags}
                      onChange={(e) => updateField('hashtags', e.target.value)}
                      placeholder="#socialmedia #marketing"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cta">Call to Action</Label>
                    <Input
                      id="cta"
                      value={postData.callToAction}
                      onChange={(e) => updateField('callToAction', e.target.value)}
                      placeholder="Learn more at..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Target Platforms</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {platforms.map(platform => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={postData.selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <Label htmlFor={platform.id} className="text-sm">
                          {platform.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule-date">Schedule Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={postData.scheduledDate}
                      onChange={(e) => updateField('scheduledDate', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="schedule-time">Schedule Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={postData.scheduledTime}
                      onChange={(e) => updateField('scheduledTime', e.target.value)}
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
                <CardTitle>Platform Previews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postData.selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? renderPlatformPreview(platform) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}