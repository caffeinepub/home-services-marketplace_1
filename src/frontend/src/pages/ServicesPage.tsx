import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarPlus,
  HardDrive,
  Laptop,
  Monitor,
  Mouse,
  PlusCircle,
  Search,
  ShoppingCart,
  Wifi,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type Service, ServiceCategory } from "../backend.d";
import { BookingModal } from "../components/BookingModal";
import { CompareBar } from "../components/CompareBar";
import { CompareModal } from "../components/CompareModal";
import {
  formatPriceRange,
  getCategoryLabel,
  useListServices,
} from "../hooks/useQueries";

const categoryIcons: Record<
  ServiceCategory,
  React.ComponentType<{ className?: string }>
> = {
  [ServiceCategory.laptopRepair]: Laptop,
  [ServiceCategory.desktopRepair]: Monitor,
  [ServiceCategory.computerSales]: ShoppingCart,
  [ServiceCategory.accessoriesSales]: Mouse,
  [ServiceCategory.networkSetup]: Wifi,
  [ServiceCategory.dataRecovery]: HardDrive,
};

const categoryColors: Record<ServiceCategory, string> = {
  [ServiceCategory.laptopRepair]: "oklch(0.92 0.07 220)",
  [ServiceCategory.desktopRepair]: "oklch(0.92 0.06 260)",
  [ServiceCategory.computerSales]: "oklch(0.92 0.07 170)",
  [ServiceCategory.accessoriesSales]: "oklch(0.94 0.07 55)",
  [ServiceCategory.networkSetup]: "oklch(0.92 0.06 195)",
  [ServiceCategory.dataRecovery]: "oklch(0.92 0.06 30)",
};

const ALL_CATEGORIES = [
  ServiceCategory.laptopRepair,
  ServiceCategory.desktopRepair,
  ServiceCategory.computerSales,
  ServiceCategory.accessoriesSales,
  ServiceCategory.networkSetup,
  ServiceCategory.dataRecovery,
];

// Seed services for initial display
const SEED_SERVICES: Service[] = [
  {
    id: 1n,
    name: "Screen Replacement",
    description:
      "Professional laptop screen replacement for cracked, damaged, or dim displays. Covers all major brands including Dell, HP, Lenovo, Apple, and ASUS.",
    category: ServiceCategory.laptopRepair,
    minPrice: 80n,
    maxPrice: 200n,
  },
  {
    id: 2n,
    name: "Battery & Keyboard Fix",
    description:
      "Replace worn-out laptop batteries that no longer hold charge, or fix/replace sticky, broken, or unresponsive keyboard keys.",
    category: ServiceCategory.laptopRepair,
    minPrice: 50n,
    maxPrice: 150n,
  },
  {
    id: 3n,
    name: "PC Diagnostics & Repair",
    description:
      "Full desktop PC diagnostic including hardware and software checks. Covers overheating, random shutdowns, boot failures, and slow performance.",
    category: ServiceCategory.desktopRepair,
    minPrice: 60n,
    maxPrice: 180n,
  },
  {
    id: 4n,
    name: "Hardware Upgrade",
    description:
      "Upgrade your desktop with more RAM, a faster SSD, a new GPU, or a CPU. We handle sourcing, installation, and testing.",
    category: ServiceCategory.desktopRepair,
    minPrice: 80n,
    maxPrice: 250n,
  },
  {
    id: 5n,
    name: "Refurbished Laptops",
    description:
      "Certified pre-owned laptops fully tested and restored to like-new condition. Includes 6-month warranty. Brands: Dell, HP, Lenovo, Apple.",
    category: ServiceCategory.computerSales,
    minPrice: 300n,
    maxPrice: 800n,
  },
  {
    id: 6n,
    name: "Custom-Built Desktop PCs",
    description:
      "We build custom desktop PCs tailored to your needs — gaming, creative work, or office use. All components are new and carry manufacturer warranty.",
    category: ServiceCategory.computerSales,
    minPrice: 500n,
    maxPrice: 1500n,
  },
  {
    id: 7n,
    name: "Keyboards, Mice & Webcams",
    description:
      "Wide selection of mechanical keyboards, ergonomic mice, and HD/4K webcams from top brands like Logitech, Razer, and Microsoft.",
    category: ServiceCategory.accessoriesSales,
    minPrice: 20n,
    maxPrice: 120n,
  },
  {
    id: 8n,
    name: "Monitors & Docking Stations",
    description:
      "Full HD, QHD, and 4K monitors from Dell, LG, and Samsung. USB-C and Thunderbolt docking stations for laptop users.",
    category: ServiceCategory.accessoriesSales,
    minPrice: 80n,
    maxPrice: 350n,
  },
  {
    id: 9n,
    name: "Home Wi-Fi Setup",
    description:
      "Professional home Wi-Fi setup including router configuration, optimal placement, security hardening, and device connection.",
    category: ServiceCategory.networkSetup,
    minPrice: 60n,
    maxPrice: 150n,
  },
  {
    id: 10n,
    name: "Office Network Installation",
    description:
      "Complete office network installation with structured cabling, switch/router configuration, VLAN setup, and firewall configuration.",
    category: ServiceCategory.networkSetup,
    minPrice: 150n,
    maxPrice: 500n,
  },
  {
    id: 11n,
    name: "Hard Drive Recovery",
    description:
      "Recover lost data from failed, corrupted, or accidentally formatted hard drives. Supports HDD and external drives of all brands.",
    category: ServiceCategory.dataRecovery,
    minPrice: 100n,
    maxPrice: 400n,
  },
  {
    id: 12n,
    name: "SSD & USB Recovery",
    description:
      "Data recovery from failed SSDs, NVMe drives, USB flash drives, and memory cards. Clean-room recovery available for severe cases.",
    category: ServiceCategory.dataRecovery,
    minPrice: 80n,
    maxPrice: 300n,
  },
];

