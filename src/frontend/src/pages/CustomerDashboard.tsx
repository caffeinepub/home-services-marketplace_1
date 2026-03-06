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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarDays,
  Clock,
  Download,
  Loader2,
  MapPin,
  MessageCircle,
  PackageOpen,
  PlusCircle,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Booking, BookingStatus, type Service } from "../backend.d";
import { ChatDialog } from "../components/ChatDialog";
import { StatusBadge } from "../components/StatusBadge";
import { useBranding } from "../contexts/BrandingContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCancelBooking,
  useListServices,
  useMyBookings,
  useUserProfile,
} from "../hooks/useQueries";
import { generateInvoice } from "../utils/generateInvoice";

// ─── Review Types & Helpers ────────────────────────────────────────────────────
interface StoredReview {
  bookingId: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

function getStoredReview(bookingId: bigint): StoredReview | null {
  try {
    const raw = localStorage.getItem(`lepzo_review_${bookingId}`);
    if (!raw) return null;
    return JSON.parse(raw) as StoredReview;
  } catch {
    return null;
  }
}

function saveReview(
  bookingId: bigint,
  rating: number,
  comment: string,
): StoredReview {
  const review: StoredReview = {
    bookingId: bookingId.toString(),
    rating,
    comment,
    submittedAt: new Date().toISOString(),
  };
  localStorage.setItem(`lepzo_review_${bookingId}`, JSON.stringify(review));
  return review;
}

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = readonly ? star <= value : star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Rate Service Dialog ──────────────────────────────────────────────────────
interface RateServiceDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: bigint;
  serviceName: string;
  onSubmit: (review: StoredReview) => void;
}

function RateServiceDialog({
  open,
  onClose,
  bookingId,
  serviceName,
  onSubmit,
}: RateServiceDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Simulate slight delay for UX
      await new Promise((resolve) => setTimeout(resolve, 300));
      const review = saveReview(bookingId, rating, comment.trim());
      toast.success("Thank you for your review!");
      onSubmit(review);
      onClose();
    } catch {
      toast.error("Failed to save review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="customer.review_dialog.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            Rate Your Service
          </DialogTitle>
          <DialogDescription>
            Share your experience with{" "}
            <strong className="text-foreground">{serviceName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating</Label>
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-muted-foreground">
                {
                  [
                    "",
                    "Poor — needs improvement",
                    "Fair — below expectations",
                    "Good — meets expectations",
                    "Very Good — exceeded expectations",
                    "Excellent — outstanding service!",
                  ][rating]
                }
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">
              Comment{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Tell us about your experience — what went well or what could be improved..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
              data-ocid="customer.review_dialog.textarea"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="customer.review_dialog.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || rating === 0}
            data-ocid="customer.review_dialog.submit_button"
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className="h-4 w-4 fill-current" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inline Review Display ────────────────────────────────────────────────────
function InlineReview({ review }: { review: StoredReview }) {
  return (
    <div className="mt-3 pt-3 border-t border-border/50 flex items-start gap-2">
      <div className="flex items-center gap-1 shrink-0">
        <StarRating value={review.rating} readonly />
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground italic line-clamp-2">
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  service,
  index,
  showReview = false,
}: {
  booking: Booking;
  service: Service | undefined;
  index: number;
  showReview?: boolean;
}) {
  const cancelBooking = useCancelBooking();
  const { branding } = useBranding();
  const { data: userProfile } = useUserProfile();

  const [chatOpen, setChatOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [storedReview, setStoredReview] = useState<StoredReview | null>(() =>
    getStoredReview(booking.id),
  );

  const serviceName = service?.name ?? `Service #${booking.serviceId}`;

  const canCancel = booking.status === BookingStatus.pending;
  const canChat = [
    BookingStatus.confirmed,
    BookingStatus.inProgress,
    BookingStatus.completed,
  ].includes(booking.status);
  const canInvoice = booking.status === BookingStatus.completed;
  const canReview =
    showReview && booking.status === BookingStatus.completed && !storedReview;
  const hasReview = showReview && !!storedReview;

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync(booking.id);
      toast.success("Booking cancelled successfully.");
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
    }
  };

  const handleInvoice = () => {
    if (!service) {
      toast.error("Service details not available. Please try again.");
      return;
    }
    const mobileNumber = userProfile?.mobileNumber;
    generateInvoice(booking, service, branding, mobileNumber);
  };

  const timeSlotLabel: Record<string, string> = {
    morning: "Morning (9 AM – 12 PM)",
    afternoon: "Afternoon (12 PM – 5 PM)",
    evening: "Evening (5 PM – 9 PM)",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="bg-card border border-border rounded-xl p-5"
        data-ocid={`customer.booking.item.${index + 1}`}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
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

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {/* Chat button */}
            {canChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatOpen(true)}
                data-ocid={`customer.chat_button.${index + 1}`}
                className="gap-1.5 text-primary border-primary/30 hover:border-primary hover:bg-primary/5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </Button>
            )}

            {/* Invoice button */}
            {canInvoice && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInvoice}
                data-ocid={`customer.invoice_button.${index + 1}`}
                className="gap-1.5 text-success border-success/30 hover:border-success hover:bg-success/5"
              >
                <Download className="w-3.5 h-3.5" />
                Invoice
              </Button>
            )}

            {/* Rate Service button */}
            {canReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewOpen(true)}
                data-ocid={`customer.rate_button.${index + 1}`}
                className="gap-1.5 text-amber-600 border-amber-300 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10"
              >
                <Star className="w-3.5 h-3.5" />
                Rate Service
              </Button>
            )}

            {/* Cancel button */}
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
                      <strong>{serviceName}</strong> booking on {booking.date}?
                      This action cannot be undone.
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
          </div>
        </div>

        {/* Inline Review Display */}
        {hasReview && storedReview && <InlineReview review={storedReview} />}
      </motion.div>

      {/* Chat Dialog */}
      {canChat && (
        <ChatDialog
          bookingId={booking.id}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUserRole="customer"
        />
      )}

      {/* Rate Service Dialog */}
      <RateServiceDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        bookingId={booking.id}
        serviceName={serviceName}
        onSubmit={(review) => setStoredReview(review)}
      />
    </>
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

  const getService = (serviceId: bigint): Service | undefined => {
    return services?.find((s) => s.id === serviceId);
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
                      service={getService(booking.serviceId)}
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
                      service={getService(booking.serviceId)}
                      index={i}
                      showReview={true}
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
