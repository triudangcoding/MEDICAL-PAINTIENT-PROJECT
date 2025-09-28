import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientApi } from '@/api/patient/patient.api'
import { DoctorApi } from '@/api/doctor'
import { MedicationsApi } from '@/api/medications'
import { Button } from '@/components/ui/button'
import { CreatePatientDialog } from '@/components/dialogs/patients/create-patient.dialog'
import { ConfirmDeletePatientDialog } from '@/components/dialogs/patients/confirm-delete-patient.dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Plus, Trash2, Pill, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Schema for basic patient info update
const updateBasicInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .refine((val) => val === '' || val.length >= 2, {
      message: "Họ và tên phải có ít nhất 2 ký tự"
    })
    .refine((val) => val === '' || val.length <= 100, {
      message: "Họ và tên không được quá 100 ký tự"
    })
    .optional(),
  phoneNumber: z
    .string()
    .trim()
    .refine((val) => val === '' || /^[0-9]{10,11}$/.test(val), {
      message: "Số điện thoại phải có 10-11 chữ số"
    })
    .optional(),
  password: z
    .string()
    .refine((val) => val === '' || val.length >= 6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự"
    })
    .refine((val) => val === '' || val.length <= 50, {
      message: "Mật khẩu không được quá 50 ký tự"
    })
    .optional(),
  gender: z
    .string()
    .refine((val) => val === '' || ["MALE", "FEMALE", "OTHER"].includes(val), {
      message: "Giới tính không hợp lệ"
    })
    .optional(),
  birthYear: z
    .string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 1900 && Number(val) <= new Date().getFullYear()), {
      message: "Năm sinh không hợp lệ"
    })
    .optional(),
  status: z
    .string()
    .refine((val) => val === '' || ["ACTIVE", "INACTIVE"].includes(val), {
      message: "Trạng thái không hợp lệ"
    })
    .optional(),
  address: z
    .string()
    .trim()
    .refine((val) => val === '' || val.length <= 200, {
      message: "Địa chỉ không được quá 200 ký tự"
    })
    .optional(),
}).refine((data) => {
  return Object.values(data).some(val => val && val !== '');
}, {
  message: "Ít nhất một trường phải được cập nhật",
  path: ["root"]
});

// Schema for prescription form
const prescriptionItemSchema = z.object({
  medicationId: z.string().min(1, "Vui lòng chọn thuốc"),
  dosage: z.string().min(1, "Vui lòng nhập liều lượng"),
  frequencyPerDay: z.number().min(1, "Tần suất phải ít nhất 1 lần/ngày").max(10, "Tần suất không được quá 10 lần/ngày"),
  timesOfDay: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 thời điểm"),
  durationDays: z.number().min(1, "Thời gian điều trị phải ít nhất 1 ngày").max(365, "Thời gian điều trị không được quá 365 ngày"),
  route: z.string().optional(),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  items: z.array(prescriptionItemSchema).min(1, "Vui lòng thêm ít nhất 1 loại thuốc"),
  notes: z.string().optional(),
});

type UpdateBasicInfoData = z.infer<typeof updateBasicInfoSchema>;
type PrescriptionData = z.infer<typeof prescriptionSchema>;
type PrescriptionItemData = z.infer<typeof prescriptionItemSchema>;

