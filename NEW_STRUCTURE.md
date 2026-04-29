# 🏛️ IMPLEMENTACIÓN FINAL — SISTEMA DE INVENTARIO ORIENTADO A EXPEDIENTES

---

# 1. OBJETIVO

Reestructurar el sistema para:

* Centralizar la trazabilidad en expedientes (opcional)
* Separar responsabilidades por áreas
* Simplificar módulos
* Normalizar modelos de datos
* Garantizar auditoría completa

---

# 2. ESTRUCTURA DEL SIDEBAR

## 2.1 Módulos principales (colapsables)

```
1. Expedientes
2. Depósito
3. Compras
4. Distribución
5. Control
6. Configuración
```

---

## 2.2 Submódulos

### 1. Expedientes

```
/dashboard/expedientes
/dashboard/expedientes/new
/dashboard/expedientes/[id]
```

---

### 2. Depósito

```
/dashboard/inventory
/dashboard/warehouses
/dashboard/transfers
/dashboard/movements
```

---

### 3. Compras

```
/dashboard/purchases
/dashboard/suppliers
/dashboard/receipts
```

---

### 4. Distribución

```
/dashboard/deliveries
/dashboard/institutions
```

---

### 5. Control

```
/dashboard/movements
/dashboard/reports
```

---

### 6. Configuración

```
/dashboard/users
/dashboard/roles
```

---

# 3. PERMISOS

## 3.1 Nuevos permisos

```
expedientes.view
expedientes.manage

receipts.view
receipts.manage
```

---

## 3.2 Permisos existentes (mantener)

```
inventory.*
warehouses.*
transfers.*
purchases.*
suppliers.*
deliveries.*
institutions.*
movements.view
reports.view
users.*
```

---

# 4. MODELOS (PRISMA)

---

## 4.1 Expediente

```ts
model Expediente {
  id          String   @id @default(uuid())
  number      String   @unique
  description String?
  status      String
  createdAt   DateTime @default(now())

  purchases   PurchaseOrder[]
  deliveries  Delivery[]
  transfers   WarehouseTransfer[]
  movements   StockMovement[]
}
```

---

## 4.2 PurchaseOrder (modificación)

```ts
expedienteId String?
```

---

## 4.3 Delivery (modificación)

```ts
expedienteId String?
```

---

## 4.4 WarehouseTransfer (modificación)

```ts
expedienteId String?
```

---

## 4.5 StockMovement (reestructuración)

```ts
model StockMovement {
  id            String   @id @default(uuid())
  productId     String
  warehouseId   String?
  type          MovementType
  quantity      Int

  sourceType    String
  sourceId      String

  expedienteId  String?

  createdAt     DateTime @default(now())
}
```

---

## 4.6 PurchaseReceipt (nuevo)

```ts
model PurchaseReceipt {
  id              String   @id @default(uuid())
  purchaseOrderId String
  receiptNumber   String
  date            DateTime
  totalAmount     Decimal
  imageUrl        String?

  expedienteId    String?

  items           PurchaseReceiptItem[]
}
```

---

## 4.7 PurchaseReceiptItem

```ts
model PurchaseReceiptItem {
  id         String @id @default(uuid())
  receiptId  String
  productId  String
  quantity   Int
}
```

---

# 5. REGLAS DE NEGOCIO

---

## 5.1 Expediente

* Campo opcional en todas las operaciones
* Se permite operar sin expediente

---

## 5.2 Movimientos

* Toda operación genera `StockMovement`
* No se permite edición de movimientos

---

## 5.3 Tipos de sourceType

```
PURCHASE
RECEIPT
DELIVERY
TRANSFER
ADJUSTMENT
```

---

## 5.4 Compras

* No afectan stock directamente
* El stock se actualiza en recepción

---

## 5.5 Recepciones

* Incrementan stock
* Generan movimientos tipo IN

---

## 5.6 Entregas

* Reducen stock
* Generan movimientos tipo OUT

---

## 5.7 Transferencias

* Generan:

  * OUT (depósito origen)
  * IN (depósito destino)

---

# 6. ENDPOINTS

---

## 6.1 Expedientes

```
GET    /expedientes
POST   /expedientes
GET    /expedientes/:id
GET    /expedientes/:id/full
```

---

## 6.2 Compras

```
GET    /purchases
POST   /purchases
```

---

## 6.3 Recepciones

```
GET    /receipts
POST   /receipts
```

---

## 6.4 Entregas

```
GET    /deliveries
POST   /deliveries
```

---

## 6.5 Transferencias

```
GET    /transfers
POST   /transfers
```

---

## 6.6 Movimientos

```
GET /movements
```

---

# 7. RESPUESTA /expedientes/:id/full

```json
{
  "expediente": {},
  "purchases": [],
  "receipts": [],
  "deliveries": [],
  "transfers": [],
  "movements": []
}
```

---

# 8. FRONTEND — VISTA EXPEDIENTE

---

## 8.1 Secciones

```
- Header (número, estado, descripción)
- Timeline
- Tabs opcionales:
  - Compras
  - Recepciones
  - Entregas
  - Transferencias
```

---

## 8.2 Timeline

Ordenado por fecha:

```
Compra creada
Recepción registrada
Transferencia realizada
Entrega realizada
```

---

# 9. SIDEBAR (IMPLEMENTACIÓN)

---

## 9.1 Estructura

```ts
[
  {
    label: "Expedientes",
    children: [...]
  },
  {
    label: "Depósito",
    children: [...]
  },
  {
    label: "Compras",
    children: [...]
  },
  {
    label: "Distribución",
    children: [...]
  },
  {
    label: "Control",
    children: [...]
  },
  {
    label: "Configuración",
    children: [...]
  }
]
```

---

# 10. ORDEN DE IMPLEMENTACIÓN

---

## Paso 1

* Crear modelos:

  * Expediente
  * PurchaseReceipt
  * PurchaseReceiptItem

---

## Paso 2

* Modificar:

  * PurchaseOrder
  * Delivery
  * WarehouseTransfer
  * StockMovement

---

## Paso 3

* Ejecutar migración
* Resetear base de datos si aplica

---

## Paso 4

* Implementar endpoints

---

## Paso 5

* Implementar lógica de movimientos

---

## Paso 6

* Implementar endpoint `/expedientes/:id/full`

---

## Paso 7

* Rediseñar sidebar

---

## Paso 8

* Crear vista de expediente (timeline)

---

## Paso 9

* Implementar permisos nuevos

---

# 11. RESULTADO FINAL

Sistema con:

* Trazabilidad completa
* Expedientes opcionales
* Separación por áreas
* Auditoría consistente
* UI simplificada

---
