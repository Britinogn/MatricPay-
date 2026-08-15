# 🎓 MatricPay (Phase 1 — Paystack Architecture)

**MatricPay** is a university and polytechnic-focused payment collection platform built for class representatives, department executives, and student organizers to collect dues, levies, and event fees effortlessly.

It completely eliminates manual bank transfers, WhatsApp screenshot verification, and spreadsheet reconciliation headaches by automatically matching verified student payments through secure **Paystack Checkout** integration.

---

## 🌟 What MatricPay Solves

| Traditional Manual Process ❌ | MatricPay Solution ✅ |
| :--- | :--- |
| Manual transfers to personal class rep bank accounts | Automated collection via Paystack Checkout (Card, USSD, Bank Transfer) |
| WhatsApp screenshot spam & receipt verification | Instant automated verification & cryptographic payment references (`MP-...`) |
| Excel spreadsheet errors & lost records | Live organizer collection dashboard updating automatically |
| Fraud & matric number impersonation | Pre-validated student rosters & server-side rate limiting |

---

## 🚀 Key Phase 1 Features

### 1. 🎓 **Campaign Management**
- **Restricted Campaigns**: Tailored for departmental dues or levies where the student list is known. Requires uploading a student roster before activation.
- **Open Campaigns**: Tailored for hackathons, seminars, or public contributions. Students register their details directly during payment. Supports **Fixed** or **Minimum** contribution amounts.
- **Computed Expiry**: Campaigns dynamically check expiry status (`status = active AND expires_at < NOW()`) at read-time, preventing database state drift.

### 2. 📁 **Student Roster Import**
- Supports uploading student lists via **CSV (`.csv`)** and **Excel (`.xlsx`)** files before campaign activation.
- Server-side deduplication by matriculation number with row error metrics (processed, successful, skipped rows).

### 3. 💳 **Paystack Payment Engine**
- **Kobo Currency Boundary**: Converts NGN to Kobo (`amount × 100`) strictly at the Paystack API call.
- **Dual Verification Engine**:
  1. **Direct Synchronous Verification** (`GET /api/payments/:reference/status`): Instant verification when students land on the post-checkout page.
  2. **Authoritative Webhook Verification** (`POST /api/webhook/paystack`): Signed HMAC SHA-512 verification, idempotency checks via `WebhookLog`, and retry tracking.
- **Flagged Transaction Safeguard**: Any amount or currency mismatches are marked `status = flagged` with `failure_reason = amount_mismatch` for manual review.

### 4. 📊 **Organizer & Admin Dashboards**
- **Organizer Dashboard** (`/api/organizer/overview` & `/api/campaigns/:id/dashboard`): Live collection progress, expected vs. collected amounts, collection percentage, paid/unpaid student rosters, and flagged payments.
- **Strict Isolation**: Organizer A can **never** view or manage Organizer B's campaigns (`404 Not Found` returned if attempted).
- **Super Admin Management** (`/api/admin/*`): System-wide revenue metrics, organizer suspension/reactivation, campaign force-closure, and audit logging (`AuditLog` table). Guarded by `role = admin`.

---

## 🛠️ Technology Stack

### **Backend Core**
- **Runtime**: Node.js & TypeScript (`tsx watch`)
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL (Supabase) & Prisma ORM
- **Payment Gateway**: Paystack API (Initialize, Verify, Webhooks)
- **Authentication**: Short-lived JWT (`Bearer` tokens) & bcrypt password hashing
- **Data Validation**: Zod schema validation
- **File Processing**: Multer & `xlsx` / `csv-parse`

---

## 📁 Project Structure

