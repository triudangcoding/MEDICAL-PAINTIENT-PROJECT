
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
import { patientApi } from "@/api/patient/patient.api";
import { IPatient } from "@/api/patient/types.patient";
import { doctorApi } from "@/api/doctor/doctor.api";
import { User } from "@/api/doctor/types";

const formSchema = z.object({
  patientId: z.string().min(1, "Vui lòng chọn bệnh nhân"),
  doctorId: z.string().min(1, "Vui lòng chọn bác sĩ"),
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
  path: ["endDate"],
});

interface CreateMedicalScheduleWithoutOrderAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: () => void;
}

export function CreateMedicalScheduleWithoutOrderAdminDialog({
  open,
  onOpenChange,
  onCreateSuccess,
}: CreateMedicalScheduleWithoutOrderAdminDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { data: patients } = useQuery({
    queryKey: ["patients"],
      queryFn: () => patientApi.getAllPatients()
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
      queryFn: () => doctorApi.getDoctorList()
  });

  const createScheduleMutation = useMutation({
    mutationFn: meetingApi.createMeetingWithoutOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetingSchedules"] });
      toast.success("Tạo lịch hẹn thành công!");
      onOpenChange(false);
      form.reset();
      onCreateSuccess();
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
      patientId: values.patientId,
      doctorId: values.doctorId,
      startDate: `${values.startDate}:00.000Z`,
      endDate: `${values.endDate}:00.000Z`,
    };
    // Use appropriate API call for creating schedule without order
    createScheduleMutation.mutate(formattedData as any);
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
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bệnh nhân</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bệnh nhân" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients?.data.map((patient: IPatient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.fullName} - {patient.phoneNumber}
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
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bác sĩ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bác sĩ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors?.data.map((doctor: User) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.fullName} - {doctor.phoneNumber}
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