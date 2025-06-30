import type {
  CalendarEvent,
  Problem,
  AuthResponse,
  User,
  LeaderboardResponse,
  LeaderboardEntry,
  LeaderboardStats,
  SubmitAnswerResponse,
  ForumPost,
  ForumCategory,
  Comment,
  DashboardStats,
  PDFDocument,
  PDFDocumentSession,
  PDFDocumentResult,
  ProblemAttempt,
  PDFDocumentStats,
  Achievement,
  UserAchievementsResponse,
} from "./types"
import { localAuthSystem, ensureDefaultUser } from "./localStorageAuth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

/**
 * Real API client that makes actual HTTP requests to the backend
 * Falls back to local storage authentication when the backend is unavailable
 */

// Initialize the local storage with a default user if needed
if (typeof window !== "undefined") {
  ensureDefaultUser()
}

// Helper function to make API requests
const fetchAPI = async (endpoint: string, method = "GET", body?: Record<string, unknown>): Promise<unknown> => {
  try {
    // Set default headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP Error: ${response.status}` }))

      let errorMessage = ""
      if (errorData.error) {
        errorMessage = errorData.error
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (response.status === 401) {
        errorMessage = "Authentication failed. Please check your credentials."
      } else if (response.status === 400) {
        errorMessage = "Invalid data provided. Please check your input."
      } else if (response.status === 404) {
        errorMessage = "Resource not found."
      } else if (response.status === 500) {
        errorMessage = "Server error. Please try again later."
      } else {
        errorMessage = `API Error: ${response.status}`
      }

      throw new Error(errorMessage)
    }

    // Parse JSON response
    return await response.json()
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// Auth API with fallback to local storage
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = (await fetchAPI("/auth/login", "POST", { email, password })) as AuthResponse
      return response
    } catch (error) {
      console.warn("Backend login failed, trying local auth:", error)
      const localResponse = localAuthSystem.loginUser({ email, password })
      if ("error" in localResponse) {
        throw new Error(localResponse.error)
      }
      return localResponse as AuthResponse
    }
  },

  register: async (email: string, password: string, username: string): Promise<AuthResponse> => {
    try {
      const response = (await fetchAPI("/auth/register", "POST", { email, password, username })) as AuthResponse
      return response
    } catch (error) {
      console.warn("Backend register failed, trying local auth:", error)
      const result = localAuthSystem.registerUser({ email, password, username, role: "student" })
      if (result.success) {
        const loginResponse = localAuthSystem.loginUser({ email, password })
        if ("error" in loginResponse) {
          throw new Error(loginResponse.error)
        }
        return loginResponse as AuthResponse
      }
      throw new Error(result.message)
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetchAPI("/auth/logout", "POST")
    } catch (error) {
      console.warn("Backend logout failed, clearing local auth:", error)
    }
    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("token")
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Try to fetch updated user data from backend first
      const updatedUser = (await fetchAPI("/users/me")) as User | null

      // Update local storage with fresh data
      if (typeof window !== "undefined") {
        localStorage.setItem("delta_current_user", JSON.stringify(updatedUser))
      }

      return updatedUser
    } catch (error) {
      console.warn("Backend getCurrentUser failed, falling back to local storage:", error)
      // Fall back to local storage if backend is unavailable
      return localAuthSystem.getCurrentUser()
    }
  },
}

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    return (await fetchAPI("/dashboard/stats")) as DashboardStats
  },
}

// Achievement API
export const achievementAPI = {
  // Get all available achievements
  getAllAchievements: async (): Promise<{
    achievements: Achievement[]
    totalCount: number
  }> => {
    return (await fetchAPI("/achievements")) as {
      achievements: Achievement[]
      totalCount: number
    }
  },

  // Get user's achievements with progress
  getUserAchievements: async (userId: number): Promise<{
    userId: number
    achievements: Achievement[]
    totalUnlocked: number
    tier: string
    tierColor: string
    stats: {
      level: number
      xpPoints: number
      problemsSolved: number
      streak: number
      forumContributions: number
      hardProblems: number
      mediumProblems: number
      easyProblems: number
    }
  }> => {
    return (await fetchAPI(`/achievements/user/${userId}`)) as {
      userId: number
      achievements: Achievement[]
      totalUnlocked: number
      tier: string
      tierColor: string
      stats: {
        level: number
        xpPoints: number
        problemsSolved: number
        streak: number
        forumContributions: number
        hardProblems: number
        mediumProblems: number
        easyProblems: number
      }
    }
  },

  // Check and unlock new achievements for a user
  checkAndUnlockAchievements: async (userId: number): Promise<{
    userId: number
    newAchievements: Achievement[]
    message: string
    timestamp: string
  }> => {
    return (await fetchAPI(`/achievements/check/${userId}`, "POST")) as {
      userId: number
      newAchievements: Achievement[]
      message: string
      timestamp: string
    }
  },
}

