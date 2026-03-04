import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

export function PostLoginRouter() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitializing || isLoading) return;

    if (!identity) {
      void navigate({ to: "/" });
      return;
    }

    if (!userProfile) {
      void navigate({ to: "/register" });
      return;
    }

    // Route by role/profile
    if (userProfile.role === UserRole.admin) {
      void navigate({ to: "/dashboard/admin" });
    } else if (userProfile.professional) {
      void navigate({ to: "/dashboard/professional" });
    } else if (userProfile.role === UserRole.user) {
      void navigate({ to: "/dashboard/customer" });
    } else {
      // guest role
      void navigate({ to: "/register" });
    }
  }, [identity, userProfile, isLoading, isInitializing, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Setting up your account...</p>
    </div>
  );
}
