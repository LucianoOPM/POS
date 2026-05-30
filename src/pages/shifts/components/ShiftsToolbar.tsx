import { Search, Filter, Calendar, X } from "lucide-preact";
import { JSX } from "preact/jsx-runtime";
import { useState } from "preact/hooks";
import type { ShiftFilters } from "@/types/shift";

const PAGE_SIZE_OPTIONS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
];

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Abierto" },
  { value: "PENDING_CLOSURE", label: "Pendiente de cierre" },
  { value: "CLOSED", label: "Cerrado" },
  { value: "VOIDED", label: "Anulado" },
] as const;

interface ShiftsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  pageSize: number;
  onPageSizeChange: (v: number) => void;
  filters: ShiftFilters;
  onFiltersChange: (f: ShiftFilters) => void;
}

export default function ShiftsToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  filters,
  onFiltersChange,
}: ShiftsToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof ShiftFilters, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value === "" ? undefined : value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setShowFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="px-6 pb-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Búsqueda */}
          <div className="relative w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                onSearchChange(e.currentTarget.value)
              }
              placeholder="Buscar por ID o usuario..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {/* Tamaño de página */}
          <div className="flex items-center gap-2">
            <label htmlFor="shiftsPageSize" className="text-sm text-gray-600 whitespace-nowrap">
              Mostrar:
            </label>
            <select
              id="shiftsPageSize"
              value={pageSize}
              onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
                onPageSizeChange(Number(e.currentTarget.value))
              }
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-700 cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              hasActiveFilters
                ? "bg-primary-50 border-primary-300 text-primary-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter size={16} />
            Filtros
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-primary-500 text-white rounded-full">
                {Object.values(filters).filter((v) => v !== undefined && v !== "").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={16} />
              Filtros de búsqueda
            </h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de fecha */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha de apertura
              </label>
              <input
                type="date"
                value={filters.date || ""}
                max={today}
                onChange={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  handleFilterChange("date", e.currentTarget.value)
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            {/* Filtro de estado */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estado
              </label>
              <select
                value={filters.status || ""}
                onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
                  handleFilterChange("status", e.currentTarget.value as ShiftFilters["status"])
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              >
                <option value="">Todos los estados</option>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500 mr-3">Accesos rápidos:</span>
            <div className="inline-flex gap-2 mt-1">
              <button
                onClick={() => onFiltersChange({ ...filters, date: today })}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              >
                Hoy
              </button>
              <button
                onClick={() => onFiltersChange({ ...filters, date: undefined })}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              >
                Todos los días
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
