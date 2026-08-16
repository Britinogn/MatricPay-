# MatricPay MVP Implementation Plan — Paystack Subaccount Settlement

**Status**: Phase 1 Core (Payment Settlement Architecture)  
**Date**: 2026-08-16  
**Goal**: Implement one-organizer-one-subaccount model with resolve-confirm-create flow

---

## Overview

The MVP requires organizers to link a payout bank account before any campaign can be activated. This involves:

1. **Database schema changes** (User model gets 4 fields)
2. **Paystack client extensions** (resolve, create, update subaccount methods)
3. **Payout account service** (business logic: resolve → confirm → create → update)
4. **Payout account routes & controller** (3 endpoints)
5. **Payment initiation update** (pull subaccount, add `bearer` + `transaction_charge`)
6. **Campaign activation gate** (reject if no subaccount)

---

## Phase 1A: Database Schema

### Files to Create/Modify

#### 1. `prisma/migrations/[timestamp]_add_payout_fields_to_user/migration.sql`
**What**: New migration to add 4 columns to `users` table
- `paystack_subaccount_code` (VARCHAR, nullable, unique)
- `settlement_bank_code` (VARCHAR, nullable)
- `settlement_account_number` (VARCHAR, nullable)
- `settlement_account_name` (VARCHAR, nullable)

**Why**: Store organizer's payout destination (subaccount code never changes, only bank details)

**Dependencies**: None (pure DB)

---

#### 2. `prisma/schema.prisma`
**What**: Update User model to reflect new fields
```typescript
model User {
  id                         String     @id @default(uuid())
  // ... existing fields ...
  paystackSubaccountCode     String?    @unique @map("paystack_subaccount_code")
  settlementBankCode         String?    @map("settlement_bank_code")
  settlementAccountNumber    String?    @map("settlement_account_number")
  settlementAccountName      String?    @map("settlement_account_name")
  // ... rest of model
}
```

**Why**: Prisma type safety + code generation

**Dependencies**: Migration must run first in DB

---

### Execution Order (Phase 1A)
1. Update `schema.prisma` with new User fields
2. Generate migration: `npx prisma migrate dev --name add_payout_fields_to_user`
3. Verify migration runs successfully

---

## Phase 1B: Paystack Client Extensions

### Files to Create/Modify

#### 3. `src/lib/paystack.client.ts` — Add Methods
**What**: Extend PaystackClient class with 3 new methods

```typescript
// 1. resolveAccountNumber(bankCode: string, accountNumber: string)
//    → Paystack Resolve Account Number API
//    Returns: { account_number, account_name }

// 2. createSubaccount(payload)
//    → Paystack Create Subaccount API
//    Takes: business_name, settlement_bank, account_number, percentage_charge (for later)
//    Returns: { subaccount_code, business_name }

// 3. updateSubaccount(subaccountCode, payload)
//    → Paystack Update Subaccount API
//    Takes: settlement_bank, account_number
//    Returns: { subaccount_code, business_name }
```

**Why**: Backend needs to call Paystack APIs for settlement setup

**Dependencies**: None (extends existing class)

**Endpoints Used**:
- `POST /bank/resolve` — Resolve Account Number
- `POST /subaccount` — Create Subaccount
- `PUT /subaccount/:id_or_code` — Update Subaccount

---

### Execution Order (Phase 1B)
1. Add 3 methods to `PaystackClient` class
2. Each method:
   - Constructs proper Paystack API endpoint + payload
   - Handles auth header (Bearer token with SECRET key)
   - Parses response
   - Throws HttpError on failure

---

## Phase 1C: Payout Account Service

### Files to Create/Modify

#### 4. `src/services/payout-account.service.ts` (NEW)
**What**: Business logic for payout setup

```typescript
export class PayoutAccountService {
  async resolveAccountNumber(bankCode: string, accountNumber: string)
    → Returns: { accountNumber, accountName }
    
  async createSubaccount(user: User, bankCode: string, accountNumber: string, accountName: string)
    → Creates Paystack subaccount
    → Stores on user: paystackSubaccountCode, settlementBankCode, settlementAccountNumber, settlementAccountName
    → Audit log: 'payout_account.created'
    → Returns: { subaccountCode, bankCode, accountNumber, accountName }
    
  async updateSubaccount(user: User, bankCode: string, accountNumber: string, accountName: string)
    → Updates existing subaccount via Paystack API
    → Updates user fields (bank code, account number, account name)
    → Audit log: 'payout_account.updated'
    → Returns: { subaccountCode, bankCode, accountNumber, accountName }
```

**Why**: Centralize business logic (error handling, validation, audit logging)

**Dependencies**: 
- PaystackClient (Phase 1B)
- User repository
- Audit log repository

