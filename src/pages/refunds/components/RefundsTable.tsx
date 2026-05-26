import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { Eye, ReceiptText } from "lucide-preact";
import { useState } from "preact/hooks";
import SortIcon from "@/components/SortIcon";
import Pagination from "@/components/Pagination";
import type { RefundRecord, RefundsTableProps } from "@/types/refund";

const columnHelper = createColumnHelper<RefundRecord>();

export default function RefundsTable({
  refunds,
  onViewDetails,
  pageSize,
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
  isLoading,
}: RefundsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const pagination: PaginationState = {
    pageIndex: currentPage,
    pageSize: pageSize,
  };

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      enableSorting: true,
      cell: (info) => (
        <span className="font-mono text-sm text-gray-600">#{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("sale_id", {
      header: "Venta Original",
      enableSorting: true,
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm text-primary-600 font-medium">
            {info.getValue().slice(0, 8)}...
          </span>
          {info.row.original.sale_total && (
            <span className="text-xs text-gray-400">
              Total venta: ${parseFloat(info.row.original.sale_total).toFixed(2)}
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "Monto Reembolsado",
      enableSorting: true,
      cell: (info) => (
        <span className="font-semibold text-red-600">
          -${parseFloat(info.getValue()).toFixed(2)}
        </span>
      ),
    }),
    columnHelper.accessor("reason", {
      header: "Motivo",
      enableSorting: false,
      cell: (info) => {
        const reason = info.getValue();
        const truncated = reason.length > 50 ? `${reason.slice(0, 50)}...` : reason;
        return (
          <span className="text-gray-700 text-sm" title={reason}>
            {truncated}
          </span>
        );
      },
    }),
    columnHelper.accessor("created_by_username", {
      header: "Realizado por",
      enableSorting: true,
      cell: (info) => {
        const username = info.getValue();
        return username ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-medium text-xs">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700 text-sm">{username}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm italic">Sin datos</span>
        );
      },
    }),
    columnHelper.accessor("items_count", {
      header: "Productos",
      enableSorting: true,
      cell: (info) => {
        const count = info.getValue();
        return count !== undefined ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {count} {count === 1 ? "producto" : "productos"}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha",
      enableSorting: true,
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <div className="flex flex-col">
            <span className="text-gray-700 text-sm">
              {date.toLocaleDateString("es-MX", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-gray-400 text-xs">
              {date.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      enableSorting: false,
      cell: (info) => {
        const refund = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onViewDetails(refund)}
              className="p-2 text-gray-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye size={16} />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: refunds,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater(pagination);
        onPageChange(newPagination.pageIndex);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: totalPages !== undefined,
    pageCount: totalPages ?? -1,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="overflow-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
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
                          header.column.id === "actions" ? "text-center" : ""
                        }`}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-2 ${
                              header.column.id === "actions" ? "justify-center" : ""
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
                      className={`px-6 py-4 ${
                        cell.column.id === "actions" ? "text-center" : ""
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ReceiptText size={48} className="mb-4 text-gray-200" />
            <p>No se encontraron reembolsos.</p>
            <p className="text-sm mt-1">Ajusta los filtros o realiza un nuevo reembolso.</p>
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
