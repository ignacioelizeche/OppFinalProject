"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarView } from "@/components/calendar/calendar-view"
import { EventDetails } from "@/components/calendar/event-details"
import { EventForm } from "@/components/calendar/event-form"
import { MobileEventForm } from "@/components/calendar/mobile-event-form"
import { MinimalistCalendarFilters } from "@/components/calendar/minimalist-calendar-filters"
import { calendarAPI } from "@/lib/realApi"
import type { CalendarEvent, CalendarFilter } from "@/lib/types"
import { Plus, CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  // State management
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [filters, setFilters] = useState<CalendarFilter>({
    eventTypes: [],
    priorities: [],
    tags: [],
    instructors: [],
  })

  // Hooks
  const isMobile = useIsMobile()
  const { toast } = useToast()

  // Load events with date range and filters
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      const now = new Date()
      const threeMonthsLater = new Date()
      threeMonthsLater.setMonth(now.getMonth() + 3)

      const fetchedEvents = await calendarAPI.getEvents(now.toISOString(), threeMonthsLater.toISOString(), filters)
      setEvents(fetchedEvents)
    } catch (error) {
      console.error("Failed to load events:", error)
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  // Initial data loading
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Event handlers
  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventForm(true)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await calendarAPI.deleteEvent(eventId)
      setEvents(events.filter((e) => e.id !== eventId))
      setSelectedEvent(null)
      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    }
  }

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      let savedEvent: CalendarEvent

      if (editingEvent) {
        // Update existing event
        savedEvent = await calendarAPI.updateEvent(editingEvent.id, eventData)
        setEvents(events.map((e) => (e.id === editingEvent.id ? savedEvent : e)))
        toast({
          title: "Success",
          description: "Event updated successfully",
        })
      } else {
        // Create new event with defaults
        const completeEventData = {
          title: eventData.title || "New Event",
          description: eventData.description || "",
          eventType: eventData.eventType || "work",
          startTime: eventData.startTime || new Date().toISOString(),
          endTime: eventData.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          isAllDay: eventData.isAllDay || false,
          isRecurring: eventData.isRecurring || false,
          recurrencePattern: eventData.recurrencePattern,
          recurrenceEnd: eventData.recurrenceEnd,
          attendees: eventData.attendees || [],
          priority: eventData.priority || "medium",
          color: eventData.color || "var(--accent-blue)",
          tags: eventData.tags || [],
          googleCalendarId: eventData.googleCalendarId,
          createdBy: 1, // Default user ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...eventData,
        } as Omit<CalendarEvent, "id">

        savedEvent = await calendarAPI.createEvent(completeEventData)
        setEvents((prevEvents) => [...prevEvents, savedEvent])
        toast({
          title: "Success",
          description: "Event created successfully",
        })
      }

      setShowEventForm(false)
      setEditingEvent(null)
    } catch (error) {
      console.error("Failed to save event:", error)
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      })
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  // Filter handlers
  const handleEventTypesChange = (types: string[]) => {
    setSelectedEventTypes(types)
    setFilters((prev) => ({ ...prev, eventTypes: types }))
  }

  const handlePrioritiesChange = (priorities: string[]) => {
    setSelectedPriorities(priorities)
    setFilters((prev) => ({ ...prev, priorities }))
  }

  const handleClearFilters = () => {
    setSelectedEventTypes([])
    setSelectedPriorities([])
    setFilters({
      eventTypes: [],
      priorities: [],
      tags: [],
      instructors: [],
    })
  }

  const handleDateClick = (date: Date) => {
    // Create a new event on the selected date
    const startTime = new Date(date)
    startTime.setHours(9, 0, 0, 0) // Default to 9 AM

    const endTime = new Date(startTime)
    endTime.setHours(10, 0, 0, 0) // Default 1 hour duration

    setEditingEvent(null)
    setShowEventForm(true)

    // Pre-populate the form with the selected date
    handleSaveEvent({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      title: "",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fadeInUp">
      {/* Header with improved layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-[var(--accent-white)]" />
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-gray-400">Manage your schedule, assignments, and important dates</p>
          </div>
        </div>
        <button className="button-primary flex items-center" onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </button>
      </div>

      {/* Filters with custom styling */}
      <div className="card p-4 mb-6">
        <MinimalistCalendarFilters
          selectedEventTypes={selectedEventTypes}
          selectedPriorities={selectedPriorities}
          onEventTypesChange={handleEventTypesChange}
          onPrioritiesChange={handlePrioritiesChange}
          onClearFilters={handleClearFilters}
          compact={isMobile}
        />
      </div>

      {/* Calendar View with loading state */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <div className="h-8 w-full bg-[#151515] rounded-md animate-pulse"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 w-full bg-[#151515] rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <CalendarView events={events} onEventClick={handleEventClick} onDateClick={handleDateClick} />
        )}
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-[#111] border-[#222] rounded-[1.25rem] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventDetails
              event={selectedEvent}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Event Form Dialog */}
      <Dialog
        open={showEventForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowEventForm(false)
            setEditingEvent(null)
          }
        }}
      >
        <DialogContent
          className={cn("bg-[#111] border-[#222] rounded-[1.25rem] max-w-2xl", isMobile && "h-[90vh] p-0 max-w-[95vw]")}
        >
          <DialogHeader className={cn(isMobile && "hidden")}>
            <DialogTitle className="text-xl">{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          {isMobile ? (
            <MobileEventForm
              event={editingEvent || undefined}
              onSave={handleSaveEvent}
              onCancel={() => {
                setShowEventForm(false)
                setEditingEvent(null)
              }}
              isLoading={loading}
            />
          ) : (
            <EventForm
              event={editingEvent || undefined}
              onSave={handleSaveEvent}
              onCancel={() => {
                setShowEventForm(false)
                setEditingEvent(null)
              }}
              isLoading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
