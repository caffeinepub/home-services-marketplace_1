import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { BrandingConfig } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface BrandingContextValue {
  branding: BrandingConfig | null;
  refreshBranding: () => void;
}

const BrandingContext = createContext<BrandingContextValue>({
  branding: null,
  refreshBranding: () => {},
});

export function useBranding() {
  return useContext(BrandingContext);
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const [branding, setBranding] = useState<BrandingConfig | null>(null);

  const fetchBranding = useCallback(async () => {
    if (!actor) return;
    try {
      const config = await actor.getBrandingConfig();
      setBranding(config);
    } catch {
      // silently fail — branding is best-effort
    }
  }, [actor]);

  const refreshBranding = useCallback(() => {
    void fetchBranding();
  }, [fetchBranding]);

  useEffect(() => {
    if (!isFetching && actor) {
      void fetchBranding();
    }
  }, [actor, isFetching, fetchBranding]);

  // Apply primary color as CSS variables whenever branding changes
  useEffect(() => {
    if (!branding?.primaryColor) return;
    const root = document.documentElement;
    // Convert hex to oklch-style by setting as a CSS var used in components
    // We store the raw hex so it works with inline style usage as well
    root.style.setProperty("--brand-primary", branding.primaryColor);
    // Also parse and convert to oklch-friendly override
    // For simplicity, set --primary via a hex-based override that Tailwind picks up
    // We'll apply it directly as a hex override via a special CSS property
    root.style.setProperty("--brand-primary-hex", branding.primaryColor);
  }, [branding?.primaryColor]);

  return (
    <BrandingContext.Provider value={{ branding, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}
