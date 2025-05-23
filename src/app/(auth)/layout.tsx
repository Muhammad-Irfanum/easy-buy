'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function layout({children}:AuthLayoutProps) 
{
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

