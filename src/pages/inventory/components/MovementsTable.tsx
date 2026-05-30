import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { ArrowDownUp } from "lucide-preact";
import { useState } from "preact/hooks";
import SortIcon from "@/components/SortIcon";
import Pagination from "@/components/Pagination";
import type { StockMovement } from "@/types";
import {
  MOVEMENT_TYPE_STYLES,
  MOVEMENT_TYPE_LABELS,
  REASON_LABELS,
  formatDate,
} from "@/utils/stockMovements";

interface MovementsTableProps {
  movements: StockMovement[];
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
  totalItems?: number;
}

const columnHelper = createColumnHelper<StockMovement>();

export default function MovementsTable({
  movements,
  pageSize,
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
}: MovementsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const pagination: PaginationState = {
    pageIndex: currentPage,
    pageSize,
  };

  const columns = [
    columnHelper.accessor("created_at", {
      header: "Fecha",
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("product_name", {
      header: "Producto",
      enableSorting: true,
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue() ?? "—"}</span>
      ),
    }),
    columnHelper.accessor("movement_type", {
      header: "Tipo",
      enableSorting: true,
      cell: (info) => {
        const type = info.getValue();
        const style = MOVEMENT_TYPE_STYLES[type] ?? "bg-gray-100 text-gray-700 border-gray-200";
        const label = MOVEMENT_TYPE_LABELS[type] ?? type;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
          >
            {label}
          </span>
        );
      },
    }),
    columnHelper.accessor("quantity", {
      header: "Cantidad",
      enableSorting: true,
      cell: (info) => (
        <span className="font-mono font-medium text-gray-800">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("previous_stock", {
      header: "Stock Ant.",
      enableSorting: false,
      cell: (info) => (
        <span className="font-mono text-sm text-gray-500">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("new_stock", {
      header: "Stock Nuevo",
      enableSorting: false,
      cell: (info) => (
        <span className="font-mono font-medium text-gray-900">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("reason", {
      header: "Motivo",
      enableSorting: false,
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {REASON_LABELS[info.getValue()] ?? info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("created_by_username", {
      header: "Usuario",
      enableSorting: false,
      cell: (info) => (
        <span className="text-sm text-gray-500">{info.getValue() ?? "—"}</span>
      ),
    }),
  ];

  const table = useReactTable({
    data: movements,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater(pagination);
        onPageChange(newPagination.pageIndex);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
                      className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${canSort ? "cursor-pointer select-none" : ""}`}
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
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ArrowDownUp size={48} className="mb-4 text-gray-200" />
            <p>No se encontraron movimientos.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={table.getState().pagination.pageIndex}
        totalPages={table.getPageCount()}
        onPageChange={onPageChange}
        totalItems={totalItems ?? movements.length}
        pageSize={pageSize}
      />
    </div>
  );
}
