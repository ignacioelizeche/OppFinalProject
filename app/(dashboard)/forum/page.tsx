"use client"

import React, { useState, useEffect } from "react"
import { forumAPI } from "@/lib/realApi"
import type { ForumPost, ForumCategory, ForumStats } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Plus, TrendingUp, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ForumCategories from "@/components/forum/forum-categories"
import ForumPostList from "@/components/forum/forum-post-list"
import CreatePostForm from "@/components/forum/create-post-form"
import ForumSearch from "@/components/forum/forum-search"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [stats, setStats] = useState<ForumStats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const [categoriesData, statsData] = await Promise.all([
          forumAPI.getCategories(),
          forumAPI.getForumStats()
        ])
        setCategories(categoriesData as ForumCategory[])
        setStats(statsData as ForumStats)
      } catch (error) {
        console.error("Failed to load forum data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load forum data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialData()
  }, [toast])

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setSearchQuery("") // Clear search when changing category
  }

  const handleSearchResults = (results: ForumPost[]) => {
    // The search component handles its own results display
    setSearchQuery(results.length > 0 ? "searching" : "")
  }

  const handlePostCreated = () => {
    setIsCreateDialogOpen(false)
    toast({
      title: "Post created",
      description: "Your post has been successfully created.",
    })
    // The PostList component will automatically refresh
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
          <p className="text-muted-foreground">
            Engage with the community by asking questions and sharing insights
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <CreatePostForm
              onPostCreated={handlePostCreated}
              defaultCategoryId={selectedCategory || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Forum Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <ForumSearch onSearchResults={handleSearchResults} />
          
          {/* Categories */}
          <ForumCategories
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            isLoading={isLoading}
          />
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Selected Category Banner */}
          {selectedCategoryData && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                style={{ backgroundColor: selectedCategoryData.color + '20', color: selectedCategoryData.color }}
              >
                {selectedCategoryData.icon} {selectedCategoryData.name}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCategorySelect(null)}
                className="text-xs"
              >
                Clear filter
              </Button>
            </div>
          )}

          {/* Posts List */}
          <ForumPostList
            categoryId={selectedCategory || undefined}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  )
}

