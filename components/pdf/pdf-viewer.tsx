"use client"

import { useState, useEffect } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ArrowLeft,
  FileText,
  Maximize2,
  Minimize2,
  Star,
  Eye,
  Calendar,
  User,
  BookOpen,
  Tag,
} from "lucide-react"
import type { PDFDocument } from "@/lib/types"

interface PDFViewerProps {
  document: PDFDocument
  onClose: () => void
}

export function PDFViewer({ document, onClose }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>("")

  useEffect(() => {
    // Convert base64 to blob URL
    try {
      const byteCharacters = atob(document.pdfContent)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error creating PDF URL:", error)
    }
  }, [document.pdfContent])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = document.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-900/20 text-green-400 border-green-700"
      case "medium":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-700"
      case "hard":
        return "bg-red-900/20 text-red-400 border-red-700"
      default:
        return "bg-gray-800 text-gray-300 border-gray-600"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "exam":
        return "bg-red-900/20 text-red-400 border-red-700"
      case "assignment":
        return "bg-blue-900/20 text-blue-400 border-blue-700"
      case "lecture-notes":
        return "bg-green-900/20 text-green-400 border-green-700"
      case "study-guide":
        return "bg-purple-900/20 text-purple-400 border-purple-700"
      case "reference":
        return "bg-gray-800 text-gray-300 border-gray-600"
      case "practice":
        return "bg-orange-900/20 text-orange-400 border-orange-700"
      default:
        return "bg-gray-800 text-gray-300 border-gray-600"
    }
  }

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"} flex flex-col bg-black text-white`}>
      {/* Header */}
      <div className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose} className="gap-2 text-white hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4" />
                Back to Exams
              </Button>
              <Separator orientation="vertical" className="h-6 bg-gray-700" />
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <h1 className="text-lg font-semibold text-white">{document.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`${getDifficultyColor(document.difficulty)} text-xs font-medium`}
                    >
                      {document.difficulty}
                    </Badge>
                    <Badge variant="outline" className={`${getCategoryColor(document.category)} text-xs font-medium`}>
                      {document.category.replace("-", " ")}
                    </Badge>
                    <span className="text-xs text-gray-400">{document.pageCount} pages</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 text-sm font-medium min-w-[60px] text-center text-white">{zoom}%</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2 bg-gray-700" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button onClick={handleDownload} className="button-primary gap-2 ml-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with document info */}
        {!isFullscreen && (
          <div className="w-80 border-r border-gray-800 bg-black">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Document Info */}
                <div className="card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                      <BookOpen className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
                      Document Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">Subject</p>
                      <p className="text-sm text-white font-medium">{document.subject}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">Description</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{document.description}</p>
                    </div>

                    {document.topics.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Topics</p>
                        <div className="flex flex-wrap gap-1">
                          {document.topics.map((topic) => (
                            <Badge
                              key={topic}
                              variant="secondary"
                              className="text-xs bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 border-blue-700"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {document.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {document.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {document.prerequisites.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Prerequisites</p>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {document.prerequisites.map((prereq) => (
                            <li key={prereq} className="flex items-start gap-2">
                              <span className="text-gray-500 mt-1">•</span>
                              <span>{prereq}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Statistics */}
                <div className="card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                      <Eye className="h-4 w-4" style={{ color: "var(--accent-red)" }} />
                      Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">Views</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{document.totalViews.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">Downloads</span>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {document.totalDownloads.toLocaleString()}
                      </span>
                    </div>

                    {document.ratingCount > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-400">Rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-white">{document.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({document.ratingCount})</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Details */}
                <div className="card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                      <FileText className="h-4 w-4 text-purple-400" />
                      Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">Created by</span>
                      </div>
                      <span className="text-sm font-medium text-white">{document.createdByName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">Created</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">File size</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {(document.fileSize / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  </CardContent>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1 bg-black">
          {pdfUrl ? (
            <div className="h-full w-full overflow-auto">
              <div 
                className="flex justify-center items-start p-4"
                style={{
                  minHeight: "100%",
                  minWidth: "100%",
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center top",
                    transition: "transform 0.2s ease-in-out",
                  }}
                >
                  <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=page-width`}
                    className="border-0 bg-white shadow-lg rounded-lg"
                    title={document.title}
                    style={{ 
                      width: "100%",
                      height: "1200px",
                      minWidth: "800px"
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                  style={{ borderColor: "var(--accent-blue)" }}
                ></div>
                <p className="text-gray-400">Loading PDF...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}