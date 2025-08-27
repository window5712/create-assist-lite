import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GitHubIntegration } from "@/components/github/GitHubIntegration";
import { ModelDownloader } from "@/components/models/ModelDownloader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Github,
  Brain,
  Code2,
  Terminal,
  Download,
  ExternalLink,
  Zap,
  Database,
} from "lucide-react";

const Developer = () => {
  const quickActions = [
    {
      title: "Clone Repository",
      description: "Get started with the codebase",
      icon: Github,
      action: "git clone https://github.com/user/social-media-app.git",
      color: "bg-primary"
    },
    {
      title: "Install Dependencies", 
      description: "Set up your development environment",
      icon: Terminal,
      action: "npm install && npm run dev",
      color: "bg-success"
    },
    {
      title: "Download AI Models",
      description: "Enable offline AI capabilities",
      icon: Brain,
      action: "Initialize model library",
      color: "bg-accent"
    },
    {
      title: "API Documentation",
      description: "Explore available endpoints",
      icon: Code2,
      action: "View documentation",
      color: "bg-warning"
    }
  ];

  const stats = [
    { label: "Active Repositories", value: "3", icon: Github },
    { label: "AI Models", value: "12", icon: Brain },
    { label: "API Endpoints", value: "24", icon: Database },
    { label: "Build Status", value: "Passing", icon: Zap }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Developer Hub</h1>
          <p className="text-muted-foreground mt-2">
            Manage your code repositories, AI models, and development workflow
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common development tasks and commands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block">
                      {action.action}
                    </code>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="github" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Integration
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Models
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4">
            <GitHubIntegration />
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <ModelDownloader />
          </TabsContent>
        </Tabs>

        {/* Development Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Development Resources</CardTitle>
            <CardDescription>Documentation, guides, and useful links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="#" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Code2 className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-medium">API Documentation</h3>
                    <p className="text-sm text-muted-foreground">Complete API reference</p>
                  </div>
                </div>
              </a>
              
              <a href="#" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Terminal className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-medium">CLI Tools</h3>
                    <p className="text-sm text-muted-foreground">Command line utilities</p>
                  </div>
                </div>
              </a>
              
              <a href="#" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-medium">AI Model Guide</h3>
                    <p className="text-sm text-muted-foreground">Integration tutorials</p>
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Developer;