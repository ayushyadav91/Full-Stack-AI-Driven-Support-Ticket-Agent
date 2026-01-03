import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Serverurl } from '../App.jsx';
import { toast } from 'react-hot-toast';

// API Call Functions
const apiCall = {
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${Serverurl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  login: async (email, password) => {
    return apiCall.post('/api/auth/login', { email, password });
  },

  forgotPassword: async (email) => {
    return apiCall.post('/api/auth/forgot-password', { email });
  },

  resetPassword: async (email, resetToken, newPassword) => {
    return apiCall.post('/api/auth/reset-password', { email, resetToken, newPassword });
  },
};

export default function LoginPage({ onLoginSuccess, onSwitchToSignUp }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Login Handler
  const handleLogin = async () => {
    // Frontend Validation
    if (!loginForm.email) {
      toast.error('Email is required');
      return;
    }
    if (!validateEmail(loginForm.email)) {
      toast.error('Invalid email format');
      return;
    }
    if (!loginForm.password) {
      toast.error('Password is required');
      return;
    }
    if (loginForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // API Call to Backend
      const response = await apiCall.login(loginForm.email, loginForm.password);

      // Store token in localStorage
      localStorage.setItem('authToken', response.token);

      // Clear form
      setLoginForm({ email: '', password: '' });

      // Call parent callback
      setTimeout(() => {
        onLoginSuccess(response.user, response.token);
      }, 500);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error('Email is required');
      return;
    }
    if (!validateEmail(resetEmail)) {
      toast.error('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      await apiCall.forgotPassword(resetEmail);
      toast.success('Reset code sent to your email!');
      setShowResetForm(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async () => {
    if (!resetCode) {
      toast.error('Reset code is required');
      return;
    }
    if (!newPassword) {
      toast.error('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apiCall.resetPassword(resetEmail, resetCode, newPassword);
      toast.success('Password reset successful! You can now login');
      // Reset all states
      setShowForgotPassword(false);
      setShowResetForm(false);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setShowResetForm(false);
              setResetEmail('');
              setResetCode('');
              setNewPassword('');
            }}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {showResetForm ? 'Reset Password' : 'Forgot Password'}
          </h2>
          <p className="text-sm text-gray-600">
            {showResetForm
              ? 'Enter the code sent to your email and your new password'
              : 'Enter your email to receive a reset code'}
          </p>
        </div>

        {/* Form */}
        {!showResetForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reset Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-center text-2xl tracking-widest"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Login View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignUp} className="text-indigo-600 font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Forgot Password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}