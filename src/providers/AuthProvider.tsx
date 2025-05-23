"use client";

import { auth } from "@/lib/firebase/config";
import { User } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
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
  };
  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
