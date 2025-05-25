import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./config";

// Types
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Email & Password Authentication
export const signUpWithEmail = async ({
  email,
  password,
  fullName,
}: SignUpData): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update user profile with full name
    await updateProfile(userCredential.user, {
      displayName: fullName,
    });

    // Send verification email
    await sendEmailVerification(userCredential.user);

    return userCredential;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const signInWithEmail = async ({
  email,
  password,
}: SignInData): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Social Auth
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signInWithFacebook = async (): Promise<UserCredential> => {
  try {
    const provider = new FacebookAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Facebook:", error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Password reset
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email, {

    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
    });
  } catch (error) {
    console.error("Error sending password reset:", error);
    throw error;
  }
};

// Firebase error code interpreter for user-friendly messages
export const getAuthErrorMessage = (code: string): string => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};
