import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useMemo } from "react";

type PaginationMode = "CSR" | "SSR";

interface CommonProps<TData> {
  table: Table<TData>;
  mode?: PaginationMode;
  pageSizeOptions?: number[];
}

interface ServerSideProps<TData> extends CommonProps<TData> {
  mode: "SSR";
  totalItems: number;
  limit: number;
  currentPage: number;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
}

interface ClientSideProps<TData> extends CommonProps<TData> {
  mode?: "CSR";
}

type DataTablePaginationProps<TData> =
  | ServerSideProps<TData>
  | ClientSideProps<TData>;

export function DataTablePagination<TData>({
  table,
  mode = "CSR",
  pageSizeOptions = [5, 10, 20, 30, 50],
  ...rest
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;

  const isSSR = mode === "SSR";
  const {
    totalItems = 0,
    limit = pageSize,
    currentPage = pageIndex + 1,
    onPaginationChange,
  } = rest as Partial<ServerSideProps<TData>>;

  // set pageSize on SSR mount
  useEffect(() => {
    if (isSSR) table.setPageSize(limit || 5);
  }, [isSSR, limit, table]);

  const pageCount = useMemo(
    () =>
      isSSR
        ? Math.max(1, Math.ceil(totalItems / pageSize))
        : table.getPageCount(),
    [isSSR, totalItems, pageSize, table]
  );

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = isSSR
    ? totalItems
    : table.getFilteredRowModel().rows.length;

  const current = isSSR ? currentPage : pageIndex + 1;

  const handleChangePage = (newPage: number) => {
    if (isSSR && onPaginationChange) {
      table.setRowSelection({});
      onPaginationChange(newPage, pageSize);
    } else {
      table.setPageIndex(newPage - 1);
    }
  };

  const handleChangePageSize = (newSize: number) => {
    if (isSSR && onPaginationChange) {
      onPaginationChange(1, newSize);
    } else {
      table.setPageSize(newSize);
    }
  };

  const isFirstPage = current <= 1;
  const isLastPage = current >= pageCount;

  return (
    <div className="flex items-center justify-between px-2">
      {/* Left: Selected count */}
      <div className="flex-1 text-sm text-muted-foreground">
        Đã chọn {selectedCount} / {totalCount}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Page size selector */}
        <div className="hidden lg:flex items-center space-x-2">
          <p className="text-sm font-medium">Hiển thị</p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => handleChangePageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Trang {current} / {pageCount}
        </div>

        {/* Page navigation */}
        <div className="flex items-center space-x-2">
          <PaginationButton
            onClick={() => handleChangePage(1)}
            disabled={isFirstPage}
          >
            <ChevronsLeft className="h-4 w-4" />
          </PaginationButton>

          <PaginationButton
            onClick={() => handleChangePage(current - 1)}
            disabled={isFirstPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationButton>

          <PaginationButton
            onClick={() => handleChangePage(current + 1)}
            disabled={isLastPage}
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>

          <PaginationButton
            onClick={() => handleChangePage(pageCount)}
            disabled={isLastPage}
          >
            <ChevronsRight className="h-4 w-4" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}

// Small helper for pagination button
function PaginationButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="outline"
      className="h-8 w-8 p-0 hidden lg:flex"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="sr-only">Pagination button</span>
      {children}
    </Button>
  );
}
