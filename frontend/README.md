# Health Insurance Claims Frontend 💻

A modern, highly-responsive web application for Providers, Reviewers, and Administrators to manage the lifecycle of medical claims.

## 🚀 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom CSS variables for theming)
- **State Management**: React Query (TanStack Query) for server state, Zustand for client state
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 🎨 UI & UX Architecture

The frontend is designed with a premium, robust aesthetic prioritizing workflow efficiency:
- **Role-Based Workspaces**: Separate `/provider`, `/reviewer`, and `/admin` routes ensures that users only download the code and see the UI necessary for their permissions.
- **Micro-Animations**: Hover states, active borders, and transition delays make the app feel alive.
- **Glassmorphism**: Subtle backdrop blurs are used in modals and sticky headers for a modern feel.
- **Timeline Visualization**: Claims feature an interactive, visual "Audit Trail" vertical stepper that instantly communicates status history.

## ⚙️ Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🛠 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run strictly typed linter & formatter
npm run check:all

# 3. Start development server (Runs on port 3000)
npm run dev
```

## 📁 Project Structure
```text
/src
├── /app             # Next.js App Router pages (grouped by role: /admin, /provider, /reviewer)
├── /components      # Reusable UI components
│   ├── /ui          # Base components (Buttons, Inputs, Modals)
│   └── /shared      # Shared complex components (StatusBadge, AuditTrailStepper)
├── /features        # Domain-driven architecture (auth, claims, admin, review)
│   ├── api.ts       # Axios API bindings
│   ├── hooks.ts     # React Query hooks
│   ├── store.ts     # Zustand client stores
│   └── types.ts     # TypeScript interfaces
└── /lib             # Core libraries (Axios client setup, utils)
```
