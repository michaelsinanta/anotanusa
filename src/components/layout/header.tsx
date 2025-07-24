"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useUserSession from "@/hooks/firebase/useUserSession";
import { signOut } from "@/lib/firebase/client/auth";
import { User } from "firebase/auth";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

type HeaderProps = {
  initialUser: User;
};

import { ChevronDown } from "lucide-react";
import { ProfilePicture } from "../common/profile-picture";

export function Header({ initialUser }: HeaderProps) {
  const user = useUserSession(initialUser);

  return (
    <header className="flex h-16 items-center justify-between gap-4 p-4">
      <Link href="/" className="text-2xl font-semibold">
        AnotaNusa
      </Link>
      {user ? <UserInfo user={user} /> : <AuthButtons />}
    </header>
  );
}

function AuthButtons() {
  return (
    <div className="flex gap-3">
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button variant={"ghost"} asChild>
        <Link href="/register">Register</Link>
      </Button>
    </div>
  );
}

type UserInfoPros = {
  user: User;
};

function UserInfo({ user }: UserInfoPros) {
  return (
    <div className="flex items-center gap-2">
      <ProfilePicture imageUrl={user.photoURL} />
      <p>{user.displayName ?? user.email}</p>
      <Navigation />
    </div>
  );
}

function Navigation() {
  const handleSignOut = (event: React.SyntheticEvent) => {
    event.preventDefault();
    signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" sideOffset={8} align="end">
        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
