# Mini ERP + CRM Operations Portal

A complete, production-grade, full-stack **Mini ERP + CRM Operations Portal** engineered for wholesale and distribution enterprises. Designed to streamline customer lead tracking, multi-warehouse inventory management, atomic stock movement transactions, sales delivery challans with product snapshots, automated invoice generation, and financial reporting.

---

## 🌟 Features

* **Multi-Role Authorization (RBAC)**: Role-tailored operational permissions for **ADMIN**, **SALES**, **WAREHOUSE**, and **ACCOUNTS** teams enforced at both API and UI levels.
* **Customer CRM Module**: Complete B2B/B2C customer lifecycle tracking (LEAD, ACTIVE, INACTIVE), detailed follow-up notes, and scheduled contact timelines.
* **Inventory & Multi-Warehouse Tracking**: Categorized SKU management with live stock status badges (`IN STOCK` / `LOW STOCK`), alert thresholds, and manual Stock IN receipt logging.
* **Atomic Stock Movement Engine**:
  * Sales Challans start in `DRAFT` status without deducting stock.
  * `CONFIRMED` challans atomically verify stock across all line items in an isolated Prisma transaction.
  * If ANY product has insufficient stock, the transaction aborts with a clear API error (`INSUFFICIENT_STOCK`).
  * `CANCELLED` confirmed challans restore stock idempotently with `IN` stock movement logs.
* **Product Snapshotting**: Challan line items store historical snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) ensuring historical records remain untouched when product catalog pricing updates.
* **Automated Billing & Invoicing**: Automatic 18% GST invoice generation upon challan confirmation with full payment status management (`GENERATED`, `PAID`, `PARTIAL`, `CANCELLED`).
* **Printable A4 Documents**: Clean, print-ready CSS stylesheets for Sales Delivery Challans and Tax Invoices with company GSTIN headers and signature lines.
* **Executive Dashboard & Analytics**: KPI metrics cards, Recharts visualizations (Monthly Sales Trend, Challan status distribution, Top-selling products), low-stock alert feed, and audit activity logs.
* **Swagger OpenAPI Documentation**: Interactive API testing playground available live at `/api/docs`.

---

## 🏗️ Tech Stack

### Backend
* **Runtime**: Node.js v20+ with TypeScript
* **Framework**: Express.js
* **Database**: PostgreSQL
* **ORM**: Prisma ORM v5
* **Authentication**: JWT & bcrypt password hashing
* **Validation**: Zod
* **Security & Utilities**: Helmet, CORS, Morgan, Express-Rate-Limit, Swagger-UI-Express

### Frontend
* **Core**: React 18, TypeScript, Vite
* **Routing**: React Router v6
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Charts**: Recharts
* **State & Forms**: React Hook Form, Context API (Auth & Toast)
* **HTTP Client**: Axios with JWT Interceptors

### DevOps & Infrastructure
* **Containerization**: Docker & Docker Compose
* **Web Server**: Nginx (for production frontend container)
* **Testing**: Vitest & Supertest

---

## 📂 Project Structure

```
mini-erp-crm/
│
├── backend/
│   ├── src/
│   │   ├── config/             # Environment & Prisma client setup
│   │   ├── controllers/        # Thin HTTP request handlers
│   │   ├── middleware/         # Auth JWT, RBAC authorize, Zod validate, Error handler
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic & Prisma atomic transactions
│   │   ├── types/              # TypeScript interfaces & API response contracts
│   │   ├── utils/              # Custom AppError classes & response wrappers
│   │   ├── validators/         # Zod schemas for input validation
│   │   ├── swagger.ts          # Swagger OpenAPI documentation
│   │   ├── app.ts              # Express application assembly
│   │   └── server.ts           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Relational database schema
│   │   └── seed.ts             # Comprehensive database seeder
│   ├── tests/
│   │   └── business.test.ts    # Vitest integration tests
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Table, Modal, Badge, Card, etc.)
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── layouts/            # DashboardLayout with Navbar & Sidebar
│   │   ├── pages/              # View pages (Dashboard, CRM, Products, Challans, Invoices, Reports, Users)
│   │   ├── routes/             # AppRoutes with role-based ProtectedRoute guards
│   │   ├── services/           # Axios API client setup
│   │   ├── types/              # Frontend TypeScript data models
│   │   ├── App.tsx
│   │   ├── index.css           # Tailwind CSS & Print styles
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── docker-compose.yml          # Container orchestration (Postgres, Backend, Frontend)
├── README.md
└── .gitignore
```

