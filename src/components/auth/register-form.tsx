"use client";
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
import {
  registerWithEmailPassword,
  signInWithGoogle,
} from "@/lib/firebase/client/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Inputs = {
  email: string;
  password1: string;
  password2: string;
  displayName: string;
};

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();

  const handleRegister = async (data: Inputs) => {
    const { email, password1, password2, displayName } = data;

    const response = await registerWithEmailPassword(
      displayName,
      email,
      password1,
      password2,
    );

    if (response.type == "error") {
      toast.error(response.message);
    }

    if (response.type == "invalid") {
      if (response.input === "email") {
        setError("email", {
          type: "custom",
          message: response.message,
        });
      }

      if (response.input === "password") {
        setError("password1", {
          type: "custom",
          message: response.message,
        });
        setError("password2", {
          type: "custom",
          message: response.message,
        });
      }
    }
  };

  const handleRegisterWithGoogle = (event: React.SyntheticEvent) => {
    event.preventDefault();
    signInWithGoogle();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register your account</CardTitle>
          <CardDescription>
            Enter your information below to register your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleRegister)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Anota Nusa"
                  required
                  {...register("displayName")}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="anotanusa@example.com"
                  required
                  {...register("email")}
                  className={cn({
                    "border-red-500": errors.email,
                  })}
                />
                {errors.email && errors.email.type === "custom" && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password1"
                  type="password"
                  required
                  {...register("password1")}
                  className={cn({
                    "border-red-500": errors.password1,
                  })}
                />
                {errors.password1 && errors.password1.type === "custom" && (
                  <p className="text-sm text-red-500">
                    {errors.password1.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Repeat Password</Label>
                </div>
                <Input
                  id="password2"
                  type="password"
                  required
                  {...register("password2")}
                  className={cn({
                    "border-red-500": errors.password2,
                  })}
                />
                {errors.password2 && errors.password2.type === "custom" && (
                  <p className="text-sm text-red-500">
                    {errors.password2.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Register
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" onClick={handleRegisterWithGoogle}>
                    Register with Google
                  </a>
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
