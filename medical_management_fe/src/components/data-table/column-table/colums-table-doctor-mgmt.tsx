import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/api/doctor/types";
import { DataTableColumnHeader } from "../data-table-column-header";

export const ColumsTableDoctorMgmt: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    meta: {
      title: "Họ và tên",
    },
    enableSorting: false,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Họ và tên" />;
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg text-muted-foreground">
              {row.getValue("fullName")
                ? String(row.getValue("fullName")).charAt(0)
                : ""}
            </span>
          </div>
          <span className="font-medium">{row.getValue("fullName")}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "majorDoctor",
    meta: {
      title: "Chuyên môn",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chuyên môn" />
    ),
    cell: ({ row }) => {
      const status =
        row.getValue("majorDoctor") === "DINH_DUONG"
          ? "Chuyên gia Dinh dưỡng"
          : "Chuyên gia Tâm thần";
      if (!status) {
        return null;
      }
      return <div className="flex w-[100px] items-center">{status}</div>;
    },
  },

  {
    accessorKey: "phoneNumber",
    meta: {
      title: "Số điện thoại",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số điện thoại" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">{row.getValue("phoneNumber")}</div>
      );
    },
  },
  {
    accessorKey: "status",
    meta: {
      title: "Trạng thái",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "ACTIVE"
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
          }`}
        >
          {status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
        </span>
      );
    },
  },
];
