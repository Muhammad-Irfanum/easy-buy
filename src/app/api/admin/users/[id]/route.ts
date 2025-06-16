import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, hasPermission } from '@/lib/firebase/admin/auth';
import { getAdminById, updateAdmin, deleteAdmin } from '@/lib/firebase/services/adminService';

// GET /api/admin/users/[id] - Get admin by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Verify the admin token
    const { user, error } = await verifyAdminToken(req);
    
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }
    
    // Check permissions
    if (!hasPermission(user, 'manage-admins')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get the admin
    const admin = await getAdminById(id);
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }
    
    return NextResponse.json(admin);
  } catch (error: any) {
    console.error('Error fetching admin user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - Update admin
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
    
    // Get current admin
    const currentAdmin = await getAdminById(id);
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }
    
    // Security checks
    
    // Prevent self-role change
    if (currentAdmin.uid === user.uid && data.role && data.role !== currentAdmin.role) {
      return NextResponse.json({ 
        error: 'You cannot change your own admin role' 
      }, { status: 403 });
    }
    
    // Only super-admin can modify super-admin
    if ((currentAdmin.role === 'super-admin' || data.role === 'super-admin') 
        && user.role !== 'super-admin') {
      return NextResponse.json({ 
        error: 'Only super-admins can modify super-admin users' 
      }, { status: 403 });
    }
    
    // Update the admin
    const updatedAdmin = await updateAdmin(id, data);
    
    return NextResponse.json(updatedAdmin);
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete admin
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Verify the admin token
    const { user, error } = await verifyAdminToken(req);
    
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }
    
    // Check permissions
    if (!hasPermission(user, 'manage-admins')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get the admin
    const admin = await getAdminById(id);
    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }
    
    // Prevent self-deletion
    if (admin.uid === user.uid) {
      return NextResponse.json({ 
        error: 'You cannot delete your own admin account' 
      }, { status: 403 });
    }
    
    // Only super-admin can delete super-admin
    if (admin.role === 'super-admin' && user.role !== 'super-admin') {
      return NextResponse.json({ 
        error: 'Only super-admins can delete super-admin users' 
      }, { status: 403 });
    }
    
    // Delete the admin
    await deleteAdmin(id);
    
    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}