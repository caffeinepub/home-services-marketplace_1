import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  HardDrive,
  Info,
  Key,
  Laptop,
  Loader2,
  LogIn,
  Monitor,
  Mouse,
  Phone,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Star,
  Wifi,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { ServiceCategory } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const categories = [
  {
    label: "Laptop Repair",
    icon: Laptop,
    category: ServiceCategory.laptopRepair,
    color: "oklch(0.92 0.07 220)",
    iconColor: "oklch(0.38 0.15 220)",
    description: "Screen, battery & keyboard fixes",
  },
  {
    label: "Desktop Repair",
    icon: Monitor,
    category: ServiceCategory.desktopRepair,
    color: "oklch(0.92 0.06 260)",
    iconColor: "oklch(0.38 0.14 260)",
    description: "Diagnostics & hardware upgrades",
  },
  {
    label: "Computer Sales",
    icon: ShoppingCart,
    category: ServiceCategory.computerSales,
    color: "oklch(0.92 0.07 170)",
    iconColor: "oklch(0.38 0.14 170)",
    description: "Refurbished & custom-built PCs",
  },
  {
    label: "Accessories",
    icon: Mouse,
    category: ServiceCategory.accessoriesSales,
    color: "oklch(0.94 0.07 55)",
    iconColor: "oklch(0.42 0.14 55)",
    description: "Monitors, keyboards & more",
  },
  {
    label: "Network Setup",
    icon: Wifi,
    category: ServiceCategory.networkSetup,
    color: "oklch(0.92 0.06 195)",
    iconColor: "oklch(0.38 0.14 195)",
    description: "Home & office Wi-Fi solutions",
  },
  {
    label: "Data Recovery",
    icon: HardDrive,
    category: ServiceCategory.dataRecovery,
    color: "oklch(0.92 0.06 30)",
    iconColor: "oklch(0.38 0.15 30)",
    description: "HDD, SSD & USB recovery",
  },
];

