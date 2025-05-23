'use client';
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";



export const useProtectedRoute = () => {
  const {user, loading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if(!loading && !user){
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.push("/login");
    }
  },[loading, user, pathname, router]);
  return {user, loading};
}