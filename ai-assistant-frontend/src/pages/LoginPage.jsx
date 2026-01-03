import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Serverurl } from '../App.jsx';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

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
      const response = await apiCall.login(loginForm.email, loginForm.password);
      localStorage.setItem('authToken', response.token);
      setLoginForm({ email: '', password: '' });
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setShowForgotPassword(false);
              setShowResetForm(false);
              setResetEmail('');
              setResetCode('');
              setNewPassword('');
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            {showResetForm ? 'Reset Password' : 'Forgot Password'}
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {showResetForm
              ? 'Enter the code sent to your email and your new password'
              : 'Enter your email to receive a reset code'}
          </p>
        </div>

        {!showResetForm ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button onClick={handleForgotPassword} disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Reset Code
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button onClick={handleResetPassword} disabled={loading} className="w-full">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  // Login View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Sign In</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Sign up
          </button>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="pl-10 pr-10"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              type="button"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Forgot Password?
          </button>
        </div>

        <Button onClick={handleLogin} disabled={loading} className="w-full">
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </div>
    </motion.div>
  );
}