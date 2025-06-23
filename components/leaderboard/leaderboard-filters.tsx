"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Trophy, TrendingUp, Calendar } from "lucide-react"

interface LeaderboardFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  period: 'daily' | 'weekly' | 'monthly' | 'all-time'
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly' | 'all-time') => void
  limit: number
  onLimitChange: (limit: number) => void
  showOnlyActive?: boolean
  onActiveToggle?: (active: boolean) => void
}

export default function LeaderboardFilters({
  searchTerm,
  onSearchChange,
  period,
  onPeriodChange,
  limit,
  onLimitChange,
  showOnlyActive = false,
  onActiveToggle
}: LeaderboardFiltersProps) {
  const periods = [
    { value: 'all-time', label: 'All Time', icon: Trophy },
    { value: 'monthly', label: 'This Month', icon: Calendar },
    { value: 'weekly', label: 'This Week', icon: TrendingUp },
    { value: 'daily', label: 'Today', icon: Calendar }
  ] as const

  const limits = [10, 25, 50, 100]

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by username..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Period Filter */}
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => {
              const Icon = p.icon
              return (
                <SelectItem key={p.value} value={p.value}>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{p.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* Limit Filter */}
        <Select value={limit.toString()} onValueChange={(value) => onLimitChange(Number(value))}>
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            {limits.map((l) => (
              <SelectItem key={l} value={l.toString()}>
                Top {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Badges and Options */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Current Period Badge */}
        <Badge variant="secondary" className="flex items-center space-x-1">
          {periods.find(p => p.value === period)?.icon && 
            React.createElement(periods.find(p => p.value === period)!.icon, { className: "h-3 w-3" })
          }
          <span>{periods.find(p => p.value === period)?.label}</span>
        </Badge>

        {/* Active Users Toggle */}
        {onActiveToggle && (
          <Button
            variant={showOnlyActive ? "default" : "outline"}
            size="sm"
            onClick={() => onActiveToggle(!showOnlyActive)}
            className="flex items-center space-x-1"
          >
            <Users className="h-3 w-3" />
            <span>Active Only</span>
          </Button>
        )}

        {/* Search Badge */}
        {searchTerm && (
          <Badge variant="outline" className="flex items-center space-x-1">
            <Search className="h-3 w-3" />
            <span>&quot;{searchTerm}&quot;</span>
            <button
              onClick={() => onSearchChange("")}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              ×
            </button>
          </Badge>
        )}

        {/* Results Count Info */}
        <div className="ml-auto text-sm text-muted-foreground">
          Showing top {limit} users
        </div>
      </div>
    </div>
  )
}
