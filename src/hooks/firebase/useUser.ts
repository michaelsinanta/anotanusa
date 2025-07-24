"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase/client/clientApp";
import { type User } from "firebase/auth";

export function useUser() {
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    return onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
  }, []);

  return user;
}
