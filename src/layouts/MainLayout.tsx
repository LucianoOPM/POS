import { ComponentChildren } from "preact";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

interface MainLayoutProps {
  children: ComponentChildren;
}

/**
 * Layout principal de la aplicación
 * Incluye el sidebar y el contenido principal
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar izquierdo */}
      <aside className="shrink-0 h-full overflow-y-auto border-r border-border">
        <Sidebar />
      </aside>

      {/* Área principal con navbar y contenido */}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        {/* Navbar superior */}
        <div className="shrink-0 border-b border-border">
          <Navbar />
        </div>

        {/* Contenido de la página */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
