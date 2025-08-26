import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Star, 
  Copy,
  Edit,
  Trash2,
  Filter,
  Heart,
  MessageSquare,
  TrendingUp,
  Calendar,
  Zap
} from "lucide-react";

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");

  const mockTemplates = [
    {
      id: '1',
      title: 'Product Launch',
      category: 'announcements',
      content: '🚀 Excited to announce our latest product! Get ready for innovation that will change everything.',
      platforms: ['facebook', 'linkedin'],
      engagement: { likes: 245, shares: 34, comments: 18 },
      performance: 'high',
      usage: 12
    },
    {
      id: '2', 
      title: 'Weekly Tips',
      category: 'educational',
      content: '💡 Pro Tip Tuesday: Did you know that posting at optimal times can increase engagement by 50%?',
      platforms: ['instagram', 'twitter'],
      engagement: { likes: 156, shares: 28, comments: 12 },
      performance: 'medium',
      usage: 8
    },
    {
      id: '3',
      title: 'Behind the Scenes',
      category: 'company',
      content: '🎬 Take a peek behind the scenes at our amazing team working hard to bring you the best.',
      platforms: ['instagram', 'facebook'],
      engagement: { likes: 198, shares: 15, comments: 23 },
      performance: 'high',
      usage: 15
    }
  ];

  const performanceColors = {
    high: 'bg-success',
    medium: 'bg-warning', 
    low: 'bg-destructive'
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      facebook: '📘',
      instagram: '📷', 
      linkedin: '💼',
      twitter: '🐦'
    };
    return icons[platform as keyof typeof icons] || '📱';
  };

  return (
    <DashboardLayout 
      title="Templates"
      description="Pre-made content templates to speed up your posting"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button className="self-start w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="self-start sm:self-auto w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {mockTemplates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary" className="capitalize text-xs">
                      {template.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs text-white ${performanceColors[template.performance as keyof typeof performanceColors]}`}
                    >
                      {template.performance} performance
                    </Badge>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.content}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex space-x-3">
                    <span className="flex items-center text-muted-foreground">
                      <Heart className="h-3 w-3 mr-1" />
                      {template.engagement.likes}
                    </span>
                    <span className="flex items-center text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {template.engagement.comments}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    Used {template.usage}x
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    {template.platforms.map(platform => (
                      <span key={platform} className="text-xs">
                        {getPlatformIcon(platform)}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Use Template
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}