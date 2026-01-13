import { Plus, Search } from "lucide-preact";
import { JSX } from "preact/jsx-runtime";
import { PERMISSIONS } from "@/types";
import { PermissionGate } from "@/components/PermissionGate";

const PAGE_SIZE_OPTIONS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
];

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export default function UsersToolbar({
  search,
  onSearchChange,
  onCreateNew,
  pageSize,
  onPageSizeChange,
}: UsersToolbarProps) {
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
            placeholder="Buscar por nombre, usuario o email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
          />
        </div>

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
        <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium text-sm shadow-sm"
          >
            <Plus size={18} /> Nuevo Usuario
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}
