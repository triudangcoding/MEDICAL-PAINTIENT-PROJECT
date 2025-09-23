import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { patientApi } from '@/api/patient/patient.api'
import { authApi } from '@/api/auth/auth.api'

export default function PatientPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')

  const { data: me } = useQuery({ queryKey: ['currentUser'], queryFn: authApi.getCurrentUser })
  const role = me?.data.role

  const queryFn = useMemo(() => {
    return role === 'DOCTOR'
      ? () => patientApi.getPatientsForDoctor({ page, limit, search })
      : () => patientApi.getPatients({ page, limit, search })
  }, [role, page, limit, search])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['patients', role, page, limit, search],
    queryFn,
    enabled: !!role,
    keepPreviousData: true,
  })

  useEffect(() => {
    if (role) refetch()
  }, [role, page, limit, search, refetch])

  const patients = data?.data ?? []
  const pagination = data?.pagination

  const statusColor = (status?: string) =>
    status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : status === 'INACTIVE' ? 'bg-zinc-100 text-zinc-600' : 'bg-amber-100 text-amber-700'

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý bệnh nhân</h1>
            <p className="text-muted-foreground">Quản lý thông tin bệnh nhân trong hệ thống</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="px-3 py-2 rounded-lg border border-border/30 bg-background text-sm"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value) }}
            />
            <select
              className="px-2 py-2 rounded-lg border border-border/30 bg-background text-sm"
              value={limit}
              onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)) }}
            >
              {[8, 12, 16, 24].map(n => <option key={n} value={n}>{n}/trang</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">Đang tải...</div>
        ) : isError ? (
          <div className="flex items-center justify-center h-40 text-red-500">Không thể tải danh sách bệnh nhân</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {patients.map((p: any) => (
                <div key={p.id} className="rounded-xl border border-border/20 bg-background shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-lg font-semibold">
                      {p.fullName?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{p.fullName}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${statusColor(p.status)}`}>
                          {p.status || 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">{p.phoneNumber}</div>
                      {p.userInfo && (
                        <div className="mt-2 text-xs text-muted-foreground truncate">{p.userInfo.gender} • {p.userInfo.birthYear}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Trang {pagination?.currentPage} / {pagination?.totalPages} — Tổng {pagination?.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded border border-border/30 hover:bg-accent/30 disabled:opacity-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!pagination?.hasPrevPage}
                >
                  Trước
                </button>
                <button
                  className="px-3 py-1 rounded border border-border/30 hover:bg-accent/30 disabled:opacity-50"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination?.hasNextPage}
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}