export default function DoctorPatientsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [activeDialogTab, setActiveDialogTab] = useState('basic')
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deletePatient, setDeletePatient] = useState<any | null>(null)

  const [historyPatient, setHistoryPatient] = useState<any | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null)
  const [isPrescriptionDetailOpen, setIsPrescriptionDetailOpen] = useState(false)
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
  const [showPassword, setShowPassword] = useState(false)

  // Prescription form states
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemData[]>([
    {
      medicationId: '',
      dosage: '',
      frequencyPerDay: 1,
      timesOfDay: [],
      durationDays: 7,
      route: '',
      instructions: ''
    }
  ])
  const [prescriptionNotes, setPrescriptionNotes] = useState('')
  const [showCreatePrescriptionForm, setShowCreatePrescriptionForm] = useState(false)

  // Form for basic info editing
  const basicInfoForm = useForm<UpdateBasicInfoData>({
    resolver: zodResolver(updateBasicInfoSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      password: '',
      gender: '',
      birthYear: '',
      status: '',
      address: ''
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctor-patients', page, limit, search],
    queryFn: () => patientApi.getPatientsForDoctor({ page, limit, search })
  })

  // Mutation for updating basic patient info
  const updateBasicInfoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBasicInfoData }) =>
      patientApi.updatePatient(id, data),
    onSuccess: async (updatedData) => {
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ["patients"] });
      await queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      await queryClient.invalidateQueries({ queryKey: ["doctor-patients", historyPatient?.id] });
      
      // Update the current patient data in state
      if (historyPatient && updatedData) {
        const updatedPatient = {
          ...historyPatient,
          fullName: updatedData.fullName || historyPatient.fullName,
          phoneNumber: updatedData.phoneNumber || historyPatient.phoneNumber,
          status: updatedData.status || historyPatient.status,
          profile: updatedData.profile ? {
            ...historyPatient.profile,
            ...updatedData.profile
          } : historyPatient.profile
        };
        setHistoryPatient(updatedPatient);
      }
      
      toast.success("Cập nhật thông tin bệnh nhân thành công");
      basicInfoForm.reset();
      refetch();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin bệnh nhân");
    },
  });

  // Medications query
  const { data: medications, isLoading: loadingMedications, error: medicationsError } = useQuery({
    queryKey: ['medications'],
    queryFn: () => MedicationsApi.list({ page: 1, limit: 100, isActive: true }),
    enabled: activeDialogTab === 'prescriptions'
  });

  // Patient prescriptions query
  const { data: patientPrescriptions, refetch: refetchPrescriptions, isLoading: loadingPrescriptions, error: prescriptionsError } = useQuery({
    queryKey: ['patient-prescriptions', historyPatient?.id],
    queryFn: () => DoctorApi.listPrescriptions({ page: 1, limit: 100 }),
    enabled: !!historyPatient && activeDialogTab === 'prescriptions',
    select: (data) => {
      console.log('Raw prescriptions data:', data);
      console.log('data.data type:', typeof data?.data);
      console.log('data.data isArray:', Array.isArray(data?.data));
      console.log('data.data:', data?.data);
      
      // Check if data.data.items is an array
      if (!Array.isArray(data?.data?.items)) {
        console.log('data.data.items is not an array, returning empty array');
        return [];
      }
      
      // Filter prescriptions for current patient
      const filtered = data.data.items.filter((prescription: any) => prescription.patientId === historyPatient?.id) || [];
      console.log('Patient prescriptions filtered:', filtered);
      console.log('Current patient ID:', historyPatient?.id);
      return filtered;
    }
  });

  // Prescription detail query
  const { data: prescriptionDetail, isLoading: loadingPrescriptionDetail } = useQuery({
    queryKey: ['prescription-detail', selectedPrescriptionId],
    queryFn: () => DoctorApi.getPrescription(selectedPrescriptionId!),
    enabled: !!selectedPrescriptionId && isPrescriptionDetailOpen,
  });

  // Create prescription mutation
  const createPrescriptionMutation = useMutation({
    mutationFn: (data: PrescriptionData) => 
      DoctorApi.createPrescription({
        patientId: historyPatient?.id,
        ...data
      }),
    onSuccess: () => {
      toast.success("Tạo đơn thuốc thành công");
      
      // Invalidate and refetch prescriptions
      queryClient.invalidateQueries({ queryKey: ['patient-prescriptions', historyPatient?.id] });
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
      refetchPrescriptions();
      
      // Reset form
      setPrescriptionItems([{
        medicationId: '',
        dosage: '',
        frequencyPerDay: 1,
        timesOfDay: [],
        durationDays: 7,
        route: '',
        instructions: ''
      }]);
      setPrescriptionNotes('');
      
      // Close form
      setShowCreatePrescriptionForm(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo đơn thuốc");
    }
  });

  // Reset form when patient changes
  useEffect(() => {
    if (historyPatient) {
      basicInfoForm.reset({
        fullName: historyPatient.fullName || '',
        phoneNumber: historyPatient.phoneNumber || '',
        password: '',
        gender: historyPatient.userInfo?.gender || historyPatient.profile?.gender || '',
        birthYear: historyPatient.userInfo?.birthYear?.toString() || 
                   (historyPatient.profile?.birthDate ? new Date(historyPatient.profile.birthDate).getFullYear().toString() : '') || '',
        status: historyPatient.status || '',
        address: historyPatient.userInfo?.address || historyPatient.profile?.address || ''
      });
    }
  }, [historyPatient, basicInfoForm]);

  // Reset form after successful update to show new values
  useEffect(() => {
    if (updateBasicInfoMutation.isSuccess && historyPatient) {
      basicInfoForm.reset({
        fullName: historyPatient.fullName || '',
        phoneNumber: historyPatient.phoneNumber || '',
        password: '',
        gender: historyPatient.userInfo?.gender || historyPatient.profile?.gender || '',
        birthYear: historyPatient.userInfo?.birthYear?.toString() || 
                   (historyPatient.profile?.birthDate ? new Date(historyPatient.profile.birthDate).getFullYear().toString() : '') || '',
        status: historyPatient.status || '',
        address: historyPatient.userInfo?.address || historyPatient.profile?.address || ''
      });
    }
  }, [updateBasicInfoMutation.isSuccess, historyPatient, basicInfoForm]);

  useEffect(() => {
    refetch()
  }, [page, limit, search, refetch])

  // Prescription helper functions
  const addPrescriptionItem = () => {
    setPrescriptionItems(prev => [...prev, {
      medicationId: '',
      dosage: '',
      frequencyPerDay: 1,
      timesOfDay: [],
      durationDays: 7,
      route: '',
      instructions: ''
    }]);
  };

  const removePrescriptionItem = (index: number) => {
    if (prescriptionItems.length > 1) {
      setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItemData, value: any) => {
    setPrescriptionItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const toggleTimeOfDay = (itemIndex: number, time: string) => {
    setPrescriptionItems(prev => prev.map((item, i) => 
      i === itemIndex 
        ? { 
            ...item, 
            timesOfDay: item.timesOfDay.includes(time)
              ? item.timesOfDay.filter(t => t !== time)
              : [...item.timesOfDay, time]
          }
        : item
    ));
  };

  const handleCreatePrescription = () => {
    const prescriptionData: PrescriptionData = {
      items: prescriptionItems,
      notes: prescriptionNotes
    };

    // Validate form
    try {
      prescriptionSchema.parse(prescriptionData);
      createPrescriptionMutation.mutate(prescriptionData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0]?.message || "Vui lòng kiểm tra lại thông tin");
      }
    }
  };

  // Submit handler for basic info
  const onSubmitBasicInfo = (data: UpdateBasicInfoData) => {
    if (!historyPatient?.id) {
      toast.error("Không tìm thấy ID bệnh nhân");
      return;
    }

    // Prepare data in backend format
    const updateData: any = {};
    const profileData: any = {};

    // Check for changes and prepare data
    if (data.fullName !== historyPatient.fullName) {
      updateData.fullName = data.fullName;
    }

    if (data.phoneNumber !== historyPatient.phoneNumber) {
      updateData.phoneNumber = data.phoneNumber;
    }


    if (data.password && data.password !== '') {
      updateData.password = data.password;
    }

    if (data.status !== historyPatient.status) {
      updateData.status = data.status;
    }

    // Profile fields - check both userInfo and profile structures
    const currentGender = historyPatient.userInfo?.gender || historyPatient.profile?.gender;
    const currentBirthYear = historyPatient.userInfo?.birthYear?.toString() || 
                           (historyPatient.profile?.birthDate ? new Date(historyPatient.profile.birthDate).getFullYear().toString() : '');
    const currentAddress = historyPatient.userInfo?.address || historyPatient.profile?.address;

    // Only include gender if it's not empty and different
    if (data.gender && data.gender.trim() !== '' && data.gender !== currentGender) {
      profileData.gender = data.gender;
    }

    // Only include birth year if it's not empty and different
    if (data.birthYear && data.birthYear.trim() !== '' && data.birthYear !== currentBirthYear) {
      profileData.birthYear = parseInt(data.birthYear);
    }

    // Only include address if it's not empty and different
    if (data.address && data.address.trim() !== '' && data.address !== currentAddress) {
      profileData.address = data.address;
    }

    // Add profile data if there are changes
    if (Object.keys(profileData).length > 0) {
      updateData.profile = profileData;
    }

    // Only send request if there are changes
    if (Object.keys(updateData).length === 0) {
      toast.error("Không có thay đổi nào để cập nhật");
      return;
    }

    updateBasicInfoMutation.mutate({ id: historyPatient.id, data: updateData });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const calculateAge = (patient: any) => {
    // Check profile first, then userInfo
    if (patient.profile?.birthYear) {
      return new Date().getFullYear() - patient.profile.birthYear;
    }
    if (patient.profile?.birthDate) {
      const birthDate = new Date(patient.profile.birthDate);
      if (isNaN(birthDate.getTime())) {
        return 'N/A';
      }
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    if (patient.userInfo?.birthYear) {
      return new Date().getFullYear() - patient.userInfo.birthYear;
    }
    return null;
  };

  const patients = (data as any)?.data ?? []
  const pagination = (data as any)?.pagination


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
      setActiveDialogTab('basic') // Reset to basic tab when opening
      setIsHistoryOpen(true)
    } catch (error) {
      console.error('Failed to load latest patient detail:', error)
      // fallback to existing data
      setHistoryPatient(p)
      setActiveDialogTab('basic')
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
      const updatedHistory = await patientApi.updatePatientHistory(historyPatient.id, {
        conditions: mergedConditions,
        allergies: mergedAllergies,
        surgeries: mergedSurgeries,
        familyHistory: historyForm.familyHistory,
        lifestyle: historyForm.lifestyle,
        currentMedications: (historyForm.currentMedications || []).map(s => s.trim()).filter(Boolean),
        notes: historyForm.notes,
        extras
      })
      
      // Update the current patient data with new medical history
      if (historyPatient && updatedHistory) {
        const updatedPatient = {
          ...historyPatient,
          medicalHistory: updatedHistory
        };
        setHistoryPatient(updatedPatient);
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      await queryClient.invalidateQueries({ queryKey: ["doctor-patients", historyPatient.id] });
      
      toast.success('Lưu tiền sử bệnh án thành công')
      setIsHistoryOpen(false)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {patients.map((p: any) => (
                <div key={p.id} className="group relative">
                  <div className="bg-gradient-to-br from-background via-background to-background/90 border border-border/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-border/50 hover:-translate-y-0.5 h-full flex flex-col">
                    {/* Header with avatar and status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-base shadow-md">
                          {p.fullName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-base truncate">{p.fullName}</h3>
                          <p className="text-sm text-muted-foreground truncate">{p.phoneNumber}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                        p.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                          : 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
                      }`}>
                        {p.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      </div>
                    </div>

                    {/* Patient info - Fixed height section - Updated */}
                    <div className="space-y-2.5 mb-5 flex-1">
                      {/* Gender and Age - Always show */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        <span>
                          {p.profile?.gender === 'MALE' ? 'Nam' : 
                           p.profile?.gender === 'FEMALE' ? 'Nữ' : 
                           p.userInfo?.gender === 'MALE' ? 'Nam' : 
                           p.userInfo?.gender === 'FEMALE' ? 'Nữ' : 'Chưa cập nhật'}
                        </span>
                        <span className="text-muted-foreground/60">•</span>
                        <span>{calculateAge(p) ? `${calculateAge(p)} tuổi` : 'Chưa cập nhật'}</span>
                      </div>
                      
                      {/* Address - Fixed height with ellipsis */}
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                        <span className="line-clamp-2 leading-relaxed h-8 flex items-center">
                          {p.profile?.address || p.userInfo?.address || 'Chưa cập nhật địa chỉ'}
                        </span>
                      </div>

                      {/* Medical History - Always show */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                        <span>{p.medicalHistory ? 'Có tiền sử bệnh án' : 'Chưa có tiền sử bệnh án'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/15">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openHistory(p)}
                        className="flex-1 h-8 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200/60 text-blue-600 hover:text-blue-700 dark:from-blue-900/10 dark:to-indigo-900/10 dark:border-blue-700/40 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-150 text-xs font-medium"
                      >
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Chi tiết
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setDeletePatient(p)}
                        className="h-8 px-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm hover:shadow transition-all duration-150"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
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


      {deletePatient && (
        <ConfirmDeletePatientDialog
          isOpen={!!deletePatient}
          onClose={() => setDeletePatient(null)}
          onDeleteSuccess={() => refetch()}
          action='delete'
          patient={{ id: deletePatient.id, fullName: deletePatient.fullName } as any}
        />
      )}

      {/* Patient Management Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[1100px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Quản lý bệnh nhân</DialogTitle>
            <DialogDescription>Quản lý thông tin và tiền sử bệnh án của bệnh nhân</DialogDescription>
          </DialogHeader>
          
          {/* Patient Info Summary */}
          {historyPatient && (
            <div className="rounded-lg border border-border/20 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm">
              <div className="text-xs text-muted-foreground mb-3">Thông tin bệnh nhân</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium text-foreground">{historyPatient.fullName}</div>
                  <div className="text-xs text-muted-foreground">{historyPatient.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Giới tính</div>
                  <div className="text-sm text-foreground">
                    {historyPatient.profile?.gender === 'MALE' ? 'Nam' : 
                     historyPatient.profile?.gender === 'FEMALE' ? 'Nữ' : 
                     historyPatient.userInfo?.gender === 'MALE' ? 'Nam' : 
                     historyPatient.userInfo?.gender === 'FEMALE' ? 'Nữ' : 'Chưa cập nhật'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Tuổi</div>
                  <div className="text-sm text-foreground">{calculateAge(historyPatient) ? `${calculateAge(historyPatient)} tuổi` : 'Chưa cập nhật'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Trạng thái</div>
                  <div className="text-sm text-foreground">{historyPatient.status || 'ACTIVE'}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Địa chỉ</div>
                  <div className="text-sm text-foreground">
                    {historyPatient.profile?.address || historyPatient.userInfo?.address || 'Chưa cập nhật'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Người tạo</div>
                  <div className="text-sm text-foreground flex items-center gap-2">
                    {historyPatient.createdByUser ? (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        {historyPatient.createdByUser.fullName}
                        <span className="text-xs text-muted-foreground">
                          ({historyPatient.createdByUser.role === 'ADMIN' ? 'Quản trị viên' : 
                            historyPatient.createdByUser.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'})
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Tự đăng ký</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tabs */}
          <div className="border-b border-border/20">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveDialogTab('basic')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeDialogTab === 'basic'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Thông tin cơ bản
              </button>
              <button
                onClick={() => setActiveDialogTab('prescriptions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeDialogTab === 'prescriptions'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Đơn thuốc
              </button>
              <button
                onClick={() => setActiveDialogTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeDialogTab === 'history'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Tiền sử bệnh án
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          {activeDialogTab === 'basic' && (
            <div className='space-y-6'>
              {historyPatient && (
                <form id="basic-info-form" onSubmit={basicInfoForm.handleSubmit(onSubmitBasicInfo)} className='space-y-6'>
                  <div className='rounded-xl border border-border/20 bg-gradient-to-br from-background to-background/50 p-6 shadow-sm'>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <h3 className="text-lg font-semibold text-foreground">Thông tin cơ bản</h3>
                    </div>
                    
                    {/* Root level error message */}
                    {basicInfoForm.formState.errors.root && (
                      <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
                        {basicInfoForm.formState.errors.root.message}
                      </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className='text-xs font-medium text-muted-foreground mb-2 block'>Họ và tên</label>
                        <Input 
                          placeholder="Nhập họ và tên" 
                          {...basicInfoForm.register('fullName')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        />
                        {basicInfoForm.formState.errors.fullName && (
                          <p className="text-xs text-red-500 mt-1">{basicInfoForm.formState.errors.fullName.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className='text-xs font-medium text-muted-foreground mb-2 block'>Số điện thoại</label>
                        <Input 
                          type="tel" 
                          placeholder="Nhập số điện thoại" 
                          {...basicInfoForm.register('phoneNumber')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        />
                        {basicInfoForm.formState.errors.phoneNumber && (
                          <p className="text-xs text-red-500 mt-1">{basicInfoForm.formState.errors.phoneNumber.message}</p>
                        )}
                      </div>

                      <div>
                        <label className='text-xs font-medium text-muted-foreground mb-2 block'>Giới tính</label>
                        <Select 
                          value={basicInfoForm.watch('gender')} 
                          onValueChange={(value) => basicInfoForm.setValue('gender', value)}
                        >
                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Nam</SelectItem>
                            <SelectItem value="FEMALE">Nữ</SelectItem>
                            <SelectItem value="OTHER">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        {basicInfoForm.formState.errors.gender && (
                          <p className="text-xs text-red-500 mt-1">{basicInfoForm.formState.errors.gender.message}</p>
                        )}
                      </div>

                      <div>
                        <label className='text-xs font-medium text-muted-foreground mb-2 block'>Năm sinh</label>
                        <Input 
                          type="number" 
                          placeholder="Nhập năm sinh" 
                          {...basicInfoForm.register('birthYear')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        />
                        {basicInfoForm.formState.errors.birthYear && (
                          <p className="text-xs text-red-500 mt-1">{basicInfoForm.formState.errors.birthYear.message}</p>
                        )}
                      </div>

                      <div>
                        <label className='text-xs font-medium text-muted-foreground mb-2 block'>Trạng thái</label>
                        <Select 
                          value={basicInfoForm.watch('status')} 
                          onValueChange={(value) => basicInfoForm.setValue('status', value)}
                        >
                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                            <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                          </SelectContent>
                        </Select>
                        {basicInfoForm.formState.errors.status && (
                          <p className="text-xs text-red-500 mt-1">{basicInfoForm.formState.errors.status.message}</p>
                        )}
                      </div>


                      <div>
                        <label className='text-xs font-medium text-muted-foreground mb-2 block'>Địa chỉ</label>
                        <Input 
                          placeholder="Nhập địa chỉ" 
                          {...basicInfoForm.register('address')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        />
                        {basicInfoForm.formState.errors.address && (
                          <p className="text-xs text-red-500 mt-1">{basicInfoForm.formState.errors.address.message}</p>
                        )}
                      </div>

                      <div>
                        <label className='text-xs font-medium text-muted-foreground mb-2 block'>Mật khẩu</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu mới"
                            className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                            {...basicInfoForm.register('password')}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                        {basicInfoForm.formState.errors.password && (
                          <p className="text-xs text-red-500 mt-1">{basicInfoForm.formState.errors.password.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {activeDialogTab === 'prescriptions' && (
            <div className="space-y-6">
              {/* Button to show/hide create form */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Đơn thuốc của bệnh nhân
                </h3>
                <Button
                  type="button"
                  onClick={() => setShowCreatePrescriptionForm(!showCreatePrescriptionForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {showCreatePrescriptionForm ? 'Ẩn form tạo mới' : 'Tạo đơn thuốc mới'}
                </Button>
              </div>

              {/* Create Prescription Form */}
              {showCreatePrescriptionForm && (
                <Card className="border-border/20 bg-gradient-to-br from-background to-background/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Pill className="h-5 w-5 text-primary" />
                      Tạo đơn thuốc mới
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {medicationsError && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.reload()}
                          className="text-xs"
                        >
                          🔄 Tải lại
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {loadingMedications ? "Đang tải..." : 
                         medicationsError ? "Lỗi" : 
                         medications?.items?.length || 0} thuốc
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prescription Items */}
                  {prescriptionItems.map((item, index) => (
                    <div key={index} className="p-4 border border-border/20 rounded-lg bg-gradient-to-br from-muted/20 to-muted/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-sm text-foreground">Thuốc {index + 1}</h4>
                        {prescriptionItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrescriptionItem(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Medication Selection */}
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Tên thuốc *
                          </label>
                          <Select
                            value={item.medicationId}
                            onValueChange={(value) => updatePrescriptionItem(index, 'medicationId', value)}
                            disabled={loadingMedications}
                          >
                            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder={
                                loadingMedications 
                                  ? "Đang tải danh sách thuốc..." 
                                  : medicationsError 
                                    ? "Lỗi tải danh sách thuốc"
                                    : "Chọn thuốc"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingMedications ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    Đang tải...
                                  </div>
                                </SelectItem>
                              ) : medicationsError ? (
                                <SelectItem value="error" disabled>
                                  <span className="text-red-500">Lỗi tải danh sách thuốc</span>
                                </SelectItem>
                              ) : medications?.items?.length > 0 ? (
                                medications.items.map((med: any) => (
                                  <SelectItem key={med.id} value={med.id}>
                                    {med.name} - {med.strength} {med.unit}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="empty" disabled>
                                  <span className="text-muted-foreground">Chưa có thuốc nào</span>
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {medicationsError && (
                            <p className="text-xs text-red-500 mt-1">
                              Không thể tải danh sách thuốc. Vui lòng thử lại sau.
                            </p>
                          )}
                          {!loadingMedications && !medicationsError && medications?.items?.length === 0 && (
                            <p className="text-xs text-yellow-600 mt-1">
                              ⚠️ Chưa có thuốc nào trong hệ thống. Admin cần thêm thuốc trước.
                            </p>
                          )}
                        </div>

                        {/* Dosage */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Liều lượng *
                          </label>
                          <Input
                            placeholder="Ví dụ: 500mg"
                            value={item.dosage}
                            onChange={(e) => updatePrescriptionItem(index, 'dosage', e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        {/* Frequency */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Tần suất/ngày *
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={item.frequencyPerDay}
                            onChange={(e) => updatePrescriptionItem(index, 'frequencyPerDay', parseInt(e.target.value) || 1)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Thời gian điều trị (ngày) *
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={item.durationDays}
                            onChange={(e) => updatePrescriptionItem(index, 'durationDays', parseInt(e.target.value) || 7)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        {/* Route */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Đường dùng
                          </label>
                          <Select
                            value={item.route}
                            onValueChange={(value) => updatePrescriptionItem(index, 'route', value)}
                          >
                            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder="Chọn đường dùng" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ORAL">Uống</SelectItem>
                              <SelectItem value="INJECTION">Tiêm</SelectItem>
                              <SelectItem value="TOPICAL">Bôi ngoài</SelectItem>
                              <SelectItem value="INHALATION">Hít</SelectItem>
                              <SelectItem value="OTHER">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Times of Day */}
                      <div className="mt-4">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Thời điểm uống thuốc *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Sáng', 'Trưa', 'Chiều', 'Tối'].map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={item.timesOfDay.includes(time) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleTimeOfDay(index, time)}
                              className="transition-all duration-200"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="mt-4">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Hướng dẫn sử dụng
                        </label>
                        <textarea
                          placeholder="Ví dụ: Uống sau khi ăn, không uống với sữa..."
                          value={item.instructions}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updatePrescriptionItem(index, 'instructions', e.target.value)}
                          className="w-full min-h-[60px] px-3 py-2 text-sm border border-border rounded-md bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add Medication Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPrescriptionItem}
                    className="w-full border-dashed border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm thuốc khác
                  </Button>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Ghi chú đơn thuốc
                    </label>
                    <textarea
                      placeholder="Ghi chú chung cho đơn thuốc..."
                      value={prescriptionNotes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrescriptionNotes(e.target.value)}
                      className="w-full min-h-[80px] px-3 py-2 text-sm border border-border rounded-md bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleCreatePrescription}
                    disabled={createPrescriptionMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                  >
                    {createPrescriptionMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang tạo đơn thuốc...
                      </>
                    ) : (
                      <>
                        <Pill className="h-4 w-4 mr-2" />
                        Tạo đơn thuốc
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              )}

              {/* Patient Prescriptions List */}
              <Card className="border-border/20 bg-gradient-to-br from-background to-background/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Danh sách đơn thuốc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    console.log('Rendering prescriptions:', patientPrescriptions);
                    console.log('Loading prescriptions:', loadingPrescriptions);
                    console.log('Prescriptions error:', prescriptionsError);
                    return null;
                  })()}
                  {loadingPrescriptions ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm">Đang tải đơn thuốc...</p>
                    </div>
                  ) : prescriptionsError ? (
                    <div className="text-center py-8 text-red-500">
                      <p className="text-sm">Lỗi tải đơn thuốc: {prescriptionsError.message}</p>
                    </div>
                  ) : (() => {
                    console.log('=== UI RENDER DEBUG ===');
                    console.log('patientPrescriptions:', patientPrescriptions);
                    console.log('patientPrescriptions type:', typeof patientPrescriptions);
                    console.log('patientPrescriptions isArray:', Array.isArray(patientPrescriptions));
                    console.log('patientPrescriptions length:', patientPrescriptions?.length);
                    console.log('Condition check:', patientPrescriptions && patientPrescriptions.length > 0);
                    return patientPrescriptions && patientPrescriptions.length > 0;
                  })() ? (
                    <div className="space-y-4">
                      {patientPrescriptions.map((prescription: any) => (
                        <div 
                          key={prescription.id} 
                          className="p-4 border border-border/20 rounded-lg bg-gradient-to-br from-muted/10 to-muted/5 cursor-pointer hover:shadow-md transition-all duration-200"
                          onClick={() => {
                            setSelectedPrescriptionId(prescription.id);
                            setIsPrescriptionDetailOpen(true);
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {prescription.id}
                              </Badge>
                              <Badge 
                                variant={prescription.status === 'ACTIVE' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {prescription.status === 'ACTIVE' ? 'Đang điều trị' : prescription.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {prescription.startDate ? 
                                (() => {
                                  const date = new Date(prescription.startDate);
                                  return isNaN(date.getTime()) ? 'N/A' : 
                                    `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}`;
                                })() 
                                : 'N/A'
                              }
                            </span>
                          </div>
                          
                          {prescription.notes && (
                            <p className="text-sm text-muted-foreground mb-3">
                              <strong>Ghi chú:</strong> {prescription.notes}
                            </p>
                          )}

                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-foreground">Danh sách thuốc:</h5>
                            {prescription.items?.map((item: any, idx: number) => (
                              <div key={idx} className="text-sm text-muted-foreground bg-muted/20 p-2 rounded">
                                <strong>{item.medication?.name}</strong> - {item.dosage} - 
                                {item.frequencyPerDay} lần/ngày - {item.durationDays} ngày
                                {item.instructions && (
                                  <div className="text-xs mt-1 text-muted-foreground/80">
                                    <strong>HD:</strong> {item.instructions}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Chưa có đơn thuốc nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeDialogTab === 'history' && (
            <div className='grid grid-cols-3 gap-6'>
              {/* Column 1: Tình trạng sức khỏe */}
              <div className='col-span-1'>
                <div className='rounded-xl border border-border/20 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm h-full'>
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
              </div>

              {/* Column 2: Thông tin bổ sung */}
              <div className='col-span-1'>
                <div className='rounded-xl border border-border/20 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm h-full'>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-sm font-semibold text-foreground">Thông tin bổ sung</h3>
                  </div>
                  <div className='grid gap-3'>
                    <div>
                      <label className='text-xs font-medium text-muted-foreground mb-2 block'>Tiền sử gia đình</label>
                      <Input 
                        placeholder='Ví dụ: Tiểu đường, tim mạch...' 
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        value={historyForm.familyHistory || ''} 
                        onChange={(e) => setHistoryForm((p) => ({ ...p, familyHistory: e.target.value }))} 
                      />
                    </div>
                    <div>
                      <label className='text-xs font-medium text-muted-foreground mb-2 block'>Lối sống</label>
                      <Input 
                        placeholder='Ví dụ: Hút thuốc, rượu bia, ít vận động...' 
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        value={historyForm.lifestyle || ''} 
                        onChange={(e) => setHistoryForm((p) => ({ ...p, lifestyle: e.target.value }))} 
                      />
                    </div>
                    <div>
                      <label className='text-xs font-medium text-muted-foreground mb-2 block'>Thuốc đang dùng</label>
                      <Input 
                        placeholder='Ví dụ: Aspirin, Metformin...' 
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        value={historyForm.currentMedications.join(', ')} 
                        onChange={(e) => setHistoryForm((p) => ({ ...p, currentMedications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} 
                      />
                    </div>
                    <div>
                      <label className='text-xs font-medium text-muted-foreground mb-2 block'>Ghi chú</label>
                      <Input 
                        placeholder='Ghi chú khác' 
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        value={historyForm.notes || ''} 
                        onChange={(e) => setHistoryForm((p) => ({ ...p, notes: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Thông tin tùy chỉnh */}
              <div className='col-span-1'>
                <div className='rounded-xl border border-border/20 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm h-full'>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <h3 className="text-sm font-semibold text-foreground">Thông tin tùy chỉnh</h3>
                  </div>
                  <div className="h-60 w-full overflow-y-auto rounded-md border border-border/20 bg-background/50 p-2">
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
            </div>
          )}
          
          <DialogFooter className="gap-3">
            <Button 
              variant='outline' 
              className="transition-all duration-200 hover:bg-accent/50"
              onClick={() => setIsHistoryOpen(false)}
            >
              Đóng
            </Button>
            {activeDialogTab === 'basic' && (
              <Button 
                type="submit"
                form="basic-info-form"
                disabled={updateBasicInfoMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm transition-all duration-200 hover:shadow-md hover:from-blue-600 hover:to-indigo-600"
              >
                {updateBasicInfoMutation.isPending ? "Đang cập nhật..." : "Cập nhật thông tin"}
              </Button>
            )}
            {activeDialogTab === 'history' && (
              <Button 
                onClick={saveHistory} 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm transition-all duration-200 hover:shadow-md hover:from-emerald-600 hover:to-teal-600"
              >
                Lưu tiền sử
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Detail Dialog */}
      <Dialog open={isPrescriptionDetailOpen} onOpenChange={setIsPrescriptionDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Chi tiết đơn thuốc
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đơn thuốc và lịch sử uống thuốc
            </DialogDescription>
          </DialogHeader>

          {loadingPrescriptionDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Đang tải chi tiết đơn thuốc...</span>
            </div>
          ) : prescriptionDetail ? (
            <div className="space-y-6">
              {/* Prescription Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin đơn thuốc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mã đơn thuốc</label>
                      <p className="text-sm font-mono bg-muted/20 p-2 rounded">{prescriptionDetail.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                      <div className="mt-1">
                        <Badge variant={prescriptionDetail.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {prescriptionDetail.status === 'ACTIVE' ? 'Đang điều trị' : prescriptionDetail.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</label>
                      <p className="text-sm">
                        {prescriptionDetail.startDate ? 
                          new Date(prescriptionDetail.startDate).toLocaleDateString('vi-VN') : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ngày kết thúc</label>
                      <p className="text-sm">
                        {prescriptionDetail.endDate ? 
                          new Date(prescriptionDetail.endDate).toLocaleDateString('vi-VN') : 'Đang điều trị'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {prescriptionDetail.notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ghi chú</label>
                      <p className="text-sm bg-muted/20 p-3 rounded mt-1">{prescriptionDetail.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin bệnh nhân</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                      <p className="text-sm font-medium">{prescriptionDetail.patient?.fullName || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                      <p className="text-sm">{prescriptionDetail.patient?.phoneNumber || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin bác sĩ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                      <p className="text-sm font-medium">{prescriptionDetail.doctor?.fullName || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Chuyên khoa</label>
                      <p className="text-sm">{prescriptionDetail.doctor?.majorDoctor || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Danh sách thuốc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptionDetail.items?.map((item: any, idx: number) => (
                      <div key={idx} className="border border-border/20 rounded-lg p-4 bg-muted/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Tên thuốc</label>
                            <p className="text-sm font-medium">{item.medication?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Liều lượng</label>
                            <p className="text-sm">{item.dosage || 'Chưa xác định'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Tần suất</label>
                            <p className="text-sm">{item.frequencyPerDay} lần/ngày</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Thời gian uống</label>
                            <p className="text-sm">{item.timesOfDay?.join(', ') || 'Chưa xác định'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Số ngày</label>
                            <p className="text-sm">{item.durationDays} ngày</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Đường dùng</label>
                            <p className="text-sm">{item.route || 'Chưa xác định'}</p>
                          </div>
                        </div>
                        {item.instructions && (
                          <div className="mt-3">
                            <label className="text-sm font-medium text-muted-foreground">Hướng dẫn sử dụng</label>
                            <p className="text-sm bg-muted/20 p-2 rounded mt-1">{item.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Adherence Logs */}
              {prescriptionDetail.logs && prescriptionDetail.logs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lịch sử uống thuốc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prescriptionDetail.logs.map((log: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 border border-border/20 rounded-lg bg-muted/10">
                          <div className="flex items-center gap-3">
                            <Badge variant={log.status === 'TAKEN' ? 'default' : 'destructive'}>
                              {log.status === 'TAKEN' ? 'Đã uống' : 'Bỏ lỡ'}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(log.takenAt).toLocaleDateString('vi-VN')} {new Date(log.takenAt).toLocaleTimeString('vi-VN')}
                              </p>
                              {log.amount && (
                                <p className="text-xs text-muted-foreground">Liều lượng: {log.amount}</p>
                              )}
                            </div>
                          </div>
                          {log.notes && (
                            <p className="text-xs text-muted-foreground max-w-xs truncate">{log.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Không tìm thấy đơn thuốc</h3>
              <p className="text-muted-foreground">Đơn thuốc này có thể đã bị xóa hoặc không tồn tại</p>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPrescriptionDetailOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