---

## 🔑 Roles & Permissions Matrix

| Module / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Executive Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **View Customers** | ✅ | ✅ | ❌ | ✅ |
| **Create / Edit Customers & Follow-Ups** | ✅ | ✅ | ❌ | ❌ |
| **View Products & Stock Levels** | ✅ | ✅ | ✅ | ❌ |
| **Create / Edit Products** | ✅ | ❌ | ❌ | ❌ |
| **Perform Stock IN Receipts** | ✅ | ❌ | ✅ | ❌ |
| **View Stock Movement History** | ✅ | ❌ | ✅ | ❌ |
| **Create / Edit Sales Challans (Draft)** | ✅ | ✅ | ❌ | ❌ |
| **Confirm Sales Challans** | ✅ | ✅ | ❌ | ❌ |
| **Cancel Confirmed Challans** | ✅ | ❌ | ❌ | ❌ |
| **View Invoices & Billing** | ✅ | ❌ | ❌ | ✅ |
| **Update Invoice Payment Status** | ✅ | ❌ | ❌ | ✅ |
| **Business & Financial Reports** | ✅ | ❌ | ❌ | ✅ |
| **User Account Management** | ✅ | ❌ | ❌ | ❌ |

---

## 👤 Demo Credentials

The database seed populates 4 realistic operational user accounts:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `Admin@123` | Full Administrative & Operations Access |
| **SALES** | `sales@example.com` | `Sales@123` | CRM Lead Management, Create & Confirm Challans |
| **WAREHOUSE** | `warehouse@example.com` | `Warehouse@123` | Product Catalog, Stock-IN, Movement Audit Logs |
| **ACCOUNTS** | `accounts@example.com` | `Accounts@123` | Confirmed Challans, Tax Invoices, Payment Statuses |

> [!NOTE]
> On the frontend Login screen (`/login`), click any role badge to automatically pre-fill credentials!

---

## 🚀 Local Setup & Installation

### Prerequisites
* **Node.js**: v20.x or higher
* **PostgreSQL**: v15.x running locally OR Docker installed

### Step 1: Database & Environment Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   cd assignment
   ```

2. Configure backend environment variables:
   ```bash
   cd backend
   cp .env.example .env
   ```
   *Edit `.env` if needed to match your local PostgreSQL connection string (e.g. `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minierp_db?schema=public"`).*

3. Configure frontend environment variables:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```

### Step 2: Install Dependencies & Run Database Seed

1. Install backend packages and execute Prisma migration + database seed:
   ```bash
   cd ../backend
   npm install
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

2. Install frontend packages:
   ```bash
   cd ../frontend
   npm install
   ```

### Step 3: Launch Local Servers

1. Start the Express Backend API (Server runs at `http://localhost:5000`):
   ```bash
   cd ../backend
   npm run dev
   ```

2. In a separate terminal, start the Vite Frontend (App runs at `http://localhost:5173`):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser and sign in!

---

## 🐳 Docker Setup

To run the complete full-stack environment (PostgreSQL + Backend + Frontend Nginx) with a single command:

```bash
docker compose up --build -d
```

* **Frontend UI**: `http://localhost:80`
* **Backend API**: `http://localhost:5000`
* **Swagger Docs**: `http://localhost:5000/api/docs`

To initialize the database inside the Docker container:
```bash
docker exec -it minierp_backend npx prisma migrate deploy
docker exec -it minierp_backend npx prisma db seed
```

---

## 🧪 Automated Testing

Backend unit and stock integration tests verify authentication, boundary conditions, stock deduction on confirmation, atomic rollback on insufficient stock, and cancellation restoration.

To execute the test suite:

```bash
cd backend
npm test
```

---

## 🌐 API Documentation

Interactive Swagger OpenAPI documentation is integrated directly into the backend.

