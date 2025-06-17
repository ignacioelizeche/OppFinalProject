"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
// Import the real API implementation
import { authAPI } from "@/lib/realApi"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth system and check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const userData = await authAPI.getCurrentUser()
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        // Clear any invalid tokens
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login(email, password)
      
      // Check if response has error
      if ('error' in response) {
        throw new Error(String(response.error))
      }
      
      // Validate response structure
      if (!response || !response.token || !response.user) {
        throw new Error("Invalid server response. Please try again.")
      }
      
      localStorage.setItem("token", response.token)
      setUser(response.user)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      
      // Determine the specific error to show to the user
      let errorMessage = "Login failed. Please check your credentials and try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string, /* role: string */) => {
    setIsLoading(true)
    try {
      // For now, we don't use role since the API doesn't require it, but we keep it for future compatibility
      const response = await authAPI.register(email, password, username)
      
      // Validate that registration was successful
      if (!response || !response.success) {
        throw new Error("Registration failed. Please try again.")
      }
      
      // After successful registration, redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Registration failed:", error)
      
      // Determine the specific error to show to the user
      let errorMessage = "Registration failed. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // hybridAuth.logout()
    setUser(null)
    router.push("/login")
  }

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error("Failed to refresh user data:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

