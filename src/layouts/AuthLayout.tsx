import { ComponentChildren } from "preact";

interface AuthLayoutProps {
  children: ComponentChildren;
}

/**
 * Layout para páginas de autenticación
 * Pantalla completa sin sidebar ni navegación
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}
