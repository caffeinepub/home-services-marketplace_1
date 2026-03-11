import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  Home,
  Loader2,
  Phone,
  UserCheck,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ServiceCategory } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  getCategoryLabel,
  useRegisterCustomer,
  useRegisterProfessional,
} from "../hooks/useQueries";

type RegistrationStep = "choose" | "customer-form" | "professional-form";

const ALL_CATEGORIES = [
  ServiceCategory.laptopRepair,
  ServiceCategory.desktopRepair,
  ServiceCategory.computerSales,
  ServiceCategory.accessoriesSales,
  ServiceCategory.networkSetup,
  ServiceCategory.dataRecovery,
];

function validateMobile(mobile: string): string | null {
  if (!mobile.trim()) return null; // optional
  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 10) return "Mobile number must be at least 10 digits";
  return null;
}

export function RegistrationPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { actor } = useActor();
  const registerCustomer = useRegisterCustomer();
  const registerProfessional = useRegisterProfessional();

  const [step, setStep] = useState<RegistrationStep>("choose");
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!identity) {
    void navigate({ to: "/" });
    return null;
  }

  const saveMobile = async (mobile: string) => {
    if (!mobile.trim() || !actor) return;
    try {
      await actor.updateMobileNumber(mobile.trim());
    } catch {
      // non-critical, silently skip
    }
    // Also check localStorage for pending mobile
    const pending = localStorage.getItem("lepzo_pending_mobile");
    if (pending && pending !== mobile.trim()) {
      try {
        await actor.updateMobileNumber(pending);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("lepzo_pending_mobile");
  };

  const handleGoCustomer = () => {
    setMobileNumber("");
    setStep("customer-form");
  };

  const handleRegisterCustomer = async () => {
    const mobileError = validateMobile(mobileNumber);
    if (mobileError) {
      setErrors({ mobile: mobileError });
      return;
    }
    try {
      await registerCustomer.mutateAsync();
      await saveMobile(mobileNumber);
      toast.success("Welcome! Your customer account is ready.");
      void navigate({ to: "/dashboard/customer" });
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  const validateProfessionalForm = () => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = "Display name is required";
    if (displayName.trim().length < 2)
      newErrors.displayName = "Name must be at least 2 characters";
    if (!category) newErrors.category = "Please select your service category";
    const mobileError = validateMobile(mobileNumber);
    if (mobileError) newErrors.mobile = mobileError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterProfessional = async () => {
    if (!validateProfessionalForm()) return;
    try {
      await registerProfessional.mutateAsync({
        displayName: displayName.trim(),
        category: category as ServiceCategory,
      });
      await saveMobile(mobileNumber);
      localStorage.setItem("lepzo_tech_pending", "1");
      toast.success(
        `Welcome, ${displayName.trim()}! Your professional account is ready.`,
      );
      void navigate({ to: "/dashboard/professional" });
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  const MobileField = () => (
    <div className="space-y-1.5">
      <Label htmlFor="mobile-number" className="flex items-center gap-1.5">
        <Phone className="w-3.5 h-3.5 text-primary" />
        Mobile Number{" "}
        <span className="text-muted-foreground text-xs">(optional)</span>
      </Label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="mobile-number"
          type="tel"
          data-ocid="registration.mobile_input"
          placeholder="+91 9876543210"
          value={mobileNumber}
          onChange={(e) => {
            setMobileNumber(e.target.value);
            setErrors((prev) => ({ ...prev, mobile: "" }));
          }}
          className={`pl-10 ${errors.mobile ? "border-destructive" : ""}`}
        />
      </div>
      {errors.mobile && (
        <p className="text-xs text-destructive">{errors.mobile}</p>
      )}
      <p className="text-xs text-muted-foreground">
        We'll save this to your profile for service updates
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
              <Wrench className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-black text-foreground mb-2">
              Welcome to Lepzo
            </h1>
            <p className="text-muted-foreground">
              Let us know how you'd like to use the platform
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Customer option */}
                <button
                  type="button"
                  data-ocid="registration.customer_button"
                  onClick={handleGoCustomer}
                  className="w-full group p-5 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-lg text-foreground">
                        I'm a Customer
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        Browse computer services and book certified technicians
                      </div>
                    </div>
                  </div>
                </button>

                {/* Professional option */}
                <button
                  type="button"
                  data-ocid="registration.professional_button"
                  onClick={() => setStep("professional-form")}
                  className="w-full group p-5 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 group-hover:bg-accent/70 transition-colors">
                      <Briefcase className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-lg text-foreground">
                        I'm a Technician / IT Specialist
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        Offer computer repair & IT services and manage bookings
                      </div>
                    </div>
                  </div>
                </button>

                {/* Admin setup link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Are you the app owner?{" "}
                    <Link
                      to="/admin-setup"
                      data-ocid="registration.admin_setup_link"
                      className="text-primary font-medium hover:underline"
                    >
                      Set up admin account
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {step === "customer-form" && (
              <motion.div
                key="customer-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("choose")}
                    className="p-1 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div>
                    <h2 className="font-display font-bold text-lg text-foreground">
                      Customer Registration
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Optionally add your mobile number
                    </p>
                  </div>
                </div>

                <MobileField />

                <Button
                  className="w-full gap-2 shadow-primary"
                  data-ocid="registration.customer_submit_button"
                  onClick={() => void handleRegisterCustomer()}
                  disabled={registerCustomer.isPending}
                >
                  {registerCustomer.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Home className="h-4 w-4" />
                      Create Customer Account
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {step === "professional-form" && (
              <motion.div
                key="professional-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("choose")}
                    className="p-1 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div>
                    <h2 className="font-display font-bold text-lg text-foreground">
                      Technician Setup
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Tell us about your specialization
                    </p>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="display-name"
                    className="flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                    Display Name
                  </Label>
                  <Input
                    id="display-name"
                    data-ocid="registration.displayname_input"
                    placeholder="e.g. Alex Johnson"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setErrors((prev) => ({ ...prev, displayName: "" }));
                    }}
                    className={errors.displayName ? "border-destructive" : ""}
                  />
                  {errors.displayName && (
                    <p className="text-xs text-destructive">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    Service Category
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(v) => {
                      setCategory(v as ServiceCategory);
                      setErrors((prev) => ({ ...prev, category: "" }));
                    }}
                  >
                    <SelectTrigger
                      data-ocid="registration.category_select"
                      className={errors.category ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select your tech specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {getCategoryLabel(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <MobileField />

                <Button
                  className="w-full gap-2 shadow-primary"
                  data-ocid="registration.submit_button"
                  onClick={() => void handleRegisterProfessional()}
                  disabled={registerProfessional.isPending}
                >
                  {registerProfessional.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Create Professional Account
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
