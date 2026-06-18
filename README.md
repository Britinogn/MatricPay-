# MatricPay

MatricPay is a university-focused payment collection platform for class representatives and student organizers.

The goal is to replace manual transfers, screenshot confirmation, and spreadsheet reconciliation with campaign payment links, student validation, Nomba Checkout, webhook verification, and dashboard updates.

## Project Structure

```text
matricpay/
+-- backend/
|   +-- prisma/
|   +-- src/
|   +-- PHASE_1.md
|   +-- PHASE_2.md
+-- frontend/
```

## Current Build Scope

The project is currently focused on Phase 1.

Phase 1 flow:

```text
Organizer creates campaign
-> adds students
-> student enters matric number
-> backend validates student
-> backend creates payment reference
-> Nomba Checkout starts
-> webhook confirms payment
-> dashboard updates
```

## Phase 1 Features

- Organizer registration and login
- Campaign creation
- Campaign activation
- Student creation per campaign
- Student validation by matric number
- Payment initiation through Nomba Checkout
- Webhook-based payment confirmation
- Minimal dashboard with paid and unpaid student status
- Dashboard polling every 5 to 10 seconds

## Phase 1 Non Goals

These are intentionally not part of Phase 1:

- Open campaigns
- Settings system
- Analytics dashboard
- Audit logs
- Webhook logs
- Exports
- Notifications
- Multi-school support
- AI features
- OCR or advanced imports
- Socket.IO or WebSockets

## Backend

The backend is a TypeScript Node.js API using:

- Express
- Prisma
- MySQL-compatible database through TiDB
- JWT authentication
- bcrypt password hashing
- Zod validation

Backend docs:

- [Phase 1 Build Spec](backend/PHASE_1.md)
- [Phase 2 Architecture Spec](backend/PHASE_2.md)

## Frontend

The frontend folder is present as the client application workspace. Implementation will be added as the project moves forward.

## Development Notes

Phase 1 should stay simple and focused. Database tables and backend logic should support the frozen Phase 1 requirements first before adding Phase 2 behavior.
