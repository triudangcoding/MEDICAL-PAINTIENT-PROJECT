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
import { Pencil, Trash2 } from "lucide-react";

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
    "patients" | "prescriptions" | "overview" | "alerts"
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
        : patientApi.getAllPatients(),
  });

  const { data: overviewData } = useQuery({
    queryKey: ["doctor-overview"],
    queryFn: () => DoctorApi.overview(),
  });
  const { data: alertsData, isLoading: loadingAlerts } = useQuery({
    queryKey: ["doctor-alerts"],
    queryFn: () => DoctorApi.listAlerts(),
  });

  // Mutations
  const createPatientMutation = useMutation({
    mutationFn: (dto: PatientCreateDto) => DoctorApi.createPatient(dto),
    onSuccess: () => {
      // Refresh patient table
      queryClient.invalidateQueries({ queryKey: ["patient-search"] });
      queryClient.invalidateQueries({ queryKey: ["patient-get-all"] });
      // Refresh overview stats
      queryClient.invalidateQueries({ queryKey: ["doctor-overview"] });
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
    queryKey: ["admin-medications", { page: 1, limit: 20 }],
    queryFn: () =>
      MedicationsApi.list({
        page: 1,
        limit: 20,
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
  const createMed = useMutation({
    mutationFn: (dto: MedicationDto) => MedicationsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medications"] });
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
      });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Tạo thuốc thất bại"),
  });
  const updateMed = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MedicationDto }) =>
      MedicationsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medications"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-medications"] });
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

  const handleOpenEditHistory = (id: string) => {
    setSelectedPatientId(id);
    setHistoryForm({
      conditions: [],
      allergies: [],
      surgeries: [],
      familyHistory: "",
      lifestyle: "",
      currentMedications: [],
      notes: "",
    });
    setOpenEditHistory({ open: true, id });
  };

  const handleOpenDelete = (p: any) => {
    const id = p?.id;
    if (!id) return;
    patientApi
      .deletePatient(id)
      .then(() => {
        // Refresh patient table
        queryClient.invalidateQueries({ queryKey: ["patient-search"] });
        queryClient.invalidateQueries({ queryKey: ["patient-get-all"] });
        // Refresh overview stats
        queryClient.invalidateQueries({ queryKey: ["doctor-overview"] });
        toast.success("Đã xóa bệnh nhân");
      })
      .catch((e) =>
        toast.error(e?.response?.data?.message || "Xóa bệnh nhân thất bại")
      );
  };

  return (
    <div className="min-h-screen bg-background p-6">
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
                    <Button>+ Thêm bệnh nhân</Button>
                  </DialogTrigger>
                  <DialogContent>
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
                        <Input
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
                          placeholder="Nam/Nữ/Khác"
                        />
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
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button>+ Thêm thuốc</Button>
                </DialogTrigger>
                <DialogContent>
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
                        onChange={(e) =>
                          setMedForm((s) => ({ ...s, name: e.target.value }))
                        }
                        placeholder="Paracetamol"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Hàm lượng</Label>
                      <Input
                        value={medForm.strength || ""}
                        onChange={(e) =>
                          setMedForm((s) => ({
                            ...s,
                            strength: e.target.value,
                          }))
                        }
                        placeholder="500mg"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Dạng bào chế</Label>
                      <Input
                        value={medForm.form || ""}
                        onChange={(e) =>
                          setMedForm((s) => ({ ...s, form: e.target.value }))
                        }
                        placeholder="viên"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Đơn vị</Label>
                      <Input
                        value={medForm.unit || ""}
                        onChange={(e) =>
                          setMedForm((s) => ({ ...s, unit: e.target.value }))
                        }
                        placeholder="mg"
                      />
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
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (!medForm.name?.trim()) {
                          toast.error("Không thể bỏ trống tên thuốc");
                          return;
                        }
                        if (editingMedId)
                          updateMed.mutate({ id: editingMedId, dto: medForm });
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
          <TabsList>
            <TabsTrigger value="patients">Bệnh nhân</TabsTrigger>
            <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="alerts">Cảnh báo</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <div className="bg-card rounded-xl shadow p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <Input
                  placeholder="Tìm theo tên/sđt..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setPatientPage(1);
                  }}
                />
                <div className="text-sm text-muted-foreground">
                  Tổng: {patientsData?.data?.length ?? 0}
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>Ngày sinh</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(role === "PATIENT"
                      ? [currentUserQuery.data].filter(Boolean)
                      : toArray(patientsData)
                    ).map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.fullName}
                        </TableCell>
                        <TableCell>{p.phoneNumber}</TableCell>
                        <TableCell>{p.profile?.gender || "-"}</TableCell>
                        <TableCell>
                          {formatDateOnly(p.profile?.birthDate)}
                        </TableCell>
                        <TableCell>{p.profile?.address || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEditProfile(p.id)}
                              title="Sửa"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleOpenDelete(p)}
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
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
                          colSpan={6}
                          className="text-center py-6 text-muted-foreground"
                        >
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Trang {patientPage}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPatientPage((p) => Math.max(1, p - 1))}
                    disabled={patientPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPatientPage((p) => p + 1)}
                    disabled={(patientsData?.data?.length || 0) < patientLimit}
                  >
                    Sau
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
              <DialogContent>
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
                    <Input
                      value={profileForm.gender || ""}
                      onChange={(e) =>
                        setProfileForm((s) => ({
                          ...s,
                          gender: e.target.value,
                        }))
                      }
                    />
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
              <DialogContent>
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
                      value={(historyForm.currentMedications || []).join(", ")}
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
                        setHistoryForm((s) => ({ ...s, notes: e.target.value }))
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
            <div className="bg-card rounded-xl shadow p-4">
              {role === "DOCTOR" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Danh sách đơn thuốc</h3>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã</TableHead>
                          <TableHead>Bệnh nhân</TableHead>
                          <TableHead>Ghi chú</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {toArray(prescriptionsQuery.data).map((pr: any) => (
                          <TableRow key={pr.id}>
                            <TableCell className="font-medium">
                              {pr.id}
                            </TableCell>
                            <TableCell>
                              {pr.patient?.fullName || pr.patientId}
                            </TableCell>
                            <TableCell>{pr.notes || "-"}</TableCell>
                            <TableCell>{pr.status || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
              {role === "ADMIN" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Danh sách thuốc</h3>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên</TableHead>
                          <TableHead>Hàm lượng</TableHead>
                          <TableHead>Dạng</TableHead>
                          <TableHead>Đơn vị</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {toArray(medsQuery.data).map((m: any) => (
                          <TableRow key={m.id}>
                            <TableCell className="font-medium">
                              {m.name}
                            </TableCell>
                            <TableCell>{m.strength || "-"}</TableCell>
                            <TableCell>{m.form || "-"}</TableCell>
                            <TableCell>{m.unit || "-"}</TableCell>
                            <TableCell>
                              <span
                                className={
                                  m.isActive
                                    ? "inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                                    : "inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                                }
                              >
                                {m.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
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
                                >
                                  Sửa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deactivateMed.mutate(m.id)}
                                  disabled={!m.isActive}
                                >
                                  Vô hiệu
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl shadow p-6">
                <div className="text-sm text-muted-foreground">
                  Tổng bệnh nhân
                </div>
                <div className="text-3xl font-bold mt-2">
                  {overviewData?.totalPatients ?? "-"}
                </div>
              </div>
              <div className="bg-card rounded-xl shadow p-6">
                <div className="text-sm text-muted-foreground">
                  Đơn thuốc đã kê
                </div>
                <div className="text-3xl font-bold mt-2">
                  {overviewData?.totalPrescriptions ?? "-"}
                </div>
              </div>
              <div className="bg-card rounded-xl shadow p-6">
                <div className="text-sm text-muted-foreground">
                  Cảnh báo chưa xử lý
                </div>
                <div className="text-3xl font-bold mt-2">
                  {overviewData?.pendingAlerts ?? "-"}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="bg-card rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Cảnh báo</h3>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toArray(alertsData).map((al: any) => (
                      <TableRow key={al.id}>
                        <TableCell className="font-medium">{al.id}</TableCell>
                        <TableCell>{al.message || al.type}</TableCell>
                        <TableCell>
                          {al.status || (al.resolved ? "RESOLVED" : "OPEN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <ResolveAlertButton id={al.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {loadingAlerts && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-6 text-muted-foreground"
                        >
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function ResolveAlertButton({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => DoctorApi.resolveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-overview"] });
    },
  });
  return (
    <Button
      size="sm"
      onClick={() => mutation.mutate()}
      isLoading={mutation.isPending}
    >
      Đánh dấu đã xử lý
    </Button>
  );
}

export default DoctorManagement;
