"use client"

import { useState, useEffect } from "react"
import { forumAPI } from "@/lib/realApi"
import type { ForumCategory } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, TrendingUp, Users } from "lucide-react"

interface ForumCategoriesProps {
  categories?: ForumCategory[]
  selectedCategory?: number | null
  onCategorySelect?: (categoryId: number | null) => void
  isLoading?: boolean
}

export default function ForumCategories({ categories: propCategories, selectedCategory, onCategorySelect, isLoading: propIsLoading }: ForumCategoriesProps) {
  const [internalCategories, setInternalCategories] = useState<ForumCategory[]>([])
  const [internalIsLoading, setInternalIsLoading] = useState(true)

  const categories = propCategories || internalCategories
  const isLoading = propIsLoading !== undefined ? propIsLoading : internalIsLoading

  useEffect(() => {
    // Only fetch categories if not provided as props
    if (!propCategories) {
      const fetchCategories = async () => {
        try {
          const data = await forumAPI.getCategories()
          setInternalCategories(data)
        } catch (error) {
          console.error("Failed to fetch categories:", error)
        } finally {
          setInternalIsLoading(false)
        }
      }

      fetchCategories()
    }
  }, [propCategories])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-24 rounded bg-muted"></div>
              <div className="h-4 w-full rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        {onCategorySelect && (
          <button
            onClick={() => onCategorySelect(null)}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              !selectedCategory 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
              selectedCategory === category.id 
                ? "ring-2 ring-primary bg-primary/5" 
                : "hover:bg-muted/30"
            }`}
            style={{ borderLeftColor: category.color }}
            onClick={() => onCategorySelect?.(category.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </CardTitle>
              <CardDescription className="text-sm">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{category.postCount}</span>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.postCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0 ? 
                categories.reduce((max, cat) => cat.postCount > max.postCount ? cat : max).name.split(' ')[0]
                : "N/A"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Category with most posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Available topics
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
