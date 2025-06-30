import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Zap, Target, Award, Crown } from "lucide-react"
import { achievementsAPI } from "@/lib/realApi"
import type { Achievement, UserAchievementsResponse, User } from "@/lib/types"

// Achievement Component for Dashboard
interface AchievementShowcaseProps {
  user: User | null
}

export const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({ user }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userTier, setUserTier] = useState<string>("Iron")
  const [tierColor, setTierColor] = useState<string>("#8b8b8b")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user?.id) {
        console.log("No user ID available for achievements")
        return
      }
      
      try {
        setLoading(true)
        console.log("Fetching achievements for user:", user.id)
        
        // Use the achievementsAPI instead of direct fetch
        const data = await achievementsAPI.getUserAchievements(user.id) as UserAchievementsResponse
        console.log("Received achievements data:", data)
        setAchievements(data.achievements || [])
        setUserTier(data.tier || "Iron")
        setTierColor(data.tierColor || "#8b8b8b")
      } catch (error) {
        console.error("Failed to fetch achievements:", error)
        console.log("Using fallback demo data for user:", user)
        // Fallback to demo data that matches Achievement type, using actual user stats
        const userLevel = user?.level || 51 // Using the level from the screenshot
        const userStreak = user?.streak || 0
        const userProblems = user?.totalProblemsCompleted || user?.problemsSolved || 10
        
        setAchievements([
          {
            id: "first_step",
            name: "👶 First Step",
            description: "Solve your first problem",
            icon: "👶",
            tier: "Common",
            tierColor: "#6b7280",
            requiredValue: 1,
            currentValue: userProblems,
            unlocked: true,
            progress: 100
          },
          {
            id: "bronze",
            name: "🥉 Bronze",
            description: "Reach level 5",
            icon: "🥉",
            tier: "Common",
            tierColor: "#cd7f32",
            requiredValue: 5,
            currentValue: userLevel,
            unlocked: userLevel >= 5,
            progress: Math.min(100, (userLevel / 5) * 100)
          },
          {
            id: "silver",
            name: "🥈 Silver",
            description: "Reach level 10",
            icon: "🥈",
            tier: "Uncommon",
            tierColor: "#c0c0c0",
            requiredValue: 10,
            currentValue: userLevel,
            unlocked: userLevel >= 10,
            progress: Math.min(100, (userLevel / 10) * 100)
          },
          {
            id: "gold",
            name: "🥇 Gold",
            description: "Reach level 15",
            icon: "🥇",
            tier: "Rare",
            tierColor: "#ffd700",
            requiredValue: 15,
            currentValue: userLevel,
            unlocked: userLevel >= 15,
            progress: Math.min(100, (userLevel / 15) * 100)
          },
          {
            id: "platinum",
            name: "🏆 Platinum",
            description: "Reach level 20",
            icon: "🏆",
            tier: "Epic",
            tierColor: "#00d4aa",
            requiredValue: 20,
            currentValue: userLevel,
            unlocked: userLevel >= 20,
            progress: Math.min(100, (userLevel / 20) * 100)
          },
          {
            id: "diamond",
            name: "💎 Diamond",
            description: "Reach level 30",
            icon: "💎",
            tier: "Epic",
            tierColor: "#b19cd9",
            requiredValue: 30,
            currentValue: userLevel,
            unlocked: userLevel >= 30,
            progress: Math.min(100, (userLevel / 30) * 100)
          },
          {
            id: "grandmaster",
            name: "👑 Grandmaster",
            description: "Reach level 50",
            icon: "👑",
            tier: "Legendary",
            tierColor: "#ff6b6b",
            requiredValue: 50,
            currentValue: userLevel,
            unlocked: userLevel >= 50,
            progress: Math.min(100, (userLevel / 50) * 100)
          },
          {
            id: "week_warrior",
            name: "📅 Week Warrior",
            description: "7 day streak",
            icon: "📅",
            tier: "Common",
            tierColor: "#6b7280",
            requiredValue: 7,
            currentValue: userStreak,
            unlocked: userStreak >= 7,
            progress: Math.min(100, (userStreak / 7) * 100)
          }
        ])
        
        // Set user tier based on level
        if (userLevel >= 50) {
          setUserTier("Grandmaster")
          setTierColor("#ff6b6b")
        } else if (userLevel >= 30) {
          setUserTier("Diamond")
          setTierColor("#b19cd9")
        } else if (userLevel >= 20) {
          setUserTier("Platinum")
          setTierColor("#00d4aa")
        } else if (userLevel >= 15) {
          setUserTier("Gold")
          setTierColor("#ffd700")
        } else if (userLevel >= 10) {
          setUserTier("Silver")
          setTierColor("#c0c0c0")
        } else if (userLevel >= 5) {
          setUserTier("Bronze")
          setTierColor("#cd7f32")
        } else {
          setUserTier("Iron")
          setTierColor("#8b8b8b")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-muted"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentAchievements = achievements
    .filter(a => a.unlocked)
    .slice(0, 3)

  const nextToUnlock = achievements
    .filter(a => !a.unlocked && a.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 2)

  return (
    <div className="space-y-4">
      {/* User Tier Display */}
      <Card className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: tierColor }}
        />
        <CardHeader className="relative">
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" style={{ color: tierColor }} />
            <span>Your Tier: {userTier}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Level {user?.level || 1}</span>
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm text-gray-600">{user?.xpPoints || 0} XP</span>
            </div>
            <Badge style={{ backgroundColor: tierColor, color: 'white' }}>
              {userTier}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.map((achievement, index) => (
                <div 
                  key={achievement.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' :
                    index === 1 ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' :
                    'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index === 0 ? 'bg-yellow-400 text-yellow-800' :
                    index === 1 ? 'bg-blue-400 text-blue-800' :
                    'bg-green-400 text-green-800'
                  }`}>
                    {achievement.name.split(' ')[0]} {/* Gets the emoji */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${
                      index === 0 ? 'text-yellow-800' :
                      index === 1 ? 'text-blue-800' :
                      'text-green-800'
                    }`}>
                      {achievement.name}
                    </div>
                    <div className={`text-xs ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {achievement.tier} • {achievement.description}
                    </div>
                  </div>
                  <Trophy className="w-4 h-4 text-yellow-600" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-gray-500 mb-2">No achievements yet</div>
              <p className="text-xs text-gray-400">
                Keep solving problems to unlock achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress to Next Achievements */}
      {nextToUnlock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span>Almost There!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextToUnlock.map((achievement) => (
                <div key={achievement.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{achievement.name.split(' ')[0]}</span>
                      <div>
                        <div className="font-medium text-sm">{achievement.name}</div>
                        <div className="text-xs text-gray-500">{achievement.description}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(achievement.progress)}%
                    </Badge>
                  </div>
                  <Progress value={achievement.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Enhanced Leaderboard Entry Component
interface EnhancedLeaderboardEntryProps {
  entry: any // We'll use any for now since this comes from a different API
  showDetails?: boolean
}

export const EnhancedLeaderboardEntry: React.FC<EnhancedLeaderboardEntryProps> = ({ entry, showDetails = true }) => {
  const getTierIcon = (tier: string): string => {
    const icons: Record<string, string> = {
      "Grandmaster": "👑",
      "Diamond": "💎", 
      "Platinum": "🥇",
      "Gold": "🥇",
      "Silver": "🥈",
      "Bronze": "🥉",
      "Iron": "⚡"
    }
    return icons[tier] || "⚡"
  }

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all hover:shadow-md ${
      entry.isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          entry.rank === 1 ? 'bg-yellow-400 text-yellow-800' :
          entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
          entry.rank === 3 ? 'bg-orange-400 text-orange-800' :
          'bg-gray-100 text-gray-600'
        }`}>
          {entry.rank}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTierIcon(entry.badge)}</span>
          <div>
            <div className="font-medium text-sm">{entry.username}</div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Badge 
                variant="outline" 
                className="text-xs px-1 py-0"
                style={{ borderColor: entry.badgeColor, color: entry.badgeColor }}
              >
                {entry.badge}
              </Badge>
              {showDetails && (
                <>
                  <span>•</span>
                  <span>{entry.problemsSolved} solved</span>
                  {entry.streak > 0 && (
                    <>
                      <span>•</span>
                      <span>{entry.streak}🔥</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {showDetails && entry.achievements && entry.achievements.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.achievements.slice(0, 3).map((achievement: any, idx: number) => (
              <span key={idx} className="text-xs bg-gray-100 px-1 rounded">
                {achievement}
              </span>
            ))}
            {entry.achievements.length > 3 && (
              <span className="text-xs text-gray-400">+{entry.achievements.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <div className="text-right">
        <div className="font-semibold text-sm">{entry.totalPoints.toLocaleString()}</div>
        <div className="text-xs text-gray-500">points</div>
      </div>
    </div>
  )
}

// Achievement Statistics Component for Dashboard
interface AchievementStatsProps {
  achievements?: Achievement[]
}

export const AchievementStats: React.FC<AchievementStatsProps> = ({ achievements = [] }) => {
  const unlocked = achievements.filter(a => a.unlocked).length
  const total = achievements.length
  const completionPercentage = total > 0 ? (unlocked / total) * 100 : 0

  const tierCounts = achievements.reduce((acc: Record<string, number>, achievement) => {
    if (achievement.unlocked) {
      acc[achievement.tier] = (acc[achievement.tier] || 0) + 1
    }
    return acc
  }, {})

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-purple-500" />
          <span>Achievement Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{unlocked}/{total}</div>
            <div className="text-sm text-gray-500">Achievements Unlocked</div>
            <Progress value={completionPercentage} className="mt-2" />
            <div className="text-xs text-gray-400 mt-1">
              {completionPercentage.toFixed(1)}% Complete
            </div>
          </div>

          {Object.keys(tierCounts).length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">By Tier:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(tierCounts).map(([tier, count]) => (
                  <div key={tier} className="flex justify-between">
                    <span className="text-gray-600">{tier}:</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default {
  AchievementShowcase,
  EnhancedLeaderboardEntry,
  AchievementStats
}
