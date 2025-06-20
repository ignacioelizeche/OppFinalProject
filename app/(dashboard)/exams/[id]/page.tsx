"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { mockExamAPI } from "@/lib/realApi"
import type { MockExam, ExamResult } from "@/lib/types"
import {
  Clock,
  FileText,
  Users,
  TrendingUp,
  Play,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Target,
  Trophy,
  Calendar,
} from "lucide-react"

export default function ExamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const examId = Number.parseInt(params.id as string)

  const [exam, setExam] = useState<MockExam | null>(null)
  const [attempts, setAttempts] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [startingExam, setStartingExam] = useState(false)

  const loadExamDetails = useCallback(async () => {
    try {
      const examData = await mockExamAPI.getExamById(examId)
      setExam(examData)
    } catch (error) {
      console.error("Failed to load exam details:", error)
    } finally {
      setLoading(false)
    }
  }, [examId])

  const loadAttempts = useCallback(async () => {
    try {
      const allAttempts = await mockExamAPI.getAttempts()
      const examAttempts = allAttempts.filter((attempt) => attempt.exam.id === examId)
      setAttempts(examAttempts)
    } catch (error) {
      console.error("Failed to load exam attempts:", error)
    }
  }, [examId])

  useEffect(() => {
    loadExamDetails()
    loadAttempts()
  }, [loadExamDetails, loadAttempts])

  const handleStartExam = async () => {
    setStartingExam(true)
    try {
      router.push(`/exams/${examId}/take`)
    } catch (error) {
      console.error("Failed to start exam:", error)
    } finally {
      setStartingExam(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "practice":
        return <Target className="h-4 w-4" />
      case "simulation":
        return <Play className="h-4 w-4" />
      case "final":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "practice":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "simulation":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "final":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Exam not found</h3>
            <p className="text-muted-foreground">
              The exam you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push("/exams")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const bestAttempt = attempts.reduce(
    (best, current) => (!best || current.attempt.score > best.attempt.score ? current : best),
    null as ExamResult | null,
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/exams")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exams
        </Button>
      </div>

      {/* Exam Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              <CardDescription className="text-base">{exam.description}</CardDescription>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={`${getDifficultyColor(exam.difficulty)} capitalize`}>
                  {exam.difficulty}
                </Badge>
                <Badge variant="outline" className={`${getTypeColor(exam.type)} capitalize flex items-center gap-1`}>
                  {getTypeIcon(exam.type)}
                  {exam.type}
                </Badge>
                {!exam.isActive && <Badge variant="destructive">Inactive</Badge>}
              </div>
            </div>
            <Button size="lg" onClick={handleStartExam} disabled={!exam.isActive || startingExam}>
              {startingExam ? (
                "Starting..."
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Exam
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{exam.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="font-medium">{exam.totalQuestions}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Passing Score</p>
                <p className="font-medium">{exam.passingScore}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Attempts</p>
                <p className="font-medium">{exam.totalAttempts}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subject and Topics */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Subject</h4>
              <Badge variant="secondary">{exam.subject}</Badge>
            </div>

            <div>
              <h4 className="font-medium mb-2">Topics Covered</h4>
              <div className="flex flex-wrap gap-2">
                {exam.topics.map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            {exam.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {exam.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Prerequisites */}
          {exam.prerequisites.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Prerequisites</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {exam.prerequisites.map((prerequisite) => (
                  <li key={prerequisite}>{prerequisite}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h4 className="font-medium mb-2">Instructions</h4>
            <p className="text-sm text-muted-foreground">{exam.instructions}</p>
          </div>

          {/* Creator Info */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <div className="flex justify-between">
              <span>Created by {exam.createdByName}</span>
              <span>
                <Calendar className="h-4 w-4 inline mr-1" />
                {new Date(exam.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.averageScore ? exam.averageScore.toFixed(1) : "0.0"}%</div>
            <Progress value={exam.averageScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.totalAttempts || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Average duration: {exam.averageDuration || 0} min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Best</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestAttempt ? `${bestAttempt.attempt.score}%` : "No attempts"}</div>
            {bestAttempt && (
              <p className="text-xs text-muted-foreground mt-2">
                {bestAttempt.attempt.isPassing ? "Passed" : "Not passed"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Your Attempts */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Attempts</CardTitle>
            <CardDescription>History of your attempts on this exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <div key={attempt.attempt.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Attempt #{attempt.attempt.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(attempt.attempt.startTime).toLocaleDateString()} • Duration: {attempt.attempt.duration}{" "}
                      minutes
                    </p>
                    {attempt.attempt.feedback && (
                      <p className="text-sm text-blue-600 mt-1">{attempt.attempt.feedback}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant={attempt.attempt.isPassing ? "default" : "destructive"}>
                        {attempt.attempt.score}%
                      </Badge>
                      {attempt.attempt.isPassing && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {attempt.attempt.correctAnswers}/{attempt.attempt.totalQuestions} correct
                    </p>
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
