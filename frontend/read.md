# 📌 MatricPay MVP (Architecture Freeze v7 — Paystack Subaccount Settlement)

# 1. What MatricPay Is

MatricPay is a university and polytechnic focused payment collection platform that enables class representatives to create payment campaigns and collect contributions from students through **Paystack Checkout**.

It eliminates manual bank transfers, screenshot verification, and spreadsheet reconciliation by automatically matching verified payments using secure payment references. Every payment settles directly to the organizer's own bank account via Paystack Subaccounts — MatricPay never holds student funds, and takes a 2% platform fee per transaction automatically at the point of settlement.

Depending on the campaign configuration, students can either be validated against a pre-uploaded student list or register their details during payment.

Organizers can monitor collections through a centralized dashboard.

---

# 2. MVP Goal

Build a working payment platform that successfully completes the full payment lifecycle.

Both campaign types share a required first step: Register → Link Payout Account (see §8, Payout Account) → then diverge:

Restricted: Create Campaign → Upload Student List → Activate Campaign → Student Pays → Payment Verified → Organizer Settled → Dashboard Updates Automatically
Open: Create Campaign → Activate Campaign → Student Pays → Payment Verified → Organizer Settled → Dashboard Updates Automatically

Everything outside this flow is out of scope for the MVP.

---

# 3. Core Users

## Organizer

Capabilities:

- Register account
- Login
- Create payment campaigns
- Activate campaigns
- Close campaigns
- Choose campaign type
- Import students (Restricted campaigns only — required before activation; Open campaigns skip this step entirely)
- Track payments
- Manage campaign settings *(Phase 2 — not part of MVP; see §14)*

### Student Import Methods

- Manual Entry
- CSV Upload
- Excel (.xlsx) Upload

Future Support (Phase 2): PDF, DOCX, OCR / Image Import

---

## Admin

A `users` record with `role = admin`. Exists for platform management, not campaign creation.

Capabilities (MVP scope):

- View all organizers and their campaigns platform-wide
- Suspend or reactivate an organizer's account (e.g. abuse, fraud, policy violation)
- Force-close any organizer's campaign
- View platform-wide payment/collection stats

Not in MVP scope for admin: editing another organizer's campaign content, refunding payments, or any billing/subscription actions — these don't exist yet at all (see Non-Goals).

---

## Student

No account required.

Students simply:

- Open payment link
- Enter required information
- Review payment details
- Complete payment using Paystack Checkout
- Receive payment confirmation

---

# 4. Campaign Types

## Restricted Campaign

Used for departmental dues, class levies and other payments where students are already known.

Requirements:

- Student list must be uploaded before activation.
- Student must exist before payment.
- Backend validates the matric number before checkout.
- Always uses a **fixed** payment amount.

Flow:

Upload Student List → Enter Matric Number → Validate Student → Confirm Payment → Checkout

---

## Open Campaign

Used for hackathons, events, seminars or public collections.

Requirements:

- No student upload required.
- Student enters their own information.
- Backend creates the student record automatically.
- Organizer chooses either **Fixed Amount** or **Minimum Amount** at creation. If Minimum, students may pay any amount ≥ the configured minimum.

Flow:

Enter Details → Enter Amount (if applicable) → Create Student → Confirm Payment → Checkout

---

# 5. Payment Lifecycle

1. Organizer creates a campaign.
2. System generates a unique slug and public payment link.
3. Organizer activates the campaign.
4. Student visits `/pay/:slug`.
5. Backend verifies: campaign exists, `status = active`, and is not past `expires_at`. (A campaign whose `expires_at` has passed is treated as expired even if its stored `status` still says `active` — see §6, `campaigns`.)
6. Backend determines campaign type.

**Restricted:** student enters matric number → backend validates and returns full name, campaign title, fixed amount.

**Open:** student enters full name, matric number, and amount (if minimum-type) → backend creates the student record.

7. Student confirms payment.
8. Backend checks for an existing **pending, non-expired** payment for the same student + campaign.
   - If found, reuse its reference.
   - Otherwise, generate a new unique payment reference and create a pending payment.
   - This check-then-create step is protected by a database-level constraint (see §6, `payments`) so simultaneous requests — e.g. a double-click or two open tabs — can't both create a pending row for the same student.
