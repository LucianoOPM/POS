import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { Edit, Users } from "lucide-preact";
import { useState } from "preact/hooks";
import SortIcon from "@/components/SortIcon";
import Pagination from "@/components/Pagination";
import type { UserRecord } from "@/types";

interface UsersTableProps {
  users: UserRecord[];
  onEditUser: (user: UserRecord) => void;
  onToggleStatus: (user: UserRecord) => void;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
  totalItems?: number;
  isToggling?: string | null;
}

const columnHelper = createColumnHelper<UserRecord>();

export default function UsersTable({
  users,
  onEditUser,
  onToggleStatus,
  pageSize,
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
  isToggling,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const pagination: PaginationState = {
    pageIndex: currentPage,
    pageSize: pageSize,
  };

  const columns = [
    columnHelper.accessor("username", {
      header: "Usuario",
      enableSorting: true,
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-sm">
            {info.getValue().charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-400">{info.row.original.email}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: "full_name",
      header: "Nombre Completo",
      enableSorting: true,
      cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
    }),
    columnHelper.accessor("profile_name", {
      header: "Rol",
      enableSorting: true,
      cell: (info) => {
        const profileName = info.getValue();
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
            {profileName ?? "Sin rol"}
          </span>
        );
      },
    }),
    columnHelper.accessor("is_active", {
      header: "Estado",
      enableSorting: true,
      cell: (info) => {
        const isActive = info.getValue();
        const user = info.row.original;
        const isCurrentlyToggling = isToggling === user.id;

        return (
          <button
            onClick={() => onToggleStatus(user)}
            disabled={isCurrentlyToggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isActive ? "bg-green-500" : "bg-gray-300"
            } ${isCurrentlyToggling ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
            title={isActive ? "Desactivar usuario" : "Activar usuario"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha Registro",
      enableSorting: true,
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <span className="text-gray-500 text-sm">
            {date.toLocaleDateString("es-MX", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      enableSorting: false,
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onEditUser(user)}
              className="p-2 text-gray-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors"
              title="Editar usuario"
            >
              <Edit size={16} />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: users,
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
                        header.column.id === "is_active" || header.column.id === "actions"
                          ? "text-center"
                          : ""
                      }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.id === "is_active" || header.column.id === "actions"
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
                    className={`px-6 py-4 ${
                      cell.column.id === "is_active" || cell.column.id === "actions"
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
            <Users size={48} className="mb-4 text-gray-200" />
            <p>No se encontraron usuarios.</p>
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
