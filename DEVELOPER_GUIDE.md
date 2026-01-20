# Developer Guide

Welcome to the team! This guide is designed to help you build a mental model of the codebase, understand where features live, and get you contributing as quickly as possible.

## 1. The Mental Map (Architecture & Logic)

### Directory Structure
We strictly follow **Next.js App Router** conventions with a **Feature-First** organization strategy.

- **`app/`**: Contains the routing logic, grouped by target audience/domain rather than functionality.
  - `(auth)`: Route groups for authentication (Sign In/Up).
  - `(businesses)`: Public and internal routes related to Business entities.
  - `(customer)`: Customer-facing flows.
  - `(dashboard)`: Protected dashboard views for users/business owners.
- **`components/`**: Shared UI components (Buttons, Inputs, Modals).
- **`lib/`**: The "Brain" of the app. Contains shared utilities, AI services, and global configurations.
- **`prisma/`**: Database source of truth (Schema & Seeds).

### 🧠 Data Flow
1.  **Server Components**: We default to fetching data directly in Server Components using Prisma.
2.  **Server Actions**: Mutations (POST/PUT/DELETE) are handled via **Server Actions**.
    - Look for `actions/` folders inside route groups.
    - We use a custom wrapper `safeAction` (in `lib/safe-action.ts`) to ensure all inputs are validated with Zod before reaching the DB.
3.  **Database**: Typesafe access via **Prisma ORM**.

### 🛠 Tech Stack
| Technology | Purpose |
| :--- | :--- |
| **Next.js 16** | Core React Framework (App Router). |
| **Prisma + PostgreSQL** | Database ORM and relational data storage. |
| **Clerk** | Authentication & User Management. |
| **Zustand** | Client-side global state management (simple & fast). |
| **Google Gemini** | AI features (content generation, analysis). |
| **Tailwind CSS + Radix UI** | Styling and accessible UI primitives. |

---

## 2. Feature Catalog (What & Where)

| Feature | Logic Location | Key Database Models | Notes |
| :--- | :--- | :--- | :--- |
| **Auth** | `app/(auth)` & `lib/clerk.ts` | `User` | handled via Clerk middleware/components. |
| **Business Dashboard** | `app/(dashboard)/dashboard` | `Business`, `Order`, `Booking` | Complex view for business owners to manage ops. |
| **Business Onboarding** | `app/(businesses)/business/onboarding` | `Business` | Multi-step form to register new venues. |
| **Search & Discovery** | `app/api/search` | `Business` (Index) | Likely uses Postgres Full Text Search or Vector search. |
| **Reviews & Ratings** | `app/api/reviews` | `Review`, `ReviewVote` | Includes moderation and verification logic. |
| **AI Services** | `lib/ai/` | N/A | Wrappers for Gemini API interactions. |

### 🚨 Complex Logic Alert
- **`lib/safe-action.ts`**: This is the gatekeeper for all mutations. It standardizes error handling and Zod validation. **Always** use this when writing new Server Actions.
- **`lib/ai/gemini-service.ts`**: Centralized logic for talking to Google's LLM. If you're building an AI feature, extend this service.

---

## 3. Key Decisions (The "Why")

- **Why Group Routes? (`(auth)`, `(dashboard)`)**: To keep layouts distinct. The Dashboard likely needs a persistent sidebar, while Auth pages need a minimal layout. Grouping lets us apply `layout.tsx` selectively without affecting URL paths.
- **`lib/safe-action.ts`**: We prefer explicit result types (`{ success: true, data: ... }`) over throwing errors to keep the UI resilient and typed.
- **Prisma Seeds (`prisma/seed.ts`)**: We rely heavily on seeding for local development to ensure you have categories and amenities populated immediately.

---

## 4. Setup & Workflows

### Prerequisites
- Node.js (Latest LTS recommended)
- PostgreSQL Database (Local or Cloud like Supabase/Neon)

### Getting Started
1.  **Install Dependencies**
    ```bash
    npm install
    ```
2.  **Environment Setup**
    - Copy `.env.example` (or similar) to `.env`
    - **Required Vars**:
      - `DATABASE_URL`: Connection string for Postgres.
      - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: Auth credentials.
3.  **Database Init**
    ```bash
    # Push schema to DB
    npm run db:push

    # Seed initial data (Crucial for the app to work!)
    npm run db:seed
    ```
4.  **Run Locally**
    ```bash
    npm run dev
    ```

### Testing & Quality
- **Linting**: `npm run lint` - Runs ESLint.
- **Type Checking**: Run `tsc --noEmit` locally to catch type errors before committing.
