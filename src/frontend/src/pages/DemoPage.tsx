import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  Fingerprint,
  Globe,
  Key,
  Layers,
  LogIn,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const roles = [
  {
    id: "admin",
    title: "Admin",
    subtitle: "Platform Superuser",
    icon: Shield,
    badge: "Full Access",
    badgeStyle: "bg-destructive/10 text-destructive border-destructive/30",
    cardStyle: "border-destructive/20 bg-destructive/5",
    accentColor: "oklch(0.55 0.22 27)",
    features: [
      { icon: BarChart3, text: "View platform statistics & revenue" },
      { icon: Layers, text: "Add, edit & delete services" },
      { icon: ClipboardList, text: "Manage all customer bookings" },
      { icon: UserCheck, text: "Assign jobs to technicians" },
      { icon: Users, text: "Manage technician roster" },
      { icon: TrendingUp, text: "Monitor booking analytics" },
    ],
    demoSteps: [
      "Sign in with Internet Identity",
      "Go to /admin-setup and enter your Caffeine admin token",
      "You're now the admin — navigate to Admin Panel",
      "Use the sidebar: Overview, Services, Bookings, Technicians",
    ],
    highlight:
      "The app owner claims admin by visiting /admin-setup and entering the Caffeine admin token from their preview URL.",
  },
  {
    id: "customer",
    title: "Customer",
    subtitle: "Service Buyer",
    icon: BookOpen,
    badge: "Standard Access",
    badgeStyle: "bg-primary/10 text-primary border-primary/30",
    cardStyle: "border-primary/20 bg-primary/5",
    accentColor: "oklch(0.55 0.18 170)",
    features: [
      { icon: Globe, text: "Browse all services & categories" },
      { icon: ClipboardList, text: "Book services with date & time" },
      { icon: CheckCircle2, text: "View upcoming & past bookings" },
      { icon: AlertCircle, text: "Cancel pending bookings" },
      { icon: Layers, text: "Compare up to 3 services side-by-side" },
    ],
    demoSteps: [
      "Sign in with Internet Identity",
      "Choose 'Register as Customer' on first login",
      "Browse Services → pick a category",
      "Click 'Book Now' to schedule a service",
    ],
    highlight: "New users choose their role on first login.",
  },
  {
    id: "technician",
    title: "Technician",
    subtitle: "Service Professional",
    icon: Wrench,
    badge: "Professional Access",
    badgeStyle:
      "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/30",
    cardStyle: "border-amber-200/60 bg-amber-50/50",
    accentColor: "oklch(0.60 0.15 60)",
    features: [
      { icon: ClipboardList, text: "View jobs assigned by Admin" },
      { icon: Layers, text: "Kanban board: New → In Progress → Done" },
      { icon: TrendingUp, text: "Track earnings & job stats" },
      { icon: CheckCircle2, text: "Update job status in real-time" },
      { icon: Settings, text: "Specialize in one service category" },
    ],
    demoSteps: [
      "Sign in with Internet Identity",
      "Choose 'Register as Technician' on first login",
      "Admin assigns you incoming jobs",
      "Use the Kanban board to move jobs through stages",
    ],
    highlight:
      "Technicians register with a display name and specialization category.",
  },
];

const flowSteps = [
  {
    num: "01",
    title: "Sign In",
    desc: "Use Internet Identity — no username or password needed. One click, cryptographically secure.",
    icon: Fingerprint,
  },
  {
    num: "02",
    title: "Choose Role",
    desc: "First-time users pick Customer or Technician. Admins are assigned directly by the platform.",
    icon: UserCheck,
  },
  {
    num: "03",
    title: "Access Dashboard",
    desc: "The app routes you to the correct dashboard — Customer, Professional, or Admin.",
    icon: BarChart3,
  },
  {
    num: "04",
    title: "Start Using",
    desc: "Book services, manage jobs, or control the platform — depending on your role.",
    icon: Sparkles,
  },
];

