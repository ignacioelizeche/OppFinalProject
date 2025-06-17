"use client"

import { useState, useEffect } from "react"
import type { CalendarEvent } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
}

export function CalendarView({ events, onEventClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])

  // Generate calendar days for the current month view
  useEffect(() => {
    const days: Date[] = []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const startDay = firstDay.getDay()

    // Add days from previous month to fill the first week
    for (let i = startDay; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i)
      days.push(prevMonthDay)
    }

    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Add days from next month to complete the last week
    const remainingDays = 42 - days.length // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }

    setCalendarDays(days)
  }, [currentDate])

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Format date for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return (
        eventStart.getDate() === date.getDate() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getFullYear() === date.getFullYear()
      )
    })
  }

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "urgent":
        return "var(--accent-red)"
      case "high":
        return "#FF9500"
      case "medium":
        return "var(--accent-blue)"
      case "low":
        return "#34C759"
      default:
        return "var(--accent-blue)"
    }
  }

  return (
    <div className="calendar-container">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-4 border-b border-[#222]">
        <div className="text-xl font-semibold">{formatMonthYear(currentDate)}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-[#151515] hover:bg-[#222] rounded-full transition-all"
          >
            Today
          </button>
          <button onClick={goToPreviousMonth} className="p-1 bg-[#151515] hover:bg-[#222] rounded-full transition-all">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={goToNextMonth} className="p-1 bg-[#151515] hover:bg-[#222] rounded-full transition-all">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center py-3 border-b border-[#222]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonthDay = isCurrentMonth(day)

          return (
            <div
              key={index}
              onClick={() => onDateClick(day)}
              className={cn(
                "min-h-[100px] p-1 border-b border-r border-[#222] relative cursor-pointer hover:bg-[#151515] transition-all",
                isToday(day) ? "bg-[#151515]" : "",
                !isCurrentMonthDay ? "opacity-40" : "",
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center",
                  isToday(day) ? "bg-[var(--accent-blue)] text-white" : "",
                )}
              >
                {day.getDate()}
              </div>

              {/* Events for this day */}
              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    className="text-xs p-1.5 rounded-md cursor-pointer truncate bg-[#151515] hover:bg-[#1a1a1a] transition-all"
                    style={{
                      borderLeft: `3px solid ${getPriorityColor(event.priority)}`,
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-center text-gray-400">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
