'use client';

import { useAuth } from '@/providers/AuthProvider';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Fragment, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardHeader() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <header className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex-1 flex justify-between items-center h-full px-4 sm:px-6">
        <div className="flex-1 flex">
          <form className="w-full flex md:ml-0" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="search-field"
                className="block w-full h-full pl-8 pr-3 py-2 border-transparent bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-transparent focus:ring-0 sm:text-sm"
                placeholder="Search products, orders, customers..."
                type="search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        <div className="ml-4 flex items-center space-x-4 md:ml-6">
          {/* Theme toggle */}
          <ModeToggle variant="icon" />
          
          {/* Notifications */}
          <button
            type="button"
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <div>
              <MenuButton className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
              </MenuButton>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem>
                  {({ active }) => (
                    <Link 
                      href="/dashboard/profile" 
                      className={cn(
                        active ? 'bg-gray-100 dark:bg-gray-700' : '',
                        'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                      )}
                    >
                      Your Profile
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <Link
                      href="/dashboard/settings"
                      className={cn(
                        active ? 'bg-gray-100 dark:bg-gray-700' : '',
                        'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                      )}
                    >
                      Settings
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <Link
                      href="/"
                      className={cn(
                        active ? 'bg-gray-100 dark:bg-gray-700' : '',
                        'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                      )}
                    >
                      View Store
                    </Link>
                  )}
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}