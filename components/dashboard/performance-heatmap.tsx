"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PerformanceHeatmapProps {
  dates: string[]
  activities: number[]
}

const getActivityColor = (level: number): string => {
  switch (level) {
    case 0: return "bg-gray-100 dark:bg-gray-800"
    case 1: return "bg-green-200 dark:bg-green-900"
    case 2: return "bg-green-300 dark:bg-green-700"
    case 3: return "bg-green-400 dark:bg-green-600"
    case 4: return "bg-green-500 dark:bg-green-500"
    default: return "bg-gray-100 dark:bg-gray-800"
  }
}

const getActivityLabel = (level: number): string => {
  switch (level) {
    case 0: return "No activity"
    case 1: return "Low activity"
    case 2: return "Medium activity"
    case 3: return "High activity"
    case 4: return "Very high activity"
    default: return "No activity"
  }
}

export function PerformanceHeatmap({ dates, activities }: PerformanceHeatmapProps) {
  const weekData = useMemo(() => {
    const weeks: Array<Array<{ date: string; activity: number; dayOfWeek: number }>> = []
    let currentWeek: Array<{ date: string; activity: number; dayOfWeek: number }> = []

    dates.forEach((date, index) => {
      const dayOfWeek = new Date(date).getDay()
      
      // If it's Sunday and we have items in current week, start a new week
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      
      currentWeek.push({
        date,
        activity: activities[index],
        dayOfWeek
      })
    })
    
    // Add the last week if it has items
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }, [dates, activities])

  const totalActivity = activities.reduce((sum, activity) => sum + activity, 0)
  const averageActivity = totalActivity / activities.length

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Performance Heatmap</CardTitle>
        <CardDescription>
          Your activity over the last {dates.length} days (Avg: {averageActivity.toFixed(1)})
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <TooltipProvider>
          <div className="space-y-1">
            <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            
            {weekData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = week.find(day => day.dayOfWeek === dayIndex)
                  
                  if (!dayData) {
                    return <div key={dayIndex} className="w-3 h-3"></div>
                  }
                  
                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-colors hover:opacity-75 ${getActivityColor(dayData.activity)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(dayData.date).toLocaleDateString()}
                          </div>
                          <div>{getActivityLabel(dayData.activity)}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground">Less</div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-sm ${getActivityColor(level)}`}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">More</div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
