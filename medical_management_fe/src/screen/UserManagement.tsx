import React, { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { userApi } from "@/api/user/user.api";
import { User, UserListResponse } from "@/api/user/types";

const UserManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "DOCTOR" | "PATIENT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, refetch } = useQuery<UserListResponse>({
    queryKey: ["users", page, limit, roleFilter, debouncedSearchQuery],
    queryFn: () => {
      const params = { 
        page, 
        limit, 
        role: roleFilter === "ALL" ? undefined : roleFilter,
        search: debouncedSearchQuery.trim() || undefined
      };
      console.log('🔍 Search params:', params);
      return userApi.getUsers(params);
    },
    placeholderData: keepPreviousData,
  });

  const { data: userDetail, isLoading: isLoadingDetail, isError: isErrorDetail } = useQuery<User | null>({
    queryKey: ["admin-user", selectedUserId],
    queryFn: () => (selectedUserId ? userApi.getUserById(selectedUserId) : Promise.resolve(null)),
    enabled: !!selectedUserId,
  });

  useEffect(() => {
    refetch();
  }, [page, limit, roleFilter, debouncedSearchQuery, refetch]);

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const roleLabel = (role?: User["role"]) =>
    role === "ADMIN" ? "Quản trị" : role === "DOCTOR" ? "Bác sĩ" : "Bệnh nhân";

  const roleColor = (role?: User["role"]) =>
    role === "ADMIN"
      ? "bg-purple-100 text-purple-700"
      : role === "DOCTOR"
      ? "bg-blue-100 text-blue-700"
      : "bg-emerald-100 text-emerald-700";

  const statusColor = (status?: User["status"]) =>
    status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600";

  const cardColorByRole = (role?: User["role"]) =>
    role === "ADMIN"
      ? "border-purple-200/70 bg-purple-50/40 hover:shadow-purple-100"
      : role === "DOCTOR"
      ? "border-blue-200/70 bg-blue-50/40 hover:shadow-blue-100"
      : "border-emerald-200/70 bg-emerald-50/40 hover:shadow-emerald-100";

  return (
    <div className="h-full bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-2xl shadow-lg ring-1 ring-border/40 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý người dùng</h1>
                <p className="text-sm text-muted-foreground">Xem nhanh và quản trị tài khoản hệ thống.</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex rounded-full border border-border/40 bg-background/60 backdrop-blur px-1 py-1">
                  {(["ALL", "ADMIN", "DOCTOR", "PATIENT"] as const).map((r) => (
                    <button
                      key={r}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        roleFilter === r
                          ? "bg-primary/10 text-primary shadow-inner"
                          : "text-muted-foreground hover:bg-accent/50"
                      }`}
                      onClick={() => {
                        setPage(1);
                        setRoleFilter(r);
                      }}
                    >
                      {r === "ALL" ? "Tất cả" : r === "ADMIN" ? "Quản trị" : r === "DOCTOR" ? "Bác sĩ" : "Bệnh nhân"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Hiển thị</span>
                  <select
                    className="px-2 py-1.5 rounded-lg border border-border/40 bg-background text-sm hover:bg-accent/40"
                    value={limit}
                    onChange={(e) => {
                      setPage(1);
                      setLimit(parseInt(e.target.value));
                    }}
                  >
                    {[12, 16, 24].map((n) => (
                      <option key={n} value={n}>{n}/trang</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setDebouncedSearchQuery(searchQuery);
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearchQuery("");
                      setPage(1);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setDebouncedSearchQuery(searchQuery);
                  setPage(1);
                }}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Tìm kiếm
              </button>
              {debouncedSearchQuery && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Tìm kiếm: </span>
                  <span className="font-medium text-foreground">"{debouncedSearchQuery}"</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {pagination?.total || 0} kết quả
                  </span>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">Đang tải...</div>
          ) : isError ? (
            <div className="flex items-center justify-center h-48 text-red-500">Không thể tải danh sách người dùng</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {debouncedSearchQuery ? "Không tìm thấy kết quả" : "Chưa có người dùng nào"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {debouncedSearchQuery 
                  ? `Không tìm thấy người dùng nào với từ khóa "${debouncedSearchQuery}". Thử tìm kiếm với từ khóa khác.`
                  : "Chưa có người dùng nào trong hệ thống. Hãy thêm người dùng mới."
                }
              </p>
              {debouncedSearchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearchQuery("");
                    setPage(1);
                  }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {users.map((u: User) => (
                  <button
                    key={u.id}
                    className={`group text-left rounded-2xl border bg-background hover:bg-card/60 shadow-sm hover:shadow-md transition-all w-full ${cardColorByRole(u.role)} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <div className="p-5 flex items-start gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-lg font-semibold shadow-sm">
                        {u.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold text-foreground whitespace-normal break-words leading-snug">
                            {u.fullName}
                          </h3>
                          <span className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-medium ${roleColor(u.role)}`}>
                            {roleLabel(u.role)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-normal break-words">
                          {u.phoneNumber}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${statusColor(u.status)}`}>
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-600" : "bg-zinc-500"}`} />
                            {u.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                          </span>
                          <span className="text-xs text-muted-foreground opacity-80 group-hover:opacity-100 transition-opacity">Chi tiết →</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8">
                <div className="text-sm text-muted-foreground">
                  Trang {pagination?.currentPage} / {pagination?.totalPages} — Tổng {pagination?.total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg border border-border/40 hover:bg-accent/40 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination?.hasPrevPage}
                  >
                    Trước
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-border/40 hover:bg-accent/40 disabled:opacity-50"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination?.hasNextPage}
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedUserId(null)} />
          <div className="relative bg-card rounded-3xl shadow-2xl border border-border/20 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm border-b border-border/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Thông tin người dùng</h2>
                    <p className="text-sm text-muted-foreground">Chi tiết tài khoản hệ thống</p>
                  </div>
                </div>
                <button 
                  className="w-8 h-8 rounded-full bg-background/80 hover:bg-background border border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSelectedUserId(null)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <span>Đang tải chi tiết...</span>
                  </div>
                </div>
              ) : isErrorDetail || !userDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-red-600 font-medium">Không thể tải thông tin</p>
                    <p className="text-sm text-muted-foreground">Vui lòng thử lại sau</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* User Avatar & Basic Info */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-background/50 to-background/30 border border-border/10">
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                      {userDetail.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-foreground leading-tight">{userDetail.fullName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{userDetail.phoneNumber}</p>
                    </div>
                  </div>

                  {/* User Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Role */}
                    <div className="p-4 rounded-xl bg-background/40 border border-border/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Vai trò</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${roleColor(userDetail.role)}`}>
                        <span className={`w-2 h-2 rounded-full ${userDetail.role === "ADMIN" ? "bg-purple-500" : userDetail.role === "DOCTOR" ? "bg-blue-500" : "bg-emerald-500"}`}></span>
                        {roleLabel(userDetail.role)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="p-4 rounded-xl bg-background/40 border border-border/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Trạng thái</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${statusColor(userDetail.status)}`}>
                        <span className={`w-2 h-2 rounded-full ${userDetail.status === "ACTIVE" ? "bg-emerald-500" : "bg-zinc-500"}`}></span>
                        {userDetail.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {userDetail.majorDoctor && (
                    <div className="p-4 rounded-xl bg-background/40 border border-border/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Chuyên khoa</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {userDetail.majorDoctor === "DINH_DUONG" ? "Dinh dưỡng" : "Tâm thần"}
                      </span>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Tạo: {new Date(userDetail.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Cập nhật: {new Date(userDetail.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border/10 bg-background/30 backdrop-blur-sm">
              <div className="flex items-center justify-end gap-3">
                <button 
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSelectedUserId(null)}
                >
                  Hủy
                </button>
                <button 
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  onClick={() => setSelectedUserId(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;