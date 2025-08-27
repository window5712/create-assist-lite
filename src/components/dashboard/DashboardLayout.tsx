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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Calendar,
  Users,
  MessageSquare,
  TrendingUp,
  Globe,
  Settings,
  Bell,
  Search,
  Palette,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { MobileNavigation } from "@/components/dashboard/MobileNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Home, LogOut } from "lucide-react";

const sidebarItems = [
  { title: "Overview", url: "/dashboard", icon: BarChart3 },
  { title: "Composer", url: "/composer", icon: MessageSquare },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Analytics", url: "/dashboard/analytics", icon: TrendingUp },
  { title: "Social Accounts", url: "/dashboard/social-accounts", icon: Globe },
  { title: "Templates", url: "/templates", icon: Palette },
  { title: "Help", url: "/help", icon: Users },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel
            className={`${
              state === "collapsed" ? "hidden" : ""
            } text-sidebar-foreground/70`}
          >
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        transition-all duration-200 
                        ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }
                      `}
                    >
                      <NavLink to={item.url} end={item.url === "/dashboard"}>
                        <item.icon className="h-4 w-4" />
                        {state === "expanded" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const DashboardLayout = ({
  children,
  title = "Dashboard",
  description,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <MobileNavigation />
                <SidebarTrigger className="hidden md:flex text-foreground hover:bg-accent hover:text-accent-foreground" />
                <div className="hidden sm:block">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-muted-foreground text-sm">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-48 lg:w-64 bg-background border-input"
                  />
                </div>
                <Link to="/" className="hidden md:block">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <ThemeToggle />
                <NotificationCenter />
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={profile?.avatar_url || "/placeholder-avatar.jpg"}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {(profile?.full_name || "User").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 bg-background overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
