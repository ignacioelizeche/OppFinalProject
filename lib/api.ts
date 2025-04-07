import type { CalendarEvent, Problem, AuthResponse, User, LeaderboardResponse, ProblemAttempt } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:18080/api"

// Storage keys
const STORAGE_KEYS = {
  USERS: "delta_users",
  CURRENT_USER: "delta_current_user",
  PROBLEM_ATTEMPTS: "delta_problem_attempts",
}

// Get registered users from localStorage or initialize with demo user
const getRegisteredUsers = (): User[] => {
  if (typeof window === "undefined") return [getDefaultUser()]

  const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS)
  if (!storedUsers) {
    const defaultUsers = [getDefaultUser()]
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers))
    return defaultUsers
  }

  return JSON.parse(storedUsers)
}

// Get default demo user
const getDefaultUser = (): User => ({
  id: 1,
  username: "Demo User",
  email: "demo@example.com",
  role: "student",
  coinBalance: 500,
})

// Get problem attempts from localStorage
const getProblemAttempts = (): Record<number, ProblemAttempt[]> => {
  if (typeof window === "undefined") return {}

  const storedAttempts = localStorage.getItem(STORAGE_KEYS.PROBLEM_ATTEMPTS)
  return storedAttempts ? JSON.parse(storedAttempts) : {}
}

// Save problem attempts to localStorage
const saveProblemAttempts = (attempts: Record<number, ProblemAttempt[]>) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.PROBLEM_ATTEMPTS, JSON.stringify(attempts))
}

// Update user in the registered users list
const updateUser = (updatedUser: User) => {
  const users = getRegisteredUsers()
  const index = users.findIndex((u) => u.id === updatedUser.id)

  if (index !== -1) {
    users[index] = updatedUser
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

    // Also update current user if it's the same user
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === updatedUser.id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser))
    }
  }
}

// Get current user from localStorage
const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return storedUser ? JSON.parse(storedUser) : null
}

// Set current user in localStorage
const setCurrentUser = (user: User) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
}

// Mock data for problems
const MOCK_PROBLEMS: Problem[] = [
  {
    id: 1,
    title: "Quadratic Equations",
    description: "Solve the quadratic equation: x² + 5x + 6 = 0. Find both roots separated by a comma (e.g., -2,-3).",
    difficulty: "easy",
    topic: "Algebra",
    pointValue: 10,
  },
  {
    id: 2,
    title: "Pythagorean Theorem",
    description:
      "Find the hypotenuse of a right triangle with sides of length 3 and 4. Round to 2 decimal places if necessary.",
    difficulty: "easy",
    topic: "Geometry",
    pointValue: 10,
  },
  {
    id: 3,
    title: "Derivatives",
    description: "Find the derivative of f(x) = x³ + 2x² - 5x + 3. Write your answer in the form ax² + bx + c.",
    difficulty: "medium",
    topic: "Calculus",
    pointValue: 20,
  },
  {
    id: 4,
    title: "Integration",
    description:
      "Calculate the indefinite integral of f(x) = 2x + sin(x). Write your answer in the form 2x + C where C is the constant of integration.",
    difficulty: "hard",
    topic: "Calculus",
    pointValue: 30,
  },
  {
    id: 5,
    title: "Probability",
    description:
      "If you roll two fair dice, what is the probability of getting a sum of 7? Express your answer as a fraction in lowest terms (e.g., 1/6).",
    difficulty: "medium",
    topic: "Statistics",
    pointValue: 20,
  },
]

// Correct answers for problems
const PROBLEM_ANSWERS: Record<number, string> = {
  1: "-2,-3",
  2: "5",
  3: "3x² + 4x - 5",
  4: "x² - cos(x) + C",
  5: "1/6",
}

// Mock data for calendar events
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: "Algebra Lecture",
    description: "Introduction to quadratic equations",
    eventType: "lecture",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "Calculus Exam",
    description: "Mid-term examination covering derivatives and integrals",
    eventType: "exam",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Statistics Workshop",
    description: "Practical workshop on probability and distributions",
    eventType: "workshop",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock data for leaderboard
