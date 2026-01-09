import { ChevronLeft, ChevronRight } from "lucide-preact";
import type { PaginationProps } from "@/types";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationProps) {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con ellipsis
      if (currentPage <= 2) {
        // Al inicio
        pages.push(0, 1, 2, "...", totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        // Al final
        pages.push(0, "...", totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        // En el medio
        pages.push(0, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages - 1);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <div>
          Mostrando <span className="font-medium">{totalItems}</span> elemento
          {totalItems !== 1 ? "s" : ""}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
      {/* Info de items */}
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-medium">{startItem}</span> -{" "}
        <span className="font-medium">{endItem}</span> de{" "}
        <span className="font-medium">{totalItems}</span> elementos
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-8 h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
