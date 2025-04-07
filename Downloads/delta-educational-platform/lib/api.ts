import type { CalendarEvent, Problem } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:18080/api"

// Helper function for API calls
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from localStorage if available
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API request failed with status ${response.status}`)
    }

    // Parse JSON response
    return await response.json()
  } catch (error) {
    console.error("API request error:", error)
    throw error
  }
}

// Auth API calls
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string; role: string }) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: { email: string; password: string }) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  getCurrentUser: async () => {
    return fetchAPI("/users/me")
  },
}

// Calendar API calls
export const calendarAPI = {
  getEvents: async (start: string, end: string) => {
    return fetchAPI(`/calendar/events?start=${start}&end=${end}`)
  },

  createEvent: async (eventData: Omit<CalendarEvent, "id">) => {
    return fetchAPI("/calendar/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  },
}

// Problems API calls
export const problemsAPI = {
  getProblems: async (filters?: { difficulty?: string; topic?: string }) => {
    const queryParams = new URLSearchParams()
    if (filters?.difficulty) queryParams.append("difficulty", filters.difficulty)
    if (filters?.topic) queryParams.append("topic", filters.topic)

    return fetchAPI(`/problems?${queryParams.toString()}`)
  },

  submitAnswer: async (problemId: number, answer: string) => {
    return fetchAPI(`/problems/${problemId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    })
  },

  getHistory: async () => {
    return fetchAPI("/problems/history")
  },

  createProblem: async (problemData: Omit<Problem, "id"> & { correctAnswer: string }) => {
    return fetchAPI("/problems", {
      method: "POST",
      body: JSON.stringify(problemData),
    })
  },
}

// Leaderboard API calls
export const leaderboardAPI = {
  getLeaderboard: async (limit = 10) => {
    return fetchAPI(`/leaderboard?limit=${limit}`)
  },
}

// Visualizations API calls
export const visualizationsAPI = {
  getVisualizations: async (topic?: string) => {
    const queryParams = new URLSearchParams()
    if (topic) queryParams.append("topic", topic)

    return fetchAPI(`/visualizations?${queryParams.toString()}`)
  },
}

// Forum API calls
export const forumAPI = {
  getPosts: async (limit = 20) => {
    return fetchAPI(`/forum/posts?limit=${limit}`)
  },

  createPost: async (postData: { title: string; content: string }) => {
    return fetchAPI("/forum/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    })
  },

  getPost: async (postId: number) => {
    return fetchAPI(`/forum/posts/${postId}`)
  },

  getComments: async (postId: number) => {
    return fetchAPI(`/forum/posts/${postId}/comments`)
  },

  createComment: async (postId: number, content: string) => {
    return fetchAPI(`/forum/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
  },
}

