import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Serverurl } from '../App.jsx';


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

  logout: async (token) => {
    try {
      const response = await fetch(`${Serverurl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Logout failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default function LoginPage({ onLoginSuccess, onSwitchToSignUp }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Login Handler
  const handleLogin = async () => {
    setErrors({});
    setSuccessMessage('');

    // Frontend Validation
    const newErrors = {};
    if (!loginForm.email) newErrors.email = 'Email is required';
    else if (!validateEmail(loginForm.email)) newErrors.email = 'Invalid email format';

    if (!loginForm.password) newErrors.password = 'Password is required';
    else if (loginForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // API Call to Backend
      const response = await apiCall.login(loginForm.email, loginForm.password);

      // Store token in localStorage
      localStorage.setItem('authToken', response.token);

      // Set user data
      setSuccessMessage('Login successful!');

      // Clear form
      setLoginForm({ email: '', password: '' });

      // Call parent callback
      setTimeout(() => {
        onLoginSuccess(response.user, response.token);
      }, 500);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-8">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
      <p className="text-slate-600 mb-8">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignUp} className="text-blue-600 font-semibold hover:underline">
          Sign up
        </button>
      </p>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 placeholder-slate-500"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 placeholder-slate-500"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {loading ? 'Processing...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}