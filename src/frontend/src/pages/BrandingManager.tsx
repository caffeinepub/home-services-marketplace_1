import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Check,
  ImageOff,
  Loader2,
  Palette,
  Save,
  Trash2,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { BrandingConfig } from "../backend.d";
import { useBranding } from "../contexts/BrandingContext";
import { useActor } from "../hooks/useActor";

const COLOR_SWATCHES = [
  { hex: "#6366f1", label: "Indigo" },
  { hex: "#0ea5e9", label: "Sky" },
  { hex: "#10b981", label: "Emerald" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#8b5cf6", label: "Violet" },
  { hex: "#ec4899", label: "Pink" },
  { hex: "#14b8a6", label: "Teal" },
];

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  delay = 0,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="px-6 py-4 border-b border-border bg-secondary/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-sm text-foreground leading-tight">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {description}
          </p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

export function BrandingManager() {
  const { actor } = useActor();
  const { branding, refreshBranding } = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [footerText, setFooterText] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#10b981");
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Seed form with existing branding
  useEffect(() => {
    if (branding) {
      setSiteName(branding.siteName || "Lepzo");
      setTagline(branding.tagline || "");
      setFooterText(branding.footerText || "Built with love by Hemanth");
      setPrimaryColor(branding.primaryColor || "#10b981");
      setLogoDataUrl(branding.logoDataUrl);
    }
  }, [branding]);

  // Live preview — apply color change to CSS vars immediately
  useEffect(() => {
    document.documentElement.style.setProperty("--brand-primary", primaryColor);
  }, [primaryColor]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoDataUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!actor) {
      toast.error("Not connected. Please sign in.");
      return;
    }
    setIsSaving(true);
    try {
      const config: BrandingConfig = {
        siteName: siteName.trim() || "Lepzo",
        tagline: tagline.trim(),
        footerText: footerText.trim() || "Built with love by Hemanth",
        primaryColor,
        logoDataUrl: logoDataUrl ?? undefined,
      };
      await actor.setBrandingConfig(config);
      refreshBranding();
      toast.success("Branding saved successfully!");
    } catch {
      toast.error("Failed to save branding. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section data-ocid="branding.section" className="space-y-6 max-w-3xl">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2 leading-tight">
            <Palette className="w-5 h-5 text-primary flex-shrink-0" />
            Branding Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customize the look and feel of your Lepzo platform. Changes apply
            site-wide instantly.
          </p>
        </div>
        <Button
          data-ocid="branding.save_button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="gap-2 shadow-primary flex-shrink-0"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving…" : "Save Branding"}
        </Button>
      </div>

      {/* ── Logo Upload ── */}
      <SectionCard
        icon={Upload}
        title="Business Logo"
        description="Shown in the navbar beside the site name"
        delay={0.05}
      >
        <div className="flex items-start gap-6 flex-wrap">
          {/* Preview square */}
          <div
            className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-border bg-secondary/40 flex items-center justify-center overflow-hidden flex-shrink-0 group"
            data-ocid="branding.logo.card"
          >
            {logoDataUrl ? (
              <>
                <img
                  src={logoDataUrl}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
                {/* Overlay hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <span className="text-white text-xs font-medium">Change</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageOff className="w-8 h-8" />
                <span className="text-xs">No logo</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              data-ocid="branding.logo.upload_button"
            />
            <Button
              variant="outline"
              className="gap-2 w-fit"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {logoDataUrl ? "Replace Logo" : "Upload Logo"}
            </Button>
            {logoDataUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 w-fit text-destructive hover:text-destructive hover:bg-destructive/10"
                data-ocid="branding.logo.delete_button"
                onClick={handleRemoveLogo}
              >
                <Trash2 className="w-4 h-4" />
                Remove Logo
              </Button>
            )}
            <p className="text-xs text-muted-foreground max-w-52 leading-relaxed">
              Recommended: 256×256 px PNG with transparent background. Max 2 MB.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── Site Identity ── */}
      <SectionCard
        icon={Building2}
        title="Site Identity"
        description="Your platform name and tagline"
        delay={0.1}
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="site-name" className="text-sm font-medium">
              Site Name
            </Label>
            <Input
              id="site-name"
              data-ocid="branding.sitename_input"
              placeholder="Lepzo"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown in the navbar and browser tab
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline" className="text-sm font-medium">
              Tagline
            </Label>
            <Input
              id="tagline"
              data-ocid="branding.tagline_input"
              placeholder="Computer services, done right"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Short description below the site name
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── Footer Text ── */}
      <SectionCard
        icon={Type}
        title="Footer Text"
        description="Custom message displayed in the site footer"
        delay={0.15}
      >
        <div className="space-y-2">
          <Label htmlFor="footer-text" className="text-sm font-medium">
            Footer Message
          </Label>
          <Textarea
            id="footer-text"
            data-ocid="branding.footer_input"
            placeholder="Built with love by Hemanth"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={2}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Appears above the caffeine.ai attribution line in the footer
          </p>
        </div>
      </SectionCard>

      {/* ── Brand Color ── */}
      <SectionCard
        icon={Palette}
        title="Brand Color"
        description="Primary accent color applied across buttons, links, and highlights"
        delay={0.2}
      >
        <div className="space-y-6">
          {/* Live preview badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 text-xs border-primary/30 text-primary bg-primary/5"
            >
              <Zap className="w-3 h-3" />
              Live preview — changes apply as you pick
            </Badge>
          </div>

          {/* Swatches + custom picker in one row group */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Preset colors
              </p>
              {/* FIX #1: Swatches with clear selected ring + checkmark */}
              <div className="flex flex-wrap gap-2.5">
                {COLOR_SWATCHES.map((swatch) => {
                  const isSelected =
                    primaryColor.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      title={swatch.label}
                      data-ocid="branding.color.toggle"
                      onClick={() => setPrimaryColor(swatch.hex)}
                      aria-label={`${swatch.label}${isSelected ? " (selected)" : ""}`}
                      aria-pressed={isSelected}
                      className={`
                        relative w-10 h-10 rounded-full transition-all duration-150
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        ${
                          isSelected
                            ? "ring-2 ring-offset-2 ring-foreground/70 scale-110 shadow-lg"
                            : "ring-1 ring-black/10 hover:scale-105 hover:shadow-md"
                        }
                      `}
                      style={{ backgroundColor: swatch.hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className="w-4 h-4 drop-shadow"
                            style={{
                              color: "white",
                              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                            }}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator className="opacity-50" />

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Custom color
              </p>
              {/* FIX #2: Cleaner custom picker row */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-shrink-0">
                  <input
                    id="custom-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    data-ocid="branding.color.input"
                    className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5 appearance-none"
                  />
                </div>
                <Input
                  value={primaryColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setPrimaryColor(val);
                    }
                  }}
                  placeholder="#10b981"
                  className="w-32 font-mono text-sm"
                  data-ocid="branding.color_hex.input"
                />
                {/* Swatch label */}
                <span className="text-xs text-muted-foreground">
                  Enter any hex value
                </span>
              </div>
            </div>
          </div>

          {/* Live preview panel */}
          <div className="rounded-xl bg-secondary/40 border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Preview
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Primary Button
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold border-2 bg-transparent transition-opacity hover:opacity-80"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Outline Button
              </button>
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: primaryColor }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
                Link text
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Bottom save ── */}
      <div className="flex justify-end pt-2 pb-4">
        <Button
          data-ocid="branding.bottom_save_button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          size="lg"
          className="gap-2 shadow-primary min-w-40"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving…" : "Save All Changes"}
        </Button>
      </div>
    </section>
  );
}
