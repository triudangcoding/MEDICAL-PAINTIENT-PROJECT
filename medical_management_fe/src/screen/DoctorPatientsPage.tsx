import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { patientApi } from '@/api/patient/patient.api'
import { Button } from '@/components/ui/button'
import { CreatePatientDialog } from '@/components/dialogs/patients/create-patient.dialog'
import { UpdatePatientDialog } from '@/components/dialogs/patients/update-patient.dialog'
import { ConfirmDeletePatientDialog } from '@/components/dialogs/patients/confirm-delete-patient.dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export default function DoctorPatientsPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editPatient, setEditPatient] = useState<any | null>(null)
  const [deletePatient, setDeletePatient] = useState<any | null>(null)

  const [historyPatient, setHistoryPatient] = useState<any | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyForm, setHistoryForm] = useState<{
    conditions: string[];
    allergies: string[];
    surgeries: string[];
    familyHistory?: string;
    lifestyle?: string;
    currentMedications: string[];
    notes?: string;
    conditionsOther?: string;
    allergiesOther?: string;
    surgeriesOther?: string;
  }>({ conditions: [], allergies: [], surgeries: [], currentMedications: [] })
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctor-patients', page, limit, search],
    queryFn: () => patientApi.getPatientsForDoctor({ page, limit, search })
  })

  useEffect(() => {
    refetch()
  }, [page, limit, search, refetch])

  const patients = (data as any)?.data ?? []
  const pagination = (data as any)?.pagination

  const statusColor = (status?: string) =>
    status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : status === 'INACTIVE' ? 'bg-zinc-100 text-zinc-600' : 'bg-amber-100 text-amber-700'

  const openHistory = async (p: any) => {
    try {
      // Always fetch latest detail to ensure UI shows persisted values
      const latest = await patientApi.getPatientDetailForDoctor(p.id)
      const patient = latest?.data ?? latest ?? p
      setHistoryPatient(patient)
      const mh = patient.medicalHistory || {}
      setHistoryForm({
        conditions: mh.conditions || [],
        allergies: mh.allergies || [],
        surgeries: mh.surgeries || [],
        familyHistory: mh.familyHistory || '',
        lifestyle: mh.lifestyle || '',
        currentMedications: mh.currentMedications || [],
        notes: mh.notes || '',
        conditionsOther: mh.conditionsOther || '',
        allergiesOther: mh.allergiesOther || '',
        surgeriesOther: mh.surgeriesOther || ''
      })
      const extras = mh.extras || {}
      const rows = Object.keys(extras).length > 0 ? Object.entries(extras).map(([k, v]: any) => ({ key: String(k), value: String(v) })) : [{ key: '', value: '' }]
      setCustomFields(rows)
      setIsHistoryOpen(true)
    } catch (error) {
      console.error('Failed to load latest patient detail:', error)
      // fallback to existing data
      setHistoryPatient(p)
      setIsHistoryOpen(true)
    }
  }

  const saveHistory = async () => {
    if (!historyPatient?.id) return
    try {
      // Merge "Khác" inputs into arrays before saving
      const mergedConditions = Array.from(new Set([
        ...((historyForm.conditions || []).map(s => s.trim()).filter(Boolean)),
        ...(historyForm.conditionsOther?.trim() ? [historyForm.conditionsOther.trim()] : [])
      ]))
      const mergedAllergies = Array.from(new Set([
        ...((historyForm.allergies || []).map(s => s.trim()).filter(Boolean)),
        ...(historyForm.allergiesOther?.trim() ? [historyForm.allergiesOther.trim()] : [])
      ]))
      const mergedSurgeries = Array.from(new Set([
        ...((historyForm.surgeries || []).map(s => s.trim()).filter(Boolean)),
        ...(historyForm.surgeriesOther?.trim() ? [historyForm.surgeriesOther.trim()] : [])
      ]))

      const extras = customFields.filter(f => f.key && f.value).reduce((acc, cur) => { acc[cur.key] = cur.value; return acc; }, {} as Record<string, string>)
      await patientApi.updatePatientHistory(historyPatient.id, {
        conditions: mergedConditions,
        allergies: mergedAllergies,
        surgeries: mergedSurgeries,
        familyHistory: historyForm.familyHistory,
        lifestyle: historyForm.lifestyle,
        currentMedications: (historyForm.currentMedications || []).map(s => s.trim()).filter(Boolean),
        notes: historyForm.notes,
        extras
      })
      toast.success('Lưu tiền sử bệnh án thành công')
      setIsHistoryOpen(false)
      setHistoryPatient(null)
      refetch()
    } catch (error) {
      console.error('Error saving medical history:', error);
      toast.error('Không thể lưu tiền sử bệnh án')
    }
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý bệnh nhân</h1>
            <p className="text-muted-foreground">Thêm, sửa, xóa bệnh nhân (bác sĩ)</p>
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
            <Button onClick={() => setIsCreateOpen(true)}>Thêm bệnh nhân</Button>
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
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${statusColor(p.status)}`}>{p.status || 'UNKNOWN'}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">{p.phoneNumber}</div>
                      {p.userInfo && (
                        <div className="mt-2 text-xs text-muted-foreground truncate">
                          {p.userInfo.gender} • {p.userInfo.birthYear || 'N/A'}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditPatient(p)}>Sửa</Button>
                        <Button variant="outline" size="sm" onClick={() => openHistory(p)}>Tiền sử</Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeletePatient(p)}>Xóa</Button>
                      </div>
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

      {/* Dialogs */}
      <CreatePatientDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateSuccess={() => refetch()}
        defaultRole="PATIENT"
        lockRole
      />

      {editPatient && (
        <UpdatePatientDialog
          isOpen={!!editPatient}
          onClose={() => setEditPatient(null)}
          onUpdateSuccess={() => refetch()}
          patient={{ id: editPatient.id, fullName: editPatient.fullName, phoneNumber: editPatient.phoneNumber, role: 'PATIENT' } as any}
        />
      )}

      {deletePatient && (
        <ConfirmDeletePatientDialog
          isOpen={!!deletePatient}
          onClose={() => setDeletePatient(null)}
          onDeleteSuccess={() => refetch()}
          action='delete'
          patient={{ id: deletePatient.id, fullName: deletePatient.fullName } as any}
        />
      )}

      {/* Medical History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Tiền sử bệnh án</DialogTitle>
            <DialogDescription>Nhập/điều chỉnh thông tin tiền sử cho bệnh nhân</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='rounded-xl border border-border/20 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm'>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <h3 className="text-sm font-semibold text-foreground">Tình trạng sức khỏe</h3>
                </div>
                <div className='grid gap-3'>
                  <div>
                    <label className='text-xs font-medium text-muted-foreground mb-2 block'>Bệnh nền</label>
                    <Input 
                      placeholder='Ví dụ: Đái tháo đường, Tăng huyết áp...'
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
                      value={historyForm.conditions.join(', ')}
                      onChange={(e) => setHistoryForm((p) => ({ ...p, conditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    />
                  </div>
                  <div>
                    <label className='text-xs font-medium text-muted-foreground mb-2 block'>Dị ứng</label>
                    <Input 
                      placeholder='Ví dụ: Penicillin, Hải sản...'
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
                      value={historyForm.allergies.join(', ')}
                      onChange={(e) => setHistoryForm((p) => ({ ...p, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    />
                  </div>
                  <div>
                    <label className='text-xs font-medium text-muted-foreground mb-2 block'>Phẫu thuật</label>
                    <Input 
                      placeholder='Ví dụ: Cắt ruột thừa, Mổ tim...'
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
                      value={historyForm.surgeries.join(', ')}
                      onChange={(e) => setHistoryForm((p) => ({ ...p, surgeries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    />
                  </div>
                </div>
              </div>
              <div className='rounded-xl border border-border/20 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm'>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <h3 className="text-sm font-semibold text-foreground">Thông tin bổ sung</h3>
                </div>
                <div className='grid gap-3'>
                  <div>
                    <label className='text-xs font-medium text-muted-foreground mb-2 block'>Tiền sử gia đình</label>
                    <Input 
                      placeholder='Ví dụ: Tiểu đường, tim mạch...' 
                      className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
                      value={historyForm.familyHistory || ''} 
                      onChange={(e) => setHistoryForm((p) => ({ ...p, familyHistory: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className='text-xs font-medium text-muted-foreground mb-2 block'>Lối sống</label>
                    <Input 
                      placeholder='Ví dụ: Hút thuốc, rượu bia, ít vận động...' 
                      className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
                      value={historyForm.lifestyle || ''} 
                      onChange={(e) => setHistoryForm((p) => ({ ...p, lifestyle: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className='text-xs font-medium text-muted-foreground mb-2 block'>Thuốc đang dùng</label>
                    <Input 
                      placeholder='Ví dụ: Aspirin, Metformin...' 
                      className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
                      value={historyForm.currentMedications.join(', ')} 
                      onChange={(e) => setHistoryForm((p) => ({ ...p, currentMedications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} 
                    />
                  </div>
                  <div>
                    <label className='text-xs font-medium text-muted-foreground mb-2 block'>Ghi chú</label>
                    <Input 
                      placeholder='Ghi chú khác' 
                      className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
                      value={historyForm.notes || ''} 
                      onChange={(e) => setHistoryForm((p) => ({ ...p, notes: e.target.value }))} 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='rounded-xl border border-border/20 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm'>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <h3 className="text-sm font-semibold text-foreground">Thông tin tùy chỉnh</h3>
              </div>
              <div className="h-40 w-full overflow-y-auto rounded-md border border-border/20 bg-background/50 p-2">
                <div className='space-y-2'>
                {customFields.map((row, idx) => (
                  <div key={idx} className='grid grid-cols-6 gap-3 items-center'>
                      <Input 
                      className='col-span-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20' 
                        placeholder='Khóa (ví dụ: Nhóm máu)' 
                        value={row.key} 
                        onChange={(e) => {
                          setCustomFields((prev) => prev.map((r, i) => i === idx ? { ...r, key: e.target.value } : r))
                        }} 
                      />
                      <Input 
                      className='col-span-3 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20' 
                        placeholder='Giá trị (ví dụ: O+)'
                        value={row.value}
                        onChange={(e) => setCustomFields((prev) => prev.map((r, i) => i === idx ? { ...r, value: e.target.value } : r))}
                      />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='justify-self-end h-8 w-8 p-0 hover:bg-accent/50'
                      onClick={() => setCustomFields((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label='Xóa dòng'
                    >
                      <X className='h-4 w-4 text-muted-foreground' />
                    </Button>
                    </div>
                  ))}
                </div>
              </div>
            <div className='flex items-center gap-2 pt-2'>
                <Button 
                  type='button' 
                  variant='outline' 
                  size='sm' 
                  className="transition-all duration-200 hover:bg-accent/50"
                  onClick={() => setCustomFields((p) => [...p, { key: '', value: '' }])}
                >
                  Thêm dòng
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant='outline' 
              className="transition-all duration-200 hover:bg-accent/50"
              onClick={() => setIsHistoryOpen(false)}
            >
              Đóng
            </Button>
            <Button 
              onClick={saveHistory} 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm transition-all duration-200 hover:shadow-md hover:from-emerald-600 hover:to-teal-600"
            >
              Lưu tiền sử
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
