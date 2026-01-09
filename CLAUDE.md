# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Point of Sale (POS) application built with Tauri 2, Preact, and TypeScript. The frontend uses Preact with Wouter for routing, while the backend is built with Rust using SeaORM with PostgreSQL.

## Development Commands

### Frontend Development

```bash
bun run dev          # Start Vite dev server (port 1420)
bun run build        # Build frontend (runs tsc && vite build)
bun run preview      # Preview production build
```

### Tauri Application

```bash
bun run tauri dev    # Run Tauri in development mode (includes frontend dev server)
bun run tauri build  # Build production Tauri application
```

### Database Migrations

All migration commands run from `src-tauri/migration/` directory:

```bash
cargo run                           # Apply all pending migrations
cargo run -- generate MIGRATION_NAME # Generate new migration file
cargo run -- up                     # Apply pending migrations
cargo run -- up -n 10              # Apply first 10 pending migrations
cargo run -- down                   # Rollback last migration
cargo run -- down -n 10            # Rollback last 10 migrations
cargo run -- fresh                  # Drop all tables, reapply migrations
cargo run -- refresh                # Rollback all, then reapply
cargo run -- reset                  # Rollback all migrations
cargo run -- status                 # Check migration status
```

### Environment Setup

Create `.env` file in project root with:
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgres://user:password@localhost/sales_point`)
- `SEED_EMAIL`, `SEED_PASSWORD`, `SEED_USERNAME`: Initial user credentials for seed data

## Architecture

### Frontend (Preact + TypeScript)

**Stack:**
- Preact for UI components (lightweight React alternative)
- Wouter for routing (hash-based routing with `useHashLocation`)
- Zustand for state management
- Conform + Zod for form validation
- SWR for data fetching
- Tailwind CSS v4 for styling
- Tauri API (`@tauri-apps/api`) for backend communication

**Key Patterns:**

1. **Route Configuration** (`src/routes/index.tsx`):
   - Centralized route definitions in the `routes` array
   - Each route specifies: `path`, `component`, `layout` ("main" | "auth"), `requireAuth`, `title`
   - Authentication guard automatically redirects unauthenticated users to `/login`
   - Logged-in users attempting to access `/login` are redirected to `/`
   - To add a new route: add an entry to the `routes` array following the existing pattern

2. **Layouts:**
   - `MainLayout` (`src/layouts/MainLayout.tsx`): For authenticated pages, includes Sidebar + Navbar
   - `AuthLayout` (`src/layouts/AuthLayout.tsx`): For login and unauthenticated pages
   - Layout selection is automatic based on route configuration

3. **State Management:**
   - Zustand stores in `src/store/` (e.g., `authStore.ts`)
   - Authentication state (`useAuthStore`): manages session, login, logout, and auth checks
   - Session is stored in-memory and managed by Rust backend (ephemeral for security)
   - Session is lost on app close (intentional security feature)

4. **Backend Communication:**
   - Use `invoke()` from `@tauri-apps/api/core` to call Rust commands
   - Actions pattern: create wrapper functions in `src/actions/` that call `invoke()`
   - Example: `await invoke("login", { userData: credentials })`
   - All communication is type-safe with TypeScript interfaces

5. **Path Aliases:**
   - `@/` maps to `src/` directory (configured in both `vite.config.ts` and `tsconfig.json`)
   - Use `@/components/Button` instead of `../../components/Button`

**Directory Structure:**
- `src/pages/` - Page components organized by feature (sales, inventory, etc.)
- `src/components/` - Shared components (Navbar, Sidebar, NavItem, etc.)
- `src/layouts/` - Layout wrappers (MainLayout, AuthLayout)
- `src/store/` - Zustand state stores
- `src/actions/` - Backend API wrappers (wrap Tauri invoke calls)
- `src/validators/` - Zod schemas for form validation
- `src/types/` - TypeScript type definitions
- `src/mocks/` - Mock data for development (categories, products, menuItems)
- `src/routes/` - Routing configuration

### Backend (Rust + Tauri)

