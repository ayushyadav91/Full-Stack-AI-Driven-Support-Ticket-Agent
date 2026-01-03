import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Serverurl } from '../App.jsx';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

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

  signup: async (email, password, skills) => {
    return apiCall.post('/api/auth/signup', { email, password, skills });
  },
};

export default function SignUpPage({ onSignUpSuccess, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    skills: [],
  });
  const [skillInput, setSkillInput] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      if (!signupForm.skills.includes(skillInput.trim())) {
        setSignupForm({
          ...signupForm,
          skills: [...signupForm.skills, skillInput.trim()],
        });
        setSkillInput('');
        toast.success(`Added skill: ${skillInput.trim()}`);
      } else {
        toast.error('Skill already added');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSignupForm({
      ...signupForm,
      skills: signupForm.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSignUp = async () => {
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
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall.signup(
        signupForm.email,
        signupForm.password,
        signupForm.skills
      );

      localStorage.setItem('authToken', response.token);
      setSignupForm({
        email: '',
        password: '',
        confirmPassword: '',
        skills: [],
      });

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Create Account</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Sign in
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
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
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
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
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

        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={signupForm.confirmPassword}
              onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Skills (Optional)
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a skill (e.g., JavaScript, Python)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSkill}
              disabled={!skillInput.trim()}
              className="px-6"
            >
              Add
            </Button>
          </div>

          {signupForm.skills.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-neutral-500 mb-2">
                {signupForm.skills.length} skill{signupForm.skills.length !== 1 ? 's' : ''} added
              </p>
              <div className="flex flex-wrap gap-2">
                {signupForm.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="default"
                    className="flex items-center gap-2 px-3 py-1.5 bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="rounded-full hover:bg-white/20 p-0.5 transition-colors"
                      title="Remove skill"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSignUp} disabled={loading} className="w-full">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </div>
    </motion.div>
  );
}