const MOCK_LEADERBOARD: LeaderboardResponse = {
  users: [
    { rank: 1, id: 2, username: "MathWizard", coins: 850 },
    { rank: 2, id: 3, username: "AlgebraMaster", coins: 720 },
    { rank: 3, id: 4, username: "GeometryPro", coins: 680 },
    { rank: 4, id: 5, username: "CalculusKing", coins: 650 },
    { rank: 5, id: 6, username: "StatisticsQueen", coins: 600 },
    { rank: 6, id: 1, username: "Demo User", coins: 500 },
    { rank: 7, id: 7, username: "NumberNinja", coins: 480 },
    { rank: 8, id: 8, username: "MathExplorer", coins: 450 },
    { rank: 9, id: 9, username: "ProblemSolver", coins: 420 },
    { rank: 10, id: 10, username: "LogicLearner", coins: 400 },
  ],
}

// Mock data for forum posts
const MOCK_FORUM_POSTS = [
  {
    id: 1,
    authorId: 2,
    authorName: "MathWizard",
    title: "Help with Calculus Problem",
    content: "I'm struggling with this integral: ∫(x²+2x+1)dx. Can someone help me solve it step by step?",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    authorId: 3,
    authorName: "AlgebraMaster",
    title: "Quadratic Formula Trick",
    content:
      "I discovered a neat trick for remembering the quadratic formula. Instead of -b±√(b²-4ac)/2a, think of it as...",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    authorId: 4,
    authorName: "GeometryPro",
    title: "Pythagorean Theorem Applications",
    content:
      "Beyond finding the hypotenuse, the Pythagorean theorem has many real-world applications. Let's discuss some examples...",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock data for forum comments
const MOCK_COMMENTS = [
  {
    id: 1,
    postId: 1,
    authorId: 3,
    authorName: "AlgebraMaster",
    content: "The integral of x²+2x+1 is (x³/3)+x²+x+C. First, you integrate each term separately...",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    postId: 1,
    authorId: 5,
    authorName: "CalculusKing",
    content:
      "Also note that x²+2x+1 can be rewritten as (x+1)², which might make it easier to understand conceptually.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock data for visualizations
const MOCK_VISUALIZATIONS = [
  {
    id: 1,
    title: "Quadratic Function Explorer",
    description:
      "Interactive visualization of how parameters affect the graph of a quadratic function f(x) = ax² + bx + c. Adjust the sliders to see how the graph changes.",
    visualizationType: "interactive",
    topic: "Algebra",
    dataPayload: {
      type: "quadratic",
      initialParams: { a: 1, b: 0, c: 0 },
      xRange: [-10, 10],
      yRange: [-10, 10],
    },
  },
  {
    id: 2,
    title: "Normal Distribution Simulator",
    description:
      "Explore how mean and standard deviation affect the normal distribution curve. Adjust parameters to see changes in real-time.",
    visualizationType: "interactive",
    topic: "Statistics",
    dataPayload: {
      type: "normal",
      initialParams: { mean: 0, stdDev: 1 },
      xRange: [-4, 4],
      yRange: [0, 0.5],
    },
  },
  {
    id: 3,
    title: "Trigonometric Functions Explorer",
    description: "Compare sine, cosine, and tangent functions with adjustable amplitude, period, and phase shift.",
    visualizationType: "interactive",
    topic: "Trigonometry",
    dataPayload: {
      type: "trigonometric",
      initialParams: { amplitude: 1, period: 1, phaseShift: 0 },
      xRange: [0, 360],
      yRange: [-2, 2],
    },
  },
]

// Mock API function that doesn't actually make network requests
async function mockFetchAPI(endpoint: string, options: RequestInit = {}) {
  console.log(`Mock API call to ${endpoint}`, options)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Auth endpoints
  if (endpoint === "/auth/register") {
    try {
      const userData = JSON.parse(options.body as string)
      const users = getRegisteredUsers()

      // Check if email already exists
      if (users.some((user) => user.email === userData.email)) {
        throw new Error("Email already registered")
      }

      // Create new user
      const newUser: User = {
        id: users.length + 1,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        coinBalance: 100, // Starting balance
      }

      users.push(newUser)
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  if (endpoint === "/auth/login") {
    try {
      const credentials = JSON.parse(options.body as string)
      const users = getRegisteredUsers()

      // Find user by email
      const user = users.find((user) => user.email === credentials.email)

      if (!user) {
        throw new Error("User not found")
      }

      // In a real app, we would check the password here
      // For demo purposes, we'll just accept any password

      // Set current user
      setCurrentUser(user)

      return {
        success: true,
        token: "mock-jwt-token-" + user.id,
        user: user,
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  if (endpoint === "/users/me") {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error("User not authenticated")
    }
    return currentUser
  }

  // Problems endpoints
  if (endpoint.startsWith("/problems")) {
    if (endpoint.includes("/submit")) {
      try {
        const problemId = Number.parseInt(endpoint.split("/")[2])
        const { answer } = JSON.parse(options.body as string)
        const correctAnswer = PROBLEM_ANSWERS[problemId]

        const isCorrect = answer.trim().toLowerCase() === correctAnswer.toLowerCase()

        // If correct, update user's coin balance
        if (isCorrect) {
          const currentUser = getCurrentUser()
          if (currentUser) {
            const problem = MOCK_PROBLEMS.find((p) => p.id === problemId)
            if (problem) {
              currentUser.coinBalance += problem.pointValue
              updateUser(currentUser)
            }
          }
        }

        // Track attempt
        const attempts = getProblemAttempts()
        if (!attempts[problemId]) {
          attempts[problemId] = []
        }

        attempts[problemId].push({
          id: problemId,
          title: MOCK_PROBLEMS.find((p) => p.id === problemId)?.title || "",
          difficulty: MOCK_PROBLEMS.find((p) => p.id === problemId)?.difficulty || "medium",
          correct: isCorrect,
          timestamp: new Date().toISOString(),
        })

        saveProblemAttempts(attempts)

        return {
          success: true,
          correct: isCorrect,
          message: isCorrect
            ? `Correct! You've earned ${MOCK_PROBLEMS.find((p) => p.id === problemId)?.pointValue || 0} points.`
            : "Incorrect. Try again!",
        }
      } catch (error) {
        console.error("Submit answer error:", error)
        throw error
      }
    }

    if (endpoint === "/problems/history") {
      const attempts = getProblemAttempts()
      return {
        attempts: Object.values(attempts).flat(),
      }
    }

    return MOCK_PROBLEMS
  }

  // Calendar endpoints
  if (endpoint.startsWith("/calendar")) {
    if (endpoint.includes("/events") && options.method === "POST") {
      // Handle event creation
      return { id: Date.now(), ...JSON.parse(options.body as string) }
    }
    return MOCK_EVENTS
  }

  // Leaderboard endpoints
  if (endpoint.startsWith("/leaderboard")) {
    // Get all users and sort by coin balance
    const users = getRegisteredUsers()
    const currentUser = getCurrentUser()

    // Create a copy of the mock leaderboard
    const leaderboard = { ...MOCK_LEADERBOARD }

    // If current user exists and is not the demo user, add them to the leaderboard
    if (currentUser && currentUser.id !== 1) {
      // Remove demo user
      leaderboard.users = leaderboard.users.filter((u) => u.id !== 1)

      // Add current user
      leaderboard.users.push({
        id: currentUser.id,
        username: currentUser.username,
        coins: currentUser.coinBalance,
        rank: 0, // Will be calculated below
      })

      // Sort by coins
      leaderboard.users.sort((a, b) => b.coins - a.coins)

      // Update ranks
      leaderboard.users.forEach((user, index) => {
        user.rank = index + 1
      })
    }

    return leaderboard
  }

  // Forum endpoints
  if (endpoint.startsWith("/forum")) {
    if (endpoint.includes("/comments")) {
      const postId = Number.parseInt(endpoint.split("/")[3])

      if (options.method === "POST") {
        // Handle comment creation
        const currentUser = getCurrentUser()
        if (!currentUser) {
          throw new Error("User not authenticated")
        }

        const { content } = JSON.parse(options.body as string)
        const newComment = {
          id: MOCK_COMMENTS.length + 1,
          postId,
          authorId: currentUser.id,
          authorName: currentUser.username,
          content,
          createdAt: new Date().toISOString(),
        }

        MOCK_COMMENTS.push(newComment)
        return newComment
      }

      return MOCK_COMMENTS.filter((comment) => comment.postId === postId)
    }

    if (endpoint.match(/\/forum\/posts\/\d+$/)) {
      const postId = Number.parseInt(endpoint.split("/").pop() || "0")
      return MOCK_FORUM_POSTS.find((post) => post.id === postId)
    }

    if (endpoint.includes("/posts") && options.method === "POST") {
      // Handle post creation
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      const { title, content } = JSON.parse(options.body as string)
      const newPost = {
        id: MOCK_FORUM_POSTS.length + 1,
        authorId: currentUser.id,
        authorName: currentUser.username,
        title,
        content,
        createdAt: new Date().toISOString(),
      }

      MOCK_FORUM_POSTS.push(newPost)
      return newPost
    }

    return MOCK_FORUM_POSTS
  }

  // Visualizations endpoints
  if (endpoint.startsWith("/visualizations")) {
    return MOCK_VISUALIZATIONS
  }

  // Default response
  return { success: true }
}

// Auth API calls
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string; role: string }) => {
    return mockFetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: { email: string; password: string }) => {
    return mockFetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }) as Promise<AuthResponse>
  },

  getCurrentUser: async () => {
    return mockFetchAPI("/users/me") as Promise<User>
  },
}

// Calendar API calls
export const calendarAPI = {
  getEvents: async (start: string, end: string) => {
    return mockFetchAPI(`/calendar/events?start=${start}&end=${end}`) as Promise<CalendarEvent[]>
  },

  createEvent: async (eventData: Omit<CalendarEvent, "id">) => {
    return mockFetchAPI("/calendar/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  },
}

// Problems API calls
export const problemsAPI = {
  getProblems: async (filters?: { difficulty?: string; topic?: string; limit?: number }) => {
    const queryParams = new URLSearchParams()
    if (filters?.difficulty) queryParams.append("difficulty", filters.difficulty)
    if (filters?.topic) queryParams.append("topic", filters.topic)
    if (filters?.limit) queryParams.append("limit", filters.limit.toString())

    return mockFetchAPI(`/problems?${queryParams.toString()}`) as Promise<Problem[]>
  },

  submitAnswer: async (problemId: number, answer: string) => {
    return mockFetchAPI(`/problems/${problemId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    })
  },

  getHistory: async () => {
    return mockFetchAPI("/problems/history")
  },

  createProblem: async (problemData: Omit<Problem, "id"> & { correctAnswer: string }) => {
    return mockFetchAPI("/problems", {
      method: "POST",
      body: JSON.stringify(problemData),
    })
  },

  getAttempts: (problemId: number): ProblemAttempt[] => {
    const attempts = getProblemAttempts()
    return attempts[problemId] || []
  },
}

// Leaderboard API calls
export const leaderboardAPI = {
  getLeaderboard: async (limit = 10) => {
    return mockFetchAPI(`/leaderboard?limit=${limit}`) as Promise<LeaderboardResponse>
  },
}

// Visualizations API calls
export const visualizationsAPI = {
  getVisualizations: async (topic?: string) => {
    const queryParams = new URLSearchParams()
    if (topic) queryParams.append("topic", topic)

    return mockFetchAPI(`/visualizations?${queryParams.toString()}`) as Promise<any[]>
  },
}

// Forum API calls
export const forumAPI = {
  getPosts: async (limit = 20) => {
    return mockFetchAPI(`/forum/posts?limit=${limit}`) as Promise<ForumPost[]>
  },

  createPost: async (postData: { title: string; content: string }) => {
    return mockFetchAPI("/forum/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    })
  },

  getPost: async (postId: number) => {
    return mockFetchAPI(`/forum/posts/${postId}`) as Promise<ForumPost>
  },

  getComments: async (postId: number) => {
    return mockFetchAPI(`/forum/posts/${postId}/comments`) as Promise<Comment[]>
  },

  createComment: async (postId: number, content: string) => {
    return mockFetchAPI(`/forum/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
  },
}

export interface ForumPost {
  id: number
  authorId: number
  authorName: string
  title: string
  content: string
  createdAt: string
}

export interface Comment {
  id: number
  postId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

