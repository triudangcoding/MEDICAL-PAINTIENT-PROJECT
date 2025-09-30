import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { patientApi } from "@/api/patient/patient.api";
import { authApi } from "@/api/auth/auth.api";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  User,
  Activity
} from "lucide-react";
import { TimeValidationDialog } from "@/components/dialogs/TimeValidationDialog";
import { 
  isWithinTimeSlot, 
  formatTimeSlot, 
  getCurrentTimeInVietnamese 
} from "@/utils/timeValidation";
import { 
  translateRoute, 
  translateStatus
} from "@/utils/vietnameseEnums";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Types for better type safety
interface Prescription {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  notes?: string;
  doctor?: {
    fullName: string;
  };
  items: PrescriptionItem[];
}

interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequencyPerDay: number;
  timesOfDay: string[];
  durationDays: number;
  route?: string;
  instructions?: string;
}

interface AdherenceLog {
  id: string;
  takenAt: string;
  status: 'TAKEN' | 'MISSED' | 'SKIPPED';
  notes?: string;
  prescription?: {
    doctor?: {
      fullName: string;
    };
  };
  prescriptionItem?: {
    dosage: string;
    route?: string;
    medication?: {
      name: string;
      strength: string;
      form: string;
    };
  };
}

interface Alert {
  id: string;
  type: 'MISSED_DOSE' | 'LOW_ADHERENCE' | 'OTHER';
  resolved: boolean;
  message?: string;
  prescriptionId?: string;
}


interface OverviewData {
  activePrescriptions: number;
  takenLogs: number;
  missedLogs: number;
  unresolvedAlerts: number;
}

type PatientTab = "overview" | "prescriptions" | "history" | "reminders" | "alerts" | "adherence";

