"use client"

import type { CalendarEvent } from "@/lib/types"
import { formatDate, formatTime } from "@/lib/utils"
import { Clock, Users, Tag, Edit, Trash2 } from "lucide-react"

interface EventDetailsProps {
  event: CalendarEvent
  onEdit: (event: CalendarEvent) => void
  onDelete: (eventId: number) => void
  onClose: () => void
}

export function EventDetails({ event, onEdit, onDelete, onClose }: EventDetailsProps) {
  // Format dates for display
  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)

  const formattedDate = formatDate(startDate)
  const formattedTime = `${formatTime(startDate)} - ${formatTime(endDate)}`

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

  // Get priority label
  const getPriorityLabel = (priority: string): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Event header with title and priority */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{event.title}</h2>
          <div className="flex items-center mt-2">
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getPriorityColor(event.priority) }}
            ></span>
            <span className="text-sm text-gray-400">{getPriorityLabel(event.priority)} Priority</span>
          </div>
        </div>
      </div>

      {/* Event details */}
      <div className="space-y-4 bg-[#151515] p-4 rounded-xl">
        {/* Date and time */}
        <div className="flex items-start">
          <Clock className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
          <div>
            <div className="font-medium">{formattedDate}</div>
            <div className="text-sm text-gray-400">{formattedTime}</div>
            {event.isAllDay && <div className="text-sm text-gray-400">All day</div>}
          </div>
        </div>

        {/* Attendees if available */}
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-start">
            <Users className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium">Attendees</div>
              <div className="text-sm text-gray-400">{event.attendees.join(", ")}</div>
            </div>
          </div>
        )}

        {/* Tags if available */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex items-start">
            <Tag className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-[#222] rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description if available */}
      {event.description && (
        <div>
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <div className="text-gray-300 whitespace-pre-wrap bg-[#151515] p-4 rounded-xl">{event.description}</div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={() => onDelete(event.id)}
          className="flex items-center px-4 py-2 bg-[#151515] hover:bg-[#222] rounded-full transition-all text-[var(--accent-red)]"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </button>
        <button onClick={() => onEdit(event)} className="button-primary">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </button>
      </div>
    </div>
  )
}