**Key Rules**:
- `resolveAccountNumber()` is a read-only check — creates nothing
- `createSubaccount()` creates subaccount only once (organizer's first payout setup)
- `updateSubaccount()` changes bank details on existing subaccount (organizer switched banks)
- Both create/update should log audit events with actor role + timestamp
- If organizer already has a subaccount code, `createSubaccount()` should reject (can't create twice)

---

### Execution Order (Phase 1C)
1. Create `src/services/payout-account.service.ts`
2. Implement 3 methods with error handling, validation, audit logging
3. Add type definitions if needed in `src/validators/payout-account.validator.ts`

---

## Phase 1D: Payout Account Routes & Controller

### Files to Create/Modify

#### 5. `src/routes/payout-account.routes.ts` (NEW)
**What**: Three endpoints under `/organizer/payout-account`

```
POST   /organizer/payout-account/resolve
POST   /organizer/payout-account
PATCH  /organizer/payout-account
```

**Why**: Separate routes for clarity + safety (resolve before create, etc.)

**Dependencies**: Controller (Phase 1D, next)

---

#### 6. `src/controllers/payout-account.controller.ts` (NEW)
**What**: Endpoint handlers

```typescript
async resolveAccountNumber(request: Request, response: Response)
  → Validates: { bankCode, accountNumber }
  → Calls: payoutAccountService.resolveAccountNumber(...)
  → Returns: { accountNumber, accountName }
  
async createSubaccount(request: Request, response: Response)
  → Requires auth + organizer role
  → Validates: { bankCode, accountNumber, confirmedAccountName }
  → Confirms: accountName matches resolved name (from /resolve call)
  → Calls: payoutAccountService.createSubaccount(...)
  → Returns: { subaccountCode, bankCode, accountNumber, accountName, message }
  
async updateSubaccount(request: Request, response: Response)
  → Requires auth + organizer role
  → Validates: { bankCode, accountNumber, confirmedAccountName }
  → Confirms: accountName matches resolved name
  → Calls: payoutAccountService.updateSubaccount(...)
  → Returns: { subaccountCode, bankCode, accountNumber, accountName, message }
```

**Why**: HTTP layer separation

**Dependencies**: 
- Payout account service (Phase 1C)
- Auth middleware (already exists)

---

#### 7. `src/validators/payout-account.validator.ts` (NEW)
**What**: Zod schemas for input validation

```typescript
ResolveAccountNumberSchema
  → bankCode: string, accountNumber: string
  
CreateSubaccountSchema
  → bankCode: string, accountNumber: string, confirmedAccountName: string
  
UpdateSubaccountSchema
  → bankCode: string, accountNumber: string, confirmedAccountName: string
```

**Why**: Type safety + validation before controller

---

#### 8. `src/routes/index.ts`
**What**: Register payout routes

```typescript
import { payoutAccountRoutes } from "./payout-account.routes";

router.use("/organizer", payoutAccountRoutes);
```

**Existing line**: Already has `router.use("/organizer", dashboardRoutes);`  
**Action**: Add payout routes alongside

---

### Execution Order (Phase 1D)
1. Create validator schema
2. Create controller class with 3 methods
3. Create routes with auth middleware on create/update
4. Wire into main router

---

## Phase 1E: Update Payment Initiation

### Files to Create/Modify

#### 9. `src/services/payment.service.ts` — Update `initiatePayment()`
**What**: Add subaccount logic before Paystack initialization

```typescript
async initiatePayment(input: InitiatePaymentInput) {
  // ... existing campaign/student validation ...
  
  // NEW: Get organizer + check subaccount
  const organizer = await userRepository.findById(campaign.organizerId);
  if (!organizer.paystackSubaccountCode) {
    throw new HttpError(400, 
      "Organizer has not linked a payout account. Campaign cannot accept payments yet.");
  }
  
  // ... existing pending payment logic ...
  
  // UPDATE: Pass subaccount to Paystack init
  const paystackRes = await paystackClient.initializeTransaction({
    email: ...,
    amount: amountInKobo,
    reference,
    callback_url: ...,
    subaccount: organizer.paystackSubaccountCode,        // NEW
    bearer: "subaccount",                                 // NEW
    transaction_charge: Math.round(amountInKobo * 0.02),  // NEW (2% platform fee)
  });
  
  // ... rest existing
}
```

**Why**: Ensures payment splits to organizer's subaccount automatically + MatricPay gets 2% cut

**Dependencies**: 
- User repository (fetch organizer)
- PaystackClient must accept these new fields in `InitializeTransactionPayload` interface

---

### Execution Order (Phase 1E)
1. Update `InitializeTransactionPayload` interface in `PaystackClient` to accept `subaccount`, `bearer`, `transaction_charge`
2. Update `paystackClient.initializeTransaction()` to forward these fields to Paystack API
3. Update `payment.service.ts` to pull organizer + check subaccount code, compute fee, pass to init

---

## Phase 1F: Campaign Activation Gate

### Files to Create/Modify

#### 10. `src/services/campaign.service.ts` — Update `updateCampaignStatus()`
**What**: Block activation if no subaccount

```typescript
async updateCampaignStatus(user: AuthUser, id: string, data: UpdateCampaignStatusInput) {
  const campaign = await campaignRepository.getById(id);
  
  if (!campaign) {
    throw new HttpError(404, "Campaign not found");
  }
  
  if (campaign.organizerId !== user.id && user.role !== UserRole.admin) {
    throw new HttpError(403, "Forbidden");
  }
  
  // NEW: Block activation if no subaccount
  if (data.status === CampaignStatus.active) {
    const organizer = await userRepository.findById(campaign.organizerId);
    if (!organizer.paystackSubaccountCode) {
      throw new HttpError(400, 
        "Cannot activate campaign. Organizer must link a payout account first via /organizer/payout-account");
    }
  }
  
  // ... rest existing
}
```

**Why**: Prevents campaigns going live without a settlement destination

**Dependencies**: User repository, organizer already retrieved

---

### Execution Order (Phase 1F)
1. Add check in `updateCampaignStatus()` before status update to active

---

## Phase 2 (Future): Admin Operations & Student Import

**Not in Phase 1, but noted**:
- Admin suspend/reactivate organizer
- Admin force-close campaign
- Student import (manual, CSV, Excel)

---

## Implementation Order (Top to Bottom)

| # | Phase | Files | Duration | Blocker? |
|---|-------|-------|----------|----------|
| 1 | 1A | schema.prisma, migration | 15 min | YES — blocks everything |
| 2 | 1B | paystack.client.ts | 30 min | YES — needed by services |
| 3 | 1C | payout-account.service.ts, validator | 45 min | YES — business logic |
| 4 | 1D | payout-account.controller.ts, routes | 45 min | NO — API layer only |
| 5 | 1E | payment.service.ts, PaystackClient interface | 30 min | YES — payment settlement |
| 6 | 1F | campaign.service.ts | 15 min | YES — activation gate |

**Total**: ~3 hours for core payment settlement  
**Dependencies**: 1A → 1B → 1C → (1D parallel) → 1E → 1F

---

## Testing Checklist (Per Phase)

### Phase 1A (Database)
- [ ] Migration runs: `npx prisma migrate dev`
- [ ] Schema generates: `npx prisma generate`
- [ ] No SQL errors

### Phase 1B (Paystack Client)
- [ ] Methods exist and callable
- [ ] Paystack API endpoints match Paystack docs
- [ ] Error handling returns HttpError

### Phase 1C (Payout Service)
- [ ] Resolve returns correct format (accountNumber, accountName)
- [ ] Create rejects if subaccount already exists
- [ ] Create stores all 4 fields on user
- [ ] Update changes bank details only, keeps subaccount code
- [ ] Audit logs created for both

### Phase 1D (Routes & Controller)
- [ ] POST /resolve works without auth
- [ ] POST /create requires auth, checks resolved name matches
- [ ] PATCH /update requires auth, checks resolved name matches
- [ ] All validators pass/fail correctly

### Phase 1E (Payment Initiation)
- [ ] Payment initiate pulls organizer subaccount
- [ ] Paystack initialize call includes `subaccount`, `bearer: "subaccount"`, `transaction_charge: 2%`
- [ ] Rejects with 400 if organizer has no subaccount

### Phase 1F (Campaign Activation)
- [ ] Campaign activate fails with 400 if organizer has no subaccount
- [ ] Campaign activate succeeds once subaccount is linked
- [ ] Error message is clear

---

## Critical Implementation Rules

1. **Never create a subaccount without resolve-confirm step** — resolve first (read-only), confirm name matches, only then create
2. **Subaccount code is immutable** — stored once, never regenerated
3. **2% transaction_charge is computed on every payment** — never hardcoded or cached
4. **bearer: "subaccount" is hardcoded** — organizer's share absorbs Paystack's fee
5. **Audit log every payout setup change** — organizer.created, organizer.updated
6. **Campaign activation must check for subaccount** — prevent "campaign accepts payments but has no payout destination" state
7. **Suspend/reactivate organizer** — doesn't affect subaccount code, but suspended organizer can't log in to manage campaigns

---

## Rollback Plan

If anything fails mid-implementation:
1. Rollback Prisma migration: `npx prisma migrate resolve --rolled-back [migration-name]`
2. Don't merge routes/services until full Phase 1 is tested
3. Keep feature branch isolated until all tests pass

---

## Sign-Off

- [ ] Database schema updated and migrated
- [ ] Paystack client extended
- [ ] Payout account service implemented
- [ ] Routes & controller wired
- [ ] Payment initiation updated
- [ ] Campaign activation gate in place
- [ ] All tests pass
- [ ] Frontend ready to consume endpoints
