import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { patientApi } from "@/api/patient/patient.api";
import { authApi } from "@/api/auth/auth.api";
import { useLocation } from "react-router-dom";

export default function PatientPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const location = useLocation();

  const { data: me } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
  });
  const role = me?.data.role;

  // ============== PATIENT SELF-SERVICE TABS ==============
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "prescriptions"
    | "history"
    | "reminders"
    | "alerts"
    | "adherence"
  >("overview");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    string | null
  >(null);
  const [confirmItemId, setConfirmItemId] = useState<string>("");

  // Sync tab with query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as typeof activeTab | null;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const { data: overview, isLoading: loadingOverview } = useQuery({
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
    queryKey: ["patient-history", page, limit],
    queryFn: () => patientApi.getHistory({ page, limit }),
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

  // ============== ADMIN/DOCTOR PATIENT LIST ==============
  const queryFn = useMemo(() => {
    // Nếu có search term, sử dụng search API
    if (search?.trim()) {
      return role === "DOCTOR"
        ? () => patientApi.getPatientsForDoctor({ page, limit, search })
        : () => patientApi.searchPatients(search, page, limit);
    }
    // Nếu không có search, sử dụng getAllPatients (không phân trang)
    return () => patientApi.getAllPatients();
  }, [role, page, limit, search]);

  const {
    data: listData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["patients", role, page, limit, search],
    queryFn,
    enabled: !!role && role !== "PATIENT",
    staleTime: 0,
  });

  useEffect(() => {
    if (role && role !== "PATIENT") refetch();
  }, [role, page, limit, search, refetch]);

  const patients = (listData as any)?.data ?? [];
  // Nếu không có search, getAllPatients không có pagination
  const pagination = search?.trim() ? (listData as any)?.pagination : null;

  const statusColor = (status?: string) =>
    status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700"
      : status === "INACTIVE"
      ? "bg-zinc-100 text-zinc-600"
      : "bg-amber-100 text-amber-700";

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
            <div className="rounded-xl border border-border/20 bg-card p-4">
              {loadingOverview ? (
                <div className="text-muted-foreground">Đang tải...</div>
              ) : (
                <div className="space-y-6">
                  {/* Top stat cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-border/20 p-4">
                      <div className="text-xs text-muted-foreground">
                        Đơn thuốc đang hoạt động
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {(overview as any)?.activePrescriptions ?? "-"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/20 p-4">
                      <div className="text-xs text-muted-foreground">
                        Cảnh báo chưa xử lý
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {(overview as any)?.unresolvedAlerts ?? "-"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/20 p-4">
                      <div className="text-xs text-muted-foreground">
                        Tỉ lệ tuân thủ
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {(overview as any)?.adherenceRate != null
                          ? `${Math.round(
                              (overview as any).adherenceRate * 100
                            )}%`
                          : "-"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/20 p-4">
                      <div className="text-xs text-muted-foreground">
                        Lần ghi nhận gần nhất
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {Array.isArray(ovAdherence) && ovAdherence[0]?.takenAt
                          ? new Date(
                              ovAdherence[0].takenAt
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  </div>

                  {/* Active prescriptions preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border/20 p-4 bg-background/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-foreground">
                          Đơn thuốc
                        </div>
                        {!loadingOvRx &&
                          Array.isArray(ovPrescriptions) &&
                          ovPrescriptions.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {ovPrescriptions.length}
                            </div>
                          )}
                      </div>
                      {loadingOvRx ? (
                        <div className="text-muted-foreground text-sm">
                          Đang tải...
                        </div>
                      ) : Array.isArray(ovPrescriptions) &&
                        ovPrescriptions.length > 0 ? (
                        <div className="space-y-2">
                          {ovPrescriptions.slice(0, 3).map((pr: any) => (
                            <div
                              key={pr.id}
                              className="rounded-lg border border-border/20 p-3"
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                    pr.status === "ACTIVE"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-zinc-100 text-zinc-600"
                                  }`}
                                >
                                  {pr.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {pr.startDate
                                    ? new Date(
                                        pr.startDate
                                      ).toLocaleDateString()
                                    : ""}
                                </span>
                              </div>
                              {pr.notes && (
                                <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                  {pr.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Không có đơn thuốc
                        </div>
                      )}
                    </div>

                    {/* Upcoming reminders */}
                    <div className="rounded-xl border border-border/20 p-4 bg-background/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-foreground">
                          Nhắc nhở sắp tới
                        </div>
                        {!loadingOvReminders &&
                          Array.isArray(ovReminders) &&
                          ovReminders.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {ovReminders.length}
                            </div>
                          )}
                      </div>
                      {loadingOvReminders ? (
                        <div className="text-muted-foreground text-sm">
                          Đang tải...
                        </div>
                      ) : Array.isArray(ovReminders) &&
                        ovReminders.length > 0 ? (
                        <div className="space-y-2">
                          {ovReminders
                            .slice(0, 5)
                            .map((r: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg border border-border/20 p-3"
                              >
                                <div className="text-xs text-muted-foreground">
                                  {r.date}
                                </div>
                                <div className="text-sm font-medium text-foreground truncate">
                                  {r.medicationName} • {r.dosage}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {r.time?.slice?.(0, 5)}
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
                  </div>

                  {/* Alerts and recent adherence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border/20 p-4 bg-background/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-foreground">
                          Cảnh báo
                        </div>
                        {!loadingOvAlerts && Array.isArray(ovAlerts) && (
                          <div className="text-xs text-muted-foreground">
                            {ovAlerts.filter((a: any) => !a.resolved).length}{" "}
                            chưa xử lý
                          </div>
                        )}
                      </div>
                      {loadingOvAlerts ? (
                        <div className="text-muted-foreground text-sm">
                          Đang tải...
                        </div>
                      ) : Array.isArray(ovAlerts) && ovAlerts.length > 0 ? (
                        <div className="space-y-2">
                          {ovAlerts.slice(0, 4).map((a: any, idx: number) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-border/20 p-3 flex items-center justify-between"
                            >
                              <div className="text-sm text-foreground truncate">
                                {a.type === "MISSED_DOSE"
                                  ? "Bỏ liều"
                                  : a.type === "LOW_ADHERENCE"
                                  ? "Tuân thủ thấp"
                                  : "Cảnh báo"}
                              </div>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                  a.resolved
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {a.resolved ? "Đã xử lý" : "Chưa xử lý"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Không có cảnh báo
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border/20 p-4 bg-background/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-foreground">
                          Nhật ký tuân thủ gần đây
                        </div>
                      </div>
                      {loadingOvAdh ? (
                        <div className="text-muted-foreground text-sm">
                          Đang tải...
                        </div>
                      ) : Array.isArray(ovAdherence) &&
                        ovAdherence.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {ovAdherence.slice(0, 8).map((log: any) => (
                            <div
                              key={log.id}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/20 bg-background"
                            >
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.takenAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Không có dữ liệu
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prescriptions */}
          {activeTab === "prescriptions" && (
            <div className="rounded-xl border border-border/20 bg-card p-4">
              {loadingPres ? (
                <div className="text-muted-foreground">Đang tải...</div>
              ) : !prescriptions ||
                (Array.isArray(prescriptions) && prescriptions.length === 0) ? (
                <div className="text-muted-foreground">
                  Không có đơn thuốc hoạt động
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(prescriptions as any[]).map((pr: any) => (
                    <button
                      key={pr.id}
                      className="text-left group rounded-2xl border border-border/20 bg-background/70 hover:bg-accent/40 transition-colors shadow-sm hover:shadow-md"
                      onClick={() => setSelectedPrescriptionId(pr.id)}
                    >
                      <div className="p-4 flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-base font-semibold">
                          RX
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">
                                Đơn thuốc
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                    pr.status === "ACTIVE"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-zinc-100 text-zinc-600"
                                  }`}
                                >
                                  {pr.status}
                                </span>
                                <span className="h-3 w-px bg-border/50" />
                                <span>
                                  {pr.startDate
                                    ? new Date(
                                        pr.startDate
                                      ).toLocaleDateString()
                                    : "-"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                                {(pr.doctor?.fullName || "BS")
                                  .toString()
                                  .charAt(0)}
                              </div>
                            </div>
                          </div>
                          {pr.notes && (
                            <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {pr.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Prescription Detail Dialog */}
              {selectedPrescriptionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setSelectedPrescriptionId(null)}
                  />
                  <div className="relative bg-card rounded-2xl shadow-xl border border-border/20 w-full max-w-3xl mx-4 overflow-hidden">
                    <div className="p-4 border-b border-border/20 flex items-center justify-between bg-background/60 backdrop-blur">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {(
                            (prescriptionDetail as any)?.doctor?.fullName ||
                            "BS"
                          )
                            .toString()
                            .charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-foreground truncate">
                            Chi tiết đơn thuốc
                          </h2>
                          <p className="text-xs text-muted-foreground truncate">
                            Bác sĩ:{" "}
                            {(prescriptionDetail as any)?.doctor?.fullName ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedPrescriptionId(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-5 space-y-5">
                      {loadingPresDetail ? (
                        <div className="text-muted-foreground">
                          Đang tải chi tiết...
                        </div>
                      ) : (
                        <>
                          {/* Header summary */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="rounded-lg border border-border/20 p-3">
                              <div className="text-[11px] text-muted-foreground">
                                Trạng thái
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                    (prescriptionDetail as any)?.status ===
                                    "ACTIVE"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-zinc-100 text-zinc-600"
                                  }`}
                                >
                                  {(prescriptionDetail as any)?.status}
                                </span>
                              </div>
                            </div>
                            <div className="rounded-lg border border-border/20 p-3 col-span-1 md:col-span-2">
                              <div className="text-[11px] text-muted-foreground">
                                Bắt đầu
                              </div>
                              <div className="mt-1 text-sm text-foreground">
                                {(prescriptionDetail as any)?.startDate
                                  ? new Date(
                                      (prescriptionDetail as any).startDate
                                    ).toLocaleString()
                                  : "-"}
                              </div>
                            </div>
                            <div className="rounded-lg border border-border/20 p-3">
                              <div className="text-[11px] text-muted-foreground">
                                Kết thúc
                              </div>
                              <div className="mt-1 text-sm text-foreground">
                                {(prescriptionDetail as any)?.endDate
                                  ? new Date(
                                      (prescriptionDetail as any).endDate
                                    ).toLocaleString()
                                  : "-"}
                              </div>
                            </div>
                          </div>
                          {(prescriptionDetail as any)?.notes && (
                            <div className="rounded-lg border border-border/20 p-3">
                              <div className="text-[11px] text-muted-foreground">
                                Ghi chú
                              </div>
                              <div className="mt-1 text-sm text-foreground">
                                {(prescriptionDetail as any).notes}
                              </div>
                            </div>
                          )}

                          {/* Items timeline/list */}
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-foreground">
                              Danh sách thuốc
                            </div>
                            <div className="space-y-3">
                              {Array.isArray(
                                (prescriptionDetail as any)?.items
                              ) ? (
                                (prescriptionDetail as any).items.map(
                                  (it: any) => (
                                    <div
                                      key={it.id}
                                      className="rounded-xl border border-border/20 p-4 bg-background/60"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <div className="text-sm font-semibold text-foreground">
                                            {it.medicationName || "Thuốc"}
                                          </div>
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] bg-primary/10 text-primary">
                                              {it.dosage}
                                            </span>
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] bg-emerald-100 text-emerald-700">
                                              {it.frequencyPerDay} lần/ngày
                                            </span>
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] bg-blue-100 text-blue-700">
                                              {it.durationDays} ngày
                                            </span>
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] bg-zinc-100 text-zinc-700">
                                              {it.route || "-"}
                                            </span>
                                          </div>
                                          <div className="mt-1 text-xs text-muted-foreground">
                                            Giờ uống:{" "}
                                            {Array.isArray(it.timesOfDay)
                                              ? it.timesOfDay.join(", ")
                                              : "-"}
                                          </div>
                                          {it.instructions && (
                                            <div className="text-xs text-muted-foreground">
                                              Hướng dẫn: {it.instructions}
                                            </div>
                                          )}
                                        </div>
                                        <div className="shrink-0" />
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="text-xs text-muted-foreground">
                                  Không có danh sách thuốc
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Confirm Intake */}
                          <div className="rounded-xl border border-border/20 p-4">
                            <div className="text-sm font-medium text-foreground">
                              Xác nhận đã uống thuốc
                            </div>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <select
                                className="col-span-2 px-3 py-2 rounded-lg border border-border/30 bg-background text-sm"
                                value={confirmItemId}
                                onChange={(e) =>
                                  setConfirmItemId(e.target.value)
                                }
                              >
                                <option value="">Chọn thuốc trong đơn</option>
                                {Array.isArray(
                                  (prescriptionDetail as any)?.items
                                ) &&
                                  (prescriptionDetail as any).items.map(
                                    (it: any) => (
                                      <option key={it.id} value={it.id}>
                                        {it.medicationName || "Thuốc"} —{" "}
                                        {it.dosage}
                                      </option>
                                    )
                                  )}
                              </select>
                              <button
                                className="px-3 py-2 rounded-lg border border-border/30 hover:bg-accent/30"
                                onClick={handleConfirmIntake}
                                disabled={!confirmItemId}
                              >
                                Xác nhận
                              </button>
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              Trạng thái gửi: TAKEN cùng thời gian hiện tại.
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
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
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Trang {(history as any)?.page} /{" "}
                      {Math.ceil(
                        ((history as any)?.total ?? 0) /
                          ((history as any)?.limit || 1) || 1
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 rounded border border-border/30 hover:bg-accent/30 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={((history as any)?.page ?? 1) <= 1}
                      >
                        Trước
                      </button>
                      <button
                        className="px-3 py-1 rounded border border-border/30 hover:bg-accent/30 disabled:opacity-50"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={
                          ((history as any)?.page ?? 1) >=
                          Math.ceil(
                            ((history as any)?.total ?? 0) /
                              ((history as any)?.limit || 1) || 1
                          )
                        }
                      >
                        Sau
                      </button>
                    </div>
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

  // ============== ADMIN/DOCTOR view (existing) ==============
  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Quản lý bệnh nhân
            </h1>
            <p className="text-muted-foreground">
              Quản lý thông tin bệnh nhân trong hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="px-3 py-2 rounded-lg border border-border/30 bg-background text-sm"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <select
              className="px-2 py-2 rounded-lg border border-border/30 bg-background text-sm"
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(parseInt(e.target.value));
              }}
            >
              {[8, 12, 16, 24].map((n) => (
                <option key={n} value={n}>
                  {n}/trang
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            Đang tải...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-40 text-red-500">
            Không thể tải danh sách bệnh nhân
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {patients.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border/20 bg-background shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4 flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-lg font-semibold">
                      {p.fullName?.charAt(0) || "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {p.fullName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${statusColor(
                            p.status
                          )}`}
                        >
                          {p.status || "UNKNOWN"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        {p.phoneNumber}
                      </div>
                      {p.userInfo && (
                        <div className="mt-2 text-xs text-muted-foreground truncate">
                          {p.userInfo.gender} • {p.userInfo.birthYear}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Trang {pagination?.currentPage} / {pagination?.totalPages} —
                  Tổng {pagination?.total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded border border-border/30 hover:bg-accent/30 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination?.hasPrevPage}
                  >
                    Trước
                  </button>
                  <button
                    className="px-3 py-1 rounded border border-border/30 hover:bg-accent/30 disabled:opacity-50"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination?.hasNextPage}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
            {!pagination && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Hiển thị tất cả {patients.length} bệnh nhân
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
