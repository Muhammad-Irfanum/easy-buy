'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftOnRectangleIcon,
  ArrowTrendingUpIcon,
  Bars3Icon,
  CogIcon,
  CubeIcon,
  FolderIcon,
  HomeIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
  XMarkIcon,
  
} from '@heroicons/react/24/outline';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';



const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Products', href: '/admin/products', icon: CubeIcon },
  { name: 'Categories', href: '/admin/categories', icon:FolderIcon },
  {name : 'Brands', href: '/admin/brands', icon: IdentificationIcon},
  { name: 'Inventory', href: '/admin/inventory', icon: ShoppingCartIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ArrowTrendingUpIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  {name: 'Admins', href: '/admin/subAdmins', icon: ShieldCheckIcon }
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error(error);
    }
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar panel */}
        <div className="fixed inset-y-0 left-0 w-64 flex flex-col bg-white dark:bg-gray-800 transform transition ease-in-out duration-300">
          <div className="h-0 flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
                  <ShoppingCartIcon className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                  EasyBuy
                </span>
              </Link>
              
              {/* Close button */}
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-6 w-6 transition-colors",
                        isActive
                          ? "text-blue-500 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6 text-gray-500 dark:text-gray-400" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 p-3 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <Link href="/dashboard" className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
                  <ShoppingCartIcon className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                  EasyBuy
                </span>
              </Link>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-6 w-6 transition-colors",
                          isActive
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6 text-gray-500 dark:text-gray-400" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}