**Stack:**
- Tauri 2 for desktop app framework
- SeaORM 2.0 with PostgreSQL
- Tokio async runtime
- bcrypt for password hashing
- Serde for JSON serialization
- dotenvy for environment variables

**Key Patterns:**

1. **Application Structure:**
   - `src-tauri/src/lib.rs`: Main Tauri setup, command registration, and AppState
   - `src-tauri/src/main.rs`: Entry point (minimal, calls `lib.rs::run()`)
   - `src-tauri/src/db.rs`: Database connection helper
   - Feature modules: `sessions/`, `products/`, `categories/` (each with `handlers.rs`, `structs.rs`, `mod.rs`)
   - `src-tauri/src/entities/`: SeaORM entity definitions (auto-generated from migrations)

2. **AppState Pattern:**
   - Global state managed through Tauri's state management
   - Contains: `DatabaseConnection` and `Mutex<Option<Session>>`
   - Access in commands via `State<AppState>` parameter
   - Session is stored in-memory in the AppState (not in database)

3. **Tauri Commands:**
   - Define handlers in feature modules (e.g., `src-tauri/src/sessions/handlers.rs`)
   - Mark with `#[tauri::command]` attribute
   - Register in `lib.rs` using `tauri::generate_handler![...]`
   - Commands are async and return `Result<T, String>` for error handling
   - Frontend calls via `invoke("command_name", { params })`

4. **Module Organization:**
   - Each feature has its own directory (e.g., `sessions/`, `products/`, `categories/`)
   - `handlers.rs`: Tauri command handlers (the actual functions called from frontend)
   - `structs.rs`: Data structures for request/response
   - `mod.rs`: Module exports

5. **Database Access:**
   - SeaORM entities in `src-tauri/src/entities/` (auto-generated)
   - Access via `state.database` from AppState
   - Use SeaORM query builder for CRUD operations
   - All database operations are async

6. **Migrations:**
   - Located in `src-tauri/migration/src/`
   - Naming convention: `m{TIMESTAMP}_{description}_table.rs`
   - Cargo workspace setup: main app depends on migration crate
   - Migration CLI is a separate binary in the workspace

7. **Cargo Workspace:**
   - Root: `src-tauri/` with `Cargo.toml` defining workspace
   - Members: `"."` (main app) and `"migration"`
   - Migration crate is imported as dependency in main app

## Database Schema

Key tables (see `src-tauri/migration/src/` for full schema):

- **profiles**: User profile information
- **users**: User accounts with authentication (password hashed with bcrypt)
- **categories**: Product categorization (soft delete with `deleted_at`)
- **products**: Product catalog (with stock, pricing, tax, soft delete)
- **payment_methods**: Available payment methods
- **sales**: Sales transactions (references user, payment method)
- **sale_details**: Line items for sales (product, quantity, price)
- **sale_payments**: Payment records for sales
- **refunds**: Refund transactions
- **refund_details**: Line items for refunds

Initial seed data is created via migration: `m20260105_025937_seed_initial_data.rs`

## Important Notes

### Development Environment
- Frontend package manager: **Bun** (not npm/yarn/pnpm)
- Vite dev server runs on port 1420 (strictPort mode)
- HMR (hot module reload) on port 1421
- Tauri watches `src-tauri/` for Rust changes (auto-reload)

### Routing
- Hash-based routing (`/#/path`) using Wouter with `useHashLocation`
- Required for Tauri apps to work correctly with filesystem-based protocols
- Routes are centralized in `src/routes/index.tsx`

### Authentication
- Session managed in-memory by Rust backend (AppState)
- Frontend checks auth status on app load (`checkAuth()`)
- Protected routes automatically redirect to `/login`
- Session is lost when app closes (security feature)

### TypeScript Configuration
- Strict mode enabled
- JSX configured for Preact (`jsxImportSource: "preact"`)
- Path alias `@/*` mapped to `src/*`

### Tauri Configuration
- Config file: `src-tauri/tauri.conf.json`
- Build commands use Bun (not npm)
- Window opens maximized by default (800x600 minimum)
