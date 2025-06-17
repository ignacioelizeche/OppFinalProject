import type { 
  CalendarEvent, 
  Problem, 
  AuthResponse, 
  User, 
  LeaderboardResponse, 
  SubmitAnswerResponse, 
  ForumPost, 
  ForumCategory,
  Comment, 
  Visualization,
  DashboardStats,
  CalendarFilter,
  MockExam,
  ExamSession,
  ExamResult,
  ProblemAttempt
} from "./types"
import { localAuthSystem, ensureDefaultUser } from "./localStorageAuth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

/**
 * Real API client that makes actual HTTP requests to the backend
 * Falls back to local storage authentication when the backend is unavailable
 */

// Initialize the local storage with a default user if needed
if (typeof window !== 'undefined') {
  ensureDefaultUser();
}

// Helper function to make API requests
const fetchAPI = async (endpoint: string, method: string = 'GET', body?: Record<string, unknown>): Promise<unknown> => {
  try {
    // Set default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
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
      
      let errorMessage = '';
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (response.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid data provided. Please check your input.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = `API Error: ${response.status}`;
      }
      
      throw new Error(errorMessage);
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
      const response = await fetchAPI('/auth/login', 'POST', { email, password }) as AuthResponse
      return response
    } catch (error) {
      console.warn('Backend login failed, trying local auth:', error)
      const localResponse = localAuthSystem.loginUser({ email, password })
      if ('error' in localResponse) {
        throw new Error(localResponse.error)
      }
      return localResponse as AuthResponse
    }
  },

  register: async (email: string, password: string, username: string): Promise<AuthResponse> => {
    try {
      const response = await fetchAPI('/auth/register', 'POST', { email, password, username }) as AuthResponse
      return response
    } catch (error) {
      console.warn('Backend register failed, trying local auth:', error)
      const result = localAuthSystem.registerUser({ email, password, username, role: 'student' })
      if (result.success) {
        const loginResponse = localAuthSystem.loginUser({ email, password })
        if ('error' in loginResponse) {
          throw new Error(loginResponse.error)
        }
        return loginResponse as AuthResponse
      }
      throw new Error(result.message)
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetchAPI('/auth/logout', 'POST')
    } catch (error) {
      console.warn('Backend logout failed, clearing local auth:', error)
    }
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('token')
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Try to fetch updated user data from backend first
      const updatedUser = await fetchAPI('/users/me') as User | null
      
      // Update local storage with fresh data
      if (typeof window !== 'undefined') {
        localStorage.setItem('delta_current_user', JSON.stringify(updatedUser))
      }
      
      return updatedUser
    } catch (error) {
      console.warn('Backend getCurrentUser failed, falling back to local storage:', error)
      // Fall back to local storage if backend is unavailable
      return localAuthSystem.getCurrentUser()
    }
  }
}

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    return await fetchAPI("/dashboard/stats") as DashboardStats
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

  createEvent: async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    return await fetchAPI("/calendar/events", 'POST', event) as CalendarEvent
  },

  updateEvent: async (id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    return await fetchAPI(`/calendar/events/${id}`, 'PUT', event) as CalendarEvent
  },

  deleteEvent: async (id: number): Promise<void> => {
    await fetchAPI(`/calendar/events/${id}`, 'DELETE')
  }
}

// Problems API
export const problemsAPI = {
  getProblems: async (filters?: { difficulty?: string; topic?: string; status?: string; limit?: number }): Promise<Problem[]> => {
    const queryParams = new URLSearchParams()
    if (filters?.difficulty) queryParams.append("difficulty", filters.difficulty)
    if (filters?.topic) queryParams.append("topic", filters.topic)
    if (filters?.status) queryParams.append("status", filters.status)
    if (filters?.limit) queryParams.append("limit", filters.limit.toString())

    return await fetchAPI(`/problems?${queryParams.toString()}`) as Problem[]
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
  }
}

// Leaderboard API
export const leaderboardAPI = {
  getStats: async (timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly'): Promise<LeaderboardResponse> => {
    return await fetchAPI(`/leaderboard?timeframe=${timeframe}`) as LeaderboardResponse
  },

  getLeaderboard: async (limit?: number, period?: 'daily' | 'weekly' | 'monthly' | 'all-time'): Promise<LeaderboardResponse> => {
    const queryParams = new URLSearchParams()
    if (limit) queryParams.append("limit", limit.toString())
    if (period) queryParams.append("period", period)
    
    return await fetchAPI(`/leaderboard?${queryParams.toString()}`) as LeaderboardResponse
  }
}

