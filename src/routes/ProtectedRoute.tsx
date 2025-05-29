// ProtectedRoute.tsx
import { Route, Redirect } from "wouter-preact";
import { FunctionalComponent } from "preact";
import { useAuthStore } from "@/stores/useAuthStore";
import { AppLayout } from "@/Layouts/AppLayout";

interface ProtectedRouteProps {
  path: string;
  component: FunctionalComponent;
}

export const ProtectedRoute: FunctionalComponent<ProtectedRouteProps> = ({
  path,
  component: Component,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const Wrapped = () => (
    <AppLayout>
      <Component />
    </AppLayout>
  );

  return <Route path={path} component={Wrapped} />;
};
