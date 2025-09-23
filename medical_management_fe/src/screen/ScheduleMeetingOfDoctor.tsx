import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { meetingApi } from "@/api/meeting/meeting.api";
import { doctorApi } from "@/api/doctor/doctor.api";
import { authApi } from "@/api/auth/auth.api";
import { MeetingScheduleAvailableForDoctor } from "@/api/meeting/types";
import { CalendarHeader } from "@/components/ui/calendar-header";
import { cn } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { DayView } from "@/components/ui/day-view"
import { WeekView } from "@/components/ui/week-view"
import { mapMeetingToEvent, CalendarEvent } from "@/lib/calendarEvents";
import { Button } from "@/components/ui/button";
import { CreateMedicalScheduleWithoutOrderDoctorDialog } from "@/components/dialogs/medical-schedules/create-without-order.doctor.dialog";
import { useNavigate } from "react-router-dom";
// Main component with calendar - This is the main export
export const ScheduleMeetingOfDoctor: React.FC = () => {
    // Calendar states
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<"day" | "week" | "month">("month")
    const [showDialog, setShowDialog] = useState(false);
    const [dialogStatus, setDialogStatus] = useState<{ isCreate: boolean, isUpdate: boolean }>({ isCreate: false, isUpdate: false });
    const [selectedSchedule, setSelectedSchedule] = useState<MeetingScheduleAvailableForDoctor | null>(null);
    const [registering, setRegistering] = useState(false);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        date: '',
        startTime: '',
        endTime: ''
    });

    // New states for view registered schedules dialog
    const [showViewSchedulesDialog, setShowViewSchedulesDialog] = useState(false);
    const [registeredSchedules, setRegisteredSchedules] = useState<any[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        status: 'all',
        search: ''
    });

    // Navigation hook
    const navigate = useNavigate();

    // Function to extract meetingId and name from meetingUrl
    const extractMeetingParams = (meetingUrl: string): { meetingId: string | null; name: string | null } => {
        console.log('extractMeetingParams input URL:', meetingUrl);

        try {
            const url = new URL(meetingUrl);
            const pathSegments = url.pathname.split('/').filter(Boolean);
            console.log('pathSegments:', pathSegments);

            // URL format updated: https://meeting.minhtuandng.id.vn/:meetingId
            // Only one segment after domain which is the meetingId
            const result = {
                meetingId: pathSegments.length > 0 ? pathSegments[0] : null,
                name: pathSegments.length > 1 ? pathSegments[1] : 'meeting' // Default name if not provided
            };

            console.log('extractMeetingParams result:', result);
            return result;
        } catch (error) {
            console.error('Lỗi khi parse meeting URL:', error);
            return { meetingId: null, name: null };
        }
    };

    // Function to handle join meeting
    const handleJoinMeeting = (meetingUrl: string) => {
        const { meetingId, name } = extractMeetingParams(meetingUrl);
        if (meetingId) {
            // If name is provided and not the default value, use the full route
            if (name && name !== 'meeting') {
                navigate(`/video-call/${meetingId}/${name}`);
            } else {
                // If no name or default name, use the simple route
                navigate(`/video-call/${meetingId}`);
            }
        } else {
            toast.error("Không thể lấy thông tin cuộc họp từ URL!", {
                duration: 3000,
                position: "top-right",
            });
        }
    };

    // Toast configuration
    const toastConfig = {
        success: {
            duration: 3000,
            position: "top-right" as const,
            style: {
                background: "#10B981",
                color: "#fff",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                zIndex: 999999,
            },
        },
        error: {
            duration: 4000,
            position: "top-right" as const,
            style: {
                background: "#EF4444",
                color: "#fff",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
                zIndex: 999999,
            },
        },
        warning: {
            duration: 4000,
            position: "top-right" as const,
            style: {
                background: "#F59E0B",
                color: "#fff",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)",
                zIndex: 999999,
            },
        },
    };

    const queryClient = useQueryClient();

    const confirmCompleteScheduleMutation = useMutation({
        mutationFn: (id: string) => meetingApi.updateMeetingSchedule(id, { status: "COMPLETED" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["meetingSchedules"] });
            toast.success("Xác nhận đã họp thành công!");
            refetchMeetingSchedule();
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message ||
                "Không thể xác nhận đã họp. Vui lòng thử lại sau."
            );
        },
    });

    // Get current user data
    const { data: userData } = useQuery({
        queryKey: ["currentUser"],
        queryFn: authApi.getCurrentUser,
    });

    // Extract doctor ID from current user
    const doctorId = userData?.data?.id || "";

    // Get meeting schedules data - unified query for both list and calendar
    const { data: meetingSchedulesResponse, isLoading: loading, error: queryError, refetch: refetchMeetingSchedule } = useQuery({
        queryKey: ["meetingSchedulesAvailable"],
        queryFn: meetingApi.getMeetingSchedulesAvailableForDoctor,
    });

    // Get meeting schedules data for calendar
    const { data: meetingSchedulesData, refetch: refetchMeetingSchedulesData } = useQuery({
        queryKey: ["meetingSchedules"],
        queryFn: meetingApi.getMeetingSchedules,
    });



    // Extract data from React Query response
    const meetingSchedules = meetingSchedulesResponse?.data?.data || [];
    const error = queryError ? "Không thể tải danh sách lịch hẹn" : null;

    const getStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium";
        switch (status) {
            case "PENDING":
                return `${baseClasses} bg-amber-100 text-amber-800`;
            case "COMPLETED":
                return `${baseClasses} bg-emerald-100 text-emerald-800`;
            case "CANCELLED":
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getScheduleBadge = (doctorScheduleFreeId: string | null) => {
        const baseClasses = "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium";
        if (doctorScheduleFreeId) {
            return `${baseClasses} bg-blue-100 text-blue-800`;
        }
        return `${baseClasses} bg-orange-100 text-orange-800`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (dateString: string) => {
        return `${String(new Date(dateString.replace('Z', '')).getHours()).padStart(2, '0')}:${String(new Date(dateString.replace('Z', '')).getMinutes()).padStart(2, '0')}`
    };

    const formatDateOnly = (dateString: string) => {
        return `Ngày ${new Date(new Date(dateString).getFullYear(), new Date(dateString).getMonth(), new Date(dateString).getDate()).getDate()} tháng ${new Date(dateString).getMonth() + 1} năm ${new Date(dateString).getFullYear()}`
    };

    const handleRegisterClick = (schedule: MeetingScheduleAvailableForDoctor) => {
        setSelectedSchedule(schedule);
        setShowDialog(true);
    };

    const handleConfirmRegister = async () => {
        if (!selectedSchedule) return;

        try {
            setRegistering(true);
            await meetingApi.registerSchedule({
                meetingScheduleId: selectedSchedule.id
            });

            // Refresh data after successful registration
            await refetchMeetingSchedule();

            setShowDialog(false);
            setSelectedSchedule(null);
            toast.success("🎉 Đăng ký tư vấn thành công!", toastConfig.success);
        } catch (err: any) {
            console.error("Lỗi khi đăng ký:", err);

            // Handle specific error cases
            if (err?.response?.status === 409) {
                toast.error(
                    `⚠️ ${err.response?.data?.message || "Lịch trình bị trùng với lịch đã có"}`,
                    toastConfig.warning
                );
            } else if (err?.response?.data?.message) {
                toast.error(`❌ ${err.response.data.message}`, toastConfig.error);
            } else {
                toast.error("❌ Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!", toastConfig.error);
            }
        } finally {
            setRegistering(false);
        }
    };

    const handleCancelRegister = () => {
        setShowDialog(false);
        setSelectedSchedule(null);
    };

    // New handlers for view registered schedules
    const handleViewSchedulesClick = async () => {
        if (!userData?.data?.id) {
            toast.error("🔐 Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại!", toastConfig.error);
            return;
        }

        try {
            setLoadingSchedules(true);
            setShowViewSchedulesDialog(true);

            const response = await doctorApi.getSchedulesByUserId(userData.data.id);
            setRegisteredSchedules(response.data);
        } catch (err: any) {
            console.error("Lỗi khi tải lịch đã đăng ký:", err);
            toast.error("❌ Không thể tải lịch đã đăng ký. Vui lòng thử lại!", toastConfig.error);
            setShowViewSchedulesDialog(false);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleViewSchedulesClose = () => {
        setShowViewSchedulesDialog(false);
        setRegisteredSchedules([]);
    };

    // Filter logic
    const filteredSchedules = meetingSchedules.filter(schedule => {
        // Status filter
        if (filters.status !== 'all' && schedule.status !== filters.status) {
            return false;
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            let matchesPatient = false;
            let matchesService = false;

            // Check patient name from order, patient field, or doctorScheduleFree
            if (schedule.order?.user?.fullName) {
                matchesPatient = schedule.order.user.fullName.toLowerCase().includes(searchLower);
            } else if (schedule.patient?.fullName) {
                matchesPatient = schedule.patient.fullName.toLowerCase().includes(searchLower);
            } else if (schedule.doctorScheduleFree?.user?.fullName) {
                matchesPatient = schedule.doctorScheduleFree.user.fullName.toLowerCase().includes(searchLower);
            }

            // Check service name (only available for order-based schedules)
            if (schedule.order?.productServices?.name) {
                matchesService = schedule.order.productServices.name.toLowerCase().includes(searchLower);
            }

            if (!matchesPatient && !matchesService) {
                return false;
            }
        }

        return true;
    });

    const handleFilterChange = (filterType: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // New handlers for schedule creation
    const handleCreateScheduleClick = () => {
        setShowCreateDialog(true);
    };

    const handleCreateCancel = () => {
        setShowCreateDialog(false);
        setNewSchedule({
            date: '',
            startTime: '',
            endTime: ''
        });
    };

    const handleDateTimeChange = (field: string, value: string) => {
        setNewSchedule(prev => {
            const updated = { ...prev, [field]: value };

            // Auto calculate end time when start time changes
            if (field === 'startTime' && value) {
                const [hours, minutes] = value.split(':');
                const startTime = new Date();
                startTime.setHours(parseInt(hours), parseInt(minutes));

                // Add 30 minutes
                const endTime = new Date(startTime.getTime() + 30 * 60000);
                updated.endTime = endTime.toTimeString().slice(0, 5);
            }

            return updated;
        });
    };

    const formatDateTimeToISO = (dateStr: string, timeStr: string) => {
        // Hàm chuyển đổi y hệt như JavaScript version
        // dateStr format: "2025-01-11" 
        // timeStr format: "21:00"
        // return `${dateStr}T${timeStr}:00.000Z`;
        
        return `${dateStr}T${timeStr}:00.000Z`;
      }

    const handleCreateConfirm = async () => {
        if (!newSchedule.date || !newSchedule.startTime) {
            toast.error("⚠️ Vui lòng điền đầy đủ thông tin!", toastConfig.error);
            return;
        }

        if (!userData?.data?.id) {
            toast.error("🔐 Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại!", toastConfig.error);
            return;
        }

        try {
            setCreating(true);

            // Combine date and time
            const startDateTime = formatDateTimeToISO(newSchedule.date, newSchedule.startTime);
            const endDateTime = formatDateTimeToISO(newSchedule.date, newSchedule.endTime);

            // Call API to create doctor schedule
            await doctorApi.createSchedule({
                userId: userData.data.id,
                startDate: startDateTime,
                endDate: endDateTime
            });

            // Refresh data after successful creation
            await refetchMeetingSchedule();
            await refetchMeetingSchedulesData();
            setShowCreateDialog(false);
            setNewSchedule({
                date: '',
                startTime: '',
                endTime: ''
            });

            toast.success("🎉 Đăng ký lịch khám thành công!", toastConfig.success);
        } catch (err: any) {
            console.error("Lỗi khi tạo lịch khám:", err);

            // Handle specific error cases
            if (err?.response?.status === 409) {
                toast.error(
                    `⚠️ ${err.response?.data?.message || "Lịch trình bị trùng với lịch đã có"}`,
                    toastConfig.warning
                );
            } else if (err?.response?.data?.message) {
                toast.error(`❌ ${err.response.data.message}`, toastConfig.error);
            } else {
                toast.error("❌ Có lỗi xảy ra khi tạo lịch khám. Vui lòng thử lại!", toastConfig.error);
            }
        } finally {
            setCreating(false);
        }
    };

    // Calendar functions
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
                const aaa =  mapMeetingToEvent(meeting);
                console.log('aaa', aaa);
                return aaa;
            } catch (error) {
                return null;
            }
        }).filter(Boolean) as CalendarEvent[]
        : [];

    const testEvents: CalendarEvent[] = false ? [] : events;

    console.log('testEvents', testEvents);


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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <div className="text-lg font-medium text-gray-700">Đang tải dữ liệu...</div>
                    <div className="text-sm text-gray-500 mt-2">Vui lòng chờ trong giây lát</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex justify-center items-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="text-red-600 text-lg font-semibold mb-2">{error}</div>
                    <div className="text-gray-500 text-sm">Vui lòng thử tải lại trang</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="mx-auto">
                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Lịch Hẹn Khám Bệnh</h1>
                        <p className="text-gray-600">Quản lý và đăng ký tư vấn bệnh nhân</p>
                    </div>

                    {/* Actions & Stats */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-2">
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleCreateScheduleClick}
                                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Đăng ký lịch khám
                            </button>
                            <button
                                onClick={handleViewSchedulesClick}
                                className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                                </svg>
                                Xem lịch đã đăng ký
                            </button>
                        </div>

                        <div className="text-right">
                            <div className="text-sm text-gray-500">Hiển thị</div>
                            <div className="text-xl font-semibold text-gray-900">{filteredSchedules.length} / {meetingSchedules.length}</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        placeholder="Tên bệnh nhân, dịch vụ..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="PENDING">Chưa diễn ra</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>

                            {/* Reset Filters */}
                            <div className="flex items-end">
                                <button
                                    onClick={() => setFilters({ status: 'all', search: '' })}
                                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto py-2">
                {meetingSchedules.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch hẹn nào</h3>
                        <p className="text-gray-600 mb-6">Hiện tại chưa có lịch hẹn khám bệnh nào được tạo</p>
                        <button
                            onClick={handleCreateScheduleClick}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Đăng ký lịch khám bệnh
                        </button>
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                        <p className="text-gray-600 mb-6">Không có lịch hẹn nào phù hợp với bộ lọc hiện tại</p>
                        <button
                            onClick={() => setFilters({ status: 'all', search: '' })}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSchedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className={getStatusBadge(schedule.status)}>
                                                {schedule.status === "PENDING" && "Chưa diễn ra"}
                                                {schedule.status === "COMPLETED" && "Hoàn thành"}
                                                {schedule.status === "CANCELLED" && "Đã hủy"}
                                            </span>
                                            <span className={getScheduleBadge(schedule.doctorScheduleFreeId)}>
                                                {schedule.doctorScheduleFreeId ? "Bạn đã nhận lịch" : "Chưa có bác sĩ nhận lịch"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Meeting URL Button */}
                                            {
                                                schedule.status === "PENDING" && schedule.doctorScheduleFreeId && (
                                                    <Button variant="default" onClick={() => confirmCompleteScheduleMutation.mutate(schedule.id)}>Xác nhận đã họp</Button>
                                                )
                                            }
                                            {schedule.meetingUrl && (
                                                <button
                                                    onClick={() => handleJoinMeeting(schedule.meetingUrl as string)}
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    Tham gia cuộc họp
                                                </button>
                                            )}

                                            {/* Register Button - Only show if no doctor schedule assigned, status is PENDING, and has order or patient */}
                                            {!schedule.doctorScheduleFreeId && schedule.status === "PENDING" && (schedule.order || schedule.patient) && (
                                                <button
                                                    onClick={() => handleRegisterClick(schedule)}
                                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Đăng ký tư vấn
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="grid lg:grid-cols-2 gap-6">
                                        {/* Time */}
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-900 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Thời gian
                                            </h4>
                                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <div className="text-sm text-blue-700 mb-1">Ngày khám</div>
                                                <div className="font-medium text-blue-900">{formatDateOnly(schedule.startDate)}</div>
                                                <div className="flex items-center justify-between mt-2 text-sm">
                                                    <span className="text-blue-700">
                                                        <span className="font-medium">{formatTime(schedule.startDate)}</span> - <span className="font-medium">{formatTime(schedule.endDate)}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Patient */}
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-900 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {schedule.order ? 'Bệnh nhân (Có đơn hàng)' : schedule.patient ? 'Bệnh nhân (Không đơn hàng)' : 'Lịch trống'}
                                            </h4>
                                            <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                                                {schedule.order ? (
                                                    <>
                                                        <div className="font-medium text-rose-900 mb-1">
                                                            {schedule.order.user.fullName}
                                                        </div>
                                                        <div className="text-sm text-rose-700 mb-2">
                                                            {schedule.order.user.phoneNumber && `📞 ${schedule.order.user.phoneNumber}`}
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-rose-600">Dịch vụ:</span>
                                                            <span className="text-rose-900 font-medium ml-1">
                                                                {schedule.order.productServices.name}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : schedule.patient ? (
                                                    <>
                                                        <div className="font-medium text-rose-900 mb-1">
                                                            {schedule.patient.fullName}
                                                        </div>
                                                        <div className="text-sm text-rose-700 mb-2">
                                                            {schedule.patient.phoneNumber && `📞 ${schedule.patient.phoneNumber}`}
                                                        </div>
                                                        <div className="text-sm text-blue-600">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100">
                                                                Lịch hẹn không qua đơn hàng
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <div className="text-gray-500 text-sm">
                                                            Lịch trống - Chưa có bệnh nhân đặt lịch
                                                        </div>
                                                        {schedule.doctorScheduleFree && (
                                                            <div className="mt-2 text-xs text-gray-400">
                                                                Bác sĩ: {schedule.doctorScheduleFree.user.fullName}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Enhanced Confirmation Dialog */}
            {
                showDialog && selectedSchedule && (selectedSchedule.order || selectedSchedule.patient) && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Dialog Header - Fixed */}
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl flex-shrink-0">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Xác nhận đăng ký tư vấn
                                </h2>
                            </div>

                            {/* Dialog Content - Scrollable */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng ký tư vấn cho bệnh nhân này không?</p>

                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200 space-y-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <span className="text-sm text-gray-500">Thời gian khám</span>
                                            <div className="font-semibold text-gray-900">{formatDate(selectedSchedule.startDate)}</div>
                                        </div>
                                    </div>

                                    {selectedSchedule.order ? (
                                        <>
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <div>
                                                    <span className="text-sm text-gray-500">Bệnh nhân (Có đơn hàng)</span>
                                                    <div className="font-semibold text-gray-900">{selectedSchedule.order.user.fullName}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                <div>
                                                    <span className="text-sm text-gray-500">Gói khám</span>
                                                    <div className="font-semibold text-gray-900">{selectedSchedule.order.productServices.name}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                <div>
                                                    <span className="text-sm text-gray-500">Giá tiền</span>
                                                    <div className="font-bold text-green-600 text-lg">
                                                        {selectedSchedule.order.productServices.price.toLocaleString("vi-VN")} VNĐ
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : selectedSchedule.patient ? (
                                        <>
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <div>
                                                    <span className="text-sm text-gray-500">Bệnh nhân (Không đơn hàng)</span>
                                                    <div className="font-semibold text-gray-900">{selectedSchedule.patient.fullName}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <div>
                                                    <span className="text-sm text-gray-500">Số điện thoại</span>
                                                    <div className="font-semibold text-gray-900">{selectedSchedule.patient.phoneNumber}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <span className="text-sm text-gray-500">Loại lịch hẹn</span>
                                                    <div className="font-semibold text-blue-600">Lịch hẹn trực tiếp (Miễn phí)</div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <div className="text-gray-500">
                                                Lịch trống - Chưa có thông tin bệnh nhân
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dialog Actions - Fixed */}
                            <div className="px-6 pb-6 flex-shrink-0 border-t border-gray-100">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancelRegister}
                                        disabled={registering}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={handleConfirmRegister}
                                        disabled={registering}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {registering ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Xác nhận đăng ký
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Schedule Dialog */}
            {
                showCreateDialog && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Dialog Header - Fixed */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-2xl flex-shrink-0">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Đăng ký lịch khám bệnh
                                </h2>
                            </div>

                            {/* Dialog Content - Scrollable */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <p className="text-gray-600 mb-6">Vui lòng điền thông tin lịch khám mới:</p>

                                <div className="space-y-4">
                                    {/* Date Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Ngày khám
                                        </label>
                                        <input
                                            type="date"
                                            value={newSchedule.date}
                                            onChange={(e) => handleDateTimeChange('date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* Start Time Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Giờ bắt đầu
                                        </label>
                                        <input
                                            type="time"
                                            value={newSchedule.startTime}
                                            onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* End Time Input (Auto-calculated) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Giờ kết thúc (Tự động +30 phút)
                                        </label>
                                        <input
                                            type="time"
                                            value={newSchedule.endTime}
                                            readOnly
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Summary */}
                                    {newSchedule.date && newSchedule.startTime && (
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                            <h4 className="font-medium text-blue-900 mb-2">Tóm tắt lịch khám:</h4>
                                            <div className="text-sm text-blue-700 space-y-1">
                                                <div>📅 Ngày: {new Date(newSchedule.date).toLocaleDateString('vi-VN')}</div>
                                                <div>⏰ Thời gian: {newSchedule.startTime} - {newSchedule.endTime}</div>
                                                <div>⏱️ Thời lượng: 30 phút</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dialog Actions - Fixed */}
                            <div className="px-6 pb-6 flex-shrink-0 border-t border-gray-100">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCreateCancel}
                                        disabled={creating}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={handleCreateConfirm}
                                        disabled={creating || !newSchedule.date || !newSchedule.startTime}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {creating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Tạo lịch khám
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* View Registered Schedules Dialog */}
            {
                showViewSchedulesDialog && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Dialog Header - Fixed */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-2xl flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white flex items-center">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Lịch đã đăng ký ({registeredSchedules.length})
                                    </h2>
                                    <button
                                        onClick={handleViewSchedulesClose}
                                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Dialog Content - Scrollable */}
                            <div className="p-6 overflow-y-auto flex-1">
                                {loadingSchedules ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                        <span className="ml-3 text-lg text-gray-700">Đang tải dữ liệu...</span>
                                    </div>
                                ) : registeredSchedules.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch đăng ký</h3>
                                        <p className="text-gray-500">Bạn chưa đăng ký lịch khám nào</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {registeredSchedules.map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:border-blue-200 group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${schedule.status === 'BOOKED'
                                                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                                                                : schedule.status === 'FREE'
                                                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                                                                    : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200'
                                                                }`}>
                                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                    <circle cx="10" cy="10" r="3" />
                                                                </svg>
                                                                {schedule.status === 'BOOKED' ? 'Đã đặt lịch' : schedule.status === 'FREE' ? 'Lịch trống' : schedule.status}
                                                            </span>
                                                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                                                {['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][new Date(schedule.startDate).getDay()]}
                                                            </div>
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            {/* Schedule Info */}
                                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    </div>
                                                                    Thời gian khám
                                                                </h4>
                                                                <div className="space-y-4">
                                                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Ngày khám</span>
                                                                        <div className="font-bold text-gray-900 text-lg mt-1">
                                                                            {formatDateOnly(schedule.startDate)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Bắt đầu</span>
                                                                            <div className="font-bold text-blue-600 text-lg mt-1">{formatTime(schedule.startDate)}</div>
                                                                        </div>
                                                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Kết thúc</span>
                                                                            <div className="font-bold text-blue-600 text-lg mt-1">{formatTime(schedule.endDate)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Doctor Info */}
                                                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                                                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                    </div>
                                                                    Thông tin bác sĩ
                                                                </h4>
                                                                <div className="space-y-4">
                                                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Bác sĩ</span>
                                                                        <div className="font-bold text-gray-900 text-lg mt-1">{schedule.user.fullName}</div>
                                                                    </div>
                                                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Số điện thoại</span>
                                                                        <div className="font-bold text-gray-900 text-lg mt-1">{schedule.user.phoneNumber}</div>
                                                                    </div>
                                                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Chuyên khoa</span>
                                                                        <div className="mt-2">
                                                                            <span className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-sm font-bold border border-purple-200">
                                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                                                </svg>
                                                                                {schedule.user.majorDoctor === 'DINH_DUONG' ? 'Dinh dưỡng' : 'Tâm thần'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dialog Footer */}
                            <div className="px-6 pb-6">
                                <button
                                    onClick={handleViewSchedulesClose}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="border-t border-gray-200">
                <div className="px-4 py-2">
                    <CalendarHeader handleCreate={() => setDialogStatus((prev) => ({ ...prev, isCreate: true }))} currentDate={currentDate} setCurrentDate={setCurrentDate} view={view} setView={setView} />
                    <div className="mt-4">
                        {renderView()}
                    </div>
                </div>
            </div>
            <CreateMedicalScheduleWithoutOrderDoctorDialog onCreateSuccess={() => {
                refetchMeetingSchedule();
                refetchMeetingSchedulesData();
            }} open={dialogStatus.isCreate} onOpenChange={() => setDialogStatus((prev) => ({ ...prev, isCreate: false }))} doctorId={doctorId} />
        </div>
    );
};
// rebuild