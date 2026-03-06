import { Badge } from "@/components/ui/badge";
import { Database, GitBranch, Hash, Key, Link, Table2 } from "lucide-react";
import { motion } from "motion/react";

// ─── Type Definitions ──────────────────────────────────────────────────────────
interface ColumnDef {
  name: string;
  type: string;
  description: string;
  isPrimary?: boolean;
  isForeignKey?: boolean;
  fkRef?: string;
  isOptional?: boolean;
}

interface TableDef {
  name: string;
  description: string;
  color: string;
  headerColor: string;
  iconColor: string;
  columns: ColumnDef[];
  note?: string;
}

// ─── Type Badge Colors ─────────────────────────────────────────────────────────
const TYPE_BADGE_STYLES: Record<string, string> = {
  Principal:
    "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
  Text: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  Nat: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300",
  Float:
    "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300",
  Timestamp:
    "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  UserRole:
    "bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300",
  ServiceCategory:
    "bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300",
  BookingStatus:
    "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
  PaymentStatus:
    "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
  ProfessionalProfile:
    "bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300",
};

function getTypeBadgeStyle(type: string): string {
  // Strip optional marker for lookup
  const baseType = type.replace("?", "").split("(")[0].trim();
  return (
    TYPE_BADGE_STYLES[baseType] ??
    "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300"
  );
}

