import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/lib/firebase/admin/config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Try to list users (max 1) to verify admin SDK works
    const result = await adminAuth.listUsers(1);
    res.status(200).json({ 
      success: true, 
      message: 'Firebase Admin SDK is working!',
      usersCount: result.users.length 
    });
  } catch (error: unknown) {
    console.error('Admin SDK test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
    });
  }
}