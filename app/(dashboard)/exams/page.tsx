"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockExamAPI } from "@/lib/realApi"
import type { MockExam, ExamStats } from "@/lib/types"
import { ExamGrid } from "@/components/exams/exam-grid"
import { ExamStatsComponent } from "@/components/exams/exam-stats"
import { Search, Clock, Users, Trophy, BookOpen } from "lucide-react"

export default function ExamsPage() {
  const [exams, setExams] = useState<MockExam[]>([])
  const [stats, setStats] = useState<ExamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadExams()
    loadStats()
  }, [])

  const loadExams = async () => {
    try {
      setLoading(true)
      const examData = await mockExamAPI.getExams()
      setExams(examData)
    } catch (error) {
      console.error("Failed to load exams:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await mockExamAPI.getStats()
      setStats(statsData as ExamStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredExams = exams.filter(exam => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false
    
    // Filter by tab
    if (activeTab === "practice" && exam.type !== "practice") return false
    if (activeTab === "simulation" && exam.type !== "simulation") return false
    if (activeTab === "final" && exam.type !== "final") return false
    return true
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mock Exam Center</h1>
          <p className="text-muted-foreground">
            Test your knowledge with comprehensive practice exams and simulations
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search exams by title, subject, or topic..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExams}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bestScore}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Exams</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="simulation">Simulations</TabsTrigger>
          <TabsTrigger value="final">Final Exams</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <ExamGrid exams={filteredExams} loading={loading} />
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <ExamGrid exams={filteredExams} loading={loading} />
        </TabsContent>

        <TabsContent value="simulation" className="space-y-6">
          <ExamGrid exams={filteredExams} loading={loading} />
        </TabsContent>

        <TabsContent value="final" className="space-y-6">
          <ExamGrid exams={filteredExams} loading={loading} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats && <ExamStatsComponent stats={stats} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
