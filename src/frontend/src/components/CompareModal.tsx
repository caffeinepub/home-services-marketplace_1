import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarPlus, X } from "lucide-react";
import type { Service } from "../backend.d";
import { formatPriceRange, getCategoryLabel } from "../hooks/useQueries";

interface CompareModalProps {
  services: Service[];
  open: boolean;
  onClose: () => void;
  onBook: (service: Service) => void;
}

export function CompareModal({
  services,
  open,
  onClose,
  onBook,
}: CompareModalProps) {
  if (services.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-4xl w-full p-0 gap-0 overflow-hidden"
        data-ocid="compare.modal"
      >
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl font-black">
              Compare Services
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              data-ocid="compare.close_button"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Comparing {services.length} service{services.length > 1 ? "s" : ""}{" "}
            side by side
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6">
            {/* Column headers — service names */}
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
              }}
            >
              {/* Row label column header */}
              <div />
              {services.map((svc) => (
                <div
                  key={svc.id.toString()}
                  className="text-center px-3 py-3 rounded-xl bg-primary/5 border border-primary/15"
                >
                  <h3 className="font-display font-bold text-sm text-foreground leading-tight">
                    {svc.name}
                  </h3>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            {[
              {
                label: "Category",
                render: (svc: Service) => (
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryLabel(svc.category)}
                  </Badge>
                ),
              },
              {
                label: "Price Range",
                render: (svc: Service) => (
                  <span className="font-display font-bold text-base text-foreground">
                    {formatPriceRange(svc.minPrice, svc.maxPrice)}
                  </span>
                ),
              },
              {
                label: "Description",
                render: (svc: Service) => (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                    {svc.description}
                  </p>
                ),
              },
            ].map((row, ri) => (
              <div
                key={row.label}
                className="grid gap-4 mt-3"
                style={{
                  gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
                }}
              >
                {/* Row label */}
                <div className="flex items-start pt-3 pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {row.label}
                  </span>
                </div>

                {/* Row cells */}
                {services.map((svc) => (
                  <div
                    key={svc.id.toString()}
                    className={`px-3 py-3 rounded-xl flex items-start justify-center ${
                      ri % 2 === 0 ? "bg-secondary/40" : "bg-card"
                    } border border-border`}
                  >
                    {row.render(svc)}
                  </div>
                ))}
              </div>
            ))}

            {/* Book buttons */}
            <div
              className="grid gap-4 mt-5 pt-4 border-t border-border"
              style={{
                gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
              }}
            >
              <div className="flex items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Book
                </span>
              </div>
              {services.map((svc, idx) => (
                <div key={svc.id.toString()} className="flex justify-center">
                  <Button
                    size="sm"
                    data-ocid={`compare.book_button.${idx + 1}`}
                    onClick={() => {
                      onBook(svc);
                      onClose();
                    }}
                    className="gap-1.5 w-full shadow-primary"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Book Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
