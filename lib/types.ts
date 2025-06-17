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
  achievements?: string[]
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
  recentAchievements: Achievement[]
}

export interface Goal {
  id: number
  title: string
  description: string
  targetValue: number
  currentValue: number
  deadline: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  status: 'active' | 'completed' | 'failed'
  xpReward: number
  coinReward: number
}

export interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  unlockedAt: string
  xpReward: number
  coinReward: number
}

// Calendar types
export interface CalendarEvent {
  id: number
  title: string
  description: string
  eventType: 'lecture' | 'assignment' | 'exam' | 'lab' | 'office-hours' | 'review' | 'project' | 'personal'
  startTime: string
  endTime: string
  location?: string
  instructor?: string
  isAllDay: boolean
  isRecurring: boolean
  recurrencePattern?: 'daily' | 'weekly' | 'monthly'
  recurrenceEnd?: string
  attendees?: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  color?: string
  notificationEnabled: boolean
  notificationMinutes: number[]
  tags: string[]
  googleCalendarId?: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda'
  startDate: Date
  endDate: Date
}

export interface CalendarFilter {
  eventTypes: string[]
  priorities: string[]
  tags: string[]
  instructors: string[]
}

// Problem types
export interface Problem {
  id: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  pointValue: number
  xpValue?: number
  estimatedTime?: number
  tags?: string[]
  concepts?: string[]
  prerequisites?: number[]
  type?: 'multiple-choice' | 'short-answer' | 'essay'
  correctAnswer?: string
  choices?: string[]
  explanation?: string
  timeLimit?: number // in seconds
  createdAt?: string
  updatedAt?: string
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
  achievements?: Achievement[]
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
  achievements: string[]
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
  userVote?: 'up' | 'down' | null
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
  userVote?: 'up' | 'down' | null
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



// Mock Exam Center types
export interface MockExam {
  id: number
  title: string
  description: string
  subject: string
  duration: number // in minutes
  totalQuestions: number
  passingScore: number
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'practice' | 'simulation' | 'final'
  topics: string[]
  tags: string[]
  prerequisites: string[]
  instructions: string
  isPublic: boolean
  isActive: boolean
  createdBy: number
  createdByName: string
  createdAt: string
  updatedAt: string
  averageScore: number
  totalAttempts: number
  averageDuration: number
  questions: ExamQuestion[]
}

export interface ExamQuestion {
  id: number
  examId: number
  questionNumber: number
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'fill-blank'
  question: string
  options?: string[] // for multiple choice
  correctAnswer: string | string[]
  explanation: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  concept: string
  timeLimit?: number // in seconds, optional per-question time limit
  imageUrl?: string
  codeSnippet?: string
  hints: string[]
}

export interface ExamAttempt {
  id: number
  examId: number
  userId: number
  startTime: string
  endTime?: string
  duration: number // actual time taken in minutes
  status: 'in-progress' | 'completed' | 'abandoned' | 'paused'
  score: number
  percentage: number
  totalQuestions: number
  correctAnswers: number
  isPassing: boolean
  answers: ExamAnswer[]
  timeSpentPerQuestion: number[]
  feedback?: string
  notes?: string
}

export interface ExamAnswer {
  questionId: number
  selectedAnswer: string | string[]
  isCorrect: boolean
  timeSpent: number // in seconds
  isSkipped: boolean
  isMarkedForReview: boolean
  confidence: 1 | 2 | 3 | 4 | 5 // confidence level
}

export interface ExamResult {
  attempt: ExamAttempt
  exam: MockExam
  detailedResults: {
    questionId: number
    question: string
    selectedAnswer: string | string[]
    correctAnswer: string | string[]
    isCorrect: boolean
    points: number
    explanation: string
    topic: string
    timeSpent: number
  }[]
  topicBreakdown: {
    topic: string
    totalQuestions: number
    correctAnswers: number
    percentage: number
  }[]
  recommendations: string[]
  improvementAreas: string[]
}

export interface ExamStats {
  totalExams: number
  totalAttempts: number
  averageScore: number
  bestScore: number
  recentAttempts: ExamAttempt[]
  subjectBreakdown: {
    subject: string
    examsCount: number
    averageScore: number
    totalAttempts: number
  }[]
  difficultyBreakdown: {
    difficulty: string
    examsCount: number
    averageScore: number
  }[]
  topicPerformance: {
    topic: string
    totalQuestions: number
    correctAnswers: number
    accuracy: number
  }[]
}



export interface ExamSession {
  attemptId: number
  currentQuestionIndex: number
  answeredQuestions: Set<number>
  markedForReview: Set<number>
  timeRemaining: number // in seconds
  isPaused: boolean
  startTime: string
  answers: Map<number, ExamAnswer>
}



// Question Bank types for Mock Exams
export interface QuestionBank {
  id: number
  title: string
  description: string
  subject: string
  totalQuestions: number
  topics: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  isPublic: boolean
  createdBy: number
  createdAt: string
  questions: ExamQuestion[]
}

