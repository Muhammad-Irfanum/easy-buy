'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SwitchField } from '@/components/ui/SwitchField';
import toast from 'react-hot-toast';
import { AdminUser, ADMIN_ROLES, ADMIN_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/types/admin';
import { createAdminWithAccount, updateAdminUser, isExistingAdminEmail } from '@/lib/firebase/admin/adminUserService';

interface AdminFormProps {
  initialData?: AdminUser;
  isEditing?: boolean;
}

export default function AdminForm({
  initialData,
  isEditing = false,
}: AdminFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<AdminUser & { password?: string }>({
    email: '',
    displayName: '',
    role: 'admin',
    permissions: DEFAULT_ROLE_PERMISSIONS['admin'],
    active: true,
    password: '',
  });

  // Initialize form with initial data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        ...initialData,
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'role') {
      // Update permissions based on role
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        permissions: DEFAULT_ROLE_PERMISSIONS[value as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isEditing && initialData?.id) {
        // Update existing admin
        const { password, ...updateData } = formData;
        await updateAdminUser(initialData.id, updateData);
        toast.success('Admin user updated successfully');
      } else {
        // Create new admin with Firebase Auth account
        if (!formData.password) {
          throw new Error('Password is required');
        }
        
        // Check if email already exists
        const exists = await isExistingAdminEmail(formData.email);
        if (exists) {
          throw new Error('An admin with this email already exists');
        }
        
        const { password, ...adminData } = formData;
        await createAdminWithAccount(formData.email, password!, adminData);
        toast.success('Admin user created successfully');
      }
      
      // Redirect to admin users page
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Error saving admin user:', error);
      toast.error(error.message || 'Failed to save admin user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  required
                  disabled={isEditing} // Email cannot be changed after creation
                />
              </div>
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email address cannot be changed after creation
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Display Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="displayName"
                  id="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  required
                />
              </div>
            </div>

            {!isEditing && (
              <div className="sm:col-span-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="text-sm">{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 6 characters long
                </p>
              </div>
            )}

            <div className="sm:col-span-3">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Role <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  required
                >
                  {ADMIN_ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {ADMIN_ROLES.find(r => r.id === formData.role)?.description}
              </p>
            </div>

            <div className="sm:col-span-6">
              <SwitchField
                label="Active Status"
                description="Admins who are inactive cannot log in to the dashboard"
                checked={formData.active}
                onChange={(checked) => handleSwitchChange('active', checked)}
              />
            </div>

            <div className="sm:col-span-6 border-t border-gray-200 dark:border-gray-700 pt-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                Permissions
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  These permissions are automatically set based on the selected role, but you can customize them for this user.
                </p>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {ADMIN_PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`permission-${permission.id}`}
                          name={`permission-${permission.id}`}
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700 dark:text-gray-300">
                          {permission.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => router.push('/admin/users')}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Create Admin User'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}