import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Droplets,
  Hammer,
  Paintbrush,
  Shield,
  SprayCanIcon as SprayCan,
  Star,
  Wind,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { ServiceCategory } from "../backend.d";

const categories = [
  {
    label: "Cleaning",
    icon: SprayCan,
    category: ServiceCategory.cleaning,
    color: "oklch(0.92 0.07 145)",
    iconColor: "oklch(0.38 0.14 145)",
    description: "Deep cleaning & sanitization",
  },
  {
    label: "Plumbing",
    icon: Droplets,
    category: ServiceCategory.plumbing,
    color: "oklch(0.92 0.06 220)",
    iconColor: "oklch(0.38 0.15 220)",
    description: "Leaks, pipes & installations",
  },
  {
    label: "Electrician",
    icon: Zap,
    category: ServiceCategory.electrician,
    color: "oklch(0.95 0.08 80)",
    iconColor: "oklch(0.45 0.14 80)",
    description: "Wiring, repairs & fitting",
  },
  {
    label: "Carpentry",
    icon: Hammer,
    category: ServiceCategory.carpentry,
    color: "oklch(0.94 0.07 55)",
    iconColor: "oklch(0.42 0.14 55)",
    description: "Furniture, doors & woodwork",
  },
  {
    label: "Painting",
    icon: Paintbrush,
    category: ServiceCategory.painting,
    color: "oklch(0.92 0.06 290)",
    iconColor: "oklch(0.38 0.15 290)",
    description: "Interior & exterior painting",
  },
  {
    label: "AC Repair",
    icon: Wind,
    category: ServiceCategory.acRepair,
    color: "oklch(0.92 0.07 190)",
    iconColor: "oklch(0.38 0.14 190)",
    description: "Service, repair & installation",
  },
];

const stats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "500+", label: "Verified Professionals" },
  { value: "4.8★", label: "Average Rating" },
  { value: "24/7", label: "Support Available" },
];

const features = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description:
      "Every service provider is background-checked, trained, and insured for your peace of mind.",
  },
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description:
      "We respect your time. Professionals arrive at your scheduled slot or we offer a discount.",
  },
  {
    icon: Star,
    title: "Quality Assured",
    description:
      "Not happy with the service? We'll send another professional at no extra charge.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: ServiceCategory) => {
    void navigate({ to: "/services", search: { category } });
  };

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(1 0 0) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-sm font-medium text-primary">
                <Star className="w-3.5 h-3.5" />
                <span>Trusted by 10,000+ homeowners</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
                Home services,{" "}
                <span
                  className="relative"
                  style={{ color: "oklch(0.75 0.18 170)" }}
                >
                  done right
                </span>
              </h1>

              <p className="text-lg text-white/70 leading-relaxed max-w-md">
                Book trusted professionals for cleaning, plumbing, electrical
                work, and more. Transparent pricing, no surprises.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() => void navigate({ to: "/services" })}
                  className="gap-2 shadow-primary text-base font-semibold"
                  style={{
                    background: "oklch(0.55 0.18 170)",
                    color: "white",
                  }}
                >
                  Browse Services
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="hidden md:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/assets/generated/hero-home-services.dim_1200x700.jpg"
                  alt="Professional home services"
                  className="w-full h-80 object-cover"
                />
                {/* Floating stats card */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-foreground">
                      4.9 / 5.0 Rating
                    </div>
                    <div className="text-xs text-muted-foreground">
                      From 5,200+ reviews
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="text-center"
              >
                <div className="font-display text-2xl font-black text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories Grid ─── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-black text-foreground mb-3">
              What do you need today?
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose from 6 service categories, all with verified professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategoryClick(cat.category)}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  style={{
                    boxShadow: "0 2px 8px oklch(0.13 0.02 260 / 0.06)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: cat.iconColor }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-display font-bold text-sm text-foreground">
                      {cat.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {cat.description}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-black text-foreground mb-3">
              Why homeowners choose us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex flex-col items-start gap-4 p-6 rounded-2xl border border-border bg-background"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="font-display text-4xl font-black text-white">
              Ready to get started?
            </h2>
            <p className="text-white/70 text-lg">
              Book your first service in under 2 minutes. Transparent pricing,
              no hidden fees.
            </p>
            <Button
              size="lg"
              onClick={() => void navigate({ to: "/services" })}
              className="gap-2 text-base font-semibold"
              style={{ background: "oklch(0.55 0.18 170)", color: "white" }}
            >
              Browse Services
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