Access live documentation at: **`http://localhost:5000/api/docs`**

Key Endpoints Summary:
* `POST /api/auth/login` — Authenticate and receive JWT token
* `GET /api/auth/me` — Fetch current user profile
* `GET /api/customers` — Query customer list with pagination & filters
* `POST /api/customers/:id/followups` — Add CRM follow-up note
* `GET /api/products` — Retrieve product catalog & stock statuses
* `POST /api/products/:id/stock-in` — Execute Stock IN addition
* `POST /api/challans` — Create draft sales challan
* `POST /api/challans/:id/confirm` — Confirm challan (Atomic stock reduction & invoice generation)
* `POST /api/challans/:id/cancel` — Cancel challan (Restores stock if confirmed)
* `GET /api/invoices` — List tax invoices
* `PUT /api/invoices/:id/status` — Modify payment status (`PAID`, `PARTIAL`, etc.)
* `GET /api/dashboard` — Executive KPI metrics and chart feeds

---

## ☁️ AWS Deployment Documentation

Follow this step-by-step guide to deploy the application to Production on AWS using **EC2, RDS PostgreSQL, and S3 / CloudFront**.

### 1. Provision AWS RDS PostgreSQL Database
1. Go to AWS RDS Console -> **Create Database**.
2. Select **PostgreSQL**, Engine Version `15.x`.
3. Choose DB instance class (e.g., `db.t4g.micro` for Free Tier).
4. Set Master Username (`postgres`) and Password.
5. Create a Security Group allowing inbound PostgreSQL traffic (Port `5432`) from your EC2 security group.

### 2. Launch AWS EC2 Instance (Backend Server)
1. Go to AWS EC2 Console -> **Launch Instance** (Ubuntu 22.04 LTS, `t3.small` recommended).
2. Configure Security Group:
   * Inbound `HTTP (80)`, `HTTPS (443)`
   * Inbound `Custom TCP (5000)`
   * Inbound `SSH (22)`
3. SSH into EC2 and install Node.js 20 & Git:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git pm2
   ```

### 3. Deploy Backend API to EC2
1. Clone your GitHub repository on EC2:
   ```bash
   git clone https://github.com/your-username/mini-erp-crm.git
   cd mini-erp-crm/backend
   npm install
   ```
2. Create `.env` file with your production AWS RDS connection string:
   ```ini
   PORT=5000
   NODE_ENV=production
   DATABASE_URL="postgresql://postgres:YOUR_RDS_PASSWORD@YOUR_RDS_ENDPOINT:5432/minierp_db?schema=public"
   JWT_SECRET="YOUR_PRODUCTION_SECURE_JWT_SECRET"
   JWT_EXPIRES_IN=1d
   CORS_ORIGIN="https://your-app-domain.com"
   ```
3. Run database migrations & seed:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   npm run build
   ```
4. Start process manager PM2:
   ```bash
   pm2 start dist/server.js --name "mini-erp-backend"
   pm2 save
   pm2 startup
   ```

### 4. Deploy Frontend to AWS S3 & CloudFront (or AWS Amplify)
1. Build frontend locally with production API endpoint:
   ```bash
   cd frontend
   VITE_API_URL="https://api.your-domain.com/api" npm run build
   ```
2. Create AWS S3 bucket configured for Static Website Hosting.
3. Upload contents of `frontend/dist` to S3.
4. Create an **AWS CloudFront Distribution** pointing to the S3 bucket origin.
5. Configure SSL Certificate using **AWS Certificate Manager (ACM)** for custom domain HTTPS.

---

## 📸 Screenshots & UI Preview

* **Dashboard Analytics**: Executive KPIs, sales bar charts, low-stock highlight banner, and activity feed.
* **Customer CRM**: Timeline of client interactions, follow-up scheduler, and status badges.
* **Challan & Invoice Generator**: Dynamic line items, stock availability warnings, and printable A4 layouts.

---

## 🔮 Future Improvements

* Multi-currency support for international export orders.
* Barcode scanner integration for instant warehouse dispatch scanning.
* Automated email notifications for low-stock alerts and customer follow-up reminders.
