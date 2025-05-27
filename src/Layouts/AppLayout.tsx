import React, { FC } from "preact/compat";
import { useHashLocation } from "wouter-preact/use-hash-location";
import { NavBar } from "@/components/NavBar";

export interface LayoutProps {
  children: React.ReactNode;
}

export const AppLayout: FC<LayoutProps> = ({ children }) => {
  const [location] = useHashLocation();
  const isAuthPage = location === "/auth";

  return (
    <div className="w-screen h-screen flex flex-col">
      {!isAuthPage && (
        <header>
          <section>
            <NavBar />
          </section>
        </header>
      )}

      <main
        className={`flex-1  ${isAuthPage ? "h-full" : "h-[80%]"} overflow-auto`}
      >
        <div>{children}</div>
      </main>
    </div>
  );
};
