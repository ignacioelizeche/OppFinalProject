"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const router = useRouter()


  const { isAuthenticated, isLoading } = useAuth()

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    // This check is now commented out to prevent automatic redirection
    // This will allow users to see the landing page and use the Get Started button
    // if (!isLoading && isAuthenticated) {
    //   router.replace("/dashboard")
    // }
  }, [isAuthenticated, isLoading, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-2xl text-center animate-fadeInUp">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white animate-fadeInUp">
          Unleash Your Math Power
        </h1>
        <p className="text-xl md:text-2xl mb-10 text-gray-300 font-medium animate-fadeInUp" style={{animationDelay:'0.2s',animationFillMode:'both'}}>
          Challenge yourself with problems, track your progress, and climb the leaderboard.
        </p>
        <Link href="/login" passHref legacyBehavior>
          <a>
            <button
              className="px-10 py-3 rounded-full font-semibold text-lg bg-[var(--accent-red)] text-white shadow-lg animate-fadeInUp transition-all hover:bg-[var(--accent-blue)] hover:scale-105"
              style={{animationDelay:'0.4s',animationFillMode:'both'}}>
              Get Started
            </button>
          </a>
        </Link>
      </div>
    </main>
  )
}

