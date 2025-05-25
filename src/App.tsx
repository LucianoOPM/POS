import "@/App.css";
import { Switch, Route, Router } from "wouter-preact";
import { useHashLocation } from "wouter-preact/use-hash-location";
import { AuthView } from "@/auth/View";
import { DashboardView } from "@dashboard/View";
import { AppLayout } from "@/Layouts/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "preact/hooks";
import { getSession } from "@/auth/hooks/useAuth";

function App() {
  const auth = useAuthStore((state) => state);
  const [, setLocation] = useHashLocation();
  const [loading, setLoading] = useState(true); // <-- Nuevo estado

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (session) {
          await auth.login(session);
          setLocation("/dashboard");
        } else {
          setLocation("/auth");
        }
      } catch (e) {
        setLocation("/auth");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Cargando...</div>; // <-- No renderiza rutas hasta saber

  return (
    <Router hook={useHashLocation}>
      <AppLayout>
        <Switch>
          <Route path={"/auth"} component={AuthView} />
          <ProtectedRoute>
            <Route path={"/dashboard"} component={DashboardView} />
          </ProtectedRoute>
        </Switch>
      </AppLayout>
    </Router>
  );
}

export default App;
