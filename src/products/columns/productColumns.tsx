import { Product } from "@/types/products";
import { ColumnDef } from "@tanstack/react-table";
import { SortDesc, SortAsc, ArrowDownUp } from "lucide-preact";

export const columns = (
  onEdit: (product: Product) => void,
  onDelete: (idProduct: number) => void
): ColumnDef<Product>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div class="flex items-center">
        <input
          id="checkbox-all-search"
          checked={table.getIsAllRowsSelected()}
          onChange={() => table.toggleAllRowsSelected()}
          type="checkbox"
          name="checkbox-all-search"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 hover:cursor-pointer"
        />
        <label for="checkbox-all-search" class="sr-only">
          checkbox
        </label>
      </div>
    ),
    cell: ({ row }) => (
      <div class="flex items-center">
        <input
          type="checkbox"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 hover:cursor-pointer"
          name="checkbox-row"
          id={`checkbox-row-${row.original.id_product}`}
          checked={row.getIsSelected()}
          onChange={() => row.toggleSelected()}
        />
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    size: 40,
  },
  {
    accessorKey: "id_product",
    header: ({ column }) => {
      return (
        <div class="flex items-center select-none hover:cursor-pointer">
          #
          {!column.getIsSorted() && (
            <ArrowDownUp size={16} class="ml-1 text-xs" />
          )}
          {column.getIsSorted() === "asc" && (
            <SortAsc size={16} class="ml-1 text-xs" />
          )}
          {column.getIsSorted() === "desc" && (
            <SortDesc size={16} class="ml-1 text-xs" />
          )}
        </div>
      );
    },
  },
  { accessorKey: "name", header: "Product name" },
  { accessorKey: "stock", header: "Stock" },
  { accessorKey: "max_stock", header: "Max stock" },
  { accessorKey: "is_active", header: "Active" },
  { accessorKey: "unit_price", header: "Unit price" },
  { accessorKey: "bar_code", header: "Bar code" },
  { accessorKey: "description", header: "Description" },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <div class="flex gap-2">
          <button
            class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => onEdit(row.original)}
          >
            Editar
          </button>
          <button
            class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => onDelete(row.original.id_product)}
          >
            Eliminar
          </button>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 100,
  },
];
