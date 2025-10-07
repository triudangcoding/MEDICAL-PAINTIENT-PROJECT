import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DoctorApi,
  PatientCreateDto,
  PatientHistoryDto,
  PatientProfileDto,
} from "@/api/doctor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { MedicationsApi, MedicationDto } from "@/api/medications";
import { UsersApi } from "@/api/user";
import { patientApi } from "@/api/patient/patient.api";
import { doctorApi } from "@/api/doctor/doctor.api";
import {
  MajorDoctor,
  User as DoctorUser,
  CreateDoctorData,
  UpdateDoctorData,
  getMajorDoctorName,
} from "@/api/doctor/types";
import {
  Pencil,
  Trash2,
  Users,
  FileText,
  Search,
  Plus,
  Calendar,
  MapPin,
  Phone,
  User,
  Pill,
  Stethoscope,
} from "lucide-react";

const toArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
};

const DoctorManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const formatDateOnly = (value?: string) => {
    if (!value) return "-";
    const s = String(value);
    return s.length >= 10 ? s.slice(0, 10) : s;
  };
  const [activeTab, setActiveTab] = useState<
    "patients" | "prescriptions" | "alerts" | "doctors"
  >("patients");
  const role = useMemo(() => {
    try {
      const raw = localStorage.getItem("roles");
      const r = raw ? (JSON.parse(raw) as string[])[0] : undefined;
      return r || "DOCTOR";
    } catch {
      return "DOCTOR";
    }
  }, []);

  // If role is PATIENT, load own profile to populate table with single row
  const currentUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: UsersApi.getMe,
    enabled: role === "PATIENT",
  });

  // Search & pagination
  const [patientSearch, setPatientSearch] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [patientLimit] = useState(10);

  // Doctor search & pagination
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorPage, setDoctorPage] = useState(1);
  const [doctorLimit] = useState(10);

  // Medication pagination
  const [medPage, setMedPage] = useState(1);
  const [medLimit] = useState(10);

  // Dialog state
  const [openCreatePatient, setOpenCreatePatient] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });
  const [openEditHistory, setOpenEditHistory] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });
  const [selectedPatientId, setSelectedPatientId] = useState<
    string | undefined
  >(undefined);

  // Doctor dialog state
  const [openCreateDoctor, setOpenCreateDoctor] = useState(false);
  const [openEditDoctor, setOpenEditDoctor] = useState<{
    open: boolean;
    doctor?: DoctorUser;
  }>({ open: false });
  const [openDeleteDoctor, setOpenDeleteDoctor] = useState<{
    open: boolean;
    doctor?: DoctorUser;
  }>({ open: false });
  const [openDeletePatient, setOpenDeletePatient] = useState<{
    open: boolean;
    patient?: any;
  }>({ open: false });

  // Form state
  const [createForm, setCreateForm] = useState<PatientCreateDto>({
    fullName: "",
    phoneNumber: "",
    password: "",
    profile: {},
  });
  const [createErrors, setCreateErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    password?: string;
    gender?: string;
    birthDate?: string;
    address?: string;
  }>({});
  const [profileForm, setProfileForm] = useState<PatientProfileDto>({
    gender: "",
    birthDate: "",
    address: "",
  });
  const [historyForm, setHistoryForm] = useState<PatientHistoryDto>({
    conditions: [],
    allergies: [],
    surgeries: [],
    familyHistory: "",
    lifestyle: "",
    currentMedications: [],
    notes: "",
  });

  // Doctor form state
  const [createDoctorForm, setCreateDoctorForm] = useState<CreateDoctorData>({
    fullName: "",
    phoneNumber: "",
    password: "",
    majorDoctor: "TAM_THAN",
  });
  const [createDoctorErrors, setCreateDoctorErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    password?: string;
  }>({
    fullName: "",
    phoneNumber: "",
    password: "",
  });
  const [updateDoctorForm, setUpdateDoctorForm] = useState<UpdateDoctorData>({
    fullName: "",
    phoneNumber: "",
    majorDoctor: "TAM_THAN",
    status: "ACTIVE",
  });

  // Validators
  const isValidPhone = (phone: string) => /^0[0-9]{9}$/.test(phone.trim());
  // derive validity when needed via validateCreateForm; no separate memo flag required

  const validateCreateForm = (): boolean => {
    const errs: typeof createErrors = {};
    if (!createForm.fullName?.trim())
      errs.fullName = "Không thể bỏ trống họ tên";
    if (!(createForm.phoneNumber || "").trim())
      errs.phoneNumber = "Không thể bỏ trống số điện thoại";
    else if (!isValidPhone(createForm.phoneNumber!))
      errs.phoneNumber = "Số điện thoại không hợp lệ";
    if (!(createForm.password || "").trim())
      errs.password = "Không thể bỏ trống mật khẩu";
    else if ((createForm.password || "").length < 6)
      errs.password = "Mật khẩu tối thiểu 6 ký tự";
    if (!(createForm.profile?.gender || "").trim())
      errs.gender = "Không thể bỏ trống giới tính";
    if (!(createForm.profile?.birthDate || "").trim())
      errs.birthDate = "Không thể bỏ trống ngày sinh";
    if (!(createForm.profile?.address || "").trim())
      errs.address = "Không thể bỏ trống địa chỉ";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Queries
  const patientsQueryKey = useMemo(
    () => [
      "patient-search",
      { q: patientSearch, page: patientPage, limit: patientLimit },
    ],
    [patientSearch, patientPage, patientLimit]
  );
  const { data: patientsData, isLoading: loadingPatients } = useQuery<any>({
    queryKey: patientsQueryKey,
    queryFn: () =>
      patientSearch?.trim()
        ? patientApi.searchPatients(patientSearch, patientPage, patientLimit)
        : patientApi.getPatients({
            page: patientPage,
            limit: patientLimit,
            search: undefined,
            sortBy: "createdAt",
            sortOrder: "desc"
          }),
  });

  // Doctor queries
  const doctorsQueryKey = useMemo(
    () => [
      "doctor-list",
      {
        q: doctorSearch,
        page: doctorPage,
        limit: doctorLimit,
      },
    ],
    [doctorSearch, doctorPage, doctorLimit]
  );
  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: doctorsQueryKey,
    queryFn: () =>
      doctorApi.getDoctorList({
        q: doctorSearch || undefined,
        page: doctorPage,
        limit: doctorLimit,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  // Mutations
  const createPatientMutation = useMutation({
    mutationFn: (dto: PatientCreateDto) => DoctorApi.createPatient(dto),
    onSuccess: () => {
      // Refresh patient table
      queryClient.invalidateQueries({ queryKey: ["patient-search"] });
      queryClient.invalidateQueries({ queryKey: ["patient-get-all"] });

      setOpenCreatePatient(false);
      setCreateForm({
        fullName: "",
        phoneNumber: "",
        password: "",
        profile: {},
      });
      toast.success("Tạo bệnh nhân thành công", { position: "top-center" });
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.response?.data?.message || "Tạo bệnh nhân thất bại";
      toast.error(String(message), { position: "top-center" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PatientProfileDto }) =>
      patientApi.updatePatient(id, {
        fullName: createForm.fullName,
        phoneNumber: createForm.phoneNumber,
        profile: dto,
      } as any),
    onSuccess: () => {
      // Refresh patient table
      queryClient.invalidateQueries({ queryKey: ["patient-search"] });
      queryClient.invalidateQueries({ queryKey: ["patient-get-all"] });
      setOpenEditProfile({ open: false, id: undefined });
      toast.success("Cập nhật hồ sơ thành công", { position: "top-center" });
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.response?.data?.message || "Cập nhật hồ sơ thất bại";
      toast.error(String(message), { position: "top-center" });
    },
  });

  const updateHistoryMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PatientHistoryDto }) =>
      DoctorApi.updatePatientHistory(id, dto),
    onSuccess: () => {
      // Refresh patient table
      queryClient.invalidateQueries({ queryKey: ["patient-search"] });
      queryClient.invalidateQueries({ queryKey: ["patient-get-all"] });
      setOpenEditHistory({ open: false, id: undefined });
      toast.success("Cập nhật tiền sử thành công", { position: "top-center" });
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.response?.data?.message || "Cập nhật tiền sử thất bại";
      toast.error(String(message), { position: "top-center" });
    },
  });

  // Doctor mutations
  const createDoctorMutation = useMutation({
    mutationFn: (data: CreateDoctorData) => doctorApi.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-list"] });
      setOpenCreateDoctor(false);
      setCreateDoctorForm({
        fullName: "",
        phoneNumber: "",
        password: "",
        majorDoctor: "TAM_THAN",
      });
      setCreateDoctorErrors({
        fullName: "",
        phoneNumber: "",
        password: "",
      });
      toast.success("Tạo bác sĩ thành công", { position: "top-center" });
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.response?.data?.message || "Tạo bác sĩ thất bại";
      toast.error(String(message), { position: "top-center" });
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorData }) =>
      doctorApi.updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-list"] });
      setOpenEditDoctor({ open: false });
      toast.success("Cập nhật bác sĩ thành công", { position: "top-center" });
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.response?.data?.message || "Cập nhật bác sĩ thất bại";
      toast.error(String(message), { position: "top-center" });
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: (id: string) => doctorApi.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-list"] });
      setOpenDeleteDoctor({ open: false });
      toast.success("Xóa bác sĩ thành công", { position: "top-center" });
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.response?.data?.message || "Xóa bác sĩ thất bại";
      toast.error(String(message), { position: "top-center" });
    },
  });

  const prescriptionsQuery = useQuery({
    queryKey: ["doctor-prescriptions", { page: 1, limit: 10 }],
    queryFn: () =>
      DoctorApi.listPrescriptions({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  // ADMIN: medications in prescriptions tab
  const medsQuery = useQuery({
    queryKey: ["admin-medications", { page: medPage, limit: medLimit }],
    queryFn: () =>
      MedicationsApi.list({
        page: medPage,
        limit: medLimit,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: role === "ADMIN",
  });
  const [openMedDialog, setOpenMedDialog] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | undefined>(
    undefined
  );
  const [medForm, setMedForm] = useState<MedicationDto>({
    name: "",
    strength: "",
    form: "",
    unit: "",
    description: "",
  });
  const [medFormErrors, setMedFormErrors] = useState<{
    name?: string;
    strength?: string;
    form?: string;
    unit?: string;
  }>({
    name: "",
    strength: "",
    form: "",
    unit: "",
  });
  const createMed = useMutation({
    mutationFn: (dto: MedicationDto) => MedicationsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-medications", { page: medPage, limit: medLimit }],
      });
      // Refresh prescriptions table since medications are used in prescriptions
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      toast.success("Tạo thuốc thành công");
      setOpenMedDialog(false);
      setMedForm({
        name: "",
        strength: "",
        form: "",
        unit: "",
        description: "",
        isActive: true,
      });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Tạo thuốc thất bại"),
  });
  const updateMed = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MedicationDto }) =>
      MedicationsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-medications", { page: medPage, limit: medLimit }],
      });
      // Refresh prescriptions table since medications are used in prescriptions
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      toast.success("Cập nhật thuốc thành công");
      setOpenMedDialog(false);
      setEditingMedId(undefined);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Cập nhật thuốc thất bại"),
  });
  const deactivateMed = useMutation({
    mutationFn: (id: string) => MedicationsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-medications", { page: medPage, limit: medLimit }],
      });
      // Refresh prescriptions table since medications are used in prescriptions
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      toast.success("Đã vô hiệu hóa thuốc");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Thao tác thất bại"),
  });

  // Handlers
  const handleOpenEditProfile = (id: string) => {
    setSelectedPatientId(id);
    // Prefill từ danh sách hiện có nếu tìm thấy
    const current = toArray(patientsData).find((x: any) => x.id === id);
    setCreateForm((s) => ({
      ...s,
      fullName: current?.fullName || "",
      phoneNumber: current?.phoneNumber || "",
    }));
    setProfileForm({
      gender: current?.profile?.gender || "",
      birthDate: current?.profile?.birthDate?.slice(0, 10) || "",
      address: current?.profile?.address || "",
    });
    setOpenEditProfile({ open: true, id });
  };

  // const handleOpenEditHistory = (id: string) => {
  //   setSelectedPatientId(id);
  //   setHistoryForm({
  //     conditions: [],
  //     allergies: [],
  //     surgeries: [],
  //     familyHistory: "",
  //     lifestyle: "",
  //     currentMedications: [],
  //     notes: "",
  //   });
  //   setOpenEditHistory({ open: true, id });
  // };

  const handleOpenDelete = (p: any) => {
    setOpenDeletePatient({ open: true, patient: p });
  };

  const handleDeletePatient = () => {
    const id = openDeletePatient.patient?.id;
    if (!id) return;
    patientApi
      .deletePatient(id)
      .then(() => {
        // Refresh patient table
        queryClient.invalidateQueries({ queryKey: ["patient-search"] });
        queryClient.invalidateQueries({ queryKey: ["patient-get-all"] });

        toast.success("Đã xóa bệnh nhân");
        setOpenDeletePatient({ open: false });
      })
      .catch((e) =>
        toast.error(e?.response?.data?.message || "Xóa bệnh nhân thất bại")
      );
  };

  // Doctor handlers
  const handleCreateDoctor = () => {
    // Reset errors
    setCreateDoctorErrors({
      fullName: "",
      phoneNumber: "",
      password: "",
    });

    let hasError = false;
    const newErrors: typeof createDoctorErrors = {};

    // Validation tất cả các trường bắt buộc
    if (!createDoctorForm.fullName?.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
      hasError = true;
    }
    if (!createDoctorForm.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
      hasError = true;
    } else if (
      !/^[0-9]{10,11}$/.test(createDoctorForm.phoneNumber.replace(/\D/g, ""))
    ) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (10-11 số)";
      hasError = true;
    }
    if (!createDoctorForm.password?.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      hasError = true;
    } else if (createDoctorForm.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      hasError = true;
    }

    // Set errors nếu có
    if (hasError) {
      setCreateDoctorErrors(newErrors);
      return;
    }

    createDoctorMutation.mutate(createDoctorForm);
  };

  const handleOpenEditDoctor = (doctor: DoctorUser) => {
    setUpdateDoctorForm({
      fullName: doctor.fullName,
      phoneNumber: doctor.phoneNumber,
      majorDoctor: doctor.majorDoctor || "TAM_THAN",
      status: doctor.status,
    });
    setOpenEditDoctor({ open: true, doctor });
  };

  const handleUpdateDoctor = () => {
    if (!openEditDoctor.doctor?.id) return;
    updateDoctorMutation.mutate({
      id: openEditDoctor.doctor.id,
      data: updateDoctorForm,
    });
  };

  const handleOpenDeleteDoctor = (doctor: DoctorUser) => {
    setOpenDeleteDoctor({ open: true, doctor });
  };

  const handleDeleteDoctor = () => {
    if (!openDeleteDoctor.doctor?.id) return;
    deleteDoctorMutation.mutate(openDeleteDoctor.doctor.id);
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `,
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Bảng điều khiển bác sĩ
            </h1>
            <div className="flex gap-2">
              {activeTab === "patients" &&
                (role === "DOCTOR" || role === "ADMIN") && (
                  <Dialog
                    open={openCreatePatient}
                    onOpenChange={setOpenCreatePatient}
                  >
                    <DialogTrigger asChild>
                      <Button className="relative bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Thêm bệnh nhân
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Thêm bệnh nhân</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                          <Label>Họ tên</Label>
                          <Input
                            value={createForm.fullName}
                            onChange={(e) => {
                              setCreateForm((s) => ({
                                ...s,
                                fullName: e.target.value,
                              }));
                              if (createErrors.fullName)
                                setCreateErrors((er) => ({
                                  ...er,
                                  fullName: undefined,
                                }));
                            }}
                            placeholder="Nguyễn Văn A"
                          />
                          {createErrors.fullName && (
                            <p className="text-red-500 text-sm">
                              {createErrors.fullName}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label>Số điện thoại</Label>
                          <Input
                            value={createForm.phoneNumber}
                            onChange={(e) => {
                              setCreateForm((s) => ({
                                ...s,
                                phoneNumber: e.target.value,
                              }));
                              if (createErrors.phoneNumber)
                                setCreateErrors((er) => ({
                                  ...er,
                                  phoneNumber: undefined,
                                }));
                            }}
                            placeholder="09xxxxxxxx"
                          />
                          {createErrors.phoneNumber && (
                            <p className="text-red-500 text-sm">
                              {createErrors.phoneNumber}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label>Mật khẩu</Label>
                          <Input
                            type="password"
                            value={createForm.password}
                            onChange={(e) => {
                              setCreateForm((s) => ({
                                ...s,
                                password: e.target.value,
                              }));
                              if (createErrors.password)
                                setCreateErrors((er) => ({
                                  ...er,
                                  password: undefined,
                                }));
                            }}
                            placeholder="••••••"
                          />
                          {createErrors.password && (
                            <p className="text-red-500 text-sm">
                              {createErrors.password}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label>Giới tính</Label>
                          <select
                            value={createForm.profile?.gender || ""}
                            onChange={(e) => {
                              setCreateForm((s) => ({
                                ...s,
                                profile: {
                                  ...(s.profile || {}),
                                  gender: e.target.value,
                                },
                              }));
                              if (createErrors.gender)
                                setCreateErrors((er) => ({
                                  ...er,
                                  gender: undefined,
                                }));
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </select>
                          {createErrors.gender && (
                            <p className="text-red-500 text-sm">
                              {createErrors.gender}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label>Ngày sinh</Label>
                          <Input
                            type="date"
                            value={createForm.profile?.birthDate || ""}
                            onChange={(e) => {
                              setCreateForm((s) => ({
                                ...s,
                                profile: {
                                  ...(s.profile || {}),
                                  birthDate: e.target.value,
                                },
                              }));
                              if (createErrors.birthDate)
                                setCreateErrors((er) => ({
                                  ...er,
                                  birthDate: undefined,
                                }));
                            }}
                          />
                          {createErrors.birthDate && (
                            <p className="text-red-500 text-sm">
                              {createErrors.birthDate}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label>Địa chỉ</Label>
                          <Input
                            value={createForm.profile?.address || ""}
                            onChange={(e) => {
                              setCreateForm((s) => ({
                                ...s,
                                profile: {
                                  ...(s.profile || {}),
                                  address: e.target.value,
                                },
                              }));
                              if (createErrors.address)
                                setCreateErrors((er) => ({
                                  ...er,
                                  address: undefined,
                                }));
                            }}
                            placeholder="Địa chỉ"
                          />
                          {createErrors.address && (
                            <p className="text-red-500 text-sm">
                              {createErrors.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            const ok = validateCreateForm();
                            if (!ok) {
                              toast.error(
                                "Vui lòng nhập đầy đủ và hợp lệ tất cả trường",
                                { position: "top-center" }
                              );
                              return;
                            }
                            createPatientMutation.mutate(createForm);
                          }}
                          isLoading={createPatientMutation.isPending}
                        >
                          Lưu
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              {activeTab === "prescriptions" && role === "ADMIN" && (
                <Dialog
                  open={openMedDialog}
                  onOpenChange={(o) => {
                    setOpenMedDialog(o);
                    if (!o) {
                      setEditingMedId(undefined);
                      setMedForm({
                        name: "",
                        strength: "",
                        form: "",
                        unit: "",
                        description: "",
                      });
                      setMedFormErrors({
                        name: "",
                        strength: "",
                        form: "",
                        unit: "",
                      });
                    }
                  }}
                >
                  {/* Overlay with blur - only render when dialog is open */}
                  {openMedDialog && (
                    <div
                      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
                      aria-hidden="true"
                    />
                  )}
                  <DialogTrigger asChild>
                    <Button className="relative bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary/20">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm thuốc
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] rounded-2xl border border-border/20 shadow-2xl bg-card/95 backdrop-blur-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMedId ? "Sửa thuốc" : "Thêm thuốc"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label>Tên thuốc</Label>
                        <Input
                          value={medForm.name || ""}
                          onChange={(e) => {
                            setMedForm((s) => ({ ...s, name: e.target.value }));
                            // Clear error when user starts typing
                            if (medFormErrors.name) {
                              setMedFormErrors((prev) => ({
                                ...prev,
                                name: "",
                              }));
                            }
                          }}
                          placeholder="Paracetamol"
                          className={
                            medFormErrors.name
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                        />
                        {medFormErrors.name && (
                          <p className="text-sm text-red-500 mt-1">
                            {medFormErrors.name}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label>Hàm lượng</Label>
                        <Input
                          value={medForm.strength || ""}
                          onChange={(e) => {
                            setMedForm((s) => ({
                              ...s,
                              strength: e.target.value,
                            }));
                            // Clear error when user starts typing
                            if (medFormErrors.strength) {
                              setMedFormErrors((prev) => ({
                                ...prev,
                                strength: "",
                              }));
                            }
                          }}
                          placeholder="500mg"
                          className={
                            medFormErrors.strength
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                        />
                        {medFormErrors.strength && (
                          <p className="text-sm text-red-500 mt-1">
                            {medFormErrors.strength}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label>Dạng bào chế</Label>
                        <Input
                          value={medForm.form || ""}
                          onChange={(e) => {
                            setMedForm((s) => ({ ...s, form: e.target.value }));
                            // Clear error when user starts typing
                            if (medFormErrors.form) {
                              setMedFormErrors((prev) => ({
                                ...prev,
                                form: "",
                              }));
                            }
                          }}
                          placeholder="viên"
                          className={
                            medFormErrors.form
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                        />
                        {medFormErrors.form && (
                          <p className="text-sm text-red-500 mt-1">
                            {medFormErrors.form}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label>Đơn vị</Label>
                        <Input
                          value={medForm.unit || ""}
                          onChange={(e) => {
                            setMedForm((s) => ({ ...s, unit: e.target.value }));
                            // Clear error when user starts typing
                            if (medFormErrors.unit) {
                              setMedFormErrors((prev) => ({
                                ...prev,
                                unit: "",
                              }));
                            }
                          }}
                          placeholder="mg"
                          className={
                            medFormErrors.unit
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                        />
                        {medFormErrors.unit && (
                          <p className="text-sm text-red-500 mt-1">
                            {medFormErrors.unit}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label>Mô tả</Label>
                        <Input
                          value={medForm.description || ""}
                          onChange={(e) =>
                            setMedForm((s) => ({
                              ...s,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Ghi chú"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={medForm.isActive || false}
                          onChange={(e) =>
                            setMedForm((s) => ({
                              ...s,
                              isActive: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <Label
                          htmlFor="isActive"
                          className="text-sm font-medium"
                        >
                          Thuốc đang hoạt động
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          // Reset errors
                          setMedFormErrors({
                            name: "",
                            strength: "",
                            form: "",
                            unit: "",
                          });

                          let hasError = false;
                          const newErrors: typeof medFormErrors = {};

                          // Validation tất cả các trường bắt buộc
                          if (!medForm.name?.trim()) {
                            newErrors.name = "Vui lòng nhập tên thuốc";
                            hasError = true;
                          }
                          if (!medForm.strength?.trim()) {
                            newErrors.strength =
                              "Vui lòng nhập hàm lượng thuốc";
                            hasError = true;
                          }
                          if (!medForm.form?.trim()) {
                            newErrors.form = "Vui lòng nhập dạng bào chế";
                            hasError = true;
                          }
                          if (!medForm.unit?.trim()) {
                            newErrors.unit = "Vui lòng nhập đơn vị";
                            hasError = true;
                          }

                          // Set errors nếu có
                          if (hasError) {
                            setMedFormErrors(newErrors);
                            return;
                          }

                          // Nếu tất cả validation đều pass, thực hiện create/update
                          if (editingMedId)
                            updateMed.mutate({
                              id: editingMedId,
                              dto: medForm,
                            });
                          else createMed.mutate(medForm);
                        }}
                        isLoading={createMed.isPending || updateMed.isPending}
                      >
                        Lưu
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-background via-muted/30 to-background p-2 rounded-2xl border border-border/20 shadow-lg backdrop-blur-sm">
              <TabsTrigger
                value="patients"
                className="group flex items-center gap-2 relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-primary/10 hover:scale-102"
              >
                <Users className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="hidden sm:inline font-medium">Bệnh nhân</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </TabsTrigger>
              <TabsTrigger
                value="prescriptions"
                className="group flex items-center gap-2 relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-primary/10 hover:scale-102"
              >
                <FileText className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="hidden sm:inline font-medium">
                  Danh sách thuốc
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </TabsTrigger>
              <TabsTrigger
                value="doctors"
                className="group flex items-center gap-2 relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-primary/10 hover:scale-102"
              >
                <Stethoscope className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="hidden sm:inline font-medium">Bác sĩ</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patients">
              <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl shadow-xl border border-border/20 p-8 backdrop-blur-sm">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-sm"></div>
                      <div className="relative p-3 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Quản lý bệnh nhân
                      </h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        Tổng số bệnh nhân:{" "}
                        <span className="font-semibold text-primary">
                          {patientsData?.pagination?.total || patientsData?.total || patientsData?.data?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-96">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl blur-sm"></div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm theo tên hoặc số điện thoại..."
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setPatientPage(1);
                        }}
                        className="pl-12 pr-4 py-3 bg-background/50 border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Table Section */}
                <div className="relative rounded-2xl border border-border/20 overflow-hidden bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
                  <div className="relative">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border-b border-border/30 hover:bg-gradient-to-r hover:from-muted/60 hover:via-muted/40 hover:to-muted/60 transition-all duration-300">
                          <TableHead className="font-bold text-foreground/90 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-primary/10 rounded-lg">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              Họ tên
                            </div>
                          </TableHead>
                          <TableHead className="font-bold text-foreground/90 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-primary/10 rounded-lg">
                                <Phone className="h-4 w-4 text-primary" />
                              </div>
                              Số điện thoại
                            </div>
                          </TableHead>
                          <TableHead className="font-bold text-foreground/90 py-4">
                            Giới tính
                          </TableHead>
                          <TableHead className="font-bold text-foreground/90 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-primary/10 rounded-lg">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              Ngày sinh
                            </div>
                          </TableHead>
                          <TableHead className="font-bold text-foreground/90 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-primary/10 rounded-lg">
                                <MapPin className="h-4 w-4 text-primary" />
                              </div>
                              Địa chỉ
                            </div>
                          </TableHead>
                          <TableHead className="font-bold text-foreground/90 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-primary/10 rounded-lg">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              Bác sĩ điều trị
                            </div>
                          </TableHead>
                          <TableHead className="text-right font-bold text-foreground/90 py-4">
                            Thao tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(role === "PATIENT"
                          ? [currentUserQuery.data].filter(Boolean)
                          : toArray(patientsData?.data || patientsData)
                        ).map((p: any, index: number) => (
                          <TableRow
                            key={p.id}
                            className="group hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-primary/5 transition-all duration-500 border-b border-border/20 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animation: "fadeInUp 0.6s ease-out forwards",
                            }}
                          >
                            <TableCell className="font-medium py-4">
                              <div className="flex items-center gap-4">
                                <div className="relative group-hover:scale-110 transition-transform duration-300">
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                                  <div className="relative w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                    <span className="text-sm font-bold text-primary">
                                      {p.fullName?.charAt(0)?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                    {p.fullName}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-muted-foreground font-medium">
                                {p.phoneNumber}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
                                  p.profile?.gender === "Nam" || p.profile?.gender === "MALE"
                                    ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300/50"
                                    : p.profile?.gender === "Nữ" || p.profile?.gender === "FEMALE"
                                    ? "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-300/50"
                                    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300/50"
                                }`}
                              >
                                {p.profile?.gender === "MALE" ? "Nam" : 
                                 p.profile?.gender === "FEMALE" ? "Nữ" : 
                                 p.profile?.gender === "OTHER" ? "Khác" : 
                                 p.profile?.gender || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-muted-foreground font-medium">
                                {formatDateOnly(p.profile?.birthDate)}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-muted-foreground max-w-xs truncate block font-medium">
                                {p.profile?.address || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                {p.createdByUser ? (
                                  <>
                                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                                      <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                                        <span className="text-xs font-bold text-blue-600">
                                          {p.createdByUser.fullName?.charAt(0)?.toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-foreground group-hover:text-blue-600 transition-colors duration-300">
                                        {p.createdByUser.fullName}
                                      </span>
                                      {p.createdByUser.majorDoctor && (
                                        <div className="text-xs text-muted-foreground">
                                          {p.createdByUser.majorDoctor.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                                      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-400/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                                      <div className="relative w-8 h-8 bg-gradient-to-br from-gray-400/20 to-gray-400/10 rounded-full flex items-center justify-center border border-gray-400/20">
                                        <span className="text-xs font-bold text-gray-600">
                                          ?
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">
                                        Đăng ký tự do
                                      </span>
                                      <div className="text-xs text-muted-foreground/70">
                                        Chưa có bác sĩ điều trị
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditProfile(p.id)}
                                  className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 group-hover:scale-105"
                                >
                                  <Pencil className="h-4 w-4 mr-1.5" />
                                  Sửa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDelete(p)}
                                  className="hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:border-destructive/30 hover:text-destructive hover:shadow-md hover:shadow-destructive/10 transition-all duration-300 group-hover:scale-105"
                                >
                                  <Trash2 className="h-4 w-4 mr-1.5" />
                                  Xóa
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(role !== "PATIENT"
                          ? loadingPatients
                          : currentUserQuery.isLoading) && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-16 text-muted-foreground"
                            >
                              <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                  <div
                                    className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/40 rounded-full animate-spin"
                                    style={{
                                      animationDelay: "0.15s",
                                      animationDuration: "1.5s",
                                    }}
                                  ></div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-sm font-medium">
                                    Đang tải dữ liệu...
                                  </span>
                                  <p className="text-xs text-muted-foreground/70">
                                    Vui lòng chờ trong giây lát
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gradient-to-r from-transparent via-border/30 to-transparent">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                    Trang {patientPage} • Hiển thị{" "}
                    <span className="font-semibold text-primary">
                      {patientsData?.data?.length || 0}
                    </span>{" "}
                    /{" "}
                    <span className="font-semibold text-primary">
                      {patientsData?.pagination?.total || patientsData?.total || 0}
                    </span>{" "}
                    bệnh nhân
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPatientPage((p) => Math.max(1, p - 1))}
                      disabled={patientPage === 1}
                      className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPatientPage((p) => p + 1)}
                      disabled={
                        patientPage * patientLimit >= (patientsData?.pagination?.total || patientsData?.total || 0)
                      }
                      className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Edit Profile Dialog */}
              <Dialog
                open={openEditProfile.open}
                onOpenChange={(open) =>
                  setOpenEditProfile({
                    open,
                    id: open ? openEditProfile.id : undefined,
                  })
                }
              >
                {/* Overlay with blur - only render when dialog is open */}
                {openEditProfile.open && (
                  <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
                    aria-hidden="true"
                  />
                )}
                <DialogContent className="sm:max-w-[500px] rounded-2xl border border-border/20 shadow-2xl bg-card/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle>Cập nhật hồ sơ</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label>Họ tên</Label>
                      <Input
                        value={createForm.fullName || ""}
                        onChange={(e) =>
                          setCreateForm((s) => ({
                            ...s,
                            fullName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Số điện thoại</Label>
                      <Input
                        value={createForm.phoneNumber || ""}
                        onChange={(e) =>
                          setCreateForm((s) => ({
                            ...s,
                            phoneNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Giới tính</Label>
                      <select
                        value={profileForm.gender || ""}
                        onChange={(e) =>
                          setProfileForm((s) => ({
                            ...s,
                            gender: e.target.value,
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Ngày sinh</Label>
                      <Input
                        type="date"
                        value={profileForm.birthDate || ""}
                        onChange={(e) =>
                          setProfileForm((s) => ({
                            ...s,
                            birthDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Địa chỉ</Label>
                      <Input
                        value={profileForm.address || ""}
                        onChange={(e) =>
                          setProfileForm((s) => ({
                            ...s,
                            address: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() =>
                        selectedPatientId &&
                        updateProfileMutation.mutate({
                          id: selectedPatientId,
                          dto: profileForm,
                        })
                      }
                      isLoading={updateProfileMutation.isPending}
                    >
                      Lưu
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit History Dialog */}
              <Dialog
                open={openEditHistory.open}
                onOpenChange={(open) =>
                  setOpenEditHistory({
                    open,
                    id: open ? openEditHistory.id : undefined,
                  })
                }
              >
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Cập nhật tiền sử</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label>Bệnh nền (phân cách bởi dấu phẩy)</Label>
                      <Input
                        value={(historyForm.conditions || []).join(", ")}
                        onChange={(e) =>
                          setHistoryForm((s) => ({
                            ...s,
                            conditions: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Dị ứng</Label>
                      <Input
                        value={(historyForm.allergies || []).join(", ")}
                        onChange={(e) =>
                          setHistoryForm((s) => ({
                            ...s,
                            allergies: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Phẫu thuật</Label>
                      <Input
                        value={(historyForm.surgeries || []).join(", ")}
                        onChange={(e) =>
                          setHistoryForm((s) => ({
                            ...s,
                            surgeries: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tiền sử gia đình</Label>
                      <Input
                        value={historyForm.familyHistory || ""}
                        onChange={(e) =>
                          setHistoryForm((s) => ({
                            ...s,
                            familyHistory: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Lối sống</Label>
                      <Input
                        value={historyForm.lifestyle || ""}
                        onChange={(e) =>
                          setHistoryForm((s) => ({
                            ...s,
                            lifestyle: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Thuốc đang dùng</Label>
                      <Input
                        value={(historyForm.currentMedications || []).join(
                          ", "
                        )}
                        onChange={(e) =>
                          setHistoryForm((s) => ({
                            ...s,
                            currentMedications: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Ghi chú</Label>
                      <Input
                        value={historyForm.notes || ""}
                        onChange={(e) =>
                          setHistoryForm((s) => ({
                            ...s,
                            notes: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() =>
                        selectedPatientId &&
                        updateHistoryMutation.mutate({
                          id: selectedPatientId,
                          dto: historyForm,
                        })
                      }
                      isLoading={updateHistoryMutation.isPending}
                    >
                      Lưu
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="prescriptions">
              <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl shadow-xl border border-border/20 p-8 backdrop-blur-sm">
                {role === "DOCTOR" && (
                  <>
                    {/* Header Section */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-sm"></div>
                        <div className="relative p-3 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          Danh sách đơn thuốc
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          Tổng số đơn thuốc:{" "}
                          <span className="font-semibold text-primary">
                            {toArray(prescriptionsQuery.data).length}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="relative rounded-2xl border border-border/20 overflow-hidden bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
                      <div className="relative">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border-b border-border/30 hover:bg-gradient-to-r hover:from-muted/60 hover:via-muted/40 hover:to-muted/60 transition-all duration-300">
                              <TableHead className="font-bold text-foreground/90 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-primary/10 rounded-lg">
                                    <FileText className="h-4 w-4 text-primary" />
                                  </div>
                                  Mã đơn
                                </div>
                              </TableHead>
                              <TableHead className="font-bold text-foreground/90 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-primary/10 rounded-lg">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  Bệnh nhân
                                </div>
                              </TableHead>
                              <TableHead className="font-bold text-foreground/90 py-4">
                                Ghi chú
                              </TableHead>
                              <TableHead className="font-bold text-foreground/90 py-4">
                                Trạng thái
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {toArray(prescriptionsQuery.data).map(
                              (pr: any, index: number) => (
                                <TableRow
                                  key={pr.id}
                                  className="group hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-primary/5 transition-all duration-500 border-b border-border/20 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                                  style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation:
                                      "fadeInUp 0.6s ease-out forwards",
                                  }}
                                >
                                  <TableCell className="font-medium py-4">
                                    <span className="font-mono text-sm bg-gradient-to-r from-muted/80 to-muted/60 px-3 py-1.5 rounded-lg border border-border/30 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:border-primary/20 transition-all duration-300">
                                      {pr.id}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="flex items-center gap-4">
                                      <div className="relative group-hover:scale-110 transition-transform duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                                        <div className="relative w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                          <span className="text-sm font-bold text-primary">
                                            {(
                                              pr.patient?.fullName ||
                                              pr.patientId
                                            )
                                              ?.charAt(0)
                                              ?.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                        {pr.patient?.fullName || pr.patientId}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <span className="text-muted-foreground font-medium">
                                      {pr.notes || "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <span
                                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
                                        pr.status === "COMPLETED" ||
                                        pr.status === "completed"
                                          ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300/50"
                                          : pr.status === "PENDING" ||
                                            pr.status === "pending"
                                          ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300/50"
                                          : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300/50"
                                      }`}
                                    >
                                      <div
                                        className={`w-2 h-2 rounded-full mr-2 ${
                                          pr.status === "COMPLETED" ||
                                          pr.status === "completed"
                                            ? "bg-green-600"
                                            : pr.status === "PENDING" ||
                                              pr.status === "pending"
                                            ? "bg-yellow-600"
                                            : "bg-gray-600"
                                        }`}
                                      ></div>
                                      {pr.status || "Chưa xác định"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            {toArray(prescriptionsQuery.data).length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-16 text-muted-foreground"
                                >
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                      <div className="w-16 h-16 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-sm font-medium">
                                        Chưa có đơn thuốc nào
                                      </span>
                                      <p className="text-xs text-muted-foreground/70">
                                        Đơn thuốc sẽ xuất hiện ở đây khi được
                                        tạo
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}
                {role === "ADMIN" && (
                  <>
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-sm"></div>
                          <div className="relative p-3 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20">
                            <Pill className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            Quản lý thuốc
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            Tổng số thuốc:{" "}
                            <span className="font-semibold text-primary">
                              {medsQuery.data?.total ||
                                toArray(medsQuery.data).length}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="relative rounded-2xl border border-border/20 overflow-hidden bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
                      <div className="relative">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border-b border-border/30 hover:bg-gradient-to-r hover:from-muted/60 hover:via-muted/40 hover:to-muted/60 transition-all duration-300">
                              <TableHead className="font-bold text-foreground/90 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-primary/10 rounded-lg">
                                    <Pill className="h-4 w-4 text-primary" />
                                  </div>
                                  Tên thuốc
                                </div>
                              </TableHead>
                              <TableHead className="font-bold text-foreground/90 py-4">
                                Hàm lượng
                              </TableHead>
                              <TableHead className="font-bold text-foreground/90 py-4">
                                Dạng bào chế
                              </TableHead>
                              <TableHead className="font-bold text-foreground/90 py-4">
                                Đơn vị
                              </TableHead>
                              <TableHead className="font-bold text-foreground/90 py-4">
                                Trạng thái
                              </TableHead>
                              <TableHead className="text-right font-bold text-foreground/90 py-4">
                                Thao tác
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(
                              medsQuery.data?.items || toArray(medsQuery.data)
                            ).map((m: any, index: number) => (
                              <TableRow
                                key={m.id}
                                className="group hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-primary/5 transition-all duration-500 border-b border-border/20 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                                style={{
                                  animationDelay: `${index * 100}ms`,
                                  animation: "fadeInUp 0.6s ease-out forwards",
                                }}
                              >
                                <TableCell className="font-medium py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                                      <div className="relative w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                        <Pill className="h-5 w-5 text-primary" />
                                      </div>
                                    </div>
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                      {m.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-muted-foreground font-medium">
                                    {m.strength || "-"}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-muted-foreground font-medium">
                                    {m.form || "-"}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-muted-foreground font-medium">
                                    {m.unit || "-"}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
                                      m.isActive
                                        ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300/50"
                                        : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300/50"
                                    }`}
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full mr-2 ${
                                        m.isActive
                                          ? "bg-green-600"
                                          : "bg-red-600"
                                      }`}
                                    ></div>
                                    {m.isActive
                                      ? "Hoạt động"
                                      : "Ngưng hoạt động"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right py-4">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingMedId(m.id);
                                        setMedForm({
                                          name: m.name,
                                          strength: m.strength,
                                          form: m.form,
                                          unit: m.unit,
                                          description: m.description,
                                          isActive: m.isActive,
                                        });
                                        setOpenMedDialog(true);
                                      }}
                                      className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 group-hover:scale-105"
                                    >
                                      <Pencil className="h-4 w-4 mr-1.5" />
                                      Sửa
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (m.isActive) {
                                          deactivateMed.mutate(m.id);
                                        } else {
                                          // Kích hoạt lại thuốc
                                          updateMed.mutate({
                                            id: m.id,
                                            dto: {
                                              name: m.name,
                                              strength: m.strength,
                                              form: m.form,
                                              unit: m.unit,
                                              description: m.description,
                                              isActive: true,
                                            },
                                          });
                                        }
                                      }}
                                      className={`transition-all duration-300 group-hover:scale-105 ${
                                        m.isActive
                                          ? "hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:border-destructive/30 hover:text-destructive hover:shadow-md hover:shadow-destructive/10"
                                          : "hover:bg-gradient-to-r hover:from-green-500/10 hover:to-green-500/5 hover:border-green-500/30 hover:text-green-600 hover:shadow-md hover:shadow-green-500/10"
                                      }`}
                                    >
                                      {m.isActive ? (
                                        <>
                                          <Trash2 className="h-4 w-4 mr-1.5" />
                                          Vô hiệu
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="h-4 w-4 mr-1.5" />
                                          Kích hoạt
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {(medsQuery.data?.items || toArray(medsQuery.data))
                              .length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center py-16 text-muted-foreground"
                                >
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                      <div className="w-16 h-16 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl flex items-center justify-center">
                                        <Pill className="h-8 w-8 text-muted-foreground/50" />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-sm font-medium">
                                        Chưa có thuốc nào
                                      </span>
                                      <p className="text-xs text-muted-foreground/70">
                                        Thuốc sẽ xuất hiện ở đây khi được thêm
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Pagination for Medications */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gradient-to-r from-transparent via-border/30 to-transparent">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                        Trang {medPage} • Hiển thị{" "}
                        <span className="font-semibold text-primary">
                          {
                            (medsQuery.data?.items || toArray(medsQuery.data))
                              .length
                          }
                        </span>{" "}
                        /{" "}
                        <span className="font-semibold text-primary">
                          {medsQuery.data?.total || 0}
                        </span>{" "}
                        thuốc
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMedPage((p) => Math.max(1, p - 1))}
                          disabled={medPage === 1}
                          className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMedPage((p) => p + 1)}
                          disabled={
                            medPage * medLimit >= (medsQuery.data?.total || 0)
                          }
                          className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sau →
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="doctors">
              <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl shadow-xl border border-border/20 p-8 backdrop-blur-sm">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-sm"></div>
                      <div className="relative p-3 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Quản lý bác sĩ
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Danh sách và quản lý thông tin bác sĩ
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        placeholder="Tìm kiếm bác sĩ..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        className="pl-10 bg-background/50 border-border/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>

                    {/* Create Doctor Button */}
                    {role === "ADMIN" && (
                      <Dialog
                        open={openCreateDoctor}
                        onOpenChange={(open) => {
                          setOpenCreateDoctor(open);
                          if (!open) {
                            // Reset form and errors when dialog is closed
                            setCreateDoctorForm({
                              fullName: "",
                              phoneNumber: "",
                              password: "",
                              majorDoctor: "TAM_THAN",
                            });
                            setCreateDoctorErrors({
                              fullName: "",
                              phoneNumber: "",
                              password: "",
                            });
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button className="relative bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo bác sĩ
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Tạo bác sĩ mới</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-2">
                            <div className="grid gap-2">
                              <Label>Họ tên</Label>
                              <Input
                                value={createDoctorForm.fullName}
                                onChange={(e) => {
                                  setCreateDoctorForm((s) => ({
                                    ...s,
                                    fullName: e.target.value,
                                  }));
                                  // Clear error when user starts typing
                                  if (createDoctorErrors.fullName) {
                                    setCreateDoctorErrors((prev) => ({
                                      ...prev,
                                      fullName: "",
                                    }));
                                  }
                                }}
                                placeholder="BS. Nguyễn Văn A"
                                className={
                                  createDoctorErrors.fullName
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                                }
                              />
                              {createDoctorErrors.fullName && (
                                <p className="text-sm text-red-500 mt-1">
                                  {createDoctorErrors.fullName}
                                </p>
                              )}
                            </div>
                            <div className="grid gap-2">
                              <Label>Số điện thoại</Label>
                              <Input
                                value={createDoctorForm.phoneNumber}
                                onChange={(e) => {
                                  setCreateDoctorForm((s) => ({
                                    ...s,
                                    phoneNumber: e.target.value,
                                  }));
                                  // Clear error when user starts typing
                                  if (createDoctorErrors.phoneNumber) {
                                    setCreateDoctorErrors((prev) => ({
                                      ...prev,
                                      phoneNumber: "",
                                    }));
                                  }
                                }}
                                placeholder="09xxxxxxxx"
                                className={
                                  createDoctorErrors.phoneNumber
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                                }
                              />
                              {createDoctorErrors.phoneNumber && (
                                <p className="text-sm text-red-500 mt-1">
                                  {createDoctorErrors.phoneNumber}
                                </p>
                              )}
                            </div>
                            <div className="grid gap-2">
                              <Label>Mật khẩu</Label>
                              <Input
                                type="password"
                                value={createDoctorForm.password}
                                onChange={(e) => {
                                  setCreateDoctorForm((s) => ({
                                    ...s,
                                    password: e.target.value,
                                  }));
                                  // Clear error when user starts typing
                                  if (createDoctorErrors.password) {
                                    setCreateDoctorErrors((prev) => ({
                                      ...prev,
                                      password: "",
                                    }));
                                  }
                                }}
                                placeholder="••••••"
                                className={
                                  createDoctorErrors.password
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                                }
                              />
                              {createDoctorErrors.password && (
                                <p className="text-sm text-red-500 mt-1">
                                  {createDoctorErrors.password}
                                </p>
                              )}
                            </div>
                            <div className="grid gap-2">
                              <Label>Chuyên khoa</Label>
                              <select
                                value={createDoctorForm.majorDoctor}
                                onChange={(e) =>
                                  setCreateDoctorForm((s) => ({
                                    ...s,
                                    majorDoctor: e.target.value as MajorDoctor,
                                  }))
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="DINH_DUONG">Dinh dưỡng</option>
                                <option value="TAM_THAN">Tâm thần</option>
                                <option value="TIM_MACH">Tim mạch</option>
                                <option value="NOI_TIET">Nội tiết</option>
                                <option value="NGOAI_KHOA">Ngoại khoa</option>
                                <option value="PHU_SAN">Phụ sản</option>
                                <option value="NHI_KHOA">Nhi khoa</option>
                                <option value="MAT">Mắt</option>
                                <option value="TAI_MUI_HONG">
                                  Tai mũi họng
                                </option>
                                <option value="DA_LIEU">Da liễu</option>
                                <option value="XUONG_KHOP">Xương khớp</option>
                                <option value="THAN_KINH">Thần kinh</option>
                                <option value="UNG_BUOU">Ung bướu</option>
                                <option value="HO_HAP">Hô hấp</option>
                                <option value="TIEU_HOA">Tiêu hóa</option>
                                <option value="THAN_TIET_NIEU">
                                  Thận tiết niệu
                                </option>
                              </select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleCreateDoctor}
                              disabled={createDoctorMutation.isPending}
                              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                            >
                              {createDoctorMutation.isPending
                                ? "Đang tạo..."
                                : "Tạo bác sĩ"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Doctors Table */}
                <div className="relative rounded-2xl border border-border/20 overflow-hidden bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
                  <div className="relative">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border-b border-border/30 hover:bg-gradient-to-r hover:from-muted/60 hover:via-muted/40 hover:to-muted/60 transition-all duration-300">
                          <TableHead className="font-bold text-foreground/90 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-primary/10 rounded-lg">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              Họ tên
                            </div>
                          </TableHead>
                          <TableHead className="font-bold text-foreground/90 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-primary/10 rounded-lg">
                                <Phone className="h-4 w-4 text-primary" />
                              </div>
                              Số điện thoại
                            </div>
                          </TableHead>
                          <TableHead className="font-bold text-foreground/90 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-primary/10 rounded-lg">
                                <Stethoscope className="h-4 w-4 text-primary" />
                              </div>
                              Chuyên khoa
                            </div>
                          </TableHead>
                          <TableHead className="font-bold text-foreground/90 py-4">
                            Trạng thái
                          </TableHead>
                          <TableHead className="text-right font-bold text-foreground/90 py-4">
                            Thao tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {toArray(doctorsData?.data).map(
                          (doctor: DoctorUser, index: number) => (
                            <TableRow
                              key={doctor.id}
                              className="group hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-primary/5 transition-all duration-500 border-b border-border/20 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                              style={{
                                animationDelay: `${index * 100}ms`,
                                animation: "fadeInUp 0.6s ease-out forwards",
                              }}
                            >
                              <TableCell className="font-medium py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative group-hover:scale-110 transition-transform duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                                    <div className="relative w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                      <span className="text-sm font-bold text-primary">
                                        {doctor.fullName
                                          ?.charAt(0)
                                          ?.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                      {doctor.fullName}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-muted-foreground font-medium">
                                  {doctor.phoneNumber}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300/50">
                                  {doctor.majorDoctor
                                    ? getMajorDoctorName(doctor.majorDoctor)
                                    : "-"}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
                                    doctor.status === "ACTIVE"
                                      ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300/50"
                                      : doctor.status === "INACTIVE"
                                      ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300/50"
                                      : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300/50"
                                  }`}
                                >
                                  {doctor.status === "ACTIVE"
                                    ? "Hoạt động"
                                    : doctor.status === "INACTIVE"
                                    ? "Tạm dừng"
                                    : "Khóa"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right py-4">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenEditDoctor(doctor)}
                                    className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 group-hover:scale-105"
                                  >
                                    <Pencil className="h-4 w-4 mr-1.5" />
                                    Sửa
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleOpenDeleteDoctor(doctor)
                                    }
                                    className="hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:border-destructive/30 hover:text-destructive hover:shadow-md hover:shadow-destructive/10 transition-all duration-300 group-hover:scale-105"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    Xóa
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                        {loadingDoctors && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-16 text-muted-foreground"
                            >
                              <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                  <div
                                    className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/40 rounded-full animate-spin"
                                    style={{
                                      animationDelay: "0.15s",
                                      animationDuration: "1.5s",
                                    }}
                                  ></div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-sm font-medium">
                                    Đang tải dữ liệu...
                                  </span>
                                  <p className="text-xs text-muted-foreground/70">
                                    Vui lòng chờ trong giây lát
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination for Doctors */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gradient-to-r from-transparent via-border/30 to-transparent">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                    Trang {doctorPage} • Hiển thị{" "}
                    <span className="font-semibold text-primary">
                      {toArray(doctorsData?.data).length}
                    </span>{" "}
                    /{" "}
                    <span className="font-semibold text-primary">
                      {doctorsData?.total || 0}
                    </span>{" "}
                    bác sĩ
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDoctorPage((p) => Math.max(1, p - 1))}
                      disabled={doctorPage === 1}
                      className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDoctorPage((p) => p + 1)}
                      disabled={
                        doctorPage * doctorLimit >= (doctorsData?.total || 0)
                      }
                      className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Doctor Dialog */}
      <Dialog
        open={openEditDoctor.open}
        onOpenChange={(open) => setOpenEditDoctor({ open })}
      >
        {/* Overlay with blur - only render when dialog is open */}
        {openEditDoctor.open && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
            aria-hidden="true"
          />
        )}
        <DialogContent className="sm:max-w-[500px] rounded-2xl border border-border/20 shadow-2xl bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bác sĩ</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Họ tên</Label>
              <Input
                value={updateDoctorForm.fullName}
                onChange={(e) =>
                  setUpdateDoctorForm((s) => ({
                    ...s,
                    fullName: e.target.value,
                  }))
                }
                placeholder="BS. Nguyễn Văn A"
              />
            </div>
            <div className="grid gap-2">
              <Label>Số điện thoại</Label>
              <Input
                value={updateDoctorForm.phoneNumber}
                onChange={(e) =>
                  setUpdateDoctorForm((s) => ({
                    ...s,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder="09xxxxxxxx"
              />
            </div>
            <div className="grid gap-2">
              <Label>Chuyên khoa</Label>
              <select
                value={updateDoctorForm.majorDoctor}
                onChange={(e) =>
                  setUpdateDoctorForm((s) => ({
                    ...s,
                    majorDoctor: e.target.value as MajorDoctor,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="TAM_THAN">Tâm thần</option>
                <option value="TIM_MACH">Tim mạch</option>
                <option value="NOI_TIET">Nội tiết</option>
                <option value="NGOAI_KHOA">Ngoại khoa</option>
                <option value="PHU_SAN">Phụ sản</option>
                <option value="NHI_KHOA">Nhi khoa</option>
                <option value="MAT">Mắt</option>
                <option value="TAI_MUI_HONG">Tai mũi họng</option>
                <option value="DA_LIEU">Da liễu</option>
                <option value="XUONG_KHOP">Xương khớp</option>
                <option value="THAN_KINH">Thần kinh</option>
                <option value="UNG_BUOU">Ung bướu</option>
                <option value="HO_HAP">Hô hấp</option>
                <option value="TIEU_HOA">Tiêu hóa</option>
                <option value="THAN_TIET_NIEU">Thận tiết niệu</option>
                <option value="DINH_DUONG">Dinh dưỡng</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <select
                value={updateDoctorForm.status}
                onChange={(e) =>
                  setUpdateDoctorForm((s) => ({
                    ...s,
                    status: e.target.value as "ACTIVE" | "INACTIVE" | "BLOCKED",
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Tạm dừng</option>
                <option value="BLOCKED">Khóa</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateDoctor}
              disabled={updateDoctorMutation.isPending}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              {updateDoctorMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Dialog */}
      <Dialog
        open={openDeleteDoctor.open}
        onOpenChange={(open) => setOpenDeleteDoctor({ open })}
      >
        {/* Overlay with blur - only render when dialog is open */}
        {openDeleteDoctor.open && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
            aria-hidden="true"
          />
        )}
        <DialogContent className="sm:max-w-[500px] rounded-2xl border border-border/20 shadow-2xl bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bác sĩ</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa bác sĩ{" "}
              <span className="font-semibold text-foreground">
                {openDeleteDoctor.doctor?.fullName}
              </span>{" "}
              không? Hành động này không thể hoàn tác.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDoctor({ open: false })}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDoctor}
              disabled={deleteDoctorMutation.isPending}
            >
              {deleteDoctorMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Dialog */}
      <Dialog
        open={openDeletePatient.open}
        onOpenChange={(open) => setOpenDeletePatient({ open })}
      >
        {/* Overlay with blur - only render when dialog is open */}
        {openDeletePatient.open && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
            aria-hidden="true"
          />
        )}
        <DialogContent className="sm:max-w-[520px] rounded-2xl border border-border/20 shadow-2xl bg-card/95 backdrop-blur-md p-0 overflow-hidden">
          <div className="p-6 border-b border-border/10 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">
                    Xác nhận xóa bệnh nhân
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-border/10 bg-background/50 p-4">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Bạn sắp xóa bệnh nhân
                </p>
                <p className="text-base font-semibold text-foreground">
                  {openDeletePatient.patient?.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dữ liệu liên quan có thể bị ảnh hưởng. Vui lòng xác nhận.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border/10 bg-background/40 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpenDeletePatient({ open: false })}
              className="rounded-lg"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePatient}
              className="rounded-lg"
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// function ResolveAlertButton({ id }: { id: string }) {
//   const queryClient = useQueryClient();
//   const mutation = useMutation({
//     mutationFn: () => DoctorApi.resolveAlert(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["doctor-alerts"] });
//
//     },
//   });
//   return (
//     <Button
//       size="sm"
//       onClick={() => mutation.mutate()}
//       isLoading={mutation.isPending}
//     >
//       Đánh dấu đã xử lý
//     </Button>
//   );
// }

export default DoctorManagement;
