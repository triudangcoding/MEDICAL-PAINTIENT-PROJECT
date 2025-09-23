import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { meetingApi } from "../api/meeting/meeting.api";
// import { orderApi } from "../api/order/order.api";
// import { doctorApi } from "../api/doctor/doctor.api";
// import {
//   MeetingSchedule,
//   UpdateMeetingScheduleData,
//   MeetingScheduleListResponse,
// } from "../api/meeting/types";
// import { toast } from "react-hot-toast";
// import { ModalCustom } from "@/components/modal-custom";
// import { AxiosError } from "axios";
// import { DoctorSchedule, DoctorSchedulesResponse } from "../api/doctor/types";
import { CalendarHeader } from "@/components/ui/calendar-header";
import { cn } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { DayView } from "@/components/ui/day-view"
import { WeekView } from "@/components/ui/week-view"
import { mapMeetingToEvent, CalendarEvent } from "@/lib/calendarEvents";
import { CreateMedicalScheduleWithoutOrderAdminDialog } from "@/components/dialogs/medical-schedules/create-without-order.admin.dialog";


const MedicalSchedules: React.FC = () => {
  const [dialogStatus, setDialogStatus] = useState<{ isCreate: boolean, isUpdate: boolean }>({ isCreate: false, isUpdate: false });
  // const [selectedDate, setSelectedDate] = useState(new Date());
  // const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  // const [scheduleType, setScheduleType] = useState<
  //   "with-order" | "without-order"
  // >("with-order");
  // const [editingSchedule, setEditingSchedule] =
  //   useState<MeetingSchedule | null>(null);
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [scheduleToDelete, setScheduleToDelete] =
  //   useState<MeetingSchedule | null>(null);
  // const [scheduleForm, setScheduleForm] = useState<{
  //   orderId: string;
  //   doctorScheduleFreeId: string;
  //   startDate: string;
  //   endDate: string;
  // }>({
  //   orderId: "",
  //   doctorScheduleFreeId: "",
  //   startDate: "",
  //   endDate: "",
  // });
  // const [withoutOrderForm, setWithoutOrderForm] = useState<{
  //   startDate: string;
  //   endDate: string;
  //   doctorId: string;
  //   patientId: string;
  // }>({
  //   startDate: "",
  //   endDate: "",
  //   doctorId: "",
  //   patientId: "",
  // });

  // const queryClient = useQueryClient();

  const { data: meetingSchedulesData, refetch: refetchMeetingSchedule } = useQuery({
    queryKey: ["meetingSchedules"],
    queryFn: meetingApi.getMeetingSchedules,
  });



  // const { data: orders } = useQuery({
  //   queryKey: ["orders"],
  //   queryFn: orderApi.getOrders,
  // });

  // const { data: doctorSchedules } = useQuery<DoctorSchedulesResponse>({
  //   queryKey: ["doctorSchedules"],
  //   queryFn: () => doctorApi.getDoctorSchedules(),
  // });

  // const createScheduleMutation = useMutation({
  //   mutationFn: meetingApi.createMeetingSchedule,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["meetingSchedules"] });
  //     toast.success("Tạo lịch hẹn thành công!", toastConfig.success);
  //     setIsAddingSchedule(false);
  //     setScheduleForm({
  //       orderId: "",
  //       doctorScheduleFreeId: "",
  //       startDate: "",
  //       endDate: "",
  //     });
  //   },
  //   onError: (error: AxiosError<ApiError>) => {
  //     toast.error(
  //       error.response?.data?.message ||
  //       "Không thể tạo lịch hẹn. Vui lòng thử lại sau.",
  //       toastConfig.error
  //     );
  //   },
  // });

  // const updateScheduleMutation = useMutation({
  //   mutationFn: ({
  //     id,
  //     data,
  //   }: {
  //     id: string;
  //     data: UpdateMeetingScheduleData;
  //   }) => meetingApi.updateMeetingSchedule(id, data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["meetingSchedules"] });
  //     toast.success("Cập nhật lịch hẹn thành công!", toastConfig.success);
  //     setEditingSchedule(null);
  //     setScheduleForm({
  //       orderId: "",
  //       doctorScheduleFreeId: "",
  //       startDate: "",
  //       endDate: "",
  //     });
  //   },
  //   onError: (error: AxiosError<ApiError>) => {
  //     toast.error(
  //       error.response?.data?.message ||
  //       "Không thể cập nhật lịch hẹn. Vui lòng thử lại sau.",
  //       toastConfig.error
  //     );
  //   },
  // });

  // const handleAddWithoutOrder = () => {
  //   setIsAddingSchedule(true);
  //   setScheduleType("without-order");
  //   const now = new Date();
  //   const endTime = new Date(now.getTime() + 30 * 60000); // 30 minutes later
  //   setWithoutOrderForm({
  //     startDate: now.toISOString(),
  //     endDate: endTime.toISOString(),
  //     doctorId: "",
  //     patientId: "",
  //   });
  // };

  // const handleWithoutOrderSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const formattedData = {
  //     ...withoutOrderForm,
  //     startDate: `${withoutOrderForm.startDate}:00.000Z`,
  //     endDate: `${withoutOrderForm.endDate}:00.000Z`,
  //   };
  //   createWithoutOrderMutation.mutate(formattedData);
  // };

  // const handleWithoutOrderFormChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setWithoutOrderForm((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("month")

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }

  const getFirstDayOfMonth = () => {
    return startOfMonth(currentDate).getDay()
  }

  const handleSelectDay = (date: Date) => {
    setCurrentDate(date)
    setView("day")
  }

  const events: CalendarEvent[] = meetingSchedulesData && meetingSchedulesData.data && Array.isArray(meetingSchedulesData.data.data) && meetingSchedulesData.data.data.length > 0
    ? meetingSchedulesData.data.data.map((meeting: any) => {
        try {
          return mapMeetingToEvent(meeting);
        } catch (error) {
          return null;
        }
      }).filter(Boolean) as CalendarEvent[]
    : [];


  
  const testEvents: CalendarEvent[] = false ? [
    // Test buổi sáng (7h-11h)
    {
      id: "morning-1",
      title: "Lê Thị A - Khám sáng sớm",
      start: new Date(2025, 5, 10, 7, 5), // 7:05 -> làm tròn thành 7:00
      end: new Date(2025, 5, 10, 7, 35),  // 7:35
      color: "green",
      description: "Khám sức khỏe định kỳ",
      status: "PENDING",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/morning1"
    },
    {
      id: "morning-2",
      title: "Nguyễn Văn B - Tư vấn",
      start: new Date(2025, 5, 10, 7, 12), // 7:12 -> làm tròn thành 7:15
      end: new Date(2025, 5, 10, 7, 42),   // 7:42
      color: "blue",
      description: "Tư vấn dinh dưỡng",
      status: "COMPLETED",
      type: "FREE"
    },
    {
      id: "morning-3",
      title: "Trần Thị C - Khám tổng quát",
      start: new Date(2025, 5, 10, 8, 25), // 8:25 -> làm tròn thành 8:30
      end: new Date(2025, 5, 10, 8, 55),   // 8:55
      color: "red",
      description: "Khám tổng quát định kỳ",
      status: "PENDING",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/morning3"
    },
    {
      id: "morning-4",
      title: "Phạm Văn D - Tái khám",
      start: new Date(2025, 5, 10, 8, 40), // 8:40 -> làm tròn thành 8:45
      end: new Date(2025, 5, 10, 9, 10),   // 9:10
      color: "green",
      description: "Tái khám sau điều trị",
      status: "COMPLETED",
      type: "PAID"
    },
    {
      id: "morning-5", 
      title: "Hoàng Thị E - Cuộc hẹn",
      start: new Date(2025, 5, 10, 9, 55), // 9:55 -> làm tròn thành 10:00
      end: new Date(2025, 5, 10, 10, 25),  // 10:25
      color: "blue",
      description: "Cuộc hẹn tư vấn",
      status: "PENDING",
      type: "FREE",
      meetingUrl: "https://meeting.example.com/morning5"
    },
    {
      id: "morning-6",
      title: "Đỗ Văn F - Khám chuyên khoa",
      start: new Date(2025, 5, 10, 10, 8), // 10:08 -> làm tròn thành 10:00 (cùng slot với morning-5)
      end: new Date(2025, 5, 10, 10, 38),  // 10:38
      color: "red",
      description: "Khám chuyên khoa nội",
      status: "CANCELLED",
      type: "PAID"
    },
    {
      id: "morning-7",
      title: "Vũ Thị G - Tư vấn tâm lý",
      start: new Date(2025, 5, 11, 10, 45), // 10:45 -> làm tròn thành 10:45
      end: new Date(2025, 5, 11, 11, 15),   // 11:15
      color: "green",
      description: "Tư vấn tâm lý trẻ em",
      status: "PENDING",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/morning7"
    },
    {
      id: "morning-8",
      title: "Lý Văn H - Khám cuối buổi sáng",
      start: new Date(2025, 5, 11, 10, 55), // 10:55 -> làm tròn thành 11:00
      end: new Date(2025, 5, 11, 11, 25),   // 11:25
      color: "blue",
      description: "Khám sức khỏe tổng quát",
      status: "COMPLETED",
      type: "PAID"
    },
    
    // Test làm tròn thời gian và overlap trong cùng time slot
    {
      id: "test-1",
      title: "Nguyễn Văn A - Tư vấn dinh dưỡng",
      start: new Date(2025, 5, 10, 15, 5), // 15:05 -> làm tròn thành 15:00
      end: new Date(2025, 5, 10, 15, 35),  // 15:35
      color: "blue",
      description: "Dịch vụ tư vấn dinh dưỡng cho bệnh nhân ung thư",
      status: "PENDING",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/test1"
    },
    {
      id: "test-2", 
      title: "Trần Thị B - Cuộc hẹn",
      start: new Date(2025, 5, 10, 15, 8), // 15:08 -> làm tròn thành 15:00 (cùng slot với test-1)
      end: new Date(2025, 5, 10, 15, 38),  // 15:38
      color: "green",
      description: "Cuộc hẹn miễn phí",
      status: "COMPLETED",
      type: "FREE",
      meetingUrl: "https://meeting.example.com/test2"
    },
    {
      id: "test-3",
      title: "Lê Văn C - Khám tổng quát",
      start: new Date(2025, 5, 10, 15, 12), // 15:12 -> làm tròn thành 15:15
      end: new Date(2025, 5, 10, 15, 42),   // 15:42
      color: "red",
      description: "Khám sức khỏe tổng quát định kỳ",
      status: "PENDING",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/test3"
    },
    {
      id: "test-4",
      title: "Phạm Thị D - Tư vấn tâm lý",
      start: new Date(2025, 5, 10, 15, 20), // 15:20 -> làm tròn thành 15:15 (cùng slot với test-3)
      end: new Date(2025, 5, 10, 15, 50),   // 15:50
      color: "blue",
      description: "Tư vấn tâm lý cho trẻ em",
      status: "CANCELLED",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/test4"
    },
    
    // Test với time slot 30 phút
    {
      id: "test-5",
      title: "Hoàng Văn E - Cuộc hẹn",
      start: new Date(2025, 5, 10, 15, 35), // 15:35 -> làm tròn thành 15:30
      end: new Date(2025, 5, 10, 16, 5),    // 16:05
      color: "green",
      description: "Cuộc hẹn miễn phí",
      status: "PENDING",
      type: "FREE"
    },
    {
      id: "test-6",
      title: "Võ Thị F - Tư vấn dinh dưỡng",
      start: new Date(2025, 5, 10, 15, 42), // 15:42 -> làm tròn thành 15:30 (cùng slot với test-5)
      end: new Date(2025, 5, 10, 16, 12),   // 16:12
      color: "blue",
      description: "Tư vấn chế độ ăn cho người tiểu đường",
      status: "COMPLETED",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/test6"
    },
    {
      id: "test-7",
      title: "Đặng Văn G - Cuộc hẹn",
      start: new Date(2025, 5, 10, 15, 28), // 15:28 -> làm tròn thành 15:30 (cùng slot với test-5, test-6)
      end: new Date(2025, 5, 10, 15, 58),   // 15:58
      color: "red",
      description: "Cuộc hẹn miễn phí",
      status: "PENDING",
      type: "FREE",
      meetingUrl: "https://meeting.example.com/test7"
    },
    
    // Test với time slot 45 phút
    {
      id: "test-8",
      title: "Bùi Thị H - Khám chuyên khoa",
      start: new Date(2025, 5, 11, 16, 47), // 16:47 -> làm tròn thành 16:45
      end: new Date(2025, 5, 11, 17, 17),   // 17:17
      color: "blue",
      description: "Khám chuyên khoa tim mạch",
      status: "PENDING",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/test8"
    },
    {
      id: "test-9",
      title: "Ngô Văn I - Tái khám",
      start: new Date(2025, 5, 11, 16, 52), // 16:52 -> làm tròn thành 16:45 (cùng slot với test-8)
      end: new Date(2025, 5, 11, 17, 22),   // 17:22
      color: "green",
      description: "Tái khám sau điều trị",
      status: "COMPLETED",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/test9"
    },
    
    // Test làm tròn lên giờ tiếp theo
    {
      id: "test-10",
      title: "Trương Thị K - Cuộc hẹn",
      start: new Date(2025, 5, 12, 13, 55), // 13:55 -> làm tròn thành 14:00
      end: new Date(2025, 5, 12, 14, 25),   // 14:25
      color: "blue",
      description: "Cuộc hẹn miễn phí",
      status: "PENDING",
      type: "FREE"
    },
    {
      id: "test-11",
      title: "Phan Văn L - Tư vấn dinh dưỡng",
      start: new Date(2025, 5, 12, 14, 3), // 14:03 -> làm tròn thành 14:00 (cùng slot với test-10)
      end: new Date(2025, 5, 12, 14, 33),  // 14:33
      color: "red",
      description: "Tư vấn dinh dưỡng cho người cao tuổi",
      status: "PENDING",
      type: "PAID",
      meetingUrl: "https://meeting.example.com/test11"
    }
  ] : events;

  // Render view tương ứng
  const renderView = () => {
    switch (view) {
      case "day":
        return <DayView selectedDate={currentDate} events={testEvents} />
      case "week":
        return <WeekView selectedDate={currentDate} events={testEvents} onSelectDay={handleSelectDay} />
      case "month":
      default:
        return renderMonthView(testEvents)
    }
  }

  // Render chế độ xem tháng
  const renderMonthView = (events: CalendarEvent[]) => {
    const daysInMonth = getDaysInMonth()
    const firstDayOfMonth = getFirstDayOfMonth()

    const eventColors = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div key={day} className="p-2 font-medium text-center">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-32 sm:h-40 md:h-48" />
        ))}

        {daysInMonth.map((date, index) => {
          const isToday = isSameDay(date, new Date())
          const dayEvents = events.filter(ev => isSameDay(ev.start, date));
          const remainingEvents = dayEvents.length > 4 ? dayEvents.length - 4 : 0;

          return (
            <Card
              key={index}
              className={cn(
                "h-32 sm:h-40 md:h-48 transition-colors hover:border-primary/50 cursor-pointer overflow-hidden",
                isToday ? "border-primary border-2" : "",
              )}
              onClick={() => handleSelectDay(date)}
            >
              <CardContent className="p-2">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-center">{format(date, "EEEE", { locale: vi })}</div>
                  <div className={cn("text-lg sm:text-xl font-bold text-center", isToday ? "text-primary" : "")}>{format(date, "d")}</div>
                  
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 4).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded truncate",
                          eventColors[event.color]
                        )}
                        title={`${event.title} (${event.type === "PAID" ? "Gói có phí" : "Gói miễn phí"})`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {remainingEvents > 0 && (
                      <div className="text-xs text-gray-500 pl-1">
                        + {remainingEvents} lịch hẹn khác
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
        <CalendarHeader handleCreate={() => setDialogStatus((prev) => ({ ...prev, isCreate: true }))} currentDate={currentDate} setCurrentDate={setCurrentDate} view={view} setView={setView} />
        {renderView()}
        <CreateMedicalScheduleWithoutOrderAdminDialog onCreateSuccess={() => {
                refetchMeetingSchedule();
            }} open={dialogStatus.isCreate} onOpenChange={() => setDialogStatus((prev) => ({ ...prev, isCreate: false }))}  />
    </div>
    
  )
};

export default MedicalSchedules;
