'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useState } from 'react';
import Link from 'next/link';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function AccountPage() {
  // This will redirect to login if the user is not authenticated
  const { user, loading } = useProtectedRoute();
  const [sendingVerification, setSendingVerification] = useState(false);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const handleSendVerification = async () => {
    if (!user) return;
    
    try {
      setSendingVerification(true);
      await sendEmailVerification(user);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again later.');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">My Account</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.displayName || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            {user?.emailVerified ? (
              <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-md text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                Email verified
              </span>
            ) : (
              <div className="mt-1 flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400">
                  Email not verified
                </span>
                <button 
                  onClick={handleSendVerification}
                  disabled={sendingVerification}
                  className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline disabled:opacity-70"
                >
                  {sendingVerification ? 'Sending...' : 'Resend verification'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Member since</h3>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order History</h3>
          <p className="text-gray-600 dark:text-gray-400">You have not placed any orders yet.</p>
          <Link href="/products" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Browse Products
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Settings</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/account/profile" className="flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                <span>Edit Profile</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="/account/addresses" className="flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                <span>Manage Addresses</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="/account/payment-methods" className="flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                <span>Payment Methods</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="/account/security" className="flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                <span>Security Settings</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Wishlist</h3>
          <p className="text-gray-600 dark:text-gray-400">You do not have any items in your wishlist.</p>
          <Link href="/products" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Discover Products
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recently Viewed</h3>
          <p className="text-gray-600 dark:text-gray-400">You have not viewed any products yet.</p>
          <Link href="/products" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}