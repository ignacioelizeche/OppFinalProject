"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { MockExam } from "@/lib/types"
import { 
  Clock, 
  FileText, 
  Users, 
  TrendingUp, 
  Play,
  Eye,
  AlertCircle,
  CheckCircle2,
  Target
} from "lucide-react"

interface ExamGridProps {
  exams: MockExam[]
  loading: boolean
}

export function ExamGrid({ exams, loading }: ExamGridProps) {
  const router = useRouter()
  const [startingExam, setStartingExam] = useState<number | null>(null)

  const handleStartExam = async (examId: number) => {
    setStartingExam(examId)
    try {
      // Navigate to exam taking page
      router.push(`/exams/${examId}/take`)
    } catch (error) {
      console.error("Failed to start exam:", error)
    } finally {
      setStartingExam(null)
    }
  }

  const handleViewExam = (examId: number) => {
    router.push(`/exams/${examId}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "practice": return <Target className="h-4 w-4" />
      case "simulation": return <Play className="h-4 w-4" />
      case "final": return <CheckCircle2 className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "practice": return "bg-blue-100 text-blue-800 border-blue-200"
      case "simulation": return "bg-purple-100 text-purple-800 border-purple-200"
      case "final": return "bg-orange-100 text-orange-800 border-orange-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-80">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No exams found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search criteria to find more exams.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <Card key={exam.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2 mb-2">
                  {exam.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {exam.description}
                </CardDescription>
              </div>
              {!exam.isActive && (
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge 
                variant="outline" 
                className={`${getDifficultyColor(exam.difficulty)} capitalize`}
              >
                {exam.difficulty}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getTypeColor(exam.type)} capitalize flex items-center gap-1`}
              >
                {getTypeIcon(exam.type)}
                {exam.type}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Subject and Topics */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {exam.subject}
              </p>
              <div className="flex flex-wrap gap-1">
                {exam.topics.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {exam.topics.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{exam.topics.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Exam Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{exam.duration} min</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{exam.totalQuestions} questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{exam.totalAttempts} attempts</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>{exam.averageScore.toFixed(1)}% avg</span>
              </div>
            </div>

            {/* Passing Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Passing Score</span>
                <span>{exam.passingScore}%</span>
              </div>
              <Progress value={exam.passingScore} className="h-2" />
            </div>

            {/* Prerequisites */}
            {exam.prerequisites.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Prerequisites:
                </p>
                <p className="text-xs text-muted-foreground">
                  {exam.prerequisites.join(", ")}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewExam(exam.id)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={() => handleStartExam(exam.id)}
                disabled={!exam.isActive || startingExam === exam.id}
                className="flex-1"
              >
                {startingExam === exam.id ? (
                  "Starting..."
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
            </div>

            {/* Creator and Date */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <div className="flex justify-between">
                <span>By {exam.createdByName}</span>
                <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
