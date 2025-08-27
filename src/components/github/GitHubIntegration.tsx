import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Github,
  GitBranch,
  GitCommit,
  Download,
  Upload,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Repository {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  lastCommit: string;
  status: "connected" | "syncing" | "error";
}

export function GitHubIntegration() {
  const [connected, setConnected] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: 1,
      name: "social-media-app",
      description: "Modern social media management platform",
      url: "https://github.com/user/social-media-app",
      language: "TypeScript",
      stars: 42,
      lastCommit: "2 hours ago",
      status: "connected"
    },
    {
      id: 2,
      name: "ai-content-generator",
      description: "AI-powered content generation tools",
      url: "https://github.com/user/ai-content-generator", 
      language: "Python",
      stars: 18,
      lastCommit: "1 day ago",
      status: "syncing"
    }
  ]);
  const [repoUrl, setRepoUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const connectGitHub = async () => {
    setSyncing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnected(true);
      toast({
        title: "GitHub Connected",
        description: "Successfully connected to your GitHub account",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to GitHub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const syncRepository = async (repoId: number) => {
    setRepositories(repos => 
      repos.map(repo => 
        repo.id === repoId 
          ? { ...repo, status: "syncing" as const }
          : repo
      )
    );

    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      setRepositories(repos => 
        repos.map(repo => 
          repo.id === repoId 
            ? { ...repo, status: "connected" as const, lastCommit: "Just now" }
            : repo
        )
      );
      toast({
        title: "Repository Synced",
        description: "Code changes have been synchronized",
      });
    } catch (error) {
      setRepositories(repos => 
        repos.map(repo => 
          repo.id === repoId 
            ? { ...repo, status: "error" as const }
            : repo
        )
      );
      toast({
        title: "Sync Failed",
        description: "Failed to sync repository",
        variant: "destructive",
      });
    }
  };

  const addRepository = async () => {
    if (!repoUrl) return;
    
    const newRepo: Repository = {
      id: Date.now(),
      name: repoUrl.split('/').pop() || "new-repo",
      description: "Imported repository",
      url: repoUrl,
      language: "Unknown",
      stars: 0,
      lastCommit: "Never",
      status: "syncing"
    };

    setRepositories(repos => [...repos, newRepo]);
    setRepoUrl("");
    
    setTimeout(() => {
      setRepositories(repos => 
        repos.map(repo => 
          repo.id === newRepo.id 
            ? { ...repo, status: "connected" as const, lastCommit: "Just now" }
            : repo
        )
      );
    }, 2000);

    toast({
      title: "Repository Added",
      description: "Repository has been connected and is syncing",
    });
  };

  const getStatusIcon = (status: Repository["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  if (!connected) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Connect to GitHub</CardTitle>
          <CardDescription>
            Sync your code, manage repositories, and collaborate seamlessly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <GitBranch className="h-6 w-6 text-primary mx-auto" />
              <p className="text-sm font-medium">Version Control</p>
              <p className="text-xs text-muted-foreground">Track changes and manage versions</p>
            </div>
            <div className="space-y-2">
              <GitCommit className="h-6 w-6 text-primary mx-auto" />
              <p className="text-sm font-medium">Auto Sync</p>
              <p className="text-xs text-muted-foreground">Automatic code synchronization</p>
            </div>
            <div className="space-y-2">
              <ExternalLink className="h-6 w-6 text-primary mx-auto" />
              <p className="text-sm font-medium">Collaboration</p>
              <p className="text-xs text-muted-foreground">Team development made easy</p>
            </div>
          </div>
          
          <Button 
            onClick={connectGitHub} 
            disabled={syncing}
            className="w-full"
            size="lg"
          >
            {syncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Github className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>Manage your repositories and sync code</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-success/10 text-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Input
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addRepository} disabled={!repoUrl}>
            <Upload className="h-4 w-4 mr-2" />
            Add Repo
          </Button>
        </div>

        <div className="space-y-4">
          {repositories.map((repo) => (
            <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(repo.status)}
                  <div>
                    <p className="font-medium">{repo.name}</p>
                    <p className="text-sm text-muted-foreground">{repo.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">{repo.language}</p>
                  <p className="text-xs text-muted-foreground">Updated {repo.lastCommit}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncRepository(repo.id)}
                    disabled={repo.status === "syncing"}
                  >
                    {repo.status === "syncing" ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{repo.name}</DialogTitle>
                        <DialogDescription>{repo.description}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Language:</span>
                          <Badge variant="secondary">{repo.language}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Stars:</span>
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Commit:</span>
                          <span>{repo.lastCommit}</span>
                        </div>
                        <Button asChild className="w-full">
                          <a href={repo.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on GitHub
                          </a>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}