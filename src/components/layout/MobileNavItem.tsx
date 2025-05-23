'use client';

import Link from 'next/link';

interface MobileNavItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
}

export function MobileNavItem({ icon, text, href }: MobileNavItemProps) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 py-2"
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs">{text}</span>
    </Link>
  );
}