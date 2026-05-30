import { useState } from "preact/hooks";
import useSWR from "swr";
import { stockMovementActions } from "@/actions/stock_movements";
import MovementsTable from "./MovementsTable";
import MovementsToolbar from "./MovementsToolbar";
import MovementForm from "./MovementForm";
import type { StockMovementListResponse } from "@/types";

interface MovementFiltersState {
  movement_type: string;
  product_id: number | undefined;
  date_from: string;
  date_to: string;
}

const EMPTY_FILTERS: MovementFiltersState = {
  movement_type: "",
  product_id: undefined,
  date_from: "",
  date_to: "",
};

export default function MovementsView() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<MovementFiltersState>(EMPTY_FILTERS);

  const swrKey = [
    "stock_movements",
    currentPage + 1,
    pageSize,
    search,
    filters.movement_type,
    filters.product_id,
    filters.date_from,
    filters.date_to,
  ];

  const { data, mutate } = useSWR<StockMovementListResponse>(swrKey, () =>
    stockMovementActions.getMovements({
      page: currentPage + 1,
      limit: pageSize,
      search: search || undefined,
      movement_type: filters.movement_type || undefined,
      product_id: filters.product_id,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
    })
  );

  const movements = data?.movements ?? [];
  const totalPages = data?.total_pages ?? 0;
  const totalItems = data?.total_items;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(0);
  };

  const handleFiltersChange = (newFilters: MovementFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <MovementsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onCreateNew={() => setShowForm(true)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <MovementsTable
          movements={movements}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
        />
      </div>

      {showForm && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <MovementForm
              onClose={() => setShowForm(false)}
              onSuccess={() => mutate()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
