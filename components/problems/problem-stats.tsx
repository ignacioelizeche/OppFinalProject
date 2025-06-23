"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProblemHistory } from "@/lib/types"
import { TrendingUp, Target, Clock, Award, BookOpen, Zap } from "lucide-react"

interface ProblemStatsProps {
  history: ProblemHistory
}

export function ProblemStats({ history }: ProblemStatsProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${seconds % 60}s`
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600"
    if (accuracy >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 5) return "bg-gradient-to-r from-purple-500 to-pink-500"
    if (streak >= 3) return "bg-gradient-to-r from-blue-500 to-purple-500"
    if (streak >= 1) return "bg-gradient-to-r from-green-500 to-blue-500"
    return "bg-gray-500"
  }

  const averageTimePerProblem = history.attempts.length > 0 
    ? Math.round(history.totalTime / history.attempts.length) 
    : 0

  const totalXpEarned = history.attempts.reduce((sum, attempt) => sum + attempt.xpEarned, 0)
  const totalCoinsEarned = history.attempts.reduce((sum, attempt) => sum + attempt.coinsEarned, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Accuracy Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getAccuracyColor(history.averageAccuracy)}`}>
            {history.averageAccuracy.toFixed(1)}%
          </div>
          <Progress value={history.averageAccuracy} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {history.totalSolved} of {history.attempts.length} problems solved
          </p>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {history.streakCount}
          </div>
          <Badge className={`mt-2 text-white ${getStreakColor(history.streakCount)}`}>
            {history.streakCount >= 5 ? "On Fire!" : 
             history.streakCount >= 3 ? "Hot Streak!" : 
             history.streakCount >= 1 ? "Getting Started" : "No Streak"}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            Consecutive correct answers
          </p>
        </CardContent>
      </Card>

      {/* Study Time Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(history.totalTime)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Average: {formatTime(averageTimePerProblem)} per problem
          </p>
        </CardContent>
      </Card>

      {/* XP Earned Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">XP Earned</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {totalXpEarned}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            From problem solving
          </p>
        </CardContent>
      </Card>

      {/* Coins Earned Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coins Earned</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {totalCoinsEarned}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            From correct answers
          </p>
        </CardContent>
      </Card>

      {/* Total Problems Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Problems Attempted</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {history.attempts.length}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {history.totalSolved} solved successfully
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
