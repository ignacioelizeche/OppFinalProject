"use client"

import { useState, useEffect } from "react"
import { forumAPI } from "@/lib/realApi"
import type { ForumPost } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUp, ArrowDown, MessageSquare, Eye, CheckCircle, Pin, Lock, Clock, User } from "lucide-react"
import Link from "next/link"
import { parseISO, formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface ForumPostListProps {
  categoryId?: number
  searchQuery?: string
}

type SortOption = 'recent' | 'popular' | 'answered' | 'unanswered'

export default function ForumPostList({ categoryId, searchQuery }: ForumPostListProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const { toast } = useToast()

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      try {
        const data = await forumAPI.getPosts({ 
          categoryId, 
          sortBy,
          limit: 50 
        })
        setPosts(data.posts)
      } catch (error) {
        console.error("Failed to fetch posts:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load posts. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [categoryId, sortBy, toast])

  useEffect(() => {
    // Filter posts based on search query
    let filtered = posts
    
    if (searchQuery && searchQuery.trim()) {
      filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredPosts(filtered)
  }, [posts, searchQuery])

  const handleVote = async (postId: number, voteType: 'up' | 'down') => {
    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      // If user is clicking the same vote type, we want to toggle it off
      // If clicking different vote type, change to that type
      const isSameVote = post.userVote === voteType
      
      // For toggling off, we'll need to call a different approach
      // Since the API doesn't support 'remove', we'll handle the UI state directly
      if (isSameVote) {
        // Toggle off by updating UI state manually
        setPosts(posts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                votesUp: voteType === 'up' ? p.votesUp - 1 : p.votesUp,
                votesDown: voteType === 'down' ? p.votesDown - 1 : p.votesDown,
                userVote: null
              }
            : p
        ))
        return
      }
      
      // Call API for new vote or vote change
      const result = await forumAPI.votePost(postId, voteType)
      
      if (result.success) {
        setPosts(posts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                votesUp: result.newVoteCount.up,
                votesDown: result.newVoteCount.down,
                userVote: voteType
              }
            : p
        ))
      }
    } catch (error) {
      console.error("Failed to vote:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to register vote. Please try again.",
      })
    }
  }

  const getPostStatus = (post: ForumPost) => {
    const badges = []
    
    if (post.isSticky) {
      badges.push(
        <Badge key="sticky" variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Pin className="h-3 w-3 mr-1" />
          Pinned
        </Badge>
      )
    }
    
    if (post.isLocked) {
      badges.push(
        <Badge key="locked" variant="destructive">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      )
    }
    
    if (post.isAnswered) {
      badges.push(
        <Badge key="answered" variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Answered
        </Badge>
      )
    }
    
    return badges
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-3/4 rounded bg-muted"></div>
              <div className="h-4 w-1/2 rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sorting Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {filteredPosts.length} Post{filteredPosts.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </h3>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="unanswered">Unanswered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No posts found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No posts match your search for "${searchQuery}"`
                  : "Be the first to start a discussion in this category!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/forum/${post.id}`}
                      className="group"
                    >
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.authorName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true })}
                      </span>
                      <span>•</span>
                      <Badge 
                        variant="outline" 
                        style={{ borderColor: post.categoryColor, color: post.categoryColor }}
                      >
                        {post.categoryName}
                      </Badge>
                    </CardDescription>
                  </div>
                  
                  {/* Voting Controls */}
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(post.id, 'up')}
                      className={`h-8 w-8 p-0 ${post.userVote === 'up' ? 'text-green-600' : ''}`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-center min-w-[2ch]">
                      {post.votesUp - post.votesDown}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(post.id, 'down')}
                      className={`h-8 w-8 p-0 ${post.userVote === 'down' ? 'text-red-600' : ''}`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status Badges */}
                {getPostStatus(post).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {getPostStatus(post)}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views} {post.views === 1 ? 'view' : 'views'}
                    </span>
                  </div>
                  
                  <span>
                    Last activity {formatDistanceToNow(parseISO(post.lastActivityAt), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
