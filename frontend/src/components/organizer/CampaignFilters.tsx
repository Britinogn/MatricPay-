export type CampaignStatusFilter = "all" | "active" | "draft" | "closed";

interface CampaignFiltersProps {
  value: CampaignStatusFilter;
  onChange: (value: CampaignStatusFilter) => void;
  counts?: Partial<Record<CampaignStatusFilter, number>>;
}

const filters: { label: string; value: CampaignStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Closed", value: "closed" },
];

export function CampaignFilters({ value, onChange, counts }: CampaignFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = value === filter.value;
        const count = counts?.[filter.value];

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-(--primary) text-white"
                : "border border-(--border) bg-(--surface) text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {filter.label}
            {typeof count === "number" && (
              <span className={`ml-1.5 ${isActive ? "text-white/80" : "text-(--text-muted)"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}