import { X } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import useSWR from "swr";
import { productActions } from "@/actions/products";

interface MovementFiltersState {
  movement_type: string;
  product_id: number | undefined;
  date_from: string;
  date_to: string;
}

interface MovementFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MovementFiltersState;
  onFiltersChange: (filters: MovementFiltersState) => void;
  buttonRef: { current: HTMLElement | null };
}

const MOVEMENT_TYPE_OPTIONS = [
  { value: "entry", label: "Entrada" },
  { value: "exit", label: "Salida" },
  { value: "adjustment", label: "Ajuste" },
  { value: "sale", label: "Venta" },
  { value: "refund", label: "Devolución" },
];

export default function MovementFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  buttonRef,
}: MovementFiltersProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  const { data: productsData } = useSWR(
    isOpen ? ["products", 1, 500] : null,
    () => productActions.getProducts(1, 500)
  );

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
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

  const activeFiltersCount = [
    filters.movement_type,
    filters.product_id,
    filters.date_from,
    filters.date_to,
  ].filter(Boolean).length;

  const handleClearAll = () => {
    onFiltersChange({ movement_type: "", product_id: undefined, date_from: "", date_to: "" });
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: "fixed", top: `${position.top}px`, right: `${position.right}px` }}
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

      <div className="p-4 space-y-5 max-h-96 overflow-y-auto">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Tipo de movimiento
          </h4>
          <div className="space-y-2">
            {MOVEMENT_TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="radio"
                  name="movement_type_filter"
                  value={opt.value}
                  checked={filters.movement_type === opt.value}
                  onChange={() => onFiltersChange({ ...filters, movement_type: opt.value })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
            {filters.movement_type && (
              <button
                onClick={() => onFiltersChange({ ...filters, movement_type: "" })}
                className="text-xs text-gray-400 hover:text-gray-600 mt-1"
              >
                Limpiar tipo
              </button>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Producto
          </h4>
          <select
            value={filters.product_id ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                product_id: e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
              })
            }
            className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
          >
            <option value="">Todos los productos</option>
            {productsData?.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Rango de fechas
          </h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Desde</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  onFiltersChange({ ...filters, date_from: e.currentTarget.value })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Hasta</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  onFiltersChange({ ...filters, date_to: e.currentTarget.value })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
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
