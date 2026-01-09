# Tipos TypeScript Centralizados

Este directorio contiene todos los tipos TypeScript del proyecto organizados por feature/dominio.

## Estructura

```
types/
├── auth.ts         # Tipos de autenticación y sesión
├── cart.ts         # Tipos de carrito y ventas
├── category.ts     # Tipos de categorías
├── inventory.ts    # Tipos de inventario y filtros
├── product.ts      # Tipos de productos
├── ui.ts           # Tipos de componentes UI compartidos
└── index.ts        # Barrel export (importar desde @/types)
```

## Uso

### Importar tipos específicos:
```typescript
import type { Product, NewProduct } from "@/types";
```

### Importar múltiples tipos:
```typescript
import type {
  Product,
  Category,
  InventoryFilters,
  PaginationProps
} from "@/types";
```

## Archivos pendientes de actualizar

Los siguientes archivos aún usan tipos locales y deben actualizarse para importar desde `@/types`:

### Módulo Sales:
- [ ] `src/pages/sales/components/SalesView.tsx`
- [ ] `src/pages/sales/components/ProductCard.tsx`
- [ ] `src/pages/sales/components/ProductList.tsx`
- [ ] `src/pages/sales/components/CardItemRow.tsx`
- [ ] `src/pages/sales/components/CategoriesTags.tsx`
- [ ] `src/pages/sales/components/SearchForm.tsx`

### Routes y Layouts:
- [ ] `src/routes/index.tsx` - Importar `RouteConfig` desde `@/types`
- [ ] `src/layouts/MainLayout.tsx` - Props específicos, dejar local
- [ ] `src/layouts/AuthLayout.tsx` - Props específicos, dejar local

### Components:
- [ ] `src/components/NavItem.tsx` - Props específicos, dejar local

## Convenciones

### Tipos de Props de componentes:
- **Componentes compartidos/reutilizables**: Definir tipos en `@/types/ui.ts`
  - Ejemplo: `PaginationProps`, `SortIconProps`

- **Componentes específicos**: Dejar tipos locales en el archivo del componente
  - Ejemplo: Props de `NavItem`, `MainLayout`, etc.

### Tipos de dominio:
- Siempre en archivos separados por feature
- Usar nombres descriptivos y exportar con `export interface` o `export type`

### Formato de nombres:
- **Interfaces de datos**: `Product`, `Category`, `User`
- **Interfaces de acciones**: `NewProduct`, `UpdateProduct`
- **Interfaces de estado**: `AuthState`, `InventoryFilters`
- **Tipos de componentes**: `ProductCardProps`, `NavItemProps`

## Migración

Para migrar un archivo que usa tipos locales:

1. Identificar los tipos definidos localmente
2. Verificar si ya existen en `@/types`
3. Si no existen, agregarlos al archivo correspondiente
4. Actualizar imports en el archivo original
5. Eliminar definiciones locales duplicadas

### Ejemplo de migración:

**Antes:**
```typescript
// ProductList.tsx
interface Product {
  id: number;
  name: string;
  price: number;
}

interface Props {
  products: Product[];
}
```

**Después:**
```typescript
// ProductList.tsx
import type { Product } from "@/types";

interface Props {
  products: Product[];
}
```
