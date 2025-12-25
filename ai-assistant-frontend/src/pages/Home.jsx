import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginPage from './LoginPage.jsx';
import SignUpPage from './SignUpPage.jsx';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false); // start as false
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [userInteracted, setUserInteracted] = useState(false); // tracks user clicks
  const navigate = useNavigate();

  useEffect(() => {
    // show SignUp modal after 8 seconds if user hasn't interacted
    const timer = setTimeout(() => {
      if (!userInteracted && !user) {
        setIsLoginOpen(true);
        setIsSignUp(true); // show SignUp
      }
    }, 8000);

    return () => clearTimeout(timer); // cleanup
  }, [userInteracted, user]);

  const handleUserClick = () => {
    setUserInteracted(true);
  };

  const handleLoginSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsLoginOpen(false);
    setIsSignUp(false);
    toast.success("Login successfully");
  };

  const handleSignUpSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsLoginOpen(false);
    setIsSignUp(false);
    toast.success("Account created successfully");
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('authToken');
    setToken(null);
    setIsLoginOpen(false);
    setIsSignUp(false);
    toast.success("Logout successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900/50 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">TicketAI</h1>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-semibold">{user.email}</p>
                <p className="text-slate-400 text-sm">{user.role || 'user'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setIsLoginOpen(true); setIsSignUp(false); handleUserClick(); }}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">AI-Powered Ticket Management</h2>
        <p className="text-xl text-slate-400 mb-8">Manage support tickets efficiently with intelligent AI assistance</p>

        {!user && (
          <button
            onClick={() => { setIsLoginOpen(true); setIsSignUp(false); handleUserClick(); }}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold text-lg transition-all shadow-lg"
          >
            Get Started Free
          </button>
        )}

        {user && (
          <div className="mt-10">
            <p className="text-white text-xl mb-4">Welcome, {user.name}!</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold text-lg transition-all shadow-lg"
            >
              Click Here to Create Ticket
            </button>
          </div>
        )}
      </div>

      {/* AUTH MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10"
            >
              <X size={24} />
            </button>

            {isSignUp ? (
              <SignUpPage
                onSignUpSuccess={handleSignUpSuccess}
                onSwitchToLogin={() => { setIsSignUp(false); handleUserClick(); }}
              />
            ) : (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onSwitchToSignUp={() => { setIsSignUp(true); handleUserClick(); }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