const stats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "200+", label: "Certified Technicians" },
  { value: "4.9★", label: "Average Rating" },
  { value: "Same Day", label: "Same-Day Service" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Certified Technicians",
    description:
      "All technicians are trained and certified. We vet every professional before they join our platform.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description:
      "Most repairs are completed same day or next day. We know how important your device is to you.",
  },
  {
    icon: Wrench,
    title: "Warranty on Repairs",
    description:
      "All repairs come with a 90-day parts & labor warranty. If it breaks again, we fix it for free.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useInternetIdentity();
  const [mobileInput, setMobileInput] = useState("");
  const [mobileError, setMobileError] = useState("");

  const handleCategoryClick = (category: ServiceCategory) => {
    void navigate({ to: "/services", search: { category } });
  };

  const handleLoginAndContinue = () => {
    // Save mobile to localStorage if entered
    if (mobileInput.trim()) {
      const digits = mobileInput.replace(/\D/g, "");
      if (digits.length < 10) {
        setMobileError("Please enter at least 10 digits");
        return;
      }
      setMobileError("");
      localStorage.setItem("lepzo_pending_mobile", mobileInput.trim());
    }
    login();
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
                <span>Trusted by 10,000+ customers</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
                Computer services,{" "}
                <span
                  className="relative"
                  style={{ color: "oklch(0.75 0.18 170)" }}
                >
                  done right
                </span>
              </h1>

              <p className="text-lg text-white/70 leading-relaxed max-w-md">
                Book certified technicians for laptop repair, desktop servicing,
                data recovery, and more. Transparent pricing, no surprises.
              </p>

              {/* ── Mobile CTA card ── FIX #3: stronger hierarchy */}
              <div className="max-w-sm space-y-4">
                {/* Card */}
                <div className="rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/[0.14] p-5 space-y-3.5 shadow-lg shadow-black/20">
                  {/* Header row */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">
                        Enter your mobile number
                      </p>
                      <p className="text-xs text-white/50 leading-tight mt-0.5">
                        Saved to your profile for service updates
                      </p>
                    </div>
                  </div>

                  {/* Input + button stacked */}
                  <div className="space-y-2.5">
                    <div className="relative">
                      <input
                        id="hero-mobile"
                        type="tel"
                        data-ocid="landing.mobile_input"
                        placeholder="+91 98765 43210"
                        value={mobileInput}
                        onChange={(e) => {
                          setMobileInput(e.target.value);
                          setMobileError("");
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/35 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/35 transition-all"
                      />
                    </div>
                    {mobileError && (
                      <p className="text-xs text-red-300 flex items-center gap-1">
                        <span>⚠</span> {mobileError}
                      </p>
                    )}
                    <Button
                      size="lg"
                      data-ocid="landing.login_continue_button"
                      onClick={handleLoginAndContinue}
                      disabled={isLoggingIn}
                      className="w-full gap-2 font-bold text-sm h-11"
                      style={{
                        background: "oklch(0.55 0.18 170)",
                        color: "white",
                        boxShadow: "0 4px 20px oklch(0.55 0.18 170 / 0.45)",
                      }}
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Signing
                          in…
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" /> Login & Continue
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Divider row */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span className="text-xs text-white/40 font-medium">
                    or just browse
                  </span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>

                <div className="flex gap-2.5">
                  <Button
                    size="default"
                    data-ocid="landing.browse_services_button"
                    onClick={() => void navigate({ to: "/services" })}
                    className="flex-1 gap-1.5 font-semibold border-white/25 text-white/85 hover:bg-white/10 hover:text-white bg-transparent border text-sm"
                  >
                    Browse Services
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
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
                  src="/assets/generated/hero-computer-services.dim_1200x700.jpg"
                  alt="Professional computer repair and sales services"
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
                      From 8,400+ reviews
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
              Choose from 6 computer & tech service categories
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
                  data-ocid={`landing.category.button.${i + 1}`}
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
              Why customers choose us
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

      {/* ─── Roles Section ─── */}
      <section
        className="py-20 bg-background border-t border-border"
        data-ocid="landing.roles.section"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-black text-foreground mb-3">
              Who uses Lepzo?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three distinct roles power the platform — each with a tailored
              experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Customer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.92 0.07 220)" }}
                >
                  <BookOpen
                    className="w-5 h-5"
                    style={{ color: "oklch(0.38 0.15 220)" }}
                  />
                </div>
                <div>
                  <p className="font-display font-bold text-base text-foreground">
                    Customer
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: "oklch(0.92 0.07 220)",
                      color: "oklch(0.38 0.15 220)",
                    }}
                  >
                    After sign-in → Register as Customer
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "Browse & compare services",
                  "Book with calendar & time slot",
                  "Track booking status",
                  "Chat with assigned technician",
                  "Download PDF invoices",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Technician */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.92 0.07 170)" }}
                >
                  <Wrench
                    className="w-5 h-5"
                    style={{ color: "oklch(0.38 0.14 170)" }}
                  />
                </div>
                <div>
                  <p className="font-display font-bold text-base text-foreground">
                    Technician
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: "oklch(0.92 0.07 170)",
                      color: "oklch(0.38 0.14 170)",
                    }}
                  >
                    After sign-in → Register as Technician
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "View assigned jobs (Kanban board)",
                  "Move jobs: New → In Progress → Done",
                  "Chat with customers",
                  "Track earnings & job history",
                  "Manage professional profile",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Admin */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-2xl border-2 bg-card p-6 flex flex-col gap-4"
              style={{ borderColor: "oklch(0.55 0.18 170)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.92 0.08 30)" }}
                >
                  <Shield
                    className="w-5 h-5"
                    style={{ color: "oklch(0.45 0.15 30)" }}
                  />
                </div>
                <div>
                  <p className="font-display font-bold text-base text-foreground">
                    Admin
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: "oklch(0.92 0.08 30)",
                      color: "oklch(0.45 0.15 30)",
                    }}
                  >
                    One-time setup via admin token
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "Full platform overview & analytics",
                  "Add / edit / delete services",
                  "Assign bookings to technicians",
                  "Manage all bookings & statuses",
                  "Customize branding (logo, colors)",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* ── Become an Admin ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border-2 p-8 max-w-3xl mx-auto mb-16"
            style={{
              borderColor: "oklch(0.55 0.18 170)",
              background: "oklch(0.97 0.02 170)",
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.92 0.07 30)" }}
              >
                <Key
                  className="w-6 h-6"
                  style={{ color: "oklch(0.45 0.15 30)" }}
                />
              </div>
              <div>
                <h3 className="font-display font-black text-2xl text-foreground mb-1">
                  Setting Up as Admin
                </h3>
                <p className="text-muted-foreground text-sm">
                  Follow these steps to claim the admin role for your Lepzo
                  installation.
                </p>
              </div>
            </div>

            <ol className="space-y-3 mb-6">
              {(
                [
                  {
                    id: "step-open",
                    content: "Open your Lepzo preview URL in the browser.",
                  },
                  {
                    id: "step-url",
                    content: (
                      <>
                        Look at the URL — it contains{" "}
                        <code className="font-mono text-sm bg-background px-1.5 py-0.5 rounded border border-border">
                          ?caffeineAdminToken=YOUR_TOKEN_HERE
                        </code>
                      </>
                    ),
                  },
                  {
                    id: "step-copy",
                    content:
                      "Copy that token value (everything after the = sign).",
                  },
                  {
                    id: "step-navigate",
                    content: (
                      <>
                        Navigate to <strong>/admin-setup</strong> in the app.
                      </>
                    ),
                  },
                  {
                    id: "step-claim",
                    content:
                      'Sign in with Internet Identity, then paste the token and click "Claim Admin Role".',
                  },
                ] as { id: string; content: React.ReactNode }[]
              ).map(({ id, content }, i) => (
                <li
                  key={id}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                    style={{ background: "oklch(0.55 0.18 170)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{content}</span>
                </li>
              ))}
            </ol>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background border border-border mb-6">
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                The admin token is only visible in the Caffeine preview URL. It
                is a <strong>one-time setup</strong> — once claimed, it cannot
                be used again by anyone else.
              </p>
            </div>

            <Link to="/admin-setup">
              <Button
                size="lg"
                data-ocid="landing.admin_setup_button"
                className="gap-2 font-semibold"
                style={{ background: "oklch(0.55 0.18 170)", color: "white" }}
              >
                <ExternalLink className="w-4 h-4" />
                Go to Admin Setup
              </Button>
            </Link>
          </motion.div>

          {/* ── Access by Role Table ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-display font-black text-2xl text-foreground text-center mb-6">
              Access by Role
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card max-w-3xl mx-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-5 py-3 font-display font-bold text-foreground">
                      Feature
                    </th>
                    <th
                      className="text-center px-4 py-3 font-display font-bold"
                      style={{ color: "oklch(0.38 0.15 220)" }}
                    >
                      Customer
                    </th>
                    <th
                      className="text-center px-4 py-3 font-display font-bold"
                      style={{ color: "oklch(0.38 0.14 170)" }}
                    >
                      Technician
                    </th>
                    <th
                      className="text-center px-4 py-3 font-display font-bold"
                      style={{ color: "oklch(0.45 0.15 30)" }}
                    >
                      Admin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      {
                        feature: "Browse Services",
                        customer: true,
                        tech: true,
                        admin: true,
                      },
                      {
                        feature: "Book a Service",
                        customer: true,
                        tech: false,
                        admin: false,
                      },
                      {
                        feature: "Track My Bookings",
                        customer: true,
                        tech: false,
                        admin: false,
                      },
                      {
                        feature: "In-app Chat",
                        customer: true,
                        tech: true,
                        admin: false,
                      },
                      {
                        feature: "PDF Invoice Download",
                        customer: true,
                        tech: false,
                        admin: false,
                      },
                      {
                        feature: "Kanban Job Board",
                        customer: false,
                        tech: true,
                        admin: false,
                      },
                      {
                        feature: "Earnings Dashboard",
                        customer: false,
                        tech: true,
                        admin: false,
                      },
                      {
                        feature: "Manage Services (CRUD)",
                        customer: false,
                        tech: false,
                        admin: true,
                      },
                      {
                        feature: "Assign Bookings to Techs",
                        customer: false,
                        tech: false,
                        admin: true,
                      },
                      {
                        feature: "Platform Analytics",
                        customer: false,
                        tech: false,
                        admin: true,
                      },
                      {
                        feature: "Branding & Customization",
                        customer: false,
                        tech: false,
                        admin: true,
                      },
                    ] as {
                      feature: string;
                      customer: boolean;
                      tech: boolean;
                      admin: boolean;
                    }[]
                  ).map(({ feature, customer, tech, admin }, i) => (
                    <tr
                      key={feature}
                      className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-secondary/20"}`}
                    >
                      <td className="px-5 py-3 text-foreground font-medium">
                        {feature}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {customer ? (
                          <span className="text-primary font-bold text-base">
                            ✓
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-base">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tech ? (
                          <span className="text-primary font-bold text-base">
                            ✓
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-base">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {admin ? (
                          <span className="text-primary font-bold text-base">
                            ✓
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-base">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
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
              Ready to fix your tech?
            </h2>
            <p className="text-white/70 text-lg">
              Book a technician in under 2 minutes. Transparent pricing, no
              hidden fees.
            </p>
            <Button
              size="lg"
              data-ocid="landing.cta_button"
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
