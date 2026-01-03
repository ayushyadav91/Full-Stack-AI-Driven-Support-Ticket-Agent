import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Users, BarChart3, Zap, Shield, Clock, LogOut } from 'lucide-react';
import CustomModal from '../components/CustomModal';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    navigate('/dashboard');
  };

  const handleSignUpSuccess = (user, token) => {
    setCurrentUser(user);
    setShowSignUpModal(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'AI-Powered',
      description: 'Intelligent ticket routing and automated responses',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Seamless collaboration with your support team',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics',
      description: 'Comprehensive insights and performance metrics',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure',
      description: 'Enterprise-grade security for your data',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for your customers',
    },
    {
      icon: <Ticket className="h-6 w-6" />,
      title: 'Smart Ticketing',
      description: 'Organized and prioritized ticket management',
    },
  ];

  return (
    <div className="min-h-screen animated-gradient">
      {/* Navigation */}
      <nav className="glass backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">TicketAI</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {currentUser ? (
                <>
                  <span className="text-sm text-white/90">{currentUser.email}</span>
                  <Button variant="outline" onClick={handleLogout} className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setShowLoginModal(true)} className="text-white hover:bg-white/10">
                    Sign In
                  </Button>
                  <Button onClick={() => setShowSignUpModal(true)} className="bg-white text-indigo-600 hover:bg-white/90">
                    Get Started
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-white mb-6">
              AI-Powered Support
              <br />
              <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                Ticket Management
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Streamline your customer support with intelligent automation,
              powerful analytics, and seamless team collaboration.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setShowSignUpModal(true)}
                className="bg-white text-indigo-600 hover:bg-white/90 shadow-2xl"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowLoginModal(true)}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-white/80">
              Powerful features to transform your support workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full backdrop-blur-sm bg-white/90 border-white/20 hover:shadow-2xl transition-all duration-300 spotlight">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of teams already using TicketAI
            </p>
            <Button
              size="lg"
              onClick={() => setShowSignUpModal(true)}
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-2xl"
            >
              Create Your Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <CustomModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      >
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignUp={() => {
            setShowLoginModal(false);
            setShowSignUpModal(true);
          }}
        />
      </CustomModal>

      <CustomModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
      >
        <SignUpPage
          onSignUpSuccess={handleSignUpSuccess}
          onSwitchToLogin={() => {
            setShowSignUpModal(false);
            setShowLoginModal(true);
          }}
        />
      </CustomModal>
    </div>
  );
}
