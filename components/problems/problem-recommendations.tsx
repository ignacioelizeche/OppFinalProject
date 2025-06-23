"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Problem } from "@/lib/types"
import { problemsAPI } from "@/lib/realApi"
import { Star, Clock, Trophy, BookOpen, ArrowRight, Lightbulb } from "lucide-react"
import Link from "next/link"

interface ProblemRecommendationsProps {
  userId: number
  userLevel?: number
  completedProblems?: number[]
}

export function ProblemRecommendations({ userId, completedProblems = [] }: ProblemRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Problem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true)
        const recs = await problemsAPI.getRecommendations(userId)
        // Filter out completed problems
        const filteredRecs = recs.filter(problem => !completedProblems.includes(problem.id))
        setRecommendations(filteredRecs)
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [userId, completedProblems])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTopicIcon = (topic: string) => {
    switch (topic.toLowerCase()) {
      case "algebra": return "🔢"
      case "calculus": return "📈"
      case "geometry": return "📐"
      case "trigonometry": return "📊"
      case "linear-algebra": return "⚡"
      case "probability": return "🎲"
      case "complex-numbers": return "🌀"
      default: return "📚"
    }
  }

  const getRecommendationReason = (problem: Problem) => {
    if (problem.difficulty === "easy") {
      return "Perfect for building fundamentals"
    }
    if (problem.prerequisites && problem.prerequisites.length > 0) {
      return "Next step in your learning path"
    }
    if (problem.pointValue > 50) {
      return "High reward challenge"
    }
    return "Matches your current level"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommended Problems
          </CardTitle>
          <CardDescription>Personalized suggestions based on your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommended Problems
        </CardTitle>
        <CardDescription>Personalized suggestions based on your progress</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((problem) => (
              <div key={problem.id} className="group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTopicIcon(problem.topic)}</span>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {problem.title}
                      </h3>
                      <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {problem.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {problem.estimatedTime}m
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {problem.pointValue} pts
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {problem.xpValue} XP
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                    {getRecommendationReason(problem)}
                  </div>
                  <Link href={`/problems/${problem.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Start <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                {/* Prerequisites indicator */}
                {problem.prerequisites && problem.prerequisites.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-muted">
                    <div className="text-xs text-muted-foreground">
                      Requires: Problems {problem.prerequisites.join(", ")}
                    </div>
                  </div>
                )}

                {/* Concepts tags */}
                {problem.concepts && problem.concepts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {problem.concepts.slice(0, 3).map((concept) => (
                      <span
                        key={concept}
                        className="inline-block px-2 py-0.5 text-xs bg-muted rounded-full"
                      >
                        {concept}
                      </span>
                    ))}
                    {problem.concepts.length > 3 && (
                      <span className="inline-block px-2 py-0.5 text-xs bg-muted rounded-full">
                        +{problem.concepts.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-2">
              <Link href="/problems">
                <Button variant="ghost" size="sm" className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse All Problems
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-sm font-medium mb-1">No Recommendations</h3>
            <p className="text-xs text-muted-foreground">
              Complete more problems to get personalized recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
