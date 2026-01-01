import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { Serverurl } from "../App.jsx"

export default function TicketManagementUI() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /* ================= FETCH TICKETS ================= */
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${Serverurl}/api/ticket/get`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();

      const mapped = data.map(ticket => ({
        id: ticket._id,
        title: ticket.title,
        status: ticket.status.toLowerCase().replace('_', '-'),
        priority: ticket.priority,
        category: ticket.relatedSkills?.[0] || 'General',
        assignee: ticket.assignedTo ? 'Assigned' : 'Unassigned',
        date: new Date(ticket.createdAt).toISOString().split('T')[0],
      }));

      setTickets(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= CREATE TICKET ================= */
  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${Serverurl}/api/ticket/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });
      if (!res.ok) throw new Error('Create ticket failed');

      const ticket = await res.json();
      const mappedTicket = {
        id: ticket._id,
        title: ticket.title,
        status: ticket.status.toLowerCase().replace('_', '-'),
        priority: ticket.priority,
        category: ticket.relatedSkills?.[0] || 'General',
        assignee: ticket.assignedTo ? 'Assigned' : 'Unassigned',
        date: new Date(ticket.createdAt).toISOString().split('T')[0],
      };

      setTickets([mappedTicket, ...tickets]);
      setNewTicket({ title: '', description: '' });
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
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

  const filteredTickets = tickets.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6">
      {/* Search & Filter */}
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

      {/* Tickets Grid */}
      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                {getStatusIcon(ticket.status)}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition">{ticket.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">ID: #{ticket.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>

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

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-2xl max-w-md w-full border border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Create New Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <Send className="w-6 h-6" />
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
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                <Send className="w-4 h-4" />
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
