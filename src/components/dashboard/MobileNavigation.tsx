import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Home,
  Edit3,
  Calendar,
  BarChart3,
  Users,
  FileText,
  Code,
  HelpCircle,
  Settings,
  Bell,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { title: "Overview", url: "/dashboard", icon: Home },
  { title: "Composer", url: "/composer", icon: Edit3 },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Social Accounts", url: "/dashboard/social-accounts", icon: Users },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Developer", url: "/developer", icon: Code },
  { title: "Help", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h2 className="font-semibold">SocialStream</h2>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Quick Tips</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tap and hold navigation items for quick actions and shortcuts.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}