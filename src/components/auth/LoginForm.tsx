'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FirebaseError } from 'firebase/app';
import { getAuthErrorMessage, signInWithEmail, signInWithFacebook, signInWithGoogle } from '@/lib/firebase/auth';


export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const justRegistered = searchParams?.get('registered')=== 'true';

  if(justRegistered){
    toast.success('Registration successful! You can now log in.');
  }

  const handleEmailLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try{
      await signInWithEmail({email,password});

      const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');
      toast.success('Login successful!');
      router.push(redirectUrl);
    }catch(err){
      if(err instanceof FirebaseError){
        setError(getAuthErrorMessage(err.code));
        console.error('Firebase error:', err);
      }
      else{
        setError('An unexpected error occurred. Please try again.');
        console.error('Unexpected error:', err);
      }
    }finally{
      setIsLoading(false);
    }
  }

  const hanndleGoogleLogin = async()=>{
    setIsLoading(true);
    setError('');
    try{
      await signInWithGoogle();
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');
      toast.success('Successfully logged in with Google!');
      router.push(redirectUrl);
    }catch(err){
      if(err instanceof FirebaseError){
        setError(getAuthErrorMessage(err.code));
        console.error('Firebase error:', err);
      }
      else{
        setError('An unexpected error occurred During Google sign In.');
        console.error('Unexpected error:', err);
      } 
      
    }finally{
      setIsLoading(false);
    }
  }

  const handleFacebookLogin = async()=>{
    setIsLoading(true);
    setError('');
    try{
      await signInWithFacebook();
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');
      toast.success('Successfully logged in with Facebook!');
      router.push(redirectUrl);
    }catch(err){
      if(err instanceof FirebaseError){
        setError(getAuthErrorMessage(err.code));
        console.error('Firebase error:', err);
      }
      else{
        setError('An unexpected error occurred During Facebook sign In.');
        console.error('Unexpected error:', err);
      }
  } finally{
      setIsLoading(false);
    }
  }

 

  return (
    <form className="space-y-6" onSubmit={handleEmailLogin}>
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
            placeholder="••••••••"
            //enable password visibility eye icon
            onFocus={(e) => {
              e.currentTarget.type = 'text';
            }}
            onBlur={(e) => {
              e.currentTarget.type = 'password';
            }}
            disabled={isLoading}
           
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            disabled={isLoading}
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </div>

      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400'>
              Or continue with
            </span>
            </div>
        </div>

        <div className='mt-6 grid grid-cols-2 gap-3'>
          <button
            type="button"
            onClick={hanndleGoogleLogin}
            disabled={isLoading}
            className="inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Sign in with Google</span>
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
            </svg>
            
          </button>
               <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Sign in with Facebook</span>
            <svg className="h-5 w-5 text-[#1877F2]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </button>

        </div>
      </div>
    </form>
  );
}