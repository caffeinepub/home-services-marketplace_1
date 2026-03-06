import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Moon,
  Sun,
  Sunset,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Service } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateBooking } from "../hooks/useQueries";

const TIME_SLOTS = [
  {
    value: "morning",
    label: "Morning",
    range: "9 AM – 12 PM",
    icon: Sun,
    color: "oklch(0.75 0.17 80)",
  },
  {
    value: "afternoon",
    label: "Afternoon",
    range: "12 PM – 5 PM",
    icon: Sunset,
    color: "oklch(0.65 0.18 50)",
  },
  {
    value: "evening",
    label: "Evening",
    range: "5 PM – 9 PM",
    icon: Moon,
    color: "oklch(0.55 0.15 260)",
  },
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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const resetForm = () => {
    setSelectedDate(undefined);
    setTimeSlot("");
    setAddress("");
    setErrors({});
    setCalendarOpen(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedDate) newErrors.date = "Please select a date";
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

    const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

    try {
      await createBooking.mutateAsync({
        serviceId: service.id,
        date: dateStr,
        timeSlot,
        address: address.trim(),
      });
      const slotLabel =
        TIME_SLOTS.find((s) => s.value === timeSlot)?.label ?? timeSlot;
      toast.success("Booking confirmed! We'll notify you shortly.", {
        description: `${service.name} on ${dateStr} (${slotLabel})`,
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
              · ₹{Number(service.minPrice).toLocaleString("en-IN")} – ₹
              {Number(service.maxPrice).toLocaleString("en-IN")}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date — Calendar Popover */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-primary" />
              Date
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  data-ocid="booking.date_input"
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md border bg-background text-sm transition-colors",
                    "hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    errors.date ? "border-destructive" : "border-input",
                    !selectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setCalendarOpen(false);
                    setErrors((prev) => ({ ...prev, date: "" }));
                  }}
                  disabled={(date) => date < today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Time Slot — Radio Cards */}
          <div className="space-y-1.5" data-ocid="booking.timeslot_select">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Time Slot
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const SlotIcon = slot.icon;
                const isSelected = timeSlot === slot.value;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => {
                      setTimeSlot(slot.value);
                      setErrors((prev) => ({ ...prev, timeSlot: "" }));
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : errors.timeSlot
                          ? "border-destructive/60 hover:border-primary/40"
                          : "border-border hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: isSelected
                          ? `${slot.color.replace(")", " / 0.15)").replace("oklch(", "oklch(")}`
                          : "oklch(0.94 0.01 240)",
                      }}
                    >
                      <SlotIcon
                        className="w-4 h-4"
                        style={{
                          color: isSelected
                            ? slot.color
                            : "oklch(0.48 0.015 250)",
                        }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isSelected ? "text-primary" : "text-foreground",
                      )}
                    >
                      {slot.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {slot.range}
                    </span>
                  </button>
                );
              })}
            </div>
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
