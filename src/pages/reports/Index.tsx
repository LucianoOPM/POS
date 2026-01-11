import { useState, useMemo } from "preact/hooks";
import { useLocation } from "wouter";
import { Search } from "lucide-preact";
import { availableReports } from "@/actions/reports";
import ReportCard from "./components/ReportCard";

export default function Index() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState<string>("");

  const reports = availableReports;

  // Filtrar reportes por nombre
  const filteredReports = useMemo(() => {
    if (!search.trim()) return reports;

    const searchLower = search.toLowerCase();
    return reports.filter(
      (report) =>
        report.name.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower)
    );
  }, [reports, search]);

  const handleReportClick = (id: string) => {
    navigate(`/reports/${id}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* Toolbar con filtro */}
      <div className="px-6 py-4 bg-white border-b border-border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar reporte por nombre..."
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Grid de reportes */}
      <div className="flex-1 p-6 overflow-auto">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No se encontraron reportes</h3>
            <p className="text-sm text-muted-foreground">Intenta con otro termino de busqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredReports.map((report) => (
              <div key={report.id} className="group cursor-pointer h-full">
                <ReportCard
                  title={report.name}
                  description={report.description}
                  icon={report.icon}
                  color={report.color}
                  onClick={() => handleReportClick(report.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
