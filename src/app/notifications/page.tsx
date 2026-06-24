"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-info" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning" />,
  success: <CheckCircle2 className="w-4 h-4 text-success" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifs = () =>
    fetch("/api/notifications").then((r) => r.json()).then((d) => setNotifications(d.notifications || []));

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
    fetchNotifs();
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    toast.success("All notifications marked as read");
    fetchNotifs();
  };

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unread.length > 0 ? `${unread.length} unread notification${unread.length !== 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notifications yet</p>
          </div>
        ) : notifications.map((n) => (
          <div
            key={n.id}
            className={`glass-card rounded-xl p-4 flex items-start gap-4 transition-colors ${!n.isRead ? "border-primary/30 bg-primary/5" : ""}`}
          >
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              {typeIcons[n.type] || <Bell className="w-4 h-4 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-medium ${!n.isRead ? "text-foreground" : "text-foreground/80"}`}>{n.title}</p>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            {!n.isRead && (
              <Button variant="ghost" size="sm" onClick={() => markRead(n.id)} className="flex-shrink-0 text-xs">
                Mark Read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
