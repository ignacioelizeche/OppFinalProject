"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Save, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { problemsAPI } from "@/lib/realApi"
import { useToast } from "@/components/ui/use-toast"

interface CreateProblemFormProps {
  onSuccess?: () => void
}

export function CreateProblemForm({ onSuccess }: CreateProblemFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic: "",
    difficulty: "",
    pointValue: 10,
    xpValue: 15,
    estimatedTime: 30,
    correctAnswer: "",
    explanation: "",
    concepts: [] as string[],
    tags: [] as string[],
    prerequisites: [] as string[],
  })

  // Input states for adding arrays
  const [newConcept, setNewConcept] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newPrerequisite, setNewPrerequisite] = useState("")

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addToArray = (field: "concepts" | "tags" | "prerequisites", value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }))
    }
  }

  const removeFromArray = (field: "concepts" | "tags" | "prerequisites", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.title ||
      !formData.description ||
      !formData.topic ||
      !formData.difficulty ||
      !formData.correctAnswer
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await problemsAPI.createProblem({
        ...formData,
        id: 0, // Will be assigned by backend
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "¡Éxito!",
        description: "El problema ha sido creado correctamente",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        topic: "",
        difficulty: "",
        pointValue: 10,
        xpValue: 15,
        estimatedTime: 30,
        correctAnswer: "",
        explanation: "",
        concepts: [],
        tags: [],
        prerequisites: [],
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el problema. Inténtalo de nuevo.",
        variant: "destructive",
      })
      console.error("Error creating problem:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const topics = [
    "algebra",
    "calculus",
    "geometry",
    "statistics",
    "trigonometry",
    "linear-algebra",
    "differential-equations",
    "discrete-math",
    "number-theory",
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Crear Nuevo Problema
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Vista Previa del Problema</DialogTitle>
                  <DialogDescription>Así se verá el problema para los estudiantes</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        formData.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : formData.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {formData.difficulty}
                    </Badge>
                    <Badge variant="outline">{formData.topic}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formData.pointValue} pts • {formData.xpValue} XP • ~{formData.estimatedTime}min
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{formData.title || "Título del problema"}</h3>
                    <p className="text-muted-foreground mt-2">{formData.description || "Descripción del problema"}</p>
                  </div>
                  {formData.concepts.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Conceptos:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.concepts.map((concept, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>Completa la información para crear un nuevo problema matemático</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Resolver ecuación cuadrática"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Tema *</Label>
                <Select value={formData.topic} onValueChange={(value) => handleInputChange("topic", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic.charAt(0).toUpperCase() + topic.slice(1).replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Problema *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe el problema de manera clara y detallada..."
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Configuración */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificultad *</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pointValue">Puntos</Label>
                <Input
                  id="pointValue"
                  type="number"
                  value={formData.pointValue}
                  onChange={(e) => handleInputChange("pointValue", Number.parseInt(e.target.value) || 0)}
                  min="1"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xpValue">XP</Label>
                <Input
                  id="xpValue"
                  type="number"
                  value={formData.xpValue}
                  onChange={(e) => handleInputChange("xpValue", Number.parseInt(e.target.value) || 0)}
                  min="1"
                  max="200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Tiempo (min)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => handleInputChange("estimatedTime", Number.parseInt(e.target.value) || 0)}
                  min="5"
                  max="180"
                />
              </div>
            </div>

            <Separator />

            {/* Respuesta y Explicación */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="correctAnswer">Respuesta Correcta *</Label>
                <Textarea
                  id="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                  placeholder="Ingresa la respuesta correcta..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="explanation">Explicación</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => handleInputChange("explanation", e.target.value)}
                  placeholder="Explica cómo resolver el problema..."
                />
              </div>
            </div>

            <Separator />

            {/* Conceptos */}
            <div className="space-y-3">
              <Label>Conceptos Clave</Label>
              <div className="flex gap-2">
                <Input
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  placeholder="Ej: ecuaciones cuadráticas"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addToArray("concepts", newConcept)
                      setNewConcept("")
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addToArray("concepts", newConcept)
                    setNewConcept("")
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.concepts.map((concept, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {concept}
                    <button
                      type="button"
                      onClick={() => removeFromArray("concepts", index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Etiquetas</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ej: examen, práctica"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addToArray("tags", newTag)
                      setNewTag("")
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addToArray("tags", newTag)
                    setNewTag("")
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeFromArray("tags", index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="space-y-3">
              <Label>Prerrequisitos (IDs de problemas)</Label>
              <div className="flex gap-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Ej: 1, 2, 3"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addToArray("prerequisites", newPrerequisite)
                      setNewPrerequisite("")
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addToArray("prerequisites", newPrerequisite)
                    setNewPrerequisite("")
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.prerequisites.map((prereq, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    Problema {prereq}
                    <button
                      type="button"
                      onClick={() => removeFromArray("prerequisites", index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Creando..." : "Crear Problema"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
