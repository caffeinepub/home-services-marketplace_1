import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Navbar } from "./components/Navbar";
import { BrandingProvider, useBranding } from "./contexts/BrandingContext";
import { AdminPanel } from "./pages/AdminPanel";
import { AdminSetupPage } from "./pages/AdminSetupPage";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { DemoPage } from "./pages/DemoPage";
import { LandingPage } from "./pages/LandingPage";
import { PostLoginRouter } from "./pages/PostLoginRouter";
import { ProfessionalDashboard } from "./pages/ProfessionalDashboard";
import { RegistrationPage } from "./pages/RegistrationPage";
import { ServicesPage } from "./pages/ServicesPage";

// Footer component that reads branding context
function AppFooter() {
  const { branding } = useBranding();
  const customText = branding?.footerText ?? "Built with love by Hemanth";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border py-6 bg-card">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-1">
        <div className="font-medium text-foreground/80">{customText}</div>
        <div>
          © {new Date().getFullYear()} &mdash; Powered by{" "}
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

// Root layout with Navbar
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services",
  component: ServicesPage,
});

const postLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-login",
  component: PostLoginRouter,
});

const registrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegistrationPage,
});

const customerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/customer",
  component: CustomerDashboard,
});

const professionalDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/professional",
  component: ProfessionalDashboard,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/admin",
  component: AdminPanel,
});

const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/demo",
  component: DemoPage,
});

const adminSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-setup",
  component: AdminSetupPage,
});

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Navigate to="/" />,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  servicesRoute,
  postLoginRoute,
  registrationRoute,
  customerDashboardRoute,
  professionalDashboardRoute,
  adminPanelRoute,
  demoRoute,
  adminSetupRoute,
  catchAllRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppWithBranding() {
  return (
    <BrandingProvider>
      <RouterProvider router={router} />
    </BrandingProvider>
  );
}

export default AppWithBranding;