// ─── Table Definitions ─────────────────────────────────────────────────────────
const TABLES: TableDef[] = [
  {
    name: "Users",
    description:
      "All registered platform users — customers, professionals, and admins",
    color: "oklch(0.95 0.04 280)",
    headerColor: "oklch(0.88 0.08 280)",
    iconColor: "oklch(0.40 0.18 280)",
    columns: [
      {
        name: "id",
        type: "Principal",
        description: "Unique identity from Internet Identity",
        isPrimary: true,
      },
      {
        name: "role",
        type: "UserRole",
        description: "admin | user | guest — determines platform access",
      },
      {
        name: "mobileNumber",
        type: "Text?",
        description: "Optional phone number for contact",
        isOptional: true,
      },
      {
        name: "professional",
        type: "ProfessionalProfile?",
        description: "Present only for technicians; null for customers",
        isOptional: true,
      },
      {
        name: "createdAt",
        type: "Timestamp",
        description: "Account registration time (nanoseconds since epoch)",
      },
    ],
  },
  {
    name: "Technicians",
    description:
      "Subset of Users where professional profile is set — IT service providers",
    color: "oklch(0.95 0.04 200)",
    headerColor: "oklch(0.88 0.08 200)",
    iconColor: "oklch(0.38 0.16 200)",
    note: "Derived view — these are Users with professional != null",
    columns: [
      {
        name: "principal",
        type: "Principal",
        description: "Foreign key to Users table",
        isPrimary: true,
        isForeignKey: true,
        fkRef: "Users.id",
      },
      {
        name: "displayName",
        type: "Text",
        description: "Professional's public display name",
      },
      {
        name: "category",
        type: "ServiceCategory",
        description:
          "Specialization: laptopRepair | desktopRepair | computerSales | accessoriesSales | networkSetup | dataRecovery",
      },
      {
        name: "averageRating",
        type: "Float",
        description: "Computed from Reviews — 0–5 star average",
      },
      {
        name: "activeJobs",
        type: "Nat",
        description: "Count of confirmed/inProgress bookings",
      },
      {
        name: "completedJobs",
        type: "Nat",
        description: "Count of completed bookings",
      },
    ],
  },
  {
    name: "Services",
    description: "Service catalog — laptop repair, sales, and IT services",
    color: "oklch(0.95 0.04 145)",
    headerColor: "oklch(0.88 0.08 145)",
    iconColor: "oklch(0.38 0.16 145)",
    columns: [
      {
        name: "id",
        type: "Nat",
        description: "Auto-incrementing primary key",
        isPrimary: true,
      },
      {
        name: "name",
        type: "Text",
        description: "Service name shown to customers",
      },
      {
        name: "description",
        type: "Text",
        description: "Detailed description of what's included",
      },
      {
        name: "category",
        type: "ServiceCategory",
        description: "Service classification category",
      },
      {
        name: "minPrice",
        type: "Nat",
        description: "Minimum price in Indian Rupees (₹)",
      },
      {
        name: "maxPrice",
        type: "Nat",
        description: "Maximum price in Indian Rupees (₹)",
      },
    ],
  },
  {
    name: "Orders",
    description: "Customer bookings linking users to services and technicians",
    color: "oklch(0.95 0.05 60)",
    headerColor: "oklch(0.90 0.09 60)",
    iconColor: "oklch(0.42 0.15 60)",
    columns: [
      {
        name: "id",
        type: "Nat",
        description: "Auto-incrementing booking ID",
        isPrimary: true,
      },
      {
        name: "customer",
        type: "Principal",
        description: "The customer who placed this booking",
        isForeignKey: true,
        fkRef: "Users.id",
      },
      {
        name: "serviceId",
        type: "Nat",
        description: "References the booked service",
        isForeignKey: true,
        fkRef: "Services.id",
      },
      {
        name: "date",
        type: "Text",
        description: "Scheduled service date (YYYY-MM-DD format)",
      },
      {
        name: "timeSlot",
        type: "Text",
        description: "morning | afternoon | evening",
      },
      {
        name: "address",
        type: "Text",
        description: "Service delivery address provided by customer",
      },
      {
        name: "status",
        type: "BookingStatus",
        description: "pending | confirmed | inProgress | completed | cancelled",
      },
      {
        name: "assignedProfessional",
        type: "Principal?",
        description: "Technician assigned by admin; null if unassigned",
        isOptional: true,
        isForeignKey: true,
        fkRef: "Technicians.principal",
      },
      {
        name: "createdAt",
        type: "Timestamp",
        description: "Booking creation time (nanoseconds since epoch)",
      },
    ],
  },
  {
    name: "Payments",
    description:
      "Payment records linked to orders — tracks financial transactions",
    color: "oklch(0.95 0.04 170)",
    headerColor: "oklch(0.88 0.08 170)",
    iconColor: "oklch(0.38 0.16 170)",
    note: "Currently derived from Orders — native payment ledger coming in a future update",
    columns: [
      {
        name: "id",
        type: "Nat",
        description: "Auto-incrementing payment ID",
        isPrimary: true,
      },
      {
        name: "bookingId",
        type: "Nat",
        description: "References the associated order",
        isForeignKey: true,
        fkRef: "Orders.id",
      },
      {
        name: "customer",
        type: "Principal",
        description: "The user who made the payment",
        isForeignKey: true,
        fkRef: "Users.id",
      },
      {
        name: "amount",
        type: "Nat",
        description: "Payment amount in Indian Rupees (₹)",
      },
      {
        name: "status",
        type: "PaymentStatus",
        description: "pending | paid | refunded",
      },
      {
        name: "createdAt",
        type: "Timestamp",
        description: "Payment creation time (nanoseconds since epoch)",
      },
    ],
  },
  {
    name: "Reviews",
    description: "Customer ratings and feedback for completed service bookings",
    color: "oklch(0.95 0.04 30)",
    headerColor: "oklch(0.90 0.09 30)",
    iconColor: "oklch(0.42 0.16 30)",
    note: "Currently stored client-side in localStorage; will move to canister in a future update",
    columns: [
      {
        name: "id",
        type: "Nat",
        description: "Auto-incrementing review ID",
        isPrimary: true,
      },
      {
        name: "bookingId",
        type: "Nat",
        description: "References the reviewed booking",
        isForeignKey: true,
        fkRef: "Orders.id",
      },
      {
        name: "serviceId",
        type: "Nat",
        description: "References the reviewed service",
        isForeignKey: true,
        fkRef: "Services.id",
      },
      {
        name: "reviewer",
        type: "Principal",
        description: "The customer who left this review",
        isForeignKey: true,
        fkRef: "Users.id",
      },
      {
        name: "professional",
        type: "Principal?",
        description: "The technician being reviewed; null if unassigned",
        isOptional: true,
        isForeignKey: true,
        fkRef: "Technicians.principal",
      },
      {
        name: "rating",
        type: "Nat",
        description: "Star rating from 1 (poor) to 5 (excellent)",
      },
      {
        name: "comment",
        type: "Text",
        description: "Free-text customer feedback",
      },
      {
        name: "createdAt",
        type: "Timestamp",
        description: "Review submission time (nanoseconds since epoch)",
      },
    ],
  },
  {
    name: "Admin",
    description:
      "Platform configuration and branding settings managed by the admin",
    color: "oklch(0.95 0.04 320)",
    headerColor: "oklch(0.88 0.08 320)",
    iconColor: "oklch(0.40 0.16 320)",
    columns: [
      {
        name: "principal",
        type: "Principal",
        description: "The admin's Internet Identity principal",
        isPrimary: true,
        isForeignKey: true,
        fkRef: "Users.id",
      },
      {
        name: "siteName",
        type: "Text",
        description: "Platform name displayed in header (e.g. Lepzo)",
      },
      {
        name: "tagline",
        type: "Text",
        description: "Short platform tagline shown in hero and footer",
      },
      {
        name: "footerText",
        type: "Text",
        description: "Footer attribution text",
      },
      {
        name: "primaryColor",
        type: "Text",
        description: "Hex or OKLCH primary brand color used site-wide",
      },
      {
        name: "logoDataUrl",
        type: "Text?",
        description: "Base64-encoded logo image; null if using text logo",
        isOptional: true,
      },
    ],
  },
];

