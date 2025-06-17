"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Problem, SubmitAnswerResponse } from "@/lib/types"
import { ProblemTimer } from "./problem-timer"
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Brain,
  MessageSquare,
  Award,
  ArrowRight
} from "lucide-react"

interface ProblemWorkspaceProps {
  problem: Problem
  onSubmitAnswer: (answer: string) => Promise<SubmitAnswerResponse>
  onTimeUpdate?: (timeElapsed: number) => void
  maxAttempts?: number
  currentAttempts?: number
}

export function ProblemWorkspace({ 
  problem, 
  onSubmitAnswer, 
  onTimeUpdate,
  maxAttempts = 3,
  currentAttempts = 0
}: ProblemWorkspaceProps) {
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [workNotes, setWorkNotes] = useState("")

  const handleSubmit = async () => {
    if (!answer.trim()) return

    setIsSubmitting(true)
    try {
      const response = await onSubmitAnswer(answer.trim())
      setResult(response)
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTimeUpdate = (elapsed: number) => {
    setTimeElapsed(elapsed)
    onTimeUpdate?.(elapsed)
  }

  const isAttemptLimitReached = currentAttempts >= maxAttempts
  const canSubmit = answer.trim() && !isSubmitting && !isAttemptLimitReached && !result?.correct

  // Generate hints based on problem topic and concepts
  const getHints = () => {
    const hints: string[] = []
    
    if (problem.topic === "algebra") {
      hints.push("Start by identifying the type of equation you're dealing with")
      hints.push("Look for patterns or factoring opportunities")
      hints.push("Consider using substitution or elimination methods")
    }
    
    if (problem.topic === "calculus") {
      hints.push("Remember the fundamental rules of differentiation/integration")
      hints.push("Check if you need to apply the chain rule")
      hints.push("Consider any special cases or limits")
    }
    
    if (problem.concepts && problem.concepts.includes("quadratic equations")) {
      hints.push("Try factoring or using the quadratic formula")
      hints.push("Remember: ax² + bx + c = 0 can be solved by factoring or formula")
    }
    
    if (problem.concepts && problem.concepts.includes("derivatives")) {
      hints.push("Apply the power rule: d/dx(xⁿ) = n·xⁿ⁻¹")
      hints.push("Don't forget the chain rule for composite functions")
    }

    return hints.length > 0 ? hints : ["Break down the problem into smaller steps", "Review the relevant concepts", "Work through similar examples"]
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Problem Content - Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Problem Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{problem.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
                <Badge variant="outline">{problem.topic}</Badge>
              </div>
            </div>
            <CardDescription>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Est. {problem.estimatedTime}m
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {problem.pointValue} points
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {problem.xpValue} XP
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-base leading-relaxed">{problem.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Problem Workspace Tabs */}
        <Tabs defaultValue="solution" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="notes">Work Notes</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
          </TabsList>
          
          <TabsContent value="solution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Solution</CardTitle>
                <CardDescription>
                  Attempt {currentAttempts + 1} of {maxAttempts}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Enter your solution here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="min-h-[120px] font-mono"
                    disabled={isSubmitting || isAttemptLimitReached || result?.correct}
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Answer"}
                </Button>

                {/* Result Display */}
                {result && (
                  <div className={`p-4 rounded-md ${
                    result.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {result.correct ? 
                        <CheckCircle className="h-5 w-5" /> : 
                        <XCircle className="h-5 w-5" />
                      }
                      <span className="font-medium">{result.message}</span>
                    </div>
                    {result.explanation && (
                      <p className="text-sm">{result.explanation}</p>
                    )}
                    {result.correct && result.nextSuggestedProblem && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-sm mb-2">Ready for the next challenge?</p>
                        <Button size="sm" variant="outline">
                          Problem {result.nextSuggestedProblem}
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Attempt Limit Warning */}
                {isAttemptLimitReached && !result?.correct && (
                  <div className="p-4 rounded-md bg-orange-50 text-orange-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-medium">Maximum attempts reached</span>
                    </div>
                    <p className="text-sm mt-1">
                      Review the hints and try a similar problem to practice this concept.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Work Notes
                </CardTitle>
                <CardDescription>
                  Use this space to work through the problem step by step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="• Step 1: Identify what's being asked&#10;• Step 2: List known information&#10;• Step 3: Choose appropriate method&#10;• Step 4: Work through the solution..."
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Hints & Tips
                </CardTitle>
                <CardDescription>
                  Struggling? These hints might help guide your thinking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showHint ? (
                  <Button 
                    onClick={() => setShowHint(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Show Hints
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {getHints().map((hint, index) => (
                      <div key={index} className="p-3 rounded-md bg-blue-50 text-blue-800 text-sm">
                        <span className="font-medium">Hint {index + 1}:</span> {hint}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - Right Column */}
      <div className="space-y-6">
        {/* Timer */}
        <ProblemTimer 
          difficulty={problem.difficulty}
          estimatedTime={problem.estimatedTime || 30}
          onTimeUpdate={handleTimeUpdate}
          isActive={!result?.correct}
        />

        {/* Problem Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problem Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Concepts */}
            <div>
              <Label className="text-sm font-medium">Key Concepts</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {problem.concepts?.map((concept) => (
                  <Badge key={concept} variant="secondary" className="text-xs">
                    {concept}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">No concepts specified</span>}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {problem.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">No tags specified</span>}
              </div>
            </div>

            {/* Prerequisites */}
            {problem.prerequisites && problem.prerequisites.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Prerequisites</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Problems: {problem.prerequisites.join(", ")}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Progress Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Time Spent:</span>
              <span className="font-mono">{Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Attempts Used:</span>
              <span>{currentAttempts} / {maxAttempts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <span className={
                result?.correct ? "text-green-600" :
                isAttemptLimitReached ? "text-red-600" :
                "text-yellow-600"
              }>
                {result?.correct ? "Solved" :
                 isAttemptLimitReached ? "Incomplete" :
                 "In Progress"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
