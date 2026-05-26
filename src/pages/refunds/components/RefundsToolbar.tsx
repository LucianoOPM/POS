import { Plus, Search, Filter, Calendar, X } from "lucide-preact";
import { JSX } from "preact/jsx-runtime";
import { useState } from "preact/hooks";
import { PERMISSIONS } from "@/types";
import { PermissionGate } from "@/components/PermissionGate";
import type { RefundFilters, RefundsToolbarProps } from "@/types/refund";

const PAGE_SIZE_OPTIONS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
];

export default function RefundsToolbar({
  search,
  onSearchChange,
  onCreateNew,
  pageSize,
  onPageSizeChange,
  filters,
  onFiltersChange,
}: RefundsToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof RefundFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setShowFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  // Obtener fecha de hoy formateada
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="px-6 pb-4 space-y-3">
      {/* Barra principal */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Búsqueda */}
          <div className="relative w-80">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                onSearchChange(e.currentTarget.value)
              }
              placeholder="Buscar por motivo o ID de venta..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {/* Selector de tamaño de página */}
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600 whitespace-nowrap">
              Mostrar:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
                onPageSizeChange(Number(e.currentTarget.value))
              }
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-700 cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de filtros */}
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

        {/* Botón nuevo reembolso */}
        <div className="flex gap-3">
          <PermissionGate permission={PERMISSIONS.SALES_REFUND}>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium text-sm shadow-sm"
            >
              <Plus size={18} /> Nuevo Reembolso
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha desde */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.date_from || ""}
                max={filters.date_to || today}
                onChange={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  handleFilterChange("date_from", e.currentTarget.value)
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filters.date_to || ""}
                min={filters.date_from || undefined}
                max={today}
                onChange={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  handleFilterChange("date_to", e.currentTarget.value)
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            {/* Monto mínimo */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Monto mínimo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={filters.min_amount ?? ""}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  onChange={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                    handleFilterChange(
                      "min_amount",
                      e.currentTarget.value ? parseFloat(e.currentTarget.value) : undefined
                    )
                  }
                  className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Monto máximo */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Monto máximo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={filters.max_amount ?? ""}
                  min={filters.min_amount ?? 0}
                  step={0.01}
                  placeholder="0.00"
                  onChange={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                    handleFilterChange(
                      "max_amount",
                      e.currentTarget.value ? parseFloat(e.currentTarget.value) : undefined
                    )
                  }
                  className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                />
              </div>
            </div>
          </div>

          {/* Accesos rápidos de fecha */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500 mr-3">Accesos rápidos:</span>
            <div className="inline-flex gap-2 mt-1">
              <button
                onClick={() => {
                  const today = new Date();
                  const formatted = today.toISOString().split("T")[0];
                  onFiltersChange({ ...filters, date_from: formatted, date_to: formatted });
                }}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              >
                Hoy
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  onFiltersChange({
                    ...filters,
                    date_from: weekAgo.toISOString().split("T")[0],
                    date_to: today.toISOString().split("T")[0],
                  });
                }}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              >
                Última semana
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  onFiltersChange({
                    ...filters,
                    date_from: monthAgo.toISOString().split("T")[0],
                    date_to: today.toISOString().split("T")[0],
                  });
                }}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              >
                Último mes
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  onFiltersChange({
                    ...filters,
                    date_from: firstDayOfMonth.toISOString().split("T")[0],
                    date_to: today.toISOString().split("T")[0],
                  });
                }}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              >
                Este mes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
