import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCalendar } from "./DashboardCalendar";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { DashboardSocialAccounts } from "./DashboardSocialAccounts";

export const DashboardTest = () => {
  const [activeComponent, setActiveComponent] = useState<string>("overview");

  const components = {
    overview: <div className="p-6">Dashboard Overview Component</div>,
    calendar: <DashboardCalendar />,
    analytics: <DashboardAnalytics />,
    social: <DashboardSocialAccounts />,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeComponent === "overview" ? "default" : "outline"}
          onClick={() => setActiveComponent("overview")}
        >
          Overview
        </Button>
        <Button
          variant={activeComponent === "calendar" ? "default" : "outline"}
          onClick={() => setActiveComponent("calendar")}
        >
          Calendar
        </Button>
        <Button
          variant={activeComponent === "analytics" ? "default" : "outline"}
          onClick={() => setActiveComponent("analytics")}
        >
          Analytics
        </Button>
        <Button
          variant={activeComponent === "social" ? "default" : "outline"}
          onClick={() => setActiveComponent("social")}
        >
          Social Accounts
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component Test: {activeComponent}</CardTitle>
        </CardHeader>
        <CardContent>
          {components[activeComponent as keyof typeof components]}
        </CardContent>
      </Card>
    </div>
  );
};
