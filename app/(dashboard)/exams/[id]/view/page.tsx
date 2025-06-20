"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PDFViewer } from "@/components/pdf/pdf-viewer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PDFDocument } from "@/lib/types"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { mockExamAPI } from "@/lib/realApi"

export default function ExamViewPage() {
  const params = useParams()
  const router = useRouter()
  const examId = Number.parseInt(params.id as string)

  const [document, setDocument] = useState<PDFDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true)
        const documentData = await mockExamAPI.getExamById(examId)
        setDocument(documentData)
      } catch (error) {
        console.error("Failed to load document:", error)
        setError(error instanceof Error ? error.message : "Failed to load document")
      } finally {
        setLoading(false)
      }
    }

    loadDocument()
  }, [examId])

  const handleClose = () => {
    router.push("/exams")
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <Card className="p-12 max-w-md">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Document not found</h3>
            <p className="text-muted-foreground">
              The document you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
            </p>
            <Button onClick={handleClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <PDFViewer document={document} onClose={handleClose} />
}
