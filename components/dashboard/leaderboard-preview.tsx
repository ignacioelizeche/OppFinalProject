"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { LeaderboardEntry } from "@/lib/types"

interface LeaderboardPreviewProps {
  topUsers: LeaderboardEntry[]
  currentUser?: LeaderboardEntry | null
  className?: string
}

export function LeaderboardPreview({ topUsers, currentUser, className }: LeaderboardPreviewProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      case 2:
        return "border-l-4 border-l-gray-400 bg-gray-50 dark:bg-gray-900/20"
      case 3:
        return "border-l-4 border-l-amber-600 bg-amber-50 dark:bg-amber-900/20"
      default:
        return ""
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Leaderboard
          </CardTitle>
          <Link 
            href="/leaderboard" 
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current User Status */}
        {currentUser && currentUser.rank > 3 && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">#{currentUser.rank}</span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-xs">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">You</p>
                <p className="text-xs text-muted-foreground">{currentUser.totalPoints} points</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {currentUser.weeklyPoints} this week
              </Badge>
            </div>
          </div>
        )}

        {/* Top Users */}
        <div className="space-y-2">
          {topUsers.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 ${getRankColor(user.rank)}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {getRankIcon(user.rank)}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.isCurrentUser ? "You" : user.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.totalPoints} points • Level {user.level}
                </p>
              </div>

              <div className="text-right">
                <Badge 
                  variant={user.weeklyPoints > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  +{user.weeklyPoints}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {topUsers.length === 0 && (
          <div className="text-center py-6">
            <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No leaderboard data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete problems to start earning points!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
