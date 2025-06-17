"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Achievement } from "@/lib/types"
import { Trophy, Star, Medal, Award } from "lucide-react"
import { format } from "date-fns"

interface RecentAchievementsProps {
  achievements: Achievement[]
}

const getAchievementIcon = (iconName: string) => {
  switch (iconName) {
    case "trophy": return Trophy
    case "star": return Star
    case "medal": return Medal
    case "award": return Award
    default: return Trophy
  }
}

export function RecentAchievements({ achievements }: RecentAchievementsProps) {
  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Achievements</CardTitle>
          <CardDescription>Your latest accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">
            No achievements yet. Keep learning to unlock your first achievement!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Achievements</CardTitle>
        <CardDescription>Your latest accomplishments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.slice(0, 3).map((achievement) => {
            const Icon = getAchievementIcon(achievement.icon)
            
            return (
              <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                <div className="p-2 rounded-full bg-yellow-500 text-white">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{achievement.title}</h3>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(achievement.unlockedAt), "MMM d")}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      +{achievement.xpReward} XP
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      +{achievement.coinReward} coins
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
          
          {achievements.length > 3 && (
            <div className="text-center pt-2">
              <span className="text-xs text-muted-foreground">
                +{achievements.length - 3} more achievements
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
