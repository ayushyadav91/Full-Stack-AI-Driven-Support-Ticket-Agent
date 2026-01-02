import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Tag, X } from 'lucide-react';
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

  signup: async (email, password, skills = []) => {
    return apiCall.post('/api/auth/signup', { email, password, skills });
  },
};

export default function SignUpPage({ onSignUpSuccess, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState({ email: '', password: '', skills: [] });
  const [skillInput, setSkillInput] = useState('');

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim() && !signupForm.skills.includes(skillInput.trim())) {
      setSignupForm({ ...signupForm, skills: [...signupForm.skills, skillInput.trim()] });
      setSkillInput('');
      e.preventDefault();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSignupForm({
      ...signupForm,
      skills: signupForm.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // Signup Handler
  const handleSignUp = async () => {
    // Frontend Validation
    if (!signupForm.email) {
      toast.error('Email is required');
      return;
    }
    if (!validateEmail(signupForm.email)) {
      toast.error('Invalid email format');
      return;
    }
    if (!signupForm.password) {
      toast.error('Password is required');
      return;
    }
    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // API Call to Backend
      const response = await apiCall.signup(signupForm.email, signupForm.password, signupForm.skills);

      // Store token in localStorage
      localStorage.setItem('authToken', response.token);

      // Clear form
      setSignupForm({ email: '', password: '', skills: [] });

      // Call parent callback
      setTimeout(() => {
        onSignUpSuccess(response.user, response.token);
      }, 500);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-indigo-600 font-semibold hover:underline">
            Log in
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
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
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
              placeholder="Enter your password (min 6 characters)"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Skills (Optional)
          </label>
          <div className="relative">
            <Tag size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Add your skills (press Enter)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleAddSkill}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
          {signupForm.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {signupForm.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-indigo-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}
