"use client"

import { useState, useEffect } from "react"
import { leaderboardAPI } from "@/lib/api"
import type { LeaderboardEntry } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Trophy, Search, Medal } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [limit, setLimit] = useState("10")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchLeaderboard()
  }, [limit])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    try {
      const data = await leaderboardAPI.getLeaderboard(Number(limit))
      setLeaderboard(data.users)
      setFilteredLeaderboard(data.users)
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load leaderboard data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Filter leaderboard based on search term
    if (searchTerm) {
      const filtered = leaderboard.filter((entry) => entry.username.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredLeaderboard(filtered)
    } else {
      setFilteredLeaderboard(leaderboard)
    }
  }, [searchTerm, leaderboard])

  // Find the current user's rank
  const userRank = user ? leaderboard.find((entry) => entry.id === user.id)?.rank : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Students</CardTitle>
          <CardDescription>Students ranked by coin balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by username"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full sm:w-[180px] space-y-2">
                <Label htmlFor="limit">Show</Label>
                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger id="limit">
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="25">Top 25</SelectItem>
                    <SelectItem value="50">Top 50</SelectItem>
                    <SelectItem value="100">Top 100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {userRank && (
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {userRank}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Your Rank</p>
                      <p className="text-sm text-muted-foreground">{user?.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{user?.coinBalance} coins</span>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 animate-pulse rounded-md bg-muted">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-muted-foreground/20"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 rounded-md bg-muted-foreground/20"></div>
                      </div>
                    </div>
                    <div className="h-4 w-16 rounded-md bg-muted-foreground/20"></div>
                  </div>
                ))}
              </div>
            ) : filteredLeaderboard.length > 0 ? (
              <div className="space-y-2">
                {filteredLeaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-md ${
                      user?.id === entry.id ? "bg-primary/10" : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {entry.rank <= 3 ? (
                          <Medal
                            className={`h-5 w-5 ${
                              entry.rank === 1
                                ? "text-yellow-500"
                                : entry.rank === 2
                                  ? "text-gray-400"
                                  : "text-amber-700"
                            }`}
                          />
                        ) : (
                          <span className="text-sm font-medium">{entry.rank}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{entry.username}</p>
                        {user?.id === entry.id && <p className="text-xs text-primary">You</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{entry.coins} coins</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search to find what you're looking for.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

