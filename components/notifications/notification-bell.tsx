"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, ExternalLink, Inbox, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Notification } from "@prisma/client";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json() as Promise<{
        notifications: Notification[];
        unreadCount: number;
      }>;
    },
    refetchInterval: 30000, // Minimal polling (30s)
  });

  // Mark all as read mutation
  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark single as read mutation
  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Delete all notifications mutation
  const deleteAll = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete notifications");
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], { notifications: [], unreadCount: 0, totalCount: 0 });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className={cn("h-5 w-5", unreadCount > 0 && "animate-pulse text-primary")} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold border-2 border-background"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0 mr-4 shadow-2xl border-primary/10 rounded-xl" align="end">
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-t-xl">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-sm uppercase tracking-widest text-primary">Notifications</h3>
            {unreadCount > 0 && <Badge variant="outline" className="text-[10px] bg-white border-primary/20 text-primary">{unreadCount} New</Badge>}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => {
                  if (confirm("Are you sure you want to clear all notifications?")) {
                    deleteAll.mutate();
                  }
                }}
                disabled={deleteAll.isPending}
                title="Clear all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Separator className="bg-primary/5" />

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex flex-col gap-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
               <div className="p-3 bg-muted/30 rounded-full">
                  <Inbox className="h-8 w-8 text-muted-foreground/40" />
               </div>
               <div>
                  <p className="text-sm font-bold text-muted-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground/60">No new notifications at the moment.</p>
               </div>
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 flex flex-col gap-1 transition-colors relative group",
                    !notification.isRead ? "bg-primary/[0.02]" : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className={cn(
                        "text-sm font-bold leading-tight",
                        !notification.isRead ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                       <button
                         onClick={() => markRead.mutate(notification.id)}
                         className="p-1.5 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                         title="Mark as read"
                       >
                         <Check className="h-3 w-3" />
                       </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-medium text-muted-foreground/60">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        onClick={() => {
                          setIsOpen(false);
                          if (!notification.isRead) markRead.mutate(notification.id);
                        }}
                        className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline underline-offset-4"
                      >
                        View Details
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
           <div className="p-3 bg-muted/10 border-t border-primary/5 text-center">
              <Link
                href="/customer/notifications"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                See all activity
              </Link>
           </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
