import { useState } from "preact/hooks";

type DefaultRange = "current-month" | "last-30-days";

function buildDefaults(defaultRange: DefaultRange): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const dateTo = today.toISOString().split("T")[0];

  if (defaultRange === "last-30-days") {
    const from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { dateFrom: from.toISOString().split("T")[0], dateTo };
  }

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return { dateFrom: firstOfMonth.toISOString().split("T")[0], dateTo };
}

export function useReportDateRange(defaultRange: DefaultRange = "current-month") {
  const defaults = buildDefaults(defaultRange);
  const [dateFrom, setDateFrom] = useState(defaults.dateFrom);
  const [dateTo, setDateTo] = useState(defaults.dateTo);

  return { dateFrom, dateTo, setDateFrom, setDateTo };
}
