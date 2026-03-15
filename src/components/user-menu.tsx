"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Settings, Users, LogOut } from "lucide-react";

export function UserMenu({ user }: { user: { name?: string | null; image?: string | null } }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="User menu">
          {user.image ? (
            <Image src={user.image} alt="" width={32} height={32} className="rounded-full" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
              {user.name?.[0] ?? "?"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <Settings className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <Users className="mr-2 h-4 w-4" />
            Workspaces
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            className="flex w-full items-center"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