function ServiceCard({
  service,
  index,
  onBook,
  isInCompare,
  onToggleCompare,
  compareDisabled,
}: {
  service: Service;
  index: number;
  onBook: (service: Service) => void;
  isInCompare: boolean;
  onToggleCompare: (service: Service) => void;
  compareDisabled: boolean;
}) {
  const Icon = categoryIcons[service.category] ?? Laptop;
  const bgColor = categoryColors[service.category] ?? "oklch(0.94 0.01 250)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`service-card bg-card border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
        isInCompare
          ? "border-primary ring-2 ring-primary/30 shadow-md shadow-primary/10"
          : "border-border"
      }`}
    >
      {/* Category color bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background: bgColor
            .replace("oklch(", "oklch(")
            .replace(")", " / 0.8)"),
        }}
      />
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: bgColor }}
          >
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base text-foreground leading-tight">
              {service.name}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs font-medium">
              {getCategoryLabel(service.category)}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
          {service.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground">Price range</div>
            <div className="font-display font-bold text-base text-foreground">
              {formatPriceRange(service.minPrice, service.maxPrice)}
            </div>
          </div>
          <Button
            size="sm"
            data-ocid={`services.book_button.${index + 1}`}
            onClick={() => onBook(service)}
            className="gap-1.5 shadow-primary"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Book Now
          </Button>
        </div>

        {/* Compare Toggle */}
        <button
          type="button"
          data-ocid={`services.compare_toggle.${index + 1}`}
          onClick={() => onToggleCompare(service)}
          disabled={!isInCompare && compareDisabled}
          className={`flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-150 border ${
            isInCompare
              ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
              : compareDisabled
                ? "border-border text-muted-foreground/40 cursor-not-allowed bg-transparent"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 bg-transparent"
          }`}
        >
          {isInCompare ? (
            <>
              <XCircle className="w-3.5 h-3.5" />
              Remove from Compare
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5" />
              {compareDisabled ? "Compare full (3/3)" : "Add to Compare"}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export function ServicesPage() {
  const search = useSearch({ strict: false }) as { category?: ServiceCategory };
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">(
    search.category ?? "all",
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Compare state
  const [compareList, setCompareList] = useState<Service[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const { data: fetchedServices, isLoading, isError } = useListServices();

  // Use fetched services or seed data
  const allServices =
    fetchedServices && fetchedServices.length > 0
      ? fetchedServices
      : SEED_SERVICES;

  const filteredServices =
    activeCategory === "all"
      ? allServices
      : allServices.filter((s) => s.category === activeCategory);

  const handleBook = (service: Service) => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  const handleToggleCompare = (service: Service) => {
    setCompareList((prev) => {
      const isIn = prev.some((s) => s.id === service.id);
      if (isIn) return prev.filter((s) => s.id !== service.id);
      if (prev.length >= 3) return prev;
      return [...prev, service];
    });
  };

  const handleRemoveFromCompare = (serviceId: bigint) => {
    setCompareList((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleClearCompare = () => {
    setCompareList([]);
    setCompareModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-black text-foreground mb-1">
            Our Services
          </h1>
          <p className="text-muted-foreground">
            Choose from {allServices.length} professional computer and laptop
            services
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as ServiceCategory | "all")}
          className="mb-8"
        >
          <TabsList
            className="flex flex-wrap h-auto gap-1 bg-secondary p-1 rounded-xl"
            data-ocid="services.category_tab"
          >
            <TabsTrigger value="all" className="rounded-lg text-sm">
              All Services
            </TabsTrigger>
            {ALL_CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="rounded-lg text-sm">
                {getCategoryLabel(cat)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Loading */}
        {isLoading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="services.loading_state"
          >
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((id) => (
              <div
                key={id}
                className="bg-card border border-border rounded-2xl p-5 space-y-3"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-24 mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div
            className="flex flex-col items-center gap-3 py-20 text-center"
            data-ocid="services.error_state"
          >
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-muted-foreground">
              Failed to load services. Showing sample services instead.
            </p>
          </div>
        )}

        {/* Services Grid */}
        {!isLoading &&
          (filteredServices.length === 0 ? (
            <div
              className="flex flex-col items-center gap-4 py-20 text-center"
              data-ocid="services.empty_state"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-foreground">
                  No services found
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Try selecting a different category
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveCategory("all")}
              >
                View All Services
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, i) => (
                  <ServiceCard
                    key={service.id.toString()}
                    service={service}
                    index={i}
                    onBook={handleBook}
                    isInCompare={compareList.some((s) => s.id === service.id)}
                    onToggleCompare={handleToggleCompare}
                    compareDisabled={
                      compareList.length >= 3 &&
                      !compareList.some((s) => s.id === service.id)
                    }
                  />
                ))}
              </div>
            </AnimatePresence>
          ))}
      </div>

      <BookingModal
        service={selectedService}
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setSelectedService(null);
        }}
      />

      {/* Compare Bar */}
      <CompareBar
        compareList={compareList}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
        onCompare={() => setCompareModalOpen(true)}
      />

      {/* Compare Modal */}
      <CompareModal
        services={compareList}
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onBook={(svc) => {
          setSelectedService(svc);
          setBookingOpen(true);
        }}
      />
    </div>
  );
}
