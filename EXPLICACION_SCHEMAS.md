# Explicación de Modelos de Prisma - Sistema de Control de Inventario

Este documento describe todos los modelos de la base de datos del sistema de gestión de inventario, su propósito y relaciones.

---

## 1. Autenticación y Usuarios

### User (Usuario)
Representa a los usuarios del sistema que pueden iniciar sesión y realizar operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `email` | String | Correo electrónico (único) |
| `username` | String | Nombre de usuario (único) |
| `password` | String | Contraseña hasheada |
| `firstName` | String | Nombre |
| `lastName` | String | Apellido |
| `fullName` | String | Nombre completo |
| `isActive` | Boolean | Si el usuario está activo |

**Relaciones:**
- Un usuario puede tener varios roles (`UserRole`)
- Un usuario puede crear órdenes de compra (`PurchaseOrder`)
- Un usuario puede crear entregas (`Delivery`)
- Un usuario puede realizar transferencias (`WarehouseTransfer`)
- Un usuario puede generar movimientos de stock (`StockMovement`)

---

### Role (Rol)
Define roles dentro del sistema (ej: Administrador, Gerente, Encargado).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | String | Nombre del rol (único) |
| `description` | String | Descripción del rol |

**Relaciones:**
- Un rol tiene muchos permisos (`RolePermission`)
- Un rol tiene muchos usuarios (`UserRole`)

---

### Permission (Permiso)
Permisos granulares para controlar acceso a funcionalidades.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `action` | String | Acción (ej: "inventory.create", "reports.view") |
| `description` | String | Descripción del permiso |

---

### UserRole (Usuario-Rol)
Relación muchos a muchos entre usuarios y roles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `userId` | UUID | Referencia al usuario |
| `roleId` | UUID | Referencia al rol |

**Clave única:** `(userId, roleId)` - un usuario no puede tener el mismo rol dos veces.

---

### RolePermission (Rol-Permiso)
Relación muchos a muchos entre roles y permisos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `roleId` | UUID | Referencia al rol |
| `permissionId` | UUID | Referencia al permiso |

**Clave única:** `(roleId, permissionId)` - un rol no puede tener el mismo permiso dos veces.

---

## 2. Gestión de Productos

### Category (Categoría)
Clasifica los productos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | String | Nombre de la categoría (único) |
| `description` | String | Descripción |

**Relaciones:**
- Una categoría tiene muchos productos (`Product`)

---

### Product (Producto)
Representa los artículos que se manejan en el inventario. El stock se gestiona a través de `WarehouseStock`, no hay un campo de stock en este modelo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `sku` | String | Código único del producto |
| `name` | String | Nombre del producto |
| `description` | String | Descripción |
| `price` | Decimal | Precio unitario (para valorizar stock) |
| `unit` | String | Unidad de medida (U, Kg, L, m, etc.) |
| `minStock` | Int | Stock mínimo para alertas |
| `categoryId` | UUID | Categoría del producto |
| `supplierId` | UUID | Proveedor principal (opcional) |
| `deletedAt` | DateTime | soft delete |

**Relaciones:**
- Un producto pertenece a una categoría (`Category`)
- Un producto puede tener un proveedor (`Supplier`)
- Un producto tiene movimientos de stock (`StockMovement`)
- Un producto tiene stock por depósito (`WarehouseStock`)
- Un producto aparece en órdenes de compra (`PurchaseOrderItem`)
- Un producto aparece en entregas (`DeliveryItem`)
- Un producto aparece en recepciones (`PurchaseReceiptItem`)
- Un producto puede ser transferido (`WarehouseTransfer`)

### Diferencia entre `price` y `purchaseAmount`

- **`price`**: Valor por unidad del producto. Se usa para valorizar el stock actual en el sistema (Stock × Price = Valor del inventario).
- **`purchaseAmount`**: Es un monto total de una compra específica. No es un campo del modelo Product, sino que se registra en el momento del ingreso como dato administrativo.

---

## 3. Gestión de Depósitos

### Warehouse (Depósito)
Ubicaciones físicas donde se almacena el inventario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | String | Nombre del depósito |
| `code` | String | Código corto (ej: "WH-01", "DEP-A") |
| `description` | String | Descripción |
| `address` | String | Dirección |
| `isActive` | Boolean | Si el depósito está activo |

