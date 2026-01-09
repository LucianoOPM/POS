import { Calendar } from "lucide-preact";
import type { DateRange } from "@/types";

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

function toInputValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromInputValue(value: string, isEndDate: boolean): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isEndDate) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

export default function DateRangePicker({
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const handleStartDateChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newStartDate = fromInputValue(target.value, false);
    onDateRangeChange({
      startDate: newStartDate,
      endDate: dateRange.endDate,
    });
  };

  const handleEndDateChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newEndDate = fromInputValue(target.value, true);
    onDateRangeChange({
      startDate: dateRange.startDate,
      endDate: newEndDate,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar size={18} className="text-gray-500" />
      <input
        type="date"
        value={toInputValue(dateRange.startDate)}
        onChange={handleStartDateChange}
        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <span className="text-gray-400">-</span>
      <input
        type="date"
        value={toInputValue(dateRange.endDate)}
        onChange={handleEndDateChange}
        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );
}
