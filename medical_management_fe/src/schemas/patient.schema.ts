import * as z from "zod"

export const createPatientSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(50, "Họ và tên không được quá 50 ký tự")
    .trim()
    .refine((val) => val.length > 0, {
      message: "Họ và tên là bắt buộc"
    }),
  phoneNumber: z
    .string()
    .min(1, "Số điện thoại là bắt buộc")
    .refine((val) => /^[0-9]{10,11}$/.test(val), {
      message: "Số điện thoại phải có 10-11 chữ số"
    }),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được quá 50 ký tự")
    .refine((val) => val.trim().length > 0, {
      message: "Mật khẩu là bắt buộc"
    }),
  role: z
    .enum(["ADMIN", "DOCTOR", "PATIENT"], {
      errorMap: () => ({ message: "Vui lòng chọn loại tài khoản hợp lệ" })
    })
})

export type CreatePatientFormData = z.infer<typeof createPatientSchema> 