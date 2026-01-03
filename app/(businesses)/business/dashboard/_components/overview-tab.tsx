"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Star, MessageSquareWarning, Activity, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface OverviewTabProps {
  businessId: string;
}

interface StatsData {
  views: number;
  reviews: number;
  rating: number;
  complaints: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
}

export function OverviewTab({ businessId }: OverviewTabProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/business/${businessId}/stats`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Stats error:", error);
        toast.error("Could not load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    }

    if (businessId) {
      fetchStats();
    }
  }, [businessId]);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Views"
          value={stats.views}
          icon={Eye}
          description="Page visits this month"
        />
        <StatsCard
          title="Total Reviews"
          value={stats.reviews}
          icon={Star}
          description={`Average Rating: ${stats.rating.toFixed(1)}`}
        />
        <StatsCard
          title="Active Complaints"
          value={stats.complaints.pending + stats.complaints.inProgress}
          icon={MessageSquareWarning}
          description={`${stats.complaints.pending} Pending`}
          highlight={stats.complaints.pending > 0}
        />
        <StatsCard
          title="Resolved"
          value={stats.complaints.resolved}
          icon={CheckCircle}
          description="Complaints resolved"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-50" />
                <p>No recent activity logs available</p>
                {/* TODO: Implement Activity Feed */}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
             <CardTitle>Action Items</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {stats.complaints.pending > 0 ? (
                    <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                        <MessageSquareWarning className="h-5 w-5 text-red-500 mr-3" />
                        <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Resolve Pending Complaints</p>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80">You have {stats.complaints.pending} waiting for review</p>
                        </div>
                    </div>
                ) : (
                     <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                            <p className="font-medium text-green-700 dark:text-green-400">All caught up!</p>
                            <p className="text-sm text-green-600/80 dark:text-green-400/80">No pending complaints</p>
                        </div>
                    </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, description, highlight }: any) {
  return (
    <Card className={highlight ? "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? "text-red-500" : "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[300px] rounded-xl" />
        <Skeleton className="col-span-3 h-[300px] rounded-xl" />
      </div>
    </div>
  );
}
