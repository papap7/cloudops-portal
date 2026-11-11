import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router";
import { loginSchema, type LoginFormData } from "../schemas/authSchema";
import { loginUser } from "../api/client";
import useAuthStore from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPage() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setSession(data.token, data.user.name);
      navigate("/");
    },
  });

  const onSubmit = (values: LoginFormData) => {
    loginMutation.mutate(values);
  };

  // Optional read-only demo account for visitors (set both in Vercel to enable).
  // The button stays hidden when either value is missing.
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL as string | undefined;
  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;
  const hasDemoAccount = Boolean(demoEmail && demoPassword);

  const signInWithDemo = () => {
    if (!demoEmail || !demoPassword) return;
    loginMutation.mutate({ email: demoEmail, password: demoPassword });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to the CloudOps Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {loginMutation.isError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {loginMutation.error.message}
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="engineer@company.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={loginMutation.isPending} className="w-full mt-3 justify-center">
            {loginMutation.isPending ? "Signing in..." : "Log In"}
          </Button>

          {hasDemoAccount && (
            <div className="rounded-lg border border-dashed border-gray-300 p-3 text-center dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Just looking around?</p>
              <Button
                type="button"
                variant="outline"
                onClick={signInWithDemo}
                disabled={loginMutation.isPending}
                className="mt-2 w-full justify-center"
              >
                Use demo account
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
