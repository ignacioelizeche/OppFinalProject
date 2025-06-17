"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Filter, X } from "lucide-react"

interface CalendarFiltersProps {
  selectedEventTypes: string[]
  selectedPriorities: string[]
  onEventTypesChange: (types: string[]) => void
  onPrioritiesChange: (priorities: string[]) => void
  onClearFilters: () => void
  className?: string
}

const EVENT_TYPES = [
  { value: "lecture", label: "Lectures", color: "bg-blue-100 text-blue-800" },
  { value: "assignment", label: "Assignments", color: "bg-red-100 text-red-800" },
  { value: "exam", label: "Exams", color: "bg-purple-100 text-purple-800" },
  { value: "study-group", label: "Study Groups", color: "bg-green-100 text-green-800" },
  { value: "office-hours", label: "Office Hours", color: "bg-yellow-100 text-yellow-800" }
]

const PRIORITIES = [
  { value: "urgent", label: "Urgent", color: "bg-red-500 text-white" },
  { value: "high", label: "High", color: "bg-orange-500 text-white" },
  { value: "medium", label: "Medium", color: "bg-blue-500 text-white" },
  { value: "low", label: "Low", color: "bg-green-500 text-white" }
]

export function CalendarFilters({
  selectedEventTypes,
  selectedPriorities,
  onEventTypesChange,
  onPrioritiesChange,
  onClearFilters,
  className
}: CalendarFiltersProps) {
  const handleEventTypeChange = (eventType: string, checked: boolean) => {
    if (checked) {
      onEventTypesChange([...selectedEventTypes, eventType])
    } else {
      onEventTypesChange(selectedEventTypes.filter(type => type !== eventType))
    }
  }

  const handlePriorityChange = (priority: string, checked: boolean) => {
    if (checked) {
      onPrioritiesChange([...selectedPriorities, priority])
    } else {
      onPrioritiesChange(selectedPriorities.filter(p => p !== priority))
    }
  }

  const hasActiveFilters = selectedEventTypes.length > 0 || selectedPriorities.length > 0

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-1">
              {selectedEventTypes.map(type => {
                const eventType = EVENT_TYPES.find(et => et.value === type)
                return (
                  <Badge key={type} variant="secondary" className={eventType?.color}>
                    {eventType?.label}
                  </Badge>
                )
              })}
              {selectedPriorities.map(priority => {
                const priorityInfo = PRIORITIES.find(p => p.value === priority)
                return (
                  <Badge key={priority} className={priorityInfo?.color}>
                    {priorityInfo?.label}
                  </Badge>
                )
              })}
            </div>
            <Separator />
          </div>
        )}

        {/* Event Types */}
        <div>
          <h4 className="text-sm font-medium mb-3">Event Types</h4>
          <div className="space-y-2">
            {EVENT_TYPES.map(eventType => (
              <div key={eventType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`eventType-${eventType.value}`}
                  checked={selectedEventTypes.includes(eventType.value)}
                  onCheckedChange={(checked) => 
                    handleEventTypeChange(eventType.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`eventType-${eventType.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {eventType.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Priorities */}
        <div>
          <h4 className="text-sm font-medium mb-3">Priorities</h4>
          <div className="space-y-2">
            {PRIORITIES.map(priority => (
              <div key={priority.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority.value}`}
                  checked={selectedPriorities.includes(priority.value)}
                  onCheckedChange={(checked) => 
                    handlePriorityChange(priority.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`priority-${priority.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {priority.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <Separator />
        <div>
          <h4 className="text-sm font-medium mb-3">Quick Filters</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onEventTypesChange(["assignment", "exam"])}
            >
              📚 Academic Deadlines
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onEventTypesChange(["lecture", "office-hours"])}
            >
              🎓 Classes & Office Hours
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onPrioritiesChange(["urgent", "high"])}
            >
              ⚡ High Priority
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