// ─── FK Relationships ──────────────────────────────────────────────────────────
const FK_RELATIONS: { from: string; to: string; cols: string }[] = [
  { from: "Orders", to: "Users", cols: "customer → Users.id" },
  { from: "Orders", to: "Services", cols: "serviceId → Services.id" },
  {
    from: "Orders",
    to: "Technicians",
    cols: "assignedProfessional → Technicians.principal",
  },
  { from: "Payments", to: "Orders", cols: "bookingId → Orders.id" },
  { from: "Payments", to: "Users", cols: "customer → Users.id" },
  { from: "Reviews", to: "Orders", cols: "bookingId → Orders.id" },
  { from: "Reviews", to: "Services", cols: "serviceId → Services.id" },
  { from: "Reviews", to: "Users", cols: "reviewer → Users.id" },
  {
    from: "Reviews",
    to: "Technicians",
    cols: "professional → Technicians.principal",
  },
  { from: "Admin", to: "Users", cols: "principal → Users.id" },
  {
    from: "Technicians",
    to: "Users",
    cols: "principal → Users.id (subset view)",
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium ${getTypeBadgeStyle(type)}`}
    >
      {type}
    </span>
  );
}

function TableCard({ table, index }: { table: TableDef; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      data-ocid={`db.schema.card.${index + 1}`}
    >
      {/* Table Header */}
      <div
        className="px-5 py-4 flex items-start gap-3"
        style={{ backgroundColor: table.headerColor }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
        >
          <Table2 className="w-4.5 h-4.5" style={{ color: table.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-black text-base text-gray-900">
              {table.name}
            </h3>
            <span className="text-xs text-gray-600 font-medium bg-white/60 rounded-full px-2 py-0.5">
              {table.columns.length} fields
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-0.5 leading-snug">
            {table.description}
          </p>
        </div>
      </div>

      {/* Note banner */}
      {table.note && (
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
          <GitBranch className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-snug">{table.note}</p>
        </div>
      )}

      {/* Columns */}
      <div className="divide-y divide-border">
        {/* Column header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-secondary/50">
          <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Field
          </div>
          <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Type
          </div>
          <div className="col-span-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </div>
        </div>

        {table.columns.map((col) => (
          <div
            key={col.name}
            className="grid grid-cols-12 gap-2 px-5 py-3 items-start hover:bg-secondary/30 transition-colors"
          >
            {/* Field name */}
            <div className="col-span-3 flex items-center gap-1.5 min-w-0">
              {col.isPrimary && (
                <Key className="w-3 h-3 text-amber-500 flex-shrink-0" />
              )}
              {col.isForeignKey && !col.isPrimary && (
                <Link className="w-3 h-3 text-blue-500 flex-shrink-0" />
              )}
              {!col.isPrimary && !col.isForeignKey && (
                <Hash className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
              )}
              <code className="text-xs font-mono font-semibold text-foreground truncate">
                {col.name}
              </code>
              {col.isOptional && (
                <span className="text-xs text-muted-foreground/60 font-mono flex-shrink-0">
                  ?
                </span>
              )}
            </div>

            {/* Type badge */}
            <div className="col-span-3">
              <TypeBadge type={col.type} />
            </div>

            {/* Description + FK note */}
            <div className="col-span-6 space-y-0.5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {col.description}
              </p>
              {col.fkRef && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  FK → {col.fkRef}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Type Legend ───────────────────────────────────────────────────────────────
const TYPE_LEGEND = [
  { type: "Principal", label: "Identity / UUID" },
  { type: "Text", label: "String" },
  { type: "Nat", label: "Integer ≥ 0" },
  { type: "Float", label: "Decimal number" },
  { type: "Timestamp", label: "Nanoseconds epoch" },
  { type: "UserRole", label: "Enum" },
  { type: "ServiceCategory", label: "Enum" },
  { type: "BookingStatus", label: "Enum" },
  { type: "PaymentStatus", label: "Enum" },
  { type: "ProfessionalProfile", label: "Nested object" },
];

// ─── Main DatabaseSchema Component ────────────────────────────────────────────
export function DatabaseSchema() {
  return (
    <section data-ocid="admin.database.section" className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Database className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-foreground">
            Database Schema
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5 max-w-2xl">
            Complete data dictionary for the Lepzo platform. All data is stored
            on-chain in the ICP canister using Motoko stable variables — no
            external database required.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Tables",
            value: TABLES.length,
            color: "oklch(0.92 0.06 220)",
            iconColor: "oklch(0.38 0.15 220)",
          },
          {
            label: "Total Fields",
            value: TABLES.reduce((s, t) => s + t.columns.length, 0),
            color: "oklch(0.92 0.07 145)",
            iconColor: "oklch(0.38 0.14 145)",
          },
          {
            label: "Relationships",
            value: FK_RELATIONS.length,
            color: "oklch(0.95 0.08 60)",
            iconColor: "oklch(0.45 0.14 60)",
          },
          {
            label: "Storage",
            value: "On-Chain",
            color: "oklch(0.95 0.07 280)",
            iconColor: "oklch(0.45 0.15 280)",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="font-display font-black text-xl text-foreground">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Type Legend */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          Type Legend
        </h3>
        <div className="flex flex-wrap gap-2">
          {TYPE_LEGEND.map(({ type, label }) => (
            <div key={type} className="flex items-center gap-1.5">
              <TypeBadge type={type} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Icons legend */}
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Key className="w-3 h-3 text-amber-500" />
            Primary Key
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link className="w-3 h-3 text-blue-500" />
            Foreign Key
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="w-3 h-3 text-muted-foreground/50" />
            Regular Field
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-xs font-mono text-muted-foreground/60">
              ?
            </span>
            Optional (nullable)
          </div>
        </div>
      </div>

      {/* Table Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {TABLES.map((table, i) => (
          <TableCard key={table.name} table={table} index={i} />
        ))}
      </div>

      {/* FK Relationships Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/50">
          <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Foreign Key Relationships
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            All cross-table references linking entities together
          </p>
        </div>

        <div className="divide-y divide-border">
          <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-secondary/30">
            <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              From Table
            </div>
            <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              To Table
            </div>
            <div className="col-span-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Relationship
            </div>
          </div>
          {FK_RELATIONS.map((rel, i) => (
            <motion.div
              key={`${rel.from}-${rel.to}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-secondary/30 transition-colors"
              data-ocid={`db.fk.row.${i + 1}`}
            >
              <div className="col-span-3">
                <Badge
                  variant="outline"
                  className="text-xs font-mono font-medium"
                >
                  {rel.from}
                </Badge>
              </div>
              <div className="col-span-3">
                <Badge
                  variant="outline"
                  className="text-xs font-mono font-medium"
                >
                  {rel.to}
                </Badge>
              </div>
              <div className="col-span-6">
                <code className="text-xs text-muted-foreground font-mono">
                  {rel.cols}
                </code>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Storage Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-5"
        data-ocid="db.storage_note.panel"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold text-base text-foreground mb-1">
              About Lepzo's Data Storage
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All platform data is stored directly on the{" "}
              <strong className="text-foreground">
                Internet Computer Protocol (ICP)
              </strong>{" "}
              blockchain using Motoko stable variables. This means your data
              persists across canister upgrades without any external database,
              cloud provider, or server — making Lepzo{" "}
              <strong className="text-foreground">
                fully decentralized and self-sovereign
              </strong>
              . Reviews and payment records are currently client-side
              (localStorage) and will be migrated to on-chain storage in a
              future update.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
