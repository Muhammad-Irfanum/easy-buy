import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, hasPermission } from '@/lib/firebase/admin/auth';
import { getAllAdmins, createAdmin } from '@/lib/firebase/services/adminService';

// GET /api/admin/users - Get all admin users
export async function GET(req: NextRequest) {
  try {
    // Verify the admin token
    const { user, error } = await verifyAdminToken(req);
    
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }
    
    // Check permissions
    if (!hasPermission(user, 'manage-admins')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get all admins
    const admins = await getAllAdmins();
    
    return NextResponse.json({ admins });
  } catch (error: unknown) {
    console.error('Error fetching admin users:', error);
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new admin user
export async function POST(req: NextRequest) {
  try {
    // Verify the admin token
    const { user, error } = await verifyAdminToken(req);
    
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }
    
    // Check permissions
    if (!hasPermission(user, 'manage-admins')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get request data
    const data = await req.json();
    
    // Validate required fields
    if (!data.email || !data.name || !data.role) {
      return NextResponse.json({
        error: 'Missing required fields: email, name, and role are required'
      }, { status: 400 });
    }
    
    // Only super-admin can create other super-admins
    if (data.role === 'super-admin' && user.role !== 'super-admin') {
      return NextResponse.json({
        error: 'Only super-admins can create other super-admin users'
      }, { status: 403 });
    }
    
    // Add creator info
    data.createdBy = user.uid;
    
    // Create the admin
    const newAdmin = await createAdmin(data);
    
    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error: unknown) {
   console.error ('Error creating admin user:', error);
   let errorMessage = 'Internal server error';
  if (error instanceof Error) {
    errorMessage = error.message;
  }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}