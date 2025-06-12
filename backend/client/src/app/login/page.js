'use client';

import { useState } from 'react';
import { useLoginMutation, useForgotPasswordMutation } from '@/store/authSlice';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [forgotPassword, { isLoading: isForgotPasswordLoading }] = useForgotPasswordMutation();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      const userData = await login(formData).unwrap();
      router.push('/dashboard');
    } catch (err) {
      setError(err?.data?.message || 'Failed to login. Please try again.');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!forgotPasswordEmail) {
      setError('Please enter your email address.');
      return;
    }

    try {
      console.log('Sending forgot password request:', { email: forgotPasswordEmail });
      const response = await forgotPassword({ email: forgotPasswordEmail }).unwrap();
      console.log('Response:', response);
      setSuccessMessage('A password reset link has been sent to your email.');
      setForgotPasswordEmail('');
      setShowForgotPassword(false);
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err?.data?.message || err?.error || 'Failed to send reset link. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-12 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        {showForgotPassword ? 'Reset Password' : 'Login'}
      </h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

      {!showForgotPassword ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoginLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => setShowForgotPassword(true)}>
            Forgot Password?
          </div>
        </form>
      ) : (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgotEmail" className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              id="forgotEmail"
              name="forgotEmail"
              value={forgotPasswordEmail}
              onChange={handleForgotPasswordChange}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="username"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={isForgotPasswordLoading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => setShowForgotPassword(false)}>
            Back to Login
          </div>
        </form>
      )}
    </div>
  );
}