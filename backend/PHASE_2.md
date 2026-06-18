# MatricPay MVP - Architecture Freeze v5

## 1. What MatricPay Is

MatricPay is a university and polytechnic payment collection platform that enables class representatives to create campaigns and collect contributions from students through Nomba Checkout.

It eliminates manual bank transfers, screenshot verification, and spreadsheet reconciliation by automatically matching verified payments using secure payment references.

Depending on configuration, students can either be validated against a pre uploaded student list or register their details during payment.

Organizers monitor collections through a centralized dashboard.

## 2. MVP Goal

Build a system that completes the full payment lifecycle.

```text
Create Campaign
-> (Optional) Upload Student List
-> Activate Campaign
-> Student Pays
-> Webhook Verification
-> Dashboard Updates
```

Out of scope:

Everything not required for this flow.

## 3. Core Users

### Organizer

Capabilities:

- Register account
- Login
- Create campaigns
- Activate / close campaigns
- Import students (optional)
- View analytics dashboard
- Configure campaign settings

### Student

No account required.

Flow:

- Open payment link
- Enter required details
- Confirm payment
- Pay via Nomba Checkout
- Receive confirmation

## 4. Campaign Types

### Restricted Campaign

Used for known student groups such as class dues and departmental fees.

Rules:

- Student list must be uploaded before activation.
- Matric number must exist before payment.
- Backend validates student before checkout.

Flow:

```text
Validate Matric -> Confirm Details -> Pay
```

### Open Campaign

Used for events, hackathons, and public collections.

Rules:

- No student list required.
- Student is created during payment flow.

Flow:

```text
Enter Details -> Create Student -> Pay
```

## 5. Payment Lifecycle

1. Organizer creates campaign.
2. System generates:
   - Unique slug.
   - Payment link: `/pay/:slug`.
3. Organizer activates campaign.
4. Student opens link.
5. Backend loads campaign and validates:
   - Exists.
   - Active.
   - Not expired.
6. Backend branches by campaign type.

Restricted:

- Validate matric number.
- Return student and campaign details.

Open:

- Create student record.

7. Student confirms payment.
8. Backend creates payment:
   - Generate unique reference before checkout.
   - Create pending payment.
9. Initialize Nomba Checkout.
10. Redirect student to payment page.
11. Payment completed on Nomba.
12. Webhook received.
13. Backend verifies:
    - Signature valid.
    - Idempotency, meaning reference not processed before.
    - Amount matches campaign.
    - Currency matches.
    - Payment status is successful.
14. Backend updates payment:
    - `provider_transaction_id`.
    - Provider name.
    - `verified_at` timestamp.
    - `status = successful`.
15. Dashboard updates with Socket.IO preferred and polling fallback.

## 6. Database Design

### users

Fields:

- id
- full_name
- email
- password_hash
- role, default `organizer`
- created_at
- updated_at

### campaigns

Fields:

- id
- user_id
- title
- description, nullable
- amount
- currency, NGN default
- slug, unique
- payment_link
- campaign_type, `restricted` or `open`
- status, `draft`, `active`, or `closed`
- due_date, nullable
- created_at
- updated_at

Rules:

- Slug immutable after activation.
- Fixed amount per campaign.

### students

Fields:

- id
- campaign_id
- matric_number
- full_name
- email, nullable
- phone, nullable
- department, nullable
- level, nullable
- status, `active` or `inactive`
- created_at
- updated_at

Constraints:

```text
UNIQUE(campaign_id, matric_number)
```

Rules:

- No payment status stored here.
- Inactive means the student cannot initiate payment.

### payments

Fields:

- id
- campaign_id
- student_id
- amount
- currency
- provider
- payment_method
- reference, unique
- provider_transaction_id
- status, `pending`, `successful`, `failed`, `cancelled`, or `amount_mismatch`
- failure_reason, nullable
- verified_at, nullable
- created_at
- updated_at

Rules:

- Single source of truth for payments.
- One successful payment per student per campaign.

### audit_logs

Fields:

- id
- user_id
- event
- entity_type
- entity_id
- metadata, JSON
- ip_address
- created_at

Events:

- `campaign.created`
- `campaign.activated`
- `campaign.closed`
- `student.imported`
- `payment.initiated`
- `payment.completed`
- `payment.failed`

### webhook_logs

Fields:

- id
- provider
- event_type
- reference
- payload, JSON
- processed
- attempts
- last_error
- received_at
- processed_at
- created_at

## 7. Backend API

### Auth

```http
POST /register
POST /login
```

### Campaigns

```http
POST /campaigns
GET /campaigns/:id
PATCH /campaigns/:id
PATCH /campaigns/:id/status
GET /campaigns/slug/:slug
GET /campaigns/:id/dashboard
```

### Students

```http
POST /campaigns/:id/students
GET /campaigns/:id/students
```

Supports:

- Manual entry.
- CSV.
- Excel.

### Student Validation

```http
POST /campaigns/:slug/validate-student
```

Returns:

- Student data, if restricted.
- Campaign amount.
- Validation status.

Failures:

- Student not found.
- Campaign inactive.
- Student inactive.

### Payments

```http
POST /campaigns/:slug/payments/initiate
```

Responsibilities:

- Validate campaign.
- Validate student, if restricted.
- Create student, if open.
- Generate payment reference.
- Create pending payment.
- Initialize Nomba Checkout.

```http
POST /webhook/nomba
```

Responsibilities:

- Verify signature.
- Idempotency check.
- Find payment by reference.
- Validate amount and currency.
- Update payment status.
- Store provider transaction id.
- Mark `verified_at`.
- Write audit log.
- Store webhook log.

## 8. Frontend

### Organizer Dashboard

Features:

- Auth.
- Campaign creation.
- Campaign activation.
- Student import.
- Campaign analytics.
- Payment tracking.

Metrics:

- Total students.
- Paid.
- Unpaid.
- Total expected.
- Total collected.
- Success rate.
- Recent payments.

### Student Flow

Route:

```http
GET /pay/:slug
```

Restricted:

1. Enter matric.
2. Verify student.
3. Confirm payment.
4. Checkout.
5. Success page.

Open:

1. Enter details.
2. Confirm payment.
3. Checkout.
4. Success page.

## 9. Settings

### Profile

- Full name.
- Email.
- Password.

### Organization

- Name.
- School.
- Department.
- Faculty, optional.

### Payment Settings

- Default currency, NGN.
- Default description.
- Default due date.

### Security

- Change password.
- Logout session.

### Campaign Defaults

- Default amount.
- Default type.
- Default duration.

## 10. MVP Success Criteria

System is complete when:

- Auth works.
- Campaign lifecycle works.
- Student import works.
- Restricted validation works.
- Open campaign works.
- Payment initiation works.
- Nomba checkout works.
- Webhook verification works.
- Idempotency is enforced.
- Duplicate payments are prevented.
- Dashboard updates in real time.
- Payments reconcile correctly.

## 11. Non Goals

- No AI.
- No SMS.
- No WhatsApp.
- No OTP.
- No mobile app.
- No subscriptions.
- No multi-school system.
- No advanced analytics.
- No OCR imports.
- No PDF/DOCX parsing.

## 12. Key Technical Risks

Highest priority:

- Webhook verification.
- Idempotency.
- Payment reconciliation.
- Amount and currency validation.
- Duplicate payment prevention.
- Race conditions.

## Future Roadmap

### Phase 2

- Export reports.
- Better dashboard.
- CSV improvements.
- Upload history.

### Phase 3

- Organizations.
- Subscriptions.
- Notifications.
- Roles and permissions.
- Multi-school support.
- API keys.
