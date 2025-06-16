"use client";

import { auth } from "@/lib/firebase/config";
import { AdminClaims } from "@/lib/types/admin";
import { User } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getIdToken as firebaseGetIdToken } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  userClaims?: AdminClaims
  getIdToken?: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const getIdToken = async (user: User | null): Promise<string> => {
  if (!user) 
    throw new Error("User is not authenticated");
  return await firebaseGetIdToken(user);
}
  

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error fetching user:", error);
        setError(error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  //context value
  const value = {
    user,
    loading,
    error,
    getIdToken: user ? () => getIdToken(user) : undefined,
  };
  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
 
