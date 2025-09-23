"use client"

import { useState } from "react"
import { format, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CalendarHeaderProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  view: "day" | "week" | "month"
  setView: (view: "day" | "week" | "month") => void
  handleCreate?: () => void
}

export function CalendarHeader({ currentDate, setCurrentDate, view, setView, handleCreate }: CalendarHeaderProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subDays(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setCurrentDate(selectedDate)
    }
  }

  // Hiển thị tiêu đề phù hợp với chế độ xem
  const renderTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: vi })
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      return `${format(startOfWeek, "dd/MM", { locale: vi })} - ${format(endOfWeek, "dd/MM/yyyy", { locale: vi })}`
    } else {
      return format(currentDate, "EEEE, dd MMMM yyyy", { locale: vi })
    }
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{renderTitle()}</h2>
        </div>
        {
          handleCreate && (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button className="gap-2" onClick={() => {
            handleCreate()
          }}>
            <Plus className="h-4 w-4" />
            <span>Thêm lịch hẹn</span>
          </Button>
        </div>
          )
        }
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Tabs
            value={view}
            className="w-full sm:w-auto"
            onValueChange={(value: string) => setView(value as "day" | "week" | "month")}
          >
            <TabsList>
              <TabsTrigger value="day">Ngày</TabsTrigger>
              <TabsTrigger value="week">Tuần</TabsTrigger>
              <TabsTrigger value="month">Tháng</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Trước</span>
          </Button>
          <Button variant="outline" size="sm"  onClick={handleNext}>
            <span className="hidden sm:inline">Tiếp</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
        <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Chọn ngày</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon">
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