export function DemoPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="hero-gradient relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(1 0 0) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/80">
              <Key className="w-3.5 h-3.5" />
              <span>
                No passwords required — Internet Identity handles auth
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Demo &{" "}
              <span style={{ color: "oklch(0.75 0.18 170)" }}>
                Access Guide
              </span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              This platform uses{" "}
              <strong className="text-white">Internet Identity</strong> — a
              decentralized, password-free login system on the Internet
              Computer. No accounts to create, no passwords to remember.
            </p>
            <Button
              size="lg"
              data-ocid="demo.login_button"
              onClick={login}
              disabled={isLoggingIn}
              className="gap-2 font-semibold text-base"
              style={{ background: "oklch(0.55 0.18 170)", color: "white" }}
            >
              {isLoggingIn ? (
                <>Signing in...</>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to Try the Demo
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── Why No Passwords ─── */}
      <section className="py-14 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-amber-200/60 bg-amber-50/60">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-foreground">
                  Why no demo username/password?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This app is built on the{" "}
                  <strong className="text-foreground">
                    Internet Computer Protocol (ICP)
                  </strong>
                  , where authentication uses cryptographic key pairs instead of
                  passwords.{" "}
                  <strong className="text-foreground">Internet Identity</strong>{" "}
                  creates a unique, anonymous identity for each app — no email,
                  no password, no data stored on any central server. It's more
                  secure than any password system.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  {[
                    "No passwords to hack",
                    "No emails collected",
                    "Cryptographically secure",
                    "Works on any device",
                  ].map((text) => (
                    <span
                      key={text}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── How to Use ─── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-black text-foreground mb-2">
              How to get started
            </h2>
            <p className="text-muted-foreground">
              4 steps from landing to fully using the platform
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative flex flex-col gap-3 p-5 bg-card rounded-2xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-display font-black text-2xl text-primary/30">
                      {step.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                      {step.desc}
                    </p>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-border hidden lg:block z-10" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── Role Cards ─── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-black text-foreground mb-2">
              Three roles, one platform
            </h2>
            <p className="text-muted-foreground">
              Each role gets a different dashboard tailored to their workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {roles.map((role, i) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  data-ocid={`demo.role.card.${i + 1}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`flex flex-col rounded-2xl border p-6 gap-5 ${role.cardStyle}`}
                >
                  {/* Role Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${role.accentColor}15` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: role.accentColor }}
                        />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-lg text-foreground">
                          {role.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {role.subtitle}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${role.badgeStyle}`}
                    >
                      {role.badge}
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      What you can do
                    </p>
                    <ul className="space-y-1.5">
                      {role.features.map((feature) => {
                        const FIcon = feature.icon;
                        return (
                          <li
                            key={feature.text}
                            className="flex items-center gap-2.5 text-sm text-foreground"
                          >
                            <FIcon
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: role.accentColor }}
                            />
                            {feature.text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <Separator className="opacity-40" />

                  {/* Demo Steps */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Demo flow
                    </p>
                    <ol className="space-y-1.5">
                      {role.demoSteps.map((step, si) => (
                        <li
                          key={step}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span
                            className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white shrink-0 mt-0.5"
                            style={{ background: role.accentColor }}
                          >
                            {si + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Highlight */}
                  <div
                    className="rounded-lg px-3 py-2 text-xs leading-relaxed"
                    style={{
                      background: `${role.accentColor}12`,
                      color: role.accentColor,
                    }}
                  >
                    💡 {role.highlight}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Role Access Table ─── */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-display text-2xl font-black text-foreground mb-6 text-center">
              Feature access by role
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm" data-ocid="demo.access.table">
                <thead>
                  <tr className="bg-secondary/60">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Feature
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-foreground">
                      Customer
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-foreground">
                      Technician
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-foreground">
                      Admin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Browse services", true, true, true],
                    ["Book a service", true, false, false],
                    ["View own bookings", true, false, false],
                    ["Cancel bookings", true, false, false],
                    ["Compare services", true, true, true],
                    ["View assigned jobs", false, true, false],
                    ["Kanban job board", false, true, false],
                    ["Update job status", false, true, true],
                    ["View earnings", false, true, false],
                    ["Manage services", false, false, true],
                    ["View all bookings", false, false, true],
                    ["Assign technicians", false, false, true],
                    ["Platform statistics", false, false, true],
                    ["Manage technicians", false, false, true],
                  ].map(([feature, customer, tech, admin]) => (
                    <tr
                      key={feature as string}
                      className="bg-card hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground font-medium">
                        {feature as string}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {customer ? (
                          <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tech ? (
                          <CheckCircle2
                            className="w-4 h-4 mx-auto"
                            style={{ color: "oklch(0.60 0.15 60)" }}
                          />
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {admin ? (
                          <CheckCircle2
                            className="w-4 h-4 mx-auto"
                            style={{ color: "oklch(0.55 0.22 27)" }}
                          />
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
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

      {/* ─── About Hosting & Data Storage ─── */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl font-black text-foreground mb-2">
              About Hosting & Data Storage
            </h2>
            <p className="text-muted-foreground">
              How Lepzo works without traditional servers or databases
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: Database,
                title: "Where is my data stored?",
                body: "All data is stored on the Internet Computer blockchain — a decentralized cloud hosted by independent data centers worldwide. No traditional server or database is needed.",
                accent: "oklch(0.55 0.18 220)",
                bg: "oklch(0.96 0.03 220)",
              },
              {
                icon: Server,
                title: "Do I need separate hosting?",
                body: "No. Lepzo runs entirely on the Internet Computer. Your app and its data are deployed as smart contracts (canisters), which are always online without any hosting provider.",
                accent: "oklch(0.55 0.18 170)",
                bg: "oklch(0.96 0.03 170)",
              },
              {
                icon: Globe,
                title: "Can I use a traditional database?",
                body: "The Internet Computer replaces traditional databases. Data is stored directly inside your canister's stable memory — no MySQL, PostgreSQL, or MongoDB required.",
                accent: "oklch(0.55 0.15 60)",
                bg: "oklch(0.96 0.04 60)",
              },
              {
                icon: ShieldCheck,
                title: "Is it secure?",
                body: "Yes. Data is replicated across multiple independent nodes, cryptographically secured, and cannot be tampered with. Security is built into the protocol.",
                accent: "oklch(0.52 0.18 145)",
                bg: "oklch(0.96 0.03 145)",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.45 }}
                  data-ocid={`demo.hosting.card.${i + 1}`}
                  className="flex gap-4 p-5 rounded-2xl border border-border bg-card"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: card.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.accent }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-foreground mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto space-y-5"
          >
            <h2 className="font-display text-4xl font-black text-white">
              Ready to explore?
            </h2>
            <p className="text-white/70 text-base">
              Sign in with Internet Identity — free, instant, no email required.
              Your identity is yours alone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                data-ocid="demo.cta.login_button"
                onClick={login}
                disabled={isLoggingIn}
                className="gap-2 font-semibold"
                style={{ background: "oklch(0.55 0.18 170)", color: "white" }}
              >
                <LogIn className="w-5 h-5" />
                {isLoggingIn
                  ? "Signing in..."
                  : "Sign In with Internet Identity"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                data-ocid="demo.cta.services_button"
                onClick={() => void navigate({ to: "/services" })}
                className="gap-2 font-semibold border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
              >
                Browse Services
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
