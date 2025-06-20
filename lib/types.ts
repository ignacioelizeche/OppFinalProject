// User types
export interface User {
  id: number
  username: string
  email: string
  role: string
  coinBalance: number
  xpPoints?: number
  xp?: number
  level?: number
  streak?: number
  totalProblemsCompleted?: number
  lastLoginDate?: string
  joinDate?: string
  totalPoints?: number
  weeklyPoints?: number
  monthlyPoints?: number
  problemsSolved?: number
  lastActive?: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

// Dashboard types
export interface DashboardStats {
  weeklyProgress: {
    problemsSolved: number
    studyHours: number
    conceptsMastered: number
    targetProblems: number
    targetHours: number
    targetConcepts: number
  }
  todaysFocus: {
    upcomingDeadlines: CalendarEvent[]
    recommendedProblems: Problem[]
    activeGoals: Goal[]
  }
  performanceHeatmap: {
    dates: string[]
    activities: number[]
  }
}

export interface Goal {
  id: number
  title: string
  description: string
  targetValue: number
  currentValue: number
  deadline: string
  type: "daily" | "weekly" | "monthly" | "custom"
  status: "active" | "completed" | "failed"
  xpReward: number
  coinReward: number
}

// Calendar types
export interface CalendarEvent {
  id: number
  title: string
  description: string
  eventType:
    | "lecture"
    | "assignment"
    | "exam"
    | "lab"
    | "office-hours"
    | "review"
    | "project"
    | "study-group"
    | "personal"
  startTime: string
  endTime: string
  attendees?: string[]
  priority: "low" | "medium" | "high" | "urgent"
  color?: string
  googleCalendarId?: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface CalendarView {
  type: "month" | "week" | "day" | "agenda"
  startDate: Date
  endDate: Date
}

export interface CalendarFilter {
  eventTypes: string[]
  priorities: string[]
}

// Problem types
export interface Problem {
  id: number
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard" | "expert"
  topic: string
  pointValue: number
  xpValue?: number
  estimatedTime?: number
  timeLimit?: number
  tags?: string[]
  concepts?: string[]
  prerequisites?: number[]
  type: "multiple_choice" | "short_answer" | "essay" | "code" | "true_false"
  correctAnswer?: string
  choices?: string[]
  explanation?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: number
}

export interface ProblemAttempt {
  id: number
  problemId: number
  title: string
  difficulty: string
  correct: boolean
  timestamp: string
  timeSpent: number
  xpEarned: number
  coinsEarned: number
}

export interface ProblemHistory {
  attempts: ProblemAttempt[]
  totalSolved: number
  totalTime: number
  averageAccuracy: number
  streakCount: number
}

export interface SubmitAnswerResponse {
  success: boolean
  correct: boolean
  message: string
  xpEarned?: number
  coinsEarned?: number
  pointsEarned?: number
  newLevel?: number
  explanation?: string
  nextSuggestedProblem?: number
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number
  id: number
  username: string
  coins: number
  avatar?: string
  level?: number
  badge?: string
  badgeColor?: string
  totalPoints: number
  weeklyPoints: number
  monthlyPoints: number
  problemsSolved: number
  forumContributions: number
  streak: number
  joinDate: string
  lastActive: string
  isCurrentUser?: boolean
}

export interface LeaderboardStats {
  totalUsers: number
  averagePoints: number
  topPerformer: {
    username: string
    points: number
  }
  weeklyGrowth: number
}

export interface LeaderboardResponse {
  users: LeaderboardEntry[]
  stats: LeaderboardStats
  currentUserRank?: number
}

// Visualization types
export interface Visualization {
  id: number
  title: string
  description: string
  visualizationType: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataPayload: any
  topic: string
}

// Forum types
export interface ForumCategory {
  id: number
  name: string
  description: string
  color: string
  icon: string
  postCount: number
}

export interface ForumPost {
  id: number
  authorId: number
  authorName: string
  title: string
  content: string
  categoryId: number
  categoryName: string
  categoryColor: string
  tags: string[]
  views: number
  votesUp: number
  votesDown: number
  userVote?: "up" | "down" | null
  commentCount: number
  isSticky: boolean
  isLocked: boolean
  isAnswered: boolean
  acceptedAnswerId?: number
  lastActivityAt: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  postId: number
  authorId: number
  authorName: string
  authorRole: string
  content: string
  votesUp: number
  votesDown: number
  userVote?: "up" | "down" | null
  isAcceptedAnswer: boolean
  parentCommentId?: number
  replies: Comment[]
  createdAt: string
  updatedAt: string
}

export interface ForumStats {
  totalPosts: number
  totalComments: number
  activeUsers: number
  topContributors: {
    id: number
    username: string
    postCount: number
    commentCount: number
  }[]
}

// PDF Document Center types (formerly Mock Exam Center)
export interface PDFDocument {
  id: number
  title: string
  description: string
  subject: string
  category: "exam" | "assignment" | "lecture-notes" | "study-guide" | "reference" | "practice"
  difficulty: "easy" | "medium" | "hard"
  topics: string[]
  tags: string[]
  prerequisites: string[]

