"use client"

import { patientApi } from "@/api/patient/patient.api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
// import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Zod schema for create patient form
export const createPatientSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ và tên là bắt buộc")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không được quá 100 ký tự")
    .trim(),
  phoneNumber: z
    .string()
    .min(1, "Số điện thoại là bắt buộc")
    .regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số")
    .trim(),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được quá 50 ký tự"),
  role: z
    .string()
    .min(1, "Vui lòng chọn loại tài khoản")
    .refine((val) => ["ADMIN", "DOCTOR", "PATIENT"].includes(val), {
      message: "Loại tài khoản không hợp lệ"
    })
});

type CreatePatientFormData = z.infer<typeof createPatientSchema>;

export function CreatePatientDialog({ isOpen, onClose, onCreateSuccess, defaultRole = '', lockRole = false }: { isOpen: boolean, onClose: () => void, onCreateSuccess: () => void, defaultRole?: 'ADMIN' | 'DOCTOR' | 'PATIENT' | '', lockRole?: boolean }) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false)
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null)
  const [isHistoryStep, setIsHistoryStep] = useState(false)
  const [historyForm, setHistoryForm] = useState<{
    conditions: string[];
    allergies: string[];
    surgeries: string[];
    familyHistory?: string;
    lifestyle?: string;
    currentMedications: string[];
    notes?: string;
  }>({ conditions: [], allergies: [], surgeries: [], currentMedications: [] })
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])

  const defaultValues: CreatePatientFormData = {
    fullName: '',
    phoneNumber: '',
    password: '',
    role: defaultRole || ''
  };

  const form = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  });


  const createPatientMutation = useMutation({
    mutationFn: patientApi.createPatientService,
    onSuccess: (res: any) => {
      const newId = res?.data?.id || res?.id;
      setCreatedPatientId(newId || null);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Tạo bệnh nhân thành công");
      // Move to history step
      setIsHistoryStep(true)
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo bệnh nhân");
    },
  });

  const onSubmit = (data: CreatePatientFormData) => {
    const payload = { ...data, role: lockRole ? (defaultRole || 'PATIENT') : data.role } as CreatePatientFormData;
    createPatientMutation.mutate(payload);
  };

  const submitHistory = async () => {
    if (!createdPatientId) {
      onCreateSuccess();
      onClose();
      return;
    }
    try {
      // Merge "Khác" inputs if present (support parity with DoctorPatientsPage)
      const mergedConditions = Array.from(new Set([
        ...((historyForm.conditions || []).map(s => s.trim()).filter(Boolean))
      ]))
      const mergedAllergies = Array.from(new Set([
        ...((historyForm.allergies || []).map(s => s.trim()).filter(Boolean))
      ]))
      const mergedSurgeries = Array.from(new Set([
        ...((historyForm.surgeries || []).map(s => s.trim()).filter(Boolean))
      ]))
      const extras = customFields.filter(f => f.key && f.value).reduce((acc, cur) => { acc[cur.key] = cur.value; return acc; }, {} as Record<string, string>)
      await patientApi.updatePatientHistory(createdPatientId, {
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
    } catch (error) {
      console.error('Error saving medical history:', error);
      toast.error('Không thể lưu tiền sử bệnh án')
    } finally {
      form.reset()
      setIsHistoryStep(false)
      setCreatedPatientId(null)
      onCreateSuccess()
      onClose()
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isHistoryStep ? "sm:max-w-[720px]" : "sm:max-w-[600px]"}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{isHistoryStep ? 'Tiền sử bệnh án' : 'Thêm bệnh nhân'}</DialogTitle>
          <DialogDescription>
            {isHistoryStep ? 'Nhập nhanh các thông tin tiền sử, có thể cập nhật sau.' : 'Điền thông tin cơ bản để tạo tài khoản bệnh nhân.'}
          </DialogDescription>
        </DialogHeader>
        {!isHistoryStep ? (
          <Form {...form}>
            <form 
              id='create-patient-form' 
              onSubmit={form.handleSubmit(onSubmit)} 
              className='space-y-6'
            >
              <div className="rounded-xl border border-border/20 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <h3 className="text-sm font-semibold text-foreground">Thông tin tài khoản</h3>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">Họ và tên</FormLabel>
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="Nhập họ và tên đầy đủ" 
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">Số điện thoại</FormLabel>
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="Nhập số điện thoại 10-11 chữ số" 
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">Mật khẩu</FormLabel>
                          <FormMessage />
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                              className="pr-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-md hover:bg-accent/50"
                              onClick={togglePasswordVisibility}
                              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!lockRole && (
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium">Loại tài khoản</FormLabel>
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                                <SelectItem value="DOCTOR">Bác sĩ</SelectItem>
                                <SelectItem value="PATIENT">Bệnh nhân</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <DialogFooter className="gap-3">
                <DialogClose asChild>
                  <Button variant="outline" type="button" className="transition-all duration-200 hover:bg-accent/50">
                    Hủy
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createPatientMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm transition-all duration-200 hover:shadow-md hover:from-blue-600 hover:to-indigo-600"
                >
                  {createPatientMutation.isPending ? "Đang tạo..." : "Thêm mới"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
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
                    <div key={idx} className='grid grid-cols-5 gap-3'>
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
                {customFields.length > 1 && (
                  <Button 
                    type='button' 
                    variant='outline' 
                    size='sm' 
                    className="transition-all duration-200 hover:bg-accent/50"
                    onClick={() => setCustomFields((p) => p.slice(0, -1))}
                  >
                    Bớt dòng
                  </Button>
                )}
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button 
                variant='outline' 
                className="transition-all duration-200 hover:bg-accent/50"
                onClick={() => { setIsHistoryStep(false); setCreatedPatientId(null); onCreateSuccess(); onClose(); }}
              >
                Bỏ qua
              </Button>
              <Button 
                onClick={submitHistory} 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm transition-all duration-200 hover:shadow-md hover:from-emerald-600 hover:to-teal-600"
              >
                Lưu tiền sử
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
