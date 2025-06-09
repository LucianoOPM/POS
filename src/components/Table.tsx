import { flexRender, Table } from "@tanstack/react-table";
import { Search } from "lucide-preact";

interface TableComponentProps<T> {
  table: Table<T>;
  showGlobalSearch?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  showPagination?: boolean;
  totalItems?: number;
  startItem?: number;
  endItem?: number;
  showPageSizeSelector?: boolean; // <-- nueva prop
}

export const TableComponent = <T extends {}>({
  table,
  showGlobalSearch = false,
  globalFilter = "",
  onGlobalFilterChange,
  showPagination = false,
  totalItems,
  startItem,
  endItem,
  showPageSizeSelector = false, // <-- valor por defecto
}: TableComponentProps<T>) => {
  return (
    <div class="space-y-4 rounded-md">
      <div class="flex items-center justify-between">
        {showGlobalSearch && onGlobalFilterChange && (
          <div class="pb-4">
            <label for="table-search" class="sr-only">
              Search
            </label>
            <div class="relative mt-1">
              <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                <Search
                  size={16}
                  class="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
              </div>
              <input
                type="text"
                id="table-search"
                class="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search for items"
                value={globalFilter}
                onInput={(e) => onGlobalFilterChange(e.currentTarget.value)}
              />
            </div>
          </div>
        )}
        {showPageSizeSelector && (
          <select
            id="table-page-size"
            name="table-page-size"
            class="bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded px-2 py-1 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.currentTarget.value))}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
        )}
      </div>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    class="px-6 py-3"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td
                  colSpan={table.getAllLeafColumns().length}
                  class="px-6 py-4 text-center text-gray-500"
                >
                  Sin información
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} class="px-6 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalItems !== undefined && (
        <nav
          class="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
          aria-label="Table navigation"
        >
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
            Showing{" "}
            <span class="font-semibold text-gray-900 dark:text-white">
              {startItem}-{endItem}
            </span>{" "}
            of{" "}
            <span class="font-semibold text-gray-900 dark:text-white">
              {totalItems}
            </span>
          </span>
          <div class="flex items-center gap-2">
            <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              <li>
                <button
                  class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
                (page) => (
                  <li key={page}>
                    <button
                      onClick={() => table.setPageIndex(page)}
                      disabled={table.getState().pagination.pageIndex === page}
                      class={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                        table.getState().pagination.pageIndex === page
                          ? "bg-gray-100 text-gray-700"
                          : ""
                      }`}
                    >
                      {page + 1}
                    </button>
                  </li>
                )
              )}
              <li>
                <button
                  class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
};
