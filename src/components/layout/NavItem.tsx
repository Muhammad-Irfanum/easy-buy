'use client';

import Link from 'next/link';
import React from 'react'

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
}

export default function NavItem({icon, text, href}: NavItemProps) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
    >
      <div className="text-xl mb-1">{icon}</div>
      <span className="text-xs">{text}</span>
    </Link>
  )
}
