import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useCampaign } from "../../hooks/useCampaigns";
import { useDashboard } from "../../hooks/useDashboard";
import { useCampaignPayments } from "../../hooks/useCampaignPayments";
import { formatNaira } from "../../lib/format";
import { downloadCampaignExport } from "../../lib/downloadExport";
import { BackLink } from "../../components/ui/BackLink";
import { ListSkeleton, ErrorState, StatCard } from "../../components/ui";

export default function CampaignReportPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const { data: campaign, isLoading: campaignLoading } = useCampaign(campaignId);
  const { data: dashboard, isLoading: dashLoading } = useDashboard(campaignId);
  const { data, isLoading, isError, refetch } = useCampaignPayments(campaignId, {
    status: "successful",
    page: 1,
    limit: 25,
  });

  const payments = data?.payments ?? [];
  const metrics = dashboard?.metrics;

  async function handleExport(format: "csv" | "pdf") {
    if (!campaignId) return;
    try {
      setExporting(format);
      await downloadCampaignExport(campaignId, format);
      toast.success(format === "csv" ? "CSV downloaded" : "PDF downloaded");
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-6">
      <BackLink to="/dashboard/reports" label="Back to reports" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {campaignLoading ? "…" : campaign?.title || "Campaign report"}
          </h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            Paid students · export CSV or PDF
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!!exporting}
            onClick={() => handleExport("csv")}
            className="rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--text-primary) hover:bg-(--background) disabled:opacity-60"
          >
            {exporting === "csv" ? "Exporting…" : "Export CSV"}
          </button>
          <button
            type="button"
            disabled={!!exporting}
            onClick={() => handleExport("pdf")}
            className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--primary-hover) disabled:opacity-60"
          >
            {exporting === "pdf" ? "Exporting…" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Summary */}
      {dashLoading ? (
        <ListSkeleton rows={2} />
      ) : metrics ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Collected"
            value={formatNaira(metrics.totalCollected)}
          />
          <StatCard
            label="Expected"
            value={formatNaira(metrics.totalExpected)}
          />
          <StatCard
            label="Paid students"
            value={String(metrics.paidStudents ?? "—")}
          />
          <StatCard
            label="Collection rate"
            value={`${metrics.collectionPercentage ?? 0}%`}
          />
        </div>
      ) : null}

      {/* Paid list preview */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-(--text-primary)">
          Successful payments
        </h2>

        {isLoading ? (
          <ListSkeleton rows={5} />
        ) : isError ? (
          <ErrorState
            title="Couldn’t load payments"
            message="Please try again."
            onRetry={() => refetch()}
          />
        ) : payments.length === 0 ? (
          <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center text-sm text-(--text-muted)">
            No successful payments yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
            <div className="divide-y divide-(--border) md:hidden">
              {payments.map((p) => (
                <div key={p.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-(--text-primary)">
                    {p.student?.fullName}
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    {p.student?.matricNumber} · {formatNaira(p.amount, p.currency)}
                  </p>
                </div>
              ))}
            </div>

            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-(--border) bg-(--background) text-xs text-(--text-muted)">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Matric</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-(--text-primary)">
                      {p.student?.fullName}
                    </td>
                    <td className="px-4 py-3 text-(--text-muted)">
                      {p.student?.matricNumber}
                    </td>
                    <td className="px-4 py-3">
                      {formatNaira(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-(--text-muted)">
                      {p.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}