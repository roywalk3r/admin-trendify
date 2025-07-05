"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import { ShoppingCart, Heart, User } from "lucide-react"
import Link from "next/link"

export function UserNav() {
  const { isSignedIn } = useUser()

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/wishlist">
          <Heart className="h-5 w-5" />
          <span className="sr-only">Wishlist</span>
        </Link>
      </Button>

      <Button variant="ghost" size="icon" asChild>
        <Link href="/cart">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Cart</span>
        </Link>
      </Button>

      {isSignedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <UserButton afterSignOutUrl="/" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs leading-none text-muted-foreground">Manage your account</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account?tab=orders">Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account?tab=settings">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5 mr-2" />
            Sign In
          </Button>
        </SignInButton>
      )}
    </div>
  )
}
