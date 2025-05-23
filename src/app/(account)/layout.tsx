'use client';

import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AccountSidebar from "./account/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {

  const {user, loading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

 useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
  }, [loading, user, router, pathname]);

  if(loading){
     return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
    if (!user) return null;

      return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-8 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64">
            <AccountSidebar />
          </div>
          
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

}