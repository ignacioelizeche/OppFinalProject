"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Target, TrendingUp } from "lucide-react"

interface WeeklyOverviewProps {
  weeklyProgress: {
    problemsSolved: number
    studyHours: number
    conceptsMastered: number
    targetProblems: number
    targetHours: number
    targetConcepts: number
  }
}

export function WeeklyOverview({ weeklyProgress }: WeeklyOverviewProps) {
  const progressItems = [
    {
      icon: BookOpen,
      label: "Problems Solved",
      current: weeklyProgress.problemsSolved,
      target: weeklyProgress.targetProblems,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Clock,
      label: "Study Hours",
      current: weeklyProgress.studyHours,
      target: weeklyProgress.targetHours,
      color: "text-green-600",
      bgColor: "bg-green-50",
      suffix: "h"
    },
    {
      icon: Target,
      label: "Concepts Mastered",
      current: weeklyProgress.conceptsMastered,
      target: weeklyProgress.targetConcepts,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  const overallProgress = 
    ((weeklyProgress.problemsSolved / weeklyProgress.targetProblems) +
     (weeklyProgress.studyHours / weeklyProgress.targetHours) +
     (weeklyProgress.conceptsMastered / weeklyProgress.targetConcepts)) / 3 * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Weekly Overview</CardTitle>
            <CardDescription>Your progress this week</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <Badge variant="secondary">
              {Math.round(overallProgress)}% Complete
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {progressItems.map((item, index) => {
          const percentage = Math.min((item.current / item.target) * 100, 100)
          const Icon = item.icon
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.current}{item.suffix || ""} / {item.target}{item.suffix || ""}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {Math.round(percentage)}% complete
              </div>
            </div>
          )
        })}
        
        {overallProgress >= 100 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Target className="w-4 h-4" />
              <span className="font-medium">Weekly goals completed! 🎉</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
