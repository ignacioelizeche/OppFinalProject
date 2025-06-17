"use client"

import React, { useState, useEffect, useCallback } from "react"
import { leaderboardAPI } from "@/lib/realApi"
import type { LeaderboardEntry, LeaderboardResponse } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import LeaderboardRankCard from "@/components/leaderboard/leaderboard-rank-card"
import LeaderboardStatsComponent from "@/components/leaderboard/leaderboard-stats"
import LeaderboardFilters from "@/components/leaderboard/leaderboard-filters"
import { Trophy, Medal, Award, TrendingUp, Users, Crown } from "lucide-react"

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null)
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('all-time')
  const [limit, setLimit] = useState(25)
  const [showOnlyActive, setShowOnlyActive] = useState(false)
  const { toast } = useToast()

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await leaderboardAPI.getLeaderboard(limit, period)
      setLeaderboardData(data)
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load leaderboard. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [limit, period, toast])

  const filterLeaderboard = useCallback(() => {
    if (!leaderboardData) return

    let filtered = [...leaderboardData.users]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Active users filter (users active in last 7 days)
    if (showOnlyActive) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(entry =>
        new Date(entry.lastActive) > sevenDaysAgo
      )
    }

    setFilteredLeaderboard(filtered)
  }, [leaderboardData, searchTerm, showOnlyActive])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  useEffect(() => {
    filterLeaderboard()
  }, [filterLeaderboard])

  const getPeriodTitle = () => {
    switch (period) {
      case 'weekly':
        return 'This Week'
      case 'monthly':
        return 'This Month'
      default:
        return 'All Time'
    }
  }

  const getPeriodIcon = () => {
    switch (period) {
      case 'weekly':
        return <TrendingUp className="h-5 w-5" />
      case 'monthly':
        return <Medal className="h-5 w-5" />
      default:
        return <Trophy className="h-5 w-5" />
    }
  }

  const currentUser = leaderboardData?.users.find(entry => entry.isCurrentUser)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            {getPeriodIcon()}
            <span>Leaderboard - {getPeriodTitle()}</span>
          </h1>
          <p className="text-muted-foreground">
            See how you rank among your peers and discover top performers
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Users className="h-3 w-3" />
          <span>{leaderboardData?.stats.totalUsers.toLocaleString()} learners</span>
        </Badge>
      </div>

      {/* Stats Overview */}
      {leaderboardData?.stats && (
        <LeaderboardStatsComponent 
          stats={leaderboardData.stats} 
          currentUserRank={leaderboardData.currentUserRank}
        />
      )}

      {/* Current User Highlight (if not in visible range) */}
      {currentUser && currentUser.rank > limit && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-blue-500" />
              <span>Your Current Position</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardRankCard entry={currentUser} showDetails={true} />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <LeaderboardFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        period={period}
        onPeriodChange={setPeriod}
        limit={limit}
        onLimitChange={setLimit}
        showOnlyActive={showOnlyActive}
        onActiveToggle={setShowOnlyActive}
      />

      {/* Leaderboard List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rankings</span>
            <Badge variant="outline">
              {filteredLeaderboard.length} of {leaderboardData?.users.length || 0} users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : filteredLeaderboard.length > 0 ? (
            <div className="space-y-4">
              {/* Top 3 with Special Treatment */}
              {filteredLeaderboard.slice(0, 3).map((entry) => (
                <LeaderboardRankCard 
                  key={entry.id} 
                  entry={entry} 
                  showDetails={entry.rank <= 3}
                />
              ))}
              
              {/* Rest of the leaderboard */}
              {filteredLeaderboard.length > 3 && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">
                      Other Top Performers
                    </h3>
                    <div className="space-y-3">
                      {filteredLeaderboard.slice(3).map((entry) => (
                        <LeaderboardRankCard 
                          key={entry.id} 
                          entry={entry} 
                          showDetails={false}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `No users match "${searchTerm}"`
                  : "No users to display"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Highlights */}
      {leaderboardData?.users.slice(0, 3).some(user => user.achievements.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {leaderboardData.users.slice(0, 3).map((entry) => (
                <div key={entry.id} className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="font-semibold">{entry.username}</div>
                  <div className="text-sm text-muted-foreground">Rank #{entry.rank}</div>
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {entry.achievements.slice(0, 2).map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

