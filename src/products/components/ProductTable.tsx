import { TableComponent } from "@/components/Table";
import { Product, ProductResponse } from "@/types/products";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { FC, useMemo } from "preact/compat";
import { columns } from "@products/columns/productColumns";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "preact/hooks";

const getProductList = async ({
  status,
  page,
  limit,
}: {
  status: boolean;
  page: number;
  limit: number;
}): Promise<ProductResponse> => {
  return await invoke("get_products", {
    filters: { status, page, limit },
  });
};

interface ProductTableProps {
  status: boolean;
  onEdit: (product: Product) => void;
  onDelete: (idProduct: number) => void;
}

export const ProductsTable: FC<ProductTableProps> = ({
  status,
  onEdit,
  onDelete,
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading, isError, error } = useQuery<ProductResponse>({
    queryKey: [
      "products",
      { status, page: pagination.pageIndex + 1, limit: pagination.pageSize },
    ],
    queryFn: () =>
      getProductList({
        status,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }),
  });

  const products = useMemo(() => data?.products ?? [], [data]);

  const table = useReactTable({
    data: products,
    columns: columns(onEdit, onDelete),
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: data?.total_pages ?? -1,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  const start =
    data.total_items === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    data.total_items
  );

  return (
    <div>
      <TableComponent
        table={table}
        showGlobalSearch={true}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        showPagination={true}
        totalItems={data.total_items}
        startItem={start}
        endItem={end}
        showPageSizeSelector={true} // <-- aquí decides si mostrarlo
      />
    </div>
  );
};
