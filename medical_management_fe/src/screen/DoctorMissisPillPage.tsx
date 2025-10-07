import React, { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DoctorApi } from "@/api/doctor";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Search,
  Copy,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

const DoctorMissisPillPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [sinceDays, setSinceDays] = useState<number>(90);
  const [search, setSearch] = useState<string>("");

  // WebSocket connection
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  const { isConnected, joinRoom } = useWebSocket(token || undefined);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["doctor-adherence-status", sinceDays],
    queryFn: () => DoctorApi.listPatientsWithAdherenceAndAlerts(sinceDays),
    staleTime: 10_000, // Giảm staleTime xuống 10 giây để cập nhật nhanh hơn
    refetchInterval: 30_000, // Tự động refetch mỗi 30 giây
    refetchIntervalInBackground: true, // Tiếp tục refetch khi tab không active
    refetchOnWindowFocus: true, // Refetch khi user focus lại tab
  });

  // Listen for WebSocket events và auto-refresh data
  useEffect(() => {
    const handleAdherenceUpdate = (event: CustomEvent) => {
      const { patientId, status } = event.detail;
      console.log(`Patient ${patientId} adherence updated: ${status}`);

      // Invalidate và refetch data ngay lập tức
      queryClient.invalidateQueries({
        queryKey: ["doctor-adherence-status"],
      });
    };

    const handleDoctorWarning = (event: CustomEvent) => {
      const { patientId } = event.detail;
      console.log(`Doctor warning sent to patient ${patientId}`);

      // Invalidate queries để cập nhật warning count
      queryClient.invalidateQueries({
        queryKey: ["doctor-adherence-status"],
      });
    };

    // Join doctor room khi WebSocket connected
    if (isConnected) {
      joinRoom("doctors");
    }

    // Listen for custom events
    window.addEventListener(
      "adherence-updated",
      handleAdherenceUpdate as EventListener
    );
    window.addEventListener(
      "doctor-warning",
      handleDoctorWarning as EventListener
    );
    window.addEventListener(
      "adherence-broadcast",
      handleAdherenceUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "adherence-updated",
        handleAdherenceUpdate as EventListener
      );
      window.removeEventListener(
        "doctor-warning",
        handleDoctorWarning as EventListener
      );
      window.removeEventListener(
        "adherence-broadcast",
        handleAdherenceUpdate as EventListener
      );
    };
  }, [isConnected, joinRoom, queryClient]);

  const warnMutation = useMutation({
    mutationFn: (args: { patientId: string; message?: string }) =>
      DoctorApi.warnPatient(args.patientId, args.message),
    onSuccess: async () => {
      toast.success("Đã nhắc nhở bệnh nhân!", { duration: 2000 });
      // Invalidate tất cả queries liên quan đến adherence
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["doctor-adherence-status"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        }),
      ]);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gửi nhắc nhở thất bại");
    },
  });

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (x) =>
        x.fullName.toLowerCase().includes(q) ||
        x.phoneNumber?.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const copyPhone = async (phone?: string) => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      toast.success("Đã sao chép số điện thoại!", { duration: 1500 });
    } catch {
      toast.error("Không thể sao chép số điện thoại");
    }
  };

  // Tính toán thống kê tổng quan
  const summaryStats = useMemo(() => {
    const items = data?.items ?? [];
    return {
      total: items.length,
      compliant: items.filter((x) => x.todayStatus === "COMPLIANT").length,
      partial: items.filter((x) => x.todayStatus === "PARTIAL").length,
      missed: items.filter((x) => x.todayStatus === "MISSED").length,
      withAlerts: items.filter((x) => x.totalAlerts > 0).length,
    };
  }, [data?.items]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header với thống kê tổng quan */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Tình trạng tuân thủ thuốc
            </h1>
            <p className="text-muted-foreground mt-1">
              Theo dõi và quản lý tuân thủ thuốc của bệnh nhân
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm theo tên/số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full md:w-80 bg-white/50 backdrop-blur-sm border-green-200 focus:border-green-400"
              />
            </div>
            <Select
              value={String(sinceDays)}
              onValueChange={(v) => setSinceDays(parseInt(v))}
            >
              <SelectTrigger className="w-32 bg-white/50 backdrop-blur-sm border-green-200 focus:border-green-400">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 ngày</SelectItem>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="14">14 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
                <SelectItem value="90">90 ngày</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-white/50 backdrop-blur-sm border-green-200 hover:bg-green-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>

            {/* Test WebSocket button */}
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch("/api/doctor/test-websocket", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      "Content-Type": "application/json",
                    },
                  });
                  const result = await response.json();
                  console.log("WebSocket test result:", result);
                  toast.success("WebSocket test sent!");
                } catch (error) {
                  console.error("WebSocket test error:", error);
                  toast.error("WebSocket test failed");
                }
              }}
              className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
            >
              🔔 Test WS
            </Button>

            {/* Real-time indicator */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isFetching ? "bg-green-500 animate-pulse" : "bg-green-400"
                  }`}
                />
                <span className="hidden md:inline text-green-600">
                  {isFetching ? "Đang cập nhật..." : "Đang đồng bộ"}
                </span>
              </div>

              {/* WebSocket status */}
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-blue-500" : "bg-red-400"
                  }`}
                />
                <span className="hidden md:inline text-blue-600">
                  {isConnected ? "Real-time" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        {!isLoading && data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Tổng bệnh nhân
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {summaryStats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">
                      Tuân thủ đầy đủ
                    </p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {summaryStats.compliant}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 font-medium">
                      Tuân thủ một phần
                    </p>
                    <p className="text-2xl font-bold text-amber-700">
                      {summaryStats.partial}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-red-600 font-medium">Bỏ lỡ</p>
                    <p className="text-2xl font-bold text-red-700">
                      {summaryStats.missed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      Có cảnh báo
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {summaryStats.withAlerts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bảng dữ liệu chính */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-green-600" />
            Chi tiết tuân thủ thuốc
          </CardTitle>
        </CardHeader>
        <Separator className="bg-gradient-to-r from-green-200 to-emerald-200" />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-slate-50 to-slate-100"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700">
                    Không thể tải dữ liệu
                  </h3>
                  <p className="text-sm text-red-600 mt-1">
                    Vui lòng thử lại sau
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              </div>
            </div>
          ) : (filteredItems?.length ?? 0) === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-slate-100 rounded-full">
                  <Users className="h-8 w-8 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-700">
                    Không có dữ liệu
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Không có dữ liệu tuân thủ thuốc trong khoảng thời gian{" "}
                    {sinceDays} ngày
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                    <TableHead className="uppercase text-green-700 text-xs font-semibold tracking-wider">
                      Bệnh nhân
                    </TableHead>
                    <TableHead className="uppercase text-green-700 text-xs font-semibold tracking-wider">
                      Liên hệ
                    </TableHead>
                    <TableHead className="text-center uppercase text-green-700 text-xs font-semibold tracking-wider">
                      Tổng quan
                    </TableHead>
                    <TableHead className="text-center uppercase text-green-700 text-xs font-semibold tracking-wider">
                      Hôm nay
                    </TableHead>
                    <TableHead className="text-center uppercase text-green-700 text-xs font-semibold tracking-wider">
                      Đã uống
                    </TableHead>
                    <TableHead className="text-center uppercase text-green-700 text-xs font-semibold tracking-wider">
                      Bỏ lỡ
                    </TableHead>
                    <TableHead className="text-center uppercase text-green-700 text-xs font-semibold tracking-wider">
                      Cảnh báo
                    </TableHead>
                    <TableHead className="text-right uppercase text-green-700 text-xs font-semibold tracking-wider">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((row) => (
                    <TableRow
                      key={row.patientId}
                      className="hover:bg-green-50/50 transition-colors border-b border-green-100/50"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-green-200">
                            <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 font-semibold">
                              {getInitials(row.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-800 leading-tight">
                              {row.fullName}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              ID: {row.patientId.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-700">
                            {row.phoneNumber}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyPhone(row.phoneNumber)}
                                  className="h-7 w-7 p-0 border-green-200 hover:bg-green-50"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sao chép số điện thoại</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex justify-center">
                          <Badge
                            className={`px-3 py-1 font-medium ${
                              row.primaryStatus === "TAKEN"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300 shadow-sm"
                                : row.primaryStatus === "MISSED"
                                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300 shadow-sm"
                                : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-300 shadow-sm"
                            }`}
                          >
                            {row.primaryStatus === "TAKEN"
                              ? "Đã uống"
                              : row.primaryStatus === "MISSED"
                              ? "Bỏ lỡ"
                              : "Hỗn hợp"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex justify-center">
                          <Badge
                            className={`px-3 py-1 font-medium ${
                              row.todayStatus === "COMPLIANT"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300 shadow-sm"
                                : row.todayStatus === "PARTIAL"
                                ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-300 shadow-sm"
                                : row.todayStatus === "MISSED"
                                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300 shadow-sm"
                                : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300 shadow-sm"
                            }`}
                          >
                            {row.todayStatus === "COMPLIANT"
                              ? "Tuân thủ"
                              : row.todayStatus === "PARTIAL"
                              ? "Một phần"
                              : row.todayStatus === "MISSED"
                              ? "Bỏ lỡ"
                              : "Chưa có dữ liệu"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex justify-center">
                          <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-300 shadow-sm px-3 py-1 font-semibold">
                            {row.totalTaken}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex justify-center">
                          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300 shadow-sm px-3 py-1 font-semibold">
                            {row.totalMissed}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex flex-col gap-1 items-center">
                          {row.alerts.missedDose > 0 && (
                            <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300 text-xs px-2 py-1 font-medium">
                              Bỏ lỡ: {row.alerts.missedDose}
                            </Badge>
                          )}
                          {row.alerts.lowAdherence > 0 && (
                            <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-300 text-xs px-2 py-1 font-medium">
                              Tuân thủ thấp: {row.alerts.lowAdherence}
                            </Badge>
                          )}
                          {row.alerts.other > 0 && (
                            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-300 text-xs px-2 py-1 font-medium">
                              Khác: {row.alerts.other}
                            </Badge>
                          )}
                          {row.totalAlerts === 0 && (
                            <span className="text-xs text-green-600 font-medium">
                              Không có
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  className={`font-medium px-4 py-2 shadow-sm transition-all duration-200 ${
                                    row.todayStatus === "COMPLIANT"
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-default border-green-400"
                                      : row.todayStatus === "PARTIAL"
                                      ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
                                      : row.todayWarningCount > 0
                                      ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                                      : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                                  } ${
                                    row.todayStatus === "COMPLIANT" ||
                                    warnMutation.isPending ||
                                    row.todayWarningCount >= 3
                                      ? "opacity-75 cursor-not-allowed"
                                      : "hover:shadow-md hover:scale-105"
                                  }`}
                                  onClick={() => {
                                    if (row.todayStatus !== "COMPLIANT") {
                                      warnMutation.mutate({
                                        patientId: row.patientId,
                                      });
                                    }
                                  }}
                                  disabled={
                                    row.todayStatus === "COMPLIANT" ||
                                    warnMutation.isPending ||
                                    row.todayWarningCount >= 3
                                  }
                                >
                                  {row.todayStatus === "COMPLIANT"
                                    ? "Đã tuân thủ"
                                    : row.todayStatus === "PARTIAL"
                                    ? "Một phần"
                                    : row.todayWarningCount > 0
                                    ? `Đã nhắc nhở (${row.todayWarningCount})`
                                    : "Nhắc nhở"}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-center">
                                  {row.todayStatus === "COMPLIANT"
                                    ? "Bệnh nhân đã tuân thủ uống thuốc đầy đủ hôm nay"
                                    : row.todayStatus === "PARTIAL"
                                    ? "Bệnh nhân tuân thủ một phần hôm nay"
                                    : row.todayWarningCount >= 3
                                    ? "Đã nhắc nhở tối đa 3 lần trong ngày"
                                    : row.todayWarningCount > 0
                                    ? `Đã nhắc nhở ${row.todayWarningCount} lần hôm nay`
                                    : "Gửi cảnh báo tuân thủ tới bệnh nhân"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <TableCell colSpan={8} className="py-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3 text-sm">
                        <div className="flex items-center gap-4 text-green-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">
                              Khoảng thời gian: {sinceDays} ngày
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">
                              Tổng bệnh nhân: {data?.total ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            Cập nhật:{" "}
                            {new Date(data?.since ?? Date.now()).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorMissisPillPage;
