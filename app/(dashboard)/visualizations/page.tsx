"use client"

import { useState, useEffect } from "react"
import { visualizationsAPI } from "@/lib/realApi"
import type { Visualization } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { LineChart, Search } from "lucide-react"
import Link from "next/link"

export default function VisualizationsPage() {
  const [visualizations, setVisualizations] = useState<Visualization[]>([])
  const [filteredVisualizations, setFilteredVisualizations] = useState<Visualization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [topicFilter, setTopicFilter] = useState("")
  const [topics, setTopics] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchVisualizations = async () => {
      setIsLoading(true)
      try {
        const data = await visualizationsAPI.getVisualizations()
        setVisualizations(data)
        setFilteredVisualizations(data)

        // Extract unique topics
        const uniqueTopics = Array.from(new Set(data.map((viz) => viz.topic)))
        setTopics(uniqueTopics)
      } catch (error) {
        console.error("Failed to fetch visualizations:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load visualizations. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVisualizations()
  }, [toast])

  useEffect(() => {
    // Filter visualizations based on search term and topic
    let filtered = visualizations

    if (searchTerm) {
      filtered = filtered.filter(
        (viz) =>
          viz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          viz.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (topicFilter) {
      filtered = filtered.filter((viz) => viz.topic === topicFilter)
    }

    setFilteredVisualizations(filtered)
  }, [searchTerm, topicFilter, visualizations])

  const handleReset = () => {
    setSearchTerm("")
    setTopicFilter("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Visualizations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mathematical Visualizations</CardTitle>
          <CardDescription>Interactive visualizations to help understand mathematical concepts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by title or description"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 w-3/4 rounded-md bg-muted"></div>
                      <div className="h-4 w-1/2 rounded-md bg-muted"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 rounded-md bg-muted"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredVisualizations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredVisualizations.map((viz) => (
                  <Link href={`/visualizations/${viz.id}`} key={viz.id}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle>{viz.title}</CardTitle>
                        <CardDescription>{viz.topic}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                          <LineChart className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{viz.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No visualizations found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || topicFilter
                    ? "Try adjusting your filters to find what you're looking for."
                    : "No visualizations are available at the moment."}
                </p>
                {(searchTerm || topicFilter) && (
                  <button onClick={handleReset} className="mt-4 text-primary hover:underline">
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

