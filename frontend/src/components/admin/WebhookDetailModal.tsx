import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useAdminWebhookLog } from "../../hooks/useAdmin";

interface WebhookDetailModalProps {
  id: string | null;
  onClose: () => void;
}

export function WebhookDetailModal({ id, onClose }: WebhookDetailModalProps) {
  const { data: log, isLoading, isError } = useAdminWebhookLog(id);

  if (!id) return null;

  return (
    <div className="fixed inset-0 z-70">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-(--surface) md:inset-y-0 md:right-0 md:left-auto md:w-full md:max-w-lg md:rounded-none md:border-l md:border-(--border)">
        <div className="sticky top-0 flex items-center justify-between border-b border-(--border) bg-(--surface) px-4 py-3">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Webhook
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
          {isLoading && (
            <p className="text-sm text-(--text-muted)">Loading payload…</p>
          )}
          {isError && (
            <p className="text-sm text-red-600">Couldn’t load this webhook.</p>
          )}
          {log && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Event" value={log.eventType} />
                <Field label="Provider" value={log.provider} />
                <Field label="Reference" value={log.reference || "—"} />
                <Field
                  label="Status"
                  value={log.processed ? "Processed" : "Not processed"}
                />
                <Field label="Attempts" value={String(log.attempts)} />
                <Field
                  label="Received"
                  value={new Date(log.receivedAt).toLocaleString("en-NG")}
                />
              </div>

              {log.lastError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3">
                  <p className="text-xs font-medium text-red-700">Last error</p>
                  <p className="mt-1 break-all font-mono text-xs text-red-700">
                    {log.lastError}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-1.5 text-xs font-medium text-(--text-muted)">
                  Payload
                </p>
                <pre className="max-h-[50vh] overflow-auto rounded-xl border border-(--border) bg-(--background) p-3 font-mono text-[11px] leading-relaxed text-(--text-primary)">
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            </>
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