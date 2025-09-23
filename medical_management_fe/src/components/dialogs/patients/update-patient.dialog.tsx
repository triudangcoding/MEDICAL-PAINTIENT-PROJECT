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
import React, { useState } from "react"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IPatient } from "@/api/patient/types.patient"

// Zod schema for update patient form - optimized for partial updates
export const updatePatientSchema = z.object({
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
  role: z
    .string()
    .refine((val) => val === '' || ["ADMIN", "DOCTOR", "PATIENT"].includes(val), {
      message: "Loại tài khoản không hợp lệ"
    })
    .optional(),
}).refine((data) => {
  // Ít nhất một field phải có giá trị để update
  return Object.values(data).some(val => val && val !== '');
}, {
  message: "Ít nhất một trường phải được cập nhật",
  path: ["root"] // Error sẽ hiển thị ở root level
});

type UpdatePatientFormData = z.infer<typeof updatePatientSchema>;

export function UpdatePatientDialog({ isOpen, onClose, onUpdateSuccess, patient }: { isOpen: boolean, onClose: () => void, onUpdateSuccess: () => void, patient: IPatient }) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false)

  const defaultValues: UpdatePatientFormData = {
    fullName: patient.fullName,
    phoneNumber: patient.phoneNumber,
    password: '',
    role: patient.role
  };

  const form = useForm<UpdatePatientFormData>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  });

  // Reset form với dữ liệu patient khi dialog mở
  React.useEffect(() => {
    if (isOpen && patient) {
      form.reset({
        fullName: patient.fullName,
        phoneNumber: patient.phoneNumber,
        password: '',
        role: patient.role
      });
    }
  }, [isOpen, patient, form]);

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientFormData }) =>
      patientApi.updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Cập nhật bệnh nhân thành công");
      form.reset();
      onUpdateSuccess();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật bệnh nhân");
    },
  });

  // Kiểm tra có thay đổi hay không
  const hasChanges = () => {
    const currentValues = form.getValues();
    return (
      currentValues.fullName !== patient.fullName ||
      currentValues.phoneNumber !== patient.phoneNumber ||
      currentValues.role !== patient.role ||
      (currentValues.password && currentValues.password !== '')
    );
  };

  const isFormChanged = hasChanges();

  const onSubmit = (data: UpdatePatientFormData) => {
    if (!patient.id) {
      toast.error("Không tìm thấy ID bệnh nhân");
      return;
    }

    // Chỉ gửi các field đã thay đổi
    const changedData: Partial<UpdatePatientFormData> = {};

    if (data.fullName !== patient.fullName) {
      changedData.fullName = data.fullName;
    }

    if (data.phoneNumber !== patient.phoneNumber) {
      changedData.phoneNumber = data.phoneNumber;
    }

    if (data.role !== patient.role) {
      changedData.role = data.role;
    }

    if (data.password && data.password !== '') {
      changedData.password = data.password;
    }

    // Chỉ gửi request nếu có thay đổi
    if (Object.keys(changedData).length === 0) {
      toast.error("Không có thay đổi nào để cập nhật");
      return;
    }

    updatePatientMutation.mutate({ id: patient.id, data: changedData });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Cập nhật bệnh nhân</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin bệnh nhân
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='create-patient-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <div className="grid gap-4">
              {/* Root level error message */}
              {form.formState.errors.root && (
                <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Họ và tên</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input placeholder="Nhập họ và tên" {...field} autoFocus={false} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input type="tel" placeholder="Nhập số điện thoại" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          className="pr-10"
                          {...field}
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
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Loại tài khoản</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
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
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Hủy</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={updatePatientMutation.isPending || !isFormChanged}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white disabled:opacity-50"
              >
                {updatePatientMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
