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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Principal } from "@dfinity/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  CalendarCheck,
  CheckSquare,
  CreditCard,
  Database,
  DollarSign,
  Info,
  Loader2,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Booking,
  BookingStatus,
  type Service,
  ServiceCategory,
  UserRole,
} from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  formatPriceRange,
  getCategoryLabel,
  getStatusLabel,
  shortenPrincipal,
  useAddService,
  useAdminRemoveUser,
  useAdminUpdateBookingStatus,
  useAllBookings,
  useAllCustomers,
  useAssignBookingToProfessional,
  useListProfessionals,
  useListServices,
  usePlatformStats,
  useRemoveService,
  useUpdateService,
} from "../hooks/useQueries";
import { BrandingManager } from "./BrandingManager";
import { DatabaseSchema } from "./DatabaseSchema";
import { PaymentsSection } from "./PaymentsSection";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  ServiceCategory.laptopRepair,
  ServiceCategory.desktopRepair,
  ServiceCategory.computerSales,
  ServiceCategory.accessoriesSales,
  ServiceCategory.networkSetup,
  ServiceCategory.dataRecovery,
];

const ALL_STATUSES = [
  BookingStatus.pending,
  BookingStatus.confirmed,
  BookingStatus.inProgress,
  BookingStatus.completed,
  BookingStatus.cancelled,
];

// ─── Types ─────────────────────────────────────────────────────────────────────
type AdminSection =
  | "overview"
  | "services"
  | "bookings"
  | "payments"
  | "users"
  | "technicians"
  | "branding"
  | "database"
  | "admins";

type ServiceFormData = {
  name: string;
  description: string;
  category: ServiceCategory | "";
  minPrice: string;
  maxPrice: string;
};

const EMPTY_FORM: ServiceFormData = {
  name: "",
  description: "",
  category: "",
  minPrice: "",
  maxPrice: "",
};

type BookingFilter =
  | "all"
  | BookingStatus.pending
  | BookingStatus.confirmed
  | BookingStatus.inProgress
  | BookingStatus.completed
  | BookingStatus.cancelled;

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BookingStatus }) {
  const statusStyles: Record<BookingStatus, string> = {
    [BookingStatus.pending]:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    [BookingStatus.confirmed]:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    [BookingStatus.inProgress]:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
    [BookingStatus.completed]:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
    [BookingStatus.cancelled]:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] ?? ""}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

