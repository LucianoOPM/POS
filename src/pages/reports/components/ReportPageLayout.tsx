import { ComponentChildren } from "preact";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-preact";

interface ReportPageLayoutProps {
  title: string;
  description: string;
  filters?: ComponentChildren;
  children: ComponentChildren;
}

export default function ReportPageLayout({
  title,
  description,
  filters,
  children,
}: ReportPageLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <div className="px-6 py-4 bg-white border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/reports")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {filters && <div className="flex items-center gap-3">{filters}</div>}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  );
}
