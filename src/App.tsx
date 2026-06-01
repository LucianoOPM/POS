import AppRoutes from "@/routes";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster richColors position="bottom-right" />
    </>
  );
}

export default App;
