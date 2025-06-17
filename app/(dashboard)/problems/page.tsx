"use client"

import { useState, useEffect } from "react"
import { problemsAPI } from "@/lib/realApi"
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

    if (difficultyFilter && difficultyFilter !== 'all') {
      filtered = filtered.filter((problem) => problem.difficulty === difficultyFilter)
    }

    if (topicFilter && topicFilter !== 'all') {
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
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
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
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleReset} className="w-full">
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problems List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-md bg-muted"></div>
              ))}
            </div>
          ) : filteredProblems.length > 0 ? (
            <div className="space-y-3">
              {filteredProblems.map((problem) => (
                <Link key={problem.id} href={`/problems/${problem.id}`}>
                  <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent">
                    <div>
                      <h3 className="font-medium">{problem.title}</h3>
                      <p className="text-sm text-muted-foreground">{problem.topic}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`capitalize badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs">{problem.pointValue} pts</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-muted p-8 text-center">
              <h3 className="mt-4 text-lg font-medium">No problems found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No problems match your search. Try other terms."
                  : "No problems available for this topic at the moment."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
