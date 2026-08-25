import { AuditLogList } from "../../components/admin";

export default function AdminAuditPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Audit
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Platform actions by organizers and admins.
        </p>
      </div>
      <AuditLogList />
    </div>
  );
}