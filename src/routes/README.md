# Sistema de Rutas

Este directorio contiene la configuración centralizada de rutas de la aplicación usando **wouter**.

## Estructura

```
src/
├── routes/
│   ├── index.tsx          # Configuración de rutas y componente AppRoutes
│   └── README.md          # Este archivo
├── layouts/
│   ├── MainLayout.tsx     # Layout con sidebar (rutas protegidas)
│   └── AuthLayout.tsx     # Layout sin sidebar (login, etc.)
└── pages/
    ├── Login.tsx          # Página de login
    ├── Sales.tsx          # Página de ventas
    └── ...                # Otras páginas
```

## Cómo funciona

### 1. Configuración de Rutas (`routes/index.tsx`)

Todas las rutas se configuran en el array `routes`:

```tsx
export const routes: RouteConfig[] = [
  {
    path: "/login",
    component: Login,
    layout: "auth",         // Sin sidebar
    requireAuth: false,     // No requiere autenticación
    title: "Iniciar Sesión",
  },
  {
    path: "/",
    component: Sales,
    layout: "main",         // Con sidebar
    requireAuth: true,      // Requiere autenticación
    title: "Ventas",
  },
];
```

### 2. Layouts

**MainLayout** (`layouts/MainLayout.tsx`):
- Incluye el sidebar (importado directamente)
- Usado para rutas protegidas del sistema POS
- El sidebar se importa automáticamente, no se pasa por props

**AuthLayout** (`layouts/AuthLayout.tsx`):
- Pantalla completa sin sidebar
- Usado para login y páginas públicas

### 3. Protección de Rutas

El sistema maneja automáticamente:
- ✅ Redirección a `/login` si se intenta acceder a rutas protegidas sin autenticación
- ✅ Redirección a `/` si un usuario autenticado intenta acceder a `/login`
- ✅ Página 404 para rutas no encontradas

## Cómo agregar una nueva ruta

### Paso 1: Crear la página

```tsx
// src/pages/Products.tsx
export default function Products() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Productos</h1>
      {/* Contenido de la página */}
    </div>
  );
}
```

### Paso 2: Agregar la ruta

En `src/routes/index.tsx`:

```tsx
// 1. Importar la página
import Products from "@/pages/Products";

// 2. Agregar a la configuración de rutas
export const routes: RouteConfig[] = [
  // ... rutas existentes
  {
    path: "/products",
    component: Products,
    layout: "main",        // Usa MainLayout (con sidebar)
    requireAuth: true,     // Requiere estar autenticado
    title: "Productos",
  },
];
```

¡Listo! La ruta estará disponible automáticamente.

## Navegación

### Con el componente Link de wouter:

```tsx
import { Link } from "wouter";

<Link href="/products">
  <a className="text-blue-500 hover:underline">
    Ir a Productos
  </a>
</Link>
```

### Con navegación programática:

```tsx
import { useLocation } from "wouter";

function MyComponent() {
  const [, setLocation] = useLocation();

  const goToProducts = () => {
    setLocation("/products");
  };

  return <button onClick={goToProducts}>Ver Productos</button>;
}
```

### Con enlaces nativos (recarga la página):

```tsx
<a href="/products">Productos</a>
```

## Integración con Sidebar

Cuando crees tu componente Sidebar:

1. Créalo en `src/components/Sidebar.tsx`
2. Importa `useLocation` de wouter para saber la ruta activa
3. Descomenta la importación en `src/layouts/MainLayout.tsx`

```tsx
// src/layouts/MainLayout.tsx
import Sidebar from "@/components/Sidebar"; // ← Descomentar

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-background)]">
      <aside className="flex-shrink-0 h-full overflow-y-auto border-r border-[var(--color-border)]">
        <Sidebar /> {/* ← Descomentar */}
      </aside>
      {/* ... */}
    </div>
  );
}
```

Ejemplo de Sidebar con rutas activas:

```tsx
import { useLocation } from "wouter";
import { routes } from "@/routes";

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <nav className="w-64 p-4">
      {routes
        .filter(route => route.layout === "main") // Solo rutas del main
        .map(route => (
          <a
            key={route.path}
            href={route.path}
            className={`block p-3 rounded-lg ${
              location === route.path
                ? "bg-[var(--color-primary-500)] text-white"
                : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
            }`}
          >
            {route.title}
          </a>
        ))}
    </nav>
  );
}
```

## Autenticación

Para implementar autenticación real:

1. Crea un hook `useAuth()` que verifique el estado de sesión
2. Reemplaza `const isAuthenticated = false;` en `routes/index.tsx`:

```tsx
// src/routes/index.tsx
import { useAuth } from "@/hooks/useAuth";

export default function AppRoutes() {
  const isAuthenticated = useAuth(); // ← Tu hook personalizado
  // ...
}
```

Ejemplo de hook de autenticación:

```tsx
// src/hooks/useAuth.ts
import { useState, useEffect } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar sesión con el backend de Rust
    invoke("get_session")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  return isAuthenticated;
}
```

## Variables CSS personalizadas

El sistema usa las variables CSS definidas en `App.css`:

- `--color-background`
- `--color-surface`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-border`
- `--color-primary-*`

Estas variables cambian automáticamente con el modo oscuro.
