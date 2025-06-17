"use client"

import React from "react"
import type { LeaderboardStats } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, TrendingUp, Target } from "lucide-react"

interface LeaderboardStatsProps {
  stats: LeaderboardStats
  currentUserRank?: number
}

export default function LeaderboardStatsComponent({ stats, currentUserRank }: LeaderboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Active learners
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Points</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averagePoints.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Community average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.topPerformer.points.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.topPerformer.username}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.weeklyGrowth}%</div>
          <p className="text-xs text-muted-foreground">
            {currentUserRank && `Your rank: #${currentUserRank}`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
