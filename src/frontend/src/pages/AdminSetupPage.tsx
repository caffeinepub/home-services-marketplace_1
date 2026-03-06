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
import { Info, Loader2, LogIn, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function AdminSetupPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMessage("Please enter an admin setup token.");
      return;
    }
    if (!actor) {
      setErrorMessage("Not connected to the backend. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      // actor has _initializeAccessControlWithSecret available at runtime
      await (
        actor as unknown as {
          _initializeAccessControlWithSecret: (token: string) => Promise<void>;
        }
      )._initializeAccessControlWithSecret(token.trim());
      toast.success("Admin role claimed successfully!");
      void navigate({ to: "/dashboard/admin" });
    } catch {
      setErrorMessage("Token invalid or admin already assigned.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Enter your admin setup token to claim the admin role. This only
              works once — the first principal to use the correct token becomes
              the permanent admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!identity ? (
              /* Not signed in */
              <div className="space-y-4 text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Please sign in with Internet Identity first before claiming
                  admin access.
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
            ) : (
              /* Signed in — show form */
              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="space-y-5"
                data-ocid="admin_setup.dialog"
              >
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
                    disabled={isSubmitting}
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
                  disabled={isSubmitting || !token.trim()}
                  variant="destructive"
                >
                  {isSubmitting ? (
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

            {/* Info note */}
            <div className="mt-5 flex items-start gap-2.5 p-4 rounded-lg bg-muted/60 border border-border">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The Caffeine admin token is embedded in your app's preview URL
                  as a query parameter:
                </p>
                <code className="block font-mono text-xs text-foreground bg-background border border-border px-3 py-2 rounded-md break-all leading-relaxed">
                  https://your-app.icp0.io/?caffeineAdminToken=abc123...
                </code>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Copy the value after{" "}
                  <code className="font-mono text-foreground bg-background px-1 py-0.5 rounded text-xs">
                    caffeineAdminToken=
                  </code>{" "}
                  and paste it above. This works{" "}
                  <strong className="text-foreground">only once</strong> — the
                  first principal to use the correct token becomes the permanent
                  admin.
                </p>
              </div>
            </div>

            {/* Internet Identity password note */}
            <div className="mt-4 flex items-start gap-2.5 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  About Admin Passwords &amp; Internet Identity
                </p>
                <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-400 leading-relaxed list-disc list-inside">
                  <li>
                    Internet Identity uses <strong>cryptographic keys</strong>,
                    not passwords — there is no password to change or reset.
                  </li>
                  <li>
                    Your admin role is <strong>permanently tied</strong> to the
                    Internet Identity you used to claim it.
                  </li>
                  <li>
                    To sign in as admin again: simply use the{" "}
                    <strong>same device/browser</strong> you used to claim
                    admin. Your identity is stored locally.
                  </li>
                  <li>
                    To access from a new device, use the{" "}
                    <strong>"Add a new device"</strong> option in the Internet
                    Identity management portal at{" "}
                    <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded text-[10px]">
                      identity.ic0.app
                    </code>
                    .
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