// Forum API
export const forumAPI = {
  getPosts: async (filters?: { page?: number; limit?: number; categoryId?: number; sortBy?: string }): Promise<{ posts: ForumPost[], totalPages: number }> => {
    const queryParams = new URLSearchParams()
    if (filters?.page) queryParams.append("page", filters.page.toString())
    if (filters?.limit) queryParams.append("limit", filters.limit.toString())
    if (filters?.categoryId) queryParams.append("categoryId", filters.categoryId.toString())
    if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy)

    return await fetchAPI(`/forum/posts?${queryParams.toString()}`) as { posts: ForumPost[], totalPages: number }
  },

  getPost: async (id: number): Promise<ForumPost> => {
    return await fetchAPI(`/forum/posts/${id}`) as ForumPost
  },

  createPost: async (post: { title: string; content: string; categoryId: number; tags: string[] }): Promise<ForumPost> => {
    return await fetchAPI("/forum/posts", 'POST', post) as ForumPost
  },

  getComments: async (postId: number): Promise<Comment[]> => {
    return await fetchAPI(`/forum/posts/${postId}/comments`) as Comment[]
  },

  createComment: async (postId: number, content: string): Promise<Comment> => {
    return await fetchAPI(`/forum/posts/${postId}/comments`, 'POST', { content }) as Comment
  },

  getCategories: async (): Promise<ForumCategory[]> => {
    return await fetchAPI('/forum/categories') as ForumCategory[]
  },

  votePost: async (postId: number, voteType: 'up' | 'down'): Promise<{ success: boolean; newVoteCount: { up: number; down: number } }> => {
    return await fetchAPI(`/forum/posts/${postId}/vote`, 'POST', { voteType }) as { success: boolean; newVoteCount: { up: number; down: number } }
  },

  searchPosts: async (query: string, filters?: Record<string, unknown>) => {
    const queryParams = new URLSearchParams({ q: query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    return await fetchAPI(`/forum/search?${queryParams.toString()}`) as ForumPost[]
  },

  getForumStats: async () => {
    return await fetchAPI('/forum/stats')
  }
}

// Visualizations API
export const visualizationsAPI = {
  getVisualizations: async (): Promise<Visualization[]> => {
    return await fetchAPI("/visualizations") as Visualization[]
  },

  getVisualization: async (id: number): Promise<Visualization> => {
    return await fetchAPI(`/visualizations/${id}`) as Visualization
  }
}

// Mock Exam API
export const mockExamAPI = {
  getExams: async (): Promise<MockExam[]> => {
    return await fetchAPI('/exams') as MockExam[]
  },

  getExam: async (id: number): Promise<MockExam> => {
    return await fetchAPI(`/exams/${id}`) as MockExam
  },

  getExamById: async (id: number): Promise<MockExam> => {
    return await fetchAPI(`/exams/${id}`) as MockExam
  },

  startExam: async (examId: number): Promise<ExamSession> => {
    return await fetchAPI(`/exams/${examId}/start`, 'POST') as ExamSession
  },

  submitExam: async (sessionId: number, answers: Map<number, string>): Promise<ExamResult> => {
    const answersArray = Array.from(answers.entries())
    return await fetchAPI(`/exam-sessions/${sessionId}/submit`, 'POST', { answers: answersArray }) as ExamResult
  },

  getAttempts: async (): Promise<ExamResult[]> => {
    return await fetchAPI('/exam-attempts') as ExamResult[]
  },

  finishExam: async (attemptId: number): Promise<ExamResult> => {
    return await fetchAPI(`/exam-attempts/${attemptId}/finish`, 'POST') as ExamResult
  },

  submitAnswer: async (attemptId: number, questionId: number, answer: string): Promise<void> => {
    await fetchAPI(`/exam-attempts/${attemptId}/answers`, 'POST', { questionId, answer })
  },

  getStats: async () => {
    return await fetchAPI('/exams/stats')
  }
}
