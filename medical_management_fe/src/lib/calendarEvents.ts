export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: "blue" | "green" | "red";
  description?: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  type: "PAID" | "FREE";
  meetingUrl?: string;
};

// Interface cho gói có phí
interface PaidMeeting {
  id: string;
  orderId: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  meetingUrl: string;
  doctorScheduleFreeId: string;
  order: {
    id: string;
    userId: string;
    totalPrice: number;
    lastPrice: number;
    status: string;
    productServiceId: string;
    voucherId: string;
    scheduleId: string;
    user: {
      id: string;
      phoneNumber: string;
      fullName: string;
      role: string;
      status: string;
      majorDoctor: string | null;
    };
    productServices: {
      id: string;
      name: string;
      description: string;
      originalPrice: number;
      time: number;
      descriptionKey: string[];
      price: number;
      key: string;
      voucherId: string | null;
      orderId: string | null;
    };
  };
  doctorScheduleFree: {
    id: string;
    userId: string;
    status: string;
    startDate: string;
    endDate: string;
    user: {
      id: string;
      phoneNumber: string;
      fullName: string;
      role: string;
      status: string;
      majorDoctor: string | null;
    };
  };
}

// Interface cho gói miễn phí
interface FreeMeeting {
  id: string;
  orderId: null;
  startDate: string;
  endDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  meetingUrl: string;
  doctorScheduleFreeId: string;
  order: null;
  doctorScheduleFree: {
    id: string;
    userId: string;
    status: string;
    startDate: string;
    endDate: string;
    user: {
      id: string;
      phoneNumber: string;
      fullName: string;
      role: string;
      status: string;
      majorDoctor: string | null;
    };
  };
  patient?: {
    id: string;
    phoneNumber: string;
    fullName: string;
    role: string;
    status: string;
    majorDoctor: string | null;
  } | null;
}

export function mapMeetingToEvent(meeting: PaidMeeting | FreeMeeting): CalendarEvent {
  let color: CalendarEvent["color"] = "blue";
  if (meeting.status === "COMPLETED") color = "green";
  else if (meeting.status === "CANCELLED") color = "red";
  else color = "blue";

  // Kiểm tra xem đây là gói có phí hay miễn phí
  const isPaidPackage = meeting.order !== null;
  
  let title: string;
  let description: string | undefined;
  
  if (isPaidPackage) {
    // Gói có phí
    const paidMeeting = meeting as PaidMeeting;
    title = `${paidMeeting.order.user.fullName} - ${paidMeeting.order.productServices.name}`;
    description = paidMeeting.order.productServices.description;
  } else {
    // Gói miễn phí
    const freeMeeting = meeting as FreeMeeting;
    
    // Kiểm tra xem có patient field không
    if (freeMeeting.patient) {
      title = `${freeMeeting.patient.fullName} - Lịch hẹn trực tiếp`;
      description = "Lịch hẹn trực tiếp (không qua đơn hàng)";
    } else {
      title = `${freeMeeting.doctorScheduleFree.user.fullName} - Cuộc hẹn`;
      description = "Cuộc hẹn miễn phí";
    }
  }

  // Parse UTC time as local time to avoid timezone conversion
  const startTime = new Date(meeting.startDate.replace(/Z$/, ''));
  const endTime = new Date(meeting.endDate.replace(/Z$/, ''));

  return {
    id: meeting.id,
    title,
    start: startTime,
    end: endTime,
    color,
    description,
    status: meeting.status,
    type: isPaidPackage ? "PAID" : "FREE",
    meetingUrl: meeting.meetingUrl,
  };
} 