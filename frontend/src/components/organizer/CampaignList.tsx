import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ReloadIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { CampaignCard } from "./CampaignCard";
import { CampaignFilters } from "./CampaignFilters";
import type { CampaignStatusFilter, CampaignTypeFilter } from "./CampaignFilters";
import { ConfirmModal } from "../ui/ConfirmModal";
import { ListSkeleton, ErrorState } from "../ui";
import { useCampaigns, useBulkDeleteCampaigns } from "../../hooks/useCampaigns";
import toast from "react-hot-toast";

export function CampaignList() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<CampaignTypeFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useCampaigns({
    search,
    page,
    limit,
    status: statusFilter,
    campaignType: typeFilter,
  });

  const bulkDelete = useBulkDeleteCampaigns();

  // Debounce search input and reset page/selection
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
      setSelected(new Set());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleStatusChange = (value: CampaignStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
    setSelected(new Set());
  };

  const handleTypeChange = (value: CampaignTypeFilter) => {
    setTypeFilter(value);
    setPage(1);
    setSelected(new Set());
  };

  const campaigns = useMemo(() => data?.campaigns ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const allOnPageSelected =
    campaigns.length > 0 &&
    campaigns.filter((c) => c.status === "draft").every((c) => selected.has(c.id));

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const draftCampaigns = campaigns.filter((c) => c.status === "draft");
      const allDraftsSelected =
        draftCampaigns.length > 0 &&
        draftCampaigns.every((c) => next.has(c.id));
      if (allDraftsSelected) {
        draftCampaigns.forEach((c) => next.delete(c.id));
      } else {
        draftCampaigns.forEach((c) => next.add(c.id));
      }
      return next;
    });
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    setSelected(new Set());
  };

  const handleBulkDelete = () => {
    bulkDelete.mutate([...selected], {
      onSuccess: (res) => {
        toast.success(res?.message || "Campaigns deleted");
        setShowBulkDelete(false);
        setSelected(new Set());
      },
      onError: (err: unknown) => {
        const axiosError = err as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || "Failed to delete campaigns");
      },
    });
  };

  if (isLoading) {
    return <ListSkeleton rows={6} />;
  }

  if (isError) {
    return <ErrorState title="Couldn’t load campaigns" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      {/* Search, filters, and refresh */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)">
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title"
              className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-9 pr-3 text-sm outline-none focus:border-(--primary)"
            />
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Reload"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--border) text-(--text-muted) transition hover:bg-(--surface) hover:text-(--text-primary) disabled:opacity-50"
          >
            <HugeiconsIcon
              icon={ReloadIcon}
              size={18}
              className={isFetching ? "animate-spin" : ""}
            />
          </button>
        </div>

        <CampaignFilters
          value={statusFilter}
          onChange={handleStatusChange}
          counts={undefined}
          typeValue={typeFilter}
          onTypeChange={handleTypeChange}
          typeCounts={undefined}
        />
      </div>

      {/* Bulk delete bar */}
      {selected.size > 0 && (
        <div className="sticky bottom-20 z-30 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg sm:static sm:bottom-0 sm:shadow-none">
          <p className="text-sm text-red-700">{selected.size} selected</p>
          <button
            type="button"
            onClick={() => setShowBulkDelete(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete selected
          </button>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
        <div className="flex items-center gap-3 border-b border-(--border) px-4 py-2.5">
          <input
            type="checkbox"
            checked={allOnPageSelected}
            onChange={toggleAllOnPage}
            className="h-4 w-4 accent-(--primary)"
          />
          <span className="text-xs text-(--text-muted)">
            Select page · {total} total
          </span>
        </div>

        {campaigns.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-(--text-muted)">
            {search ? "No campaigns match your search." : "No campaigns yet."}
          </p>
        ) : (
          <div className="divide-y divide-(--border)">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                selected={selected.has(campaign.id)}
                onToggleSelect={toggleOne}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-(--text-muted)">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(Math.max(1, page - 1))}
              className="rounded-xl border border-(--border) px-4 py-2 text-(--text-primary) disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="rounded-xl border border-(--border) px-4 py-2 text-(--text-primary) disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation */}
      <ConfirmModal
        isOpen={showBulkDelete}
        title="Delete selected campaigns?"
        message={`You are about to permanently delete ${selected.size} campaign(s). All students and payment data will be removed. This cannot be undone.`}
        confirmLabel="Delete campaigns"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDelete(false)}
      />
    </div>
  );
}