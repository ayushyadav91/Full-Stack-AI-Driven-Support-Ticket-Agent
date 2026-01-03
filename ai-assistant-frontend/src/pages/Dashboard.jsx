import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ticket,
  Users,
  BarChart3,
  Search,
  Plus,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  LogOut,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Serverurl } from '../App.jsx';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Spinner } from '../components/ui/spinner';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../components/ui/modal';
import { HoverEffect } from '../components/ui/card-hover-effect';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tickets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }
    fetchUserData(token);
    fetchTickets(token);
  }, [navigate]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${Serverurl}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(decoded);
        setModerators(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchTickets = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${Serverurl}/api/ticket/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const mappedTickets = data.tickets.map((ticket) => ({
          id: ticket._id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status?.toLowerCase().replace('_', '-') || 'todo',
          priority: ticket.priority?.toLowerCase() || 'medium',
          category: ticket.relatedSkills?.[0] || 'General',
          assignee: ticket.assignedTo?.email || 'Unassigned',
          date: new Date(ticket.createdAt).toISOString().split('T')[0],
        }));
        setTickets(mappedTickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${Serverurl}/api/ticket/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });

      if (response.ok) {
        const data = await response.json();
        const mappedTicket = {
          id: data.ticket._id,
          title: data.ticket.title,
          description: data.ticket.description,
          status: data.ticket.status?.toLowerCase().replace('_', '-') || 'todo',
          priority: data.ticket.priority?.toLowerCase() || 'medium',
          category: data.ticket.relatedSkills?.[0] || 'General',
          assignee: data.ticket.assignedTo?.email || 'Unassigned',
          date: new Date(data.ticket.createdAt).toISOString().split('T')[0],
        };
        setTickets([mappedTicket, ...tickets]);
        setNewTicket({ title: '', description: '' });
        setShowCreateModal(false);
        toast.success('Ticket created successfully!');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'danger',
      high: 'danger',
      medium: 'warning',
      low: 'success',
    };
    return colors[priority] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      closed: <CheckCircle className="h-5 w-5" />,
      'in-progress': <Clock className="h-5 w-5" />,
      todo: <AlertCircle className="h-5 w-5" />,
    };
    return icons[status] || <AlertCircle className="h-5 w-5" />;
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Tickets',
      value: tickets.length,
      icon: <Ticket className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'In Progress',
      value: tickets.filter((t) => t.status === 'in-progress').length,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Completed',
      value: tickets.filter((t) => t.status === 'closed').length,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Team Members',
      value: moderators.length,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <div className="glass backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-2xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm glow-hover float">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">TicketAI Dashboard</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <span className="text-sm text-white/90">{currentUser?.email}</span>
              <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <Tabs defaultValue="tickets" onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="tickets">
              <Ticket className="mr-2 h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="mr-2 h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <div className="space-y-6">
              {/* Search and Create */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/90 backdrop-blur-sm"
                  />
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-5 w-5" />
                  New Ticket
                </Button>
              </div>

              {/* Tickets List */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <Card className="backdrop-blur-sm bg-white/90">
                  <CardContent className="py-20 text-center">
                    <Ticket className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                    <p className="text-neutral-600">No tickets found</p>
                  </CardContent>
                </Card>
              ) : (
                <HoverEffect
                  items={filteredTickets.map((ticket) => ({
                    id: ticket.id,
                    children: (
                      <div className="space-y-4">
                        {/* Header with Priority and Status */}
                        <div className="flex items-center justify-between">
                          <Badge variant={getPriorityColor(ticket.priority)} className="uppercase text-xs">
                            {ticket.priority}
                          </Badge>
                          <div className="text-neutral-600">{getStatusIcon(ticket.status)}</div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-neutral-900 line-clamp-2" title={ticket.title}>
                          {ticket.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-neutral-600 line-clamp-3" title={ticket.description}>
                          {ticket.description}
                        </p>

                        {/* Metadata */}
                        <div className="space-y-2 pt-2 border-t border-neutral-200">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-neutral-400" />
                            <span className="text-sm font-bold text-neutral-900">{ticket.assignee}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span>{ticket.category}</span>
                            <span>{ticket.date}</span>
                          </div>
                          <div className="text-xs text-neutral-400">
                            ID: #{ticket.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    ),
                  }))}
                  className="gap-4"
                />
              )}
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            {currentUser?.role === 'admin' ? (
              loading ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {moderators.map((mod, index) => (
                    <motion.div
                      key={mod._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="backdrop-blur-sm bg-white/90 hover:shadow-xl transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-6">
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                                  <span className="text-lg font-bold text-indigo-600">
                                    {mod.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-base font-bold text-neutral-900">{mod.email.split('@')[0]}</h3>
                              <p className="text-sm text-neutral-600">{mod.role}</p>
                            </div>

                            <div className="flex min-w-[500px] items-center gap-8">
                              <div className="min-w-[200px]">
                                <p className="mb-1 text-xs text-neutral-500">Email</p>
                                <p className="truncate text-sm font-medium text-neutral-900" title={mod.email}>
                                  {mod.email}
                                </p>
                              </div>
                              <div className="flex-1">
                                <p className="mb-1.5 text-xs text-neutral-500">Skills</p>
                                {mod.skills && mod.skills.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {mod.skills.slice(0, 3).map((skill, idx) => (
                                      <Badge key={idx} variant="default" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {mod.skills.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{mod.skills.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-neutral-400">No skills</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <Card className="backdrop-blur-sm bg-white/90">
                <CardContent className="py-20 text-center">
                  <Users className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <p className="text-neutral-600">Only admins can view team members</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="backdrop-blur-sm bg-white/90 hover:shadow-2xl transition-all spotlight">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="mb-1 text-sm font-medium text-neutral-600">{stat.label}</p>
                          <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`rounded-xl p-3 shadow-lg float ${stat.color}`}>{stat.icon}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Ticket Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader onClose={() => setShowCreateModal(false)}>
          <ModalTitle>Create New Ticket</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700">Title</label>
              <Input
                type="text"
                placeholder="Enter ticket title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700">Description</label>
              <textarea
                placeholder="Describe the issue..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTicket} disabled={loading}>
            {loading ? 'Creating...' : 'Create Ticket'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}