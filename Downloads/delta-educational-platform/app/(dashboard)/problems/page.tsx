"use client"

import { useState, useEffect } from "react"
import { problemsAPI } from "@/lib/api"
import type { Problem } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Search } from "lucide-react"

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("")
  const [topicFilter, setTopicFilter] = useState("")
  const [topics, setTopics] = useState<string[]>([])

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true)
      try {
        const data = await problemsAPI.getProblems()
        setProblems(data)
        setFilteredProblems(data)

        // Extract unique topics
        const uniqueTopics = Array.from(new Set(data.map((problem) => problem.topic)))
        setTopics(uniqueTopics)
      } catch (error) {
        console.error("Failed to fetch problems:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProblems()
  }, [])

  useEffect(() => {
    // Filter problems based on search term, difficulty, and topic
    let filtered = problems

    if (searchTerm) {
      filtered = filtered.filter(
        (problem) =>
          problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          problem.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (difficultyFilter) {
      filtered = filtered.filter((problem) => problem.difficulty === difficultyFilter)
    }

    if (topicFilter) {
      filtered = filtered.filter((problem) => problem.topic === topicFilter)
    }

    setFilteredProblems(filtered)
  }, [searchTerm, difficultyFilter, topicFilter, problems])

  const handleReset = () => {
    setSearchTerm("")
    setDifficultyFilter("")
    setTopicFilter("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Problems</CardTitle>
          <CardDescription>Find problems by title, difficulty, or topic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
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
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="flex items-end md:col-span-4">
              <Button variant="outline" onClick={handleReset} className="ml-auto">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeleton
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-3/4 rounded-md bg-muted"></div>
                <div className="h-4 w-1/2 rounded-md bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 rounded-md bg-muted"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredProblems.length > 0 ? (
          // Display problems
          filteredProblems.map((problem) => (
            <Link href={`/problems/${problem.id}`} key={problem.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{problem.title}</CardTitle>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        problem.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : problem.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  <CardDescription>{problem.topic}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{problem.description}</p>
                  <div className="mt-4 text-sm text-primary">{problem.pointValue} points</div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          // No problems found
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium">No problems found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

