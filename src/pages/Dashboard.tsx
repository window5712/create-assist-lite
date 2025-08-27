import { Routes, Route, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardSettings } from "@/components/dashboard/DashboardSettings";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { DashboardSocialAccounts } from "@/components/dashboard/DashboardSocialAccounts";
import { DashboardTest } from "@/components/dashboard/DashboardTest";

const Dashboard = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout
            title="Dashboard"
            description="Welcome back! Here's your social media overview."
          >
            <DashboardOverview />
          </DashboardLayout>
        }
      />
      <Route
        path="/calendar"
        element={
          <DashboardLayout
            title="Content Calendar"
            description="View and manage your scheduled posts across all platforms"
          >
            <DashboardCalendar />
          </DashboardLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <DashboardLayout
            title="Analytics & Logs"
            description="Monitor your posting performance and track job statuses"
          >
            <DashboardAnalytics />
          </DashboardLayout>
        }
      />
      <Route
        path="/social-accounts"
        element={
          <DashboardLayout
            title="Social Media Accounts"
            description="Connect and manage your social media accounts for seamless posting"
          >
            <DashboardSocialAccounts />
          </DashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardLayout
            title="Settings"
            description="Manage your account and application preferences"
          >
            <DashboardSettings />
          </DashboardLayout>
        }
      />
      <Route
        path="/test"
        element={
          <DashboardLayout
            title="Component Test"
            description="Test all dashboard components"
          >
            <DashboardTest />
          </DashboardLayout>
        }
      />
    </Routes>
  );
};

export default Dashboard;
