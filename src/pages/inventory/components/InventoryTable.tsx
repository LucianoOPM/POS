import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from "@tanstack/react-table";
import { Edit, Minus, Package, Plus, Trash2 } from "lucide-preact";
import { useState } from "preact/hooks";
import SortIcon from "@/components/SortIcon";
import Pagination from "@/components/Pagination";
import type { Product, StockStatus } from "@/types";

interface InventoryTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onQuickStock: (id: number, delta: number) => void;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
  totalItems?: number;
}

const getStockStatus = (stock: number): StockStatus => {
  if (stock === 0) return { label: "Agotado", color: "bg-red-100 text-red-700 border-red-200" };
  if (stock < 10)
    return { label: "Bajo", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  return { label: "Óptimo", color: "bg-green-100 text-green-700 border-green-200" };
};

const columnHelper = createColumnHelper<Product>();

export default function InventoryTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onQuickStock,
  pageSize,
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
}: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Estado de paginación sincronizado con props
  const pagination: PaginationState = {
    pageIndex: currentPage,
    pageSize: pageSize,
  };

  const columns = [
    columnHelper.accessor("name", {
      header: "Producto / SKU",
      enableSorting: true,
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          <div className="text-xs text-gray-400 font-mono">{info.row.original.code}</div>
        </div>
      ),
    }),
    columnHelper.accessor("category_name", {
      header: "Categoría",
      enableSorting: true,
      cell: (info) => {
        const categoryName = info.getValue();
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {categoryName ?? "Sin categoría"}
          </span>
        );
      },
    }),
    columnHelper.accessor("cost", {
      header: "Costo",
      enableSorting: true,
      cell: (info) => (
        <span className="text-gray-600 font-mono text-sm">
          ${parseFloat(info.getValue()).toFixed(2)}
        </span>
      ),
    }),
    columnHelper.accessor("price", {
      header: "Precio",
      enableSorting: true,
      cell: (info) => (
        <span className="font-bold text-gray-900 font-mono text-sm">
          ${parseFloat(info.getValue()).toFixed(2)}
        </span>
      ),
    }),
    columnHelper.accessor("stock", {
      header: "Stock",
      enableSorting: true,
      cell: (info) => {
        const productId = info.row.original.id;
        const stock = info.getValue();

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onQuickStock(productId, -1)}
              className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-medium text-gray-800">{stock}</span>
            <button
              onClick={() => onQuickStock(productId, 1)}
              className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus size={14} />
            </button>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "status",
      header: "Estado",
      enableSorting: false,
      cell: (info) => {
        const status = getStockStatus(info.row.original.stock);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
          >
            {status.label}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      enableSorting: false,
      cell: (info) => {
        const product = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onEditProduct(product)}
              className="p-2 text-gray-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDeleteProduct(product.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      // Sincronizar cambios de paginación con el componente padre
      if (typeof updater === "function") {
        const newPagination = updater(pagination);
        onPageChange(newPagination.pageIndex);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: totalPages !== undefined,
    pageCount: totalPages ?? -1,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${
                        header.column.id === "cost" || header.column.id === "price"
                          ? "text-right"
                          : header.column.id === "stock" ||
                            header.column.id === "status" ||
                            header.column.id === "actions"
                          ? "text-center"
                          : ""
                      }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.id === "cost" || header.column.id === "price"
                              ? "justify-end"
                              : header.column.id === "stock" ||
                                header.column.id === "status" ||
                                header.column.id === "actions"
                              ? "justify-center"
                              : ""
                          } ${canSort ? "cursor-pointer select-none group" : ""}`}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <SortIcon isSorted={isSorted} />}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 group transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-6 py-3 ${
                      cell.column.id === "cost" || cell.column.id === "price"
                        ? "text-right"
                        : cell.column.id === "stock" ||
                          cell.column.id === "status" ||
                          cell.column.id === "actions"
                        ? "text-center"
                        : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={48} className="mb-4 text-gray-200" />
            <p>No se encontraron productos.</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      <Pagination
        currentPage={table.getState().pagination.pageIndex}
        totalPages={table.getPageCount()}
        onPageChange={onPageChange}
        totalItems={totalItems ?? table.getFilteredRowModel().rows.length}
        pageSize={table.getState().pagination.pageSize}
      />
    </div>
  );
}
