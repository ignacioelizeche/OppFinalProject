"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockExamAPI } from "@/lib/realApi"
import type { PDFDocument, PDFDocumentStats } from "@/lib/types"
import { ExamGrid } from "@/components/exams/exam-grid"
import { ExamStatsComponent } from "@/components/exams/exam-stats"
import { Search, Star, BookOpen, Download, Eye } from "lucide-react"

export default function ExamsPage() {
  const [documents, setDocuments] = useState<PDFDocument[]>([])
  const [stats, setStats] = useState<PDFDocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadDocuments()
    loadStats()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const documentData = (await mockExamAPI.getExams()) as PDFDocument[]
      setDocuments(documentData)
    } catch (error) {
      console.error("Failed to load documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await mockExamAPI.getStats()
      setStats(statsData as PDFDocumentStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredDocuments = documents.filter((document) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.topics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    // Filter by tab
    if (activeTab === "exam" && document.category !== "exam") return false
    if (activeTab === "assignment" && document.category !== "assignment") return false
    if (activeTab === "lecture-notes" && document.category !== "lecture-notes") return false
    if (activeTab === "study-guide" && document.category !== "study-guide") return false
    if (activeTab === "reference" && document.category !== "reference") return false
    if (activeTab === "practice" && document.category !== "practice") return false
    return true
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Document Center</h1>
          <p className="text-muted-foreground">
            Access and download PDF documents including exams, assignments, lecture notes, and study materials
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search documents by title, subject, or topic..."
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
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="exam">Exams</TabsTrigger>
          <TabsTrigger value="assignment">Assignments</TabsTrigger>
          <TabsTrigger value="lecture-notes">Lecture Notes</TabsTrigger>
          <TabsTrigger value="study-guide">Study Guides</TabsTrigger>
          <TabsTrigger value="reference">Reference</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <ExamGrid exams={filteredDocuments} loading={loading} />
        </TabsContent>

        <TabsContent value="exam" className="space-y-6">
          <ExamGrid exams={filteredDocuments} loading={loading} />
        </TabsContent>

        <TabsContent value="assignment" className="space-y-6">
          <ExamGrid exams={filteredDocuments} loading={loading} />
        </TabsContent>

        <TabsContent value="lecture-notes" className="space-y-6">
          <ExamGrid exams={filteredDocuments} loading={loading} />
        </TabsContent>

        <TabsContent value="study-guide" className="space-y-6">
          <ExamGrid exams={filteredDocuments} loading={loading} />
        </TabsContent>

        <TabsContent value="reference" className="space-y-6">
          <ExamGrid exams={filteredDocuments} loading={loading} />
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <ExamGrid exams={filteredDocuments} loading={loading} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats && <ExamStatsComponent stats={stats} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
