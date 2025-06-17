"use client"

import React, { useState, useEffect } from "react"
import { CalendarEvent } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Bell, Users, Tag } from "lucide-react"
import { format } from "date-fns"

interface EventFormProps {
  event?: CalendarEvent
  onSave: (eventData: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt" | "createdBy">) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

export function EventForm({ event, onSave, onCancel, isLoading, className }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "lecture",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endDate: format(new Date(), "yyyy-MM-dd"),
    endTime: "10:00",
    location: "",
    instructor: "",
    isAllDay: false,
    isRecurring: false,
    recurrencePattern: "weekly",
    priority: "medium",
    color: "#3b82f6",
    notificationEnabled: true,
    notificationMinutes: [15],
    tags: [] as string[],
    attendees: [] as string[]
  })

  const [newTag, setNewTag] = useState("")
  const [newAttendee, setNewAttendee] = useState("")
  const [newNotification, setNewNotification] = useState("")

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startTime)
      const endDate = new Date(event.endTime)
      
      setFormData({
        title: event.title,
        description: event.description || "",
        eventType: event.eventType,
        startDate: format(startDate, "yyyy-MM-dd"),
        startTime: format(startDate, "HH:mm"),
        endDate: format(endDate, "yyyy-MM-dd"),
        endTime: format(endDate, "HH:mm"),
        location: event.location || "",
        instructor: event.instructor || "",
        isAllDay: event.isAllDay,
        isRecurring: event.isRecurring,
        recurrencePattern: event.recurrencePattern || "weekly",
        priority: event.priority,
        color: event.color || "#3b82f6",
        notificationEnabled: event.notificationEnabled,
        notificationMinutes: event.notificationMinutes || [],
        tags: event.tags || [],
        attendees: event.attendees || []
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
    
    const eventData = {
      title: formData.title,
      description: formData.description,
      eventType: formData.eventType as CalendarEvent["eventType"],
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      location: formData.location,
      instructor: formData.instructor,
      isAllDay: formData.isAllDay,
      isRecurring: formData.isRecurring,
      recurrencePattern: formData.recurrencePattern as CalendarEvent["recurrencePattern"],
      priority: formData.priority as CalendarEvent["priority"],
      color: formData.color,
      notificationEnabled: formData.notificationEnabled,
      notificationMinutes: formData.notificationMinutes,
      tags: formData.tags,
      attendees: formData.attendees
    }
    
    await onSave(eventData)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addAttendee = () => {
    if (newAttendee.trim() && !formData.attendees.includes(newAttendee.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()]
      }))
      setNewAttendee("")
    }
  }

  const removeAttendee = (attendee: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== attendee)
    }))
  }

  const addNotification = () => {
    const minutes = parseInt(newNotification)
    if (!isNaN(minutes) && minutes > 0 && !formData.notificationMinutes.includes(minutes)) {
      setFormData(prev => ({
        ...prev,
        notificationMinutes: [...prev.notificationMinutes, minutes].sort((a, b) => a - b)
      }))
      setNewNotification("")
    }
  }

  const removeNotification = (minutes: number) => {
    setFormData(prev => ({
      ...prev,
      notificationMinutes: prev.notificationMinutes.filter(m => m !== minutes)
    }))
  }

  const formatNotificationTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
    return `${Math.floor(minutes / 1440)}d`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{event ? "Edit Event" : "Create New Event"}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="study-group">Study Group</SelectItem>
                    <SelectItem value="office-hours">Office Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={formData.isAllDay}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAllDay: checked }))}
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              {!formData.isAllDay && (
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>

              {!formData.isAllDay && (
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
