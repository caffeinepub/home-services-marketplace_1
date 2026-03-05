import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FlaskConical,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Wrench,
} from "lucide-react";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

export function Navbar() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!userProfile) return "/post-login";
    if (userProfile.role === UserRole.admin) return "/dashboard/admin";
    if (userProfile.professional) return "/dashboard/professional";
    if (userProfile.role === UserRole.user) return "/dashboard/customer";
    return "/register";
  };

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    clear();
    void navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 nav-glass">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          data-ocid="nav.home_link"
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-primary">
            <Wrench className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            ServeLocal
          </span>
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/services"
            data-ocid="nav.services_link"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&.active]:text-primary [&.active]:font-semibold"
          >
            Browse Services
          </Link>
          <Link
            to="/demo"
            data-ocid="nav.demo_link"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&.active]:text-primary [&.active]:font-semibold"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Demo
          </Link>
        </div>

        {/* Auth Controls */}
        <div className="flex items-center gap-3">
          {isInitializing ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isAuthenticated ? (
            <>
              <Link to={getDashboardLink()}>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="nav.dashboard_link"
                  className="gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                data-ocid="nav.logout_button"
                onClick={handleLogout}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              data-ocid="nav.login_button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gap-2 shadow-primary"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
