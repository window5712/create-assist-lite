import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  BarChart3,
  Users,
  Zap,
  Camera,
  FileText,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  {
    title: "Create Post",
    description: "Write and schedule new content",
    icon: Plus,
    action: "/composer",
    color: "bg-primary",
    shortcut: "Ctrl+N",
  },
  {
    title: "Schedule Post",
    description: "Plan content for optimal times",
    icon: Calendar,
    action: "/composer?schedule=true",
    color: "bg-blue-500",
    shortcut: "Ctrl+S",
  },
  {
    title: "Quick Photo Post",
    description: "Upload and share instantly",
    icon: Camera,
    action: "/composer?type=photo",
    color: "bg-green-500",
    shortcut: "Ctrl+P",
  },
  {
    title: "View Analytics",
    description: "Check performance metrics",
    icon: BarChart3,
    action: "/dashboard/analytics",
    color: "bg-purple-500",
    shortcut: "Ctrl+A",
  },
  {
    title: "Manage Accounts",
    description: "Connect social platforms",
    icon: Users,
    action: "/dashboard/social-accounts",
    color: "bg-orange-500",
    shortcut: "Ctrl+M",
  },
  {
    title: "Use Template",
    description: "Start with pre-made content",
    icon: FileText,
    action: "/templates",
    color: "bg-indigo-500",
    shortcut: "Ctrl+T",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts to boost your productivity
            </CardDescription>
          </div>
          <Badge variant="secondary">6 actions</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left hover:shadow-md transition-all duration-200"
              onClick={() => navigate(action.action)}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {action.shortcut}
                </Badge>
              </div>
              <div>
                <h3 className="font-medium text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pro Tip</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Use keyboard shortcuts to perform actions faster. Press and hold Ctrl while clicking any action for more options.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}