import { useMemo } from "preact/hooks";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "preact/hooks";
import { ArrowUpDown, Banknote, CreditCard, Ticket } from "lucide-preact";
import Pagination from "@/components/Pagination";
import type { SaleRecord, PaymentMethodSales } from "@/types";
import { MOCK_SALES_RECORDS, MOCK_SALES_SUMMARY } from "@/mocks/reports";

const columnHelper = createColumnHelper<SaleRecord>();

const columns = [
  columnHelper.accessor("ticketNumber", {
    header: "Ticket",
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor("date", {
    header: "Fecha",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("time", {
    header: "Hora",
    cell: (info) => <span className="text-gray-500">{info.getValue()}</span>,
  }),
  columnHelper.accessor("items", {
    header: "Items",
    cell: (info) => <span className="text-center">{info.getValue()}</span>,
  }),
  columnHelper.accessor("subtotal", {
    header: "Subtotal",
    cell: (info) => (
      <span className="text-right">
        ${info.getValue().toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </span>
    ),
  }),
  columnHelper.accessor("tax", {
    header: "Impuesto",
    cell: (info) => (
      <span className="text-right text-gray-500">
        ${info.getValue().toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </span>
    ),
  }),
  columnHelper.accessor("total", {
    header: "Total",
    cell: (info) => (
      <span className="text-right font-bold">
        ${info.getValue().toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </span>
    ),
  }),
  columnHelper.accessor("paymentMethod", {
    header: "Metodo",
    cell: (info) => (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("cashier", {
    header: "Cajero",
    cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
  }),
];

function PaymentMethodCard({ data }: { data: PaymentMethodSales }) {
  const getIcon = (method: string) => {
    if (method.toLowerCase().includes("efectivo")) return Banknote;
    if (method.toLowerCase().includes("tarjeta")) return CreditCard;
    return Ticket;
  };

  const Icon = getIcon(data.method);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-gray-100 p-2 rounded-lg">
          <Icon size={20} className="text-gray-600" />
        </div>
        <span className="font-medium text-gray-800">{data.method}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Transacciones</span>
          <span className="font-medium">{data.count}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-primary-600">
            ${data.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SalesReport() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const data = useMemo(() => MOCK_SALES_RECORDS, []);
  const summary = MOCK_SALES_SUMMARY;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  });

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Ventas por metodo de pago */}
      <div>
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Ventas por Metodo de Pago</h3>
        <div className="grid grid-cols-3 gap-4">
          {summary.salesByPaymentMethod.map((pm) => (
            <PaymentMethodCard key={pm.method} data={pm} />
          ))}
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold uppercase text-gray-500">Detalle de Ventas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        <div className="border-t border-gray-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              table.setPageIndex(page);
            }}
            totalItems={data.length}
            pageSize={pageSize}
          />
        </div>
      </div>
    </div>
  );
}
