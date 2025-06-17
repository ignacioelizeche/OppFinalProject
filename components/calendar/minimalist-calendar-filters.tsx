"use client"

import { useState } from "react"
import { Check, X, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MinimalistCalendarFiltersProps {
  selectedEventTypes: string[]
  selectedPriorities: string[]
  onEventTypesChange: (types: string[]) => void
  onPrioritiesChange: (priorities: string[]) => void
  onClearFilters: () => void
  compact?: boolean
}

export function MinimalistCalendarFilters({
  selectedEventTypes,
  selectedPriorities,
  onEventTypesChange,
  onPrioritiesChange,
  onClearFilters,
  compact = false,
}: MinimalistCalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const eventTypes = [
    { value: "lecture", label: "Lecture" },
    { value: "assignment", label: "Assignment" },
    { value: "exam", label: "Exam" },
    { value: "review", label: "Review" },
    { value: "study-group", label: "Study Group" },
  ]

  const priorities = [
    { value: "urgent", label: "Urgent", color: "var(--accent-red)" },
    { value: "high", label: "High", color: "#FF9500" },
    { value: "medium", label: "Medium", color: "var(--accent-blue)" },
    { value: "low", label: "Low", color: "#34C759" },
  ]

  const toggleEventType = (type: string) => {
    if (selectedEventTypes.includes(type)) {
      onEventTypesChange(selectedEventTypes.filter((t) => t !== type))
    } else {
      onEventTypesChange([...selectedEventTypes, type])
    }
  }

  const togglePriority = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      onPrioritiesChange(selectedPriorities.filter((p) => p !== priority))
    } else {
      onPrioritiesChange([...selectedPriorities, priority])
    }
  }

  const hasActiveFilters = selectedEventTypes.length > 0 || selectedPriorities.length > 0

  return (
    <div className="space-y-4">
      {compact ? (
        <div className="flex items-center justify-between">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 bg-[#151515] hover:bg-[#222] rounded-full transition-all",
                  hasActiveFilters && "border border-[var(--accent-blue)]",
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 h-5 w-5 flex items-center justify-center bg-[var(--accent-blue)] text-white text-xs rounded-full">
                    {selectedEventTypes.length + selectedPriorities.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-[#111] border-[#222] rounded-xl">
              <DropdownMenuLabel>Event Types</DropdownMenuLabel>
              {eventTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  checked={selectedEventTypes.includes(type.value)}
                  onCheckedChange={() => toggleEventType(type.value)}
                  className="focus:bg-[#151515]"
                >
                  {type.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator className="bg-[#222]" />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {priorities.map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority.value}
                  checked={selectedPriorities.includes(priority.value)}
                  onCheckedChange={() => togglePriority(priority.value)}
                  className="focus:bg-[#151515]"
                >
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: priority.color }} />
                    {priority.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator className="bg-[#222]" />
                  <div className="px-2 py-1.5">
                    <button
                      className="w-full text-xs py-1.5 px-3 bg-[#151515] hover:bg-[#222] rounded-md transition-all"
                      onClick={() => {
                        onClearFilters()
                        setIsOpen(false)
                      }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center text-sm px-3 py-1.5 hover:bg-[#151515] rounded-full transition-all"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Event Types</h3>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type.value}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full flex items-center transition-all",
                    selectedEventTypes.includes(type.value)
                      ? "bg-[var(--accent-blue)] text-white"
                      : "bg-[#151515] hover:bg-[#222]",
                  )}
                  onClick={() => toggleEventType(type.value)}
                >
                  {selectedEventTypes.includes(type.value) && <Check className="h-3 w-3 mr-1" />}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 ml-6">
            <h3 className="text-sm font-medium">Priority Levels</h3>
            <div className="flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full flex items-center transition-all",
                    selectedPriorities.includes(priority.value) ? "text-white" : "bg-[#151515] hover:bg-[#222]",
                  )}
                  style={{
                    backgroundColor: selectedPriorities.includes(priority.value) ? priority.color : undefined,
                  }}
                  onClick={() => togglePriority(priority.value)}
                >
                  {selectedPriorities.includes(priority.value) && <Check className="h-3 w-3 mr-1" />}
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              className="flex items-center text-sm px-3 py-1.5 hover:bg-[#151515] rounded-full transition-all ml-auto self-end"
              onClick={onClearFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
