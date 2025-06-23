"use client"

import React from "react"
import type { LeaderboardEntry } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, Award, Star, TrendingUp, MessageSquare, Target, Calendar, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface LeaderboardRankCardProps {
  entry: LeaderboardEntry
  showDetails?: boolean
}

export default function LeaderboardRankCard({ entry, showDetails = false }: LeaderboardRankCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBorderColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-500/50 bg-yellow-500/5"
      case 2:
        return "border-gray-400/50 bg-gray-400/5"
      case 3:
        return "border-amber-600/50 bg-amber-600/5"
      default:
        return entry.isCurrentUser ? "border-blue-500/50 bg-blue-500/5" : ""
    }
  }

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  const levelProgress = entry.level ? ((entry.level % 1) * 100) : 0

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${getRankBorderColor(entry.rank)} ${
      entry.isCurrentUser ? "ring-2 ring-blue-500/20" : ""
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Left side - Rank and User Info */}
          <div className="flex items-center space-x-4">
            {/* Rank */}
            <div className="flex-shrink-0">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={entry.avatar} alt={entry.username} />
                <AvatarFallback>{getInitials(entry.username)}</AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-base">{entry.username}</h3>
                  {entry.isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                
                {entry.badge && (
                  <Badge 
                    variant="outline" 
                    className="text-xs mt-1"
                    style={{ borderColor: entry.badgeColor, color: entry.badgeColor }}
                  >
                    {entry.badge}
                  </Badge>
                )}
                
                {entry.level && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">Level {Math.floor(entry.level)}</span>
                    <Progress value={levelProgress} className="w-16 h-1" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Points and Stats */}
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{entry.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">points</div>
            
            {showDetails && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{entry.weeklyPoints}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>{entry.problemsSolved}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Stats (if showDetails is true) */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>Forum</span>
                </div>
                <div className="font-semibold">{entry.forumContributions}</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Streak</span>
                </div>
                <div className="font-semibold">{entry.streak} days</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>Achievements</span>
                </div>
                <div className="font-semibold">{entry.achievements.length}</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined</span>
                </div>
                <div className="font-semibold text-xs">
                  {formatDistanceToNow(new Date(entry.joinDate), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Achievements */}
            {entry.achievements.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-2">Recent Achievements</div>
                <div className="flex flex-wrap gap-1">
                  {entry.achievements.slice(0, 3).map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                  {entry.achievements.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{entry.achievements.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
