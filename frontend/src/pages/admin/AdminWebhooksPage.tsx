import { WebhookLogList } from "../../components/admin";

export default function AdminWebhooksPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Webhooks
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Paystack deliveries. Open a row to inspect payload and errors.
        </p>
      </div>
      <WebhookLogList />
    </div>
  );
}