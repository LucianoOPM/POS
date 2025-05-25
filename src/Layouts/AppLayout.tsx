import React, { FC } from "preact/compat";
import { useHashLocation } from "wouter-preact/use-hash-location";

export interface LayoutProps {
  children: React.ReactNode;
}

export const AppLayout: FC<LayoutProps> = ({ children }) => {
  const [location] = useHashLocation();
  const isAuthPage = location === "/auth";

  return (
    <div className="w-screen h-screen flex flex-col">
      {!isAuthPage && (
        <header className="h-[10%] min-h-[50px] bg-gray-100 shadow">
          <nav>navbar</nav>
        </header>
      )}

      <main
        className={`flex-1 ${isAuthPage ? "h-full" : "h-[80%]"} overflow-auto`}
      >
        <div>{children}</div>
      </main>

      {!isAuthPage && (
        <footer className="h-[10%] min-h-[50px] bg-gray-100 shadow">
          <div>footer</div>
        </footer>
      )}
    </div>
  );
};
