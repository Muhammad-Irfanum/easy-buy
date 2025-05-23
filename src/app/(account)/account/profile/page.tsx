"use client";

import { useState } from "react";

import {
  updateProfile,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import toast from "react-hot-toast";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function EditProfilePage() {
  const { user, loading } = useProtectedRoute();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    currentPassword: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [emailChangeMode, setEmailChangeMode] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsUpdating(true);

      // Update display name
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName,
        });
      }

      // Update email if in email change mode
      if (emailChangeMode && formData.email !== user.email) {
        if (!formData.currentPassword) {
          toast.error("Current password is required to change email");
          setIsUpdating(false);
          return;
        }

        // Re-authenticate user before email change
        try {
          const credential = EmailAuthProvider.credential(
            user.email!,
            formData.currentPassword
          );

          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, formData.email);
        } catch (error) {
          const firebaseError = error as FirebaseError;
          console.error("Error updating email:", firebaseError);

          if (firebaseError.code === "auth/wrong-password") {
            toast.error("Incorrect password. Please try again.");
          } else if (firebaseError.code === "auth/email-already-in-use") {
            toast.error("Email is already in use by another account.");
          } else {
            toast.error("Failed to update email. Please try again later.");
          }

          setIsUpdating(false);
          return;
        }
      }

      toast.success("Profile updated successfully");
      // Reset email change mode and password field
      setEmailChangeMode(false);
      setFormData((prev) => ({ ...prev, currentPassword: "" }));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Edit Profile
      </h1>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={isUpdating}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            {!emailChangeMode && (
              <button
                type="button"
                onClick={() => setEmailChangeMode(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change Email
              </button>
            )}
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={!emailChangeMode || isUpdating}
          />
        </div>

        {emailChangeMode && (
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Current Password
              <span className="ml-1 text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">
                (required for email change)
              </span>
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isUpdating}
              required={emailChangeMode}
              placeholder="Enter your current password"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          {emailChangeMode && (
            <button
              type="button"
              onClick={() => {
                setEmailChangeMode(false);
                setFormData((prev) => ({
                  ...prev,
                  email: user?.email || "",
                  currentPassword: "",
                }));
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100"
              disabled={isUpdating}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
