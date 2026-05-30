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
import { History, Package, SlidersHorizontal } from "lucide-preact";
import { useState } from "preact/hooks";
import SortIcon from "@/components/SortIcon";
import Pagination from "@/components/Pagination";
import type { Product, StockStatus } from "@/types";

interface StockTableProps {
  products: Product[];
  onAdjust: (product: Product) => void;
  onViewHistory: (product: Product) => void;
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

export default function StockTable({
  products,
  onAdjust,
  onViewHistory,
  pageSize,
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
}: StockTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const pagination: PaginationState = {
    pageIndex: currentPage,
    pageSize,
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
      cell: (info) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {info.getValue() ?? "Sin categoría"}
        </span>
      ),
    }),
    columnHelper.accessor("stock", {
      header: "Stock",
      enableSorting: true,
      cell: (info) => (
        <span className="font-mono font-semibold text-gray-800">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("min_stock", {
      header: "Mín.",
      enableSorting: false,
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className="font-mono text-sm text-gray-500">
            {val !== null && val !== undefined ? val : <span className="italic text-gray-400">Global</span>}
          </span>
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
              onClick={() => onViewHistory(product)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver historial"
            >
              <History size={16} />
            </button>
            <button
              onClick={() => onAdjust(product)}
              className="p-2 text-gray-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors"
              title="Registrar movimiento"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
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
                  const isCentered =
                    header.column.id === "status" || header.column.id === "actions";

                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${
                        isCentered ? "text-center" : ""
                      }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            isCentered ? "justify-center" : ""
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
                {row.getVisibleCells().map((cell) => {
                  const isCentered =
                    cell.column.id === "status" || cell.column.id === "actions";
                  return (
                    <td
                      key={cell.id}
                      className={`px-6 py-3 ${isCentered ? "text-center" : ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={48} className="mb-4 text-gray-200" />
            <p>No se encontraron productos en inventario.</p>
          </div>
        )}
      </div>

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
