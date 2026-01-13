import { Route, Switch, Redirect, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ComponentChildren, JSX } from "preact";
import { useEffect } from "preact/hooks";
import { useAuthStore } from "@/store/authStore";
import { PERMISSIONS } from "@/types/permissions";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Pages
import Login from "@/pages/Login";
import Sales from "@/pages/sales/Index";
import Inventory from "@/pages/inventory/Index";
import Reports from "@/pages/reports/Index";
import Users from "@/pages/users/Index";

// Report Views
import DashboardReport from "@/pages/reports/views/DashboardReport";
import SalesOverTimeReport from "@/pages/reports/views/SalesOverTimeReport";
import ProductReport from "@/pages/reports/views/ProductReport";
import CategoryReport from "@/pages/reports/views/CategoryReport";
import PaymentMethodReport from "@/pages/reports/views/PaymentMethodReport";
import RefundsReport from "@/pages/reports/views/RefundsReport";

// Tipos
interface RouteConfig {
  path: string;
  component: () => JSX.Element;
  layout: "main" | "auth";
  requireAuth?: boolean;
  title?: string;
  requiredPermission?: string;
  requiredAnyPermission?: string[];
}

/**
 * Configuración centralizada de rutas
 * Facilita agregar nuevas rutas y mantener la consistencia
 */
export const routes: RouteConfig[] = [
  {
    path: "/login",
    component: Login,
    layout: "auth",
    requireAuth: false,
    title: "Iniciar Sesión",
  },
  {
    path: "/",
    component: Sales,
    layout: "main",
    requireAuth: true,
    requiredPermission: PERMISSIONS.SALES_CREATE,
    title: "Ventas",
  },
  {
    path: "/inventory",
    component: Inventory,
    layout: "main",
    requireAuth: true,
    requiredPermission: PERMISSIONS.PRODUCTS_VIEW,
    title: "Inventario",
  },
  {
    path: "/users",
    component: Users,
    layout: "main",
    requireAuth: true,
    requiredPermission: PERMISSIONS.USERS_VIEW,
    title: "Usuarios",
  },
  {
    path: "/reports",
    component: Reports,
    layout: "main",
    requireAuth: true,
    requiredAnyPermission: [
      PERMISSIONS.REPORTS_SALES,
      PERMISSIONS.REPORTS_INVENTORY,
      PERMISSIONS.REPORTS_FINANCIAL,
    ],
    title: "Reportes",
  },
  {
    path: "/reports/dashboard",
    component: DashboardReport,
    layout: "main",
    requireAuth: true,
    requiredAnyPermission: [PERMISSIONS.REPORTS_SALES, PERMISSIONS.REPORTS_FINANCIAL],
    title: "Dashboard Ejecutivo",
  },
  {
    path: "/reports/sales-over-time",
    component: SalesOverTimeReport,
    layout: "main",
    requireAuth: true,
    requiredPermission: PERMISSIONS.REPORTS_SALES,
    title: "Ventas en el Tiempo",
  },
  {
    path: "/reports/products",
    component: ProductReport,
    layout: "main",
    requireAuth: true,
    requiredAnyPermission: [PERMISSIONS.REPORTS_SALES, PERMISSIONS.REPORTS_INVENTORY],
    title: "Reporte por Producto",
  },
  {
    path: "/reports/categories",
    component: CategoryReport,
    layout: "main",
    requireAuth: true,
    requiredAnyPermission: [PERMISSIONS.REPORTS_SALES, PERMISSIONS.REPORTS_INVENTORY],
    title: "Reporte por Categoria",
  },
  {
    path: "/reports/payment-methods",
    component: PaymentMethodReport,
    layout: "main",
    requireAuth: true,
    requiredPermission: PERMISSIONS.REPORTS_FINANCIAL,
    title: "Metodos de Pago",
  },
  {
    path: "/reports/refunds",
    component: RefundsReport,
    layout: "main",
    requireAuth: true,
    requiredAnyPermission: [PERMISSIONS.REPORTS_SALES, PERMISSIONS.REPORTS_FINANCIAL],
    title: "Reporte de Reembolsos",
  },
];

interface LayoutWrapperProps {
  layout: "main" | "auth";
  children: ComponentChildren;
}

/**
 * Componente wrapper que aplica el layout correcto
 */
function LayoutWrapper({ layout, children }: LayoutWrapperProps) {
  if (layout === "auth") {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
}

/**
 * Componente para mostrar cuando el usuario no tiene permisos
 */
function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <p className="text-xl text-secondary-600 mb-8">
          No tiene permisos para acceder a esta pagina
        </p>
        <a
          href="/#/"
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

/**
 * Componente principal de rutas
 * Renderiza todas las rutas configuradas con sus respectivos layouts
 */
export default function AppRoutes() {
  const { isAuthenticated, isLoading, checkAuth, hasPermission, hasAnyPermission } = useAuthStore();

  // Verificar autenticación al iniciar la app
  useEffect(() => {
    checkAuth();
  }, []);

  // Mostrar loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router hook={useHashLocation}>
      <Switch>
        {routes.map((route) => (
          <Route key={route.path} path={route.path}>
            {() => {
              // Si la ruta requiere autenticación y el usuario no está autenticado
              if (route.requireAuth && !isAuthenticated) {
                return <Redirect to="/login" />;
              }

              // Si el usuario está autenticado e intenta acceder al login
              if (route.path === "/login" && isAuthenticated) {
                return <Redirect to="/" />;
              }

              // Verificar permiso único
              if (route.requiredPermission && !hasPermission(route.requiredPermission)) {
                return <AccessDenied />;
              }

              // Verificar al menos uno de los permisos
              if (route.requiredAnyPermission && !hasAnyPermission(route.requiredAnyPermission)) {
                return <AccessDenied />;
              }

              const PageComponent = route.component;

              return (
                <LayoutWrapper layout={route.layout}>
                  <PageComponent />
                </LayoutWrapper>
              );
            }}
          </Route>
        ))}

        {/* Ruta 404 - No encontrada */}
        <Route>
          {() => (
            <div className="flex items-center justify-center h-screen bg-background">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-950 mb-4">404</h1>
                <p className="text-xl text-secondary-600 mb-8">Página no encontrada</p>
                <a
                  href="/#/"
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Volver al inicio
                </a>
              </div>
            </div>
          )}
        </Route>
      </Switch>
    </Router>
  );
}
