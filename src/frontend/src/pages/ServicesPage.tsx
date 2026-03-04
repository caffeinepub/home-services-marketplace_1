import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarPlus,
  Droplets,
  Hammer,
  Paintbrush,
  Search,
  SprayCanIcon as SprayCan,
  Wind,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type Service, ServiceCategory } from "../backend.d";
import { BookingModal } from "../components/BookingModal";
import {
  formatPriceRange,
  getCategoryLabel,
  useListServices,
} from "../hooks/useQueries";

const categoryIcons: Record<
  ServiceCategory,
  React.ComponentType<{ className?: string }>
> = {
  [ServiceCategory.cleaning]: SprayCan,
  [ServiceCategory.plumbing]: Droplets,
  [ServiceCategory.electrician]: Zap,
  [ServiceCategory.carpentry]: Hammer,
  [ServiceCategory.painting]: Paintbrush,
  [ServiceCategory.acRepair]: Wind,
};

const categoryColors: Record<ServiceCategory, string> = {
  [ServiceCategory.cleaning]: "oklch(0.92 0.07 145)",
  [ServiceCategory.plumbing]: "oklch(0.92 0.06 220)",
  [ServiceCategory.electrician]: "oklch(0.95 0.08 80)",
  [ServiceCategory.carpentry]: "oklch(0.94 0.07 55)",
  [ServiceCategory.painting]: "oklch(0.92 0.06 290)",
  [ServiceCategory.acRepair]: "oklch(0.92 0.07 190)",
};

const ALL_CATEGORIES = [
  ServiceCategory.cleaning,
  ServiceCategory.plumbing,
  ServiceCategory.electrician,
  ServiceCategory.carpentry,
  ServiceCategory.painting,
  ServiceCategory.acRepair,
];

// Seed services for initial display
const SEED_SERVICES: Service[] = [
  {
    id: 1n,
    name: "Standard Home Cleaning",
    description:
      "Complete cleaning of all rooms including kitchen and bathrooms. Uses eco-friendly products.",
    category: ServiceCategory.cleaning,
    minPrice: 80n,
    maxPrice: 150n,
  },
  {
    id: 2n,
    name: "Deep Cleaning Package",
    description:
      "Intensive cleaning for move-in/move-out or spring cleaning. Includes appliances and hard-to-reach areas.",
    category: ServiceCategory.cleaning,
    minPrice: 150n,
    maxPrice: 280n,
  },
  {
    id: 3n,
    name: "Pipe Leak Repair",
    description:
      "Fix leaking pipes, taps, and joints. Includes diagnosis, repair, and pressure testing.",
    category: ServiceCategory.plumbing,
    minPrice: 60n,
    maxPrice: 200n,
  },
  {
    id: 4n,
    name: "Bathroom Fixture Installation",
    description:
      "Install sinks, toilets, showers, and bathtubs. Professional fitting with warranty.",
    category: ServiceCategory.plumbing,
    minPrice: 120n,
    maxPrice: 400n,
  },
  {
    id: 5n,
    name: "Electrical Wiring Repair",
    description:
      "Diagnose and fix faulty wiring, circuit breakers, and electrical panels.",
    category: ServiceCategory.electrician,
    minPrice: 80n,
    maxPrice: 250n,
  },
  {
    id: 6n,
    name: "Light Fixture Installation",
    description:
      "Install ceiling lights, fans, or outdoor lighting. Includes wiring and fixtures.",
    category: ServiceCategory.electrician,
    minPrice: 50n,
    maxPrice: 150n,
  },
  {
    id: 7n,
    name: "Custom Furniture Assembly",
    description:
      "Assemble flat-pack furniture or build custom shelving and storage solutions.",
    category: ServiceCategory.carpentry,
    minPrice: 60n,
    maxPrice: 200n,
  },
  {
    id: 8n,
    name: "Door & Window Repair",
    description:
      "Fix sticking doors, replace hinges, repair frames, and weather-seal windows.",
    category: ServiceCategory.carpentry,
    minPrice: 80n,
    maxPrice: 220n,
  },
  {
    id: 9n,
    name: "Interior Room Painting",
    description:
      "Full interior painting with premium paints. Includes surface prep and two coats.",
    category: ServiceCategory.painting,
    minPrice: 200n,
    maxPrice: 600n,
  },
  {
    id: 10n,
    name: "Exterior House Painting",
    description:
      "Weather-resistant exterior painting. Includes primer and protective topcoat.",
    category: ServiceCategory.painting,
    minPrice: 400n,
    maxPrice: 1200n,
  },
  {
    id: 11n,
    name: "AC Servicing & Tune-up",
    description:
      "Clean filters, check refrigerant levels, and inspect all components for optimal performance.",
    category: ServiceCategory.acRepair,
    minPrice: 70n,
    maxPrice: 150n,
  },
  {
    id: 12n,
    name: "AC Installation",
    description:
      "Install split or window AC units. Includes mounting, wiring, and initial setup.",
    category: ServiceCategory.acRepair,
    minPrice: 200n,
    maxPrice: 500n,
  },
];

function ServiceCard({
  service,
  index,
  onBook,
}: { service: Service; index: number; onBook: (service: Service) => void }) {
  const Icon = categoryIcons[service.category] ?? SprayCan;
  const bgColor = categoryColors[service.category] ?? "oklch(0.94 0.01 250)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="service-card bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
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

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-black text-foreground mb-1">
            Our Services
          </h1>
          <p className="text-muted-foreground">
            Choose from {allServices.length} professional services
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
    </div>
  );
}
