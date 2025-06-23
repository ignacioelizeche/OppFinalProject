"use client"

import { useState, useEffect } from "react"
import { forumAPI } from "@/lib/realApi"
import type { ForumCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Plus, X, Hash, MessageSquare, FileText, Tag } from "lucide-react"

interface CreatePostFormProps {
  onPostCreated?: () => void
  defaultCategoryId?: number
}

export default function CreatePostForm({ onPostCreated, defaultCategoryId }: CreatePostFormProps) {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: defaultCategoryId || 0,
    tags: [] as string[]
  })

  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await forumAPI.getCategories()
        setCategories(data)
        
        // Set default category if not already set
        if (!formData.categoryId && data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }))
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen, formData.categoryId])

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase()
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a title, content, and select a category.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await forumAPI.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        tags: formData.tags
      })

      toast({
        title: "Post created successfully!",
        description: "Your post has been published and is now visible to the community.",
      })

      // Reset form
      setFormData({
        title: "",
        content: "",
        categoryId: defaultCategoryId || (categories.length > 0 ? categories[0].id : 0),
        tags: []
      })
      setTagInput("")
      setIsOpen(false)
      
      // Notify parent component
      onPostCreated?.()

    } catch (error) {
      console.error("Failed to create post:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the post. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Create New Post
            </DialogTitle>
            <DialogDescription>
              Share your questions, insights, or start a discussion with the community.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.categoryId.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <p className="text-xs text-muted-foreground">
                  {selectedCategory.description}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a clear, descriptive title"
                maxLength={200}
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Make your title clear and specific to get better responses</span>
                <span>{formData.title.length}/200</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe your question or topic in detail. Include context, what you've tried, and what specific help you need."
                className="min-h-[150px]"
                maxLength={5000}
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Provide details to help others understand and answer your question</span>
                <span>{formData.content.length}/5000</span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag and press Enter"
                    maxLength={20}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || formData.tags.length >= 5}
                  >
                    <Hash className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Tags help others find your post. You can add up to 5 tags.
                </p>
              </div>
            </div>

            {/* Preview Card */}
            {(formData.title || formData.content) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.title && (
                    <h4 className="font-semibold">{formData.title}</h4>
                  )}
                  {formData.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formData.content}
                    </p>
                  )}
                  {selectedCategory && (
                    <Badge variant="outline" style={{ borderColor: selectedCategory.color, color: selectedCategory.color }}>
                      {selectedCategory.name}
                    </Badge>
                  )}
                  {formData.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
