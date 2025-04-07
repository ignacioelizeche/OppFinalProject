"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { problemsAPI } from "@/lib/api"
import type { Problem, SubmitAnswerResponse } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function ProblemDetailPage() {
  const { id } = useParams()
  const problemId = Number(id)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null)
  const { toast } = useToast()

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
  }, [problemId, toast])

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

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await problemsAPI.submitAnswer(problemId, answer)
      setResult(response)

      if (response.correct) {
        toast({
          title: "Correct!",
          description: "Your answer is correct. Points have been added to your balance.",
        })
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
                  disabled={isSubmitting}
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
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

