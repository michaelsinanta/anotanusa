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
  signInWithEmailPassword,
  signInWithGoogle,
} from "@/lib/firebase/client/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Inputs = {
  email: string;
  password: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();

  const handleLoginEmailPassword = async (data: Inputs) => {
    const { email, password } = data;

    const response = await signInWithEmailPassword(email, password);

    if (response.type === "error") {
      toast.error(response.message);
    }

    if (response.type === "invalid") {
      if (response.input === "all") {
        setError("email", {
          type: "custom",
          message: response.message,
        });
        setError("password", {
          type: "custom",
          message: response.message,
        });
      }
    }
  };

  const handleLoginGoogle = (event: React.SyntheticEvent) => {
    event.preventDefault();
    signInWithGoogle();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleLoginEmailPassword)}>
            <div className="flex flex-col gap-6">
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
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                  className={cn({
                    "border-red-500": errors.password,
                  })}
                />
                {errors.password && errors.password.type === "custom" && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" onClick={handleLoginGoogle}>
                    Login with Google
                  </a>
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
