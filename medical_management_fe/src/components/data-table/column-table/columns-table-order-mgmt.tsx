import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Order } from "@/api/order/types";

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
    case "PAID":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    case "CANCELLED":
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
};

export const ColumnsTableOrderMgmt: ColumnDef<Order>[] = [
  {
    accessorKey: "userInfo",
    meta: {
      title: "Khách hàng",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-foreground">
            {order.user.fullName}
          </div>
          <div className="text-sm text-muted-foreground">
            {order.user.phoneNumber}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "productServices",
    meta: {
      title: "Sản phẩm/Dịch vụ",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sản phẩm/Dịch vụ" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-foreground">
            {order.productServices.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {order.productServices.description}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "price",
    meta: {
      title: "Giá",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          <div className="text-sm text-foreground">
            {order.totalPrice.toLocaleString("vi-VN")}đ
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            {order.lastPrice.toLocaleString("vi-VN")}đ
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "voucher",
    meta: {
      title: "Voucher",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Voucher" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          {order.voucher ? (
            <>
              <div className="text-sm text-foreground">
                {order.voucher.name}
              </div>
              <div className="text-sm text-muted-foreground">
                Giảm {order.voucher.discount}%
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Không có voucher
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    meta: {
      title: "Trạng thái",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="py-4 whitespace-nowrap">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              order.status
            )}`}
          >
            {order.status === "PENDING"
              ? "Chờ xác nhận"
              : order.status === "PAID"
              ? "Đã thanh toán"
              : "Đã hủy"}
          </span>
        </div>
      );
    },
  },
];