**Relaciones:**
- Un depósito tiene muchos items de stock (`WarehouseStock`)
- Un depósito tiene muchos movimientos (`StockMovement`)
- Un depósito puede ser origen de transferencias (`WarehouseTransfer` como `fromWarehouse`)
- Un depósito puede ser destino de transferencias (`WarehouseTransfer` como `toWarehouse`)
- Un depósito recibe órdenes de compra (`PurchaseOrder`)
- Un depósito tiene entregas (`Delivery`)
- Un depósito puede tener recepciones (`PurchaseReceipt`)

---

### WarehouseStock (Stock por Depósito)
Controla la cantidad de cada producto en cada depósito.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `warehouseId` | UUID | Depósito |
| `productId` | UUID | Producto |
| `quantity` | Int | Cantidad en stock |

**Clave única:** `(warehouseId, productId)` - no puede haber dos registros del mismo producto en el mismo depósito.

---

## 4. Compras y Proveedores

### Supplier (Proveedor)
Empresas o personas que suministran productos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | String | Nombre del proveedor |
| `code` | String | Código único del proveedor |
| `email` | String | Correo electrónico |
| `phone` | String | Teléfono |
| `address` | String | Dirección |
| `contactName` | String | Nombre del contacto |
| `notes` | String | Notas |
| `isActive` | Boolean | Si el proveedor está activo |

**Relaciones:**
- Un proveedor tiene muchas órdenes de compra (`PurchaseOrder`)
- Un proveedor tiene muchos productos (`Product`)
- Un proveedor tiene muchas recepciones (`PurchaseReceipt`)

---

### PurchaseOrder (Orden de Compra)
Solicitud de compra a un proveedor.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `orderNumber` | String | Número de orden único |
| `supplierId` | UUID | Proveedor |
| `warehouseId` | UUID | Almacén destino |
| `status` | Enum | Estado (DRAFT, PENDING, RECEIVED, PARTIAL, CANCELLED) |
| `orderDate` | DateTime | Fecha de la orden |
| `expectedDate` | DateTime | Fecha esperada de recepción |
| `receivedDate` | DateTime | Fecha de recepción real |
| `notes` | String | Notas |
| `totalAmount` | Decimal | Monto total de la orden |
| `createdById` | UUID | Usuario que creó la orden |
| `expedienteId` | UUID | Expediente asociado (opcional) |
| `invoiceUrl` | String | URL de la factura del proveedor |
| `creditNoteUrl` | String | URL de nota de crédito |
| `debifNoteUrl` | String | URL de nota de débito |

**Estados:**
- `DRAFT`: Borrador
- `PENDING`: Pendiente de recepción
- `RECEIVED`: Completamente recibida
- `PARTIAL`: Parcialmente recibida
- `CANCELLED`: Cancelada

**Nota importante:** La orden de compra es un flujo **independiente** de la recepción. El usuario de compras:
- Crea y cancela órdenes de compra
- Adjunta documentos (factura, notas de crédito/débito)
- NO carga remitos - eso lo hace el usuario de depósito

**Relaciones:**
- Una orden pertenece a un proveedor (`Supplier`)
- Una orden pertenece a un almacén (`Warehouse`)
- Una orden tiene muchos items (`PurchaseOrderItem`)
- Una orden es creada por un usuario (`User`)
- Una orden puede estar asociada a un expediente (`Expediente`)
- Una orden puede tener muchas recepciones (`PurchaseReceipt`)

---

### PurchaseOrderItem (Item de Orden de Compra)
Productos específicos dentro de una orden de compra.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `purchaseOrderId` | UUID | Orden de compra |
| `productId` | UUID | Producto |
| `quantity` | Int | Cantidad solicitada |
| `receivedQty` | Int | Cantidad recibida |
| `unitPrice` | Decimal | Precio unitario pactado |

---

### PurchaseReceipt (Recepción de Compra)
Documento que registra la recepción física de productos comprados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `purchaseOrderId` | UUID | Orden de compra asociada (opcional) |
| `receiptNumber` | String | Número de recibo único |
| `date` | DateTime | Fecha de recepción |
| `totalAmount` | Decimal | Monto total recibido |
| `imageUrl` | String | Imagen de la factura/recibo |
| `type` | String | Tipo (PURCHASE o REINGRESO) |
| `warehouseId` | UUID | Depósito que recibe |
| `expedienteId` | UUID | Expediente asociado (opcional) |
| `supplierId` | UUID | Proveedor (opcional) |

