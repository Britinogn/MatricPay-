import { useState } from "react";

const faqs = [
  {
    question: "Is MatricPay free for students?",
    answer:
      "Yes, students never pay any platform fee. They only pay the campaign amount set by the organizer. The platform fee is deducted from the organizer's settlement.",
  },
  {
    question: "How do I get paid as an organizer?",
    answer:
      "Once you link your bank account and create a Paystack subaccount, all successful payments settle directly to your bank account. MatricPay never holds your funds.",
  },
  {
    question: "What fees are deducted?",
    answer:
      "MatricPay charges a 2% platform fee per successful payment. Paystack also charges its standard processing fee (1.5% + ₦100, capped at ₦2,000). Both are deducted from the organizer's share.",
  },
  {
    question: "Can I use it for any type of collection?",
    answer:
      "Yes, MatricPay works for class dues, departmental levies, events, hackathons, or any other collection. You can create a restricted campaign (with a student list) or an open campaign.",
  },
  {
    question: "What happens if a student pays after the campaign closes?",
    answer:
      "Once a campaign is closed, no new payment attempts can be initiated. However, any pending payment already in progress (e.g., a student is on the Paystack checkout page) will still be honored.",
  },
  {
    question: "How do I update my bank details?",
    answer:
      "You can update your payout account details at any time from the payout account page. The new details will be used for future settlements.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1
        className="text-3xl font-semibold text-(--text-primary)"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Frequently asked questions
      </h1>
      <p className="mt-2 text-sm text-(--text-muted)">
        Quick answers to common questions about MatricPay.
      </p>

      <div className="mt-10 space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="rounded-2xl border border-(--border) bg-(--surface)"
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-(--text-primary) hover:bg-(--background) transition"
            >
              <span>{faq.question}</span>
              <span className={`text-(--muted) transition-transform ${openIndex === index ? "rotate-45" : ""}`}>
                +
              </span>
            </button>
            {openIndex === index && (
              <div className="px-5 pb-4 text-sm leading-relaxed text-(--text-muted)">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}