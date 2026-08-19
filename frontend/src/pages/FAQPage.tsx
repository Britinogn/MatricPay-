import { useState } from "react";

const faqs = [
  {
    question: "Is MatricPay free for students?",
    answer:
      "Yes. Students do not pay a MatricPay platform fee. They pay the amount set by the organizer, while applicable MatricPay and Paystack fees are deducted during settlement.",
  },
  {
    question: "How do I get paid as an organizer?",
    answer:
      "When you create your organizer account, you provide your bank details for payouts. MatricPay creates a Paystack subaccount for you, and successful payments are automatically split between MatricPay and your payout account. Your payout account must be verified before your first payout can be processed.",
  },
  {
    question: "How long does payout account verification take?",
    answer:
      "Your payout account requires a one-time manual verification through Paystack before the first payout can be processed. Verification may take up to 24 hours. Once verified, future payouts can be processed normally.",
  },
  {
    question: "What fees are deducted?",
    answer:
      "MatricPay charges a 2% platform fee on successful payments. Paystack also charges its applicable transaction processing fee. The exact amount you receive depends on the payment amount, payment channel, and how the transaction fees are applied.",
  },
  {
    question: "Can I use MatricPay for any type of collection?",
    answer:
      "Yes. MatricPay can be used for class dues, departmental levies, events, hackathons, and other organized collections. You can create a restricted campaign with a student list or an open campaign.",
  },
  {
    question: "What happens if a student pays after the campaign closes?",
    answer:
      "Once a campaign is closed, new payment attempts cannot be started. A payment that was already initiated before the campaign closed may still be completed depending on its payment status.",
  },
  {
    question: "How do I update my bank details?",
    answer:
      "You can update your payout account details from your payout settings. After changing your bank details, the updated payout account may require verification again before payouts can be processed to the new account.",
  },
  {
    question: "Will MatricPay hold my campaign money?",
    answer:
      "No. MatricPay does not operate as a wallet or hold campaign funds for organizers. Payments are processed through Paystack and split according to the configured transaction split.",
  },
  {
    question: "What happens to my first payout if my account is not verified?",
    answer:
      "The payment can still be successful and the transaction split can still be recorded, but the payout to your unverified subaccount may remain pending. Once the payout account is verified, Paystack can process the pending payout.",
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
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-(--text-primary) transition hover:bg-(--background)"
              aria-expanded={openIndex === index}
            >
              <span>{faq.question}</span>

              <span
                className={`text-(--text-muted) transition-transform ${
                  openIndex === index ? "rotate-45" : ""
                }`}
              >
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