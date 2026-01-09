import DateRangePicker from "./DateRangePicker";
import ExportButtons from "./ExportButtons";
import type { DateRange, ExportFormat } from "@/types";

interface ReportsToolbarProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onExport: (format: ExportFormat) => void;
}

export default function ReportsToolbar({
  dateRange,
  onDateRangeChange,
  onExport,
}: ReportsToolbarProps) {
  return (
    <div className="px-6 pb-4 flex justify-between items-center">
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />
      <ExportButtons onExport={onExport} />
    </div>
  );
}
