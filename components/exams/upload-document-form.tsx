"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { mockExamAPI } from "@/lib/realApi"
import type { PDFDocument } from "@/lib/types"
import { Upload, X, FileText, Plus } from "lucide-react"

interface UploadDocumentFormProps {
  onDocumentUploaded?: (document: PDFDocument) => void
}

export function UploadDocumentForm({ onDocumentUploaded }: UploadDocumentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    category: "",
    difficulty: "",
    topics: [] as string[],
    tags: [] as string[],
    prerequisites: [] as string[],
  })
  const [currentTopic, setCurrentTopic] = useState("")
  const [currentTag, setCurrentTag] = useState("")
  const [currentPrerequisite, setCurrentPrerequisite] = useState("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      // Auto-fill title if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.pdf$/i, "")
        setFormData((prev) => ({ ...prev, title: fileName }))
      }
    } else {
      alert("Please select a valid PDF file")
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const addTopic = () => {
    if (currentTopic.trim() && !formData.topics.includes(currentTopic.trim())) {
      setFormData((prev) => ({
        ...prev,
        topics: [...prev.topics, currentTopic.trim()],
      }))
      setCurrentTopic("")
    }
  }

  const removeTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t !== topic),
    }))
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const addPrerequisite = () => {
    if (currentPrerequisite.trim() && !formData.prerequisites.includes(currentPrerequisite.trim())) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, currentPrerequisite.trim()],
      }))
      setCurrentPrerequisite("")
    }
  }

  const removePrerequisite = (prerequisite: string) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((p) => p !== prerequisite),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedFile) {
      alert("Please select a PDF file")
      return
    }

    if (!formData.title || !formData.subject || !formData.category || !formData.difficulty) {
      alert("Please fill in all required fields")
      return
    }

    setIsUploading(true)

    try {
      // Convert PDF to base64
      const pdfBase64 = await convertFileToBase64(selectedFile)

    // Create the document data
      const documentData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        category: formData.category,
        difficulty: formData.difficulty,
        topics: formData.topics,
        tags: formData.tags,
        prerequisites: formData.prerequisites,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        pdfContent: pdfBase64,
        pageCount: 0,
        isPublic: true,
        isActive: true,
      }

      const requestBody = {
        documentData: documentData  // Wrap it in documentData property
      }

      const uploadedDocument = await mockExamAPI.uploadDocument(requestBody)

      // Call the callback if provided
      if (onDocumentUploaded) {
        onDocumentUploaded(uploadedDocument)
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        subject: "",
        category: "",
        difficulty: "",
        topics: [],
        tags: [],
        prerequisites: [],
      })
      setSelectedFile(null)
      setIsOpen(false)

      alert("Document uploaded successfully!")
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload PDF Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf-file">PDF File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-blue-500 mx-auto" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <p>Click to select a PDF file or drag and drop</p>
                  <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("pdf-file")?.click()}>
                    Select PDF File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Mathematics, Physics, Computer Science"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the content and purpose of this document"
              rows={3}
            />
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="lecture-notes">Lecture Notes</SelectItem>
                  <SelectItem value="study-guide">Study Guide</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <Label>Topics</Label>
            <div className="flex gap-2">
              <Input
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                placeholder="Add a topic"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
              />
              <Button type="button" onClick={addTopic} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                  {topic}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTopic(topic)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-2">
            <Label>Prerequisites</Label>
            <div className="flex gap-2">
              <Input
                value={currentPrerequisite}
                onChange={(e) => setCurrentPrerequisite(e.target.value)}
                placeholder="Add a prerequisite"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPrerequisite())}
              />
              <Button type="button" onClick={addPrerequisite} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.prerequisites.map((prerequisite) => (
                <Badge key={prerequisite} variant="destructive" className="flex items-center gap-1">
                  {prerequisite}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removePrerequisite(prerequisite)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
