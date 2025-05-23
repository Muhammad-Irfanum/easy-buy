import React from "react";
import { ModeToggle } from "../ui/ModeToggle";
import NavItem from "./NavItem";
import { FiHeart, FiLogOut, FiMessageSquare, FiShoppingBag, FiUser } from "react-icons/fi";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface NavbarActionsProps {
  className?: string;
}

export default function NavbarActions({ className = " " }: NavbarActionsProps) {
  const {user} = useAuth();
  const router = useRouter();

  const handleSignOut =  async () => {
    try{
      await signOut(auth)
      toast.success("Sign out successfully");
      router.push('/login')
    } catch (error) {
      toast.error("Sign out failed");
      console.error("Sign out error:", error);
    }
  }
  return (
    <div className={`items-center space-x-6 ${className}`}>
      <ModeToggle variant="icon-with-text" />
      {user ? (
        <>
        <NavItem
        icon={<FiUser />}
        text = {user.displayName?.split(" ")[0] || "Account"}
        href="/account"
        />
      <NavItem icon={<FiMessageSquare />} text="Message" href="/messages" />
      <NavItem icon={<FiHeart />} text="Orders" href="/orders" />
      <NavItem icon={<FiShoppingBag />} text="My cart" href="/cart" />
       <button
            onClick={handleSignOut}
            className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <div className="text-xl mb-1">
              <FiLogOut />
            </div>
            <span className="text-xs">Logout</span>
          </button>
      </>
      ) : (
          <>
          <NavItem icon={<FiUser />} text="Sign in" href="/login" />
          <NavItem icon={<FiShoppingBag />} text="Cart" href="/cart" />
        </>
        
      )}
     
    </div>
  );
}
