# ClaimCare - Frontend Application

The ClaimCare frontend is a modern web application built with Next.js 14 (App Router) and React. It serves as the primary interface for Providers, Reviewers, and Administrators to interact with the ClaimCare platform.

## 🏗 Architecture & Feature-Sliced Design

The frontend strictly enforces a separation between routing and UI logic. The `src/app` directory contains ONLY routing files (`page.tsx`), and every single page acts as a thin wrapper that imports a dedicated "View" component from the `src/features` directory.

### Directory Structure
```text
src/
├── app/                  # Next.js App Router (strictly routing wrappers)
├── components/           # Global Shared UI Components (Button, Input, Skeleton, etc.)
├── config/               # Global constants (Claim Statuses, etc.)
├── features/             # Feature-Sliced Design Modules
│   ├── admin/            # Admin domain (Views, Hooks, API, Components)
│   ├── auth/             # Auth domain (Login, Register, Session Store)
│   ├── claims/           # Provider claims domain
│   └── review/           # Reviewer domain
├── lib/                  # Utilities (Axios instance, Tailwind merge)
└── validators/           # Zod validation schemas (shared logic)
```

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide React Icons
- **State Management**: Zustand
- **Server State / Data Fetching**: `@tanstack/react-query` & Axios
- **Form Handling**: `react-hook-form` & `zod`
- **Charts**: `recharts`

## 🚀 Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🎨 Design System

ClaimCare relies on a strict design system managed via Tailwind CSS. Core design tokens are defined in `globals.css`. 
- **Colors**: Vibrant brand colors (`var(--brand-500)`) with clear semantic status badges (Approved, Rejected, Pending).
- **Typography**: Inter font with clear hierarchical weighting.
- **Micro-interactions**: Hover effects, loading skeletons, and interactive steppers for audit logs.

## 🔐 Authentication
Authentication is managed via JWT. The token is stored securely in memory and localStorage (via Zustand's persist middleware). Axios interceptors automatically inject the `Authorization: Bearer <token>` header into every API request and handle global 401 Unauthorized redirects.
