import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Info, Loader2, LogIn, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getPersistedUrlParameter } from "../utils/urlParams";

export function AdminSetupPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoDetected, setAutoDetected] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const claimAdmin = useCallback(
    async (tokenValue: string) => {
      if (!actor) return;
      setIsSubmitting(true);
      setErrorMessage("");
      try {
        await (
          actor as unknown as {
            _initializeAccessControlWithSecret: (t: string) => Promise<void>;
          }
        )._initializeAccessControlWithSecret(tokenValue.trim());
        toast.success("Admin role claimed successfully! Redirecting…");
        setTimeout(() => {
          void navigate({ to: "/dashboard/admin" });
        }, 1200);
      } catch {
        setErrorMessage(
          "Token invalid or admin already assigned. Please sign in with the device you used to claim admin.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [actor, navigate],
  );

  // Auto-read token from URL on mount
  useEffect(() => {
    const urlToken = getPersistedUrlParameter("caffeineAdminToken");
    if (urlToken) {
      setToken(urlToken);
      setAutoDetected(true);
    }
  }, []);

  // Auto-submit when identity, actor, and auto-detected token are all ready
  useEffect(() => {
    if (autoDetected && identity && actor && token && !autoTriggered) {
      setAutoTriggered(true);
      void claimAdmin(token);
    }
  }, [autoDetected, identity, actor, token, autoTriggered, claimAdmin]);

  // When actor becomes available after a pending submit, auto-proceed
  useEffect(() => {
    if (pendingSubmit && actor && !isFetching) {
      setPendingSubmit(false);
      void claimAdmin(token);
    }
  }, [pendingSubmit, actor, isFetching, token, claimAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMessage("Please enter an admin setup token.");
      return;
    }
    if (!actor) {
      if (isFetching) {
        // Actor is still loading — queue submission
        setPendingSubmit(true);
        setErrorMessage("");
      } else {
        // Actor genuinely failed to load
        setErrorMessage(
          "Not connected to the backend. Please refresh the page and try again.",
        );
      }
      return;
    }
    await claimAdmin(token);
  };

  const isConnecting = !actor && isFetching;
  const isButtonDisabled =
    isSubmitting || !token.trim() || isConnecting || pendingSubmit;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Icon header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 mb-4">
            <Shield className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="font-display text-3xl font-black text-foreground mb-2">
            Admin Setup
          </h1>
          <p className="text-muted-foreground text-sm">
            Claim the administrator role for this Lepzo installation
          </p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-display font-bold">
              Claim Admin Role
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {autoDetected
                ? "Admin token detected from your URL. Sign in below to automatically claim the admin role."
                : "Enter your admin setup token to claim the admin role. This only works once."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Auto-detected token banner */}
            {autoDetected && (
              <div className="mb-4 flex items-center gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800/40">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                  Admin token auto-detected from your URL
                </p>
              </div>
            )}

            {!identity ? (
              /* Not signed in */
              <div className="space-y-4 text-center py-2">
                <p className="text-sm text-muted-foreground">
                  {autoDetected
                    ? "Almost there! Sign in with Internet Identity and you'll be made admin automatically."
                    : "Please sign in with Internet Identity first before claiming admin access."}
                </p>
                <Button
                  data-ocid="admin_setup.login_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="gap-2 w-full"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  {isLoggingIn
                    ? "Signing in…"
                    : "Sign In with Internet Identity"}
                </Button>
              </div>
            ) : isSubmitting ? (
              /* Auto-submitting */
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Claiming admin role…
                </p>
              </div>
            ) : (
              /* Signed in — show form */
              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="space-y-5"
                data-ocid="admin_setup.dialog"
              >
                {/* Connecting banner */}
                {(isConnecting || pendingSubmit) && (
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                      Connecting to backend… will submit automatically.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-token"
                    className="flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-destructive" />
                    Admin Token
                  </Label>
                  <Input
                    id="admin-token"
                    type="password"
                    data-ocid="admin_setup.input"
                    placeholder="Enter admin setup token"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      setErrorMessage("");
                    }}
                    autoComplete="off"
                    disabled={isSubmitting || pendingSubmit}
                    className={errorMessage ? "border-destructive" : ""}
                  />
                  {errorMessage && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="admin_setup.error_state"
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-ocid="admin_setup.submit_button"
                  className="w-full gap-2"
                  disabled={isButtonDisabled}
                  variant="destructive"
                >
                  {isConnecting || pendingSubmit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting…
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claiming…
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Claim Admin Role
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Info note - only show if token NOT auto-detected */}
            {!autoDetected && (
              <div className="mt-5 flex items-start gap-2.5 p-4 rounded-lg bg-muted/60 border border-border">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The Caffeine admin token is embedded in your app's preview
                    URL as a query parameter:
                  </p>
                  <code className="block font-mono text-xs text-foreground bg-background border border-border px-3 py-2 rounded-md break-all leading-relaxed">
                    https://your-app.icp0.io/?caffeineAdminToken=abc123...
                  </code>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Open the Caffeine preview link directly — it auto-fills your
                    token on this page. Or copy the value after{" "}
                    <code className="font-mono text-foreground bg-background px-1 py-0.5 rounded text-xs">
                      caffeineAdminToken=
                    </code>{" "}
                    and paste it above.
                  </p>
                </div>
              </div>
            )}

            {/* Internet Identity note */}
            <div className="mt-4 flex items-start gap-2.5 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  How admin login works
                </p>
                <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-400 leading-relaxed list-disc list-inside">
                  <li>
                    Your admin role is <strong>permanently tied</strong> to the
                    Internet Identity you used to claim it.
                  </li>
                  <li>
                    To sign in as admin again: use the{" "}
                    <strong>same device/browser</strong> where you first claimed
                    admin.
                  </li>
                  <li>
                    To access from a new device, go to{" "}
                    <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded text-[10px]">
                      identity.ic0.app
                    </code>{" "}
                    and use <strong>"Add a new device"</strong>.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
