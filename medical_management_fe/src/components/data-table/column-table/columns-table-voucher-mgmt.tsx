import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Voucher } from "@/api/voucher/types";

// Removed unused getStatusColor helper

export const ColumnsTableVoucherMgmt: ColumnDef<Voucher>[] = [
  {
    accessorKey: "name",
    meta: {
      title: "Tên voucher",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên voucher" />
    ),
    cell: ({ row }) => {
      const voucher = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-foreground">
            {voucher.name}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "code",
    meta: {
      title: "Mã",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã" />
    ),
    cell: ({ row }) => {
      const voucher = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          <div className="text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded-full text-xs font-medium">
              {voucher.code}
            </span>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "discount",
    meta: {
      title: "Giảm giá",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giảm giá" />
    ),
    cell: ({ row }) => {
      const voucher = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          <div className="text-sm text-foreground">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
              {voucher.discount}%
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "productServices",
    meta: {
      title: "Số sản phẩm áp dụng",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số sản phẩm áp dụng" />
    ),
    cell: ({ row }) => {
      const voucher = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          <div className="text-sm text-muted-foreground">
            {voucher.productServices.length} sản phẩm
          </div>
        </div>
      );
    },
  },
];
