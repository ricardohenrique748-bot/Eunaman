# Eunaman - Implementation Plan

## 1. Project Overview
**Name:** Eunaman – Gestão Integrada
**Goal:** A comprehensive web system for fleet management, maintenance (PCM), safety, inventory, costs, and HR.
**Core Features:** Responsive UI, Role-based Access Control (RBAC), Global Filters, Single Dashboard, Operational Modules.

## 2. Technology Stack
- **Frontend:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (Industrial Tech Theme - Dark/Sharp)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (or Custom Auth table `Usuarios` synced)
- **State Management:** React Query / Zustand (for global filters)

## 3. Architecture & Database Design

### 3.1 Global Rules
- **Multi-tenancy:** All tables must have `empresa_id` (and potentially `unidade_id`). (Note: User asked for `empresa_padrao` in Users, assuming filter logic).
- **Filters:** All list queries must respect the selected `empresa`/`unidade` and `period`.

### 3.2 Schema Migration (Phase 1)
We will execute SQL based on the user's detailed schema:
- **Auth:** `usuarios` (Custom table as requested, needing sync or independent auth logic).
- **Base:** `empresas`, `unidades`, `veiculos_frota`.
- **PCM:** `ordens_servico`, `planos_manutencao`, `pneus_frota`.
- **Safety/Other:** `checklists`, `estoque`, `custos`, `rh`.

## 4. Implementation Phases

### Phase 1: Foundation & DB Setup
- [ ] Setup Next.js Project with Tailwind.
- [ ] Configure Environment (`DATABASE_URL`).
- [ ] Create Database Migration Script (SQL).
- [ ] Implement `db` connection util (Prisma or Supabase Client). *Decision: Using Prisma for type safety with the provided Postgres string is often easier for complex schemas.*

### Phase 2: Core Components & Layout
- [ ] strict Design System (Industrial Theme).
- [ ] Global Layout (Sidebar, Topbar with Global Filters).
- [ ] Auth Page (Login).

### Phase 3: Dashboard (The "Wow" Factor)
- [ ] Cards: Total OS, OS Active, MTTR, MTBF, Fleet Availability.
- [ ] Charts: Availability per Vehicle.
- [ ] Lists: Overdue Preventives.

### Phase 4: Modules (CRUDs)
- [ ] PCM: OS Management, Preventive Plans.
- [ ] Fleet: Vehicles, Tires.
- [ ] Resources: Inventory, Cost Centers.

### Phase 5: Refinement
- [ ] Role Guard checks.
- [ ] Mobile Responsiveness polish.

## 5. Next Steps
1. Initialize Project.
2. Create SQL Schema.
3. Setup Prisma Schema.
