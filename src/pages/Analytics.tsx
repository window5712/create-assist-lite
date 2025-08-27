import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Facebook,
  Instagram,
  Linkedin,
  ExternalLink,
  RefreshCw,
  Download,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, subDays } from "date-fns";
import { AIAssistant } from "@/components/ai/AIAssistant";

interface AnalyticsData {
  totalPosts: number;
  publishedPosts: number;
  failedPosts: number;
  scheduledPosts: number;
  successRate: number;
}

interface JobLog {
  id: string;
  post: {
    title?: string;
    content: string;
    target_platforms: string[];
  };
  platform: string;
  status: string;
  attempts: number;
  last_error?: string;
  platform_post_id?: string;
  scheduled_for: string;
  created_at: string;
  updated_at: string;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
};

const statusConfig = {
  completed: {
    color: "text-success",
    bg: "bg-success",
    icon: CheckCircle,
    label: "Published",
  },
  failed: {
    color: "text-destructive",
    bg: "bg-destructive",
    icon: XCircle,
    label: "Failed",
  },
  pending: {
    color: "text-warning",
    bg: "bg-warning",
    icon: Clock,
    label: "Pending",
  },
  processing: {
    color: "text-primary",
    bg: "bg-primary",
    icon: RefreshCw,
    label: "Processing",
  },
};

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPosts: 0,
    publishedPosts: 0,
    failedPosts: 0,
    scheduledPosts: 0,
    successRate: 0,
  });
  const [jobLogs, setJobLogs] = useState<JobLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [platformFilter, setPlatformFilter] = useState("all");
  const { organization } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
    fetchJobLogs();
  }, [organization, dateRange, platformFilter]);

  const fetchAnalyticsData = async () => {
    if (!organization) return;

    try {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), days);

      // Fetch posts data
      let postsQuery = supabase
        .from("posts")
        .select("status, target_platforms, created_at")
        .eq("organization_id", organization.id)
        .gte("created_at", startDate.toISOString());

      const { data: postsData, error: postsError } = await postsQuery;
      if (postsError) throw postsError;

      // Fetch job queue data
      let jobsQuery = supabase
        .from("job_queue")
        .select("status, platform, created_at")
        .eq("organization_id", organization.id)
        .gte("created_at", startDate.toISOString());

      if (platformFilter !== "all") {
        jobsQuery = jobsQuery.eq("platform", platformFilter);
      }

      const { data: jobsData, error: jobsError } = await jobsQuery;
      if (jobsError) throw jobsError;

      // Calculate analytics
      const totalPosts = postsData?.length || 0;
      const publishedPosts =
        jobsData?.filter((job) => job.status === "completed").length || 0;
      const failedPosts =
        jobsData?.filter((job) => job.status === "failed").length || 0;
      const scheduledPosts =
        postsData?.filter((post) => post.status === "scheduled").length || 0;
      const successRate =
        totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0;

      setAnalyticsData({
        totalPosts,
        publishedPosts,
        failedPosts,
        scheduledPosts,
        successRate,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const fetchJobLogs = async () => {
    if (!organization) return;

    try {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), days);

      let query = supabase
        .from("job_queue")
        .select(
          `
          *,
          post:posts(title, content, target_platforms)
        `
        )
        .eq("organization_id", organization.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(50);

      if (platformFilter !== "all") {
        query = query.eq("platform", platformFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setJobLogs(data || []);
    } catch (error) {
      console.error("Error fetching job logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const retryFailedJob = async (jobId: string) => {
    try {
      // Call edge function to retry the job
      const { error } = await supabase.functions.invoke("retry-job", {
        body: { job_id: jobId },
      });

      if (error) throw error;

      // Refresh the data
      fetchJobLogs();
    } catch (error) {
      console.error("Error retrying job:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Analytics & Logs"
      description="Monitor your posting performance and track job statuses"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <AIAssistant
              onContentGenerated={(content, hashtags) => {
                // Navigate to composer with pre-filled content
                const params = new URLSearchParams({
                  content: content,
                  hashtags: hashtags?.join(",") || "",
                });
                window.location.href = `/composer?${params.toString()}`;
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                fetchAnalyticsData();
                fetchJobLogs();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.totalPosts}
              </div>
              <p className="text-xs text-muted-foreground">
                Posts created in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {analyticsData.publishedPosts}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully published posts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {analyticsData.failedPosts}
              </div>
              <p className="text-xs text-muted-foreground">
                Posts that failed to publish
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.successRate.toFixed(1)}%
              </div>
              <Progress value={analyticsData.successRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Job Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Logs</CardTitle>
            <CardDescription>
              Detailed logs of all publishing attempts and their outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobLogs.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No logs found for the selected period
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobLogs.map((log) => {
                    const status =
                      statusConfig[log.status as keyof typeof statusConfig];
                    const Icon = status?.icon || AlertCircle;
                    const PlatformIcon =
                      platformIcons[log.platform as keyof typeof platformIcons];

                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="max-w-48">
                            <p className="font-medium truncate">
                              {log.post?.title || "Untitled Post"}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {log.post?.content.substring(0, 50)}...
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {PlatformIcon && (
                              <PlatformIcon className="h-4 w-4" />
                            )}
                            <span className="capitalize">{log.platform}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${status?.color} border-current`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {status?.label || log.status}
                          </Badge>
                          {log.last_error && (
                            <p className="text-xs text-destructive mt-1 truncate max-w-32">
                              {log.last_error}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          <span
                            className={log.attempts > 1 ? "text-warning" : ""}
                          >
                            {log.attempts}/3
                          </span>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {format(parseISO(log.scheduled_for), "MMM d, HH:mm")}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {format(parseISO(log.updated_at), "MMM d, HH:mm")}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {log.status === "failed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => retryFailedJob(log.id)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}

                            {log.platform_post_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Open platform post in new tab
                                  const urls = {
                                    facebook: `https://facebook.com/${log.platform_post_id}`,
                                    instagram: `https://instagram.com/p/${log.platform_post_id}`,
                                    linkedin: `https://linkedin.com/feed/update/${log.platform_post_id}`,
                                  };
                                  window.open(
                                    urls[log.platform as keyof typeof urls],
                                    "_blank"
                                  );
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
