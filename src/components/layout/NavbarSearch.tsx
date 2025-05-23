"use client";

import React from "react";

interface NavbarSearchProps {
  className?: string;
}

export default function NavbarSearch({ className = " " }: NavbarSearchProps) {
  return (
    <div className={className}>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Seach"
          className="w-full border border-gray-300 dark:border-gray-700 rounded-l-md py-2 px-4 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 right-16 flex items-center border-l border-gray-300 dark:border-gray-700">
          <select className="h-full bg-transparent py-0 pl-2 pr-7 focus:outline-none text-sm text-gray-500 dark:text-gray-400">
            <option value="">All category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>
        <button className="absolute right-0 h-full bg-blue-500 text-white px-4  hover:bg-blue-600 transition">
          Search
        </button>
      </div>
    </div>
  );
}
