import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Format date to display in a readable format
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// Format time to display in a readable format
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

// Format duration between two dates
export function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffHrs === 0) {
    return `${diffMins} min`
  } else if (diffMins === 0) {
    return `${diffHrs} hr`
  } else {
    return `${diffHrs} hr ${diffMins} min`
  }
}