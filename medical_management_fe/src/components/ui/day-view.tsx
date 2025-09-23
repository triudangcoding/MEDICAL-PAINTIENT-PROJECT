"use client"
import { format, addMinutes, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { CalendarEvent } from "@/lib/calendarEvents"
import { Coffee, Sun, Moon } from "lucide-react"

interface DayViewProps {
  selectedDate: Date
  events?: CalendarEvent[]
}

export function DayView({ selectedDate, events = [] }: DayViewProps) {
  // Tạo time slots cho buổi sáng (7:00 - 11:00) với khoảng cách 30 phút
  const morningSlots = Array.from({ length: 9 }, (_, i) => {
    const baseTime = new Date(selectedDate)
    baseTime.setHours(7, 0, 0, 0)
    return addMinutes(baseTime, i * 30)
  })

  // Tạo time slots cho buổi chiều (13:00 - 18:00) với khoảng cách 30 phút
  const afternoonSlots = Array.from({ length: 11 }, (_, i) => {
    const baseTime = new Date(selectedDate)
    baseTime.setHours(13, 0, 0, 0)
    return addMinutes(baseTime, i * 30)
  })

  // Lọc sự kiện theo ngày
  const allEvents = events.filter((event) => isSameDay(new Date(event.start), selectedDate))

  // Hàm làm tròn thời gian đến 0/15/30/45 (giống week-view)
  const roundToQuarter = (eventStart: Date) => {
    const startHour = eventStart.getHours()
    const startMinute = eventStart.getMinutes()
    
    // Làm tròn phút thành các mốc 0/15/30/45, và cập nhật giờ nếu cần
    let roundedHour = startHour
    let roundedMinute = 0
    
    if (startMinute < 7) {
      roundedMinute = 0
    } else if (startMinute < 22) {
      roundedMinute = 15
    } else if (startMinute < 37) {
      roundedMinute = 30
    } else if (startMinute < 52) {
      roundedMinute = 45
    } else {
      // Làm tròn lên giờ tiếp theo
      roundedHour = startHour + 1
      roundedMinute = 0
    }
    
    const roundedDate = new Date(eventStart)
    roundedDate.setHours(roundedHour, roundedMinute, 0, 0)
    return { roundedHour, roundedMinute, roundedDate }
  }

  // Hàm kiểm tra xem slot có sự kiện không
  const getEventsForSlot = (slot: Date) => {
    return allEvents.filter((event) => {
      const eventStart = new Date(event.start)
      const { roundedDate } = roundToQuarter(eventStart)
      const slotTime = slot.getTime()
      const eventTime = roundedDate.getTime()

      // Kiểm tra xem sự kiện có nằm trong khoảng 30 phút từ slot không
      return eventTime >= slotTime && eventTime < slotTime + 30 * 60 * 1000
    })
  }

  // Hàm tính toán vị trí của sự kiện dựa trên công thức week-view
  const calculateEventPosition = (event: CalendarEvent, slotStart: Date) => {
    const eventStart = new Date(event.start)
    const { roundedHour, roundedMinute } = roundToQuarter(eventStart)
    
    const slotHour = slotStart.getHours()
    const slotMinute = slotStart.getMinutes()
    
    // Tính offset trong slot 30 phút dựa trên khung 15 phút (giống week-view)
    let offsetWithinSlot = 0
    
    // Tính vị trí relative trong slot hiện tại
    const eventTimeInSlot = (roundedHour * 60 + roundedMinute) - (slotHour * 60 + slotMinute)
    
    if (eventTimeInSlot === 0) {
      offsetWithinSlot = 0      // 0 phút - vị trí đầu slot
    } else if (eventTimeInSlot === 15) {
      offsetWithinSlot = 32     // 15 phút - giữa slot (64px / 2)
    } else if (eventTimeInSlot === 30) {
      offsetWithinSlot = 0      // 30 phút - đầu slot tiếp theo
    } else if (eventTimeInSlot === 45) {
      offsetWithinSlot = 32     // 45 phút - giữa slot tiếp theo
    }
    
    return offsetWithinSlot
  }

  // Component hiển thị một slot thời gian
  const TimeSlot = ({ slot, isLast = false }: { slot: Date; isLast?: boolean }) => {
    const slotEvents = getEventsForSlot(slot)
    const isCurrentTime =
      new Date().getHours() === slot.getHours() &&
      Math.abs(new Date().getMinutes() - slot.getMinutes()) < 30 &&
      isSameDay(new Date(), selectedDate)

    // Chiều cao cố định cho mỗi slot
    const slotHeight = 64

    return (
      <div className="relative grid grid-cols-[80px_1fr]">
        {/* Cột giờ */}
        <div 
          className="text-sm text-muted-foreground py-2 text-right pr-4"
          style={{ 
            height: `${slotHeight}px`
          }}
        >
          {format(slot, "HH:mm")}
        </div>

        {/* Cột sự kiện - chiều cao cố định */}
        <div 
          className={cn(
            "border-b relative", 
            !isLast && "border-b", 
            isCurrentTime && "bg-blue-50"
          )}
          style={{ 
            height: `${slotHeight}px`
          }}
        >
          {/* Hiển thị sự kiện xếp ngang */}
          {slotEvents.map((event, eventIndex) => {
            // Tính toán vị trí top dựa trên công thức week-view
            const baseTop = calculateEventPosition(event, slot)
            // Xếp ngang: mỗi event cách nhau 190px theo chiều ngang
            const leftOffset = eventIndex * 190 // 180px width + 10px margin
            
            return (
              <div
                key={event.id}
                className={cn(
                  "absolute p-2 rounded-r-md shadow-sm overflow-hidden border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                  event.color === "blue" && "bg-blue-100 text-blue-800 border-blue-500",
                  event.color === "green" && "bg-green-100 text-green-800 border-green-500", 
                  event.color === "red" && "bg-red-100 text-red-800 border-red-500",
                )}
                style={{
                  top: `${baseTop}px`,
                  left: `${leftOffset}px`,
                  height: "56px", // Chiều cao cố định nhỏ hơn để vừa trong slot
                  width: "180px", // Chiều rộng cố định
                  zIndex: 10 + eventIndex,
                }}
                title={`${event.title}\nThời gian: ${format(new Date(event.start), "HH:mm")} - ${format(new Date(event.end), "HH:mm")}\nTrạng thái: ${event.status === "PENDING" ? "Đang chờ" : event.status === "COMPLETED" ? "Hoàn thành" : "Đã hủy"}`}
              >
                <div className="h-full flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-[11px] leading-tight">{event.title}</h4>
                      <Badge variant="outline" className="text-[8px] ml-1 flex-shrink-0">
                        {event.status === "PENDING" ? "Đang chờ" :
                          event.status === "COMPLETED" ? "Hoàn thành" :
                        "Đã hủy"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end gap-2">
                    <div className="text-[10px] opacity-90">
                      {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Vạch đầu slot (00 phút) */}
          <div className="absolute left-0 right-0 top-0 border-t border-gray-300 opacity-50"></div>
          
          {/* Vạch giữa slot (15 phút) - nét đứt */}
          <div className="absolute left-0 right-0 top-8 border-t border-dashed border-gray-200 opacity-30"></div>
          
          {/* Vạch 30 phút (cuối slot) */}
          <div className="absolute left-0 right-0 bottom-0 border-t border-gray-300 opacity-50"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">{format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}</h2>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar với thông tin tổng quan */}
        <div className="w-full md:w-64 shrink-0">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Lịch trong ngày</h3>
              <div className="space-y-3">
                {allEvents.length > 0 ? (
                  allEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${event.color}-500`}></div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.status === "PENDING" ? "Đang chờ" : event.status === "COMPLETED" ? "Hoàn thành" : "Đã hủy"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Không có sự kiện nào</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thông tin tổng quan */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Tổng quan</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tổng số cuộc hẹn:</span>
                  <span className="font-medium">{allEvents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Đang chờ:</span>
                  <span className="font-medium text-yellow-600">
                    {allEvents.filter(e => e.status === "PENDING").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hoàn thành:</span>
                  <span className="font-medium text-green-600">
                    {allEvents.filter(e => e.status === "COMPLETED").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Đã hủy:</span>
                  <span className="font-medium text-red-600">
                    {allEvents.filter(e => e.status === "CANCELLED").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lịch theo giờ */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Buổi sáng */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sun className="h-5 w-5 text-yellow-500" />
                <h3 className="font-medium text-lg">Buổi sáng (7:00 - 11:00)</h3>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                {/* Time slots buổi sáng */}
                {morningSlots.map((slot, index) => (
                  <TimeSlot key={index} slot={slot} isLast={index === morningSlots.length - 1} />
                ))}
              </div>
            </div>

            {/* Giờ nghỉ trưa */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 py-6 bg-orange-50 border border-orange-200 rounded-lg">
                <Coffee className="h-6 w-6 text-orange-500" />
                <div className="text-center">
                  <h3 className="font-medium text-lg text-orange-700">Giờ nghỉ trưa</h3>
                  <p className="text-sm text-orange-600">11:00 - 13:00</p>
                </div>
                <Coffee className="h-6 w-6 text-orange-500" />
              </div>
            </div>

            {/* Buổi chiều */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Moon className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-lg">Buổi chiều (13:00 - 18:00)</h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                {/* Time slots buổi chiều */}
                {afternoonSlots.map((slot, index) => (
                  <TimeSlot key={index} slot={slot} isLast={index === afternoonSlots.length - 1} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
