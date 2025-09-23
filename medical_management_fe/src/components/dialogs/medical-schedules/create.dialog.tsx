import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meetingApi } from "@/api/meeting/meeting.api";
import { orderApi } from "@/api/order/order.api";
import { doctorApi } from "@/api/doctor/doctor.api";
import { DoctorSchedule } from "@/api/doctor/types";
import { Order } from "@/api/order/types";

const formSchema = z.object({
  orderId: z.string().min(1, "Vui lòng chọn đơn hàng"),
  doctorScheduleFreeId: z.string().min(1, "Vui lòng chọn lịch rảnh của bác sĩ"),
  startDate: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
}).refine((data) => {
  if (!data.startDate) return true; // Let required validation handle empty fields
  
  const startTime = new Date(data.startDate);
  const now = new Date();
  const minStartTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
  
  // Check if start time is at least 30 minutes from now
  if (startTime < minStartTime) {
    return false;
  }
  
  return true;
}, {
  message: "Thời gian bắt đầu phải lớn hơn thời gian hiện tại ít nhất 30 phút",
  path: ["startDate"],
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true; // Let required validation handle empty fields
  
  const startTime = new Date(data.startDate);
  const endTime = new Date(data.endDate);
  
  // Check if end time is after start time
  if (endTime <= startTime) {
    return false;
  }
  
  // Check if duration is maximum 30 minutes (30 * 60 * 1000 milliseconds)
  const duration = endTime.getTime() - startTime.getTime();
  const maxDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  return duration <= maxDuration;
}, {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu và không được vượt quá 30 phút",
  path: ["endDate"], // Show error on endDate field
});

interface CreateMedicalScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMedicalScheduleDialog({
  open,
  onOpenChange,
}: CreateMedicalScheduleDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
      doctorScheduleFreeId: "",
      startDate: "",
      endDate: "",
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getOrders,
  });

  const { data: doctorSchedules } = useQuery({
    queryKey: ["doctorSchedules"],
    queryFn: () => doctorApi.getDoctorSchedules(),
  });

  const createScheduleMutation = useMutation({
    mutationFn: meetingApi.createMeetingSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetingSchedules"] });
      toast.success("Tạo lịch hẹn thành công!");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo lịch hẹn. Vui lòng thử lại sau."
      );
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedData = {
      ...values,
      startDate: `${values.startDate}:00.000Z`,
      endDate: `${values.endDate}:00.000Z`,
    };
    createScheduleMutation.mutate(formattedData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm lịch hẹn mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn hàng</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đơn hàng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orders?.data.map((order: Order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.user.fullName} - {order.productServices.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorScheduleFreeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lịch rảnh của bác sĩ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lịch rảnh" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctorSchedules?.data.map((schedule: DoctorSchedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.user.fullName} -{" "}
                          {format(new Date(schedule.startDate), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}{" "}
                          đến{" "}
                          {format(new Date(schedule.endDate), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian bắt đầu</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-calculate end time (30 minutes later)
                        if (e.target.value) {
                          const startTime = new Date(e.target.value);
                          const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes
                          
                          // Format for datetime-local input (YYYY-MM-DDTHH:mm)
                          const year = endTime.getFullYear();
                          const month = String(endTime.getMonth() + 1).padStart(2, '0');
                          const day = String(endTime.getDate()).padStart(2, '0');
                          const hours = String(endTime.getHours()).padStart(2, '0');
                          const minutes = String(endTime.getMinutes()).padStart(2, '0');
                          
                          const endDateString = `${year}-${month}-${day}T${hours}:${minutes}`;
                          form.setValue("endDate", endDateString);
                        }
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Thời gian bắt đầu phải lớn hơn hiện tại ít nhất 30 phút
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian kết thúc</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Thời gian tối đa là 30 phút kể từ thời gian bắt đầu
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Thêm</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 