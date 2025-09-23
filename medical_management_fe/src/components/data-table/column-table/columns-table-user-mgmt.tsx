import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/api/user/types";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";

const getRoleColor = (role: string) => {
  switch (role) {
    case "DOCTOR":
      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
    case "PATIENT":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    case "ADMIN":
      return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    case "INACTIVE":
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
};

export const ColumnsTableUserMgmt: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const isAllSelected = table.getIsAllPageRowsSelected();

      return (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(!!checked)
          }
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected() || false}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "userInfo",
    meta: {
      title: "Thông tin",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thông tin" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="px-4 whitespace-nowrap">
          <div className="text-sm font-medium text-foreground">
            {user.fullName}
          </div>
          <div className="text-sm text-muted-foreground">
            {user.phoneNumber}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "role",
    meta: {
      title: "Vai trò",
    },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vai trò" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
            user.role
          )}`}
        >
          {user.role === "DOCTOR"
            ? "Bác sĩ"
            : user.role === "PATIENT"
            ? "Bệnh nhân"
            : "Quản trị viên"}
        </span>
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
      const user = row.original;
      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            user.status
          )}`}
        >
          {user.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
        </span>
      );
    },
  },
  //   {
  //     accessorKey: "status",
  //     meta: {
  //       title: "Trạng thái",
  //     },
  //
  // enableSorting: false,     header: ({ column }) => <DataTableColumnHeader column={column}  title="Trạng thái" />,
  //     cell: ({ row }) => {
  //       const status = row.getValue("status");
  //       return (
  //         <span
  //           className={`px-2 py-1 rounded-full text-xs ${
  //             status === "ACTIVE"
  //               ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
  //               : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
  //           }`}
  //         >
  //           {status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
  //         </span>
  //       );
  //     },
  //   },
];
