"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { PDFDocument } from "@/lib/types"
import { FileText, Download, Eye, AlertCircle, CheckCircle2, Target, Star, BookOpen, File } from "lucide-react"

interface ExamGridProps {
  exams: PDFDocument[]
  loading: boolean
}

export function ExamGrid({ exams, loading }: ExamGridProps) {
  const router = useRouter()
  const [downloadingDoc, setDownloadingDoc] = useState<number | null>(null)

  const handleDownloadPDF = async (document: PDFDocument) => {
    setDownloadingDoc(document.id)
    try {
      // Convert base64 to blob and download
      const byteCharacters = atob(document.pdfContent)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = document.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download PDF:", error)
    } finally {
      setDownloadingDoc(null)
    }
  }

  const handleViewDocument = (documentId: number) => {
    router.push(`/exams/${documentId}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "exam":
        return <Target className="h-4 w-4" />
      case "assignment":
        return <FileText className="h-4 w-4" />
      case "lecture-notes":
        return <BookOpen className="h-4 w-4" />
      case "study-guide":
        return <CheckCircle2 className="h-4 w-4" />
      case "reference":
        return <File className="h-4 w-4" />
      case "practice":
        return <Target className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "exam":
        return "bg-red-100 text-red-800 border-red-200"
      case "assignment":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "lecture-notes":
        return "bg-green-100 text-green-800 border-green-200"
      case "study-guide":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "reference":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "practice":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
          <h3 className="text-lg font-semibold">No documents found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search criteria to find more documents.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((document) => (
        <Card key={document.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2 mb-2">{document.title}</CardTitle>
                <CardDescription className="line-clamp-2">{document.description}</CardDescription>
              </div>
              {!document.isActive && <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className={`${getDifficultyColor(document.difficulty)} capitalize`}>
                {document.difficulty}
              </Badge>
              <Badge
                variant="outline"
                className={`${getCategoryColor(document.category)} capitalize flex items-center gap-1`}
              >
                {getCategoryIcon(document.category)}
                {document.category.replace("-", " ")}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Subject and Topics */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{document.subject}</p>
              <div className="flex flex-wrap gap-1">
                {document.topics.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {document.topics.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{document.topics.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{document.pageCount} pages</span>
              </div>
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <span>{formatFileSize(document.fileSize)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{document.totalViews} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>{document.totalDownloads} downloads</span>
              </div>
            </div>

            {/* Rating */}
            {document.ratingCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{document.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">({document.ratingCount} ratings)</span>
              </div>
            )}

            {/* Prerequisites */}
            {document.prerequisites.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Prerequisites:</p>
                <p className="text-xs text-muted-foreground">{document.prerequisites.join(", ")}</p>
              </div>
            )}

            {/* Additional Files */}
            {document.additionalFiles && document.additionalFiles.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Additional Files:</p>
                <div className="flex flex-wrap gap-1">
                  {document.additionalFiles.map((file) => (
                    <Badge key={file.id} variant="outline" className="text-xs">
                      {file.type.replace("-", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => handleViewDocument(document.id)} className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownloadPDF(document)}
                disabled={!document.isActive || downloadingDoc === document.id}
                className="flex-1"
              >
                {downloadingDoc === document.id ? (
                  "Downloading..."
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </>
                )}
              </Button>
            </div>

            {/* Creator and Date */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <div className="flex justify-between">
                <span>By {document.createdByName}</span>
                <span>{new Date(document.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