9. Backend initializes a Paystack transaction, converting the amount to kobo (amount × 100) — Paystack's API expects the smallest currency unit, and this conversion happens once, at this boundary, not scattered across the codebase. The initialize call includes `subaccount: <organizer's paystack_subaccount_code>` and `bearer: "subaccount"` — the organizer's settlement absorbs Paystack's own processing fee (currently 1.5% + ₦100 for local cards, capped at ₦2,000, waived under ₦2,500), on top of MatricPay's platform cut. `transaction_charge` is a **flat kobo amount, not a percentage** — Paystack does not accept "2%" as a value, so the backend computes `Math.round(amount_kobo * 0.02)` and passes that number. **The organizer's real net is therefore below the headline 98%** once Paystack's own fee is factored in (roughly 94–96% net on typical dues-sized payments) — this must be disclosed accurately to organizers (see §9, Fee Disclosure), never advertised as a flat "98%."
10. Student is redirected to Paystack Checkout and completes payment.
11. Paystack redirects the student back to the app's success page. The flow from here is:

```
Redirect from Paystack
        ↓
  Success Page loads
        ↓
GET /payments/:reference/status
        ↓
  "Loading / Verifying..." shown
        ↓
  Not yet successful locally?
  → backend does a direct, synchronous
    verify call to Paystack right now
        ↓
      Verified
        ↓
      Success shown