**Relaciones:**
- Una recepción puede связаться con una orden de compra (`PurchaseOrder`)
- Una recepción pertenece a un depósito (`Warehouse`)
- Una recepción puede estar asociada a un expediente (`Expediente`)
- Una recepción puede tener un proveedor (`Supplier`)
- Una recepción tiene muchos items (`PurchaseReceiptItem`)

---

### PurchaseReceiptItem (Item de Recepción)
Productos específicos en una recepción.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `receiptId` | UUID | Recepción |
| `productId` | UUID | Producto |
| `quantity` | Int | Cantidad recibida |

---

## 5. Distribución y Entregas

### Institution (Institución)
Entidades que reciben productos (escuelas, hospitales, organizaciones).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | String | Nombre de la institución |
| `code` | String | Código único |
| `type` | String | Tipo (School, Hospital, Charity, etc.) |
| `contactName` | String | Nombre del contacto |
| `email` | String | Correo |
| `phone` | String | Teléfono |
| `address` | String | Dirección |
| `notes` | String | Notas |
| `isActive` | Boolean | Si la institución está activa |

**Relaciones:**
- Una institución tiene muchas entregas (`Delivery`)

---

### Delivery (Entrega)
Envío de productos a una institución.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `deliveryNumber` | String | Número de entrega único |
| `institutionId` | UUID | Institución destino |
| `warehouseId` | UUID | Depósito origen |
| `status` | Enum | Estado (DRAFT, CONFIRMED, DELIVERED, CANCELLED) |
| `deliveryDate` | DateTime | Fecha de entrega |
| `receivedBy` | String | Persona que recibió |
| `notes` | String | Notas |
| `createdById` | UUID | Usuario que creó la entrega |
| `expedienteId` | UUID | Expediente asociado (opcional) |

**Estados:**
- `DRAFT`: Borrador
- `CONFIRMED`: Confirmada
- `DELIVERED`: Entregada
- `CANCELLED`: Cancelada

**Relaciones:**
- Una entrega pertenece a una institución (`Institution`)
- Una entrega pertenece a un depósito (`Warehouse`)
- Una entrega tiene muchos items (`DeliveryItem`)
- Una entrega es creada por un usuario (`User`)
- Una entrega puede estar asociada a un expediente (`Expediente`)

---

### DeliveryItem (Item de Entrega)
Productos específicos en una entrega.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `deliveryId` | UUID | Entrega |
| `productId` | UUID | Producto |
| `quantity` | Int | Cantidad entregada |

---

## 6. Movimientos de Stock

### StockMovement (Movimiento de Stock)
Registro de cada operación que afecta el inventario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `productId` | UUID | Producto |
| `warehouseId` | UUID | Depósito (opcional) |
| `type` | Enum | Tipo (IN, OUT, ADJUSTMENT) |
| `quantity` | Int | Cantidad del movimiento |
| `reason` | String | Razón del movimiento |
| `sourceType` | String | Origen del movimiento (PURCHASE, RECEIPT, DELIVERY, TRANSFER, ADJUSTMENT) |
| `sourceId` | UUID | ID del documento origen |
| `expedienteId` | UUID | Expediente asociado (opcional) |
| `userId` | UUID | Usuario que generó el movimiento |

**Tipos de movimiento:**
- `IN`: Entrada (aumenta stock)
- `OUT`: Salida (reduce stock)
- `ADJUSTMENT`: Ajuste (puede aumentar o disminuir)

**sourceType posibles:**
- `PURCHASE`: Orden de compra
- `RECEIPT`: Recepción de compra
- `DELIVERY`: Entrega
- `TRANSFER`: Transferencia entre depósitos
- `ADJUSTMENT`: Ajuste manual

**Relaciones:**
- Un movimiento pertenece a un producto (`Product`)
- Un movimiento puede pertenece a un depósito (`Warehouse`)
- Un movimiento puede estar asociado a un expediente (`Expediente`)
- Un movimiento es creado por un usuario (`User`)

---

## 7. Transferencias entre Depósitos

