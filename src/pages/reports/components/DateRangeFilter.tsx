import { RefreshCw } from "lucide-preact";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onRefresh,
  isRefreshing = false,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Desde:</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange((e.target as HTMLInputElement).value)}
          className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Hasta:</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange((e.target as HTMLInputElement).value)}
          className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );
}
