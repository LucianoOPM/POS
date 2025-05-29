import "@/App.css";
import { Switch, Route, Router } from "wouter-preact";
import { useHashLocation } from "wouter-preact/use-hash-location";
import { AuthView } from "@/auth/View";
import { DashboardView } from "@dashboard/View";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "preact/hooks";
import { ProductsView } from "./products/View";

function App() {
  const setSession = useAuthStore((state) => state.setSession);
  const [, setLocation] = useHashLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await setSession();
      } catch (e) {
        setLocation("/auth");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/auth" component={AuthView} />
        <ProtectedRoute path="/dashboard" component={DashboardView} />
        <ProtectedRoute path="/products" component={ProductsView} />
        <Route>404 - Not Found</Route>
      </Switch>
    </Router>
  );
}

export default App;
