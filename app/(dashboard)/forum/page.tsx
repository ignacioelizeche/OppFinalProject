"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { forumAPI } from "@/lib/api"
import type { ForumPost } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, Plus, Search } from "lucide-react"
import Link from "next/link"
import { format, parseISO } from "date-fns"

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state for creating a new post
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const data = await forumAPI.getPosts()
      setPosts(data)
      setFilteredPosts(data)
    } catch (error) {
      console.error("Failed to fetch forum posts:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load forum posts. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Filter posts based on search term
    if (searchTerm) {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.authorName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPosts(filtered)
    } else {
      setFilteredPosts(posts)
    }
  }, [searchTerm, posts])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a title and content for your post.",
      })
      return
    }

    try {
      await forumAPI.createPost(newPost)

      toast({
        title: "Post created",
        description: "Your post has been successfully created.",
      })

      setIsDialogOpen(false)
      fetchPosts()

      // Reset form
      setNewPost({
        title: "",
        content: "",
      })
    } catch (error) {
      console.error("Failed to create post:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the post. Please try again.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <form onSubmit={handleCreatePost}>
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>Share your thoughts, questions, or insights with the community.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Write your post content here..."
                    className="min-h-[200px]"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Post</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discussion Forum</CardTitle>
          <CardDescription>Engage with the community by asking questions and sharing insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts by title, content, or author"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2 rounded-md border p-4">
                    <div className="h-5 w-3/4 rounded-md bg-muted"></div>
                    <div className="h-4 w-1/2 rounded-md bg-muted"></div>
                    <div className="h-20 rounded-md bg-muted"></div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <Link href={`/forum/${post.id}`} key={post.id}>
                    <div className="rounded-md border p-4 transition-colors hover:bg-accent">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{post.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(post.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">By {post.authorName}</div>
                      <p className="mt-2 line-clamp-2 text-sm">{post.content}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No posts found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No posts match your search criteria. Try a different search term."
                    : "Be the first to start a discussion by creating a new post."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

