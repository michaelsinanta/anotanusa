import "server-only";

import { initializeApp, initializeServerApp } from "firebase/app";
import { cookies } from "next/headers";

import { firebaseConfig } from "@/lib/firebase/const";
import { getAuth } from "firebase/auth";

export async function getAuthenticatedAppForUser() {
  const req_cookies = await cookies();
  const authIdToken = req_cookies.get("__session")?.value;

  const firebaseApp = initializeApp(firebaseConfig);
  const firebaseServerApp = initializeServerApp(firebaseApp, {
    authIdToken,
  });

  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();

  return { firebaseServerApp, currentUser: auth.currentUser };
}
