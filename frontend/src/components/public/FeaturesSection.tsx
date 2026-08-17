const features = [
  {
    title: "Secure Payments",
    body: "Students pay safely through Paystack checkout — no screenshot transfers.",
  },
  {
    title: "Instant Verification",
    body: "Successful payments are verified with Paystack and reflected on the dashboard.",
  },
  {
    title: "Receipts & Records",
    body: "Every payment has a unique reference organizers can track and reconcile.",
  },
  {
    title: "Live Campaign Tracking",
    body: "See paid vs unpaid students and collection progress as payments come in.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-(--border) bg-(--surface)/50 py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <h2
            className="text-2xl font-semibold text-(--text-primary) md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need in one place
          </h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            Built for class dues, levies, and campus collections.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-(--border) bg-(--background) p-5"
            >
              <h3 className="text-sm font-semibold text-(--text-primary)">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}