```text
matricpay/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Postgres database schema
│   ├── src/
│   │   ├── config/               # Environment & app config
│   │   ├── controllers/          # Request handlers (Auth, Campaign, Student, Payment, Dashboard, Admin)
│   │   ├── lib/                  # Paystack client & Prisma instance
│   │   ├── middleware/           # Auth, Role, CORS, Error & Validation middleware
│   │   ├── repositories/         # Database queries & data access layer
│   │   ├── routes/               # Express API endpoints
│   │   ├── services/             # Core business logic engine
│   │   ├── utils/                # Reference generator, JWT, Password, Matric normalizer
│   │   └── validators/           # Zod input validation schemas
│   ├── package.json
│   ├── PHASE_1.md
│   └── PHASE_2.md
├── frontend/                     # Client web application workspace
├── MatricPay-MVP-v5-Paystack.md  # Master Phase 1 Architecture Specification
└── README.md                     # Project documentation
```

---

## 🔌 API Endpoint Sitemap (Phase 1)

### 🔑 Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new organizer account | ❌ No |
| `POST` | `/api/auth/login` | Login organizer or admin, returns JWT & role | ❌ No |

### 📢 Campaigns & Organizer Hub
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/campaigns` | Create a new campaign (Restricted / Open) | 🔒 Yes (Organizer) |
| `GET` | `/api/campaigns` | List organizer's campaigns | 🔒 Yes (Organizer) |
| `GET` | `/api/campaigns/:id` | Get single campaign details | 🔒 Yes (Organizer) |
| `PATCH` | `/api/campaigns/:id/status` | Change campaign status (`draft` ➔ `active` ➔ `closed`) | 🔒 Yes (Organizer) |
| `GET` | `/api/organizer/overview` | Get organizer overview metrics across all campaigns | 🔒 Yes (Organizer) |
| `GET` | `/api/campaigns/:id/dashboard` | Get single campaign live metrics & student payment status | 🔒 Yes (Organizer) |

### 🎓 Students
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/campaigns/:id/students` | Manual student roster import | 🔒 Yes (Organizer) |
| `POST` | `/api/campaigns/:id/students/import/csv` | CSV / Excel `.xlsx` file roster upload | 🔒 Yes (Organizer) |
| `POST` | `/api/campaigns/slug/:slug/students/validate` | Public student validation before checkout | ❌ No |

### 💳 Payments & Webhook
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/payments/initiate` | Initiate Paystack transaction & return checkout URL | ❌ No |
| `GET` | `/api/payments/:reference/status` | Direct synchronous payment re-verification | ❌ No |
| `POST` | `/api/webhook/paystack` | Paystack Webhook with HMAC SHA-512 signature check | 🛡️ Webhook Secret |

### 🛡️ Admin Management
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/dashboard` | Platform revenue & collection overview | 👑 Admin Only |
| `GET` | `/api/admin/organizers` | List all registered organizers & total funds collected | 👑 Admin Only |
| `PATCH` | `/api/admin/organizers/:id/status` | Suspend or reactivate organizer account | 👑 Admin Only |
| `GET` | `/api/admin/campaigns` | Platform-wide campaigns list | 👑 Admin Only |
| `PATCH` | `/api/admin/campaigns/:id/status` | Force-close an organizer's campaign | 👑 Admin Only |

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database (e.g. Supabase DB)
- Paystack Account (Test Mode API Keys)

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:

```env
APP_NAME=MatricPay
APP_ENV=development
APP_PORT=5000
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

DATABASE_URL="postgresql://user:password@host:5432/dbname"

JWT_SECRET="your_32_character_long_secret_key_here"
JWT_EXPIRES_IN=1h

PAYSTACK_SECRET_KEY=sk_test_b82e04638cff2e7f5048472154ef277c077de498
PAYSTACK_PUBLIC_KEY=pk_test_f4501274befec9392787cb8110202d682443eb21

ADMIN_EMAIL=admin@matricpay.com
ADMIN_PASSWORD=AdminPassword123!
```

### 3. Install & Start Backend
```bash
cd backend
npm install

# Run database migrations
npx prisma db push

# Seed Admin User
npx tsx src/seed_admin.ts

# Start Development Server
npm run dev
```

The API will be live at `http://localhost:5000`! 🚀
