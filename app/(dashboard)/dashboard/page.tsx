"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CalendarEvent, DashboardStats, LeaderboardEntry } from "@/lib/types"
import { calendarAPI, dashboardAPI, leaderboardAPI } from "@/lib/realApi"
import { Calendar, Trophy } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

// Import new dashboard components
import { PersonalizedWelcomePanel } from "@/components/dashboard/personalized-welcome-panel"
import { WeeklyOverview } from "@/components/dashboard/weekly-overview"
import { PerformanceHeatmap } from "@/components/dashboard/performance-heatmap"
import { TodaysFocus } from "@/components/dashboard/todays-focus"
import { LeaderboardPreview } from "@/components/dashboard/leaderboard-preview"
import LeaderboardRankCard from "@/components/leaderboard/leaderboard-rank-card"
import { AchievementShowcase } from "@/components/dashboard/AchievementComponents"

export default function DashboardPage() {
  const { user } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<{ topUsers: LeaderboardEntry[], currentUser?: LeaderboardEntry }>({ topUsers: [] })
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

        const [eventsData, statsData, leaderboardResponse] = await Promise.all([
          calendarAPI.getEvents(startDate, endDate).catch(() => []),
          dashboardAPI.getStats().catch(() => null),
          leaderboardAPI.getLeaderboard(10, 'weekly').catch(() => ({ users: [], totalUsers: 0, userRank: null })),
        ])

        setUpcomingEvents(eventsData as CalendarEvent[])
        setDashboardStats(statsData)
        setLeaderboardData({
          topUsers: leaderboardResponse.users || [],
          currentUser: leaderboardResponse.users?.find(u => u.isCurrentUser) || undefined
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">Loading your dashboard...</div>
          <div className="text-sm text-muted-foreground mt-2">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-6">
        {/* Personalized Welcome Panel */}
        <PersonalizedWelcomePanel user={user} />

        {/* Main Dashboard Grid - Calendar, Achievements, and Leaderboard */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Calendar Card */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1">
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
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.startTime), "MMM d, h:mm a")}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-primary">{event.eventType}</div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Link href="/calendar" className="text-xs text-primary hover:underline flex items-center justify-center">
                      View all events →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground mb-2">No upcoming events</div>
                  <Link href="/calendar" className="text-xs text-primary hover:underline">
                    Go to Calendar →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <AchievementShowcase user={user} />

          {/* Leaderboard Card */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Leaderboard</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-md bg-muted"></div>
                  ))}
                </div>
              ) : leaderboardData.topUsers.length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.topUsers.slice(0, 3).map((user) => (
                    <LeaderboardRankCard 
                      key={user.id} 
                      entry={user} 
                      showDetails={false}
                    />
                  ))}
                  <div className="pt-2 border-t">
                    <Link href="/leaderboard" className="text-xs text-primary hover:underline flex items-center justify-center">
                      View full leaderboard →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground mb-2">No leaderboard data</div>
                  <Link href="/leaderboard" className="text-xs text-primary hover:underline">
                    View leaderboard →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Focus */}
        {dashboardStats && (
          <TodaysFocus
            upcomingDeadlines={upcomingEvents}
            recommendedProblems={[]}
            activeGoals={dashboardStats.todaysFocus.activeGoals}
          />
        )}

        {/* Secondary Cards Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Weekly Overview */}
          {dashboardStats && (
            <div className="h-full">
              <WeeklyOverview weeklyProgress={dashboardStats.weeklyProgress} />
            </div>
          )}

          {/* Performance Heatmap */}
          {dashboardStats && (
            <div className="h-full">
              <PerformanceHeatmap 
                dates={dashboardStats.performanceHeatmap.dates}
                activities={dashboardStats.performanceHeatmap.activities}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

