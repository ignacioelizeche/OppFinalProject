"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { mockExamAPI } from "@/lib/realApi"
import type { MockExam, ExamSession, ExamAnswer } from "@/lib/types"
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Pause, 
  Play,
  AlertTriangle
} from "lucide-react"

export default function TakeExamPage() {
  const params = useParams()
  const router = useRouter()
  const examId = parseInt(params.id as string)
  
  const [exam, setExam] = useState<MockExam | null>(null)
  const [session, setSession] = useState<ExamSession | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>("")
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const currentQuestion = exam?.questions[session?.currentQuestionIndex || 0]

  const handleSaveAnswer = useCallback(async () => {
    if (!session || !currentQuestion || !currentAnswer) return

    const answer: ExamAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: currentAnswer,
      isCorrect: false, // Will be determined on server
      timeSpent: 0, // Will be calculated on server
      isSkipped: false,
      isMarkedForReview: session.markedForReview.has(currentQuestion.id),
      confidence
    }

    try {
      await mockExamAPI.submitAnswer(session.attemptId, currentQuestion.id, JSON.stringify(currentAnswer))
      
      // Update session
      setSession(prev => {
        if (!prev) return prev
        const newAnswers = new Map(prev.answers)
        newAnswers.set(currentQuestion.id, answer)
        return {
          ...prev,
          answers: newAnswers,
          answeredQuestions: new Set(Array.from(prev.answeredQuestions).concat(currentQuestion.id))
        }
      })
    } catch (error) {
      console.error("Failed to save answer:", error)
    }
  }, [session, currentQuestion, currentAnswer, confidence])

  const handleFinishExam = useCallback(async () => {
    if (!session) return

    setSubmitting(true)
    try {
      // Save current answer if exists
      if (currentAnswer) {
        await handleSaveAnswer()
      }
      await mockExamAPI.finishExam(session.attemptId)
      router.push(`/exams/${examId}/results?attemptId=${session.attemptId}`)
    } catch (error) {
      console.error("Failed to finish exam:", error)
    } finally {
      setSubmitting(false)
    }
  }, [session, currentAnswer, examId, router, handleSaveAnswer])

  const handleTimeUp = useCallback(async () => {
    if (session) {
      await handleFinishExam()
    }
  }, [session, handleFinishExam])

  const initializeExam = useCallback(async () => {
    try {
      setLoading(true)
      const [examData, sessionData] = await Promise.all([
        mockExamAPI.getExamById(examId),
        mockExamAPI.startExam(examId)
      ])
      setExam(examData)
      setSession(sessionData)
      
      // Load saved answer if exists
      const savedAnswer = sessionData.answers.get(examData.questions[0]?.id)
      if (savedAnswer) {
        setCurrentAnswer(savedAnswer.selectedAnswer)
        setConfidence(savedAnswer.confidence)
      }
    } catch (error) {
      console.error("Failed to initialize exam:", error)
      router.push("/exams")
    } finally {
      setLoading(false)
    }
  }, [examId, router])

  useEffect(() => {
    initializeExam()
  }, [initializeExam])

  useEffect(() => {
    if (session && !session.isPaused) {
      const timer = setInterval(() => {
        setSession(prev => {
          if (!prev || prev.timeRemaining <= 0) {
            handleTimeUp()
            return prev
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 }
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [session?.isPaused, handleTimeUp, session])

  const handleAnswerChange = (answer: string | string[]) => {
    setCurrentAnswer(answer)
  }

  const handleNavigateQuestion = async (direction: "prev" | "next") => {
    if (!session || !exam) return

    // Save current answer before navigating
    if (currentAnswer) {
      await handleSaveAnswer()
    }

    const newIndex = direction === "next" 
      ? Math.min(session.currentQuestionIndex + 1, exam.questions.length - 1)
      : Math.max(session.currentQuestionIndex - 1, 0)

    setSession(prev => prev ? { ...prev, currentQuestionIndex: newIndex } : prev)
    
    // Load answer for new question
    const newQuestion = exam.questions[newIndex]
    const savedAnswer = session.answers.get(newQuestion.id)
    if (savedAnswer) {
      setCurrentAnswer(savedAnswer.selectedAnswer)
      setConfidence(savedAnswer.confidence)
    } else {
      setCurrentAnswer("")
      setConfidence(3)
    }
  }

  const handleToggleReview = () => {
    if (!session || !currentQuestion) return

    setSession(prev => {
      if (!prev) return prev
      const newMarked = new Set(prev.markedForReview)
      if (newMarked.has(currentQuestion.id)) {
        newMarked.delete(currentQuestion.id)
      } else {
        newMarked.add(currentQuestion.id)
      }
      return { ...prev, markedForReview: newMarked }
    })
  }

  const handleTogglePause = () => {
    setSession(prev => prev ? { ...prev, isPaused: !prev.isPaused } : prev)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const renderQuestionInput = () => {
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <RadioGroup 
            value={currentAnswer as string} 
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "true-false":
        return (
          <RadioGroup 
            value={currentAnswer as string} 
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        )

      case "short-answer":
        return (
          <Input
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full"
          />
        )

      case "essay":
        return (
          <Textarea
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Write your essay answer here..."
            className="w-full min-h-32"
          />
        )

      case "fill-blank":
        const blanks = currentQuestion.question.split('_____')
        return (
          <div className="space-y-3">
            {blanks.map((part, index) => (
              <div key={index}>
                {part}
                {index < blanks.length - 1 && (
                  <Input
                    value={(currentAnswer as string[])?.[index] || ""}
                    onChange={(e) => {
                      const answers = Array.isArray(currentAnswer) ? [...currentAnswer] : []
                      answers[index] = e.target.value
                      handleAnswerChange(answers)
                    }}
                    className="inline-block w-32 mx-2"
                    placeholder={`Blank ${index + 1}`}
                  />
                )}
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!exam || !session || !currentQuestion) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Failed to load exam</h3>
            <p className="text-muted-foreground">
              There was an error loading the exam. Please try again.
            </p>
            <Button onClick={() => router.push("/exams")}>
              Back to Exams
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const progressPercentage = ((session.currentQuestionIndex + 1) / exam.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {session.currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono ${session.timeRemaining < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(session.timeRemaining)}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTogglePause}
              >
                {session.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {session.isPaused ? "Resume" : "Pause"}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleFinishExam}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Finish Exam"}
              </Button>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="mt-3" />
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      Question {session.currentQuestionIndex + 1}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {currentQuestion.points} points
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="secondary">
                        {currentQuestion.topic}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleReview}
                  >
                    <Flag className={`h-4 w-4 mr-2 ${
                      session.markedForReview.has(currentQuestion.id) ? 'text-orange-500' : ''
                    }`} />
                    {session.markedForReview.has(currentQuestion.id) ? "Unmark" : "Mark for Review"}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Question Text */}
                <div className="text-base leading-relaxed">
                  {currentQuestion.question}
                </div>

                {/* Code Snippet */}
                {currentQuestion.codeSnippet && (
                  <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                    <pre>{currentQuestion.codeSnippet}</pre>
                  </div>
                )}

                {/* Image */}
                {currentQuestion.imageUrl && (
                  <div className="text-center">
                    <Image 
                      src={currentQuestion.imageUrl} 
                      alt="Question image" 
                      width={800}
                      height={400}
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                <Separator />

                {/* Answer Input */}
                <div className="space-y-4">
                  <h4 className="font-medium">Your Answer:</h4>
                  {renderQuestionInput()}
                </div>

                {/* Confidence Level */}
                <div className="space-y-3">
                  <h4 className="font-medium">Confidence Level:</h4>
                  <RadioGroup 
                    value={confidence.toString()} 
                    onValueChange={(value) => setConfidence(parseInt(value) as 1 | 2 | 3 | 4 | 5)}
                    className="flex gap-4"
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.toString()} id={`conf-${level}`} />
                        <Label htmlFor={`conf-${level}`} className="cursor-pointer">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    1 = Not confident, 5 = Very confident
                  </p>
                </div>

                {/* Hints */}
                {currentQuestion.hints.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800">Hints:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                      {currentQuestion.hints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => handleNavigateQuestion("prev")}
                    disabled={session.currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={handleSaveAnswer}
                    disabled={!currentAnswer}
                  >
                    Save Answer
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleNavigateQuestion("next")}
                    disabled={session.currentQuestionIndex === exam.questions.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions.map((question, index) => {
                    const isAnswered = session.answeredQuestions.has(question.id)
                    const isMarked = session.markedForReview.has(question.id)
                    const isCurrent = index === session.currentQuestionIndex

                    return (
                      <Button
                        key={question.id}
                        variant="outline"
                        size="sm"
                        className={`
                          h-10 w-10 p-0 text-xs
                          ${isCurrent ? 'border-blue-500 bg-blue-50' : ''}
                          ${isAnswered ? 'bg-green-50 border-green-200' : ''}
                          ${isMarked ? 'bg-orange-50 border-orange-200' : ''}
                        `}
                        onClick={() => {
                          setSession(prev => prev ? { ...prev, currentQuestionIndex: index } : prev)
                          // Load answer for selected question
                          const savedAnswer = session.answers.get(question.id)
                          if (savedAnswer) {
                            setCurrentAnswer(savedAnswer.selectedAnswer)
                            setConfidence(savedAnswer.confidence)
                          } else {
                            setCurrentAnswer("")
                            setConfidence(3)
                          }
                        }}
                      >
                        {index + 1}
                        {isMarked && <Flag className="h-2 w-2 absolute top-0 right-0 text-orange-500" />}
                      </Button>
                    )
                  })}
                </div>
                
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border rounded bg-green-50 border-green-200"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border rounded bg-orange-50 border-orange-200"></div>
                    <span>Marked for review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border rounded"></div>
                    <span>Not answered</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span>{session.answeredQuestions.size}/{exam.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marked:</span>
                    <span>{session.markedForReview.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span>{exam.questions.length - session.answeredQuestions.size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
