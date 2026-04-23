import { useState } from "react";
import { Plane, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
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
import { useLogin } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
  password: z.string().min(1, "Please enter your password").max(255),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

export function LoginModal({
  open,
  onOpenChange,
  onLoginSuccess,
}: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSuccessMessage("");

    await loginMutation.mutateAsync({
      email: data.email.trim(),
      password: data.password,
    });

    setSuccessMessage("Login successful.");

    reset({
      email: "",
      password: "",
    });

    setShowPassword(false);

    setTimeout(() => {
      onOpenChange(false);
      setSuccessMessage("");
      onLoginSuccess?.();
    }, 800);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setShowPassword(false);
      setSuccessMessage("");
      loginMutation.reset();
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
              Welcome back
            </DialogTitle>
          </DialogHeader>

          <p className="mt-1 text-sm text-primary-foreground/80">
            Log in to your SubPilot account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="login-email"
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
            <Label htmlFor="login-pass" className="text-sm font-medium">
              Password
            </Label>

            <div className="relative">
              <Input
                id="login-pass"
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

          {loginMutation.error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {loginMutation.error.message}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="mt-2 w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Log In
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
