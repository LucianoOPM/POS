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
import { Eye, Clock } from "lucide-preact";
import { useState } from "preact/hooks";
import SortIcon from "@/components/SortIcon";
import Pagination from "@/components/Pagination";
import type { ShiftDetail } from "@/types/shift";

interface ShiftsTableProps {
  shifts: ShiftDetail[];
  onViewDetails: (shift: ShiftDetail) => void;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

type ShiftStatus = "OPEN" | "PENDING_CLOSURE" | "CLOSED" | "VOIDED";

const STATUS_CONFIG: Record<ShiftStatus, { label: string; color: string }> = {
  OPEN: { label: "Abierto", color: "bg-green-100 text-green-700 border-green-200" },
  PENDING_CLOSURE: { label: "Pend. cierre", color: "bg-amber-100 text-amber-700 border-amber-200" },
  CLOSED: { label: "Cerrado", color: "bg-gray-100 text-gray-600 border-gray-200" },
  VOIDED: { label: "Anulado", color: "bg-red-100 text-red-700 border-red-200" },
};

function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const columnHelper = createColumnHelper<ShiftDetail>();

export default function ShiftsTable({
  shifts,
  onViewDetails,
  pageSize,
  currentPage,
  onPageChange,
  isLoading,
}: ShiftsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "opened_at", desc: true }]);

  const pagination: PaginationState = { pageIndex: currentPage, pageSize };

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      enableSorting: true,
      cell: (info) => (
        <span className="font-mono text-sm font-semibold text-gray-700">#{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("username", {
      header: "Usuario",
      enableSorting: true,
      cell: (info) => {
        const username = info.getValue();
        const userId = info.row.original.user_id;
        return (
          <div>
            <span className="font-medium text-gray-900">
              {username ?? `${userId.slice(0, 8)}…`}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Estado",
      enableSorting: true,
      cell: (info) => {
        const status = info.getValue() as ShiftStatus;
        const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-600 border-gray-200" };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}
          >
            {cfg.label}
          </span>
        );
      },
    }),
    columnHelper.accessor("opened_at", {
      header: "Apertura",
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm text-gray-700">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("closed_at", {
      header: "Cierre",
      enableSorting: false,
      cell: (info) => (
        <span className="text-sm text-gray-700">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("duration_minutes", {
      header: "Duración",
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm font-mono text-gray-700">{formatDuration(info.getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      enableSorting: false,
      cell: (info) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => onViewDetails(info.row.original)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: shifts,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater(pagination);
        onPageChange(next.pageIndex);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Cargando turnos...</p>
        </div>
      </div>
    );
  }

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
                  const isCentered = header.column.id === "actions";
                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${
                        isCentered ? "text-center" : ""
                      }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${isCentered ? "justify-center" : ""} ${
                            canSort ? "cursor-pointer select-none group" : ""
                          }`}
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
                {row.getVisibleCells().map((cell) => {
                  const isCentered = cell.column.id === "actions";
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
            <Clock size={48} className="mb-4 text-gray-200" />
            <p className="text-sm">No se encontraron turnos con los filtros actuales.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={table.getState().pagination.pageIndex}
        totalPages={table.getPageCount()}
        onPageChange={onPageChange}
        totalItems={shifts.length}
        pageSize={pageSize}
      />
    </div>
  );
}
