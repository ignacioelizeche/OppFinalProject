"use client"

import React, { useState, useEffect } from "react"
import { CalendarEvent } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Clock, MapPin, Bell, Check, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface MobileEventFormProps {
  event?: CalendarEvent
  onSave: (eventData: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt" | "createdBy">) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

interface FormStep {
  id: string
  title: string
  icon: React.ReactNode
  required?: boolean
}

const FORM_STEPS: FormStep[] = [
  { id: "basics", title: "Event Details", icon: <Clock className="h-4 w-4" />, required: true },
  { id: "timing", title: "Date & Time", icon: <Clock className="h-4 w-4" />, required: true },
  { id: "location", title: "Location & People", icon: <MapPin className="h-4 w-4" /> },
  { id: "options", title: "Options", icon: <Bell className="h-4 w-4" /> }
]

export function MobileEventForm({ event, onSave, onCancel, isLoading, className }: MobileEventFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
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
    priority: "medium",
    color: "#3b82f6",
    notificationEnabled: true,
    notificationMinutes: [15]
  })

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

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
        priority: event.priority,
        color: event.color || "#3b82f6",
        notificationEnabled: event.notificationEnabled,
        notificationMinutes: event.notificationMinutes || [15]
      })
    }
  }, [event])

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
    if (isRightSwipe && currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    const step = FORM_STEPS[currentStep]
    if (!step.required) return true

    switch (step.id) {
      case "basics":
        return formData.title.trim() !== ""
      case "timing":
        return formData.startDate && formData.startTime && formData.endDate && formData.endTime
      default:
        return true
    }
  }

  const handleSubmit = async () => {
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
      isRecurring: false,
      recurrencePattern: undefined,
      priority: formData.priority as CalendarEvent["priority"],
      color: formData.color,
      notificationEnabled: formData.notificationEnabled,
      notificationMinutes: formData.notificationMinutes,
      tags: [],
      attendees: []
    }
    
    await onSave(eventData)
  }

  const renderStepContent = () => {
    const step = FORM_STEPS[currentStep]

    switch (step.id) {
      case "basics":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="study-group">Study Group</SelectItem>
                  <SelectItem value="office-hours">Office Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add event description (optional)"
                className="text-base min-h-[80px]"
              />
            </div>
          </div>
        )

      case "timing":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "location":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location (optional)"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor/Organizer</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                placeholder="Enter instructor name (optional)"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Event Color</Label>
              <div className="flex gap-2">
                {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#f97316"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 border-transparent",
                      formData.color === color && "border-gray-400"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>
        )

      case "options":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <input
                id="notifications"
                type="checkbox"
                checked={formData.notificationEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, notificationEnabled: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>

            {formData.notificationEnabled && (
              <div className="space-y-2">
                <Label>Notification Time</Label>
                <Select 
                  value={formData.notificationMinutes[0]?.toString() || "15"} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, notificationMinutes: [parseInt(value)] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Event Summary</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Title:</strong> {formData.title || "Untitled Event"}</p>
                <p><strong>Type:</strong> {formData.eventType}</p>
                <p><strong>Date:</strong> {formData.startDate}</p>
                <p><strong>Time:</strong> {formData.startTime} - {formData.endTime}</p>
                {formData.location && <p><strong>Location:</strong> {formData.location}</p>}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Progress indicator */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{FORM_STEPS[currentStep].title}</h2>
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {FORM_STEPS.length}
          </span>
        </div>
        
        <div className="flex gap-1">
          {FORM_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div 
        className="flex-1 p-4 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              {FORM_STEPS[currentStep].icon}
              <CardTitle className="text-base">{FORM_STEPS[currentStep].title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Swipe hint */}
        <div className="text-center text-xs text-muted-foreground mt-4">
          Swipe left/right or use buttons to navigate
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t bg-background">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          {currentStep === FORM_STEPS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isLoading || !canProceed()}>
              <Check className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Event"}
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
