import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Facebook,
  Instagram,
  Linkedin,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Globe,
  Calendar,
} from "lucide-react";

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
}

interface AccountInfo {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  type: "page" | "profile" | "business";
  followers_count?: number;
  is_connected: boolean;
}

const platformConfig = {
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    description: "Connect your Facebook pages and profiles",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    description: "Connect your Instagram business accounts",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    description: "Connect your LinkedIn company pages",
    scopes: ["w_member_social", "r_liteprofile", "w_organization_social"],
  },
};

export const ConnectAccountModal = ({
  isOpen,
  onClose,
  platform,
}: ConnectAccountModalProps) => {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();
  const { organization } = useAuth();

  const config = platformConfig[platform as keyof typeof platformConfig];
  const prettyScopes = (scopes: string[]) => {
    return scopes.map((s) =>
      s
        .replace(/_/g, " ")
        .replace("pages ", "")
        .replace("instagram ", "")
        .replace("w_", "")
        .replace("r_", "")
    );
  };

  useEffect(() => {
    if (isOpen && platform) {
      fetchAvailableAccounts();
    }
  }, [isOpen, platform]);

  const fetchAvailableAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-accounts", {
        body: { platform, organization_id: organization?.id || null },
      });

      if (error) throw error;
      setAccounts(data?.accounts || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (accountId: string) => {
    setConnecting(accountId);
    try {
      const { data, error } = await supabase.functions.invoke(
        "connect-account",
        {
          body: {
            platform,
            account_id: accountId,
            organization_id: organization?.id || null,
          },
        }
      );

      if (error) throw error;

      if (data?.requires_oauth) {
        // Redirect to OAuth flow
        window.location.href = data.auth_url;
      } else {
        toast({
          title: "Success",
          description: `${config.name} account connected successfully!`,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error connecting account:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase.functions.invoke("disconnect-account", {
        body: {
          platform,
          account_id: accountId,
          organization_id: organization?.id || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${config.name} account disconnected successfully!`,
      });

      fetchAvailableAccounts();
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      });
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "page":
        return <Globe className="h-4 w-4" />;
      case "profile":
        return <Users className="h-4 w-4" />;
      case "business":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <config.icon
                className="h-5 w-5"
                style={{ color: config.color }}
              />
            </div>
            Connect {config.name} Account
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Permissions Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Required Permissions</CardTitle>
              <CardDescription>
                We need these permissions to post on your behalf:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {prettyScopes(config.scopes).map((scope) => (
                  <div key={scope} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="capitalize">{scope}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Accounts */}
          <div className="space-y-3">
            <h3 className="font-medium">Available Accounts</h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading accounts...</span>
              </div>
            ) : accounts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No {config.name} accounts found. Please make sure you have
                      the required permissions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${config.color}20` }}
                          >
                            {getAccountIcon(account.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{account.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {account.type}
                              </Badge>
                            </div>
                            {account.username && (
                              <p className="text-sm text-muted-foreground">
                                @{account.username}
                              </p>
                            )}
                            {account.followers_count && (
                              <p className="text-sm text-muted-foreground">
                                {account.followers_count.toLocaleString()}{" "}
                                followers
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {account.is_connected ? (
                            <>
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => disconnectAccount(account.id)}
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => connectAccount(account.id)}
                              disabled={connecting === account.id}
                              style={{ backgroundColor: config.color }}
                            >
                              {connecting === account.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <ExternalLink className="h-4 w-4 mr-2" />
                              )}
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Need help?</p>
                  <p>
                    Make sure you're logged into {config.name} and have admin
                    access to the pages you want to connect. For business
                    accounts, ensure you have the necessary permissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
