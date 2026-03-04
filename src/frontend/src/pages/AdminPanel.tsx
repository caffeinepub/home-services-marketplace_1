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
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  CalendarCheck,
  CheckSquare,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Service, ServiceCategory } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  formatPriceRange,
  getCategoryLabel,
  useAddService,
  useListServices,
  usePlatformStats,
  useRemoveService,
  useUpdateService,
} from "../hooks/useQueries";

const ALL_CATEGORIES = [
  ServiceCategory.cleaning,
  ServiceCategory.plumbing,
  ServiceCategory.electrician,
  ServiceCategory.carpentry,
  ServiceCategory.painting,
  ServiceCategory.acRepair,
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

const statCards = [
  {
    label: "Total Users",
    key: "totalUsers" as const,
    icon: Users,
    color: "oklch(0.92 0.06 220)",
    iconColor: "oklch(0.38 0.15 220)",
  },
  {
    label: "Professionals",
    key: "totalProfessionals" as const,
    icon: Briefcase,
    color: "oklch(0.92 0.07 145)",
    iconColor: "oklch(0.38 0.14 145)",
  },
  {
    label: "Total Bookings",
    key: "totalBookings" as const,
    icon: CalendarCheck,
    color: "oklch(0.95 0.08 80)",
    iconColor: "oklch(0.45 0.14 80)",
  },
  {
    label: "Completed",
    key: "totalCompletedBookings" as const,
    icon: CheckSquare,
    color: "oklch(0.92 0.07 170)",
    iconColor: "oklch(0.38 0.14 170)",
  },
];

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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {["sk1", "sk2", "sk3", "sk4"].map((id) => (
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                const value = stats ? Number(stats[card.key]) : 0;

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
                      {value.toLocaleString()}
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

        {/* ─── Bookings Note ─── */}
        <section>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">
                  Bookings Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Bookings are managed at the professional level. To assign a
                  booking to a professional, use the backend API:{" "}
                  <code className="font-mono text-xs bg-secondary px-1 py-0.5 rounded">
                    assignBookingToProfessional(bookingId, professional)
                  </code>
                  . Platform-wide booking stats are shown in the overview above.
                </p>
              </div>
            </div>
          </div>
        </section>
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
