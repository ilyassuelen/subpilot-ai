import { useState } from "react";
import { Plane, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrationModal({
  open,
  onOpenChange,
}: RegistrationModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Register:", data.email);

    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setShowPassword(false);
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden border-border bg-card p-0 shadow-card-hover sm:max-w-md">
        <div className="bg-gradient-primary p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>

          <DialogHeader>
            <DialogTitle className="font-[var(--font-display)] text-xl font-bold text-primary-foreground">
              Create your SubPilot account
            </DialogTitle>
          </DialogHeader>

          <p className="mt-1 text-sm text-primary-foreground/80">
            Start managing your subscriptions smarter
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="h-11 rounded-xl"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-pass" className="text-sm font-medium">
              Password
            </Label>

            <div className="relative">
              <Input
                id="reg-pass"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="h-11 rounded-xl pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-confirm" className="text-sm font-medium">
              Confirm Password
            </Label>
            <Input
              id="reg-confirm"
              type="password"
              placeholder="••••••••"
              {...register("confirm")}
              className="h-11 rounded-xl"
            />
            {errors.confirm && (
              <p className="text-xs text-destructive">
                {errors.confirm.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="mt-2 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to our Terms &amp; Privacy Policy.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