// Achievements API
export const achievementsAPI = {
  getAllAchievements: async (): Promise<{ achievements: Achievement[], totalCount: number }> => {
    return await fetchAPI("/achievements") as { achievements: Achievement[], totalCount: number }
  },

  getUserAchievements: async (userId: number): Promise<UserAchievementsResponse> => {
    return await fetchAPI(`/achievements/user/${userId}`) as UserAchievementsResponse
  },

  checkAndUnlockAchievements: async (userId: number): Promise<{ userId: number, newAchievements: Achievement[], message: string, timestamp: string }> => {
    return await fetchAPI(`/achievements/check/${userId}`, "POST") as { userId: number, newAchievements: Achievement[], message: string, timestamp: string }
  },
}

// Enhanced LeaderboardEntry to include tier and achievements
export interface EnhancedLeaderboardEntry extends LeaderboardEntry {
  tier: string
  tierColor: string
  achievements: string[] // Array of achievement names
}

// Update the leaderboard API to use enhanced entries
export const enhancedLeaderboardAPI = {
  getLeaderboard: async (
    limit?: number,
    period?: "daily" | "weekly" | "monthly" | "all-time",
  ): Promise<{
    users: EnhancedLeaderboardEntry[]
    stats: LeaderboardStats
    currentUserRank?: number
  }> => {
    const queryParams = new URLSearchParams()
    if (limit) queryParams.append("limit", limit.toString())
    if (period) queryParams.append("period", period)

    return (await fetchAPI(`/leaderboard?${queryParams.toString()}`)) as {
      users: EnhancedLeaderboardEntry[]
      stats: LeaderboardStats
      currentUserRank?: number
    }
  },
}

// Utility functions for achievements
export const achievementUtils = {
  // Filter achievements by tier
  filterByTier: (achievements: Achievement[], tier: Achievement["tier"]): Achievement[] => {
    return achievements.filter(achievement => achievement.tier === tier)
  },

  // Get unlocked achievements only
  getUnlocked: (achievements: Achievement[]): Achievement[] => {
    return achievements.filter(achievement => achievement.unlocked)
  },

  // Get achievements in progress (not unlocked but have some progress)
  getInProgress: (achievements: Achievement[]): Achievement[] => {
    return achievements.filter(achievement => !achievement.unlocked && achievement.progress > 0)
  },

  // Get recently unlocked achievements
  getRecentlyUnlocked: (achievements: Achievement[], days: number = 7): Achievement[] => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return achievements.filter(achievement => 
      achievement.unlocked && 
      achievement.unlockedDate && 
      new Date(achievement.unlockedDate) > cutoffDate
    )
  },

  // Sort achievements by progress (descending)
  sortByProgress: (achievements: Achievement[]): Achievement[] => {
    return [...achievements].sort((a, b) => b.progress - a.progress)
  },

  // Sort achievements by tier (Legendary first)
  sortByTier: (achievements: Achievement[]): Achievement[] => {
    const tierOrder = { "Legendary": 5, "Epic": 4, "Rare": 3, "Uncommon": 2, "Common": 1 }
    return [...achievements].sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier])
  },

  // Get achievement statistics
  getStats: (achievements: Achievement[]): {
    total: number
    unlocked: number
    completionPercentage: number
    byTier: Record<Achievement["tier"], number>
  } => {
    const total = achievements.length
    const unlocked = achievements.filter(a => a.unlocked).length
    const completionPercentage = total > 0 ? (unlocked / total) * 100 : 0
    
    const byTier = achievements.reduce((acc, achievement) => {
      acc[achievement.tier] = (acc[achievement.tier] || 0) + (achievement.unlocked ? 1 : 0)
      return acc
    }, {} as Record<Achievement["tier"], number>)
    
    return {
      total,
      unlocked,
      completionPercentage,
      byTier
    }
  },

  // Get tier information
  getTierInfo: (tier: string): {
    name: string
    color: string
    description: string
  } => {
    const tierMap = {
      "Grandmaster": { name: "Grandmaster", color: "#ff6b6b", description: "The ultimate achievement level" },
      "Diamond": { name: "Diamond", color: "#b19cd9", description: "Exceptional mastery and dedication" },
      "Platinum": { name: "Platinum", color: "#00d4aa", description: "Advanced skill and consistency" },
      "Gold": { name: "Gold", color: "#ffd700", description: "Strong performance and growth" },
      "Silver": { name: "Silver", color: "#c0c0c0", description: "Good progress and development" },
      "Bronze": { name: "Bronze", color: "#cd7f32", description: "Solid foundation building" },
      "Iron": { name: "Iron", color: "#8b8b8b", description: "Starting your journey" }
    }
    
    return tierMap[tier as keyof typeof tierMap] || tierMap["Iron"]
  }
}


