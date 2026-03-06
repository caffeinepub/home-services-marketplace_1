import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CreditCard, IndianRupee, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { BookingStatus } from "../backend.d";
import {
  formatPrice,
  shortenPrincipal,
  useAllBookings,
  useListServices,
} from "../hooks/useQueries";

// ─── Payment Status Derivation ────────────────────────────────────────────────
type PaymentStatus = "pending" | "paid" | "refunded";

function derivePaymentStatus(bookingStatus: BookingStatus): PaymentStatus {
  if (bookingStatus === BookingStatus.completed) return "paid";
  if (bookingStatus === BookingStatus.cancelled) return "refunded";
  return "pending";
}

const PAYMENT_STATUS_STYLES: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  },
  paid: {
    label: "Paid",
    className:
      "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300",
  },
  refunded: {
    label: "Refunded",
    className:
      "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300",
  },
};

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, className } = PAYMENT_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

// ─── Payments Section ──────────────────────────────────────────────────────────
export function PaymentsSection() {
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError,
  } = useAllBookings();
  const { data: services } = useListServices();

  const serviceMap = new Map((services ?? []).map((s) => [s.id.toString(), s]));

  // Derive payment records from bookings
  const payments = (bookings ?? []).map((booking, i) => {
    const service = serviceMap.get(booking.serviceId.toString());
    const amount = service?.maxPrice ?? 0n;
    const status = derivePaymentStatus(booking.status);
    return {
      id: i + 1,
      bookingId: Number(booking.id),
      serviceName: service?.name ?? `Service #${booking.serviceId}`,
      customer: booking.customer.toString(),
      amount,
      status,
      createdAt: new Date(
        Number(booking.createdAt) / 1_000_000,
      ).toLocaleDateString("en-IN"),
    };
  });

  // Summary stats
  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0n);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0n);

  const totalRefunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0n);

  const paidCount = payments.filter((p) => p.status === "paid").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const refundedCount = payments.filter((p) => p.status === "refunded").length;

  return (
    <section data-ocid="admin.payments.section" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Payments Overview
        </h2>
        {!bookingsLoading && !isError && (
          <span className="text-sm text-muted-foreground">
            {payments.length} record{payments.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Summary Cards */}
      {bookingsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["sk1", "sk2", "sk3"].map((id) => (
            <div
              key={id}
              className="bg-card border border-border rounded-xl p-5"
            >
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Revenue",
              sublabel: `${paidCount} paid orders`,
              value: formatPrice(totalRevenue),
              color: "oklch(0.92 0.07 145)",
              iconColor: "oklch(0.38 0.14 145)",
              icon: TrendingUp,
              highlight: true,
            },
            {
              label: "Pending Payments",
              sublabel: `${pendingCount} awaiting`,
              value: formatPrice(totalPending),
              color: "oklch(0.95 0.08 70)",
              iconColor: "oklch(0.45 0.14 70)",
              icon: IndianRupee,
              highlight: false,
            },
            {
              label: "Refunded",
              sublabel: `${refundedCount} cancelled`,
              value: formatPrice(totalRefunded),
              color: "oklch(0.95 0.04 20)",
              iconColor: "oklch(0.42 0.15 20)",
              icon: CreditCard,
              highlight: false,
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-card border rounded-xl p-5 ${card.highlight ? "border-green-200 bg-green-50/40 dark:bg-green-900/10" : "border-border"}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: card.color }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.iconColor }} />
                </div>
                <div className="font-display font-black text-2xl text-foreground">
                  {card.value}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {card.label}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-0.5">
                  {card.sublabel}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Status Breakdown */}
      {!bookingsLoading && payments.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-foreground mb-3">
            Payment Status Breakdown
          </h3>
          <div className="flex flex-wrap gap-3">
            {(
              [
                {
                  status: "paid" as const,
                  count: paidCount,
                  color: "bg-green-500",
                },
                {
                  status: "pending" as const,
                  count: pendingCount,
                  color: "bg-amber-500",
                },
                {
                  status: "refunded" as const,
                  count: refundedCount,
                  color: "bg-red-400",
                },
              ] satisfies {
                status: PaymentStatus;
                count: number;
                color: string;
              }[]
            ).map(({ status, count, color }) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-sm text-foreground font-medium capitalize">
                  {status}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  ({count})
                </span>
              </div>
            ))}
            <div className="ml-auto text-xs text-muted-foreground">
              Note: Payment records are derived from booking statuses
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {bookingsLoading ? (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.payments.loading_state"
        >
          <div className="p-4 space-y-3">
            {["sk1", "sk2", "sk3", "sk4"].map((id) => (
              <div key={id} className="flex gap-4 items-center">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div
          className="flex flex-col items-center gap-3 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.payments.error_state"
        >
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground text-sm">
            Failed to load payment records.
          </p>
        </div>
      ) : payments.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-12 text-center bg-card border border-border rounded-xl"
          data-ocid="admin.payments.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-foreground">
              No payment records yet
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Payment records will appear once customers start booking services.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.payments.table"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead className="font-display font-bold text-foreground w-14">
                    ID
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Booking
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Service
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-display font-bold text-foreground">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, i) => (
                  <TableRow
                    key={payment.id}
                    className="hover:bg-secondary/50"
                    data-ocid={`admin.payments.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-sm font-bold text-muted-foreground">
                      #{payment.id}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        #{payment.bookingId}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground text-sm max-w-40 truncate">
                        {payment.serviceName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        {shortenPrincipal(payment.customer)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {formatPrice(payment.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {payment.createdAt}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Informational note */}
      <div className="rounded-xl border border-border bg-secondary/30 p-4">
        <div className="flex items-start gap-2">
          <Badge variant="outline" className="text-xs mt-0.5 shrink-0">
            Info
          </Badge>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Payment records shown here are{" "}
            <strong>derived from booking statuses</strong>: completed bookings =
            Paid, cancelled = Refunded, all others = Pending. A native payment
            ledger with ICP/ckBTC integration is planned for a future update.
            Amounts are based on service maximum prices.
          </p>
        </div>
      </div>
    </section>
  );
}