```

This exists because the webhook (step 12) is asynchronous and may not have arrived yet — the student should never be stuck on a loading screen waiting for it.

12. Paystack also sends a webhook (the durable, authoritative path — this is what's trusted for record-keeping even if the redirect-triggered check above already resolved it for the student).
13. Backend verifies the webhook signature.
14. Backend independently re-verifies the transaction directly with Paystack's API (never trusts the webhook payload alone).
15. Backend retrieves the pending payment by reference.
16. Backend ensures: not already processed, amount matches (or ≥ minimum), currency matches.
    - If either doesn't match: mark `flagged`, with `failure_reason` set to `amount_mismatch` or `currency_mismatch` accordingly. Do not mark successful. Surfaced on the organizer dashboard as a **Flagged** count for manual review — no auto-resolution in MVP.
17. Backend stores provider, provider transaction ID, verification timestamp.
18. Payment status becomes `successful`.
19. Dashboard updates automatically via polling every **10 seconds**. *(Socket.IO real-time push is a Phase 2 upgrade, not required for MVP.)*

---

# 6. Database Design

## users

- id, full_name, email, password_hash, role, status, paystack_subaccount_code (nullable), settlement_bank_code (nullable), settlement_account_number (nullable), settlement_account_name (nullable), created_at, updated_at

Role: `organizer | admin`
Status: `active | suspended` — an admin can suspend an organizer's account (see §3, Admin); a suspended organizer cannot log in or manage campaigns, but their existing active campaigns keep accepting payments unless separately closed.

Using `users` with a `role` column (rather than a dedicated `organizers` table) means adding future roles (e.g. finance) later needs no migration — just a new enum value.

**Settlement model:** MatricPay does not hold or transfer student payments itself. Each organizer's campaigns settle directly to *their own* bank account via a **Paystack Subaccount** — one Paystack account (MatricPay's) creates and manages subaccounts on behalf of organizers, so organizers never need their own separate Paystack merchant account. `settlement_account_name` is the name Paystack's Resolve Account Number API returns for the given account — always shown back to the organizer for confirmation before the subaccount is created, catching typos before any money is ever at stake. MatricPay takes a **2% platform fee** per successful transaction (`transaction_charge`), with `bearer: "subaccount"` — meaning Paystack's own processing fee also comes out of the organizer's share, not MatricPay's. The organizer's actual net therefore lands around **94–96%**, not a flat 98%, and the platform must state this accurately rather than advertise "98% to you" (see §9, Fee Disclosure).

---

## campaigns

- id, organizer_id, title, description (nullable), amount, amount_type, currency, slug (UNIQUE), payment_link, campaign_type, status, expires_at (nullable), created_at, updated_at

Campaign Type: `restricted | open`
Amount Type: `fixed | minimum`
Status: `draft | active | closed`

**Note on "expired":** there is no stored `expired` status. Whether a campaign is currently expired is always **computed** at read time as `status = 'active' AND expires_at < now()` — never written back to the `status` column. This avoids needing a background job just to keep the stored value in sync, and avoids a stale `status` field lying about the campaign's real state. Anywhere this spec or the dashboard needs to display "Expired," it's this computed check, not a fourth stored enum value.

Business Rules:

- Slug becomes immutable once activated.
- Restricted campaigns always use `fixed`. Open campaigns support `fixed` or `minimum`.
- Only active, unexpired campaigns accept payments.
- Payment link is generated automatically.
- Closing a campaign does not cancel payments already in flight: any `pending` payment initiated before closure is still honored if the student completes checkout — Paystack has already been called and the transaction exists on their side. The campaign simply stops accepting *new* payment attempts once closed.
- **A campaign cannot be activated unless the organizer has a linked `paystack_subaccount_code`** (see §6, `users`) — otherwise there is no destination account for student payments to settle to. `PATCH /campaigns/:id/status` to `active` returns an error naming this if the organizer hasn't linked a payout account yet.
- **There is deliberately no `subaccount_code` column on `campaigns`.** The subaccount lives on the organizer (§6, `users`), not per campaign — one organizer, one payout destination, however many campaigns they run. A campaign simply inherits whichever subaccount its `organizer_id` points to at payment time. Creating a separate subaccount per campaign would be unnecessary Paystack API overhead and would fragment one organizer's settlements across multiple bank-account-linked entities for no benefit.

---

## students

- id, campaign_id, matric_number, full_name, email (nullable), phone (nullable), department (nullable), level (nullable), created_at, updated_at

Constraint: `UNIQUE(campaign_id, matric_number)`

Business Rules:

- Student belongs to exactly one campaign.
- **Payment status is never stored here** — it's always derived from the `payments` table, with no `active/inactive` or paid/unpaid field on this table, to avoid two sources of truth drifting apart.

---

## payments

- id, campaign_id, student_id, amount, currency, provider, reference (UNIQUE), provider_transaction_id, status, failure_reason (nullable), verified_at (nullable), expires_at, created_at, updated_at

Allowed Status: `pending | successful | failed | expired | flagged`

Failure Reason (set alongside `failed` or `flagged`): `amount_mismatch | currency_mismatch | verification_failed | cancelled_by_user`

(`payment_method` is intentionally not a column — it's fully controlled by Paystack's own channel list, which can change without notice, and nothing in the MVP dashboard or logic depends on it. Paystack's verify response already retains this per-transaction on their side if ever needed.)

Business Rules:

- Payments are the single source of truth.
- One successful payment per student per campaign.
- Pending payments expire after 30 minutes (`expires_at`); expired ones are never reused — a fresh attempt gets a new reference.
- A partial unique constraint — `UNIQUE(campaign_id, student_id) WHERE status = 'pending'` — prevents two simultaneous requests from creating duplicate pending rows for the same student.
- Payment references are globally unique, not just unique per campaign.

---

## audit_logs

- id, actor_id, actor_role, event, entity_type, entity_id, metadata (JSON), ip_address, created_at

Purpose: activity history, security auditing, debugging.

Example events: `campaign.created`, `campaign.activated`, `campaign.closed`, `student.imported`, `payment.initiated`, `payment.completed`, `payment.failed`, `organizer.suspended`, `organizer.reactivated`, `campaign.force_closed`

(`actor_role` distinguishes organizer-initiated events from admin-initiated ones, e.g. an admin force-closing someone else's campaign.)

---

## webhook_logs

- id, provider, event_type, reference, payload (JSON), processed, attempts, last_error (nullable), received_at, processed_at, created_at

Purpose: webhook debugging, payment reconciliation, retry investigation.

---

# 7. Business Rules

These are the system's core invariants — the things that must always be true regardless of which endpoint or code path touches the data.

- One organizer owns many campaigns.
- One campaign owns many students.
- One campaign owns many payments.
- One student belongs to one campaign only.
- One student can have many pending payment attempts (subject to the reuse/expiry rules in §6).
- One student can only have one successful payment per campaign.
- Payments are the only source of truth for payment status — never derived or duplicated elsewhere.
- Closed campaigns cannot initiate new payments; expired campaigns (computed, see §6) cannot either.
- Student payment status is always derived from the `payments` table, never stored on `students`.
- Payment references are globally unique.
- Dashboard statistics are always computed live from the database, never cached or pre-aggregated in the MVP.
- An admin acting on another organizer's account or campaign is always logged in `audit_logs` with `actor_role = admin`.
- MatricPay never holds student payment funds — every successful payment settles automatically via Paystack's subaccount split, with no manual transfer step at any point. MatricPay's `transaction_charge` is a flat 2% of the amount; the organizer's actual net is lower than the remaining 98% because `bearer: "subaccount"` means Paystack's own processing fee also comes out of the organizer's share (see §6, `users`, Settlement model).

---

# 8. Backend API

## Authentication

```
POST /register
POST /login
```

## Payout Account (Organizer)

```
POST  /organizer/payout-account/resolve
POST  /organizer/payout-account
PATCH /organizer/payout-account
```

`POST /organizer/payout-account/resolve` takes `{ bank_code, account_number }`, calls Paystack's Resolve Account Number API, and returns the account holder's name **without creating anything yet** — the frontend shows this name back to the organizer as a "is this you?" confirmation step. This same endpoint is reused for both first-time setup and later updates — the confirmation step matters exactly as much the second time as the first.

`POST /organizer/payout-account` takes the same `{ bank_code, account_number }` (only after the organizer has confirmed the resolved name) and calls Paystack's Create Subaccount API, storing the returned `subaccount_code` on the organizer's `users` row (see §6). This is the one-time first-setup call; an organizer's campaigns cannot go active until this has been completed.

`PATCH /organizer/payout-account` takes the same `{ bank_code, account_number }` (again, only after re-confirming the resolved name via `/resolve`) and calls Paystack's **Update Subaccount** API against the organizer's existing `subaccount_code` — the subaccount code itself never changes, only its linked settlement bank/account. Campaigns are unaffected since they reference the organizer, not the subaccount code directly (see §6, `campaigns`). Note: any payment already charged but not yet settled by Paystack (T+1) will settle to the *new* bank details, not the old ones — worth surfacing to the organizer in the UI when they update.

## Campaigns

```
POST   /campaigns
GET    /campaigns
GET    /campaigns/:id
PATCH  /campaigns/:id
PATCH  /campaigns/:id/status
GET    /campaigns/:id/dashboard
GET    /campaigns/slug/:slug
```

## Students

```
POST /campaigns/:id/students
GET  /campaigns/:id/students
```

Supported imports: Manual, CSV, Excel (.xlsx)

Validation:

- Remove empty rows, trim whitespace.
- Duplicate matric numbers within one upload: deduped, first occurrence wins.
- Re-upload before activation: upserts by matric number.
- Upload after activation: rejected.

## Student Validation

```
POST /campaigns/:slug/students/validate
```

Returns student information, campaign info, amount, campaign status.

**Security:** rate-limited per IP and per campaign to prevent matric-number enumeration.

## Payments

```
POST /payments/initiate
```

Responsibilities: validate campaign, ensure active and unexpired, validate/create student, reuse or create pending payment (race-safe per §6), initialize Paystack transaction with the organizer's subaccount split (amount in kobo, `bearer: "subaccount"`, 2% `transaction_charge` per §5/§6), return authorization URL.

```
GET /payments/:reference/status
```

Responsibilities: return current payment status; if not yet `successful` locally, performs a direct Paystack verify call before responding. Powers the post-redirect success page (see §5, step 11).

```
POST /webhook/paystack
```

Responsibilities: verify signature, independently re-verify transaction with Paystack, locate payment by reference, ensure idempotency, validate amount/currency, store provider transaction ID, update status, record audit log, always return HTTP 200 after processing.

## Admin

```
GET   /admin/organizers
PATCH /admin/organizers/:id/status
GET   /admin/campaigns
PATCH /admin/campaigns/:id/status
GET   /admin/dashboard
```

Responsibilities: all routes require `role = admin`. Listing routes are platform-wide (not scoped to one organizer). `PATCH /admin/organizers/:id/status` toggles `active/suspended`. `PATCH /admin/campaigns/:id/status` allows an admin to force-close any campaign regardless of owner. Every admin action is written to `audit_logs` with `actor_role = admin`.

---

# 9. Frontend

## Organizer Dashboard

Features: Authentication, Link Payout Account (bank code + account number → confirm resolved name → subaccount created; required before any campaign can go active), Create Campaign, Select Campaign Type, Import Students, Activate Campaign, Close Campaign, Dashboard.

Dashboard shows:

- Campaign Status, Campaign Type
- Total Students, Paid Students, Unpaid Students
- Flagged Payments
- Total Expected Amount, Total Amount Collected, Outstanding Balance
- Successful / Pending / Failed Payments, Collection Percentage
- Recent Payments

Updates via polling every 10 seconds.

## Admin Dashboard

Features: list of all organizers (with suspend/reactivate action), list of all campaigns platform-wide (with force-close action), platform-wide collection totals.

## Student Flow

Route: `/pay/:slug`

**Restricted:** Enter Matric Number → View Student Details → Confirm Payment → Redirect to Checkout → Payment Success Page (polls `/payments/:reference/status`)

**Open:** Enter Details (+ Amount if applicable) → Confirm Payment → Redirect to Checkout → Payment Success Page (polls `/payments/:reference/status`)

## Fee Disclosure

Wherever an organizer sees their platform fee or expected payout — campaign creation, campaign dashboard, payout account setup — the copy states the fee model accurately: MatricPay takes 2% of each payment, **and Paystack's own processing fee (currently 1.5% + ₦100, capped at ₦2,000) is also deducted from the organizer's share**, not MatricPay's. The organizer's real net lands around 94–96% depending on transaction size, not a flat "98%." A one-line example (e.g. "On a ₦5,000 payment, you'll typically receive about ₦4,700–4,825 after all fees") is shown once during payout account setup, and the dashboard's "Total Amount Collected" figure is clearly labeled as gross (what students paid), not what has or will settle to the organizer's bank account.

---

# 10. MVP Success Criteria

- Organizers can register, login, create/activate/close campaigns.
- Manual, CSV, and Excel student import all work, with duplicate/upsert handling.
- Restricted campaigns validate students; Open campaigns create students automatically, with fixed or minimum amounts.
- Pending payments are created before checkout, reused on retry, and expire safely — no duplicate pending rows even under concurrent requests.
- Paystack Checkout completes successfully, with amounts correctly converted to kobo and split via `bearer: "subaccount"` — MatricPay's 2% `transaction_charge` plus Paystack's own processing fee are both deducted from the organizer's share, and this is disclosed accurately to organizers (see §9, Fee Disclosure) rather than advertised as a flat 98%.
- An organizer must link a bank account (resolved and confirmed) before any of their campaigns can be activated.
- Both the webhook and the redirect-triggered status check independently verify transactions directly with Paystack.
- Duplicate webhook events are safely ignored.
- Flagged payments (amount/currency mismatch) are visible on the dashboard, not silently dropped or accepted.
- Dashboard reflects verified payments automatically.
- An admin can view all organizers/campaigns, suspend an organizer, and force-close a campaign.

---

# 11. Non-Goals (MVP)

No AI. No SMS. No WhatsApp. No student login. No OTP. No mobile app. No multi-school support. No subscription billing. No upload history. No PDF/DOCX import. No OCR. No settings/profile/organization module (deferred to Phase 2). No real-time sockets (polling only for MVP). No automatic resolution of flagged/mismatched payments. No refund handling of any kind (refunds, if needed, are handled manually outside the platform via Paystack's dashboard). No admin editing of another organizer's campaign content, no admin refund actions, no billing/subscription actions of any kind. No visibility into an organizer's Paystack settlement/payout history beyond what Paystack itself sends them directly.

---

# 12. Key Technical Risks

- Webhook signature verification
- Independent transaction re-verification (never trust webhook payload alone)
- Idempotency on duplicate webhook delivery
- Amount and currency validation, including kobo conversion
- Race-safe pending payment creation
- Pending payment expiry and reuse
- Matric-number enumeration via student validation endpoint
- Admin authorization boundary (must not leak into organizer routes or vice versa)
- Subaccount split correctness — the 2% `transaction_charge` and `bearer: "subaccount"` behavior must be verified against Paystack's actual response on every transaction, not assumed from the request payload; a misconfigured `subaccount` code must fail loudly (reject campaign activation), never silently fall back to settling into MatricPay's own account
- Fee disclosure accuracy — organizer-facing copy must never claim a flat 98% net; the real figure (roughly 94–96%, varying by transaction size due to Paystack's own capped/waived fee tiers) must be shown, per §9

---

# 13. Security Requirements

These apply across the entire MVP and are not optional — they're baseline requirements, not Phase 2 upgrades.

## Authentication & Sessions

- `POST /login` returns a **short-lived JWT** (e.g. 1 hour expiry), including the user's `role`. No refresh tokens in MVP — user re-logs in after expiry.
- All authenticated routes require this JWT in the `Authorization` header. Requests without a valid, unexpired token are rejected with 401.
- Passwords are hashed with **bcrypt or argon2** before storage in `password_hash`. Plaintext passwords are never logged or stored anywhere, including in `audit_logs`.
- A `status = suspended` user's token is rejected on every request (not just at login) — suspension takes effect immediately, not just on next login.

## Authorization (Ownership & Role Checks)

- Every campaign-scoped organizer route (`GET/PATCH /campaigns/:id`, `GET /campaigns/:id/dashboard`, `POST /campaigns/:id/students`, etc.) must verify the authenticated user's `id` matches the campaign's `organizer_id` before returning or modifying anything — unless the user's `role = admin`, in which case the ownership check is bypassed and the action is logged (see §7, §8).
- An organizer requesting another organizer's campaign by ID gets 403/404 — never the data.
- All `/admin/*` routes require `role = admin`; an organizer token hitting an admin route gets 403.
- Public student-facing routes (`/pay/:slug`, `/campaigns/slug/:slug`, student validation) require no auth, by design — they're meant to be public — but must only ever expose the minimum fields needed (name, amount, campaign title), never internal fields like `organizer_id` or other students' data.

## Payment Reference & Secrets

- Payment `reference` values are generated using a cryptographically random method (e.g. UUID v4), **never sequential or guessable** — the reconciliation model depends on references being unguessable, since `GET /payments/:reference/status` is unauthenticated by necessity.
- Paystack secret key and webhook secret are stored in environment variables only — never committed to source control, never sent to the frontend. Only the Paystack **public** key is exposed client-side.
- Separate Paystack **test** and **live** key pairs are used per environment (development uses test keys, production uses live keys) — never live keys during development.

## File Upload (Student Import)

- CSV/Excel uploads are capped at a defined max file size (e.g. 2MB) and max row count (e.g. 5,000 rows).
- Only `.csv` and `.xlsx` extensions/MIME types are accepted; anything else is rejected before parsing.
- Uploaded files are parsed into data only — never executed or stored as-is on a path that could be served back.

## Rate Limiting

- `POST /login` is rate-limited per IP (e.g. 5 attempts/minute) to prevent brute-forcing account passwords.
- Student validation remains rate-limited per IP + campaign (already specified in §8) to prevent matric-number enumeration.

## General API Hygiene

- All input is validated and sanitized server-side (parameterized queries only — no raw string concatenation into SQL) to prevent injection.
- All traffic is served over HTTPS only.
- CORS is restricted to the known frontend origin(s) — not wildcard `*`.
- `POST /webhook/paystack` accepts no auth token (Paystack can't supply one) — its signature verification step (§5, §8) *is* its authentication, and this must not be bypassed or made optional.

---

# 14. Future Roadmap

## Phase 2

- Settings module (Profile, Organization, Payment Preferences, Account Security)
- Socket.IO real-time dashboard (polling remains as fallback)
- Better dashboard, export reports
- CSV improvements, upload history
- PDF / DOCX import, OCR imports
- Additional roles beyond organizer/admin (e.g. finance)

## Phase 3

Future tables: `organizations`, `organization_members`, `plans`, `subscriptions`, `notifications`, `payment_receipts`, `student_imports`, `api_keys`, `admin_roles`

Future features: multiple organizations/schools/departments, subscription plans & billing, notifications, advanced admin tooling (editing others' campaigns, refunds), multi-school support, advanced reporting.