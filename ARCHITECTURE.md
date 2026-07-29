# Platform Architecture & Layering Guidelines

## Backend: Layered Architecture (`backend/src/`)

- `config/`: Database setup, environment variable validation via Zod, system constants (state machine transitions, coverage rules).
- `models/`: Mongoose schemas ONLY. Data definition and indexes. No business logic.
- `repositories/`: Database query layer. Interacts directly with Mongoose models. Decouples DB operations from business logic.
- `services/`: All business logic lives here (pure domain functions, state machine transition validation, coverage calculation engine, fraud detection engine, audit logging). No HTTP `req`/`res` objects.
- `controllers/`: Thin handlers. Validates inputs, invokes services, formats responses. No business logic in controllers.
- `routes/`: Express Router definitions and middleware wiring.
- `middleware/`: Auth verification (JWT), RBAC guards, Multer upload configuration, Zod input validation, central error handling.
- `validators/`: Zod schemas for payload validation.
- `dtos/`: Response data transfer object schemas.
- `errors/`: Custom error classes (`AppError`, `NotFoundError`, `ConflictError`, etc.).
- `utils/`: Helpers (`catchAsync`, `apiResponse`).
- `types/`: Shared TypeScript domain interfaces and enums.

---

## Frontend: Feature-Based Architecture (`frontend/src/`)

- `app/`: Next.js 14 App Router routes ONLY. Thin page components that compose features.
- `components/ui/`: UI primitives (shadcn components).
- `components/shared/`: Shared domain-agnostic or cross-cutting visual components (`AppShell`, `StatusBadge`, `ClaimTimeline`).
- `features/`: Feature modules (`auth`, `claims`, `review`, `admin`). Each feature contains its own API calls, TanStack Query hooks, Zustand stores, types, and logic.
- `lib/`: Shared utilities (`axios` instance with 401 interceptor, helper functions).
- `types/`: Domain-wide shared interfaces.
