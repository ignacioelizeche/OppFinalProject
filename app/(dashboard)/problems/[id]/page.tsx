"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { problemsAPI } from "@/lib/api"
import type { Problem, SubmitAnswerResponse } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function ProblemDetailPage() {
  const { id } = useParams()
  const problemId = Number(id)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const fetchProblem = async () => {
      setIsLoading(true)
      try {
        // In a real app, you'd have a specific endpoint to get a single problem
        // For now, we'll fetch all problems and find the one we need
        const problems = await problemsAPI.getProblems()
        const foundProblem = problems.find((p) => p.id === problemId)

        if (foundProblem) {
          setProblem(foundProblem)

          // Set timer based on difficulty
          let seconds = 0
          switch (foundProblem.difficulty) {
            case "easy":
              seconds = 120 // 2 minutes
              break
            case "medium":
              seconds = 300 // 5 minutes
              break
            case "hard":
              seconds = 600 // 10 minutes
              break
            default:
              seconds = 300
          }
          setTimeLeft(seconds)

          // Get previous attempts
          const previousAttempts = problemsAPI.getAttempts(problemId)
          setAttempts(previousAttempts.length)
        } else {
          toast({
            variant: "destructive",
            title: "Problem not found",
            description: "The requested problem could not be found.",
          })
        }
      } catch (error) {
        console.error("Failed to fetch problem:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load the problem. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (problemId) {
      fetchProblem()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [problemId, toast])

  // Start timer when timeLeft is set
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timeLeft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!answer.trim()) {
      toast({
        variant: "destructive",
        title: "Answer required",
        description: "Please provide an answer before submitting.",
      })
      return
    }

    if (attempts >= 2) {
      toast({
        variant: "destructive",
        title: "Maximum attempts reached",
        description: "You've already used your 2 attempts for this problem.",
      })
      return
    }

    if (timeLeft === 0) {
      toast({
        variant: "destructive",
        title: "Time's up",
        description: "The time limit for this problem has expired.",
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await problemsAPI.submitAnswer(problemId, answer)
      setResult(response)
      setAttempts((prev) => prev + 1)

      // Refresh user to update coin balance
      await refreshUser()

      if (response.correct) {
        toast({
          title: "Correct!",
          description: "Your answer is correct. Points have been added to your balance.",
        })

        // Stop the timer if answer is correct
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      } else {
        toast({
          variant: "destructive",
          title: "Incorrect",
          description: "Your answer is incorrect. Try again!",
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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/problems" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Problems
          </Link>
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-3/4 rounded-md bg-muted"></div>
            <div className="h-4 w-1/2 rounded-md bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded-md bg-muted"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/problems" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Problems
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium">Problem not found</h3>
            <p className="text-muted-foreground">The requested problem could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/problems" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Problems
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{problem.title}</CardTitle>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  problem.difficulty === "easy"
                    ? "bg-green-100 text-green-800"
                    : problem.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {problem.difficulty}
              </span>
              <span className="text-sm text-muted-foreground">{problem.pointValue} points</span>
            </div>
          </div>
          <CardDescription>{problem.topic}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            <p>{problem.description}</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className={`font-mono ${timeLeft !== null && timeLeft < 30 ? "text-red-500 font-bold" : ""}`}>
                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{attempts}/2 attempts used</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
            <CardDescription>Enter your solution to the problem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  placeholder="Enter your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isSubmitting || attempts >= 2 || timeLeft === 0}
                />
              </div>

              {result && (
                <div
                  className={`p-4 rounded-md ${
                    result.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  <div className="flex items-center">
                    {result.correct ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                    <p className="font-medium">{result.message}</p>
                  </div>
                </div>
              )}

              {attempts >= 2 && !result?.correct && (
                <div className="p-4 rounded-md bg-amber-50 text-amber-800">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    <p className="font-medium">You've used all your attempts for this problem.</p>
                  </div>
                </div>
              )}

              {timeLeft === 0 && !result?.correct && (
                <div className="p-4 rounded-md bg-red-50 text-red-800">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    <p className="font-medium">Time's up! You can no longer submit an answer for this problem.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || attempts >= 2 || timeLeft === 0}>
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

