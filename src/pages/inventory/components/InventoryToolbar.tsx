import { Filter, Plus, Search } from "lucide-preact";
import { JSX } from "preact/jsx-runtime";
import { useState, useRef } from "preact/hooks";
import FilterDropdown from "./FilterDropdown";
import { type InventoryFilters, type Category, PERMISSIONS } from "@/types";
import { PermissionGate } from "@/components/PermissionGate";

const PAGE_SIZE_OPTIONS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: 9999, label: "Todos" },
];

interface InventoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  availableCategories: Category[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export default function InventoryToolbar({
  search,
  onSearchChange,
  onCreateNew,
  filters,
  onFiltersChange,
  availableCategories,
  pageSize,
  onPageSizeChange,
}: InventoryToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const activeFiltersCount = filters.categories.length + filters.stockStatus.length;

  return (
    <div className="px-6 pb-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="relative w-96">
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
            placeholder="Buscar por nombre, código o categoría..."
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
      </div>
      <div className="flex gap-3">
        <button
          ref={filterButtonRef}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg font-medium text-sm transition-colors ${
            activeFiltersCount > 0
              ? "border-primary-500 text-primary-600 bg-primary-50"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Filter size={18} /> Filtrar
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <FilterDropdown
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFiltersChange={onFiltersChange}
          availableCategories={availableCategories}
          buttonRef={filterButtonRef}
        />

        <PermissionGate permission={PERMISSIONS.PRODUCTS_CREATE}>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium text-sm shadow-sm"
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}
