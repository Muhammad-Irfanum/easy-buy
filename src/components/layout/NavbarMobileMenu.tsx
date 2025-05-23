'use client';

import { FiSearch, FiUser, FiMessageSquare, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { ModeToggle } from '../ui/ModeToggle';
import { MobileNavItem } from './MobileNavItem';

interface NavbarMobileMenuProps {
  isOpen: boolean;
}

export function NavbarMobileMenu({ isOpen }: NavbarMobileMenuProps) {
  return (
    <div className={`md:hidden transition-all duration-300 overflow-hidden ${
      isOpen ? 'max-h-screen pb-4' : 'max-h-0'
    }`}>
      {/* Search Bar for Mobile */}
      <div className="flex mb-4 pt-2">
        <input
          type="text"
          placeholder="Search"
          className="w-full border border-gray-300 dark:border-gray-700 rounded-l-md py-2 px-4 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
        />
        <button className="bg-blue-500 text-white px-4 rounded-r-md">
          <FiSearch />
        </button>
      </div>
      
      {/* Category Dropdown for Mobile */}
      <select className="w-full mb-4 py-2 px-4 border border-gray-300 dark:border-gray-700 
        rounded-md focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <option value="">All category</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="furniture">Furniture</option>
      </select>
      
      {/* Mobile Navigation Links */}
      <div className="grid grid-cols-5 gap-2 text-center">
        <ModeToggle variant="icon-with-text" size="sm" />
        <MobileNavItem icon={<FiUser size={20} />} text="Profile" href="/account" />
        <MobileNavItem icon={<FiMessageSquare size={20} />} text="Message" href="/messages" />
        <MobileNavItem icon={<FiHeart size={20} />} text="Orders" href="/orders" />
        <MobileNavItem icon={<FiShoppingBag size={20} />} text="My cart" href="/cart" />
      </div>
    </div>
  );
}