import { DoctorSchedule, User } from "@/api/doctor/types";
import { DataTableCSR } from "../data-table/data-table-CSR/data-table-CSR";
import { Button } from "../ui/button";
import { parseISO, format } from "date-fns";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ColumsTableDoctorMgmt } from "../data-table/column-table/colums-table-doctor-mgmt";

type DoctorManagementTableProps = {
  doctorList: User[];
  schedulesData: DoctorSchedule[];
  selectedDate: Date;
  isLoadingDoctors: boolean;
  isLoadingSchedules: boolean;
  handleAddDoctor: () => void;
  handleAddSchedule: () => void;
  handleEditSchedule: (schedule: DoctorSchedule) => void;
  handleDeleteSchedule: (scheduleId: string) => void;
  handleDeleteDoctor: (doctorId: string) => void;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const DoctorManagementTable = ({
  doctorList,
  schedulesData,
  selectedDate,
  isLoadingDoctors,
  isLoadingSchedules,
  handleAddDoctor,
  handleAddSchedule,
  handleEditSchedule,
  handleDeleteSchedule,
  handleDeleteDoctor,
  handleDateChange,
}: DoctorManagementTableProps) => {
  const [listColumnsTable, setListColumnsTable] = useState<ColumnDef<User>[]>();
  const [dataTable, setDataTable] = useState<User[]>([]);

  // Format date to HH:mm with locale
  const formatTime = (dateString: string) =>
    format(parseISO(dateString), "HH:mm", { locale: vi });

  // Get schedules filtered by doctor and selected date
  const getDoctorSchedules = (doctorId: string) =>
    schedulesData?.filter(
      (schedule) =>
        schedule.userId === doctorId &&
        format(parseISO(schedule.startDate), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
    ) || [];

  useEffect(() => {
    const listColumns = [
      ...ColumsTableDoctorMgmt,
      {
        accessorKey: "doctorSchedules",
        header: ({ column }: { column: any }) => (
          <DataTableColumnHeader column={column} title="Lịch rảnh hôm nay" />
        ),
        cell: ({ row }: { row: any }) => {
          const doctorSchedules =
            (row.getValue("doctorSchedules") as DoctorSchedule[]) || [];
          return renderDoctorScheduleCell(doctorSchedules);
        },
      },

      {
        accessorKey: "actions",
        header: () => <>...</>,
        cell: ({ row }: { row: any }) => (
          <button
            onClick={() => handleDeleteDoctor(row.getValue("id"))}
            className="text-destructive"
          >
            🗑️
          </button>
        ),
      },
    ];
    setListColumnsTable(listColumns);
    setDataTable(
      doctorList?.map((doctor: User) => ({
        ...doctor,
        doctorSchedules: getDoctorSchedules(doctor.id),
      })) || []
    );
  }, [doctorList, schedulesData]);

  const renderDoctorScheduleCell = (doctorSchedules: DoctorSchedule[]) => {
    if (!doctorSchedules.length) {
      return (
        <p className="text-sm text-muted-foreground italic">
          Không có lịch rảnh
        </p>
      );
    }

    return doctorSchedules.map((schedule) => {
      const startTime = formatTime(schedule.startDate);
      const endTime = formatTime(schedule.endDate);

      return (
        <div
          key={schedule.id}
          className="flex justify-between bg-muted px-3 py-1 rounded-lg text-sm"
        >
          <span className="text-muted-foreground">
            {startTime} - {endTime}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditSchedule(schedule)}
              className="text-primary"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDeleteSchedule(schedule.id)}
              className="text-destructive"
            >
              🗑️
            </button>
          </div>
        </div>
      );
    });
  };

  ////////////////////////////////////
  // Define the columns for the DataTable

  return (
    <div className="bg-card rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bác sĩ</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={handleAddDoctor}>+ Thêm bác sĩ</Button>
          <Button onClick={handleAddSchedule}>+ Tạo lịch rảnh</Button>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Chọn ngày:</label>
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={handleDateChange}
              className="border rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </div>

      {isLoadingSchedules || isLoadingDoctors ? (
        <div className="flex justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <DataTableCSR data={dataTable || []} columns={listColumnsTable || []} />
        </div>
      )}

      {!isLoadingSchedules && !isLoadingDoctors && doctorList?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có bác sĩ nào</p>
        </div>
      )}
    </div>
  );
};

export default DoctorManagementTable;
