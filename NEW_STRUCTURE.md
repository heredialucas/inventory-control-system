# Visión General - Sistema de Control de Inventario

---

## 1. Qué es el Sistema

Sistema de gestión de inventario para organizaciones que necesitan:
- Controlar stock de productos en múltiples depósitos
- Registrar compras a proveedores
- Distribuir productos a instituciones
- Mantener trazabilidad completa de operaciones

---

## 2. Para quién está diseñado

Organizaciones que:
- Manejan inventario en varios depósitos o almacenes
- Compran productos a proveedores externos
- Distribuyen productos a múltiples instituciones (escuelas, hospitales, organizaciones)
- Necesitan trazabilidad de todas las operaciones
- Requieren control de permisos por roles

---

## 3. Modelo de Negocio

### Actores Principales

| Actor | Descripción |
|-------|-------------|
| **Usuario** | Personas que usan el sistema (empleados, administradores) |
| **Proveedor** | Empresas que venden productos |
| **Institución** | Organizaciones que reciben productos (destinatarios) |

### Elementos Centrales

| Elemento | Descripción |
|----------|-------------|
| **Producto** | Artículos que se compran, almacenan y distribuyen |
| **Depósito** | Lugares físicos donde se almacena el inventario |
| **WarehouseStock** | Control de stock por producto y depósito (no existe campo stock en Product) |
| **Expediente** | (Opcional) Documento que agrupa operaciones relacionadas |

---

## 4. Procesos del Negocio

### 4.1 Compras

```
Orden de Compra → Documentos (Factura/Nota) → Cancelar si es necesario
```

La gestión de compras es un flujo **independiente** del flujo de recepción de depósito:

1. Se registra una orden de compra especificando productos, proveedor y almacén destino
2. Se pueden adjuntar documentos: factura del proveedor, nota de crédito, nota de débito
3. La orden se puede cancelar en cualquier momento (si está en estado DRAFT o activa)
4. El usuario de compras **NO** carga remitos - eso es responsabilidad del depósito

**La recepción (remito/ingreso) es un flujo separado** que realiza el usuario de depósito.

---

### 4.2 Distribución

```
Entrega → Salida de Stock
```

1. Se registra una entrega especificando productos, institución destino y depósito origen
2. Al confirmar la entrega, el stock se decrementa

---

### 4.3 Transferencias

```
Depósito A → Transferencia → Depósito B
```

1. Se registra una transferencia de productos entre dos depósitos
2. El stock disminuye en el depósito origen y aumenta en el destino

---

### 4.4 Expedientes (Opcional)

Cada operación puede vincularse a un expediente para mantener trazabilidad agrupada:
- Una compra puede estar asociada a un expediente
- Una entrega puede estar asociada a un expediente
- Una transferencia puede estar asociada a un expediente
- Un expediente puede agrupar múltiples operaciones

**El expediente es completamente opcional.** Se puede trabajar sin él.

---

## 5. Estructura del Sistema

### 5.1 Módulos Principales

| Módulo | Descripción |
|--------|-------------|
| **Expedientes** | Gestión de casos (opcional) |
| **Depósito** | Inventario, depósitos, transferencias, movimientos |
| **Compras** | Órdenes de compra, proveedores, recepciones |
| **Distribución** | Entregas, instituciones |
| **Control** | Movimientos, reportes |
| **Configuración** | Usuarios, roles |

---

## 6. Permisos y Roles

El sistema maneja permisos granulares por roles. Ejemplos:
- Administrador: acceso completo
- Gerente: gestiona compras e inventario
- Encargado de depósitos: transfiere y controla stock
- Operario: registra entregas

---

## 7. Flujo de Trazabilidad

### Entrada de Productos
```
Compra → Recepción → Movimiento (IN) → Stock
```

### Salida de Productos
```
Entrega → Movimiento (OUT) → Stock
```

### Transferencia
```
Transferencia → Movimiento (OUT origen) + Movimiento (IN destino)
```

### Expediente
```
Expediente → [Compras] + [Recepciones] + [Entregas] + [Transferencias]
```

---

## 8. Características Clave

- **Multi-depósito**: Control de stock por cada ubicación física (WarehouseStock)
- **Trazabilidad completa**: Cada operación genera un registro de movimiento
- **Expediente opcional**: Se puede trabajar con o sin él
- **Control de permisos**: Roles y permisos granulares
- **Múltiples destinatarios**: Instituciones como puntos de entrega
- **Reportes**: Visibilidad del flujo de inventario
- **Gestión de Stock por WarehouseStock**: El stock NO está en el modelo Product, sino en WarehouseStock (tabla relacional producto-depósito)

### 8.1 Gestión de Stock

El sistema no usa un campo `stock` en el modelo Product. En su lugar, usa `WarehouseStock`:

- Cada registro representa cuánto stock hay de un producto en un depósito específico
- Al hacer un ingreso (remito), se crea/actualiza un registro en WarehouseStock
- Al hacer una entrega, se decrementa el stock en WarehouseStock
- Al hacer una transferencia, se decrementa en origen y se incrementa en destino

### 8.2 Gestión de Productos en Ingresos

Al realizar un ingreso de mercadería (remito), el sistema permite:

- **Seleccionar productos existentes**: Se listan todos los productos (con stock o sin stock)
- **Ver stock actual**: En el dropdown se muestra el stock actual de cada producto (suma de todos los depósitos)
- **Crear productos nuevos**: Si el producto no existe, se puede crear directamente desde el formulario
- **Aumentar stock**: Al seleccionar un producto existente, el stock se incrementa automáticamente

---

## 9. Objetivo del Sistema

Proporcionar una herramienta que permita:
1. **Controlar** el inventario en múltiples depósitos
2. **Registrar** compras a proveedores con trazabilidad
3. **Distribuir** productos a instituciones de forma organizada
4. **Rastrear** cada operación mediante movimientos de stock
5. **Agrupar** operaciones en expedientes (opcional)
6. **Gestionar** permisos y accesos por roles

---

## 10. Alcance

Este sistema NO cubre:
- Contabilidad financiera (solo valorización de inventario)
- Facturación electrónica
- Gestión de producción
- CRM completo

Este sistema SI cubre:
- Gestión de inventario multi-depósito
- Compras y recepciones
- Distribución a instituciones
- Transferencias
- Movimientos y trazabilidad
- Permisos y usuarios
- Expedientes opcionales