// ─── Status Dot ────────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: BookingStatus }) {
  const colors: Record<BookingStatus, string> = {
    [BookingStatus.pending]: "bg-amber-500",
    [BookingStatus.confirmed]: "bg-blue-500",
    [BookingStatus.inProgress]: "bg-orange-500",
    [BookingStatus.completed]: "bg-green-500",
    [BookingStatus.cancelled]: "bg-red-400",
  };
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[status] ?? "bg-gray-400"}`}
    />
  );
}

// ─── Service Form Modal ────────────────────────────────────────────────────────
interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  editingService: Service | null;
}

function ServiceFormModal({
  open,
  onClose,
  editingService,
}: ServiceFormModalProps) {
  const addService = useAddService();
  const updateService = useUpdateService();
  const isEditing = !!editingService;

  const [form, setForm] = useState<ServiceFormData>(
    editingService
      ? {
          name: editingService.name,
          description: editingService.description,
          category: editingService.category,
          minPrice: String(Number(editingService.minPrice)),
          maxPrice: String(Number(editingService.maxPrice)),
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.category) newErrors.category = "Category is required";
    if (
      !form.minPrice ||
      Number.isNaN(Number(form.minPrice)) ||
      Number(form.minPrice) < 0
    )
      newErrors.minPrice = "Valid minimum price required";
    if (
      !form.maxPrice ||
      Number.isNaN(Number(form.maxPrice)) ||
      Number(form.maxPrice) < 0
    )
      newErrors.maxPrice = "Valid maximum price required";
    if (Number(form.minPrice) > Number(form.maxPrice))
      newErrors.maxPrice = "Max price must be ≥ min price";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEditing && editingService) {
        await updateService.mutateAsync({
          serviceId: editingService.id,
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category as ServiceCategory,
          minPrice: BigInt(Math.round(Number(form.minPrice))),
          maxPrice: BigInt(Math.round(Number(form.maxPrice))),
        });
        toast.success(`Service "${form.name}" updated successfully.`);
      } else {
        await addService.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category as ServiceCategory,
          minPrice: BigInt(Math.round(Number(form.minPrice))),
          maxPrice: BigInt(Math.round(Number(form.maxPrice))),
        });
        toast.success(`Service "${form.name}" added successfully.`);
      }
      onClose();
    } catch {
      toast.error(
        isEditing ? "Failed to update service." : "Failed to add service.",
      );
    }
  };

  const isPending = addService.isPending || updateService.isPending;
  const field = (key: keyof ServiceFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Service" : "Add New Service"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="service-name">Service Name</Label>
            <Input
              id="service-name"
              placeholder="e.g. Laptop Screen Replacement"
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
              className={errors.name ? "border-destructive" : ""}
              data-ocid="admin.service_form.input"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-description">Description</Label>
            <textarea
              id="service-description"
              placeholder="Describe what this service includes..."
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              rows={3}
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${errors.description ? "border-destructive" : "border-input"}`}
              data-ocid="admin.service_form.textarea"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => field("category", v)}
            >
              <SelectTrigger
                className={errors.category ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="min-price">Min Price (₹)</Label>
              <Input
                id="min-price"
                type="number"
                min="0"
                placeholder="50"
                value={form.minPrice}
                onChange={(e) => field("minPrice", e.target.value)}
                className={errors.minPrice ? "border-destructive" : ""}
              />
              {errors.minPrice && (
                <p className="text-xs text-destructive">{errors.minPrice}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-price">Max Price (₹)</Label>
              <Input
                id="max-price"
                type="number"
                min="0"
                placeholder="200"
                value={form.maxPrice}
                onChange={(e) => field("maxPrice", e.target.value)}
                className={errors.maxPrice ? "border-destructive" : ""}
              />
              {errors.maxPrice && (
                <p className="text-xs text-destructive">{errors.maxPrice}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isPending}
            className="gap-2 shadow-primary"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isPending
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Technician Dialog ──────────────────────────────────────────────────
interface AssignDialogProps {
  booking: Booking | null;
  onClose: () => void;
}

function AssignDialog({ booking, onClose }: AssignDialogProps) {
  const { data: professionals, isLoading: profsLoading } =
    useListProfessionals();
  const assignMutation = useAssignBookingToProfessional();
  const [selectedPrincipal, setSelectedPrincipal] = useState<string>("");

  const handleConfirm = async () => {
    if (!booking || !selectedPrincipal) return;
    const prof = professionals?.find(
      (p) => p.principal.toString() === selectedPrincipal,
    );
    if (!prof) return;
    try {
      await assignMutation.mutateAsync({
        bookingId: booking.id,
        professional: prof.principal,
      });
      toast.success("Booking assigned successfully.");
      onClose();
    } catch {
      toast.error("Failed to assign booking. Please try again.");
    }
  };

  return (
    <Dialog open={!!booking} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="admin.assign_dialog.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Assign Technician
          </DialogTitle>
          <DialogDescription>
            Select a technician to assign to booking{" "}
            <strong>#{booking ? Number(booking.id) : ""}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {booking && (
            <div className="bg-secondary/50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-mono text-xs">
                  {shortenPrincipal(booking.customer.toString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span>{booking.timeSlot}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Select Technician</Label>
            {profsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedPrincipal}
                onValueChange={setSelectedPrincipal}
              >
                <SelectTrigger data-ocid="admin.assign_dialog.select">
                  <SelectValue placeholder="Choose a technician..." />
                </SelectTrigger>
                <SelectContent>
                  {!professionals || professionals.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      No technicians available
                    </SelectItem>
                  ) : (
                    professionals.map((prof) => (
                      <SelectItem
                        key={prof.principal.toString()}
                        value={prof.principal.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {prof.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getCategoryLabel(prof.category)}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="admin.assign_dialog.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            disabled={!selectedPrincipal || assignMutation.isPending}
            data-ocid="admin.assign_dialog.confirm_button"
            className="gap-2 shadow-primary"
          >
            {assignMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            {assignMutation.isPending ? "Assigning..." : "Assign Technician"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Update Status Dialog ──────────────────────────────────────────────────────
interface UpdateStatusDialogProps {
  booking: Booking | null;
  onClose: () => void;
}

function UpdateStatusDialog({ booking, onClose }: UpdateStatusDialogProps) {
  const updateStatus = useAdminUpdateBookingStatus();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "">(
    booking?.status ?? "",
  );

  const handleConfirm = async () => {
    if (!booking || !selectedStatus) return;
    try {
      await updateStatus.mutateAsync({
        bookingId: booking.id,
        status: selectedStatus,
      });
      toast.success(
        `Booking #${Number(booking.id)} status updated to "${getStatusLabel(selectedStatus)}".`,
      );
      onClose();
    } catch {
      toast.error("Failed to update booking status. Please try again.");
    }
  };

  return (
    <Dialog open={!!booking} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-sm"
        data-ocid="admin.update_status_dialog.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Update Booking Status
          </DialogTitle>
          <DialogDescription>
            Change the status for booking{" "}
            <strong>#{booking ? Number(booking.id) : ""}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {booking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Current status:</span>
              <StatusBadge status={booking.status} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>New Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as BookingStatus)}
            >
              <SelectTrigger data-ocid="admin.update_status_dialog.select">
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2">
                      <StatusDot status={s} />
                      {getStatusLabel(s)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="admin.update_status_dialog.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            disabled={
              !selectedStatus ||
              selectedStatus === booking?.status ||
              updateStatus.isPending
            }
            data-ocid="admin.update_status_dialog.confirm_button"
            className="gap-2 shadow-primary"
          >
            {updateStatus.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {updateStatus.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stat Cards ────────────────────────────────────────────────────────────────
type StatCardDef =
  | {
      label: string;
      key:
        | "totalUsers"
        | "totalProfessionals"
        | "totalBookings"
        | "totalCompletedBookings";
      icon: React.ComponentType<{
        className?: string;
        style?: React.CSSProperties;
      }>;
      color: string;
      iconColor: string;
      isRevenue?: false;
    }
  | {
      label: string;
      key: "totalRevenue";
      icon: React.ComponentType<{
        className?: string;
        style?: React.CSSProperties;
      }>;
      color: string;
      iconColor: string;
      isRevenue: true;
    };

const statCards: StatCardDef[] = [
  {
    label: "Total Users",
    key: "totalUsers",
    icon: Users,
    color: "oklch(0.92 0.06 220)",
    iconColor: "oklch(0.38 0.15 220)",
  },
  {
    label: "Technicians",
    key: "totalProfessionals",
    icon: Briefcase,
    color: "oklch(0.92 0.07 145)",
    iconColor: "oklch(0.38 0.14 145)",
  },
  {
    label: "Total Bookings",
    key: "totalBookings",
    icon: CalendarCheck,
    color: "oklch(0.95 0.08 80)",
    iconColor: "oklch(0.45 0.14 80)",
  },
  {
    label: "Completed",
    key: "totalCompletedBookings",
    icon: CheckSquare,
    color: "oklch(0.92 0.07 170)",
    iconColor: "oklch(0.38 0.14 170)",
  },
  {
    label: "Total Revenue",
    key: "totalRevenue",
    icon: DollarSign,
    color: "oklch(0.92 0.07 145)",
    iconColor: "oklch(0.38 0.14 145)",
    isRevenue: true,
  },
];

// ─── Overview Section ──────────────────────────────────────────────────────────
interface OverviewSectionProps {
  services: Service[];
}

function OverviewSection({ services }: OverviewSectionProps) {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: bookings } = useAllBookings();
  const [showQuickStart, setShowQuickStart] = useState(true);

  // Booking status breakdown
  const totalBookings = bookings?.length ?? 0;
  const statusBreakdown = ALL_STATUSES.map((status) => ({
    status,
    count: bookings?.filter((b) => b.status === status).length ?? 0,
  }));

  // Category breakdown
  const serviceMap = new Map(
    services.map((s) => [s.id.toString(), s.category]),
  );
  const categoryCountMap = new Map<ServiceCategory, number>();
  for (const b of bookings ?? []) {
    const cat = serviceMap.get(b.serviceId.toString());
    if (cat) categoryCountMap.set(cat, (categoryCountMap.get(cat) ?? 0) + 1);
  }
  const categoryBreakdown = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    count: categoryCountMap.get(cat) ?? 0,
  })).sort((a, b) => b.count - a.count);
  const maxCategoryCount = Math.max(
    ...categoryBreakdown.map((c) => c.count),
    1,
  );

  const statusBarColors: Record<BookingStatus, string> = {
    [BookingStatus.pending]: "bg-amber-500",
    [BookingStatus.confirmed]: "bg-blue-500",
    [BookingStatus.inProgress]: "bg-orange-500",
    [BookingStatus.completed]: "bg-green-500",
    [BookingStatus.cancelled]: "bg-red-400",
  };

  return (
    <section data-ocid="admin.overview.section" className="space-y-8">
      {/* Quick Start Card */}
      <AnimatePresence>
        {showQuickStart && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25 }}
            data-ocid="admin.quick_start.panel"
            className="rounded-xl border border-primary/30 bg-primary/5 p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-base text-foreground">
                    Admin Quick Start
                  </p>
                  <p className="text-xs text-muted-foreground">
                    What each section does
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-ocid="admin.quick_start.close_button"
                onClick={() => setShowQuickStart(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary flex-shrink-0"
                aria-label="Dismiss quick start"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                {
                  icon: TrendingUp,
                  label: "Overview",
                  desc: "Platform stats, booking analytics, category breakdown",
                  color: "oklch(0.92 0.06 220)",
                  iconColor: "oklch(0.38 0.15 220)",
                },
                {
                  icon: Briefcase,
                  label: "Services",
                  desc: "Add, edit, and delete service listings for customers",
                  color: "oklch(0.92 0.07 145)",
                  iconColor: "oklch(0.38 0.14 145)",
                },
                {
                  icon: CalendarCheck,
                  label: "Bookings",
                  desc: "View all bookings, assign techs, update statuses",
                  color: "oklch(0.95 0.08 80)",
                  iconColor: "oklch(0.45 0.14 80)",
                },
                {
                  icon: Users,
                  label: "Technicians",
                  desc: "See registered techs, job counts, specializations",
                  color: "oklch(0.92 0.07 170)",
                  iconColor: "oklch(0.38 0.14 170)",
                },
              ].map(({ icon: Icon, label, desc, color, iconColor }) => (
                <div
                  key={label}
                  className="rounded-lg bg-card border border-border p-3 flex flex-col gap-2"
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: iconColor }}
                    />
                  </div>
                  <p className="font-display font-bold text-sm text-foreground">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-background border border-border">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">To add services:</strong> Go
                to{" "}
                <strong className="text-foreground">
                  Services tab → Add Service
                </strong>{" "}
                button.{"  "}
                <strong className="text-foreground">To assign bookings:</strong>{" "}
                Go to{" "}
                <strong className="text-foreground">
                  Bookings tab → Assign button
                </strong>{" "}
                on any pending booking.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      <div>
        <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Platform Overview
        </h2>

        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
              <div
                key={id}
                className="bg-card border border-border rounded-xl p-5"
              >
                <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              const rawValue = stats ? stats[card.key] : 0n;
              const displayValue = card.isRevenue
                ? `₹${Number(rawValue).toLocaleString("en-IN")}`
                : Number(rawValue).toLocaleString();

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: card.color }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: card.iconColor }}
                    />
                  </div>
                  <div className="font-display font-black text-2xl text-foreground">
                    {displayValue}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {card.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics */}
      <div data-ocid="admin.analytics.section">
        <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Status Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold text-base text-foreground mb-4">
              Booking Status Breakdown
            </h3>
            {totalBookings === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No bookings recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {statusBreakdown.map(({ status, count }) => {
                  const pct =
                    totalBookings > 0
                      ? Math.round((count / totalBookings) * 100)
                      : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <StatusDot status={status} />
                          <span className="font-medium text-foreground">
                            {getStatusLabel(status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="text-muted-foreground text-xs">
                            {pct}%
                          </span>
                          <span className="font-bold text-foreground w-6 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${statusBarColors[status]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            delay: 0.1,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold text-base text-foreground mb-4">
              Bookings by Category
            </h3>
            {totalBookings === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No bookings recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(({ category, count }, i) => {
                  const pct = Math.round((count / maxCategoryCount) * 100);
                  const categoryColors = [
                    "bg-primary",
                    "bg-blue-500",
                    "bg-amber-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-rose-500",
                  ];
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {getCategoryLabel(category)}
                        </span>
                        <span className="font-bold text-foreground tabular-nums">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${categoryColors[i % categoryColors.length]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            delay: i * 0.08,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Services Section ──────────────────────────────────────────────────────────
interface ServicesSectionProps {
  services: Service[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onAdd: () => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => Promise<void>;
  removeServicePending: boolean;
}

function ServicesSection({
  services,
  isLoading,
  isError,
  onAdd,
  onEdit,
  onDelete,
  removeServicePending,
}: ServicesSectionProps) {
  return (
    <section data-ocid="admin.services.section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Services Management
        </h2>
        <Button
          onClick={onAdd}
          data-ocid="admin.add_service_button"
          className="gap-2 shadow-primary"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.services.loading_state"
        >
          <div className="p-4 space-y-3">
            {["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
              <div key={id} className="flex gap-4">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div
          className="flex flex-col items-center gap-3 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.services.error_state"
        >
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground text-sm">
            Failed to load services.
          </p>
        </div>
      ) : !services || services.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.services.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-foreground">
              No services yet
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Click "Add Service" to create the first service listing
            </p>
          </div>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.service_table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="font-display font-bold text-foreground">
                  Service Name
                </TableHead>
                <TableHead className="font-display font-bold text-foreground">
                  Category
                </TableHead>
                <TableHead className="font-display font-bold text-foreground">
                  Price Range
                </TableHead>
                <TableHead className="text-right font-display font-bold text-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service, i) => (
                <TableRow
                  key={service.id.toString()}
                  className="hover:bg-secondary/50"
                  data-ocid={`admin.service.row.${i + 1}`}
                >
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {service.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-64">
                      {service.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(service.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium">
                    {formatPriceRange(service.minPrice, service.maxPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        data-ocid={`admin.edit_button.${i + 1}`}
                        onClick={() => onEdit(service)}
                        className="gap-1.5 hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-ocid={`admin.delete_button.${i + 1}`}
                            className="gap-1.5 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-display">
                              Delete Service?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              <strong>{service.name}</strong>? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="admin.delete_dialog.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              data-ocid="admin.delete_dialog.confirm_button"
                              onClick={() => void onDelete(service)}
                              disabled={removeServicePending}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {removeServicePending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

// ─── Bookings Section ──────────────────────────────────────────────────────────
interface BookingsSectionProps {
  services: Service[];
}

function BookingsSection({ services }: BookingsSectionProps) {
  const { data: bookings, isLoading, isError } = useAllBookings();
  const { data: professionals } = useListProfessionals();
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(
    null,
  );
  const [updatingBooking, setUpdatingBooking] = useState<Booking | null>(null);

  const serviceMap = new Map(services.map((s) => [s.id.toString(), s.name]));
  const profMap = new Map(
    professionals?.map((p) => [p.principal.toString(), p.displayName]) ?? [],
  );

  const filterTabs: { value: BookingFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: BookingStatus.pending, label: "Pending" },
    { value: BookingStatus.confirmed, label: "Confirmed" },
    { value: BookingStatus.inProgress, label: "In Progress" },
    { value: BookingStatus.completed, label: "Completed" },
    { value: BookingStatus.cancelled, label: "Cancelled" },
  ];

  const filtered =
    bookings?.filter((b) => filter === "all" || b.status === filter) ?? [];

  return (
    <section data-ocid="admin.bookings.section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-primary" />
          Bookings Management
        </h2>
        {!isLoading && !isError && bookings && (
          <span className="text-sm text-muted-foreground">
            {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as BookingFilter)}
        className="mb-4"
      >
        <TabsList className="bg-secondary/60 h-auto flex-wrap gap-1 p-1">
          {filterTabs.map((tab) => {
            const count =
              tab.value === "all"
                ? (bookings?.length ?? 0)
                : (bookings?.filter((b) => b.status === tab.value).length ?? 0);
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid="admin.bookings.tab"
                className="gap-1.5 text-xs font-medium"
              >
                {tab.label}
                {!isLoading && (
                  <span className="bg-background/60 rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Table states */}
      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.bookings.loading_state"
        >
          <div className="p-4 space-y-3">
            {["sk1", "sk2", "sk3", "sk4"].map((id) => (
              <div key={id} className="flex gap-4 items-center">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div
          className="flex flex-col items-center gap-3 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.bookings.error_state"
        >
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground text-sm">
            Failed to load bookings. Please refresh.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.bookings.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <CalendarCheck className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-foreground">
              {filter === "all"
                ? "No bookings yet"
                : `No ${getStatusLabel(filter as BookingStatus)} bookings`}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {filter === "all"
                ? "Customer bookings will appear here once they start placing orders."
                : "Try selecting a different filter tab."}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.bookings.table"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead className="font-display font-bold text-foreground w-14">
                    ID
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Service
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Date & Time
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Address
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Created
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Assigned Tech
                  </TableHead>
                  <TableHead className="text-right font-display font-bold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((booking, i) => {
                  const serviceName =
                    serviceMap.get(booking.serviceId.toString()) ??
                    `Service #${booking.serviceId}`;
                  const customerShort = shortenPrincipal(
                    booking.customer.toString(),
                  );
                  const techName = booking.assignedProfessional
                    ? (profMap.get(booking.assignedProfessional.toString()) ??
                      shortenPrincipal(booking.assignedProfessional.toString()))
                    : null;
                  const canAssign =
                    booking.status === BookingStatus.pending ||
                    !booking.assignedProfessional;
                  const createdAtDate = new Date(
                    Number(booking.createdAt) / 1_000_000,
                  ).toLocaleDateString();
                  const truncatedAddress =
                    booking.address.length > 25
                      ? `${booking.address.slice(0, 25)}…`
                      : booking.address;

                  return (
                    <TableRow
                      key={booking.id.toString()}
                      className="hover:bg-secondary/50"
                      data-ocid={`admin.bookings.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-sm font-bold text-muted-foreground">
                        #{Number(booking.id)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground text-sm max-w-36 truncate">
                          {serviceName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                          {customerShort}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {booking.date}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.timeSlot}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm text-foreground cursor-default truncate max-w-28 block">
                                {truncatedAddress}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs">{booking.address}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {createdAtDate}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell>
                        {techName ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-foreground">
                              {techName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canAssign ? (
                            <Button
                              variant="outline"
                              size="sm"
                              data-ocid={`admin.bookings.assign_button.${i + 1}`}
                              onClick={() => setAssigningBooking(booking)}
                              className="gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs px-2"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Assign
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              data-ocid={`admin.bookings.assign_button.${i + 1}`}
                              onClick={() => setAssigningBooking(booking)}
                              className="gap-1 text-xs text-muted-foreground hover:text-foreground px-2"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Reassign
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            data-ocid={`admin.bookings.update_status_button.${i + 1}`}
                            onClick={() => setUpdatingBooking(booking)}
                            className="gap-1 hover:bg-secondary text-xs px-2"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Status
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Dialogs */}
      <AssignDialog
        booking={assigningBooking}
        onClose={() => setAssigningBooking(null)}
      />
      <UpdateStatusDialog
        booking={updatingBooking}
        onClose={() => setUpdatingBooking(null)}
      />
    </section>
  );
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection() {
  const { data: customers, isLoading, isError } = useAllCustomers();
  const adminRemoveUser = useAdminRemoveUser();

  const handleRemove = async (principal: string) => {
    const customer = customers?.find(
      (c) => c.principal.toString() === principal,
    );
    if (!customer) return;
    try {
      await adminRemoveUser.mutateAsync(customer.principal);
      toast.success("User removed successfully.");
    } catch {
      toast.error("Failed to remove user.");
    }
  };

  return (
    <section data-ocid="admin.users.section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Registered Customers
        </h2>
        {!isLoading && !isError && customers && (
          <span className="text-sm text-muted-foreground">
            {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.users.loading_state"
        >
          <div className="p-4 space-y-3">
            {["sk1", "sk2", "sk3"].map((id) => (
              <div key={id} className="flex gap-4 items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div
          className="flex flex-col items-center gap-3 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.users.error_state"
        >
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground text-sm">
            Failed to load customers.
          </p>
        </div>
      ) : !customers || customers.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.users.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-foreground">
              No customers yet
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Customers will appear here once they register on the platform.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.users.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="font-display font-bold text-foreground">
                  Customer
                </TableHead>
                <TableHead className="font-display font-bold text-foreground">
                  Mobile
                </TableHead>
                <TableHead className="font-display font-bold text-foreground text-center">
                  Bookings
                </TableHead>
                <TableHead className="text-right font-display font-bold text-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, i) => (
                <TableRow
                  key={customer.principal.toString()}
                  className="hover:bg-secondary/50"
                  data-ocid={`admin.users.row.${i + 1}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-display font-bold text-xs">
                          C
                        </span>
                      </div>
                      <code className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        {shortenPrincipal(customer.principal.toString())}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.mobileNumber ? (
                      <span className="text-sm text-foreground font-medium">
                        {customer.mobileNumber}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Not provided
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {Number(customer.bookingCount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-ocid={`admin.users.delete_button.${i + 1}`}
                          className="gap-1.5 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">
                            Remove Customer?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the customer's profile from the
                            platform. Their bookings will remain in the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="admin.users.delete_dialog.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            data-ocid="admin.users.delete_dialog.confirm_button"
                            onClick={() =>
                              void handleRemove(customer.principal.toString())
                            }
                            disabled={adminRemoveUser.isPending}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {adminRemoveUser.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

// ─── Technicians Section ───────────────────────────────────────────────────────
function TechniciansSection() {
  const { data: professionals, isLoading, isError } = useListProfessionals();
  const { data: bookings } = useAllBookings();

  const techStats = (professionals ?? []).map((prof) => {
    const profBookings = (bookings ?? []).filter(
      (b) => b.assignedProfessional?.toString() === prof.principal.toString(),
    );
    const active = profBookings.filter(
      (b) =>
        b.status === BookingStatus.inProgress ||
        b.status === BookingStatus.confirmed,
    ).length;
    const completed = profBookings.filter(
      (b) => b.status === BookingStatus.completed,
    ).length;
    const total = profBookings.length;
    return { ...prof, active, completed, total };
  });

  const totalActive = techStats.reduce((sum, t) => sum + t.active, 0);

  return (
    <section data-ocid="admin.technicians.section">
      {/* How to Add Technicians */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold text-base text-foreground mb-1">
              How to Add a Technician
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To add a technician, share the app URL with them and ask them to:
            </p>
            <ol className="mt-2 space-y-1">
              {(
                [
                  "Sign in with Internet Identity",
                  "Choose 'I'm a Technician / IT Specialist'",
                  "Enter their display name and service category",
                  "They'll appear in this list once registered",
                ] as const
              ).map((step, idx) => (
                <li
                  key={step}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Registered Technicians
        </h2>
        {!isLoading && !isError && professionals && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">
                {professionals.length}
              </strong>{" "}
              technician
              {professionals.length !== 1 ? "s" : ""}
            </span>
            <span className="text-border">|</span>
            <span>
              <strong className="text-foreground">{totalActive}</strong> active
              job
              {totalActive !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {!isLoading && !isError && professionals && professionals.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Technicians",
              value: professionals.length,
              color: "oklch(0.92 0.06 220)",
              iconColor: "oklch(0.38 0.15 220)",
              icon: Users,
            },
            {
              label: "Active Jobs",
              value: totalActive,
              color: "oklch(0.92 0.06 80)",
              iconColor: "oklch(0.45 0.14 80)",
              icon: Wrench,
            },
            {
              label: "Total Completed",
              value: techStats.reduce((s, t) => s + t.completed, 0),
              color: "oklch(0.92 0.07 145)",
              iconColor: "oklch(0.38 0.14 145)",
              icon: CheckSquare,
            },
            {
              label: "Total Assigned",
              value: techStats.reduce((s, t) => s + t.total, 0),
              color: "oklch(0.95 0.07 290)",
              iconColor: "oklch(0.45 0.15 290)",
              icon: CalendarCheck,
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: card.color }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.iconColor }} />
                </div>
                <div className="font-display font-black text-xl text-foreground">
                  {card.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {card.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.technicians.loading_state"
        >
          <div className="p-4 space-y-3">
            {["sk1", "sk2", "sk3"].map((id) => (
              <div key={id} className="flex gap-4 items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div
          className="flex flex-col items-center gap-3 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.technicians.error_state"
        >
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground text-sm">
            Failed to load technicians.
          </p>
        </div>
      ) : !professionals || professionals.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.technicians.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-foreground">
              No technicians registered yet
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Technicians will appear here once they register on the platform.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.technicians.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="font-display font-bold text-foreground">
                  Technician
                </TableHead>
                <TableHead className="font-display font-bold text-foreground">
                  Specialization
                </TableHead>
                <TableHead className="font-display font-bold text-foreground text-center">
                  Active Jobs
                </TableHead>
                <TableHead className="font-display font-bold text-foreground text-center">
                  Completed
                </TableHead>
                <TableHead className="font-display font-bold text-foreground text-center">
                  Total Jobs
                </TableHead>
                <TableHead className="font-display font-bold text-foreground">
                  Principal
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {techStats.map((tech, i) => (
                <TableRow
                  key={tech.principal.toString()}
                  className="hover:bg-secondary/50"
                  data-ocid={`admin.technicians.row.${i + 1}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-display font-bold text-sm">
                          {tech.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="font-medium text-foreground">
                        {tech.displayName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(tech.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {tech.active > 0 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-800 font-bold text-sm">
                        {tech.active}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {tech.completed > 0 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                        {tech.completed}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-foreground tabular-nums">
                      {tech.total}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {shortenPrincipal(tech.principal.toString())}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

// ─── Sidebar Nav Item ──────────────────────────────────────────────────────────
interface SidebarNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  active: boolean;
  ocid: string;
  onClick: () => void;
}

function SidebarNavItem({
  icon: Icon,
  label,
  count,
  active,
  ocid,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      <Icon
        className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : ""}`}
      />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span
          className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
            active
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Admin Panel ───────────────────────────────────────────────────────────────

// ─── AdminsSection ─────────────────────────────────────────────────────────────
function AdminsSection() {
  const { actor } = useActor();
  const [principalId, setPrincipalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleGrant = async () => {
    if (!principalId.trim()) {
      toast.error("Please enter a Principal ID.");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend.");
      return;
    }
    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      const principal = Principal.fromText(principalId.trim());
      await actor.assignCallerUserRole(principal, UserRole.admin);
      setSuccess(true);
      setPrincipalId("");
      toast.success("Admin role granted successfully!");
    } catch (e: any) {
      const msg = e?.message ?? "Failed to grant admin role.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Manage Admins</h2>
        <p className="text-muted-foreground mt-1">
          Grant admin access to another user by their Principal ID.
        </p>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          <strong>Warning:</strong> Admin role is permanent and gives full
          access to the platform. Only grant this to trusted individuals.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Grant Admin Role</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          To find a user's Principal ID, ask them to visit the app, sign in, and
          copy their Principal ID from their profile or the URL bar after
          sign-in.
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="principalInput">Principal ID</Label>
            <Input
              id="principalInput"
              data-ocid="admins.input"
              placeholder="e.g. aaaaa-aa or xxxxx-xxxxx-xxxxx-cai"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              className="font-mono"
            />
          </div>
          <Button
            data-ocid="admins.submit_button"
            onClick={handleGrant}
            disabled={loading || !principalId.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {loading ? "Granting…" : "Grant Admin Role"}
          </Button>
          {success && (
            <div
              data-ocid="admins.success_state"
              className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin role granted successfully!
            </div>
          )}
          {error && (
            <div
              data-ocid="admins.error_state"
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" /> How It Works
        </h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>
            Ask the person you want to make admin to sign in to Lepzo with
            Internet Identity.
          </li>
          <li>
            Have them copy their Principal ID (visible in their profile or
            browser console via{" "}
            <code className="bg-muted px-1 rounded">
              identity.getPrincipal().toString()
            </code>
            ).
          </li>
          <li>Paste their Principal ID above and click "Grant Admin Role".</li>
          <li>
            They will have admin access immediately on their next page load.
          </li>
        </ol>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: stats } = usePlatformStats();
  const {
    data: services,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useListServices();
  const { data: professionals } = useListProfessionals();
  const { data: bookings } = useAllBookings();
  const removeService = useRemoveService();

  if (!identity) {
    void navigate({ to: "/" });
    return null;
  }

  const handleAddService = () => {
    setEditingService(null);
    setServiceModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceModalOpen(true);
  };

  const handleDeleteService = async (service: Service) => {
    try {
      await removeService.mutateAsync(service.id);
      toast.success(`Service "${service.name}" removed.`);
    } catch {
      toast.error("Failed to remove service. Please try again.");
    }
  };

  const navItems: {
    key: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    ocid: string;
    count?: number;
  }[] = [
    {
      key: "overview",
      label: "Overview",
      icon: TrendingUp,
      ocid: "admin.sidebar.overview_link",
    },
    {
      key: "services",
      label: "Services",
      icon: Briefcase,
      ocid: "admin.sidebar.services_link",
      count: services?.length ?? Number(stats?.totalBookings ?? 0),
    },
    {
      key: "bookings",
      label: "Bookings",
      icon: CalendarCheck,
      ocid: "admin.sidebar.bookings_link",
      count: bookings?.length ?? Number(stats?.totalBookings ?? 0),
    },
    {
      key: "payments",
      label: "Payments",
      icon: CreditCard,
      ocid: "admin.sidebar.payments_link",
      count: bookings?.length,
    },
    {
      key: "users",
      label: "Customers",
      icon: Users,
      ocid: "admin.sidebar.users_link",
      count: undefined,
    },
    {
      key: "technicians",
      label: "Technicians",
      icon: Users,
      ocid: "admin.sidebar.technicians_link",
      count: professionals?.length ?? Number(stats?.totalProfessionals ?? 0),
    },
    {
      key: "branding",
      label: "Branding",
      icon: Palette,
      ocid: "admin.sidebar.branding_link",
    },
    {
      key: "database",
      label: "Database",
      icon: Database,
      ocid: "admin.sidebar.database_link",
    },
    {
      key: "admins",
      label: "Admins",
      icon: UserPlus,
      ocid: "admin.sidebar.admins_link",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-foreground">
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Platform management & oversight
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <aside className="w-52 flex-shrink-0 sticky top-6">
            <div className="bg-card border border-border rounded-xl p-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-1 pb-2">
                Navigation
              </p>
              {navItems.map((item) => (
                <SidebarNavItem
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  count={item.count}
                  active={activeSection === item.key}
                  ocid={item.ocid}
                  onClick={() => setActiveSection(item.key)}
                />
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === "overview" && (
                  <OverviewSection services={services ?? []} />
                )}

                {activeSection === "services" && (
                  <ServicesSection
                    services={services}
                    isLoading={servicesLoading}
                    isError={servicesError}
                    onAdd={handleAddService}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                    removeServicePending={removeService.isPending}
                  />
                )}

                {activeSection === "bookings" && (
                  <BookingsSection services={services ?? []} />
                )}

                {activeSection === "payments" && <PaymentsSection />}

                {activeSection === "users" && <UsersSection />}

                {activeSection === "technicians" && <TechniciansSection />}

                {activeSection === "branding" && <BrandingManager />}

                {activeSection === "database" && <DatabaseSchema />}

                {activeSection === "admins" && <AdminsSection />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Service Form Modal */}
      <ServiceFormModal
        open={serviceModalOpen}
        onClose={() => {
          setServiceModalOpen(false);
          setEditingService(null);
        }}
        editingService={editingService}
      />
    </div>
  );
}