export default function PatientPage() {
  const queryClient = useQueryClient();
  const location = useLocation();

  const { data: me } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
  });
  const role = me?.data.role;

  // ============== PATIENT SELF-SERVICE TABS ==============
  const [activeTab, setActiveTab] = useState<PatientTab>("overview");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [confirmItemId, setConfirmItemId] = useState<string>("");
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  
  // Time validation dialog state
  const [timeValidationDialog, setTimeValidationDialog] = useState<{
    open: boolean;
    reminder: any | null;
  }>({
    open: false,
    reminder: null,
  });

  // Date picker state for reminders
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  // Time filter state for reminders
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all'); // 'all', 'Sáng', 'Trưa', 'Chiều', 'Tối'
  
  // Check if selected date is today
  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  // Filter reminders by time slot - will be defined after reminders query

  // Debug dialog state changes
  useEffect(() => {
    console.log('Dialog state changed:', timeValidationDialog);
  }, [timeValidationDialog]);

  const [firstWarningDialog, setFirstWarningDialog] = useState<{ open: boolean; doctorName?: string; message?: string }>(
    { open: false }
  );

  const { data: ovAlerts, isLoading: loadingOvAlerts } = useQuery({
    queryKey: ["patient-ov-alerts"],
    queryFn: patientApi.getAlerts,
    enabled: role === "PATIENT" && activeTab === "overview",
  });

  useEffect(() => {
    if (role !== "PATIENT") return;
    // Find first unresolved LOW_ADHERENCE alert
    const alertsArr = Array.isArray(ovAlerts) ? ovAlerts : [];
    const warn = alertsArr.find((a: any) => a.type === 'LOW_ADHERENCE' && !a.resolved);
    if (warn) {
      // Try to extract doctor name from message pattern "Bác sĩ <name> ..."
      const msg: string = warn.message || '';
      const match = msg.match(/Bác sĩ\s+([^\s].*?)\s+nhắc/);
      const doctorName = match?.[1];
      setFirstWarningDialog({ open: true, doctorName, message: warn.message });
    }
  }, [role, ovAlerts]);

  // Utility functions
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : 
      `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'TAKEN':
        return 'bg-emerald-100 text-emerald-700';
      case 'MISSED':
        return 'bg-amber-100 text-amber-700';
      case 'SKIPPED':
        return 'bg-zinc-100 text-zinc-700';
      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  };

  const getStatusText = (status: string): string => {
    return translateStatus(status);
  };

  // Sync tab with query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as typeof activeTab | null;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const { data: overview } = useQuery({
    queryKey: ["patient-overview"],
    queryFn: patientApi.getOverview,
    enabled: role === "PATIENT" && activeTab === "overview",
  });

  // Lightweight queries for overview aggregation
  const { data: ovReminders, isLoading: loadingOvReminders } = useQuery({
    queryKey: ["patient-ov-reminders"],
    queryFn: () => patientApi.getReminders(), // Get today's reminders for overview
    enabled: role === "PATIENT" && activeTab === "overview",
  });

  // Filter upcoming reminders (PENDING status only) and sort by time
  const upcomingReminders = ovReminders?.filter((reminder: any) => reminder.status === 'PENDING')
    .sort((a: any, b: any) => {
      const timeOrder = ['Sáng', 'Trưa', 'Chiều', 'Tối', 'Đêm'];
      const aTimeIndex = timeOrder.indexOf(a.time);
      const bTimeIndex = timeOrder.indexOf(b.time);
      if (aTimeIndex !== -1 && bTimeIndex !== -1) {
        return aTimeIndex - bTimeIndex;
      }
      return a.time.localeCompare(b.time);
    }) || [];

  const { data: ovAdherence, isLoading: loadingOvAdh } = useQuery({
    queryKey: ["patient-ov-adherence"],
    queryFn: patientApi.getAdherence,
    enabled: role === "PATIENT" && activeTab === "overview",
  });

  const { data: ovPrescriptions, isLoading: loadingOvRx } = useQuery({
    queryKey: ["patient-ov-prescriptions"],
    queryFn: patientApi.getActivePrescriptions,
    enabled: role === "PATIENT" && activeTab === "overview",
  });
  
  // Extract items from paginated response
  const prescriptionsList = ovPrescriptions?.items || [];

  const { data: prescriptions, isLoading: loadingPres } = useQuery({
    queryKey: ["patient-prescriptions"],
    queryFn: patientApi.getActivePrescriptions,
    enabled: role === "PATIENT" && activeTab === "prescriptions",
  });

  const { data: prescriptionDetail, isLoading: loadingPresDetail } = useQuery({
    queryKey: ["patient-prescription-detail", selectedPrescriptionId],
    queryFn: () =>
      selectedPrescriptionId
        ? patientApi.getPrescriptionDetail(selectedPrescriptionId)
        : Promise.resolve(null),
    enabled:
      role === "PATIENT" &&
      activeTab === "prescriptions" &&
      !!selectedPrescriptionId,
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["patient-history"],
    queryFn: () => patientApi.getHistory({ page: 1, limit: 20 }),
    enabled: role === "PATIENT" && activeTab === "history",
    staleTime: 0,
  });

  const { data: reminders, isLoading: loadingReminders } = useQuery({
    queryKey: ["patient-reminders", selectedDate],
    queryFn: () => patientApi.getReminders(selectedDate),
    enabled: role === "PATIENT" && activeTab === "reminders",
    staleTime: 0, // Always refetch to get latest status
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Filter reminders by time slot
  const filteredReminders = reminders?.filter((reminder: any) => {
    if (selectedTimeFilter === 'all') return true;
    return reminder.time === selectedTimeFilter;
  }) || [];

  // Sort reminders: PENDING first, then by time
  const sortedReminders = filteredReminders.sort((a: any, b: any) => {
    // First priority: PENDING status goes to top
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    
    // Second priority: Sort by time slot order
    const timeOrder = ['Sáng', 'Trưa', 'Chiều', 'Tối', 'Đêm'];
    const aTimeIndex = timeOrder.indexOf(a.time);
    const bTimeIndex = timeOrder.indexOf(b.time);
    
    // If both times are in the order array, sort by index
    if (aTimeIndex !== -1 && bTimeIndex !== -1) {
      return aTimeIndex - bTimeIndex;
    }
    
    // If times are not in order array (like HH:mm format), sort alphabetically
    return a.time.localeCompare(b.time);
  });

  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ["patient-alerts"],
    queryFn: patientApi.getAlerts,
    enabled: role === "PATIENT" && activeTab === "alerts",
  });

  const { data: adherence, isLoading: loadingAdherence } = useQuery({
    queryKey: ["patient-adherence"],
    queryFn: patientApi.getAdherence,
    enabled: role === "PATIENT" && activeTab === "adherence",
  });

  const handleConfirmIntake = async () => {
    if (!selectedPrescriptionId || !confirmItemId) return;
    
    try {
      await patientApi.confirmIntake(selectedPrescriptionId, {
        prescriptionItemId: confirmItemId,
        takenAt: new Date().toISOString(),
        status: "TAKEN",
      });
      
      // Refresh detail and overview/adherence
      queryClient.invalidateQueries({
        queryKey: ["patient-prescription-detail", selectedPrescriptionId],
      });
      queryClient.invalidateQueries({ queryKey: ["patient-overview"] });
      queryClient.invalidateQueries({ queryKey: ["patient-adherence"] });
      setConfirmItemId("");
      
      toast.success("Xác nhận uống thuốc thành công!", {
        duration: 3000,
        position: "top-center",
        style: { background: "#10B981", color: "#fff" },
      });
    } catch (error: any) {
      console.error('Confirm intake error:', error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi xác nhận uống thuốc", {
        duration: 4000,
        position: "top-center",
        style: { background: "#EF4444", color: "#fff" },
      });
    }
  };

  const handleConfirmIntakeFromReminder = async (reminder: any) => {
    if (!reminder.prescriptionId || !reminder.prescriptionItemId) return;
    
    console.log('=== CONFIRM INTAKE DEBUG ===');
    console.log('Reminder:', reminder);
    console.log('Reminder time:', reminder.time);
    
    // Check if current time is within the expected time slot
    const isWithinTime = isWithinTimeSlot(reminder.time);
    console.log('Is within time slot:', isWithinTime);
    
    if (!isWithinTime) {
      console.log('Showing time validation dialog');
      
      // Test with simple alert first
      const message = `Bạn đang xác nhận uống thuốc ${reminder.medicationName} ngoài khung giờ.\n\n` +
        `Khung giờ dự kiến: ${formatTimeSlot(reminder.time)}\n` +
        `Thời gian hiện tại: ${getCurrentTimeInVietnamese()}\n\n` +
        `Bạn có chắc chắn muốn xác nhận uống thuốc vào thời điểm này không?`;
      
      console.log('Alert message:', message);
      console.log('About to show window.confirm');
      
      const confirmed = window.confirm(message);
      console.log('User confirmed:', confirmed);
      
      if (confirmed) {
        console.log('User confirmed, proceeding with action');
        await confirmIntakeAction(reminder);
      } else {
        console.log('User cancelled');
      }
      return;
      
      // Original dialog code (commented out for now)
      // setTimeValidationDialog({
      //   open: true,
      //   reminder: reminder,
      // });
      // return;
    }
    
    console.log('Proceeding with normal confirmation');
    // Proceed with normal confirmation if within time slot
    await confirmIntakeAction(reminder);
  };

  const confirmIntakeAction = async (reminder: any) => {
    const actionKey = `confirm-${reminder.id}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    console.log('=== CONFIRM INTAKE ACTION DEBUG ===');
    console.log('Reminder:', reminder);
    console.log('Unique dose ID:', reminder.uniqueDoseId);
    console.log('Prescription ID:', reminder.prescriptionId);
    console.log('Prescription Item ID:', reminder.prescriptionItemId);
    
    try {
      await patientApi.confirmIntake(reminder.prescriptionId, {
        prescriptionItemId: reminder.prescriptionItemId,
        takenAt: new Date().toISOString(),
        status: "TAKEN",
        notes: reminder.uniqueDoseId, // Send unique dose ID to track specific time slot
      });
      
      // Refresh reminders and related data with more aggressive invalidation
      console.log('=== REFRESHING CACHE AFTER CONFIRM INTAKE ===');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient-reminders"] }), // This will invalidate all patient-reminders queries
        queryClient.invalidateQueries({ queryKey: ["patient-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-adherence"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-ov-reminders"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-ov-adherence"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-ov-prescriptions"] })
      ]);
      
      // Force refetch reminders for the selected date
      console.log('=== FORCE REFETCH REMINDERS ===');
      await queryClient.refetchQueries({ queryKey: ["patient-reminders", selectedDate] });
      
      // Also refetch all reminders queries
      await queryClient.refetchQueries({ queryKey: ["patient-reminders"] });
      
      toast.success("Xác nhận uống thuốc thành công!", {
        duration: 3000,
        position: "top-center",
        style: { background: "#10B981", color: "#fff" },
      });
    } catch (error: any) {
      console.error('Confirm intake from reminder error:', error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi xác nhận uống thuốc", {
        duration: 4000,
        position: "top-center",
        style: { background: "#EF4444", color: "#fff" },
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleMarkMissedFromReminder = async (reminder: any) => {
    if (!reminder.prescriptionId) return;
    
    console.log('=== MARK MISSED DEBUG ===');
    console.log('Reminder:', reminder);
    console.log('Reminder time:', reminder.time);
    
    // Check if current time is within the expected time slot
    const isWithinTime = isWithinTimeSlot(reminder.time);
    console.log('Is within time slot:', isWithinTime);
    
    // Always show confirmation for marking missed (regardless of time slot)
    console.log('Showing missed validation dialog');
    
    // Test with simple alert first - warning for marking missed
    const message = `Bạn đang đánh dấu bỏ lỡ thuốc ${reminder.medicationName}.\n\n` +
      `Khung giờ dự kiến: ${formatTimeSlot(reminder.time)}\n` +
      `Thời gian hiện tại: ${getCurrentTimeInVietnamese()}\n\n` +
      `Bạn có chắc chắn muốn đánh dấu bỏ lỡ thuốc này không?`;
    
    console.log('Missed alert message:', message);
    console.log('About to show window.confirm for missed');
    
    const confirmed = window.confirm(message);
    console.log('User confirmed missed:', confirmed);
    
    if (!confirmed) {
      console.log('User cancelled missed action');
      return; // User cancelled
    }
    
    // Proceed with marking missed
    await markMissedAction(reminder);
  };

  const markMissedAction = async (reminder: any) => {
    const actionKey = `missed-${reminder.id}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    console.log('=== MARK MISSED ACTION DEBUG ===');
    console.log('Reminder:', reminder);
    console.log('Unique dose ID:', reminder.uniqueDoseId);
    console.log('Prescription ID:', reminder.prescriptionId);
    console.log('Prescription Item ID:', reminder.prescriptionItemId);
    
    try {
      await patientApi.markMissed(reminder.prescriptionId, {
        prescriptionItemId: reminder.prescriptionItemId,
        notes: reminder.uniqueDoseId, // Send unique dose ID to track specific time slot
      });
      
      // Refresh reminders and related data with more aggressive invalidation
      console.log('=== REFRESHING CACHE AFTER MARK MISSED ===');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient-reminders"] }), // This will invalidate all patient-reminders queries
        queryClient.invalidateQueries({ queryKey: ["patient-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-adherence"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-ov-reminders"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-ov-adherence"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-ov-prescriptions"] })
      ]);
      
      // Force refetch reminders for the selected date
      console.log('=== FORCE REFETCH REMINDERS AFTER MISSED ===');
      await queryClient.refetchQueries({ queryKey: ["patient-reminders", selectedDate] });
      
      // Also refetch all reminders queries
      await queryClient.refetchQueries({ queryKey: ["patient-reminders"] });
      
      toast.success("Đã đánh dấu bỏ lỡ thuốc!", {
        duration: 3000,
        position: "top-center",
        style: { background: "#F59E0B", color: "#fff" },
      });
    } catch (error: any) {
      console.error('Mark missed from reminder error:', error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi đánh dấu bỏ lỡ", {
        duration: 4000,
        position: "top-center",
        style: { background: "#EF4444", color: "#fff" },
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const actionKey = `resolve-${alertId}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    console.log('=== RESOLVE ALERT DEBUG ===');
    console.log('Alert ID:', alertId);
    
    try {
      await patientApi.resolveAlert(alertId);
      
      // Refresh alerts and related data
      console.log('=== REFRESHING CACHE AFTER RESOLVE ALERT ===');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient-alerts"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-ov-alerts"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-overview"] })
      ]);
      
      // Force refetch alerts
      await queryClient.refetchQueries({ queryKey: ["patient-alerts"] });
      
      toast.success("Đã đánh dấu cảnh báo là đã xử lý!", {
        duration: 3000,
        position: "top-center",
        style: { background: "#10B981", color: "#fff" },
      });
    } catch (error: any) {
      console.error('Resolve alert error:', error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi đánh dấu cảnh báo", {
        duration: 4000,
        position: "top-center",
        style: { background: "#EF4444", color: "#fff" },
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // ============== PATIENT SELF-SERVICE ONLY ==============
  // This page is only for PATIENT role, admin/doctor logic removed

  if (role === "PATIENT") {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
                  <p className="text-muted-foreground">
                    Thông tin tổng quan về tình trạng điều trị của bạn
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab("prescriptions")}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Đơn thuốc đang hoạt động
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {(overview as OverviewData)?.activePrescriptions ?? 0}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Pill className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Xem chi tiết</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab("alerts")}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Cảnh báo chưa xử lý
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {(overview as OverviewData)?.unresolvedAlerts ?? 0}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Xem chi tiết</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-700 transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab("adherence")}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Đã uống thuốc
                        </p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {(overview as OverviewData)?.takenLogs ?? 0}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Xem chi tiết</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab("adherence")}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Bỏ lỡ thuốc
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {(overview as OverviewData)?.missedLogs ?? 0}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <XCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Xem chi tiết</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Active prescriptions preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab("prescriptions")}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" />
                        Đơn thuốc đang hoạt động
                      </span>
                      <div className="flex items-center gap-2">
                        {!loadingOvRx && prescriptionsList.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {prescriptionsList.length}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOvRx ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                      </div>
                    ) : prescriptionsList.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                        {prescriptionsList.map((pr: Prescription) => (
                          <div key={pr.id} className="rounded-lg border border-border/20 p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={`text-xs ${getStatusColor(pr.status)}`}>
                                {getStatusText(pr.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(pr.startDate)}
                              </span>
                            </div>
                            {pr.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {pr.notes}
                              </p>
                            )}
                            {pr.doctor?.fullName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Bác sĩ: {pr.doctor.fullName}
                              </p>
                            )}
                          </div>
                        ))}

                        {/* Scroll indicator */}
                        {prescriptionsList.length > 4 && (
                          <div className="text-center py-2">
                            <p className="text-xs text-muted-foreground">
                              Cuộn để xem thêm đơn thuốc
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Pill className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Không có đơn thuốc</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming reminders */}
                <Card className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab("reminders")}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Nhắc nhở hôm nay
                      </span>
                      <div className="flex items-center gap-2">
                        {!loadingOvReminders && upcomingReminders.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {upcomingReminders.length}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOvReminders ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                      </div>
                    ) : upcomingReminders.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                        {upcomingReminders.map((r: any, idx: number) => (
                          <div key={idx} className="rounded-lg border border-border/20 p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start gap-3">
                              {/* Time Badge */}
                              <div className="shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col items-center justify-center">
                                  <div className="text-sm font-bold">
                                    {r.time}
                                  </div>
                                </div>
                              </div>

                              {/* Medication Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-foreground">
                                      {r.medicationName || "Thuốc"}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {r.dosage}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {translateRoute(r.route) || "Đường uống"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="shrink-0">
                                    <Badge 
                                      variant={r.status === 'TAKEN' ? 'default' : r.status === 'MISSED' ? 'destructive' : 'outline'}
                                      className="text-xs"
                                    >
                                      {translateStatus(r.status)}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Instructions */}
                                {r.instructions && (
                                  <p className="text-xs text-muted-foreground">
                                    {r.instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Scroll indicator */}
                        {upcomingReminders.length > 4 && (
                          <div className="text-center py-2">
                            <p className="text-xs text-muted-foreground">
                              Cuộn để xem thêm nhắc nhở
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Không có nhắc nhở hôm nay</p>
                        <p className="text-xs text-muted-foreground mt-1">Tất cả thuốc đã được uống</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Alerts and recent adherence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab("alerts")}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Cảnh báo
                      </span>
                      <div className="flex items-center gap-2">
                        {!loadingOvAlerts && Array.isArray(ovAlerts) && (
                          <Badge variant="secondary" className="text-xs">
                            {ovAlerts.filter((a: Alert) => !a.resolved).length} chưa xử lý
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOvAlerts ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                      </div>
                    ) : Array.isArray(ovAlerts) && ovAlerts.length > 0 ? (
                      <div className="space-y-3">
                        {ovAlerts.slice(0, 4).map((a: Alert, idx: number) => (
                          <div key={idx} className="rounded-lg border border-border/20 p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                                a.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                !
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {a.type === "MISSED_DOSE" ? "Bỏ liều" : 
                                   a.type === "LOW_ADHERENCE" ? "Tuân thủ thấp" : "Cảnh báo"}
                                </p>
                                {a.message && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {a.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge className={`text-xs ${
                              a.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {a.resolved ? "Đã xử lý" : "Chưa xử lý"}
                            </Badge>
                          </div>
                        ))}
                        {ovAlerts.length > 4 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{ovAlerts.length - 4} cảnh báo khác
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Không có cảnh báo</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab("adherence")}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-600" />
                        Nhật ký tuân thủ gần đây
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOvAdh ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                      </div>
                    ) : Array.isArray(ovAdherence) && ovAdherence.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                        {ovAdherence.map((log: AdherenceLog) => (
                          <div key={log.id} className="rounded-lg border border-border/20 p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start gap-3">
                              {/* Time Badge */}
                              <div className="shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex flex-col items-center justify-center">
                                  <div className="text-xs font-bold">
                                    {new Date(log.takenAt).toLocaleDateString('vi-VN', { day: '2-digit' })}
                                  </div>
                                  <div className="text-[10px] opacity-90">
                                    {new Date(log.takenAt).toLocaleDateString('vi-VN', { month: 'short' })}
                                  </div>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={log.status === 'TAKEN' ? 'default' : log.status === 'MISSED' ? 'destructive' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {getStatusText(log.status)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(log.takenAt).toLocaleTimeString('vi-VN', {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(log.takenAt).toLocaleDateString('vi-VN', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>

                                {/* Medication Details */}
                                {log.prescriptionItem && (
                                  <div className="bg-muted/30 rounded-md p-2 mt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-foreground">
                                        {log.prescriptionItem.medication?.name || "Thuốc"}
                                      </span>
                                      <Badge variant="outline" className="text-[10px]">
                                        {log.prescriptionItem.dosage}
                                      </Badge>
                                      {log.prescriptionItem.route && (
                                        <Badge variant="secondary" className="text-[10px]">
                                          {translateRoute(log.prescriptionItem.route)}
                                        </Badge>
                                      )}
                                    </div>
                                    {log.prescriptionItem.medication?.strength && (
                                      <p className="text-[10px] text-muted-foreground">
                                        {log.prescriptionItem.medication.strength} • {log.prescriptionItem.medication.form}
                                      </p>
                                    )}
                                    {log.prescription?.doctor?.fullName && (
                                      <p className="text-[10px] text-muted-foreground mt-1">
                                        Bác sĩ: {log.prescription.doctor.fullName}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Notes - only show if it's not a uniqueDoseId */}
                                {log.notes && !log.notes.includes('-') && (
                                  <div className="bg-muted/30 rounded-md p-2 mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      {log.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Scroll indicator */}
                        {ovAdherence.length > 4 && (
                          <div className="text-center py-2">
                            <p className="text-xs text-muted-foreground">
                              Cuộn để xem thêm nhật ký
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {activeTab === "prescriptions" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Đơn thuốc</h2>
                  <p className="text-muted-foreground">
                    Xem và quản lý đơn thuốc của bạn
                  </p>
                </div>
              </div>

              {/* Prescriptions List */}
              <Card className="border-border/20">
                <CardContent className="p-6">
                  {loadingPres ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-muted-foreground">Đang tải đơn thuốc...</span>
                    </div>
                  ) : !prescriptions || (Array.isArray(prescriptions) && prescriptions.length === 0) || (prescriptions?.items && Array.isArray(prescriptions.items) && prescriptions.items.length === 0) ? (
                    <div className="text-center py-12">
                      <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Không có đơn thuốc</h3>
                      <p className="text-muted-foreground">Bạn chưa có đơn thuốc nào đang hoạt động</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {(Array.isArray(prescriptions) ? prescriptions : prescriptions?.items || []).map((pr: Prescription) => (
                        <Card 
                          key={pr.id} 
                          className="border-border/20 hover:shadow-md transition-all duration-200 cursor-pointer group"
                          onClick={() => setSelectedPrescriptionId(pr.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-base font-semibold">
                                RX
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-foreground truncate">
                                      Đơn thuốc #{pr.id.slice(-8)}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                      <Badge className={`text-xs ${getStatusColor(pr.status)}`}>
                                        {getStatusText(pr.status)}
                                      </Badge>
                                      <span className="h-3 w-px bg-border/50" />
                                      <span>{formatDate(pr.startDate)}</span>
                                    </div>
                                  </div>
                                  {pr.doctor?.fullName && (
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                                      {pr.doctor.fullName.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                {pr.notes && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {pr.notes}
                                  </p>
                                )}
                                {pr.doctor?.fullName && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Bác sĩ: {pr.doctor.fullName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prescription Detail Dialog */}
              {selectedPrescriptionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setSelectedPrescriptionId(null)}
                  />
                  <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden border-border/20 shadow-2xl">
                    <CardHeader className="border-b border-border/20 bg-background/60 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                            {(prescriptionDetail as Prescription)?.doctor?.fullName?.charAt(0) || "BS"}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-lg font-semibold text-foreground truncate">
                              Chi tiết đơn thuốc
                            </CardTitle>
                            <p className="text-xs text-muted-foreground truncate">
                              Bác sĩ: {(prescriptionDetail as Prescription)?.doctor?.fullName || "-"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPrescriptionId(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                      {loadingPresDetail ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-3 text-muted-foreground">Đang tải chi tiết...</span>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Header summary */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-border/20">
                              <CardContent className="p-4">
                                <div className="text-xs text-muted-foreground mb-1">Trạng thái</div>
                                <Badge className={`text-xs ${getStatusColor((prescriptionDetail as Prescription)?.status || '')}`}>
                                  {getStatusText((prescriptionDetail as Prescription)?.status || '')}
                                </Badge>
                              </CardContent>
                            </Card>
                            <Card className="border-border/20 md:col-span-2">
                              <CardContent className="p-4">
                                <div className="text-xs text-muted-foreground mb-1">Bắt đầu</div>
                                <div className="text-sm text-foreground">
                                  {(prescriptionDetail as Prescription)?.startDate
                                    ? formatDateTime((prescriptionDetail as Prescription).startDate!)
                                    : "-"}
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="border-border/20">
                              <CardContent className="p-4">
                                <div className="text-xs text-muted-foreground mb-1">Kết thúc</div>
                                <div className="text-sm text-foreground">
                                  {(prescriptionDetail as Prescription)?.endDate
                                    ? formatDateTime((prescriptionDetail as Prescription).endDate!)
                                    : "-"}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Notes */}
                          {(prescriptionDetail as Prescription)?.notes && (
                            <Card className="border-border/20">
                              <CardContent className="p-4">
                                <div className="text-xs text-muted-foreground mb-2">Ghi chú</div>
                                <div className="text-sm text-foreground">
                                  {(prescriptionDetail as Prescription).notes}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Items */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Danh sách thuốc</h3>
                            <div className="space-y-4">
                              {Array.isArray((prescriptionDetail as Prescription)?.items) ? (
                                (prescriptionDetail as Prescription).items.map((item: PrescriptionItem) => (
                                  <Card key={item.id} className="border-border/20">
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-sm font-semibold text-foreground mb-3">
                                            {item.medicationName || "Thuốc"}
                                          </h4>
                                          <div className="flex flex-wrap gap-2 mb-3">
                                            <Badge variant="outline" className="text-xs">
                                              {item.dosage}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                                              {item.frequencyPerDay} lần/ngày
                                            </Badge>
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                              {item.durationDays} ngày
                                            </Badge>
                                            {item.route && (
                                              <Badge variant="outline" className="text-xs bg-zinc-50 text-zinc-700">
                                                {item.route}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="text-xs text-muted-foreground mb-2">
                                            Giờ uống: {Array.isArray(item.timesOfDay) ? item.timesOfDay.join(", ") : "-"}
                                          </div>
                                          {item.instructions && (
                                            <div className="text-xs text-muted-foreground">
                                              Hướng dẫn: {item.instructions}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <div className="text-center py-8">
                                  <Pill className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                  <p className="text-sm text-muted-foreground">Không có danh sách thuốc</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Confirm Intake */}
                          <Card className="border-border/20">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Xác nhận đã uống thuốc</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select
                                  className="col-span-2 px-3 py-2 rounded-lg border border-border/30 bg-background text-sm"
                                  value={confirmItemId}
                                  onChange={(e) => setConfirmItemId(e.target.value)}
                                >
                                  <option value="">Chọn thuốc trong đơn</option>
                                  {Array.isArray((prescriptionDetail as Prescription)?.items) &&
                                    (prescriptionDetail as Prescription).items.map((item: PrescriptionItem) => (
                                      <option key={item.id} value={item.id}>
                                        {item.medicationName || "Thuốc"} — {item.dosage}
                                      </option>
                                    ))}
                                </select>
                                <Button
                                  onClick={handleConfirmIntake}
                                  disabled={!confirmItemId}
                                  className="w-full"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Xác nhận
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Trạng thái gửi: TAKEN cùng thời gian hiện tại.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {activeTab === "history" && (
            <div className="rounded-xl border border-border/20 bg-card p-4">
              {loadingHistory ? (
                <div className="text-muted-foreground">Đang tải...</div>
              ) : (
                <>
                  <div className="space-y-3">
                    {Array.isArray((history as any)?.items) ? (
                      (history as any).items.map((h: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-border/20 p-4 bg-background/60"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                    h.status === "COMPLETED"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-zinc-100 text-zinc-700"
                                  }`}
                                >
                                  {h.status}
                                </span>
                                {h.doctor?.fullName && (
                                  <span className="text-xs text-muted-foreground">
                                    Bác sĩ: {h.doctor.fullName}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                Bắt đầu:{" "}
                                {h.startDate
                                  ? new Date(h.startDate).toLocaleString()
                                  : "-"}
                              </div>
                              {h.endDate && (
                                <div className="text-xs text-muted-foreground">
                                  Kết thúc:{" "}
                                  {new Date(h.endDate).toLocaleString()}
                                </div>
                              )}
                              {h.notes && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Ghi chú: {h.notes}
                                </div>
                              )}
                              {Array.isArray(h.items) && h.items.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {h.items.slice(0, 4).map((it: any) => (
                                    <span
                                      key={it.id}
                                      className="inline-flex px-2 py-0.5 rounded-md text-[11px] bg-primary/10 text-primary"
                                    >
                                      {it.medicationName || "Thuốc"} •{" "}
                                      {it.dosage}
                                    </span>
                                  ))}
                                  {h.items.length > 4 && (
                                    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] bg-accent/40 text-foreground">
                                      +{h.items.length - 4} thuốc
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                              {(h.doctor?.fullName || "BS")
                                .toString()
                                .charAt(0)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Không có dữ liệu
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Reminders */}
          {activeTab === "reminders" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Nhắc nhở uống thuốc</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lịch trình uống thuốc theo ngày • Chưa uống hiển thị trước
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {sortedReminders.length} nhắc nhở
                  {selectedTimeFilter !== 'all' && (
                    <span className="ml-1 text-muted-foreground">
                      ({Array.isArray(reminders) ? reminders.length : 0} tổng)
                    </span>
                  )}
                </Badge>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <label htmlFor="reminder-date" className="text-sm font-medium">
                    Chọn ngày:
                  </label>
                  <input
                    id="reminder-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setSelectedDate(yesterday.toISOString().slice(0, 10));
                    }}
                    className="text-xs flex items-center gap-1"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Hôm qua
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                    className="text-xs flex items-center gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    Hôm nay
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSelectedDate(tomorrow.toISOString().slice(0, 10));
                    }}
                    className="text-xs flex items-center gap-1"
                  >
                    Ngày mai
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
                {!isToday && (
                  <div className="flex items-center gap-1 text-amber-600 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>Chỉ có thể thực hiện hành động vào ngày hôm nay</span>
                  </div>
                )}
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Lọc theo buổi:</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedTimeFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setSelectedTimeFilter('all')}
                      className="text-xs"
                    >
                      Tất cả
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTimeFilter === 'Sáng' ? 'default' : 'outline'}
                      onClick={() => setSelectedTimeFilter('Sáng')}
                      className="text-xs"
                    >
                      Sáng
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTimeFilter === 'Trưa' ? 'default' : 'outline'}
                      onClick={() => setSelectedTimeFilter('Trưa')}
                      className="text-xs"
                    >
                      Trưa
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTimeFilter === 'Chiều' ? 'default' : 'outline'}
                      onClick={() => setSelectedTimeFilter('Chiều')}
                      className="text-xs"
                    >
                      Chiều
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTimeFilter === 'Tối' ? 'default' : 'outline'}
                      onClick={() => setSelectedTimeFilter('Tối')}
                      className="text-xs"
                    >
                      Tối
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reminders List */}
              <div className="rounded-xl border border-border/20 bg-card p-6">
                {loadingReminders ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-muted-foreground">Đang tải nhắc nhở...</span>
                  </div>
                ) : sortedReminders.length > 0 ? (
                  <div className="space-y-4">
                    {sortedReminders.map((r: any, idx: number) => (
                      <Card key={idx} className="border-border/20 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Time Badge */}
                            <div className="shrink-0">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col items-center justify-center">
                                <div className="text-lg font-bold">
                                  {r.time?.slice?.(0, 5) || "--:--"}
                                </div>
                                <div className="text-xs opacity-90">Hôm nay</div>
                              </div>
                            </div>

                            {/* Medication Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="min-w-0">
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {r.medicationName || "Thuốc"}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {r.dosage}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {translateRoute(r.route) || "Đường uống"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  <Badge 
                                    variant={r.status === 'TAKEN' ? 'default' : r.status === 'MISSED' ? 'destructive' : r.status === 'SKIPPED' ? 'secondary' : 'outline'}
                                    className="text-xs"
                                  >
                                    {translateStatus(r.status)}
                                  </Badge>
                                </div>
                              </div>

                              {/* Additional Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>Thời gian: {r.time?.slice?.(0, 5) || "--:--"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Pill className="h-4 w-4" />
                                  <span>Liều lượng: {r.dosage}</span>
                                </div>
                                {r.instructions && (
                                  <div className="md:col-span-2 flex items-start gap-2 text-muted-foreground">
                                    <span className="font-medium">Hướng dẫn:</span>
                                    <span>{r.instructions}</span>
                                  </div>
                                )}
                                {r.prescriptionId && (
                                  <div className="md:col-span-2 flex items-center gap-2 text-muted-foreground">
                                    <span className="font-medium">Đơn thuốc:</span>
                                    <code className="text-xs bg-muted/20 px-2 py-1 rounded">
                                      {r.prescriptionId.slice(0, 8)}...
                                    </code>
                                  </div>
                                )}
                              </div>

                              {/* Action Button */}
                              {/* Action buttons - only show for today */}
                              {r.status === 'PENDING' && isToday && (
                                <div className="mt-4 flex gap-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleConfirmIntakeFromReminder(r)}
                                    disabled={loadingActions[`confirm-${r.id}`]}
                                  >
                                    {loadingActions[`confirm-${r.id}`] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Xác nhận đã uống
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                    onClick={() => handleMarkMissedFromReminder(r)}
                                    disabled={loadingActions[`missed-${r.id}`]}
                                  >
                                    {loadingActions[`missed-${r.id}`] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700 mr-2"></div>
                                    ) : (
                                      <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Đánh dấu bỏ lỡ
                                  </Button>
                                </div>
                              )}
                              
                              {/* Show info message for non-today dates */}
                              {r.status === 'PENDING' && !isToday && (
                                <div className="mt-4 flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-sm">Chỉ có thể thực hiện hành động vào ngày hôm nay</span>
                                </div>
                              )}
                              
                              {/* Show completion message for taken medications */}
                              {r.status === 'TAKEN' && (
                                <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Đã xác nhận uống thuốc</span>
                                </div>
                              )}
                              
                              {/* Show missed message */}
                              {r.status === 'MISSED' && (
                                <div className="mt-4 flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                                  <XCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Đã đánh dấu bỏ lỡ</span>
                                </div>
                              )}
                              
                              {/* Show skipped message */}
                              {r.status === 'SKIPPED' && (
                                <div className="mt-4 flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                  <XCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Đã bỏ qua</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {selectedTimeFilter === 'all' ? 'Không có nhắc nhở' : `Không có nhắc nhở buổi ${selectedTimeFilter}`}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedTimeFilter === 'all' 
                        ? 'Bạn không có lịch uống thuốc nào cho ngày này'
                        : `Bạn không có lịch uống thuốc nào cho buổi ${selectedTimeFilter}`
                      }
                    </p>
                    {selectedTimeFilter !== 'all' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTimeFilter('all')}
                        className="mt-3"
                      >
                        Xem tất cả
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alerts */}
          {activeTab === "alerts" && (
            <div className="rounded-xl border border-border/20 bg-card p-4">
              {loadingAlerts ? (
                <div className="text-muted-foreground">Đang tải...</div>
              ) : Array.isArray(alerts) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {alerts.map((a: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/20 bg-background/70 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 flex items-start gap-4">
                        <div
                          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${
                            a.resolved
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          !
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">
                                {a.type === "MISSED_DOSE"
                                  ? "Bỏ liều"
                                  : a.type === "LOW_ADHERENCE"
                                  ? "Tuân thủ thấp"
                                  : "Cảnh báo"}
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                    a.resolved
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {a.resolved ? "Đã xử lý" : "Chưa xử lý"}
                                </span>
                                {a.prescriptionId && (
                                  <span className="h-3 w-px bg-border/50" />
                                )}
                                {a.prescriptionId && <span>Đơn thuốc</span>}
                              </div>
                            </div>
                          </div>
                          {a.message && (
                            <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {a.message}
                            </div>
                          )}
                          {!a.resolved && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveAlert(a.id)}
                                disabled={loadingActions[`resolve-${a.id}`]}
                                className="text-xs"
                              >
                                {loadingActions[`resolve-${a.id}`] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                Đánh dấu đã xử lý
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Không có cảnh báo
                </div>
              )}
            </div>
          )}

          {/* Adherence */}
          {activeTab === "adherence" && (
            <div className="rounded-xl border border-border/20 bg-card p-4">
              {loadingAdherence ? (
                <div className="text-muted-foreground">Đang tải...</div>
              ) : Array.isArray(adherence) ? (
                <div className="space-y-4">
                  {(() => {
                    const logs = (adherence as any[]) || [];
                    const taken = logs.filter(
                      (l) => l.status === "TAKEN"
                    ).length;
                    const missed = logs.filter(
                      (l) => l.status === "MISSED"
                    ).length;
                    const skipped = logs.filter(
                      (l) => l.status === "SKIPPED"
                    ).length;
                    // Remove rate calculation since we're not showing adherence rate anymore
                    // group by date
                    const groups: Record<string, any[]> = {};
                    logs.forEach((l) => {
                      const d = new Date(l.takenAt);
                      const key = isNaN(d.getTime())
                        ? "Khác"
                        : d.toISOString().slice(0, 10);
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(l);
                    });
                    const orderedDates = Object.keys(groups).sort((a, b) =>
                      a < b ? 1 : -1
                    );
                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="rounded-lg border border-border/20 p-4">
                            <div className="text-[11px] text-muted-foreground">
                              Đã uống
                            </div>
                            <div className="mt-1 text-2xl font-bold text-emerald-700">
                              {taken}
                            </div>
                          </div>
                          <div className="rounded-lg border border-border/20 p-4">
                            <div className="text-[11px] text-muted-foreground">
                              Bỏ liều
                            </div>
                            <div className="mt-1 text-2xl font-bold text-amber-700">
                              {missed}
                            </div>
                          </div>
                          <div className="rounded-lg border border-border/20 p-4">
                            <div className="text-[11px] text-muted-foreground">
                              Bỏ qua
                            </div>
                            <div className="mt-1 text-2xl font-bold text-zinc-700">
                              {skipped}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {orderedDates.map((dateKey) => (
                            <div
                              key={dateKey}
                              className="rounded-xl border border-border/20 p-4 bg-background/60"
                            >
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                {dateKey}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {groups[dateKey].map((log) => (
                                  <div
                                    key={log.id}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/20 bg-background"
                                  >
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(log.takenAt).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" }
                                      )}
                                    </span>
                                    <span
                                      className={`${
                                        log.status === "TAKEN"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : log.status === "MISSED"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-zinc-100 text-zinc-700"
                                      } inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium`}
                                    >
                                      {log.status === "TAKEN"
                                        ? "Đã uống"
                                        : log.status === "MISSED"
                                        ? "Bỏ liều"
                                        : "Bỏ qua"}
                                    </span>
                                    {log.notes && !log.notes.includes('-') && (
                                      <span className="text-[11px] text-muted-foreground">
                                        • {log.notes}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Không có dữ liệu
                </div>
              )}
            </div>
          )}
        </div>

        {/* First warning dialog for PATIENT */}
        <Dialog open={firstWarningDialog.open} onOpenChange={(open) => setFirstWarningDialog(prev => ({ ...prev, open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Nhắc nhở từ bác sĩ
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {firstWarningDialog.doctorName && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Bác sĩ: </span>
                  <span className="font-medium">{firstWarningDialog.doctorName}</span>
                </div>
              )}
              <p className="text-sm text-foreground">
                {firstWarningDialog.message || 'Bạn nhận được nhắc nhở tuân thủ uống thuốc đều đặn và đúng giờ.'}
              </p>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Vui lòng xem lại lịch uống thuốc trong mục Nhắc nhở và tuân thủ theo chỉ định.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setFirstWarningDialog(prev => ({ ...prev, open: false }))} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Tôi đã hiểu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    );
  }

  // ============== NON-PATIENT ROLE FALLBACK ==============
  // This page is designed for PATIENT role only
  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Trang này dành cho bệnh nhân
          </h2>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập với tài khoản bệnh nhân để sử dụng tính năng này
          </p>
        </div>
      </div>
      
      {/* Time Validation Dialog */}
      <TimeValidationDialog
        open={timeValidationDialog.open}
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange:', open);
          setTimeValidationDialog(prev => ({ ...prev, open }));
        }}
        onConfirm={() => {
          console.log('Dialog onConfirm');
          if (timeValidationDialog.reminder) {
            confirmIntakeAction(timeValidationDialog.reminder);
          }
        }}
        medicationName={timeValidationDialog.reminder?.medicationName || ''}
        timeSlot={formatTimeSlot(timeValidationDialog.reminder?.time || '')}
        currentTimeSlot={getCurrentTimeInVietnamese()}
      />

    </main>
  );
}
