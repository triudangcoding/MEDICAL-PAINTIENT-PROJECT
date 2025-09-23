"use client"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CalendarEvent } from "@/lib/calendarEvents"

interface WeekViewProps {
  selectedDate: Date
  events?: CalendarEvent[]
  onSelectDay: (date: Date) => void
}

export function WeekView({ selectedDate, events = [], onSelectDay }: WeekViewProps) {
  // Lấy ngày đầu tuần (Chủ Nhật)
  const startDay = startOfWeek(selectedDate)

  // Tạo mảng 7 ngày trong tuần
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDay, i))

  // Các khung giờ từ 7:00-11:00 (sáng) và 13:00-18:00 (chiều)
  const timeSlots = [
    // Buổi sáng: 7:00 - 11:00 (9 slots của 30 phút)
    ...Array.from({ length: 9 }, (_, i) => {
      const hour = Math.floor(i / 2) + 7
      const minute = (i % 2) * 30
      return {
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        period: 'morning' as const
      }
    }),
    // Buổi chiều: 13:00 - 18:00 (11 slots của 30 phút)
    ...Array.from({ length: 11 }, (_, i) => {
      const hour = Math.floor(i / 2) + 13
      const minute = (i % 2) * 30
      return {
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        period: 'afternoon' as const
      }
    })
  ]

  // Dùng events prop truyền vào
  const allEvents = events

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header với các ngày trong tuần */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1">
              <div className="h-16"></div>
              {weekDays.map((day, index) => {
                const isToday = isSameDay(day, new Date())
                return (
                  <div
                    key={index}
                    className={cn(
                      "h-16 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded-md",
                      isToday ? "bg-blue-50" : "",
                    )}
                    onClick={() => onSelectDay(day)}
                  >
                    <div className="text-sm font-medium">{format(day, "EEEE", { locale: vi })}</div>
                    <div
                      className={cn(
                        "text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full",
                        isToday ? "bg-primary text-white" : "",
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Lịch theo giờ */}
            <div className="mt-4 relative">
              {/* Grid cho time slots */}
              <div className="relative">
                {timeSlots.map((timeSlot, timeIndex) => (
                  <div key={timeIndex}>
                    <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1">
                      {/* Cột giờ */}
                      <div className={cn(
                        "text-sm text-muted-foreground py-1 text-right pr-4 h-8 font-medium",
                        timeSlot.period === 'morning' ? "text-amber-600" : "text-blue-600"
                      )}>
                        {timeSlot.time}
                        <span className="text-xs ml-1 opacity-70">
                          {timeSlot.period === 'morning' ? 'S' : 'C'}
                        </span>
                      </div>

                      {/* Các ô cho từng ngày */}
                      {weekDays.map((day, dayIndex) => {
                        const isCurrentHour =
                          new Date().getHours() === Number.parseInt(timeSlot.time.split(":")[0]) && 
                          isSameDay(day, new Date())

                        return (
                          <div key={dayIndex} className={cn(
                            "border h-8 relative",
                            isCurrentHour ? "bg-blue-50" : "",
                            timeSlot.period === 'morning' 
                              ? "bg-gradient-to-r from-amber-50/30 to-amber-50/10 border-amber-200/50 hover:bg-amber-50/50" 
                              : "bg-gradient-to-r from-blue-50/30 to-blue-50/10 border-blue-200/50 hover:bg-blue-50/50"
                          )}>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Khoảng nghỉ trưa giữa buổi sáng và chiều */}
                    {timeSlot.time === '11:00' && (
                      <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 my-2">
                        <div className="flex items-center justify-center text-xs text-gray-500 font-medium bg-gray-100 rounded-l-md py-2">
                          <span className="transform whitespace-nowrap">Nghỉ trưa</span>
                        </div>
                        {weekDays.map((_, dayIndex) => (
                          <div 
                            key={dayIndex} 
                            className="bg-gray-100 border-dashed border-2 border-gray-300 rounded-sm flex items-center justify-center py-2"
                          >
                            <span className="text-xs text-gray-400">11:00 - 13:00</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Layer riêng cho events để có thể span qua nhiều time slots */}
              <div className="absolute top-0 left-0 right-0 pointer-events-none">
                <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 h-full">
                  <div></div> {/* Cột giờ trống */}
                  {weekDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="relative pointer-events-auto">
                      {/* Hiển thị tất cả events bắt đầu trong ngày này */}
                      {allEvents
                        .filter(event => {
                          const eventStart = new Date(event.start)
                          const eventDay = new Date(eventStart).setHours(0, 0, 0, 0)
                          const currentDay = new Date(day).setHours(0, 0, 0, 0)
                          return eventDay === currentDay
                        })
                        .map((event, eventIndex) => {
                          const eventStart = new Date(event.start)
                          
                          // Tính vị trí top dựa trên giờ và phút bắt đầu (linh động với mọi phút 0-60)
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
                          
                          // Tính vị trí chính xác dựa trên phút đã làm tròn
                          // Mỗi 30 phút = 1 time slot = 32px (h-8)
                          let baseTimeSlotIndex = 0
                          let offsetWithinSlot = 0
                          
                          if (roundedHour >= 7 && roundedHour <= 11) {
                            // Buổi sáng: 7h-11:00 (9 slots)
                            baseTimeSlotIndex = (roundedHour - 7) * 2
                            if (roundedMinute === 0) {
                              offsetWithinSlot = 0
                            } else if (roundedMinute === 15) {
                              offsetWithinSlot = 16 // Giữa ô 30 phút
                            } else if (roundedMinute === 30) {
                              baseTimeSlotIndex += 1
                              offsetWithinSlot = 0
                            } else if (roundedMinute === 45) {
                              baseTimeSlotIndex += 1
                              offsetWithinSlot = 16 // Giữa ô 30 phút
                            }
                          } else if (roundedHour >= 13 && roundedHour <= 18) {
                            // Buổi chiều: 13h-18h (bắt đầu sau 9 slots buổi sáng + khoảng nghỉ trưa)
                            baseTimeSlotIndex = 9 + (roundedHour - 13) * 2
                            if (roundedMinute === 0) {
                              offsetWithinSlot = 0
                            } else if (roundedMinute === 15) {
                              offsetWithinSlot = 16 // Giữa ô 30 phút
                            } else if (roundedMinute === 30) {
                              baseTimeSlotIndex += 1
                              offsetWithinSlot = 0
                            } else if (roundedMinute === 45) {
                              baseTimeSlotIndex += 1
                              offsetWithinSlot = 16 // Giữa ô 30 phút
                            }
                          } else {
                            // Ngoài khung giờ, không hiển thị
                            return null
                          }
                          
                          // Thêm offset cho khoảng nghỉ trưa nếu event ở buổi chiều
                          const lunchBreakOffset = roundedHour >= 13 ? 48 : 0 // 48px cho khoảng nghỉ trưa
                          const topPosition = baseTimeSlotIndex * 32 + offsetWithinSlot + lunchBreakOffset
                          
                          // Chiều cao luôn là 30 phút = 60px
                          const height = 60
                          
                          // Tính số sự kiện trong cùng vị trí (cùng baseTimeSlotIndex và offsetWithinSlot)
                          const eventsInSameSlot = allEvents.filter(otherEvent => {
                            const otherStart = new Date(otherEvent.start)
                            const otherDay = new Date(otherStart).setHours(0, 0, 0, 0)
                            const currentDay = new Date(day).setHours(0, 0, 0, 0)
                            
                            if (otherDay !== currentDay) return false
                            
                            const otherHour = otherStart.getHours()
                            const otherMinute = otherStart.getMinutes()
                            
                            // Làm tròn phút và giờ của sự kiện khác
                            let otherRoundedHour = otherHour
                            let otherRoundedMinute = 0
                            
                            if (otherMinute < 7) {
                              otherRoundedMinute = 0
                            } else if (otherMinute < 22) {
                              otherRoundedMinute = 15
                            } else if (otherMinute < 37) {
                              otherRoundedMinute = 30
                            } else if (otherMinute < 52) {
                              otherRoundedMinute = 45
                            } else {
                              // Làm tròn lên giờ tiếp theo
                              otherRoundedHour = otherHour + 1
                              otherRoundedMinute = 0
                            }
                            
                            // Tính baseTimeSlotIndex và offsetWithinSlot cho otherEvent
                            let otherBaseTimeSlotIndex = 0
                            let otherOffsetWithinSlot = 0
                            
                            if (otherRoundedHour >= 7 && otherRoundedHour <= 11) {
                              otherBaseTimeSlotIndex = (otherRoundedHour - 7) * 2
                              if (otherRoundedMinute === 0) {
                                otherOffsetWithinSlot = 0
                              } else if (otherRoundedMinute === 15) {
                                otherOffsetWithinSlot = 16
                              } else if (otherRoundedMinute === 30) {
                                otherBaseTimeSlotIndex += 1
                                otherOffsetWithinSlot = 0
                              } else if (otherRoundedMinute === 45) {
                                otherBaseTimeSlotIndex += 1
                                otherOffsetWithinSlot = 16
                              }
                            } else if (otherRoundedHour >= 13 && otherRoundedHour <= 18) {
                              otherBaseTimeSlotIndex = 9 + (otherRoundedHour - 13) * 2
                              if (otherRoundedMinute === 0) {
                                otherOffsetWithinSlot = 0
                              } else if (otherRoundedMinute === 15) {
                                otherOffsetWithinSlot = 16
                              } else if (otherRoundedMinute === 30) {
                                otherBaseTimeSlotIndex += 1
                                otherOffsetWithinSlot = 0
                              } else if (otherRoundedMinute === 45) {
                                otherBaseTimeSlotIndex += 1
                                otherOffsetWithinSlot = 16
                              }
                            }
                            
                            return otherBaseTimeSlotIndex === baseTimeSlotIndex && otherOffsetWithinSlot === offsetWithinSlot
                          })
                          
                          // Chỉ hiển thị sự kiện đầu tiên trong time slot
                          const isFirstInSlot = eventsInSameSlot.sort((a, b) =>
                            new Date(a.start).getTime() - new Date(b.start).getTime()
                          )[0]
                          
                          if (!isFirstInSlot) return null
                          
                          const remainingCount = eventsInSameSlot.length - 1

                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "absolute left-0 right-1 p-2 rounded-r-md shadow-sm overflow-hidden border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                                event.color === "blue" && "bg-blue-100 text-blue-800 border-blue-500",
                                event.color === "green" && "bg-green-100 text-green-800 border-green-500", 
                                event.color === "red" && "bg-red-100 text-red-800 border-red-500",
                              )}
                              style={{
                                top: `${topPosition}px`,
                                height: `${height}px`,
                                zIndex: 10 + eventIndex,
                              }}
                              title={`${event.title}\nThời gian: ${format(new Date(event.start), "HH:mm")} - ${format(new Date(event.end), "HH:mm")}\nTrạng thái: ${event.status === "PENDING" ? "Đang chờ" : event.status === "COMPLETED" ? "Hoàn thành" : "Đã hủy"} ${remainingCount > 0 ? `\n+${remainingCount} sự kiện khác` : ""}`}
                              onClick={() => onSelectDay(day)}
                            >
                              <div className="h-full flex flex-col justify-between">
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-[11px] leading-tight">{event.title}</h4>
                                    {/* <Badge variant="outline" className="text-[8px] ml-1 flex-shrink-0">
                                      {event.type === "PAID" ? "Có phí" : "Miễn phí"}
                                    </Badge> */}
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
                                  {remainingCount > 0 && (
                                    <Badge variant="outline" className="text-[8px] bg-orange-50 text-orange-700 border-orange-200">
                                      +{remainingCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
