'use client';

import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiUser, 
  FiMapPin, 
  FiCreditCard, 
  FiShoppingBag, 
  FiHeart, 
  FiSettings,
  FiShield,
  FiLogOut 
} from 'react-icons/fi';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AccountSidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
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
  
  const menuItems = [
    { label: 'Account Overview', href: '/account', icon: <FiUser className="w-5 h-5" /> },
    { label: 'Edit Profile', href: '/account/profile', icon: <FiSettings className="w-5 h-5" /> },
    { label: 'Addresses', href: '/account/addresses', icon: <FiMapPin className="w-5 h-5" /> },
    { label: 'Payment Methods', href: '/account/payment-methods', icon: <FiCreditCard className="w-5 h-5" /> },
    { label: 'Order History', href: '/account/orders', icon: <FiShoppingBag className="w-5 h-5" /> },
    { label: 'Wishlist', href: '/account/wishlist', icon: <FiHeart className="w-5 h-5" /> },
    { label: 'Security', href: '/account/security', icon: <FiShield className="w-5 h-5" /> },
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg font-bold">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {user?.displayName || 'User'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AccountSidebar;