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
  UserCircle,
  Info,
  ChevronLeft,
  ChevronRight,
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
import { ExpandableCard } from '../components/ui/expandable-card';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tickets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const [userSkills, setUserSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedTicketNotes, setSelectedTicketNotes] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }
    fetchUserData(token);
    fetchTickets(token);
    fetchUserProfile(token);
  }, [navigate]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${Serverurl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserSkills(data.user.skills || []);
        if (data.user.profilePicture) {
          setProfilePicturePreview(`${Serverurl}${data.user.profilePicture}`);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

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

  const fetchTickets = async (token, page = currentPage, limit = ticketsPerPage) => {
    setLoading(true);
    try {
      const response = await fetch(`${Serverurl}/api/ticket/get?page=${page}&limit=${limit}`, {
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
          helpfulNotes: ticket.helpfulNotes || null,
        }));
        setTickets(mappedTickets);
        setPaginationInfo(data.pagination);
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
        setNewTicket({ title: '', description: '' });
        setShowCreateModal(false);
        toast.success('Ticket created successfully!');

        // Refetch immediately to show the new ticket
        await fetchTickets(token);

        // Refetch again after 3 seconds to get the assigned moderator
        // (assignment happens asynchronously via Inngest)
        setTimeout(async () => {
          await fetchTickets(token);
          toast.success('Ticket assigned to moderator!');
        }, 10000);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const updateSkills = async (newSkills, profilePictureFile = null) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('skills', JSON.stringify(newSkills));

      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      const response = await fetch(`${Serverurl}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Profile updated successfully!');
        setCurrentUser({ ...currentUser, skills: newSkills });
        if (data.user.profilePicture) {
          setProfilePicturePreview(`${Serverurl}${data.user.profilePicture}`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
            <TabsTrigger value="profile">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <div className="space-y-6">
              {/* Search, Create, and Page Size */}
              <div className="flex gap-4 items-center">
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
                {paginationInfo && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-600">Per page:</label>
                    <select
                      value={ticketsPerPage}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value);
                        setTicketsPerPage(newLimit);
                        setCurrentPage(1);
                        const token = localStorage.getItem('authToken');
                        fetchTickets(token, 1, newLimit);
                      }}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                )}
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
                        {/* Header with Priority, Status, and Info Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(ticket.priority)} className="uppercase text-xs">
                              {ticket.priority}
                            </Badge>
                            {ticket.helpfulNotes && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTicketNotes({
                                    title: ticket.title,
                                    notes: ticket.helpfulNotes
                                  });
                                  setShowNotesModal(true);
                                }}
                                className="p-1.5 rounded-full hover:bg-blue-100 transition-colors"
                                title="View helpful notes"
                              >
                                <Info className="h-4 w-4 text-blue-600" />
                              </button>
                            )}
                          </div>
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

              {/* Page Navigation at Bottom */}
              {paginationInfo && !loading && filteredTickets.length > 0 && (
                <div className="flex items-center justify-center gap-3 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      const token = localStorage.getItem('authToken');
                      fetchTickets(token, newPage, ticketsPerPage);
                    }}
                    disabled={!paginationInfo.hasPrevPage}
                    className="bg-white hover:bg-gray-50 text-neutral-700 border-neutral-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-white bg-neutral-800 px-4 py-2 rounded-lg">
                    Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      const token = localStorage.getItem('authToken');
                      fetchTickets(token, newPage, ticketsPerPage);
                    }}
                    disabled={!paginationInfo.hasNextPage}
                    className="bg-white hover:bg-gray-50 text-neutral-700 border-neutral-300"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
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
                <ExpandableCard
                  cards={moderators.map((mod) => ({
                    title: mod.email.split('@')[0],
                    description: mod.role,
                    ctaText: "View Profile",
                    image: true,
                    content: () => (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-neutral-700 mb-2">Contact Information</h4>
                          <p className="text-sm text-neutral-600">
                            <span className="font-medium">Email:</span> {mod.email}
                          </p>
                          <p className="text-sm text-neutral-600 mt-1">
                            <span className="font-medium">Role:</span> {mod.role}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-neutral-700 mb-2">Skills</h4>
                          {mod.skills && mod.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {mod.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-neutral-400">No skills listed</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-neutral-700 mb-2">Member Since</h4>
                          <p className="text-sm text-neutral-600">
                            {new Date(mod.createdAt || Date.now()).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    ),
                  }))}
                />
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

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* User Info Card */}
              <Card className="backdrop-blur-sm bg-white/90">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile"
                          className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-lg">
                          {currentUser?.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label
                        htmlFor="profile-picture-upload"
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        title="Change profile picture"
                      >
                        <User className="h-4 w-4 text-neutral-600" />
                      </label>
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('File size must be less than 5MB');
                              return;
                            }
                            setProfilePicture(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfilePicturePreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-neutral-900">{currentUser?.email?.split('@')[0]}</h3>
                      <p className="text-neutral-600">{currentUser?.email}</p>
                      <Badge variant="default" className="mt-2">{currentUser?.role}</Badge>
                      {profilePicture && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            onClick={async () => {
                              await updateSkills(userSkills, profilePicture);
                              setProfilePicture(null);
                            }}
                          >
                            Upload Picture
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Management */}
              <Card className="backdrop-blur-sm bg-white/90">
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a new skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && skillInput.trim()) {
                          e.preventDefault();
                          if (!userSkills.includes(skillInput.trim())) {
                            const newSkills = [...userSkills, skillInput.trim()];
                            setUserSkills(newSkills);
                            setSkillInput('');
                            await updateSkills(newSkills);
                          } else {
                            toast.error('Skill already exists');
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={async () => {
                        if (skillInput.trim()) {
                          if (!userSkills.includes(skillInput.trim())) {
                            const newSkills = [...userSkills, skillInput.trim()];
                            setUserSkills(newSkills);
                            setSkillInput('');
                            await updateSkills(newSkills);
                          } else {
                            toast.error('Skill already exists');
                          }
                        }
                      }}
                      disabled={!skillInput.trim()}
                    >
                      Add Skill
                    </Button>
                  </div>

                  {userSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {userSkills.map((skill, idx) => (
                        <Badge key={idx} variant="default" className="flex items-center gap-2">
                          {skill}
                          <button
                            onClick={async () => {
                              const newSkills = userSkills.filter((s) => s !== skill);
                              setUserSkills(newSkills);
                              await updateSkills(newSkills);
                            }}
                            className="hover:bg-indigo-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Tickets - Raised by User */}
              <Card className="backdrop-blur-sm bg-white/90">
                <CardHeader>
                  <CardTitle>Tickets I Created</CardTitle>
                </CardHeader>
                <CardContent>
                  {tickets.filter(t => t.createdBy === currentUser?.email || t.assignee !== currentUser?.email).length > 0 ? (
                    <div className="space-y-3">
                      {tickets.filter(t => t.createdBy === currentUser?.email || t.assignee !== currentUser?.email).slice(0, 5).map((ticket) => (
                        <div key={ticket.id} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-neutral-900">{ticket.title}</h4>
                              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{ticket.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                                  {ticket.priority}
                                </Badge>
                                <span className="text-xs text-neutral-500">{ticket.date}</span>
                              </div>
                            </div>
                            {getStatusIcon(ticket.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-neutral-500 py-8">No tickets created yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Assigned Tickets */}
              <Card className="backdrop-blur-sm bg-white/90">
                <CardHeader>
                  <CardTitle>Tickets Assigned to Me</CardTitle>
                </CardHeader>
                <CardContent>
                  {tickets.filter(t => t.assignee === currentUser?.email).length > 0 ? (
                    <div className="space-y-3">
                      {tickets.filter(t => t.assignee === currentUser?.email).map((ticket) => (
                        <div key={ticket.id} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-neutral-900">{ticket.title}</h4>
                              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{ticket.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                                  {ticket.priority}
                                </Badge>
                                <span className="text-xs text-neutral-500">{ticket.category}</span>
                                <span className="text-xs text-neutral-500">{ticket.date}</span>
                              </div>
                            </div>
                            {getStatusIcon(ticket.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-neutral-500 py-8">No tickets assigned to you</p>
                  )}
                </CardContent>
              </Card>
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

      {/* Helpful Notes Modal */}
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} className="max-w-3xl">
        <ModalHeader onClose={() => setShowNotesModal(false)}>
          <ModalTitle>Helpful Notes</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {selectedTicketNotes && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded sticky top-0 z-10">
                <h4 className="font-bold text-neutral-900 mb-2">{selectedTicketNotes.title}</h4>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
                  {selectedTicketNotes.notes}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowNotesModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}