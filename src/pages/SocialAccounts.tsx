import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Facebook, 
  Instagram, 
  Linkedin,
  AlertTriangle,
  RefreshCw,
  Trash2
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin';
  account_name: string;
  account_username?: string;
  account_avatar_url?: string;
  is_active: boolean;
  last_refresh_at?: string;
  last_error?: string;
  scopes?: string[];
  created_at: string;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin
};

const platformColors = {
  facebook: 'bg-[#1877F2]',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  linkedin: 'bg-[#0A66C2]'
};

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { organization } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, [organization]);

  const fetchAccounts = async () => {
    if (!organization) return;
    
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts((data || []) as SocialAccount[]);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load social media accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: string) => {
    setConnecting(platform);
    
    try {
      // Call edge function to initiate OAuth flow
      const { data, error } = await supabase.functions.invoke('oauth-connect', {
        body: { platform, organization_id: organization.id }
      });

      if (error) throw error;

      // Redirect to OAuth provider
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting account:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect social media account",
        variant: "destructive"
      });
    } finally {
      setConnecting(null);
    }
  };

  const testConnection = async (accountId: string) => {
    try {
      const { error } = await supabase.functions.invoke('oauth-test', {
        body: { account_id: accountId }
      });

      if (error) throw error;

      toast({
        title: "Connection successful",
        description: "Your account is properly connected and working"
      });
      
      fetchAccounts(); // Refresh to show updated status
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Connection failed",
        description: "There was an issue with your account connection",
        variant: "destructive"
      });
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account disconnected",
        description: "Social media account has been removed"
      });
      
      fetchAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive"
      });
    }
  };

  const getPlatformInfo = (platform: string) => {
    const platformData = {
      facebook: {
        name: 'Facebook Pages',
        description: 'Connect your Facebook Pages to schedule posts',
        scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list']
      },
      instagram: {
        name: 'Instagram Business',
        description: 'Connect Instagram Business accounts via Facebook',
        scopes: ['instagram_basic', 'instagram_content_publish']
      },
      linkedin: {
        name: 'LinkedIn Pages',
        description: 'Connect LinkedIn Company Pages',
        scopes: ['w_member_social', 'r_liteprofile']
      }
    };

    return platformData[platform as keyof typeof platformData];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Social Media Accounts"
      description="Connect and manage your social media accounts for seamless posting"
    >
      <div className="space-y-6">

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {['facebook', 'instagram', 'linkedin'].map((platform) => {
          const Icon = platformIcons[platform as keyof typeof platformIcons];
          const info = getPlatformInfo(platform);
          const connectedAccount = accounts.find(acc => acc.platform === platform);
          
          return (
            <Card key={platform} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${platformColors[platform as keyof typeof platformColors]}`} />
              
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg text-white ${platformColors[platform as keyof typeof platformColors]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{info?.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {info?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {connectedAccount ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {connectedAccount.account_avatar_url && (
                          <img 
                            src={connectedAccount.account_avatar_url} 
                            alt={connectedAccount.account_name}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{connectedAccount.account_name}</p>
                          {connectedAccount.account_username && (
                            <p className="text-sm text-muted-foreground">
                              @{connectedAccount.account_username}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={connectedAccount.is_active ? "default" : "destructive"}>
                        {connectedAccount.is_active ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {connectedAccount.is_active ? 'Active' : 'Error'}
                      </Badge>
                    </div>

                    {connectedAccount.last_error && (
                      <div className="flex items-center space-x-2 text-sm text-warning">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Connection issue detected</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {info?.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {connectedAccount.last_refresh_at && (
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(connectedAccount.last_refresh_at).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testConnection(connectedAccount.id)}
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => disconnectAccount(connectedAccount.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Required permissions:</p>
                      <div className="space-y-1">
                        {info?.scopes.map((scope) => (
                          <div key={scope} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-primary" />
                            <span>{scope.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => connectAccount(platform)}
                      disabled={connecting === platform}
                      className="w-full"
                    >
                      {connecting === platform ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Connect {info?.name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        </div>

        {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Health</CardTitle>
            <CardDescription>
              Monitor the status of your connected social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => {
                const Icon = platformIcons[account.platform];
                const healthScore = account.is_active && !account.last_error ? 100 : 
                                 account.is_active ? 70 : 0;
                
                return (
                  <div key={account.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{account.account_name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {healthScore}% healthy
                      </span>
                    </div>
                    <Progress value={healthScore} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  );
}