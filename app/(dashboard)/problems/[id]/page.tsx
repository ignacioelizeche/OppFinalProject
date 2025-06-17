"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { problemsAPI } from "@/lib/realApi"
import type { Problem, SubmitAnswerResponse } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, Coins } from "lucide-react"
import Link from "next/link"

export default function ProblemDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const problemId = Number(id)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [submitResult, setSubmitResult] = useState<SubmitAnswerResponse | null>(null)
  const { toast } = useToast()
  const { refreshUser } = useAuth()

  const handleTimeUp = useCallback(() => {
    toast({
      variant: "destructive",
      title: "Time's Up!",
      description: "The time limit for this problem has been reached.",
    })
    setIsCompleted(true)
    setShowExplanation(true)
  }, [toast])

  // Timer effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isCompleted) {
      handleTimeUp()
    }
  }, [timeRemaining, isCompleted, handleTimeUp])

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setIsLoading(true)
      try {
        const foundProblem = await problemsAPI.getProblem(problemId)
        setProblem(foundProblem)
        
        // Initialize timer if the problem has a time limit
        if (foundProblem.timeLimit) {
          setTimeRemaining(foundProblem.timeLimit)
        }
      } catch (error) {
        console.error("Failed to fetch problem:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load the problem. Please try again.",
        })
        router.push('/problems')
      } finally {
        setIsLoading(false)
      }
    }

    if (problemId) {
      fetchProblem()
    }
  }, [problemId, toast, router])

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer.trim()) {
      toast({
        variant: "destructive",
        title: "No Answer Selected",
        description: "Please select an answer before submitting.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await problemsAPI.submitAnswer(problemId, selectedAnswer)
      setSubmitResult(response)
      setIsCompleted(true)
      setShowExplanation(true)

      // Refresh user data to update coin balance and XP
      await refreshUser()

      if (response.correct) {
        toast({
          title: "Correct! 🎉",
          description: `Great job! You earned ${response.pointsEarned || 0} points and ${response.coinsEarned || 0} coins.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Incorrect",
          description: response.explanation || "That's not the correct answer. Try reviewing the explanation!",
        })
      }
    } catch (error) {
      console.error("Failed to submit answer:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted"></div>
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold">Problem Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested problem could not be found.</p>
        <Link href="/problems">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Problems
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/problems">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Problems
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(problem.difficulty)}>
            {problem.difficulty}
          </Badge>
          <Badge variant="outline">{problem.topic}</Badge>
          <Badge variant="secondary">
            <Trophy className="mr-1 h-3 w-3" />
            {problem.pointValue} pts
          </Badge>
        </div>
      </div>

      {/* Timer */}
      {timeRemaining !== null && !isCompleted && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-orange-900">Time Remaining</span>
                <span className="font-mono text-lg font-bold text-orange-700">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              {problem.timeLimit && (
                <Progress 
                  value={(timeRemaining / problem.timeLimit) * 100} 
                  className="mt-2 h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{problem.title}</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {problem.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Input */}
          {!isCompleted && (
            <div className="space-y-4">
              {problem.type === 'multiple-choice' && problem.choices ? (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Select your answer:</Label>
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    {problem.choices.map((choice, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                        <RadioGroupItem value={choice} id={`choice-${index}`} />
                        <Label 
                          htmlFor={`choice-${index}`} 
                          className="flex-1 cursor-pointer font-normal"
                        >
                          {choice}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="answer" className="text-base font-medium">
                    Your answer:
                  </Label>
                  <Textarea
                    id="answer"
                    placeholder="Enter your answer here..."
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="min-h-20"
                  />
                </div>
              )}

              <Button 
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !selectedAnswer.trim()}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          )}

          {/* Results */}
          {isCompleted && submitResult && (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                submitResult.correct 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {submitResult.correct ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="flex-1">
                  <div className={`font-medium ${
                    submitResult.correct ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {submitResult.correct ? 'Correct!' : 'Incorrect'}
                  </div>
                  <div className={`text-sm ${
                    submitResult.correct ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {submitResult.message}
                  </div>
                </div>
                {submitResult.correct && (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <Coins className="h-4 w-4" />
                    +{submitResult.coinsEarned || 0} coins
                  </div>
                )}
              </div>

              {problem.correctAnswer && (
                <div className="p-4 rounded-lg border bg-blue-50">
                  <div className="font-medium text-blue-900 mb-2">Correct Answer:</div>
                  <div className="text-blue-800">{problem.correctAnswer}</div>
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && problem.explanation && (
            <div className="p-4 rounded-lg border bg-gray-50">
              <div className="font-medium text-gray-900 mb-2">Explanation:</div>
              <div className="text-gray-700 leading-relaxed">{problem.explanation}</div>
            </div>
          )}

          {/* Navigation */}
          {isCompleted && (
            <div className="flex gap-3 pt-4">
              <Link href="/problems" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Problems
                </Button>
              </Link>
              <Button 
                onClick={() => router.push(`/problems/${problemId + 1}`)}
                className="flex-1"
              >
                Next Problem
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

