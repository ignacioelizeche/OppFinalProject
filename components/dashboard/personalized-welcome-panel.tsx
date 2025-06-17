"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "@/lib/types"
import { Coins, Zap, Target, Flame } from "lucide-react"
import { format } from "date-fns"

interface PersonalizedWelcomePanelProps {
  user: User
}

export function PersonalizedWelcomePanel({ user }: PersonalizedWelcomePanelProps) {
  const getXPForNextLevel = (currentLevel: number) => {
    return currentLevel * 100 // Simple formula: each level requires 100 more XP
  }

  const getCurrentLevelXP = (xpPoints: number, level: number) => {
    const previousLevelsXP = Array.from({ length: level - 1 }, (_, i) => (i + 1) * 100).reduce((sum, xp) => sum + xp, 0)
    return xpPoints - previousLevelsXP
  }

  // Provide defaults for optional fields
  const userLevel = user.level || 1
  const userXpPoints = user.xpPoints || user.xp || 0
  const userStreak = user.streak || 0
  const userTotalProblems = user.totalProblemsCompleted || 0
  const userJoinDate = user.joinDate || new Date().toISOString()

  const xpForNextLevel = getXPForNextLevel(userLevel)
  const currentLevelXP = getCurrentLevelXP(userXpPoints, userLevel)
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100

  const memberSince = new Date(userJoinDate)
  const daysSinceMember = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="col-span-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              Welcome back, {user.username}! 👋
            </CardTitle>
            <CardDescription className="mt-2">
              Ready to continue your learning journey? Let&apos;s make today productive!
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Member since {format(memberSince, "MMM yyyy")}
            </div>
            <div className="text-xs text-muted-foreground">
              {daysSinceMember} days ago
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Level & XP */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-sm">Level & XP</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-bold">
                  Level {userLevel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {currentLevelXP} / {xpForNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {xpForNextLevel - currentLevelXP} XP to next level
              </div>
            </div>
          </div>

          {/* Coin Balance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-sm">Coin Balance</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {user.coinBalance.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Available for rewards
            </div>
          </div>

          {/* Current Streak */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-sm">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {userStreak} days
            </div>
            <div className="text-xs text-muted-foreground">
              Keep it up! 🔥
            </div>
          </div>

          {/* Total Problems */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm">Problems Solved</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {userTotalProblems}
            </div>
            <div className="text-xs text-muted-foreground">
              Total completed
            </div>
          </div>
        </div>

        {/* Quick motivation based on user stats */}
        <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
          <div className="text-sm">
            {userStreak >= 7 ? (
              <span className="text-orange-600 font-medium">
                🔥 Amazing! You&apos;re on a {userStreak}-day streak! 
              </span>
            ) : userStreak >= 3 ? (
              <span className="text-blue-600 font-medium">
                💪 Great consistency! {userStreak} days in a row!
              </span>
            ) : (
              <span className="text-gray-600 font-medium">
                🌟 Ready for today&apos;s challenge?
              </span>
            )}
            {userLevel >= 5 && (
              <span className="ml-2 text-purple-600">
                You&apos;re becoming a math expert! 📚
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
