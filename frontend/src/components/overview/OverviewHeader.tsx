import { HugeiconsIcon } from "@hugeicons/react";
import { WavingHandIcon } from "@hugeicons/core-free-icons";
// import { Link } from "react-router-dom";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function OverviewHeader({ firstName }: { firstName: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-(--text-primary)" style={{ fontFamily: "var(--font-display)" }}>
          <span>{getGreeting()}, {firstName}</span>
          <HugeiconsIcon icon={WavingHandIcon} size={24} className="text-(--primary)" />
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">Here’s what’s happening with your campaigns.</p>
      </div>
      {/* <Link
        to="/dashboard/campaigns/new"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
      >
        <HugeiconsIcon icon={Add01Icon} size={16} />
        Create Campaign
      </Link> */}
    </div>
  );
}