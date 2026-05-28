import { ComponentChildren } from "preact";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

interface MainLayoutProps {
  children: ComponentChildren;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="shrink-0 h-full overflow-y-auto border-r border-border">
        <Sidebar />
      </aside>

      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border">
          <Navbar />
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
