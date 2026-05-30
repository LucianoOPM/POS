import { X } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { Category } from "@/types";

export interface ProductsFilters {
  categories: string[];
  activeStatus: "all" | "active" | "inactive";
}

interface ProductFilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductsFilters;
  onFiltersChange: (filters: ProductsFilters) => void;
  availableCategories: Category[];
  buttonRef: { current: HTMLElement | null };
}

export default function ProductFilterDropdown({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCategories,
  buttonRef,
}: ProductFilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: buttonRect.bottom + 8,
        right: window.innerWidth - buttonRect.right,
      });
    } else if (!isOpen) {
      setPosition(null);
    }
  }, [isOpen, buttonRef]);

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

  if (!isOpen || !position) return null;

  const handleCategoryToggle = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter((c) => c !== categoryName)
      : [...filters.categories, categoryName];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleClearAll = () => {
    onFiltersChange({ categories: [], activeStatus: "all" });
  };

  const activeFiltersCount =
    filters.categories.length + (filters.activeStatus !== "all" ? 1 : 0);

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
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
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

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estado</h4>
          <div className="space-y-2">
            {(
              [
                { id: "all", label: "Todos" },
                { id: "active", label: "Activo" },
                { id: "inactive", label: "Inactivo" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
              >
                <input
                  type="radio"
                  name="activeStatus"
                  checked={filters.activeStatus === opt.id}
                  onChange={() => onFiltersChange({ ...filters, activeStatus: opt.id })}
                  className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

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
