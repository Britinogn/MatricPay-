import { Link } from "react-router-dom";

interface LogoProps {
  to?: string;
  className?: string;
  size?: "sm" | "lg";
}

export function Logo({ to = "/", size = "lg", className = "" }: LogoProps) {
  const textSize = size === "sm" ? "text-base" : "text-lg";
  return (
    <Link to={to} className={className}>
      <span
        className={`${textSize} font-semibold tracking-tight text-(--text-primary)`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        Matric<span className="text-(--primary)">Pay</span>
      </span>
    </Link>
  );
}