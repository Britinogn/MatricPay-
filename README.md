# MatricPay

University and polytechnic payment collection for class reps, departmental executives, and student organizers.

Students pay through **Paystack Checkout**. MatricPay never holds the money. Each payment settles to the organizer’s bank via a **Paystack subaccount**. MatricPay takes a **2% platform fee** at charge time (`transaction_charge` in kobo). Paystack’s own fee is borne by the organizer (`bearer: subaccount`).

---

## How it works

### Organizer

1. **Register / log in** (JWT, no refresh token in Phase 1).
2. **Link a payout account** — bank resolve + Paystack subaccount. Campaigns cannot go live without this.
3. **Create a campaign**
   - **Restricted** — known roster (departmental dues). Upload students (CSV / Excel / manual) **before** activate.
   - **Open** — events, hackathons. Student fills details at pay time. Amount can be **fixed** or **minimum**.
4. **Activate** — restricted needs students + payout; open needs payout.
5. **Share the payment link** `/pay/:slug`.
6. Watch **overview**, **campaign dashboard**, **payments**, and **reports** (CSV / PDF of successful payers).
7. **Close** when collection is done. Drafts can be deleted; payments keep history.

### Student (restricted)

1. Open the link → enter **matric number** (must be on the roster).
2. Enter an **email for this Paystack checkout only**. It is **not** written onto the student row.
3. Pay. Success is confirmed by **redirect verify** and/or **Paystack webhook**.

### Student (open)

1. Open the link → enter name, matric, **email** (saved on the student), optional extras, amount if minimum.
2. Pay the same way.

### Money

| Piece | Who gets it |
|--------|-------------|
| Student charge | Whole naira (ceiled) sent to Paystack in **kobo** |
| Paystack fee | Organizer (subaccount) |
| MatricPay 2% | Main Paystack account (`transaction_charge`) |
| Remainder | Organizer bank on Paystack’s settlement cycle (usually T+1) |

**Organizer dashboards use net (campaign amount × paid students).**  
**Admin totals are gross (what students paid).**

If paid amount / currency does not match, the payment is **flagged**, not silently marked successful.

---

## What Phase 1 includes

- Restricted + open campaigns, activate / close / edit / delete
- Student import, search, pagination, edit, delete, bulk delete
- Public pay pages, PWA
- Paystack initialize + verify + signed webhook (`WebhookLog`)
- Organizer: overview, campaign metrics + chart, payments, reports, payout account, activity (audit)
- Admin: overview, organizers (suspend / reactivate), campaigns (force-close), audit, webhook inspector
- Desktop sidebar + mobile app-style tabs / More sheet

**Not in Phase 1:** settings, reset password, refunds, Socket.IO, subscriptions, multi-org.

---

## Stack

| Layer | Choice |
|--------|--------|
| Frontend | React, Vite, Tailwind v4, TanStack Query, React Router |
| Backend | Node, Express, TypeScript |
| DB | PostgreSQL + Prisma |
| Pay | Paystack (initialize, verify, webhook, subaccounts) |
| Auth | JWT Bearer + bcrypt |

---

## Repo

```text
matricpay/
├── backend/          API, Prisma, Paystack
└── frontend/         Organizer, admin, public pay, marketing