// Calendar API
export const calendarAPI = {
  getEvents: async (start: string, end: string) => {
    // URL encode the dates to handle special characters like colons
    const encodedStart = encodeURIComponent(start)
    const encodedEnd = encodeURIComponent(end)
    return fetchAPI(`/calendar/events/${encodedStart}/${encodedEnd}`)
  },

  createEvent: async (event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> => {
    return (await fetchAPI("/calendar/events", "POST", event)) as CalendarEvent
  },

  updateEvent: async (id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    return (await fetchAPI(`/calendar/events/${id}`, "PUT", event)) as CalendarEvent
  },

  deleteEvent: async (id: number): Promise<void> => {
    await fetchAPI(`/calendar/events/${id}`, "DELETE")
  },
}

// Problems API
export const problemsAPI = {
  getProblems: async (difficulty: string, topic: string, status: string, limit: number) => {
    const encodedDiff = encodeURIComponent(difficulty)
    const encodedtopic = encodeURIComponent(topic)

    return await fetchAPI(`/problems/difficulty/${encodedDiff.toString()}/${encodedtopic.toString()}`) as Problem[]
  },

  getProblem: async (id: number): Promise<Problem> => {
    return await fetchAPI(`/problems/${id}`) as Problem
  },

  submitAnswer: async (problemId: number, answer: string): Promise<SubmitAnswerResponse> => {
    return await fetchAPI(`/problems/${problemId}/submit`, 'POST', { answer }) as SubmitAnswerResponse
  },

  getAttempts: async (problemId: number): Promise<ProblemAttempt[]> => {
    return await fetchAPI(`/problems/${problemId}/attempts`) as ProblemAttempt[]
  },

  getRecommendations: async (userId: number): Promise<Problem[]> => {
    return await fetchAPI(`/problems/recommendations/${userId}`) as Problem[]
  },

  createProblem: async (problem: Omit<Problem, "id">): Promise<Problem> => {
    return (await fetchAPI("/problems", "POST", problem)) as Problem
  },
}

// Leaderboard API
export const leaderboardAPI = {
  getStats: async (timeframe: "daily" | "weekly" | "monthly" | "all-time" = "weekly"): Promise<LeaderboardResponse> => {
    return (await fetchAPI(`/leaderboard?timeframe=${timeframe}`)) as LeaderboardResponse
  },

  getLeaderboard: async (
    limit?: number,
    period?: "daily" | "weekly" | "monthly" | "all-time",
  ): Promise<LeaderboardResponse> => {
    const queryParams = new URLSearchParams()
    if (limit) queryParams.append("limit", limit.toString())
    if (period) queryParams.append("period", period)

    return (await fetchAPI(`/leaderboard?${queryParams.toString()}`)) as LeaderboardResponse
  },
}

// Forum API
export const forumAPI = {
  getPosts: async (filters?: { page?: number; limit?: number; categoryId?: number; sortBy?: string }): Promise<{
    posts: ForumPost[]
    totalPages: number
  }> => {
    const queryParams = new URLSearchParams()
    if (filters?.page) queryParams.append("page", filters.page.toString())
    if (filters?.limit) queryParams.append("limit", filters.limit.toString())
    if (filters?.categoryId) queryParams.append("categoryId", filters.categoryId.toString())
    if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy)

    return (await fetchAPI(`/forum/posts?${queryParams.toString()}`)) as { posts: ForumPost[]; totalPages: number }
  },

  getPost: async (id: number): Promise<ForumPost> => {
    return (await fetchAPI(`/forum/posts/${id}`)) as ForumPost
  },

  createPost: async (post: {
    title: string
    content: string
    categoryId: number
    tags: string[]
  }): Promise<ForumPost> => {
    return (await fetchAPI("/forum/posts", "POST", post)) as ForumPost
  },

  getComments: async (postId: number): Promise<Comment[]> => {
    return (await fetchAPI(`/forum/posts/${postId}/comments`)) as Comment[]
  },

  createComment: async (postId: number, content: string): Promise<Comment> => {
    return (await fetchAPI(`/forum/posts/${postId}/comments`, "POST", { content })) as Comment
  },

  getCategories: async (): Promise<ForumCategory[]> => {
    return (await fetchAPI("/forum/categories")) as ForumCategory[]
  },

  votePost: async (
    postId: number,
    voteType: "up" | "down",
  ): Promise<{ success: boolean; newVoteCount: { up: number; down: number } }> => {
    return (await fetchAPI(`/forum/posts/${postId}/vote`, "POST", { voteType })) as {
      success: boolean
      newVoteCount: { up: number; down: number }
    }
  },

  searchPosts: async (query: string, filters?: Record<string, unknown>) => {
    const queryParams = new URLSearchParams({ q: query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    return (await fetchAPI(`/forum/search?${queryParams.toString()}`)) as ForumPost[]
  },

  getForumStats: async () => {
    return await fetchAPI("/forum/stats")
  },
}

// PDF Document API (formerly Mock Exam API)
export const mockExamAPI = {
  getExams: async (): Promise<PDFDocument[]> => {
    return (await fetchAPI("/documents")) as PDFDocument[]
  },

  getExam: async (id: number): Promise<PDFDocument> => {
    return (await fetchAPI(`/documents/view/${id}`)) as PDFDocument
  },

  getExamById: async (id: number): Promise<PDFDocument> => {
    return (await fetchAPI(`/documents/view/${id}`)) as PDFDocument
  },

  uploadDocument: async (requestBody: any): Promise<PDFDocument> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${API_BASE_URL}/documents/uploadExams`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody), // Send the wrapped object
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    return (await response.json()) as PDFDocument
  },

  startViewing: async (documentId: number): Promise<PDFDocumentSession> => {
    return (await fetchAPI(`/documents/${documentId}/start-viewing`, "POST")) as PDFDocumentSession
  },

  updateProgress: async (
    sessionId: number,
    progress: { currentPage: number; viewedPages: number[]; notes?: string },
  ): Promise<void> => {
    await fetchAPI(`/document-sessions/${sessionId}/progress`, "PUT", progress)
  },

  addBookmark: async (
    sessionId: number,
    bookmark: { pageNumber: number; title: string; notes?: string },
  ): Promise<void> => {
    await fetchAPI(`/document-sessions/${sessionId}/bookmarks`, "POST", bookmark)
  },

  finishViewing: async (sessionId: number): Promise<PDFDocumentResult> => {
    return (await fetchAPI(`/document-sessions/${sessionId}/finish`, "POST")) as PDFDocumentResult
  },

  rateDocument: async (documentId: number, rating: number): Promise<void> => {
    await fetchAPI(`/documents/${documentId}/rate`, "POST", { rating })
  },

  getStats: async (): Promise<PDFDocumentStats> => {
    return (await fetchAPI("/documents/stats")) as PDFDocumentStats
  },

  searchDocuments: async (
    query: string,
    filters?: { category?: string; subject?: string; difficulty?: string },
  ): Promise<PDFDocument[]> => {
    const queryParams = new URLSearchParams({ q: query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    return (await fetchAPI(`/documents/search?${queryParams.toString()}`)) as PDFDocument[]
  },
}