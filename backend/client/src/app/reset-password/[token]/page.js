'use client';

import { useState } from 'react';
import { useResetPasswordMutation } from '@/store/authSlice';
import { useRouter, useParams } from 'next/navigation';

export default function ResetPassword() {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const router = useRouter();
  const { token } = useParams(); // Extract token from URL path

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    try {
      await resetPassword({ token, newPassword: formData.newPassword }).unwrap();
      setSuccessMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000); // Redirect to login after 2 seconds
    } catch (err) {
      setError(err?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-12 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block mb-1 font-medium">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="text-sm text-blue-600 hover:underline cursor-pointer mt-4" onClick={() => router.push('/login')}>
        Back to Login
      </div>
    </div>
  );
}