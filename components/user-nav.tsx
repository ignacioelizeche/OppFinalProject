"use client"

import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Coins } from "lucide-react"

export function UserNav() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <Coins className="h-4 w-4 text-yellow-500" />
        <span>{user.coinBalance} coins</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="md:hidden">
            <Coins className="mr-2 h-4 w-4 text-yellow-500" />
            <span>{user.coinBalance} coins</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="md:hidden" />
          <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

