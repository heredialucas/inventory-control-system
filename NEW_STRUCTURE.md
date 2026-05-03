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
| **Expediente** | (Opcional) Documento que agrupa operaciones relacionadas |

---

## 4. Procesos del Negocio

### 4.1 Compras

```
Orden de Compra → Recepción → Ingreso a Stock
```

1. Se registra una orden de compra especificando productos, proveedor y depósito destino
2. Cuando llegan los productos, se registra la recepción
3. El stock se incrementa en el depósito correspondiente

**Importante:** El stock solo se afecta cuando se registra la recepción, no al crear la orden.

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

- **Multi-depósito**: Control de stock por cada ubicación física
- **Trazabilidad completa**: Cada operación genera un registro de movimiento
- **Expediente opcional**: Se puede trabajar con o sin él
- **Control de permisos**: Roles y permisos granulares
- **Múltiples destinatarios**: Instituciones como puntos de entrega
- **Reportes**: Visibilidad del flujo de inventario

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