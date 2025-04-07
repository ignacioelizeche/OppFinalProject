"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CalendarEvent, Problem } from "@/lib/types"
import { calendarAPI, problemsAPI } from "@/lib/api"
import { Calendar, BookOpen, Trophy } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function DashboardPage() {
  const { user } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [recentProblems, setRecentProblems] = useState<Problem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Get upcoming events for the next 7 days
        const now = new Date()
        const nextWeek = new Date()
        nextWeek.setDate(now.getDate() + 7)

        const startDate = now.toISOString()
        const endDate = nextWeek.toISOString()

        const [eventsData, problemsData] = await Promise.all([
          calendarAPI.getEvents(startDate, endDate),
          problemsAPI.getProblems({ limit: 5 }),
        ])

        setUpcomingEvents(eventsData)
        setRecentProblems(problemsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Welcome Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Welcome back, {user?.username}!</CardTitle>
            <CardDescription>
              Your current balance: <span className="font-medium text-yellow-500">{user?.coinBalance} coins</span>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Upcoming Events Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-muted"></div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.startTime), "MMM d, h:mm a")}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-primary">{event.eventType}</div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href="/calendar" className="text-xs text-primary hover:underline">
                    View all events
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">No upcoming events</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Problems Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Problems</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-muted"></div>
                ))}
              </div>
            ) : recentProblems.length > 0 ? (
              <div className="space-y-2">
                {recentProblems.slice(0, 3).map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <div className="font-medium">{problem.title}</div>
                      <div className="text-xs text-muted-foreground">{problem.topic}</div>
                    </div>
                    <div className="text-xs font-medium">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          problem.difficulty === "easy"
                            ? "bg-green-100 text-green-800"
                            : problem.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href="/problems" className="text-xs text-primary hover:underline">
                    View all problems
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">No problems available</div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard Preview Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-muted"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* This would be populated with actual leaderboard data */}
                <div className="text-center py-4">
                  <Link href="/leaderboard" className="text-primary hover:underline">
                    View leaderboard
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

