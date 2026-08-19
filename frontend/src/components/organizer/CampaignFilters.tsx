export type CampaignStatusFilter = "all" | "active" | "draft" | "closed";
export type CampaignTypeFilter = "all" | "restricted" | "open";

interface CampaignFiltersProps {
  // Original status props (unchanged)
  value: CampaignStatusFilter;
  onChange: (value: CampaignStatusFilter) => void;
  counts?: Partial<Record<CampaignStatusFilter, number>>;

  // New campaign type props
  typeValue: CampaignTypeFilter;
  onTypeChange: (value: CampaignTypeFilter) => void;
  typeCounts?: Partial<Record<CampaignTypeFilter, number>>;
}

const statusFilters: { label: string; value: CampaignStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Closed", value: "closed" },
];

const typeFilters: { label: string; value: CampaignTypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Restricted", value: "restricted" },
  { label: "Open", value: "open" },
];

export function CampaignFilters({
  value,
  onChange,
  counts,
  typeValue,
  onTypeChange,
  typeCounts,
}: CampaignFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const active = value === filter.value;
          const count = counts?.[filter.value];
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-(--primary) text-white"
                  : "border border-(--border) bg-(--surface) text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              {filter.label}
              {typeof count === "number" && (
                <span className={`ml-1.5 ${active ? "text-white/80" : "text-(--text-muted)"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Campaign type filters */}
      <div className="flex flex-wrap gap-2">
        {typeFilters.map((filter) => {
          const active = typeValue === filter.value;
          const count = typeCounts?.[filter.value];
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onTypeChange(filter.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-(--primary) text-white"
                  : "border border-(--border) bg-(--surface) text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              {filter.label}
              {typeof count === "number" && (
                <span className={`ml-1.5 ${active ? "text-white/80" : "text-(--text-muted)"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}