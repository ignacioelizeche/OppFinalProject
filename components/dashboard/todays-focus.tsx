"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarEvent, Problem, Goal } from "@/lib/types"
import { Calendar, BookOpen, Target, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { format, isToday, isTomorrow } from "date-fns"

interface TodaysFocusProps {
  upcomingDeadlines: CalendarEvent[]
  recommendedProblems: Problem[]
  activeGoals: Goal[]
}

export function TodaysFocus({ upcomingDeadlines, recommendedProblems, activeGoals }: TodaysFocusProps) {
  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM d")
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Today&apos;s Focus</CardTitle>
        <CardDescription>Your priorities for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Upcoming Deadlines */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium">Upcoming Deadlines</h3>
            </div>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-2">
                {upcomingDeadlines.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDeadline(event.startTime)}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.eventType}
                      </Badge>
                    </div>
                  </div>
                ))}
                {upcomingDeadlines.length > 3 && (
                  <Link href="/calendar">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No upcoming deadlines
              </div>
            )}
          </div>

          {/* Recommended Problems */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-600" />
              <h3 className="font-medium">Recommended Problems</h3>
            </div>
            {recommendedProblems.length > 0 ? (
              <div className="space-y-2">
                {recommendedProblems.slice(0, 3).map((problem) => (
                  <div key={problem.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{problem.title}</div>
                        <div className="text-xs text-muted-foreground">{problem.topic}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </Badge>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {problem.estimatedTime}m
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/problems">
                  <Button variant="ghost" size="sm" className="w-full">
                    Browse all problems <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No recommended problems
              </div>
            )}
          </div>

          {/* Active Goals */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              <h3 className="font-medium">Active Goals</h3>
            </div>
            {activeGoals.length > 0 ? (
              <div className="space-y-2">
                {activeGoals.slice(0, 3).map((goal) => {
                  const progress = getGoalProgress(goal)
                  return (
                    <div key={goal.id} className="p-3 rounded-lg border bg-card">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{goal.title}</div>
                          <Badge variant="outline" className="text-xs">
                            {goal.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {goal.currentValue} / {goal.targetValue}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
                <Link href="/goals">
                  <Button variant="ghost" size="sm" className="w-full">
                    View all goals <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No active goals
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
