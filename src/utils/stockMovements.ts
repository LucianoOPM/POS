export const MOVEMENT_TYPE_STYLES: Record<string, string> = {
  entry: "bg-green-100 text-green-700 border-green-200",
  exit: "bg-red-100 text-red-700 border-red-200",
  adjustment: "bg-blue-100 text-blue-700 border-blue-200",
  sale: "bg-orange-100 text-orange-700 border-orange-200",
  refund: "bg-teal-100 text-teal-700 border-teal-200",
};

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  entry: "Entrada",
  exit: "Salida",
  adjustment: "Ajuste",
  sale: "Venta",
  refund: "Devolución",
};

export const REASON_LABELS: Record<string, string> = {
  purchase: "Compra",
  loss: "Pérdida",
  damaged: "Dañado",
  return: "Devolución",
  manual_adjustment: "Ajuste manual",
  supplier_return: "Dev. proveedor",
  sale_adjustment: "Aj. por venta",
  customer_refund: "Dev. cliente",
  other: "Otro",
  sale: "Venta",
  refund: "Reembolso",
};

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
