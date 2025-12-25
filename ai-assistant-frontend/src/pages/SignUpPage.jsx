
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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

  signup: async (email, password, skills = []) => {
    return apiCall.post('/api/auth/signup', { email, password, skills });
  },
};

export default function SignUpPage({ onSignUpSuccess, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState({ email: '', password: '', skills: [] });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Signup Handler
  const handleSignUp = async () => {
    setErrors({});
    setSuccessMessage('');

    // Frontend Validation
    const newErrors = {};
    if (!signupForm.email) newErrors.email = 'Email is required';
    else if (!validateEmail(signupForm.email)) newErrors.email = 'Invalid email format';

    if (!signupForm.password) newErrors.password = 'Password is required';
    else if (signupForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // API Call to Backend
      const response = await apiCall.signup(signupForm.email, signupForm.password, signupForm.skills);

      // Store token in localStorage
      localStorage.setItem('authToken', response.token);

      // Set user data
      setSuccessMessage('Account created successfully!');

      // Clear form
      setSignupForm({ email: '', password: '', skills: [] });

      // Call parent callback
      setTimeout(() => {
        onSignUpSuccess(response.user, response.token);
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
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
      <p className="text-slate-600 mb-8">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:underline">
          Log in
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
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
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
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
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

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Skills (Optional)</label>
          <input
            type="text"
            value={signupForm.skills.join(', ')}
            onChange={(e) =>
              setSignupForm({
                ...signupForm,
                skills: e.target.value.split(',').map((s) => s.trim()).filter((s) => s),
              })
            }
            placeholder="e.g., Technical, Billing, Support"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 placeholder-slate-500"
          />
        </div>

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {loading ? 'Processing...' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}
