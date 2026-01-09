import { X } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { InventoryFilters, Category, StockStatusType } from "@/types";

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  availableCategories: Category[];
  buttonRef: { current: HTMLElement | null };
}

const STOCK_STATUS_OPTIONS: { id: StockStatusType; label: string; description: string }[] = [
  { id: "optimal", label: "Óptimo", description: "Stock >= 10" },
  { id: "low", label: "Bajo", description: "Stock entre 1-9" },
  { id: "out", label: "Agotado", description: "Stock = 0" },
];

export default function FilterDropdown({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCategories,
  buttonRef,
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  // Calcular posición basada en el botón
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: buttonRect.bottom + 8, // 8px de margen
        right: window.innerWidth - buttonRect.right,
      });
    } else if (!isOpen) {
      // Resetear posición cuando se cierra
      setPosition(null);
    }
  }, [isOpen, buttonRef]);

  // Cerrar al hacer click fuera o al hacer scroll fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleScroll = (event: Event) => {
      // Solo cerrar si el scroll NO es dentro del dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, onClose, buttonRef]);

  // No renderizar hasta que tengamos la posición calculada
  if (!isOpen || !position) return null;

  const handleCategoryToggle = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter((c) => c !== categoryName)
      : [...filters.categories, categoryName];

    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleStockStatusToggle = (status: StockStatusType) => {
    const newStockStatus = filters.stockStatus.includes(status)
      ? filters.stockStatus.filter((s) => s !== status)
      : [...filters.stockStatus, status];

    onFiltersChange({ ...filters, stockStatus: newStockStatus });
  };

  const handleClearAll = () => {
    onFiltersChange({ categories: [], stockStatus: [] });
  };

  const activeFiltersCount =
    filters.categories.length + filters.stockStatus.length;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
      className="w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Filtros</h3>
          {activeFiltersCount > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""} activo
              {activeFiltersCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* Categorías */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Categorías
          </h4>
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.name)}
                  onChange={() => handleCategoryToggle(category.name)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Estado de Stock */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Estado de Stock
          </h4>
          <div className="space-y-2">
            {STOCK_STATUS_OPTIONS.map((status) => (
              <label
                key={status.id}
                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.stockStatus.includes(status.id)}
                  onChange={() => handleStockStatusToggle(status.id)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                    {status.label}
                  </div>
                  <div className="text-xs text-gray-500">{status.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={handleClearAll}
          disabled={activeFiltersCount === 0}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Limpiar filtros
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
