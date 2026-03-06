import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { useState } from "react";
import type { Booking } from "../backend.d";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNotifications } from "../hooks/useNotifications";
import {
  useAssignedBookings,
  useMyBookings,
  useUserProfile,
} from "../hooks/useQueries";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationBell() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useUserProfile();
  const { data: myBookings } = useMyBookings();
  const { data: assignedBookings } = useAssignedBookings();
  const [open, setOpen] = useState(false);

  const principal = identity?.getPrincipal().toString();

  // Decide which bookings to track based on role
  const role = userProfile?.role;
  let bookingsForNotif: Booking[] | undefined;
  if (role === UserRole.user) {
    bookingsForNotif = myBookings;
  } else if (userProfile?.professional) {
    bookingsForNotif = assignedBookings;
  }

  const { notifications, unreadCount, markAllRead } = useNotifications(
    principal,
    bookingsForNotif,
  );

  // Don't render for guests or unauthenticated users
  if (!identity || role === UserRole.guest || !role) return null;

  const recentNotifs = notifications.slice(0, 10);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      // Mark all as read when opening
      markAllRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-ocid="navbar.notification_bell"
          className="relative p-2 h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 leading-none"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 shadow-lg"
        data-ocid="navbar.notifications.panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            data-ocid="navbar.notifications.mark_all_button"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={markAllRead}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </Button>
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-72">
          {recentNotifs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4"
              data-ocid="navbar.notifications.empty_state"
            >
              <BellOff className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                Booking updates will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentNotifs.map((notif, idx) => (
                <div
                  key={notif.id}
                  data-ocid={`navbar.notifications.item.${idx + 1}`}
                  className={`px-4 py-3 flex items-start gap-3 transition-colors ${
                    !notif.read ? "bg-primary/5" : "hover:bg-secondary/30"
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    {!notif.read ? (
                      <span className="block w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatRelativeTime(notif.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
