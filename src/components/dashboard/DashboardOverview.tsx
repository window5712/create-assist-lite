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
  Zap,
  Target,
  Clock,
  Activity,
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
import { Progress } from "@/components/ui/progress";
import { AIAssistantSimple } from "@/components/ai/AIAssistantSimple";
import { QuickActions } from "@/components/dashboard/QuickActions";
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

  const weeklyGoal = 75; // percentage
  const postsThisWeek = 12;
  const goalPosts = 16;

  return (
    <div className="space-y-6">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        
        {/* Weekly Goal */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Weekly Goal
            </CardTitle>
            <CardDescription>Content creation progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{weeklyGoal}%</div>
              <p className="text-sm text-muted-foreground">
                {postsThisWeek} of {goalPosts} posts
              </p>
            </div>
            <Progress value={weeklyGoal} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This week</span>
              <span>{goalPosts - postsThisWeek} remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card
            key={index}
            className="border-border bg-card text-card-foreground hover:shadow-glow transition-all duration-300 group cursor-pointer"
            onClick={() => {
              if (kpi.title === "Total Followers") navigate("/dashboard/analytics");
              else if (kpi.title === "Posts This Month") navigate("/dashboard/calendar");
              else if (kpi.title === "Engagement Rate") navigate("/dashboard/analytics");
              else if (kpi.title === "Connected Accounts") navigate("/dashboard/social-accounts");
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {kpi.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {kpi.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
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

      {/* Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Today's Activity
            </CardTitle>
            <CardDescription>Your productivity snapshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Posts Created", value: "3", icon: MessageSquare, color: "text-blue-500" },
              { label: "Posts Scheduled", value: "5", icon: Clock, color: "text-green-500" },
              { label: "Accounts Managed", value: "4", icon: Users, color: "text-purple-500" },
              { label: "Analytics Viewed", value: "2", icon: BarChart3, color: "text-orange-500" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-lg">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-lg font-bold">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Recent Posts</CardTitle>
                <CardDescription>
                  Your latest content across all platforms
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/composer")}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate("/dashboard/calendar")}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs border-border">
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
      </div>

      {/* Platform Health */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Health
              </CardTitle>
              <CardDescription>
                Connection status for your social accounts
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/dashboard/social-accounts")}
            >
              Manage Accounts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { platform: "Twitter", status: "connected", followers: "3.2K", health: 95 },
              { platform: "Instagram", status: "connected", followers: "5.8K", health: 92 },
              { platform: "LinkedIn", status: "connected", followers: "2.1K", health: 88 },
              { platform: "Facebook", status: "error", followers: "1.3K", health: 45 },
              { platform: "YouTube", status: "disconnected", followers: "892", health: 0 },
            ].map((account, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Badge
                    variant={
                      account.status === "connected"
                        ? "default"
                        : account.status === "error"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {account.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {account.platform}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {account.followers} followers
                  </p>
                </div>
                {account.status === "connected" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Health</span>
                      <span>{account.health}%</span>
                    </div>
                    <Progress value={account.health} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
