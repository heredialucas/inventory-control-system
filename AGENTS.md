# AGENTS.md

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Run prisma generate + next build (order matters)
pnpm migrate      # prisma generate + prisma migrate dev
```

No test suite configured.

## IMPORTANT: Never do these

- **NEVER run `prisma db push --force-reset`** - This wipes all data from the database
- **NEVER run `pnpm lint`** - It times out and is not needed
- Only run `pnpm build` to verify no errors

## Architecture

- **Framework:** Next.js 15 (App Router) + React 19
- **Database:** PostgreSQL via Prisma with `@prisma/adapter-pg` (not standard PrismaClient)
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Auth:** JWT (`jose`), session stored in `session_token` cookie

### Key Patterns

- **Server Actions:** All in `app/actions/*.ts` (not API routes)
- **DB Client:** Singleton in `lib/prisma.ts` with adapter pattern
- **User Query:** `getCurrentUser()` uses React `cache()` for request deduplication
- **Route Protection:** Middleware via `proxy.ts` redirects unauthenticated requests to `/auth/login`

## Database Schema

Models: User, Role, Permission, UserRole, RolePermission, Warehouse, WarehouseStock, Product, Category, Supplier, PurchaseOrder, PurchaseOrderItem, StockMovement, Delivery, DeliveryItem, Institution, Expediente, ExpedienteCategory, PurchaseReceipt, PurchaseReceiptItem.

### Nuevos Modelos

- **WarehouseType** enum: `DEPOSIT` | `OFFICE`
- **Warehouse.type**: Campo para diferenciar depósitos de oficinas
- **ExpedienteCategory**: Categorías dinámicas para expedientes

Flow: `PurchaseOrder → PurchaseReceipt → StockMovement (IN) → Delivery → StockMovement (OUT)`

Expediente (case file) opcionalmente 링크 a purchases, receipts, deliveries, transfers, movements.

## Env Requirements

```
DATABASE_URL   # App connection (via PgBouncer)
DIRECT_URL     # Migrations (direct PostgreSQL)
JWT_SECRET     # Auth signing
```

## Documentation

- `EXPLICACION_SCHEMAS.md` - price vs purchaseAmount fields
- `NEW_STRUCTURE.md` - expediente-centered architecture

## Quirks

- `npm run build` runs `prisma generate` first; don't run just `next build`
- Prisma adapter requires `DIRECT_URL` for migrations, separate from app `DATABASE_URL`
- No TypeScript strict mode; ESLint extends `next/core-web-vitals` + `next/typescript`
- Always run `pnpm prisma generate` after modifying schema.prisma