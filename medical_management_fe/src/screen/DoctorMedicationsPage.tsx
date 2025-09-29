import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MedicationsApi } from "@/api/medications";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pill } from "lucide-react";
import { toast } from "react-hot-toast";
import { authApi } from "@/api/auth/auth.api";

export default function DoctorMedicationsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  // Current user (để xác định role)
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
  });
  const role = userData?.data?.role as "ADMIN" | "DOCTOR" | "PATIENT" | undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-medications", { role, page, limit }],
    queryFn: async () =>
      await MedicationsApi.list({ page, limit, isActive: role === "DOCTOR" ? true : undefined }),
  });

  const items = React.useMemo(() => {
    const resp: any = data as any;
    const list = Array.isArray(resp?.items) ? resp?.items : resp?.data || resp || [];
    if (!Array.isArray(list)) return [] as any[];
    if (!q) return list;
    const qLower = q.toLowerCase();
    return list.filter((m: any) =>
      [m?.name, m?.strength, m?.form, m?.unit]
        .filter(Boolean)
        .some((v: string) => String(v).toLowerCase().includes(qLower))
    );
  }, [data, q]);

  const total = (data as any)?.total ?? (Array.isArray((data as any)?.items) ? (data as any)?.items?.length : Array.isArray(data as any) ? (data as any).length : 0);
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  // Dialog state for create
  const [openCreate, setOpenCreate] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    strength: "",
    form: "",
    unit: "",
    description: "",
  });

  const resetForm = () =>
    setForm({ name: "", strength: "", form: "", unit: "", description: "" });

  const createMutation = useMutation({
    mutationFn: () => MedicationsApi.create(form as any),
    onSuccess: () => {
      toast.success("Thêm thuốc thành công");
      setOpenCreate(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["doctor-medications"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Không thể thêm thuốc"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => MedicationsApi.deactivate(id),
    onSuccess: () => {
      toast.success("Đã vô hiệu thuốc");
      queryClient.invalidateQueries({ queryKey: ["doctor-medications"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Không thể vô hiệu thuốc"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Danh sách thuốc</h2>
            <p className="text-xs text-muted-foreground">Tra cứu nhanh thuốc dùng khi kê đơn</p>
          </div>
        </div>
        {role === "ADMIN" && (
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button>Tạo thuốc</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm thuốc</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Tên thuốc"
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="Hàm lượng"
                    value={form.strength}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm((s) => ({ ...s, strength: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Dạng bào chế"
                    value={form.form}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm((s) => ({ ...s, form: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Đơn vị"
                    value={form.unit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm((s) => ({ ...s, unit: e.target.value }))
                    }
                  />
                </div>
                <Input
                  placeholder="Mô tả"
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenCreate(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>
                  {createMutation.isPending ? "Đang lưu..." : "Lưu"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-border/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Tìm theo tên, hàm lượng, dạng bào chế..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="max-w-md"
              />
              <Badge variant="secondary">{isLoading ? "Đang tải..." : `${total || items.length} thuốc`}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={limit}
                onChange={(e) => {
                  const v = Number(e.target.value) || 10;
                  setLimit(v);
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-muted-foreground">mỗi trang</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên thuốc</TableHead>
                  <TableHead>Hàm lượng</TableHead>
                  <TableHead>Dạng</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  {role === "ADMIN" && <TableHead className="text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.strength}</TableCell>
                    <TableCell>{m.form}</TableCell>
                    <TableCell>{m.unit}</TableCell>
                    <TableCell>
                      {m.isActive ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600">Đang dùng</Badge>
                      ) : (
                        <Badge variant="secondary">Ngừng dùng</Badge>
                      )}
                    </TableCell>
                    {role === "ADMIN" && (
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={!m.isActive || deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(m.id)}
                        >
                          {deleteMutation.isPending ? "Đang xử lý..." : "Vô hiệu"}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={role === "ADMIN" ? 6 : 5} className="text-center text-muted-foreground">Không có dữ liệu</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/20">
          <div className="text-sm text-muted-foreground">
            Trang {page}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}


