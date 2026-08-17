import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn’t load this page. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <HugeiconsIcon icon={Alert02Icon} size={22} />
      </div>

      <h2 className="text-base font-semibold text-(--text-primary)">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-(--text-muted)">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition hover:bg-(--background)"
        >
          <HugeiconsIcon icon={RefreshIcon} size={16} />
          Try again
        </button>
      )}
    </div>
  );
}