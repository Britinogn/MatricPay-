import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { useLogin } from "../../hooks";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      // await login.mutateAsync(values);
      // toast.success("Welcome back");
      const data = await login.mutateAsync(values);
      toast.success("Welcome back");

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard/overview");
      }

      // navigate("/");

    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };

      const message =
        axiosError.response?.data?.message || "Invalid email or password";

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <h1
              className="text-3xl font-semibold tracking-tight text-(--text-primary)"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Matric<span className="text-(--primary)">Pay</span>
            </h1>
          </Link>
          <p className="mt-2 text-sm text-(--text-muted)">
            Sign in to manage your campaigns
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-1.5">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition"
                placeholder="you@school.edu.ng"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 pr-11 text-sm text-(--text-primary) placeholder:text-(--text-muted) outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) transition"
                >
                  <HugeiconsIcon
                    icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                    size={18}
                  />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full rounded-xl bg-(--primary) hover:bg-(--primary-hover) text-white font-medium py-2.5 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-(--text-muted)">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-(--primary) hover:text-(--primary-hover) transition"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}