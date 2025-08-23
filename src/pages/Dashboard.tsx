import { useState } from "react";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Globe,
  Plus,
  Settings,
  Bell,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  SidebarProvider, 
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    { title: "Overview", url: "/dashboard", icon: BarChart3 },
    { title: "Content", url: "/dashboard/content", icon: MessageSquare },
    { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
    { title: "Analytics", url: "/dashboard/analytics", icon: TrendingUp },
    { title: "Accounts", url: "/dashboard/accounts", icon: Globe },
    { title: "Team", url: "/dashboard/team", icon: Users },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const kpiCards = [
    {
      title: "Total Followers",
      value: "12,459",
      change: "+2.5%",
      trend: "up",
      icon: Users,
      description: "Across all platforms"
    },
    {
      title: "Posts This Month",
      value: "34",
      change: "+8",
      trend: "up",
      icon: MessageSquare,
      description: "Published content"
    },
    {
      title: "Engagement Rate",
      value: "4.2%",
      change: "+0.3%",
      trend: "up",
      icon: TrendingUp,
      description: "Average engagement"
    },
    {
      title: "Connected Accounts",
      value: "5",
      change: "Active",
      trend: "neutral",
      icon: Globe,
      description: "Social platforms"
    }
  ];

  const recentPosts = [
    {
      id: 1,
      content: "🚀 Excited to announce our new feature launch! More details coming soon...",
      platform: "Twitter",
      status: "published",
      engagement: 142,
      time: "2 hours ago"
    },
    {
      id: 2,
      content: "Behind the scenes of our latest product photoshoot 📸",
      platform: "Instagram",
      status: "scheduled",
      engagement: 0,
      time: "Tomorrow, 3:00 PM"
    },
    {
      id: 3,
      content: "Check out our latest blog post about social media trends in 2024",
      platform: "LinkedIn",
      status: "draft",
      engagement: 0,
      time: "Draft"
    }
  ];

  const AppSidebar = () => {
    const { state } = useSidebar();
    
    const isActive = (path: string) => currentPath === path;
    const getNavCls = ({ isActive }: { isActive: boolean }) =>
      isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted";

    return (
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={state === "collapsed" ? "hidden" : ""}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {state === "expanded" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back! Here's your social media overview.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search posts, analytics..." 
                    className="pl-10 w-64" 
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <p className="text-muted-foreground">Get started with your content</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiCards.map((kpi, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
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

            {/* Content Overview */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>
                    Your latest content across all platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {post.platform}
                            </Badge>
                            <Badge 
                              variant={
                                post.status === "published" ? "default" :
                                post.status === "scheduled" ? "secondary" : "outline"
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
              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
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
                    { platform: "YouTube", status: "disconnected", followers: "892" }
                  ].map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{account.platform}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.followers} followers
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          account.status === "connected" ? "default" :
                          account.status === "error" ? "destructive" : "secondary"
                        }
                      >
                        {account.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;