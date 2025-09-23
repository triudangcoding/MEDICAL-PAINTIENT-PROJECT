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

export function CreatePatientDialog({ isOpen, onClose, onCreateSuccess }: { isOpen: boolean, onClose: () => void, onCreateSuccess: () => void}) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false)

  const defaultValues: CreatePatientFormData = {
    fullName: '',
    phoneNumber: '',
    password: '',
    role: ''
  };

  const form = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  });


  const createPatientMutation = useMutation({
    mutationFn: patientApi.createPatientService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Tạo bệnh nhân thành công");
      form.reset(); // Reset form after successful submission
      onCreateSuccess();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo bệnh nhân");
    },
  });

  const onSubmit = (data: CreatePatientFormData) => {
    createPatientMutation.mutate(data);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm bệnh nhân</DialogTitle>
          <DialogDescription>
            Thêm bệnh nhân mới
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form 
            id='create-patient-form' 
            onSubmit={form.handleSubmit(onSubmit)} 
            className='space-y-6'
          >
            <div className="grid gap-4">
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
                      <Input placeholder="Nhập họ và tên" {...field} />
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
                disabled={createPatientMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              >
                {createPatientMutation.isPending ? "Đang tạo..." : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
