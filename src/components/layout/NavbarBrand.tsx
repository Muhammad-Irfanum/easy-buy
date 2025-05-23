
import Link from 'next/link'
import React from 'react'
import { FiShoppingBag } from 'react-icons/fi'

export default function NavbarBrand() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center">
        <FiShoppingBag className="text-white" />
      </div>
      <span className="text-blue-500 dark:text-blue-400 text-xl font-semibold">Easy Buy</span>
    </Link>
  )
}
