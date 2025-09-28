import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { patientApi } from "@/api/patient/patient.api";
import { authApi } from "@/api/auth/auth.api";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  User,
  Activity
} from "lucide-react";

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
}

interface Alert {
  id: string;
  type: 'MISSED_DOSE' | 'LOW_ADHERENCE' | 'OTHER';
  resolved: boolean;
  message?: string;
  prescriptionId?: string;
}

interface Reminder {
  id: string;
  medicationName: string;
  dosage: string;
  time: string;
  date: string;
  prescriptionId?: string;
}

interface OverviewData {
  activePrescriptions: number;
  unresolvedAlerts: number;
  adherenceRate: number;
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
    switch (status) {
      case 'ACTIVE':
        return 'Đang điều trị';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'TAKEN':
        return 'Đã uống';
      case 'MISSED':
        return 'Bỏ liều';
      case 'SKIPPED':
        return 'Bỏ qua';
      default:
        return status;
    }
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
    queryFn: patientApi.getReminders,
    enabled: role === "PATIENT" && activeTab === "overview",
  });

  const { data: ovAlerts, isLoading: loadingOvAlerts } = useQuery({
    queryKey: ["patient-ov-alerts"],
    queryFn: patientApi.getAlerts,
    enabled: role === "PATIENT" && activeTab === "overview",
  });

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
    queryKey: ["patient-reminders"],
    queryFn: patientApi.getReminders,
    enabled: role === "PATIENT" && activeTab === "reminders",
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
  };

  // ============== PATIENT SELF-SERVICE ONLY ==============
  // This page is only for PATIENT role, admin/doctor logic removed

  if (role === "PATIENT") {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Thông tin bệnh nhân
              </h1>
              <p className="text-muted-foreground">
                Quản lý đơn thuốc, lịch sử, nhắc nhở và theo dõi
              </p>
            </div>
          </div>

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
                <Card className="border-border/20">
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
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Pill className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/20">
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
                      <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Tỉ lệ tuân thủ
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {(overview as OverviewData)?.adherenceRate != null
                            ? `${Math.round((overview as OverviewData).adherenceRate * 100)}%`
                            : "0%"}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Lần ghi nhận gần nhất
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {Array.isArray(ovAdherence) && ovAdherence[0]?.takenAt
                            ? formatDate(ovAdherence[0].takenAt)
                            : "Chưa có"}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Clock className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active prescriptions preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" />
                        Đơn thuốc đang hoạt động
                      </span>
                      {!loadingOvRx && Array.isArray(ovPrescriptions) && ovPrescriptions.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {ovPrescriptions.length}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOvRx ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                      </div>
                    ) : Array.isArray(ovPrescriptions) && ovPrescriptions.length > 0 ? (
                      <div className="space-y-3">
                        {ovPrescriptions.slice(0, 3).map((pr: Prescription) => (
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
                        {ovPrescriptions.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{ovPrescriptions.length - 3} đơn thuốc khác
                          </p>
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
                <Card className="border-border/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Nhắc nhở sắp tới
                      </span>
                      {!loadingOvReminders && Array.isArray(ovReminders) && ovReminders.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {ovReminders.length}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOvReminders ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                      </div>
                    ) : Array.isArray(ovReminders) && ovReminders.length > 0 ? (
                      <div className="space-y-3">
                        {ovReminders.slice(0, 5).map((r: Reminder, idx: number) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg border border-border/20 p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                                {r.time?.slice(0, 5) || "--:--"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {r.medicationName || "Thuốc"} • {r.dosage}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {r.date}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {ovReminders.length > 5 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{ovReminders.length - 5} nhắc nhở khác
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Không có nhắc nhở</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Alerts and recent adherence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Cảnh báo
                      </span>
                      {!loadingOvAlerts && Array.isArray(ovAlerts) && (
                        <Badge variant="secondary" className="text-xs">
                          {ovAlerts.filter((a: Alert) => !a.resolved).length} chưa xử lý
                        </Badge>
                      )}
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

                <Card className="border-border/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-600" />
                        Nhật ký tuân thủ gần đây
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOvAdh ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                      </div>
                    ) : Array.isArray(ovAdherence) && ovAdherence.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {ovAdherence.slice(0, 8).map((log: AdherenceLog) => (
                          <div key={log.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/20 bg-background hover:bg-muted/50 transition-colors">
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.takenAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <Badge className={`text-xs ${getStatusColor(log.status)}`}>
                              {getStatusText(log.status)}
                            </Badge>
                            {log.notes && (
                              <span className="text-[11px] text-muted-foreground">
                                • {log.notes}
                              </span>
                            )}
                          </div>
                        ))}
                        {ovAdherence.length > 8 && (
                          <div className="w-full text-center">
                            <p className="text-xs text-muted-foreground">
                              +{ovAdherence.length - 8} ghi nhận khác
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
            <div className="rounded-xl border border-border/20 bg-card p-4">
              {loadingReminders ? (
                <div className="text-muted-foreground">Đang tải...</div>
              ) : Array.isArray(reminders) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {reminders.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/20 bg-background/70 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                          {r.time?.slice?.(0, 5) || "--:--"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">
                                {r.medicationName || "Thuốc"}{" "}
                                <span className="text-muted-foreground">•</span>{" "}
                                {r.dosage}
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{r.date}</span>
                                {r.prescriptionId && (
                                  <span className="h-3 w-px bg-border/50" />
                                )}
                                {r.prescriptionId && <span>Đơn thuốc</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Không có nhắc nhở
                </div>
              )}
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
                    const total = logs.length || 1;
                    const rate = Math.round((taken / total) * 100);
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="rounded-lg border border-border/20 p-4">
                            <div className="text-[11px] text-muted-foreground">
                              Tỉ lệ tuân thủ
                            </div>
                            <div className="mt-1 text-2xl font-bold text-foreground">
                              {rate}%
                            </div>
                          </div>
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
                                    {log.notes && (
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
    </main>
  );
}
