import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  MessageCircle,
  PackageOpen,
  Play,
  User,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Booking, BookingStatus } from "../backend.d";
import { ChatDialog } from "../components/ChatDialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  shortenPrincipal,
  useAssignedBookings,
  useListServices,
  useUpdateBookingStatus,
  useUserProfile,
} from "../hooks/useQueries";

const timeSlotLabel: Record<string, string> = {
  morning: "9 AM – 12 PM",
  afternoon: "12 PM – 5 PM",
  evening: "5 PM – 9 PM",
};

interface KanbanJobCardProps {
  booking: Booking;
  serviceName: string;
  index: number;
  column: "new" | "inProgress" | "completed";
}

function KanbanJobCard({
  booking,
  serviceName,
  index,
  column,
}: KanbanJobCardProps) {
  const updateStatus = useUpdateBookingStatus();
  const isUpdating = updateStatus.isPending;
  const [chatOpen, setChatOpen] = useState(false);

  const canChat = [
    BookingStatus.confirmed,
    BookingStatus.inProgress,
    BookingStatus.completed,
  ].includes(booking.status);

  const handleStartJob = async () => {
    try {
      await updateStatus.mutateAsync({
        bookingId: booking.id,
        status: BookingStatus.inProgress,
      });
      toast.success("Job started! Get to work.");
    } catch {
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleCompleteJob = async () => {
    try {
      await updateStatus.mutateAsync({
        bookingId: booking.id,
        status: BookingStatus.completed,
      });
      toast.success("Job marked as complete. Great work!");
    } catch {
      toast.error("Failed to update status. Please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-background border border-border rounded-xl p-4 space-y-3 shadow-xs"
        data-ocid={`professional.kanban.${column}.item.${index + 1}`}
      >
        {/* Service name + status badge */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display font-bold text-sm text-foreground leading-tight">
            {serviceName}
          </h4>
          {booking.status === BookingStatus.pending && (
            <Badge
              variant="secondary"
              className="text-xs shrink-0 bg-warning/15 text-warning-foreground border-warning/30"
            >
              Pending
            </Badge>
          )}
          {booking.status === BookingStatus.confirmed && (
            <Badge
              variant="secondary"
              className="text-xs shrink-0 bg-blue-50 text-blue-700 border-blue-200"
            >
              Confirmed
            </Badge>
          )}
          {booking.status === BookingStatus.inProgress && (
            <Badge
              variant="secondary"
              className="text-xs shrink-0 bg-amber-50 text-amber-700 border-amber-200"
            >
              In Progress
            </Badge>
          )}
          {booking.status === BookingStatus.completed && (
            <Badge
              variant="secondary"
              className="text-xs shrink-0 bg-success/10 text-success border-success/20"
            >
              Done
            </Badge>
          )}
        </div>

        {/* Meta info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3 h-3 shrink-0" />
            <span className="font-mono truncate">
              {shortenPrincipal(booking.customer.toString())}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3 h-3 shrink-0" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{timeSlotLabel[booking.timeSlot] ?? booking.timeSlot}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {booking.status === BookingStatus.confirmed && (
            <Button
              size="sm"
              className="w-full gap-1.5 text-xs"
              data-ocid={`professional.kanban.new_orders.start_button.${index + 1}`}
              onClick={() => void handleStartJob()}
              disabled={isUpdating}
              style={{ background: "oklch(0.55 0.18 220)", color: "white" }}
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              Start Job
            </Button>
          )}
          {booking.status === BookingStatus.inProgress && (
            <Button
              size="sm"
              className="w-full gap-1.5 text-xs"
              data-ocid={`professional.kanban.in_progress.complete_button.${index + 1}`}
              onClick={() => void handleCompleteJob()}
              disabled={isUpdating}
              style={{ background: "oklch(0.55 0.16 145)", color: "white" }}
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              Mark Complete
            </Button>
          )}
          {booking.status === BookingStatus.pending && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              <Clock className="w-3 h-3 shrink-0" />
              Pending Assignment
            </div>
          )}

          {/* Chat with Customer */}
          {canChat && (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 text-xs text-primary border-primary/30 hover:border-primary hover:bg-primary/5"
              data-ocid={`professional.chat_button.${index + 1}`}
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="w-3 h-3" />
              Chat with Customer
            </Button>
          )}
        </div>
      </motion.div>

      {/* Chat Dialog */}
      {canChat && (
        <ChatDialog
          bookingId={booking.id}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUserRole="professional"
        />
      )}
    </>
  );
}

interface KanbanColumnProps {
  title: string;
  count: number;
  accentColor: string;
  dotColor: string;
  bookings: Booking[];
  column: "new" | "inProgress" | "completed";
  getServiceName: (id: bigint) => string;
  ocid: string;
}

function KanbanColumn({
  title,
  count,
  accentColor,
  dotColor,
  bookings,
  column,
  getServiceName,
  ocid,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-3 min-h-0" data-ocid={ocid}>
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
        style={{
          backgroundColor: accentColor,
          borderColor: accentColor.replace("0.92", "0.82"),
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <span className="font-display font-bold text-sm text-foreground">
            {title}
          </span>
        </div>
        <Badge variant="secondary" className="text-xs font-mono font-bold">
          {count}
        </Badge>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center bg-card border border-dashed border-border rounded-xl">
            <PackageOpen className="w-6 h-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">No jobs here</p>
          </div>
        ) : (
          bookings.map((booking, i) => (
            <KanbanJobCard
              key={booking.id.toString()}
              booking={booking}
              serviceName={getServiceName(booking.serviceId)}
              index={i}
              column={column}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function ProfessionalDashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const { data: bookings, isLoading, isError } = useAssignedBookings();
  const { data: services } = useListServices();

  if (!identity) {
    void navigate({ to: "/" });
    return null;
  }

  const displayName = userProfile?.professional?.displayName ?? "Technician";

  const getServiceName = (serviceId: bigint): string => {
    const service = services?.find((s) => s.id === serviceId);
    return service?.name ?? `Service #${serviceId}`;
  };

  const getServiceMaxPrice = (serviceId: bigint): number => {
    const service = services?.find((s) => s.id === serviceId);
    return service ? Number(service.maxPrice) : 0;
  };

  // Kanban columns
  const newOrdersBookings =
    bookings?.filter((b) =>
      [BookingStatus.pending, BookingStatus.confirmed].includes(b.status),
    ) ?? [];

  const inProgressBookings =
    bookings?.filter((b) => b.status === BookingStatus.inProgress) ?? [];

  const completedBookings =
    bookings?.filter((b) => b.status === BookingStatus.completed) ?? [];

  // Earnings analytics
  const activeJobsCount =
    bookings?.filter((b) =>
      [
        BookingStatus.pending,
        BookingStatus.confirmed,
        BookingStatus.inProgress,
      ].includes(b.status),
    ).length ?? 0;

  const completedJobsCount = completedBookings.length;

  const estEarnings = completedBookings.reduce((sum, booking) => {
    return sum + getServiceMaxPrice(booking.serviceId);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wrench className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-foreground">
                  {displayName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Technician Dashboard
                  {userProfile?.professional?.category && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {userProfile.professional.category}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="font-display font-black text-2xl text-primary">
                  {activeJobsCount}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="font-display font-black text-2xl text-foreground">
                  {completedJobsCount}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Loading */}
        {isLoading && (
          <div
            className="space-y-4"
            data-ocid="professional.jobs.loading_state"
          >
            <div className="grid grid-cols-3 gap-4">
              {["sk1", "sk2", "sk3"].map((id) => (
                <div
                  key={id}
                  className="bg-card border border-border rounded-xl p-5 space-y-2"
                >
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div
            className="flex flex-col items-center gap-3 py-16 text-center"
            data-ocid="professional.jobs.error_state"
          >
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-muted-foreground">
              Failed to load your jobs. Please refresh the page.
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* ─── Earnings Analytics Panel ─── */}
            <section data-ocid="professional.earnings.panel">
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-foreground">
                      {activeJobsCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Jobs
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-foreground">
                      {completedJobsCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed Jobs
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-foreground">
                      ₹{estEarnings.toLocaleString("en-IN")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Est. Earnings
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ─── Kanban Board ─── */}
            <section>
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Job Board
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KanbanColumn
                  title="New Orders"
                  count={newOrdersBookings.length}
                  accentColor="oklch(0.94 0.04 220)"
                  dotColor="oklch(0.55 0.18 220)"
                  bookings={newOrdersBookings}
                  column="new"
                  getServiceName={getServiceName}
                  ocid="professional.kanban.new_orders"
                />
                <KanbanColumn
                  title="In Progress"
                  count={inProgressBookings.length}
                  accentColor="oklch(0.95 0.05 65)"
                  dotColor="oklch(0.65 0.18 65)"
                  bookings={inProgressBookings}
                  column="inProgress"
                  getServiceName={getServiceName}
                  ocid="professional.kanban.in_progress"
                />
                <KanbanColumn
                  title="Completed"
                  count={completedBookings.length}
                  accentColor="oklch(0.94 0.04 145)"
                  dotColor="oklch(0.55 0.16 145)"
                  bookings={completedBookings}
                  column="completed"
                  getServiceName={getServiceName}
                  ocid="professional.kanban.completed"
                />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