  // PDF file information
  fileName: string
  fileSize: number // in bytes
  pdfContent: string // base64 encoded PDF
  pageCount: number

  // Metadata
  isPublic: boolean
  isActive: boolean
  createdBy: number
  createdByName: string
  createdAt: string
  updatedAt: string

  // Usage statistics
  totalDownloads: number
  totalViews: number
  averageRating: number
  ratingCount: number

  // Additional files (answer keys, solutions, etc.)
  additionalFiles?: PDFAttachment[]
}

export interface PDFAttachment {
  id: number
  documentId: number
  fileName: string
  fileSize: number
  pdfContent: string // base64 encoded
  type: "answer-key" | "solution" | "supplement" | "reference"
  description: string
  createdAt: string
}

export interface PDFDocumentAttempt {
  id: number
  documentId: number
  userId: number
  startTime: string
  endTime?: string
  duration: number // time spent viewing/working in minutes
  status: "viewing" | "completed" | "downloaded"
  progress: number // percentage of document viewed/completed
  notes?: string
  bookmarks: PDFBookmark[]
  createdAt: string
}

export interface PDFBookmark {
  id: number
  attemptId: number
  pageNumber: number
  title: string
  notes?: string
  createdAt: string
}

export interface PDFDocumentResult {
  attempt: PDFDocumentAttempt
  document: PDFDocument
  timeSpent: number
  pagesViewed: number[]
  bookmarksCreated: number
  notesCount: number
}

export interface PDFDocumentStats {
  totalDocuments: number
  totalViews: number
  totalDownloads: number
  averageRating: number
  recentViews: PDFDocumentAttempt[]
  categoryBreakdown: {
    category: string
    documentsCount: number
    totalViews: number
    totalDownloads: number
  }[]
  subjectBreakdown: {
    subject: string
    documentsCount: number
    averageRating: number
    totalViews: number
  }[]
  topDocuments: {
    id: number
    title: string
    views: number
    downloads: number
    rating: number
  }[]
}

export interface PDFDocumentSession {
  attemptId: number
  currentPage: number
  totalPages: number
  viewedPages: Set<number>
  bookmarks: PDFBookmark[]
  notes: string
  startTime: string
  lastActivity: string
}

// Question Bank types for PDF Documents (for searchable content)
export interface DocumentContent {
  id: number
  documentId: number
  pageNumber: number
  textContent: string // extracted text for search
  keywords: string[]
  topics: string[]
  difficulty?: "easy" | "medium" | "hard"
}

// Legacy types for backward compatibility
export type MockExam = PDFDocument
export type ExamQuestion = never // No longer used
export type ExamAttempt = PDFDocumentAttempt
export type ExamAnswer = never // No longer used
export type ExamResult = PDFDocumentResult
export type ExamStats = PDFDocumentStats
export type ExamSession = PDFDocumentSession
export type QuestionBank = never // No longer used
