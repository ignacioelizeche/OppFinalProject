"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockExamAPI } from "@/lib/realApi"
import type { ExamResult } from "@/lib/types"
import { 
  Trophy, 
  Clock, 
  Target, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  BarChart3,
  Lightbulb,
  RefreshCw
} from "lucide-react"

export default function ExamResultsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const examId = parseInt(params.id as string)
  const attemptId = parseInt(searchParams.get("attemptId") || "0")
  
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)

  const loadResults = useCallback(async () => {
    try {
      setLoading(true)
      const resultData = await mockExamAPI.finishExam(attemptId)
      setResult(resultData)
    } catch (error) {
      console.error("Failed to load results:", error)
    } finally {
      setLoading(false)
    }
  }, [attemptId])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  const handleRetakeExam = () => {
    router.push(`/exams/${examId}/take`)
  }

  const handleBackToExam = () => {
    router.push(`/exams/${examId}`)
  }

  const handleBackToExams = () => {
    router.push("/exams")
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

  if (!result) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Results not found</h3>
            <p className="text-muted-foreground">
              Unable to load the exam results. Please try again.
            </p>
            <Button onClick={() => router.push("/exams")}>
              Back to Exams
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const { attempt, exam, detailedResults, topicBreakdown, recommendations, improvementAreas } = result

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBackToExams}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exams
        </Button>
      </div>

      {/* Results Overview */}
      <Card>
        <CardHeader className="text-center">
          <div className="space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              attempt.isPassing ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {attempt.isPassing ? (
                <Trophy className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            
            <div>
              <CardTitle className="text-2xl mb-2">{exam.title}</CardTitle>
              <CardDescription>
                {attempt.isPassing ? "Congratulations! You passed the exam." : "You didn't pass this time, but keep practicing!"}
              </CardDescription>
            </div>

            <div className="flex justify-center">
              <Badge 
                variant={attempt.isPassing ? "default" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {attempt.score}% ({attempt.correctAnswers}/{attempt.totalQuestions} correct)
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attempt.score}%</div>
                <Progress value={attempt.score} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Passing score: {exam.passingScore}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attempt.duration} min</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Allowed time: {exam.duration} min
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attempt.correctAnswers}/{attempt.totalQuestions}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {((attempt.correctAnswers / attempt.totalQuestions) * 100).toFixed(1)}% accuracy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleBackToExam}>
              View Exam Details
            </Button>
            <Button onClick={handleRetakeExam}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Exam
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Topic Breakdown</TabsTrigger>
          <TabsTrigger value="questions">Question Review</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Topic Breakdown */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Topic</CardTitle>
              <CardDescription>
                See how you performed in each topic area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicBreakdown.map((topic) => (
                  <div key={topic.topic} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{topic.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          {topic.correctAnswers}/{topic.totalQuestions} questions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{topic.percentage.toFixed(1)}%</p>
                        <Badge variant={topic.percentage >= 70 ? "default" : "destructive"}>
                          {topic.percentage >= 70 ? "Good" : "Needs Work"}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={topic.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Review */}
        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question-by-Question Review</CardTitle>
              <CardDescription>
                Review each question with your answer and explanation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {detailedResults.map((question, index) => (
                  <div key={question.questionId} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                        question.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {question.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Question {index + 1}</p>
                        <Badge variant="outline" className="ml-2">{question.topic}</Badge>
                        <Badge variant="outline" className="ml-1">{question.points} pts</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(question.timeSpent / 60)}:{(question.timeSpent % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-9 space-y-2">
                      <p className="text-sm">{question.question}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Your Answer:</p>
                          <p className={question.isCorrect ? "text-green-600" : "text-red-600"}>
                            {Array.isArray(question.selectedAnswer) 
                              ? question.selectedAnswer.join(", ") 
                              : question.selectedAnswer}
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-muted-foreground">Correct Answer:</p>
                          <p className="text-green-600">
                            {Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer.join(", ") 
                              : question.correctAnswer}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </div>
                    
                    {index < detailedResults.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Study Recommendations
                </CardTitle>
                <CardDescription>
                  Suggested resources and topics to focus on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
                <CardDescription>
                  Topics that need more attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {improvementAreas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Detailed analysis of your exam performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Question Types</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Multiple Choice:</span>
                      <span>{detailedResults.filter(q => q.question.includes("What") || q.question.includes("Which")).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Short Answer:</span>
                      <span>{detailedResults.filter(q => q.question.includes("Find") || q.question.includes("Calculate")).length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Time Distribution</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Average per question:</span>
                      <span>{Math.round(attempt.duration * 60 / attempt.totalQuestions)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fastest question:</span>
                      <span>{Math.min(...detailedResults.map(q => q.timeSpent))}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slowest question:</span>
                      <span>{Math.max(...detailedResults.map(q => q.timeSpent))}s</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Accuracy by Topic</h4>
                  <div className="space-y-1 text-sm">
                    {topicBreakdown.slice(0, 3).map((topic) => (
                      <div key={topic.topic} className="flex justify-between">
                        <span>{topic.topic}:</span>
                        <span>{topic.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {attempt.feedback && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Instructor Feedback</h4>
                  <p className="text-sm text-blue-700">{attempt.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
