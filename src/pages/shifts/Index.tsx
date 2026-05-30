import { useState, useMemo } from "preact/hooks";
import useSWR from "swr";
import { shiftsActions } from "@/actions/shifts";
import { useCurrentShift } from "@/hooks/useCurrentShift";
import { useAuthStore } from "@/store/authStore";
import { PERMISSIONS } from "@/types/permissions";
import ShiftsStats from "./components/ShiftsStats";
import ShiftsToolbar from "./components/ShiftsToolbar";
import ShiftsTable from "./components/ShiftsTable";
import ShiftDetailModal from "./components/ShiftDetailModal";
import VoidShiftModal from "./components/VoidShiftModal";
import CurrentShiftPanel from "./components/CurrentShiftPanel";
import OpenShiftModal from "./components/OpenShiftModal";
import StartClosureModal from "./components/StartClosureModal";
import CloseAndReopenModal from "./components/CloseAndReopenModal";
import type { ShiftDetail, ShiftFilters } from "@/types/shift";

export default function ShiftsHistory() {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState<ShiftFilters>({});
  const [selectedShift, setSelectedShift] = useState<ShiftDetail | null>(null);
  const [voidingShift, setVoidingShift] = useState<ShiftDetail | null>(null);

  const [openingShift, setOpeningShift] = useState(false);
  const [startingClosure, setStartingClosure] = useState(false);
  const [completingClosure, setCompletingClosure] = useState(false);

  const { shift: currentShift, isLoading: shiftLoading, refresh: refreshCurrentShift } = useCurrentShift();
  const hasOpenPermission = useAuthStore((s) => s.hasPermission(PERMISSIONS.SHIFTS_OPEN));
  const hasClosePermission = useAuthStore((s) => s.hasPermission(PERMISSIONS.SHIFTS_CLOSE));

  const { data, isLoading, mutate } = useSWR<ShiftDetail[]>(
    ["shifts", filters],
    () => shiftsActions.getShifts(filters),
    { revalidateOnFocus: false }
  );

  const shifts = data ?? [];

  const filteredShifts = useMemo(() => {
    if (!search.trim()) return shifts;
    const q = search.toLowerCase();
    return shifts.filter(
      (s) =>
        s.id.toString().includes(q) ||
        (s.username && s.username.toLowerCase().includes(q)) ||
        s.user_id.toLowerCase().includes(q)
    );
  }, [shifts, search]);

  const handleFiltersChange = (newFilters: ShiftFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setCurrentPage(0);
  };

  const handlePageSizeChange = (v: number) => {
    setPageSize(v);
    setCurrentPage(0);
  };

  const handleShiftActionSuccess = () => {
    refreshCurrentShift();
    mutate();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <CurrentShiftPanel
        shift={currentShift}
        isLoading={shiftLoading}
        hasOpenPermission={hasOpenPermission}
        hasClosePermission={hasClosePermission}
        onOpen={() => setOpeningShift(true)}
        onStartClosure={() => setStartingClosure(true)}
        onCompleteClosure={() => setCompletingClosure(true)}
      />

      <ShiftsStats shifts={filteredShifts} totalItems={filteredShifts.length} />

      <ShiftsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <ShiftsTable
          shifts={filteredShifts}
          onViewDetails={setSelectedShift}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
      </div>

      {selectedShift && (
        <ShiftDetailModal
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
          onVoidRequest={setVoidingShift}
        />
      )}

      {voidingShift && (
        <VoidShiftModal
          shift={voidingShift}
          onClose={() => setVoidingShift(null)}
          onSuccess={() => {
            mutate();
            setVoidingShift(null);
            setSelectedShift(null);
          }}
        />
      )}

      {openingShift && (
        <OpenShiftModal
          onClose={() => setOpeningShift(false)}
          onSuccess={() => {
            handleShiftActionSuccess();
            setOpeningShift(false);
          }}
        />
      )}

      {startingClosure && currentShift && (
        <StartClosureModal
          shift={currentShift}
          onClose={() => setStartingClosure(false)}
          onSuccess={() => {
            handleShiftActionSuccess();
            setStartingClosure(false);
          }}
        />
      )}

      {completingClosure && currentShift && (
        <CloseAndReopenModal
          shift={currentShift}
          onClose={() => setCompletingClosure(false)}
          onSuccess={() => {
            handleShiftActionSuccess();
            setCompletingClosure(false);
          }}
        />
      )}
    </div>
  );
}
