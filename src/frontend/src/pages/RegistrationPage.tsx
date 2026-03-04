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
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  Home,
  Loader2,
  UserCheck,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ServiceCategory } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  getCategoryLabel,
  useRegisterCustomer,
  useRegisterProfessional,
} from "../hooks/useQueries";

type RegistrationStep = "choose" | "professional-form";

const ALL_CATEGORIES = [
  ServiceCategory.laptopRepair,
  ServiceCategory.desktopRepair,
  ServiceCategory.computerSales,
  ServiceCategory.accessoriesSales,
  ServiceCategory.networkSetup,
  ServiceCategory.dataRecovery,
];

export function RegistrationPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const registerCustomer = useRegisterCustomer();
  const registerProfessional = useRegisterProfessional();

  const [step, setStep] = useState<RegistrationStep>("choose");
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!identity) {
    void navigate({ to: "/" });
    return null;
  }

  const handleRegisterCustomer = async () => {
    try {
      await registerCustomer.mutateAsync();
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
      toast.success(
        `Welcome, ${displayName.trim()}! Your professional account is ready.`,
      );
      void navigate({ to: "/dashboard/professional" });
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

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
              Welcome to TechServe
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
                  onClick={() => void handleRegisterCustomer()}
                  disabled={registerCustomer.isPending}
                  className="w-full group p-5 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      {registerCustomer.isPending ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      ) : (
                        <Home className="w-6 h-6 text-primary" />
                      )}
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
