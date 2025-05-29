import { useHashLocation } from "wouter-preact/use-hash-location";
import { NavBar } from "@/components/NavBar";
import { ComponentChildren } from "preact";

interface AppLayoutProps {
  children: ComponentChildren;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [location] = useHashLocation();
  const isAuthPage = location === "/auth";

  return (
    <div className="w-screen h-screen flex flex-col bg-neutral-600">
      {!isAuthPage && (
        <header className="h-[10%]">
          <NavBar />
        </header>
      )}

      <main
        className={`flex-1 overflow-auto ${isAuthPage ? "h-full" : "h-[90%]"}`}
      >
        {children}
      </main>
    </div>
  );
};
