"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { ExamStats } from "@/lib/types"
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Users,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"

interface ExamStatsComponentProps {
  stats: ExamStats
}

export function ExamStatsComponent({ stats }: ExamStatsComponentProps) {
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "medium": return <Target className="h-4 w-4 text-yellow-600" />
      case "hard": return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600"
    if (accuracy >= 80) return "text-blue-600"
    if (accuracy >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <p className="text-xs text-muted-foreground">
              Available for practice
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Exams taken by you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestScore}%</div>
            <p className="text-xs text-muted-foreground">
              Personal best
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Subject</CardTitle>
          <CardDescription>
            Your performance across different subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.subjectBreakdown.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{subject.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.examsCount} exams • {subject.totalAttempts} attempts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{subject.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress value={subject.averageScore} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Difficulty</CardTitle>
          <CardDescription>
            How you perform on different difficulty levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.difficultyBreakdown.map((difficulty) => (
              <div key={difficulty.difficulty} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getDifficultyIcon(difficulty.difficulty)}
                    <div>
                      <p className="font-medium capitalize">{difficulty.difficulty}</p>
                      <p className="text-sm text-muted-foreground">
                        {difficulty.examsCount} exams
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{difficulty.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress value={difficulty.averageScore} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Performance</CardTitle>
          <CardDescription>
            Your accuracy across different topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topicPerformance.map((topic) => (
              <div key={topic.topic} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{topic.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {topic.correctAnswers}/{topic.totalQuestions} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getAccuracyColor(topic.accuracy)}`}>
                      {topic.accuracy.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress value={topic.accuracy} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attempts</CardTitle>
          <CardDescription>
            Your most recent exam attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentAttempts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent attempts found
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Exam #{attempt.examId}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(attempt.startTime).toLocaleDateString()} • 
                      {attempt.duration} minutes
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant={attempt.isPassing ? "default" : "destructive"}>
                        {attempt.score}%
                      </Badge>
                      {attempt.isPassing && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {attempt.correctAnswers}/{attempt.totalQuestions} correct
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
