import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  CheckCircle,
  XCircle,
  Facebook,
  Instagram,
  Linkedin,
  RefreshCw,
  Trash2,
  Users,
  TrendingUp,
  Sparkles,
  Settings,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AIAssistantSimple } from "@/components/ai/AIAssistantSimple";
import { ConnectAccountModal } from "@/components/social/ConnectAccountModal";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  account_username?: string;
  account_avatar_url?: string;
  is_active: boolean;
  last_error?: string;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

const platformConfig = {
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    description: "Connect your Facebook page",
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    description: "Schedule Instagram posts",
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    description: "Share professional content",
  },
};

export const DashboardSocialAccounts = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { toast } = useToast();
  const { organization } = useAuth();

  useEffect(() => {
    fetchAccounts();
  }, [organization]);

  const fetchAccounts = async () => {
    // If no organization, just set empty accounts and stop loading
    if (!organization) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("organization_id", organization.id);

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: string) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleAccountUpdate = () => {
    fetchAccounts();
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase.functions.invoke("disconnect-account", {
        body: {
          account_id: accountId,
          organization_id: organization?.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account disconnected successfully!",
      });

      fetchAccounts();
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      });
    }
  };

  const refreshAccount = async (accountId: string) => {
    try {
      const { error } = await supabase.functions.invoke("refresh-account", {
        body: {
          account_id: accountId,
          organization_id: organization?.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account refreshed successfully!",
      });

      fetchAccounts();
    } catch (error) {
      console.error("Error refreshing account:", error);
      toast({
        title: "Error",
        description: "Failed to refresh account",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading social accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Social Media Accounts
          </h2>
          <p className="text-muted-foreground">
            Connect and manage your social media accounts for automated posting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAccounts} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <AIAssistantSimple
            onContentGenerated={(content, hashtags) => {
              const params = new URLSearchParams({
                content: content,
                hashtags: hashtags?.join(",") || "",
              });
              window.location.href = `/composer?${params.toString()}`;
            }}
          />
        </div>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Connected Accounts</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const platform =
                platformConfig[account.platform as keyof typeof platformConfig];
              const Icon = platform?.icon;

              return (
                <Card key={account.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {Icon && (
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${platform.color}20` }}
                          >
                            <Icon
                              className="h-6 w-6"
                              style={{ color: platform.color }}
                            />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base">
                            {platform?.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {account.account_name}
                          </p>
                          {account.account_username && (
                            <p className="text-xs text-muted-foreground">
                              @{account.account_username}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={account.is_active ? "default" : "secondary"}
                        >
                          {account.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {account.last_sync && (
                        <div className="text-xs text-muted-foreground">
                          Last synced:{" "}
                          {new Date(account.last_sync).toLocaleDateString()}
                        </div>
                      )}
                      {account.last_error && (
                        <div className="flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {account.last_error}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => refreshAccount(account.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Refresh
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => disconnectAccount(account.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Connect New Accounts</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(platformConfig).map(([platform, config]) => {
            const Icon = config.icon;
            const isConnected = accounts.some(
              (account) => account.platform === platform && account.is_active
            );

            return (
              <Card
                key={platform}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isConnected ? "opacity-60" : "hover:scale-105"
                }`}
                onClick={() => connectAccount(platform)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Icon
                        className="h-8 w-8"
                        style={{ color: config.color }}
                      />
                    </div>
                    <div>
                      <CardTitle>{config.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    style={{ backgroundColor: config.color }}
                    disabled={isConnected}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect {config.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Connect Account Modal */}
      {selectedPlatform && (
        <ConnectAccountModal
          isOpen={showConnectModal}
          onClose={() => {
            setShowConnectModal(false);
            setSelectedPlatform(null);
            handleAccountUpdate();
          }}
          platform={selectedPlatform}
        />
      )}
    </div>
  );
};
