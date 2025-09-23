import { DoctorSchedule, User } from "@/api/doctor/types";
import { ModalCustom } from "../modal-custom";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export default function ModalScheduleDoctor({
  doctorSchedules = [],
  handleEditSchedule = () => {},
  handleDeleteSchedule = () => {},
}: {
  doctorSchedules: DoctorSchedule[];
  handleEditSchedule?: (schedule: DoctorSchedule) => void;
  handleDeleteSchedule?: (scheduleId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    if (doctorSchedules.length > 0) {
      setUser(doctorSchedules[0].user);
    }
  }, [doctorSchedules]);

  const handleOpenModal = () => {
    setIsOpen(true);
  };
  return (
    <div>
      <div>
        {doctorSchedules.length > 0 ? (
          <button
            onClick={handleOpenModal}
            className="text-primary underline hover:no-underline cursor-pointer"
          >
            Danh sách lịch rảnh
          </button>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Không có lịch rảnh
          </p>
        )}
      </div>
      <ModalCustom
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Lịch rảnh của bác sĩ - ${user?.fullName}`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            {doctorSchedules.length === 0 ? (
              <p className="text-center text-muted-foreground italic py-10">
                Không có lịch hẹn nào.
              </p>
            ) : (
              <div className="space-y-4 max-h-[520px] min-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {doctorSchedules.map((schedule) => {
                  const startDate = format(
                    parseISO(schedule.startDate),
                    "dd/MM/yyyy HH:mm",
                    { locale: vi }
                  );
                  const endDate = format(
                    parseISO(schedule.endDate),
                    "dd/MM/yyyy HH:mm",
                    { locale: vi }
                  );

                  return (
                    <div
                      key={schedule.id}
                      className="bg-card border border-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-primary text-base">
                          Trạng thái:
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            schedule.status.toLowerCase() === "free"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {schedule.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1 mb-4">
                        <div>
                          <span className="font-medium">Bắt đầu:</span>{" "}
                          <span>{startDate}</span>
                        </div>
                        <div>
                          <span className="font-medium">Kết thúc:</span>{" "}
                          <span>{endDate}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => handleEditSchedule(schedule)}
                          aria-label="Chỉnh sửa lịch"
                          className="text-primary hover:text-primary/80 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          aria-label="Xóa lịch"
                          className="text-destructive hover:text-destructive/80 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ModalCustom>
    </div>
  );
}
