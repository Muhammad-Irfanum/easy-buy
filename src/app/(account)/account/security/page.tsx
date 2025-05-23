
'use client';

import { useState } from 'react';

import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword, 
  sendEmailVerification 
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function SecurityPage() {
  const { user } = useProtectedRoute();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!validateForm()) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        formData.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, formData.newPassword);
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password updated successfully');
    } catch (error) {
      const firebaseError = error as Error;
      console.error('Error updating password:', firebaseError);
      
      if (firebaseError.message.includes('wrong-password')) {
        setErrors((prev) => ({ ...prev, currentPassword: 'Incorrect password' }));
      } else {
        toast.error('Failed to update password. Please try again later.');
      }
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!user) return;
    
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again later.');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Security Settings</h1>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Verification</h2>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Email Status: 
                <span className={`ml-2 font-medium ${
                  user?.emailVerified 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </p>
              
              {!user?.emailVerified && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please verify your email address to fully secure your account
                </p>
              )}
            </div>
            
            {!user?.emailVerified && (
              <button
                onClick={handleResendVerification}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Resend Verification
              </button>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`block w-full rounded-md border ${
                  errors.currentPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                disabled={isUpdating}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`block w-full rounded-md border ${
                  errors.newPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                disabled={isUpdating}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full rounded-md border ${
                  errors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                disabled={isUpdating}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Login Sessions</h2>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} - Last Login: {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}