### WarehouseTransfer (Transferencia)
Movimiento de productos entre depósitos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `fromWarehouseId` | UUID | Depósito origen |
| `toWarehouseId` | UUID | Depósito destino |
| `productId` | UUID | Producto |
| `quantity` | Int | Cantidad transferida |
| `status` | Enum | Estado (PENDING, IN_TRANSIT, COMPLETED, CANCELLED) |
| `notes` | String | Notas |
| `userId` | UUID | Usuario que creó la transferencia |
| `expedienteId` | UUID | Expediente asociado (opcional) |
| `createdAt` | DateTime | Fecha de creación |
| `completedAt` | DateTime | Fecha de completación |

**Estados:**
- `PENDING`: Pendiente
- `IN_TRANSIT`: En tránsito
- `COMPLETED`: Completada
- `CANCELLED`: Cancelada

**Relaciones:**
- Una transferencia tiene un depósito origen (`Warehouse` como `fromWarehouse`)
- Una transferencia tiene un depósito destino (`Warehouse` como `toWarehouse`)
- Una transferencia envolve un producto (`Product`)
- Una transferencia es creada por un usuario (`User`)
- Una transferencia puede estar asociada a un expediente (`Expediente`)

---

## 8. Expedientes

### Expediente (Case File)
Documento central que puede agrupar todas las operaciones relacionadas con una gestión específica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `number` | String | Número de expediente (único) |
| `year` | Int | Año del expediente |
| `type` | String | Tipo de expediente |
| `origin` | String | Origen del expediente |
| `description` | String | Descripción |
| `status` | String | Estado |

**Nota:** El expediente es **opcional** en todas las operaciones. Se puede trabajar sin expediente.

**Relaciones:**
- Un expediente puede tener muchas órdenes de compra (`PurchaseOrder`)
- Un expediente puede tener muchas entregas (`Delivery`)
- Un expediente puede tener muchas transferencias (`WarehouseTransfer`)
- Un expediente puede tener muchos movimientos (`StockMovement`)
- Un expediente puede tener muchas recepciones (`PurchaseReceipt`)

---

## 9. Flujo de Operaciones

### Ciclo de Compras (Gestionado por usuario de COMPRAS)
```
PurchaseOrder → Documentos (Factura/Nota) → (opcional) → Cancelar
```

1. Se crea una **Orden de Compra** con los productos solicitados
2. Se adjuntan documentos: factura, nota de crédito, nota de débito
3. La orden puede cancelarse en cualquier momento
4. **La recepción de productos es un flujo separado** realizado por el usuario de depósito

### Ciclo de Recepciones (Gestionado por usuario de DEPÓSITO)
```
PurchaseReceipt → StockMovement (IN)
```

1. El usuario de depósito registra la recepción (remito)
2. La recepción genera un **Movimiento de Stock** de tipo IN (entrada)
3. El stock se incrementa en el almacén destino
4. La recepción puede vincularse a una orden de compra existente

### Ciclo de Entregas
```
Delivery → StockMovement (OUT)
```

1. Se crea una **Entrega** specifying los productos y la institución destino
2. Al confirmar la entrega, se genera un **Movimiento de Stock** de tipo OUT (salida)
3. El stock se decrementa en el depósito origen

### Transferencias
```
WarehouseTransfer → StockMovement (OUT) + StockMovement (IN)
```

1. Se crea una **Transferencia** entre dos depósitos
2. Al completarse, se generan dos movimientos:
   - OUT en el depósito origen
   - IN en el depósito destino

### Expedientes (Opcional)
Cualquier operación puede vincularse a un expediente para trazabilidad:
- Compra → Expediente
- Recepción → Expediente
- Entrega → Expediente
- Transferencia → Expediente

---

## 10. Resumen de Relaciones

```
User
  ├── UserRole → Role → RolePermission → Permission
  ├── PurchaseOrder
  ├── Delivery
  ├── WarehouseTransfer
  └── StockMovement

Warehouse
  ├── WarehouseStock → Product
  ├── StockMovement
  ├── WarehouseTransfer (from/to)
  ├── PurchaseOrder
  ├── Delivery
  └── PurchaseReceipt

Product
  ├── Category
  ├── Supplier
  ├── WarehouseStock
  ├── PurchaseOrderItem
  ├── DeliveryItem
  ├── PurchaseReceiptItem
  └── StockMovement

Supplier
  ├── Product
  ├── PurchaseOrder
  └── PurchaseReceipt

Institution
  └── Delivery

Expediente (opcional)
  ├── PurchaseOrder
  ├── PurchaseReceipt
  ├── Delivery
  ├── WarehouseTransfer
  └── StockMovement
```