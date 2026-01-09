import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-preact";
import type { SortIconProps } from "@/types";

export default function SortIcon({ isSorted }: SortIconProps) {
  if (isSorted === "asc") {
    return <ArrowUp size={14} className="text-primary-600" />;
  }

  if (isSorted === "desc") {
    return <ArrowDown size={14} className="text-primary-600" />;
  }

  return <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />;
}
