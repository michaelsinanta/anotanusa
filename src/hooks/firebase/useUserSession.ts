"use client";
import { onIdTokenChanged } from "@/lib/firebase/client/auth";
import { deleteCookie, setCookie } from "cookies-next";
import { type User } from "firebase/auth";
import { useEffect } from "react";

/**
 * Hook for sending authentication state from a client to a server.
 * @param initialUser
 * @returns
 */
export default function useUserSession(initialUser: User) {
  useEffect(() => {
    return onIdTokenChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken);
      } else {
        await deleteCookie("__session");
      }

      if (initialUser?.uid === user?.uid) {
        return;
      }

      window.location.replace("/home");
    });
  }, [initialUser]);

  return initialUser;
}
