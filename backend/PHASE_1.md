# MatricPay MVP - Phase 1 Build Spec

## 1. System Goal

Build a simple payment system where:

Organizer creates campaign -> adds students -> student pays -> webhook confirms -> dashboard updates.

Phase 1 is intentionally narrow. The goal is to complete the core payment lifecycle with the smallest reliable backend surface.

## 2. Roles

### Organizer

Organizer is the only role in Phase 1.

Capabilities:

- Register
- Login
- Create campaigns
- Add students
- View dashboard

### users

Fields:

- id
- email
- password_hash
- role

Rules:

- `role` is always `organizer`.
- No role switching logic in Phase 1.
- Do not add permissions, admin roles, or multi-role flows.

## 3. Campaigns

### campaigns

Fields:

- id
- user_id
- title
- amount
- slug
- status

Allowed status values:

- `draft`
- `active`

Rules:

- One fixed amount per campaign.
- `slug` is unique.
- `slug` is used for `/pay/:slug`.
- `slug` must not change after creation.
- Only active campaigns accept payments.
- Payment initiation must fail fast if the campaign is not active.

## 4. Students

### students

Fields:

- id
- campaign_id
- matric_number
- full_name

Rules:

- A student belongs to one campaign.
- Students store identity only.
- No payment status is stored on students.

Constraint:

- `UNIQUE(campaign_id, matric_number)`

## 5. Payments

Payments are the source of truth for payment state.

### payments

Fields:

- id
- campaign_id
- student_id
- amount
- reference
- status

Allowed status values:

- `pending`
- `successful`

Rules:

- A payment record is created before checkout.
- Payments are updated only via webhook.
- One successful payment is allowed per student per campaign.
- A student may have multiple pending payments.
- Only the latest valid reference is processed.
- `reference` must be unique.

## 6. Core Flow

```text
Create Campaign
-> Add Students
-> Student Enters Matric
-> Validate Student
-> Create Payment Reference
-> Initialize Nomba Checkout
-> Payment Complete
-> Webhook Received
-> Mark Successful
-> Dashboard Updates
```

## 7. Student Payment Flow

Public route:

```text
/pay/:slug
```

Steps:

1. Student enters matric number.
2. System finds the student in the campaign.
3. System shows confirmation page with student name and campaign amount.
4. Backend creates a payment reference.
5. Backend initializes Nomba Checkout.
6. Student is redirected to Nomba Checkout.
7. Student completes payment.
8. Webhook confirms payment.
9. Student sees payment success page.

## 8. Backend APIs

### Auth

```http
POST /register
POST /login
```

### Campaigns

```http
POST /campaigns
GET /campaigns
PATCH /campaigns/:id/status
```

Rules:

- Campaign status changes from `draft` to `active`.
- Only active campaigns accept payments.
- Inactive campaigns must reject payment initiation.
- Campaign slug is immutable after creation.

### Students

```http
POST /campaigns/:id/students
GET /campaigns/:id/students
```

Rules:

- Duplicate matric numbers must be rejected per campaign.
- Student records must not store paid or unpaid state.

### Validate Student

```http
POST /validate-student
```

Request body:

```json
{
  "slug": "campaign-slug",
  "matric_number": "STUDENT-MATRIC"
}
```

Returns:

- Whether the student exists.
- Student full name.
- Campaign amount.
- Campaign status.

Failure cases:

- Student not found.
- Campaign not active.

### Payment Initiation

```http
POST /payment/initiate
```

Rules:

- Fail fast if the campaign is not active.
- Validate that the student exists in the campaign.
- Generate a unique payment reference.
- Create a pending payment before checkout.
- Initialize Nomba Checkout.
- Return the checkout URL.

### Nomba Webhook

```http
POST /webhook/nomba
```

Critical rules:

- Verify webhook signature.
- Find payment by reference.
- Webhook handling must be idempotent before any database mutation.

Idempotency rule:

- If `payment.status == successful`, return `200` immediately.

Validation:

- Validate exact amount match.
- Reject amount mismatch safely without crashing the flow.

Update:

- Mark payment status as `successful`.
- Store `provider_transaction_id`.
- Update timestamp if needed.

## 9. Dashboard

Dashboard is minimal in Phase 1 and scoped per campaign.

Metrics:

- Total Students
- Paid Students
- Unpaid Students
- Student List with Status

Logic:

- Total: count students where `campaign_id` matches.
- Paid: count distinct `student_id` where payment status is `successful`.
- Unpaid: students with no successful payment record.

Student status:

- If a successful payment exists, show `PAID`.
- Otherwise, show `UNPAID`.

Auto update:

- Frontend polls `GET /campaigns/:id/dashboard`.
- Poll interval: 5 to 10 seconds.

Do not use:

- Socket.IO
- WebSockets
- Realtime infrastructure

Polling is enough for the hackathon demo.

## 10. Public Page

Route:

```text
/pay/:slug
```

Flow:

1. Enter matric number.
2. Validate student.
3. Confirm payment.
4. Redirect to Nomba Checkout.
5. Show success page.

## 11. Campaign Rules

- Campaign status moves from `draft` to `active`.
- Only active campaigns accept payments.
- Inactive campaigns must reject payment initiation.
- Slug is immutable after creation.

## 12. Non Goals

Do not build these in Phase 1:

- Settings system
- Analytics dashboard
- Roles beyond organizer
- Open vs restricted campaigns
- Audit logs
- Webhook logs
- Exports
- Notifications
- Multi-school system
- AI features
- OCR or advanced imports
- Socket.IO or WebSockets

## 13. Critical Risks

These must be handled carefully:

- Webhook verification.
- Idempotency, with no duplicate processing.
- Strict amount validation.
- Correct payment reference matching.
- Race conditions during webhook and payment updates.

## 14. Success Criteria

Phase 1 is complete when:

- Organizer can login.
- Campaign can be created.
- Students can be added.
- Student lookup works.
- Payment starts through Nomba.
- Webhook confirms payment correctly.
- Dashboard updates within 5 to 10 seconds without page refresh.
