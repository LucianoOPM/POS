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
import { Edit, Package, Trash2 } from "lucide-preact";
import { useState } from "preact/hooks";
import SortIcon from "@/components/SortIcon";
import Pagination from "@/components/Pagination";
import type { Product } from "@/types";

interface ProductsTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
  totalItems?: number;
}

const columnHelper = createColumnHelper<Product>();

export default function ProductsTable({
  products,
  onEditProduct,
  onDeleteProduct,
  pageSize,
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
}: ProductsTableProps) {
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
    columnHelper.accessor("tax", {
      header: "Impuesto",
      enableSorting: false,
      cell: (info) => (
        <span className="text-gray-600 font-mono text-sm">
          {parseFloat(info.getValue()).toFixed(2)}%
        </span>
      ),
    }),
    columnHelper.accessor("is_active", {
      header: "Estado",
      enableSorting: false,
      cell: (info) =>
        info.getValue() ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
            Inactivo
          </span>
        ),
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
              title="Editar producto"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDeleteProduct(product.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar producto"
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
                  const isNumeric =
                    header.column.id === "cost" ||
                    header.column.id === "price" ||
                    header.column.id === "tax";
                  const isCentered =
                    header.column.id === "is_active" || header.column.id === "actions";

                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${
                        isNumeric ? "text-right" : isCentered ? "text-center" : ""
                      }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            isNumeric
                              ? "justify-end"
                              : isCentered
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
                {row.getVisibleCells().map((cell) => {
                  const isNumeric =
                    cell.column.id === "cost" ||
                    cell.column.id === "price" ||
                    cell.column.id === "tax";
                  const isCentered =
                    cell.column.id === "is_active" || cell.column.id === "actions";
                  return (
                    <td
                      key={cell.id}
                      className={`px-6 py-3 ${
                        isNumeric ? "text-right" : isCentered ? "text-center" : ""
                      }`}
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
            <p>No se encontraron productos.</p>
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
