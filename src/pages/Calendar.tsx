import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CalendarDays,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Plus,
  Filter,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from "date-fns";
import { AIAssistant } from "@/components/ai/AIAssistant";

interface ScheduledPost {
  id: string;
  title?: string;
  content: string;
  target_platforms: string[];
  status: string;
  scheduled_for: string;
  created_at: string;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
};

const statusColors = {
  draft: "bg-muted",
  scheduled: "bg-primary",
  published: "bg-success",
  failed: "bg-destructive",
};

export default function CalendarView() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { organization } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [organization, selectedDate]);

  const fetchPosts = async () => {
    if (!organization) return;

    try {
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("organization_id", organization.id)
        .gte("scheduled_for", startDate.toISOString())
        .lte("scheduled_for", endDate.toISOString())
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  };

  const getPostsForDay = (day: Date) => {
    return posts
      .filter(
        (post) =>
          post.scheduled_for && isSameDay(parseISO(post.scheduled_for), day)
      )
      .filter(
        (post) =>
          filterPlatform === "all" ||
          post.target_platforms.includes(filterPlatform)
      );
  };

  const PostCard = ({ post }: { post: ScheduledPost }) => (
    <div
      className="p-2 mb-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: `hsl(var(--${statusColors[
          post.status as keyof typeof statusColors
        ].replace("bg-", "")}))`,
      }}
      onClick={() => setSelectedPost(post)}
    >
      <div className="flex items-center space-x-1 mb-1">
        {post.target_platforms.map((platform) => {
          const Icon = platformIcons[platform as keyof typeof platformIcons];
          return Icon ? (
            <Icon key={platform} className="h-3 w-3 text-white" />
          ) : null;
        })}
      </div>
      <p className="text-white font-medium truncate">
        {post.title || post.content.substring(0, 30)}
      </p>
      <p className="text-white/80">
        {post.scheduled_for
          ? format(parseISO(post.scheduled_for), "HH:mm")
          : ""}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const days = getDaysInMonth();

  return (
    <DashboardLayout
      title="Content Calendar"
      description="View and manage your scheduled posts across all platforms"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>All Platforms</span>
                </div>
              </SelectItem>
              <SelectItem value="facebook">
                <div className="flex items-center space-x-2">
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </div>
              </SelectItem>
              <SelectItem value="instagram">
                <div className="flex items-center space-x-2">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </div>
              </SelectItem>
              <SelectItem value="linkedin">
                <div className="flex items-center space-x-2">
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

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
              onClick={() => (window.location.href = "/composer")}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{format(selectedDate, "MMMM yyyy")}</span>
                </CardTitle>
                <CardDescription>
                  {posts.length} posts scheduled this month
                </CardDescription>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-medium text-muted-foreground text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayPosts = getPostsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-24 sm:min-h-32 p-1 sm:p-2 border rounded-lg ${
                      isToday ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div
                      className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                        isToday ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </div>

                    <div className="space-y-1">
                      {dayPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Post Details Modal */}
        <Dialog
          open={!!selectedPost}
          onOpenChange={() => setSelectedPost(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post Details</DialogTitle>
            </DialogHeader>

            {selectedPost && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Content</h4>
                  <p className="text-muted-foreground">
                    {selectedPost.content}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Platforms</h4>
                  <div className="flex space-x-2">
                    {selectedPost.target_platforms.map((platform) => {
                      const Icon =
                        platformIcons[platform as keyof typeof platformIcons];
                      return (
                        <Badge
                          key={platform}
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          {Icon && <Icon className="h-3 w-3" />}
                          <span className="capitalize">{platform}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Status</h4>
                    <Badge
                      className={`${
                        statusColors[
                          selectedPost.status as keyof typeof statusColors
                        ]
                      } text-white`}
                    >
                      {selectedPost.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Scheduled For</h4>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {selectedPost.scheduled_for
                          ? format(
                              parseISO(selectedPost.scheduled_for),
                              "MMM d, yyyy at h:mm a"
                            )
                          : "Not scheduled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    Edit Post
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Duplicate
                  </Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
