import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { AdminAuditLogRow } from "../../hooks/useAdmin";

const EVENT_LABELS: Record<string, string> = {
  "campaign.created": "Campaign created",
  "campaign.activated": "Campaign activated",
  "campaign.closed": "Campaign closed",
  "campaign.updated": "Campaign updated",
  "campaign.force_closed": "Campaign force-closed",
  "student.imported": "Students imported",
  "payment.initiated": "Payment started",
  "payment.completed": "Payment successful",
  "payment.failed": "Payment failed",
  "organizer.suspended": "Organizer suspended",
  "organizer.reactivated": "Organizer reactivated",
};

interface AuditDetailModalProps {
  log: AdminAuditLogRow | null;
  onClose: () => void;
}

export function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-70">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-(--surface) md:inset-y-0 md:right-0 md:left-auto md:w-full md:max-w-lg md:rounded-none md:border-l md:border-(--border)">
        <div className="sticky top-0 flex items-center justify-between border-b border-(--border) bg-(--surface) px-4 py-3">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {EVENT_LABELS[log.event] || log.event}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-(--text-muted) hover:bg-(--background)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="rounded-2xl bg-(--background) px-4 py-3">
            <p className="text-[11px] text-(--text-muted)">Organizer / actor</p>
            <p className="mt-0.5 text-sm font-semibold">
              {log.actor?.fullName || "System"}
            </p>
            <p className="text-xs text-(--text-muted)">
              {log.actor?.email || "—"} · {log.actorRole}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Entity" value={`${log.entityType}`} />
            <Field label="Entity ID" value={log.entityId} />
            <Field
              label="When"
              value={new Date(log.createdAt).toLocaleString("en-NG")}
            />
            <Field label="IP" value={log.ipAddress || "—"} />
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-(--text-muted)">
                Details
              </p>
              <pre className="max-h-[40vh] overflow-auto rounded-xl border border-(--border) bg-(--background) p-3 font-mono text-[11px] leading-relaxed">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-(--text-muted)">{label}</p>
      <p className="mt-0.5 break-all font-medium">{value}</p>
    </div>
  );
}