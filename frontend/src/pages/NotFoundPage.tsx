import { Link } from "react-router-dom";
import { useCurrentUser } from "../hooks";

export default function NotFoundPage() {
  const { data: user, isLoading } = useCurrentUser();

  const homePath = !user
    ? "/login"
    : user.role === "admin"
      ? "/admin"
      : "/dashboard/overview";

  const homeLabel = !user
    ? "Go to login"
    : user.role === "admin"
      ? "Back to admin"
      : "Back to dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--background) px-4 text-center">
      <p
        className="text-6xl font-semibold text-(--primary)"
        style={{ fontFamily: "var(--font-display)" }}
      >
        404
      </p>
      <h1 className="mt-3 text-xl font-semibold text-(--text-primary)">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-(--text-muted)">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      {!isLoading && (
        <Link
          to={homePath}
          className="mt-6 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
        >
          {homeLabel}
        </Link>
      )}
    </div>
  );
}