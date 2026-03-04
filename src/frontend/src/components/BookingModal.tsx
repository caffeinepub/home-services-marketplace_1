import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, Clock, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Service } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateBooking } from "../hooks/useQueries";

const TIME_SLOTS = [
  { value: "morning", label: "Morning (9 AM – 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM – 5 PM)" },
  { value: "evening", label: "Evening (5 PM – 9 PM)" },
];

interface BookingModalProps {
  service: Service | null;
  open: boolean;
  onClose: () => void;
}

export function BookingModal({ service, open, onClose }: BookingModalProps) {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setDate("");
    setTimeSlot("");
    setAddress("");
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = "Please select a date";
    if (!timeSlot) newErrors.timeSlot = "Please select a time slot";
    if (!address.trim()) newErrors.address = "Please enter your address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!identity) {
      toast.error("Please sign in to book a service");
      void navigate({ to: "/post-login" });
      onClose();
      return;
    }

    if (!service) return;
    if (!validate()) return;

    try {
      await createBooking.mutateAsync({
        serviceId: service.id,
        date,
        timeSlot,
        address: address.trim(),
      });
      toast.success("Booking confirmed! We'll notify you shortly.", {
        description: `${service.name} on ${date} (${TIME_SLOTS.find((s) => s.value === timeSlot)?.label})`,
      });
      resetForm();
      onClose();
    } catch {
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="booking.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Book Service
          </DialogTitle>
          {service && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">
                {service.name}
              </span>{" "}
              · ${Number(service.minPrice)} – ${Number(service.maxPrice)}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor="booking-date"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <CalendarDays className="w-3.5 h-3.5 text-primary" />
              Date
            </Label>
            <Input
              id="booking-date"
              type="date"
              data-ocid="booking.date_input"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: "" }));
              }}
              min={new Date().toISOString().split("T")[0]}
              className={errors.date ? "border-destructive" : ""}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Time Slot */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Time Slot
            </Label>
            <Select
              value={timeSlot}
              onValueChange={(v) => {
                setTimeSlot(v);
                setErrors((prev) => ({ ...prev, timeSlot: "" }));
              }}
            >
              <SelectTrigger
                data-ocid="booking.timeslot_select"
                className={errors.timeSlot ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timeSlot && (
              <p className="text-xs text-destructive">{errors.timeSlot}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label
              htmlFor="booking-address"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Service Address
            </Label>
            <Input
              id="booking-address"
              type="text"
              data-ocid="booking.address_input"
              placeholder="123 Main Street, City, State"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((prev) => ({ ...prev, address: "" }));
              }}
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            data-ocid="booking.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={createBooking.isPending}
            data-ocid="booking.submit_button"
            className="shadow-primary"
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
