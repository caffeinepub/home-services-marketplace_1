import type { BookingStatus } from "../backend.d";
import { getStatusClass, getStatusLabel } from "../hooks/useQueries";

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusClass(status)} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
