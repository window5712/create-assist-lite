import { Routes, Route, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardSettings } from "@/components/dashboard/DashboardSettings";

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
    </Routes>
  );
};

export default Dashboard;