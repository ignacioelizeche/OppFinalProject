"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { calendarAPI } from "@/lib/api"
import type { CalendarEvent } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { useAuth } from "@/contexts/auth-context"

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Form state for creating a new event
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "lecture",
    startDate: new Date(),
    startTime: "09:00",
    endDate: new Date(),
    endTime: "10:00",
  })

  useEffect(() => {
    fetchEvents()
  }, [currentMonth])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const start = startOfMonth(currentMonth).toISOString()
      const end = endOfMonth(currentMonth).toISOString()

      const data = await calendarAPI.getEvents(start, end)
      setEvents(data)
    } catch (error) {
      console.error("Failed to fetch events:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load calendar events. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1))
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const startDateTime = `${format(newEvent.startDate, "yyyy-MM-dd")}T${newEvent.startTime}:00`
      const endDateTime = `${format(newEvent.endDate, "yyyy-MM-dd")}T${newEvent.endTime}:00`

      await calendarAPI.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        eventType: newEvent.eventType,
        startTime: startDateTime,
        endTime: endDateTime,
      })

      toast({
        title: "Event created",
        description: "Your event has been successfully created.",
      })

      setIsDialogOpen(false)
      fetchEvents()

      // Reset form
      setNewEvent({
        title: "",
        description: "",
        eventType: "lecture",
        startDate: new Date(),
        startTime: "09:00",
        endDate: new Date(),
        endTime: "10:00",
      })
    } catch (error) {
      console.error("Failed to create event:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the event. Please try again.",
      })
    }
  }

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  events.forEach((event) => {
    const date = format(parseISO(event.startTime), "yyyy-MM-dd")
    if (!eventsByDate[date]) {
      eventsByDate[date] = []
    }
    eventsByDate[date].push(event)
  })

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = startOfMonth(currentMonth)
    const lastDayOfMonth = endOfMonth(currentMonth)

    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay()

    // Calculate total days in the month
    const daysInMonth = lastDayOfMonth.getDate()

    // Create array for all days in the month
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      days.push(date)
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        {user?.role === "teacher" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateEvent}>
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>Fill in the details to create a new calendar event.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select
                      value={newEvent.eventType}
                      onValueChange={(value) => setNewEvent({ ...newEvent, eventType: value })}
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lecture">Lecture</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={format(newEvent.startDate, "yyyy-MM-dd")}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            startDate: e.target.value ? new Date(e.target.value) : new Date(),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={format(newEvent.endDate, "yyyy-MM-dd")}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            endDate: e.target.value ? new Date(e.target.value) : new Date(),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Event</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <span className="sr-only">Previous month</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <span className="sr-only">Next month</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-md bg-muted"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square p-1 ${
                      !day
                        ? "bg-transparent"
                        : day && eventsByDate[format(day, "yyyy-MM-dd")]
                          ? "bg-primary/10 font-bold"
                          : ""
                    } rounded-md border text-center`}
                  >
                    {day && (
                      <>
                        <div className="text-sm">{format(day, "d")}</div>
                        {eventsByDate[format(day, "yyyy-MM-dd")] && (
                          <div className="mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mx-auto"></div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>Events for {format(currentMonth, "MMMM yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-md bg-muted"></div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(eventsByDate)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([date, dayEvents]) => (
                  <div key={date} className="space-y-2">
                    <h3 className="font-medium">{format(parseISO(date), "EEEE, MMMM d, yyyy")}</h3>
                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex cursor-pointer items-center justify-between rounded-md border p-3 hover:bg-accent"
                          onClick={() => handleEventClick(event)}
                        >
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(event.startTime), "h:mm a")} -{" "}
                              {format(parseISO(event.endTime), "h:mm a")}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            <span
                              className={`px-2 py-1 rounded-full ${
                                event.eventType === "lecture"
                                  ? "bg-blue-100 text-blue-800"
                                  : event.eventType === "exam"
                                    ? "bg-red-100 text-red-800"
                                    : event.eventType === "workshop"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {event.eventType}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No events found</h3>
              <p className="text-muted-foreground">There are no events scheduled for this month.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selectedEvent.eventType === "lecture"
                      ? "bg-blue-100 text-blue-800"
                      : selectedEvent.eventType === "exam"
                        ? "bg-red-100 text-red-800"
                        : selectedEvent.eventType === "workshop"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedEvent.eventType}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Date & Time</h4>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedEvent.startTime), "EEEE, MMMM d, yyyy")}
                  <br />
                  {format(parseISO(selectedEvent.startTime), "h:mm a")} -{" "}
                  {format(parseISO(selectedEvent.endTime), "h:mm a")}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.description || "No description provided."}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

