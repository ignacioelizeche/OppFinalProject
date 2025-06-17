"use client"

import { useState, useEffect, useCallback } from "react"
import { forumAPI } from "@/lib/realApi"
import type { ForumPost, ForumCategory } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X, Hash, TrendingUp, Clock } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface ForumSearchProps {
  onSearchResults?: (results: ForumPost[], query: string) => void
  placeholder?: string
}

const POPULAR_TAGS = [
  "calculus", "algebra", "geometry", "statistics", "trigonometry",
  "linear-algebra", "differential-equations", "integration", "limits",
  "help", "homework", "exam", "study-group"
]

export default function ForumSearch({ onSearchResults, placeholder = "Search posts, users, or topics..." }: ForumSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ForumPost[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await forumAPI.getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const performSearch = useCallback(async (searchQuery: string, categoryId?: number | null) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      onSearchResults?.([], "")
      return
    }

    setIsSearching(true)
    try {
      const results = await forumAPI.searchPosts(searchQuery, { 
        categoryId: categoryId || undefined 
      })
      setSearchResults(results)
      onSearchResults?.(results, searchQuery)
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
      onSearchResults?.([], searchQuery)
    } finally {
      setIsSearching(false)
    }
  }, [onSearchResults])

  useEffect(() => {
    performSearch(debouncedQuery, selectedCategory)
  }, [debouncedQuery, selectedCategory, performSearch])

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag))
    } else {
      setSelectedTags(prev => [...prev, tag])
      // Add tag to search query
      const newQuery = query ? `${query} #${tag}` : `#${tag}`
      setQuery(newQuery)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setSelectedCategory(null)
    setSelectedTags([])
    setSearchResults([])
    onSearchResults?.([], "")
  }

  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.name

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {(query || selectedCategory) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 w-8 p-0 ${showFilters ? 'bg-muted' : ''}`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={selectedCategory?.toString() || "all"} 
                  onValueChange={(value) => setSelectedCategory(value === "all" ? null : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
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
              </div>

              {/* Popular Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Popular Tags</label>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => handleTagClick(tag)}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Filters</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery("unanswered")}
                    className="text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Unanswered
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery("recent")}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Recent Posts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery("popular")}
                    className="text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {(selectedCategory || selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCategoryName && (
            <Badge variant="outline" className="gap-1">
              {selectedCategoryName}
              <button onClick={() => setSelectedCategory(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1">
              #{tag}
              <button onClick={() => handleTagClick(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Search Status */}
      {isSearching && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Searching...
          </div>
        </div>
      )}

      {/* Search Results Count */}
      {query && !isSearching && (
        <div className="text-sm text-muted-foreground">
          {searchResults.length === 0 
            ? `No results found for "${query}"` 
            : `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${query}"`
          }
        </div>
      )}
    </div>
  )
}
