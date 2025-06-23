"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Play, Pause, RotateCcw, AlertTriangle } from "lucide-react"

interface ProblemTimerProps {
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number
  onTimeUp?: () => void
  onTimeUpdate?: (timeElapsed: number) => void
  isActive?: boolean
}

export function ProblemTimer({ 
  difficulty, 
  estimatedTime, 
  onTimeUp, 
  onTimeUpdate, 
  isActive = true 
}: ProblemTimerProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Calculate time limits based on difficulty
  const getTimeLimit = () => {
    switch (difficulty) {
      case 'easy': return estimatedTime * 60 * 1.5 // 1.5x estimated time
      case 'medium': return estimatedTime * 60 * 2 // 2x estimated time
      case 'hard': return estimatedTime * 60 * 2.5 // 2.5x estimated time
      default: return estimatedTime * 60 * 2
    }
  }

  const timeLimit = getTimeLimit()
  const progressPercentage = (timeElapsed / timeLimit) * 100

  useEffect(() => {
    if (isRunning && !isPaused && isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1
          onTimeUpdate?.(newTime)
          
          // Check if time is up
          if (newTime >= timeLimit) {
            setIsRunning(false)
            onTimeUp?.()
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, isActive, timeLimit, onTimeUp, onTimeUpdate])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (progressPercentage >= 90) return "text-red-500"
    if (progressPercentage >= 75) return "text-orange-500"
    if (progressPercentage >= 50) return "text-yellow-500"
    return "text-green-500"
  }

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeElapsed(0)
  }

  const isTimeWarning = progressPercentage >= 75
  const isTimeCritical = progressPercentage >= 90
  const timeRemaining = Math.max(0, timeLimit - timeElapsed)

  return (
    <Card className={`transition-all duration-300 ${
      isTimeCritical ? 'border-red-500 shadow-red-100' : 
      isTimeWarning ? 'border-orange-500 shadow-orange-100' : 
      'border-border'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Problem Timer
          </div>
          <Badge variant={difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'secondary' : 'destructive'}>
            {difficulty}
          </Badge>
        </CardTitle>
        <CardDescription>
          Estimated time: {estimatedTime} minutes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Timer Display */}
        <div className="text-center">
          <div className={`text-3xl font-mono font-bold ${getTimerColor()}`}>
            {formatTime(timeElapsed)}
          </div>
          <div className="text-sm text-muted-foreground">
            Time remaining: {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={Math.min(progressPercentage, 100)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start</span>
            <span>{progressPercentage.toFixed(0)}% used</span>
            <span>Time limit</span>
          </div>
        </div>

        {/* Warning Messages */}
        {isTimeCritical && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 text-red-800 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Critical: Less than 10% time remaining!
          </div>
        )}
        
        {isTimeWarning && !isTimeCritical && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-orange-50 text-orange-800 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Warning: You&apos;re running out of time
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button 
              onClick={handleStart} 
              size="sm" 
              className="flex items-center gap-2"
              disabled={!isActive}
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
          ) : (
            <Button 
              onClick={handlePause} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="h-3 w-3" />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          
          <Button 
            onClick={handleReset} 
            size="sm" 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        {/* Performance Indicator */}
        <div className="text-center text-xs text-muted-foreground">
          {progressPercentage <= 50 && "Great pace! You're on track"}
          {progressPercentage > 50 && progressPercentage <= 75 && "Good progress, keep going"}
          {progressPercentage > 75 && progressPercentage <= 90 && "Time is running short"}
          {progressPercentage > 90 && "Final moments - submit soon!"}
        </div>
      </CardContent>
    </Card>
  )
}
