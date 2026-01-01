import React, { useState, useEffect } from 'react';
import { User, LogOut, AlertCircle, Search, Menu, X, Plus, Filter, Clock, CheckCircle, Send, BarChart3 } from 'lucide-react';

import { Serverurl } from '../App.jsx';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const [moderators, setModerators] = useState([]);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('authToken');

  // Fetch current user
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({ email: decoded.email, role: decoded.role });
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);

  // Fetch Tickets
  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${Serverurl}/api/ticket/get`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();

      // Map backend data to frontend format
      const mapped = (Array.isArray(data) ? data : data.tickets || []).map(ticket => ({
        id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status.toLowerCase().replace('_', '-'),
        priority: ticket.priority?.toLowerCase() || 'medium',
        category: ticket.relatedSkills?.[0] || 'General',
        assignee: ticket.assignedTo?.email || 'Unassigned',
        date: new Date(ticket.createdAt).toISOString().split('T')[0],
        helpfulNotes: ticket.helpfulNotes,
      }));

      setTickets(mapped);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Moderators/Users
  useEffect(() => {
    if (activeTab === 'moderators' && currentUser?.role === 'admin') {
      fetchModerators();
    }
  }, [activeTab, currentUser]);

  const fetchModerators = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${Serverurl}/api/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setModerators(data.users || []);
    } catch (err) {
      console.error('Error fetching moderators:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create Ticket
  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${Serverurl}/api/ticket/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });

      if (!res.ok) throw new Error('Failed to create ticket');
      const ticket = await res.json();

      const mappedTicket = {
        id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status.toLowerCase().replace('_', '-'),
        priority: ticket.priority?.toLowerCase() || 'medium',
        category: ticket.relatedSkills?.[0] || 'General',
        assignee: ticket.assignedTo?.email || 'Unassigned',
        date: new Date(ticket.createdAt).toISOString().split('T')[0],
        helpfulNotes: ticket.helpfulNotes,
      };

      setTickets([mappedTicket, ...tickets]);
      setNewTicket({ title: '', description: '' });
      setShowCreateModal(false);
      alert('Ticket created successfully!');
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'closed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'in-progress') return <Clock className="w-5 h-5 text-blue-500" />;
    return <AlertCircle className="w-5 h-5 text-orange-500" />;
  };

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col h-screen`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          {showSidebar && <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">TicketAI</h1>}
          <button onClick={() => setShowSidebar(!showSidebar)} className="text-slate-400 hover:text-white">
            {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: <AlertCircle className="w-5 h-5" />, label: 'Tickets', tab: 'tickets' },
            { icon: <User className="w-5 h-5" />, label: 'Moderators', tab: 'moderators' },
            { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', tab: 'analytics' },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
            >
              {item.icon}
              {showSidebar && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-700 cursor-pointer hover:bg-slate-600 transition">
            <User className="w-5 h-5 text-cyan-400" />
            {showSidebar && (
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{currentUser?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-slate-400">{currentUser?.role || 'user'}</p>
              </div>
            )}
            <button onClick={handleLogout} className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'tickets' && '🎫 Ticket Management'}
                {activeTab === 'moderators' && '👥 Moderators'}
                {activeTab === 'analytics' && '📊 Analytics'}
              </h2>
              <p className="text-slate-400">Manage and track support tickets with AI assistance</p>
            </div>
            {activeTab === 'tickets' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>New Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-700 transition">
                  <Filter className="w-5 h-5" />
                  <span>Filter</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center text-slate-400 py-10">Loading tickets...</div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center text-slate-400 py-10">No tickets found</div>
              ) : (
                <div className="grid gap-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          {getStatusIcon(ticket.status)}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition">{ticket.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">ID: #{ticket.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 mb-4">{ticket.description}</p>

                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Category</p>
                          <p className="text-sm font-medium text-white">{ticket.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Assigned To</p>
                          <p className="text-sm font-medium text-white">{ticket.assignee}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Status</p>
                          <span className="inline-block px-2 py-1 bg-slate-700 text-white text-xs rounded capitalize">{ticket.status}</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Date</p>
                          <p className="text-sm font-medium text-white">{ticket.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Moderators Tab */}
          {activeTab === 'moderators' && (
            <div className="p-6">
              {currentUser?.role === 'admin' ? (
                <div className="grid grid-cols-3 gap-6">
                  {moderators.map((mod) => (
                    <div key={mod._id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-cyan-500 transition-all">
                      <h3 className="text-lg font-bold text-white mb-2">{mod.email}</h3>
                      <p className="text-slate-400 text-sm mb-4">Role: {mod.role}</p>
                      {mod.skills && mod.skills.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {mod.skills.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-10">Only admins can view moderators</div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6 grid grid-cols-2 gap-6">
              {[
                { label: 'Total Tickets', value: tickets.length, icon: '📋', color: 'from-cyan-500 to-blue-500' },
                { label: 'Resolved', value: tickets.filter(t => t.status === 'closed').length, icon: '✅', color: 'from-green-500 to-emerald-500' },
                { label: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, icon: '⏳', color: 'from-yellow-500 to-orange-500' },
                { label: 'Avg Response Time', value: '2.5h', icon: '⚡', color: 'from-purple-500 to-pink-500' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.color} p-6 rounded-lg text-white shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-200 text-sm mb-1">{stat.label}</p>
                      <p className="text-4xl font-bold">{stat.value}</p>
                    </div>
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-2xl max-w-md w-full border border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Create New Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter ticket title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description</label>
                <textarea
                  placeholder="Describe your issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Create'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}