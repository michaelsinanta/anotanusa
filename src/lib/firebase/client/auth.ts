import {
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  NextOrObserver,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
  validatePassword,
} from "firebase/auth";

import { FirebaseError } from "firebase/app";

import { auth } from "@/lib/firebase/client/clientApp";
import { createOrUpdateUserDocument } from "@/lib/actions/creator";

export type AuthResponse =
  | {
      type: "success";
      message: string;
    }
  | {
      type: "error";
      message: string;
      error: unknown;
    }
  | {
      type: "invalid";
      message: string;
      input: "email" | "password" | "all";
    };

export function onAuthStateChanged(cb: NextOrObserver<User>) {
  return _onAuthStateChanged(auth, cb);
}

export function onIdTokenChanged(cb: NextOrObserver<User>) {
  return _onIdTokenChanged(auth, cb);
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  const provider = new GoogleAuthProvider();

  try {
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    // Save user info to Firestore
    await createOrUpdateUserDocument({
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
    });

    return {
      type: "success",
      message: "User signed in with Google successfully.",
    };
  } catch (error) {
    return {
      type: "error",
      message: "Error signing in with Google.",
      error: error,
    };
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    // Save user info to Firestore
    await createOrUpdateUserDocument({
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
    });

    return {
      type: "success",
      message: "User signed in successfully.",
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/invalid-credential":
          return {
            type: "invalid",
            input: "all",
            message: "Invalid email address or password.",
          };
      }
    }

    return {
      type: "error",
      message: "Error signing in with email and password.",
      error: error,
    };
  }
}

export async function registerWithEmailPassword(
  displayName: string,
  email: string,
  password1: string,
  password2: string,
): Promise<AuthResponse> {
  if (password1 !== password2) {
    return {
      type: "invalid",
      input: "password",
      message: "Passwords do not match.",
    };
  }

  try {
    const status = await validatePassword(auth, password1);

    if (!status.isValid) {
      return {
        type: "invalid",
        input: "password",
        message: "Minimum password length is 6 characters.",
      };
    }

    // If the new account was created, the user is signed in automatically
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password1,
    );
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: displayName,
    });

    // Save user info to Firestore
    await createOrUpdateUserDocument({
      uid: user.uid,
      displayName: displayName,
      email: user.email || "",
    });

    return {
      type: "success",
      message: "User registered successfully.",
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/invalid-email":
          return {
            type: "invalid",
            input: "email",
            message: "Invalid email address.",
          };
      }
    }

    return {
      type: "error",
      message: "Error registering with email and password.",
      error: error,
    };
  }
}

export async function signOut(): Promise<AuthResponse> {
  try {
    await auth.signOut();

    return {
      type: "success",
      message: "User signed out successfully.",
    };
  } catch (error) {
    return {
      type: "error",
      message: "Error signing out.",
      error: error,
    };
  }
}
