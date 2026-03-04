import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  PackageOpen,
  PlusCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Booking, BookingStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCancelBooking,
  useListServices,
  useMyBookings,
} from "../hooks/useQueries";

function BookingCard({
  booking,
  serviceName,
  index,
}: {
  booking: Booking;
  serviceName: string;
  index: number;
}) {
  const cancelBooking = useCancelBooking();
  const canCancel = booking.status === BookingStatus.pending;

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync(booking.id);
      toast.success("Booking cancelled successfully.");
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
    }
  };

  const timeSlotLabel: Record<string, string> = {
    morning: "Morning (9 AM – 12 PM)",
    afternoon: "Afternoon (12 PM – 5 PM)",
    evening: "Evening (5 PM – 9 PM)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center"
      data-ocid={`customer.booking.item.${index + 1}`}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base text-foreground">
            {serviceName}
          </h3>
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
        </div>
      </div>

      {canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              data-ocid={`customer.cancel_button.${index + 1}`}
              className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/5 shrink-0"
            >
              Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">
                Cancel Booking?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your{" "}
                <strong>{serviceName}</strong> booking on {booking.date}? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="customer.cancel_dialog.cancel_button">
                Keep Booking
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="customer.cancel_dialog.confirm_button"
                onClick={() => void handleCancel()}
                disabled={cancelBooking.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {cancelBooking.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </motion.div>
  );
}

export function CustomerDashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: bookings, isLoading, isError } = useMyBookings();
  const { data: services } = useListServices();

  if (!identity) {
    void navigate({ to: "/" });
    return null;
  }

  const getServiceName = (serviceId: bigint): string => {
    const service = services?.find((s) => s.id === serviceId);
    return service?.name ?? `Service #${serviceId}`;
  };

  const principal = identity.getPrincipal().toString();

  const upcomingStatuses = [
    BookingStatus.pending,
    BookingStatus.confirmed,
    BookingStatus.inProgress,
  ];
  const pastStatuses = [BookingStatus.completed, BookingStatus.cancelled];

  const upcomingBookings =
    bookings?.filter((b) => upcomingStatuses.includes(b.status)) ?? [];
  const pastBookings =
    bookings?.filter((b) => pastStatuses.includes(b.status)) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-black text-foreground">
                My Bookings
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                {principal.slice(0, 10)}...
              </p>
            </div>
            <Button
              onClick={() => void navigate({ to: "/services" })}
              className="gap-2 shadow-primary"
              data-ocid="customer.browse_services_button"
            >
              <PlusCircle className="w-4 h-4" />
              Book a Service
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading */}
        {isLoading && (
          <div
            className="space-y-4"
            data-ocid="customer.bookings.loading_state"
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
            data-ocid="customer.bookings.error_state"
          >
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-muted-foreground">
              Failed to load your bookings. Please refresh the page.
            </p>
          </div>
        )}

        {/* Tabs */}
        {!isLoading && !isError && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="mb-6 bg-secondary rounded-xl"
              data-ocid="customer.tab"
            >
              <TabsTrigger value="upcoming" className="rounded-lg">
                Upcoming
                {upcomingBookings.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full font-bold">
                    {upcomingBookings.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg">
                Past
                {pastBookings.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full font-bold">
                    {pastBookings.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="space-y-4" data-ocid="customer.bookings_list">
                {upcomingBookings.length === 0 ? (
                  <div
                    className="flex flex-col items-center gap-4 py-16 text-center"
                    data-ocid="customer.bookings.empty_state"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <PackageOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-lg text-foreground">
                        No upcoming bookings
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Browse our services to book your first appointment
                      </p>
                    </div>
                    <Button
                      onClick={() => void navigate({ to: "/services" })}
                      className="gap-2 shadow-primary"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Browse Services
                    </Button>
                  </div>
                ) : (
                  upcomingBookings.map((booking, i) => (
                    <BookingCard
                      key={booking.id.toString()}
                      booking={booking}
                      serviceName={getServiceName(booking.serviceId)}
                      index={i}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="past">
              <div className="space-y-4">
                {pastBookings.length === 0 ? (
                  <div
                    className="flex flex-col items-center gap-4 py-16 text-center"
                    data-ocid="customer.past_bookings.empty_state"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <PackageOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-display font-bold text-lg text-foreground">
                      No past bookings yet
                    </p>
                  </div>
                ) : (
                  pastBookings.map((booking, i) => (
                    <BookingCard
                      key={booking.id.toString()}
                      booking={booking}
                      serviceName={getServiceName(booking.serviceId)}
                      index={i}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
