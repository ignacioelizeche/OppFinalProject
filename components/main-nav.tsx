"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Calendar, Home, MessageSquare, Trophy, LineChart } from "lucide-react"

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Problems",
    href: "/problems",
    icon: BookOpen,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Forum",
    href: "/forum",
    icon: MessageSquare,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    name: "Visualizations",
    href: "/visualizations",
    icon: LineChart,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-6">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <span className="font-bold text-xl text-primary">DELTA</span>
      </Link>
      <div className="flex items-center space-x-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href || pathname.startsWith(`${item.href}/`) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

