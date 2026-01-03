import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
  Spinner,
} from '@heroui/react';
import {
  User,
  LogOut,
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Serverurl } from '../App.jsx';
import { toast } from 'react-hot-toast';
import CustomModal from '../components/CustomModal.jsx';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const [moderators, setModerators] = useState([]);

  const getToken = () => localStorage.getItem('authToken');

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
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

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
      toast.error('Failed to fetch moderators');
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
      const data = await res.json();
      const ticket = data.ticket;

      const mappedTicket = {
        id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status?.toLowerCase().replace('_', '-') || 'todo',
        priority: ticket.priority?.toLowerCase() || 'medium',
        category: ticket.relatedSkills?.[0] || 'General',
        assignee: ticket.assignedTo?.email || 'Unassigned',
        date: new Date(ticket.createdAt).toISOString().split('T')[0],
        helpfulNotes: ticket.helpfulNotes,
      };

      setTickets([mappedTicket, ...tickets]);
      setNewTicket({ title: '', description: '' });
      setShowCreateModal(false);
      toast.success('Ticket created successfully!');
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error('Failed to create ticket');
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
      critical: 'danger',    // Red
      high: 'danger',        // Red
      medium: 'warning',     // Orange/Yellow
      low: 'success',        // Green
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'closed': 'success',
      'in-progress': 'primary',
      'todo': 'warning',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    if (status === 'closed') return <CheckCircle className="w-5 h-5" />;
    if (status === 'in-progress') return <Clock className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Tickets',
      value: tickets.length,
      icon: <Ticket className="w-6 h-6" />,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      label: 'Resolved',
      value: tickets.filter(t => t.status === 'closed').length,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'In Progress',
      value: tickets.filter(t => t.status === 'in-progress').length,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      label: 'Pending',
      value: tickets.filter(t => t.status === 'todo').length,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 border-b border-indigo-700 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                TicketAI Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform"
                    color="secondary"
                    name={currentUser?.email}
                    size="sm"
                    showFallback
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{currentUser?.email}</p>
                  </DropdownItem>
                  <DropdownItem key="role">
                    Role: {currentUser?.role || 'user'}
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <Tabs
          aria-label="Dashboard tabs"
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gray-200",
            cursor: "w-full bg-indigo-600",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-indigo-600"
          }}
        >
          <Tab
            key="tickets"
            title={
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5" />
                <span>Tickets</span>
              </div>
            }
          />
          <Tab
            key="moderators"
            title={
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team</span>
              </div>
            }
          />
          <Tab
            key="analytics"
            title={
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </div>
            }
          />
        </Tabs>

        {/* Tab Content */}
        <div className="mt-8">
          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {/* Search and Create */}
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Search className="w-5 h-5 text-gray-400" />}
                  variant="underlined"
                  classNames={{
                    inputWrapper: "border-gray-100",
                    input: "pl-2"
                  }}
                  className="flex-1"
                />
                <Button
                  color="primary"
                  startContent={<Plus className="w-5 h-5" />}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  New Ticket
                </Button>
              </div>

              {/* Tickets List */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" color="primary" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <Card className="border border-gray-200 shadow-sm">
                  <CardBody className="text-center py-20">
                    <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg">No tickets found</p>
                  </CardBody>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {filteredTickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className="border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
                      isPressable
                    >
                      <CardBody className="p-5">
                        <div className="flex items-start gap-6">
                          {/* Left: Avatar & Assigned To */}
                          <div className="flex items-start gap-3 min-w-[180px]">
                            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Assigned to</p>
                              <p className="text-sm font-semibold text-gray-900">{ticket.assignee}</p>
                            </div>
                          </div>


                          {/* Center: Priority, Title, ID & Description */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <Chip
                                color={getPriorityColor(ticket.priority)}
                                variant="flat"
                                size="sm"
                                className="uppercase font-semibold flex-shrink-0"
                              >
                                {ticket.priority}
                              </Chip>
                              <div className="text-indigo-600 mt-0.5 flex-shrink-0">
                                {getStatusIcon(ticket.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="text-base font-bold text-gray-900 mb-0.5 truncate cursor-help"
                                  title={ticket.title}
                                >
                                  {ticket.title}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  ID: #{ticket.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                            <p
                              className="text-sm text-gray-600 line-clamp-2 ml-0 cursor-help"
                              title={ticket.description}
                            >
                              {ticket.description}
                            </p>
                          </div>

                          {/* Right: Category, Status, Date */}
                          <div className="flex items-start gap-8 min-w-[400px]">
                            <div className="min-w-[120px]">
                              <p className="text-xs text-gray-500 mb-1.5">Category</p>
                              <p className="text-sm font-medium text-gray-900">{ticket.category}</p>
                            </div>
                            <div className="min-w-[100px]">
                              <p className="text-xs text-gray-500 mb-1.5">Status</p>
                              <p className="text-sm font-medium text-gray-900">{ticket.status}</p>
                            </div>
                            <div className="min-w-[90px]">
                              <p className="text-xs text-gray-500 mb-1.5">Date</p>
                              <p className="text-sm font-medium text-gray-900">{ticket.date}</p>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Moderators Tab */}
          {activeTab === 'moderators' && (
            <div>
              {currentUser?.role === 'admin' ? (
                loading ? (
                  <div className="flex justify-center py-20">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {moderators.map((mod) => (
                      <Card
                        key={mod._id}
                        className="border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
                      >
                        <CardBody className="p-5">
                          <div className="flex items-center gap-6">
                            {/* Left: Avatar */}
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-indigo-600">
                                    {mod.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              </div>
                            </div>

                            {/* Center: Name & Role */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-gray-900 mb-1">
                                {mod.email.split('@')[0]}
                              </h3>
                              <p className="text-sm text-gray-600">{mod.role}</p>
                            </div>

                            {/* Right: Email & Skills */}
                            <div className="flex items-center gap-8 min-w-[500px]">
                              <div className="min-w-[200px]">
                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                <p className="text-sm font-medium text-gray-900 truncate" title={mod.email}>
                                  {mod.email}
                                </p>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1.5">Skills</p>
                                {mod.skills && mod.skills.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {mod.skills.slice(0, 3).map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {mod.skills.length > 3 && (
                                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                        +{mod.skills.length - 3}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-400">No skills</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                <Card className="border border-gray-200 shadow-sm">
                  <CardBody className="text-center py-20">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg">
                      Only admins can view team members
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <Card
                  key={i}
                  className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl hover:border-indigo-200 transition-all"
                >
                  <CardBody className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-600 text-sm mb-1 font-medium">{stat.label}</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.color} shadow-sm`}>{stat.icon}</div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Create Ticket Modal */}
      <CustomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Ticket"
        subtitle="Describe your issue and we'll help you resolve it"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ticket Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Unable to login to my account"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Please provide detailed information about your issue..."
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTicket}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}