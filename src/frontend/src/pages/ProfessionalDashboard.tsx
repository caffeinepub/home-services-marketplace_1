import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  PackageOpen,
  Play,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { type Booking, BookingStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  shortenPrincipal,
  useAssignedBookings,
  useListServices,
  useUpdateBookingStatus,
  useUserProfile,
} from "../hooks/useQueries";

function JobCard({
  booking,
  serviceName,
  index,
}: {
  booking: Booking;
  serviceName: string;
  index: number;
}) {
  const updateStatus = useUpdateBookingStatus();

  const timeSlotLabel: Record<string, string> = {
    morning: "Morning (9 AM – 12 PM)",
    afternoon: "Afternoon (12 PM – 5 PM)",
    evening: "Evening (5 PM – 9 PM)",
  };

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

  const isUpdating = updateStatus.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-xl p-5"
      data-ocid={`professional.job.item.${index + 1}`}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-base text-foreground">
              {serviceName}
            </h3>
            <StatusBadge status={booking.status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-primary" />
              {booking.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {timeSlotLabel[booking.timeSlot] ?? booking.timeSlot}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="truncate max-w-48">{booking.address}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              {shortenPrincipal(booking.customer.toString())}
            </span>
          </div>
        </div>

        {/* Status actions */}
        <div className="flex gap-2 shrink-0">
          {booking.status === BookingStatus.confirmed && (
            <Button
              size="sm"
              data-ocid={`professional.status_button.${index + 1}`}
              onClick={() => void handleStartJob()}
              disabled={isUpdating}
              className="gap-1.5 shadow-primary"
              style={{ background: "oklch(0.55 0.18 290)", color: "white" }}
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Start Job
            </Button>
          )}
          {booking.status === BookingStatus.inProgress && (
            <Button
              size="sm"
              data-ocid={`professional.status_button.${index + 1}`}
              onClick={() => void handleCompleteJob()}
              disabled={isUpdating}
              className="gap-1.5"
              style={{ background: "oklch(0.55 0.16 145)", color: "white" }}
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </motion.div>
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

  const displayName = userProfile?.professional?.displayName ?? "Professional";

  const getServiceName = (serviceId: bigint): string => {
    const service = services?.find((s) => s.id === serviceId);
    return service?.name ?? `Service #${serviceId}`;
  };

  const activeJobs =
    bookings?.filter((b) =>
      [
        BookingStatus.confirmed,
        BookingStatus.inProgress,
        BookingStatus.pending,
      ].includes(b.status),
    ) ?? [];

  const completedJobs =
    bookings?.filter((b) =>
      [BookingStatus.completed, BookingStatus.cancelled].includes(b.status),
    ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-foreground">
                  {displayName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Professional Dashboard
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
                  {activeJobs.length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="font-display font-black text-2xl text-foreground">
                  {completedJobs.length}
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
            {/* Active Jobs */}
            <section>
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Active Jobs
              </h2>
              <div className="space-y-4" data-ocid="professional.jobs_list">
                {activeJobs.length === 0 ? (
                  <div
                    className="flex flex-col items-center gap-4 py-12 text-center bg-card border border-border rounded-xl"
                    data-ocid="professional.jobs.empty_state"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                      <PackageOpen className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-base text-foreground">
                        No active jobs
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Jobs assigned to you will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  activeJobs.map((job, i) => (
                    <JobCard
                      key={job.id.toString()}
                      booking={job}
                      serviceName={getServiceName(job.serviceId)}
                      index={i}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success inline-block" />
                  Completed Jobs
                </h2>
                <div className="space-y-4">
                  {completedJobs.map((job, i) => (
                    <JobCard
                      key={job.id.toString()}
                      booking={job}
                      serviceName={getServiceName(job.serviceId)}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
