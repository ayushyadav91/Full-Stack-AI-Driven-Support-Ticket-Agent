import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Navbar, NavbarBrand, NavbarContent, NavbarItem, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import LoginPage from './LoginPage.jsx';
import SignUpPage from './SignUpPage.jsx';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Ticket, Zap, Shield, TrendingUp, CheckCircle, Clock, Users } from 'lucide-react';
import CustomModal from '../components/CustomModal.jsx';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [userInteracted, setUserInteracted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userInteracted && !user) {
        setIsLoginOpen(true);
        setIsSignUp(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [userInteracted, user]);

  const handleUserClick = () => {
    setUserInteracted(true);
  };

  const handleLoginSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsLoginOpen(false);
    setIsSignUp(false);
    toast.success("Login successful!");
  };

  const handleSignUpSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsLoginOpen(false);
    setIsSignUp(false);
    toast.success("Account created successfully!");
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('authToken');
    setToken(null);
    setIsLoginOpen(false);
    setIsSignUp(false);
    toast.success("Logout successful!");
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Intelligent ticket categorization and priority assignment using advanced AI algorithms"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Smart Assignment",
      description: "Automatically assign tickets to the right team members based on skills and availability"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Track performance metrics and gain insights with comprehensive analytics dashboard"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Seamless collaboration tools for your support team to work together efficiently"
    }
  ];

  const stats = [
    { label: "Tickets Resolved", value: "10K+", icon: <CheckCircle className="w-6 h-6" /> },
    { label: "Avg Response Time", value: "< 2hrs", icon: <Clock className="w-6 h-6" /> },
    { label: "Customer Satisfaction", value: "98%", icon: <TrendingUp className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        isBordered
        className="bg-white border-b border-gray-200"
        maxWidth="xl"
      >
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Ticket className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="font-bold text-xl text-gray-900">
              TicketAI
            </p>
          </div>
        </NavbarBrand>

        <NavbarContent justify="end">
          {user ? (
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform"
                    color="secondary"
                    name={user.email}
                    size="sm"
                    showFallback
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{user.email}</p>
                  </DropdownItem>
                  <DropdownItem key="dashboard" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <Button
                color="primary"
                variant="solid"
                onClick={() => { setIsLoginOpen(true); setIsSignUp(false); handleUserClick(); }}
                className="bg-indigo-600 text-white"
              >
                Sign In
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
      </Navbar>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            AI-Powered Ticket
            <br />
            <span className="text-indigo-600">Management System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your support workflow with intelligent automation,
            smart routing, and real-time analytics
          </p>

          {!user ? (
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                color="primary"
                onClick={() => { setIsLoginOpen(true); setIsSignUp(true); handleUserClick(); }}
                className="bg-indigo-600 text-white px-8"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="bordered"
                onClick={() => { setIsLoginOpen(true); setIsSignUp(false); handleUserClick(); }}
                className="border-gray-300 text-gray-700 px-8"
              >
                Sign In
              </Button>
            </div>
          ) : (
            <div className="mt-10">
              <p className="text-gray-900 text-2xl mb-6">Welcome back, {user.name || user.email}!</p>
              <Button
                size="lg"
                color="primary"
                onClick={() => navigate("/dashboard")}
                className="bg-indigo-600 text-white px-8"
                startContent={<Ticket className="w-5 h-5" />}
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm">
              <CardBody className="text-center py-8">
                <div className="flex justify-center mb-4 text-indigo-600">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Powerful Features for Modern Support Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300"
                isPressable
              >
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <Card className="bg-indigo-600 border-0 shadow-lg">
            <CardBody className="text-center py-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your Support?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using TicketAI to deliver exceptional customer support
              </p>
              <Button
                size="lg"
                className="bg-white text-indigo-600 font-bold px-8"
                onClick={() => { setIsLoginOpen(true); setIsSignUp(true); handleUserClick(); }}
              >
                Start Free Trial
              </Button>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Auth Modal */}
      <CustomModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        size="md"
      >
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
      </CustomModal>
    </div>
  );
}
