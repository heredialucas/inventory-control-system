# AGENTS.md

## Commands

```bash
pnpm dev                # Start dev server
pnpm build              # Run prisma generate + next build (order matters)
pnpm migrate:create     # Generate migration SQL diff (see Prisma workflow below)
```

No test suite configured.

## IMPORTANT: Never do these

- **NEVER run `prisma db push --force-reset`** - This wipes all data from the database
- **NEVER run `pnpm lint`** - It times out and is not needed
- **NEVER run `prisma migrate dev`** - Shadow DB creation fails with Supabase/PgBouncer
- **NEVER run `prisma migrate resolve` on existing migrations** unless you understand the full migration history state
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

## Prisma Migration Workflow

`prisma migrate dev` is **broken** because Supabase/PgBouncer doesn't allow creating shadow databases. Use this manual workflow instead:

### 1. Generate migration SQL diff
```bash
pnpm migrate:create > /tmp/migration.sql
```

Review the SQL to make sure it's correct. The output may include pnpm banner lines — strip those (actual SQL starts after them).

### 2. Create migration directory and SQL file
```bash
MIGRATION_NAME="describe_the_change"
TIMESTAMP=$(date -u +%Y%m%d%H%M%S)
mkdir -p prisma/migrations/${TIMESTAMP}_${MIGRATION_NAME}
# Use direct prisma command to avoid pnpm shell noise in the SQL file
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > prisma/migrations/${TIMESTAMP}_${MIGRATION_NAME}/migration.sql
```

### 3. Apply the migration
```bash
pnpm prisma db execute --file prisma/migrations/<TIMESTAMP>_<NAME>/migration.sql
```

### 4. Mark as applied in `_prisma_migrations`
```bash
pnpm prisma migrate resolve --applied <TIMESTAMP>_<NAME>
```

### 5. Regenerate Prisma client
```bash
pnpm prisma generate
```

### 6. Verify
```bash
pnpm prisma migrate status
```

### Important notes

- **Only use this workflow for NEW migrations.** Never use `prisma migrate resolve` on existing migrations — that was the mistake that broke the tracking.
- The `_prisma_migrations` table must contain ALL prior migrations. If it doesn't, mark them all as applied with `prisma migrate resolve --applied <name>` for each one.
- Migration names come from the directory names under `prisma/migrations/` (e.g., `20251206024958_init_migration`).
- Always verify with `pnpm prisma migrate status` afterward — it should say "Database schema is up to date!".
- For simple enum-only changes, `pnpm prisma db execute --stdin <<< "ALTER TYPE ... ADD VALUE ..."` is sufficient, but still create a migration SQL file for tracking.

## Database Schema

Models: User, Role, Permission, UserRole, RolePermission, Warehouse, WarehouseStock, Product, Category, Supplier, PurchaseOrder, PurchaseOrderItem, StockMovement, Delivery, DeliveryItem, Institution, Expediente, ExpedienteCategory, PurchaseReceipt, PurchaseReceiptItem.

### Nuevos Modelos

- **WarehouseType** enum: `DEPOSIT` | `OFFICE`
- **Warehouse.type**: Campo para diferenciar depósitos de oficinas
- **ExpedienteCategory**: Categorías dinámicas para expedientes
- **PurchaseReceiptStatus** enum: `ACTIVE` | `COMPLETED`
- **PurchaseReceipt.status**: Estado del remito para tracking de parciales (cierre manual)

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