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
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  CalendarCheck,
  CheckSquare,
  DollarSign,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Booking,
  BookingStatus,
  type Service,
  ServiceCategory,
} from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  formatPriceRange,
  getCategoryLabel,
  getStatusClass,
  getStatusLabel,
  shortenPrincipal,
  useAddService,
  useAllBookings,
  useAssignBookingToProfessional,
  useListProfessionals,
  useListServices,
  usePlatformStats,
  useRemoveService,
  useUpdateService,
} from "../hooks/useQueries";

const ALL_CATEGORIES = [
  ServiceCategory.laptopRepair,
  ServiceCategory.desktopRepair,
  ServiceCategory.computerSales,
  ServiceCategory.accessoriesSales,
  ServiceCategory.networkSetup,
  ServiceCategory.dataRecovery,
];

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
        isEditing
          ? "Failed to update service. Please try again."
          : "Failed to add service. Please try again.",
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
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="service-name">Service Name</Label>
            <Input
              id="service-name"
              placeholder="e.g. Standard Home Cleaning"
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="service-description">Description</Label>
            <textarea
              id="service-description"
              placeholder="Describe what this service includes..."
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              rows={3}
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${errors.description ? "border-destructive" : "border-input"}`}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Category */}
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

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="min-price">Min Price ($)</Label>
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
              <Label htmlFor="max-price">Max Price ($)</Label>
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

// ─── Status badge helper ───────────────────────────────────────────────────
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

// ─── Assign Technician Dialog ──────────────────────────────────────────────
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

// ─── Bookings Management Section ──────────────────────────────────────────
type BookingFilter =
  | "all"
  | BookingStatus.pending
  | BookingStatus.confirmed
  | BookingStatus.inProgress
  | BookingStatus.completed
  | BookingStatus.cancelled;

interface BookingsManagementProps {
  services: Service[];
}

function BookingsManagement({ services }: BookingsManagementProps) {
  const { data: bookings, isLoading, isError } = useAllBookings();
  const { data: professionals } = useListProfessionals();
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(
    null,
  );

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
    <section>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="font-display font-bold text-foreground w-16">
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
                  Status
                </TableHead>
                <TableHead className="font-display font-bold text-foreground">
                  Assigned Technician
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
                      <div className="font-medium text-foreground text-sm max-w-40 truncate">
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
                      {canAssign ? (
                        <Button
                          variant="outline"
                          size="sm"
                          data-ocid={`admin.bookings.assign_button.${i + 1}`}
                          onClick={() => setAssigningBooking(booking)}
                          className="gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs"
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
                          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Reassign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Assign Dialog */}
      <AssignDialog
        booking={assigningBooking}
        onClose={() => setAssigningBooking(null)}
      />
    </section>
  );
}

export function AdminPanel() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const {
    data: services,
    isLoading: servicesLoading,
    isError,
  } = useListServices();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
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

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* ─── Stats ─── */}
        <section data-ocid="admin.stats_panel">
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
                  ? `$${Number(rawValue).toLocaleString()}`
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
        </section>

        {/* ─── Services Management ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Services Management
            </h2>
            <Button
              onClick={handleAddService}
              data-ocid="admin.add_service_button"
              className="gap-2 shadow-primary"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          </div>

          {servicesLoading ? (
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
                            onClick={() => handleEditService(service)}
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
                                  onClick={() =>
                                    void handleDeleteService(service)
                                  }
                                  disabled={removeService.isPending}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {removeService.isPending ? (
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

        {/* ─── Bookings Management ─── */}
        <BookingsManagement services={services ?? []} />
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
