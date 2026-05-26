import { useState, useMemo } from "preact/hooks";
import { useLocation } from "wouter";
import useSWR from "swr";
import { refundActions } from "@/actions/refunds";
import RefundsTable from "./components/RefundsTable";
import RefundsToolbar from "./components/RefundsToolbar";
import RefundsStats from "./components/RefundsStats";
import type { RefundRecord, RefundFilters, RefundListResponse } from "@/types/refund";

export default function Index() {
  const [, setLocation] = useLocation();
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState<RefundFilters>({});
  const [selectedRefund, setSelectedRefund] = useState<RefundRecord | null>(null);

  // Fetch refunds from backend with pagination and filters
  const { data, isLoading, mutate } = useSWR<RefundListResponse>(
    ["refunds", currentPage + 1, pageSize, filters],
    () =>
      refundActions.getRefunds(currentPage + 1, pageSize, {
        ...filters,
        reason_search: search || undefined,
      })
  );

  const refunds = data?.refunds ?? [];
  const totalPages = data?.total_pages ?? 0;
  const totalItems = data?.total_items ?? 0;

  // Local filtering for instant search feedback
  const filteredRefunds: RefundRecord[] = useMemo(() => {
    if (!search.trim()) return refunds;

    const searchLower = search.toLowerCase();
    return refunds.filter(
      (refund) =>
        refund.reason.toLowerCase().includes(searchLower) ||
        refund.sale_id.toLowerCase().includes(searchLower) ||
        refund.id.toString().includes(searchLower) ||
        (refund.created_by_username &&
          refund.created_by_username.toLowerCase().includes(searchLower))
    );
  }, [refunds, search]);

  const handleViewDetails = (refund: RefundRecord): void => {
    setSelectedRefund(refund);
  };

  const handleCreateNew = (): void => {
    setLocation("/refunds/create");
  };

  const handlePageSizeChange = (newSize: number): void => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number): void => {
    setCurrentPage(newPage);
  };

  const handleFiltersChange = (newFilters: RefundFilters): void => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
    mutate(); // Refetch with new filters
  };

  const handleSearchChange = (newSearch: string): void => {
    setSearch(newSearch);
    // Debounce the search to avoid too many requests
    if (newSearch.trim() === "" || newSearch.length >= 3) {
      setCurrentPage(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* Stats Header */}
      <RefundsStats refunds={filteredRefunds} totalItems={totalItems} />

      {/* Toolbar */}
      <RefundsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onCreateNew={handleCreateNew}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Table Area */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <RefundsTable
          refunds={filteredRefunds}
          onViewDetails={handleViewDetails}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalItems={totalItems}
          isLoading={isLoading}
        />
      </div>

      {/* Modal for viewing refund details */}
      {selectedRefund && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedRefund(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles del Reembolso #{selectedRefund.id}
                </h3>
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">ID Venta</p>
                    <p className="font-mono text-sm">
                      {selectedRefund.sale_id.slice(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monto Reembolsado</p>
                    <p className="text-lg font-semibold text-red-600">
                      -${parseFloat(selectedRefund.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Realizado por</p>
                    <p className="text-sm">
                      {selectedRefund.created_by_username || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p className="text-sm">
                      {new Date(selectedRefund.created_at).toLocaleString("es-MX")}
                    </p>
                  </div>
                  {selectedRefund.sale_total && (
                    <div>
                      <p className="text-xs text-gray-500">Total de la Venta</p>
                      <p className="text-sm">
                        ${parseFloat(selectedRefund.sale_total).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {selectedRefund.items_count !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Productos</p>
                      <p className="text-sm">{selectedRefund.items_count} producto(s)</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Motivo</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedRefund.reason}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 text-center">
                    Para ver los productos reembolsados, use la funcionalidad de
                    detalles completos (próximamente)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
