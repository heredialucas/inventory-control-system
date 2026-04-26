# Explicación de Modelos de Prisma - Gestión de Precios e Inventario

Este documento explica cómo se manejan los precios y montos dentro de los modelos de Prisma para el sistema de control de inventario.

## 1. El Modelo `Product` (Producto)

En el modelo `Product`, existen dos campos principales relacionados con el dinero: `price` y `purchaseAmount`.

### `price` (Precio Unitario / Valuación)
- **Tipo:** `Decimal(10, 2)`
- **Uso:** Representa el **valor por unidad** del producto. Es el precio que se utiliza para valorizar el stock actual en el sistema.
- **En la Interfaz:** Se encuentra en la tarjeta derecha (**Datos del Producto**) bajo el nombre **"Precio por Unidad"**.
- **Importancia:** Es fundamental para reportes de valor de inventario (Stock × Precio).

### `purchaseAmount` (Monto Total de la Compra / Gasto)
- **Tipo:** `Decimal(10, 2)` (Opcional)
- **Uso:** Representa el **desembolso total** realizado para adquirir el lote de productos que se está ingresando. 
- **En la Interfaz:** Se encuentra en la tarjeta izquierda (**Datos de Compra**) bajo el nombre **"Monto Total de la Compra"**.
- **Ejemplo:** Si registras el ingreso de 50 resmas de papel y la factura total fue de $150.000, entonces:
  - `price` = $3.000 (Valor unitario)
  - `purchaseAmount` = $150.000 (Valor total de la operación)

---

## 2. El Ciclo de Compras Avanzado (`PurchaseOrder`)

Aunque el modelo `Product` permite un registro rápido de la compra, el sistema también cuenta con un módulo de **Órdenes de Compra** con mayor trazabilidad:

### `PurchaseOrder.totalAmount`
Es el monto total de toda la orden de compra (puede incluir varios productos diferentes).

### `PurchaseOrderItem.unitPrice`
Es el precio específico al que se compró cada producto en esa transacción. Esto permite al sistema saber si el mismo producto se compró a precios diferentes en distintas fechas.

---

## 3. Resumen de Diferencias y Casos de Uso

| Campo | Modelo | Etiqueta en Pantalla | Propósito |
| :--- | :--- | :--- | :--- |
| **`price`** | `Product` | **Precio por Unidad** | Saber cuánto vale una unidad del producto hoy. |
| **`purchaseAmount`** | `Product` | **Monto Total de la Compra** | Registrar cuánto se pagó en total por ese ingreso específico. |
| **`unitPrice`** | `PurchaseOrderItem` | Precio Unitario (OC) | Registrar el costo pactado con el proveedor por unidad. |
| **`totalAmount`** | `PurchaseOrder` | Total de la Orden | El costo total de una factura con múltiples productos. |

## 4. Estructura del Formulario de Alta

El formulario está dividido para evitar confusiones:

1. **Recuadro Izquierdo (Datos de Compra)**: Enfocado en lo administrativo (Factura, Proveedor, Monto Total, Expediente).
2. **Recuadro Derecho (Datos del Producto)**: Enfocado en lo técnico (Nombre, SKU, Categoría, Precio por Unidad).
3. **Sección Inferior (Stock Inicial)**: Dónde y cuánto está entrando físicamente.

---

## Relaciones Técnicas
- El `inventoryService` utiliza `createProductWithInitialStock` para guardar ambos valores simultáneamente, asegurando que el registro financiero (`purchaseAmount`) y el valor de catálogo (`price`) queden vinculados al producto desde su nacimiento.
- El campo `unit` (Unidad de Medida) es clave: si la unidad es "Caja", el `price` debe ser el precio por caja, no por unidad suelta dentro de la caja.
