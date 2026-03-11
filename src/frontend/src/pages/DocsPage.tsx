import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronRight,
  Globe,
  Layers,
  MapPin,
  Navigation,
  Settings,
  Shield,
  Star,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const sections = [
  { id: "introduction", label: "Introduction", icon: BookOpen },
  { id: "getting-started", label: "Getting Started", icon: Zap },
  { id: "customer-guide", label: "Customer Guide", icon: User },
  { id: "technician-guide", label: "Technician Guide", icon: Wrench },
  { id: "admin-guide", label: "Admin Guide", icon: Shield },
  { id: "map-location", label: "Map & Location", icon: MapPin },
  { id: "faq", label: "FAQ", icon: Star },
];

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className="mb-14 scroll-mt-24"
    >
      <h2 className="font-display text-2xl font-bold text-foreground mb-6 pb-3 border-b border-border">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {num}
      </div>
      <div>
        <div className="font-semibold text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function Callout({
  icon: Icon,
  color,
  children,
}: {
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex gap-3 rounded-xl p-4 border"
      style={{ borderColor: `${color}40`, background: `${color}10` }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} />
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 text-primary mb-3">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">
                Documentation
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">
              Lepzo Help Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Complete guide to using Lepzo — the IT services marketplace for
              computer repairs, laptop servicing, accessories, and more.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {sections.map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    data-ocid={`docs.${s.id.replace(/-/g, "_")}.link`}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {s.label}
                    {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-3xl">
            {/* ── Introduction ── */}
            <DocSection id="introduction" title="Introduction">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                <strong className="text-foreground">Lepzo</strong> is an
                on-demand IT services marketplace built on the Internet Computer
                blockchain. It connects customers who need computer or laptop
                repairs/services with certified local technicians — like Urban
                Company, but exclusively for IT hardware and software.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  {
                    icon: User,
                    title: "Customers",
                    desc: "Browse services, book a technician, track job progress, and pay securely.",
                    color: "oklch(0.55 0.18 240)",
                  },
                  {
                    icon: Wrench,
                    title: "Technicians",
                    desc: "Accept jobs, manage work orders, set your location, and grow your income.",
                    color: "oklch(0.60 0.20 45)",
                  },
                  {
                    icon: Shield,
                    title: "Admins",
                    desc: "Manage the platform, configure services, review analytics and branding.",
                    color: "oklch(0.52 0.17 145)",
                  },
                ].map((role) => (
                  <div
                    key={role.title}
                    className="rounded-xl border border-border p-4 space-y-2"
                    style={{ borderLeftColor: role.color, borderLeftWidth: 3 }}
                  >
                    <div className="flex items-center gap-2">
                      <role.icon
                        className="w-4 h-4"
                        style={{ color: role.color }}
                      />
                      <span className="font-semibold text-foreground text-sm">
                        {role.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{role.desc}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ── Getting Started ── */}
            <DocSection id="getting-started" title="Getting Started">
              <p className="text-muted-foreground mb-6">
                Lepzo uses{" "}
                <strong className="text-foreground">Internet Identity</strong> —
                a decentralized, passwordless authentication system built on
                ICP. No passwords, no email required.
              </p>
              <div className="space-y-5">
                <Step
                  num={1}
                  title="Click 'Sign In'"
                  desc="Tap the Sign In button in the navbar. Internet Identity opens in a popup."
                />
                <Step
                  num={2}
                  title="Authenticate via Internet Identity"
                  desc="Use your device's biometrics (Face ID, fingerprint) or a passkey. No password needed."
                />
                <Step
                  num={3}
                  title="Choose Your Role"
                  desc="On first login, you'll be taken to a registration page. Select 'Customer' or 'Technician'."
                />
                <Step
                  num={4}
                  title="Access Your Dashboard"
                  desc="After registration, you're redirected to your role-specific dashboard automatically."
                />
              </div>
              <div className="mt-6">
                <Callout icon={Globe} color="oklch(0.55 0.18 240)">
                  All your data is stored on-chain in an ICP canister. It's
                  available across all devices and browsers — no sync needed.
                </Callout>
              </div>
            </DocSection>

            {/* ── Customer Guide ── */}
            <DocSection id="customer-guide" title="Customer Guide">
              <div className="space-y-8">
                <div>
                  <h3 className="font-display font-semibold text-lg mb-3">
                    Browsing & Booking Services
                  </h3>
                  <div className="space-y-4">
                    <Step
                      num={1}
                      title="Browse Services"
                      desc="Go to 'Browse Services' in the navbar. Filter by category (Laptop Repair, Desktop Repair, etc.)."
                    />
                    <Step
                      num={2}
                      title="Select a Service"
                      desc="Click 'Book Now' on any service card. You can compare up to 3 services before booking."
                    />
                    <Step
                      num={3}
                      title="Choose Date & Time"
                      desc="Pick a date from the calendar and a time slot (Morning, Afternoon, or Evening)."
                    />
                    <Step
                      num={4}
                      title="Enter Your Address"
                      desc="Provide your address so the technician knows where to visit."
                    />
                    <Step
                      num={5}
                      title="Confirm Booking"
                      desc="Review and confirm. You'll see the booking in your Customer Dashboard under 'Upcoming'."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Find Nearby
                    Technicians
                  </h3>
                  <div className="space-y-4">
                    <Step
                      num={1}
                      title="Open 'Find Nearby' Tab"
                      desc="In your Customer Dashboard, click the 'Find Nearby' tab. Allow location access when prompted."
                    />
                    <Step
                      num={2}
                      title="View Map"
                      desc="A map shows your location (blue dot) and nearby technicians (orange markers). Click a marker for details."
                    />
                    <Step
                      num={3}
                      title="Sort by Distance"
                      desc="Below the map, technicians are listed sorted by distance. The closest ones appear first."
                    />
                    <Step
                      num={4}
                      title="Book Directly"
                      desc="Click 'Book Service' on any technician card or 'Book Now' in a map popup to go to the services page."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-lg mb-3">
                    Chat, Invoice & Reviews
                  </h3>
                  <div className="space-y-4">
                    <Step
                      num={1}
                      title="Chat with Technician"
                      desc="Once a booking is confirmed or in-progress, a chat icon appears on the booking card."
                    />
                    <Step
                      num={2}
                      title="Download Invoice"
                      desc="Completed bookings show a 'Download Invoice' button. The PDF includes all booking details."
                    />
                    <Step
                      num={3}
                      title="Leave a Review"
                      desc="After a job is completed, rate the service with 1–5 stars and a comment."
                    />
                  </div>
                </div>
              </div>
            </DocSection>

            {/* ── Technician Guide ── */}
            <DocSection id="technician-guide" title="Technician Guide">
              <div className="space-y-8">
                <div>
                  <h3 className="font-display font-semibold text-lg mb-3">
                    Registering as a Technician
                  </h3>
                  <div className="space-y-4">
                    <Step
                      num={1}
                      title="Sign In"
                      desc="Click Sign In and authenticate via Internet Identity."
                    />
                    <Step
                      num={2}
                      title="Select 'Technician' Role"
                      desc="On the registration page, choose Technician, enter your display name, and select your specialization category."
                    />
                    <Step
                      num={3}
                      title="Dashboard Access"
                      desc="You're redirected to your Professional Dashboard showing Kanban job board and earnings."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" /> Setting Your
                    Location
                  </h3>
                  <div className="space-y-4">
                    <Step
                      num={1}
                      title="Scroll to 'My Location' Section"
                      desc="In your Professional Dashboard, scroll down to find the 'My Location' section."
                    />
                    <Step
                      num={2}
                      title="Detect & Save Location"
                      desc="Click 'Detect & Save My Location'. Allow browser location access. Your coordinates are saved on-chain."
                    />
                    <Step
                      num={3}
                      title="Appear on Customer Map"
                      desc="Once saved, customers using 'Find Nearby' can see your pin on the map and see your distance."
                    />
                  </div>
                  <div className="mt-4">
                    <Callout icon={Shield} color="oklch(0.52 0.17 145)">
                      <strong>Privacy:</strong> Your location is only shared
                      when you explicitly click "Detect & Save My Location". You
                      can update it any time. Customers see your general area,
                      not your real-time GPS position.
                    </Callout>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-lg mb-3">
                    Managing Jobs (Kanban Board)
                  </h3>
                  <div className="space-y-4">
                    <Step
                      num={1}
                      title="New Orders"
                      desc="Jobs assigned by admin appear in the 'New Orders' column as Confirmed status."
                    />
                    <Step
                      num={2}
                      title="Start a Job"
                      desc="Click 'Start Job' to move it to 'In Progress'. This notifies the customer."
                    />
                    <Step
                      num={3}
                      title="Complete a Job"
                      desc="Click 'Mark Complete' when done. The booking moves to 'Completed' and the customer can review."
                    />
                    <Step
                      num={4}
                      title="Chat"
                      desc="Use the chat button on each job card to communicate with the customer in real time."
                    />
                  </div>
                </div>
              </div>
            </DocSection>

            {/* ── Admin Guide ── */}
            <DocSection id="admin-guide" title="Admin Guide">
              <div className="space-y-8">
                <div>
                  <h3 className="font-display font-semibold text-lg mb-3">
                    Admin Setup
                  </h3>
                  <div className="space-y-4">
                    <Step
                      num={1}
                      title="Open Admin Setup URL"
                      desc="Navigate to your Lepzo preview URL with the ?caffeineAdminToken=... parameter appended."
                    />
                    <Step
                      num={2}
                      title="Go to /admin-setup"
                      desc="The page auto-detects the token and claims admin after you sign in with Internet Identity."
                    />
                    <Step
                      num={3}
                      title="Access Admin Panel"
                      desc="Once claimed, navigate to /dashboard/admin or click 'Dashboard' in the navbar."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-lg mb-3">
                    Admin Panel Sections
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      {
                        title: "Overview",
                        desc: "Platform stats, quick start guide, and health metrics.",
                      },
                      {
                        title: "Services",
                        desc: "Add, edit, or delete service offerings with pricing.",
                      },
                      {
                        title: "Bookings",
                        desc: "View all bookings, override status, assign to technicians.",
                      },
                      {
                        title: "Technicians",
                        desc: "See all registered technicians, their categories and principals.",
                      },
                      {
                        title: "Customers",
                        desc: "View all customer accounts and their booking history.",
                      },
                      {
                        title: "Branding",
                        desc: "Customize logo, site name, colors, header and footer text.",
                      },
                      {
                        title: "Payments",
                        desc: "View revenue breakdown and payment summaries.",
                      },
                      {
                        title: "Database",
                        desc: "Visual schema viewer for all on-chain data tables.",
                      },
                      {
                        title: "Admins",
                        desc: "Promote another user to admin by entering their Principal ID.",
                      },
                    ].map((s) => (
                      <div
                        key={s.title}
                        className="rounded-lg border border-border p-3 space-y-1"
                      >
                        <div className="font-medium text-sm text-foreground">
                          {s.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DocSection>

            {/* ── Map & Location ── */}
            <DocSection id="map-location" title="Map & Location Feature">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Lepzo integrates an interactive map powered by{" "}
                <strong className="text-foreground">OpenStreetMap</strong> and{" "}
                <strong className="text-foreground">react-leaflet</strong> — no
                API key required, completely free and open-source.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <User className="w-4 h-4 text-blue-500" /> For Customers
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Open "Find Nearby" tab in Customer Dashboard
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Browser requests location permission
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Your position shown as blue dot
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Nearby technicians shown as orange pins
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Distance calculated using Haversine formula
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      List sorted by nearest first
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Wrench className="w-4 h-4 text-orange-500" /> For
                    Technicians
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Scroll to "My Location" in Professional Dashboard
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Click "Detect & Save My Location"
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Location stored on ICP blockchain
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Appears instantly on customer maps
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                      Update any time — just click again
                    </li>
                  </ul>
                </div>
              </div>

              <Callout icon={Shield} color="oklch(0.52 0.17 145)">
                <strong>Privacy Notice:</strong> Customer locations are only
                used client-side for map display — they are never sent to the
                backend or stored. Technician locations are only saved when they
                explicitly trigger the "Detect & Save" action. Customers see the
                technician's last saved position, not real-time GPS.
              </Callout>

              <div className="mt-6 rounded-xl border border-border p-5 space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Technical Details
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    {
                      label: "Map Library",
                      value: "react-leaflet v5 + Leaflet v1.9",
                    },
                    {
                      label: "Tile Provider",
                      value: "OpenStreetMap (free, no API key)",
                    },
                    {
                      label: "Distance Formula",
                      value: "Haversine (great-circle distance)",
                    },
                    {
                      label: "Geolocation API",
                      value: "W3C Geolocation API (browser native)",
                    },
                    {
                      label: "Location Storage",
                      value: "ICP canister (on-chain)",
                    },
                    {
                      label: "Coordinate Precision",
                      value: "Degrees (float64, ~1m accuracy)",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{row.label}</span>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {row.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </DocSection>

            {/* ── FAQ ── */}
            <DocSection id="faq" title="Frequently Asked Questions">
              <div className="space-y-6">
                {[
                  {
                    q: "Why does Lepzo use Internet Identity instead of email/password?",
                    a: "Internet Identity is a decentralized, passwordless auth system on ICP. It uses your device biometrics or passkey — no passwords to leak, no email to verify, no server to hack.",
                  },
                  {
                    q: "Can I use Lepzo on mobile?",
                    a: "Lepzo is desktop-first and optimized for wider screens. It works on mobile browsers but the experience is best on desktop or tablet.",
                  },
                  {
                    q: "How do I become an admin?",
                    a: "Open your Lepzo preview URL with the ?caffeineAdminToken= parameter, then navigate to /admin-setup and sign in. The page auto-claims admin. To add another admin, go to Admin Panel → Admins and enter their Principal ID.",
                  },
                  {
                    q: "Is my location data private?",
                    a: "Yes. Customer locations are never sent to the backend. Technician locations are only saved when they explicitly click 'Detect & Save My Location'.",
                  },
                  {
                    q: "What if a technician hasn't set their location?",
                    a: "They won't appear on the customer's nearby map. Only technicians who have saved their location are shown as pins.",
                  },
                  {
                    q: "Can I change my technician display name or category?",
                    a: "Currently, you'd need to contact the admin or re-register. A profile edit feature is on the roadmap.",
                  },
                  {
                    q: "Why do prices show in ₹ (Indian Rupees)?",
                    a: "Lepzo is tailored for the Indian IT services market. All pricing is in Indian Rupees.",
                  },
                ].map((faq, i) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-border p-5 space-y-2"
                    data-ocid={`docs.faq.item.${i + 1}`}
                  >
                    <div className="font-semibold text-foreground text-sm">
                      {faq.q}
                    </div>
                    <div className="text-sm text-muted-foreground">{faq.a}</div>
                  </div>
                ))}
              </div>
            </DocSection>
          </main>
        </div>
      </div>
    </div>
  );
}
