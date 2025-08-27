import {
  Users,
  MessageSquare,
  TrendingUp,
  Globe,
  Plus,
  Filter,
  Sparkles,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIAssistantSimple } from "@/components/ai/AIAssistantSimple";
import { useNavigate } from "react-router-dom";

const kpiCards = [
  {
    title: "Total Followers",
    value: "12,459",
    change: "+2.5%",
    trend: "up",
    icon: Users,
    description: "Across all platforms",
  },
  {
    title: "Posts This Month",
    value: "34",
    change: "+8",
    trend: "up",
    icon: MessageSquare,
    description: "Published content",
  },
  {
    title: "Engagement Rate",
    value: "4.2%",
    change: "+0.3%",
    trend: "up",
    icon: TrendingUp,
    description: "Average engagement",
  },
  {
    title: "Connected Accounts",
    value: "5",
    change: "Active",
    trend: "neutral",
    icon: Globe,
    description: "Social platforms",
  },
];

const recentPosts = [
  {
    id: 1,
    content:
      "🚀 Excited to announce our new feature launch! More details coming soon...",
    platform: "Twitter",
    status: "published",
    engagement: 142,
    time: "2 hours ago",
  },
  {
    id: 2,
    content: "Behind the scenes of our latest product photoshoot 📸",
    platform: "Instagram",
    status: "scheduled",
    engagement: 0,
    time: "Tomorrow, 3:00 PM",
  },
  {
    id: 3,
    content: "Check out our latest blog post about social media trends in 2024",
    platform: "LinkedIn",
    status: "draft",
    engagement: 0,
    time: "Draft",
  },
];

export const DashboardOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Quick Actions
          </h2>
          <p className="text-muted-foreground">Get started with your content</p>
        </div>
        <div className="flex space-x-2">
          <AIAssistantSimple
            onContentGenerated={(content, hashtags) => {
              const params = new URLSearchParams({
                content: content,
                hashtags: hashtags?.join(",") || "",
              });
              window.location.href = `/composer?${params.toString()}`;
            }}
          />
          <Button
            onClick={() => navigate("/composer")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card
            key={index}
            className="border-border bg-card text-card-foreground hover:shadow-glow transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {kpi.value}
              </div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
              <div className="flex items-center mt-2">
                <Badge
                  variant={kpi.trend === "up" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {kpi.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/dashboard/calendar")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Content Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Schedule & manage posts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/dashboard/analytics")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/dashboard/social-accounts")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Social Accounts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage connections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/dashboard/settings")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure preferences
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Posts</CardTitle>
            <CardDescription>
              Your latest content across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-start space-x-3 p-3 border border-border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-border"
                      >
                        {post.platform}
                      </Badge>
                      <Badge
                        variant={
                          post.status === "published"
                            ? "default"
                            : post.status === "scheduled"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {post.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {post.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Platform Health
            </CardTitle>
            <CardDescription>
              Connection status for your social accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { platform: "Twitter", status: "connected", followers: "3.2K" },
              { platform: "Instagram", status: "connected", followers: "5.8K" },
              { platform: "LinkedIn", status: "connected", followers: "2.1K" },
              { platform: "Facebook", status: "error", followers: "1.3K" },
              { platform: "YouTube", status: "disconnected", followers: "892" },
            ].map((account, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {account.platform}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {account.followers} followers
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    account.status === "connected"
                      ? "default"
                      : account.status === "error"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {account.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
