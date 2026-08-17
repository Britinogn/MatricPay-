import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft04Icon } from "@hugeicons/core-free-icons";

interface BackLinkProps {
  to: string;
  label?: string;
}

export function BackLink({ to, label = "Back" }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-(--text-muted) transition hover:text-(--text-primary)"
    >
      <HugeiconsIcon icon={ArrowLeft04Icon} size={16} />
      {label}
    </Link>
  );
}