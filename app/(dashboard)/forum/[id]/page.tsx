"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { forumAPI } from "@/lib/realApi"
import type { ForumPost, Comment } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function PostDetailPage() {
  const { id } = useParams()
  const postId = Number(id)
  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPostAndComments = async () => {
      setIsLoading(true)
      try {
        const [postData, commentsData] = await Promise.all([forumAPI.getPost(postId), forumAPI.getComments(postId)])

        setPost(postData)
        setComments(commentsData)
      } catch (error) {
        console.error("Failed to fetch post data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load the post. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (postId) {
      fetchPostAndComments()
    }
  }, [postId, toast])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment required",
        description: "Please enter a comment before submitting.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await forumAPI.createComment(postId, newComment)

      // Refresh comments
      const updatedComments = await forumAPI.getComments(postId)
      setComments(updatedComments)

      // Clear input
      setNewComment("")

      toast({
        title: "Comment added",
        description: "Your comment has been successfully added.",
      })
    } catch (error) {
      console.error("Failed to submit comment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your comment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/forum" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Link>
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-3/4 rounded-md bg-muted"></div>
            <div className="h-4 w-1/2 rounded-md bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded-md bg-muted"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/forum" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium">Post not found</h3>
            <p className="text-muted-foreground">The requested post could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/forum" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>
            Posted by {post.authorName} on {format(parseISO(post.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            <p>{post.content}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{comment.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{comment.authorName}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No comments yet</h3>
              <p className="text-xs text-muted-foreground">Be the first to comment on this post.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmitComment} className="w-full space-y-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

