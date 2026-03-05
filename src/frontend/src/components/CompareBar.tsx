import { Button } from "@/components/ui/button";
import { BarChart2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Service } from "../backend.d";

interface CompareBarProps {
  compareList: Service[];
  onRemove: (serviceId: bigint) => void;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareBar({
  compareList,
  onRemove,
  onClear,
  onCompare,
}: CompareBarProps) {
  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          data-ocid="compare.bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border shadow-xl"
          style={{
            background: "oklch(0.12 0.025 265 / 0.97)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
            {/* Icon + label */}
            <div className="flex items-center gap-2 shrink-0">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-white">Compare</span>
              <span className="text-xs text-white/50">
                ({compareList.length}/3)
              </span>
            </div>

            {/* Chips */}
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {compareList.map((svc, idx) => (
                <motion.div
                  key={svc.id.toString()}
                  data-ocid={`compare.chip.${idx + 1}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20 bg-white/10"
                >
                  <span className="max-w-[140px] truncate">{svc.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(svc.id)}
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
                    aria-label={`Remove ${svc.name} from comparison`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              ))}

              {/* Empty placeholders */}
              {Array.from({ length: 3 - compareList.length }, (_, i) => (
                <div
                  key={`empty-slot-${3 - compareList.length - i}`}
                  className="px-3 py-1 rounded-full text-xs font-medium text-white/30 border border-white/10 border-dashed"
                >
                  + Add service
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                data-ocid="compare.clear_button"
                onClick={onClear}
                className="text-white/60 hover:text-white hover:bg-white/10 text-xs"
              >
                Clear All
              </Button>
              <Button
                size="sm"
                data-ocid="compare.open_button"
                onClick={onCompare}
                disabled={compareList.length < 2}
                className="gap-1.5 text-xs font-semibold shadow-primary"
                style={{
                  background:
                    compareList.length >= 2
                      ? "oklch(0.55 0.18 170)"
                      : undefined,
                  color: compareList.length >= 2 ? "white" : undefined,
                }}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Compare Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
