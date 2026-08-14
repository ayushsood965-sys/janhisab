import React, { useEffect, useState, useRef } from 'react';
import { getAndolanRooms, createAndolanRoom, getAndolanMessages, sendAndolanMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Radio,
  Users,
  Clock,
  Send,
  ShieldAlert,
  AlertTriangle,
  PlusCircle,
  Sparkles,
  MapPin,
  X,
} from 'lucide-react';

export default function AndolanLivePage() {
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [liveUsersCount, setLiveUsersCount] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Create room state
  const [roomTitle, setRoomTitle] = useState('');
  const [roomTopic, setRoomTopic] = useState('');
  const [roomLocation, setRoomLocation] = useState('Jantar Mantar, New Delhi');
  const [creating, setCreating] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await getAndolanRooms();
      if (res.data.success) {
        setRooms(res.data.rooms || []);
        if (!activeRoom && res.data.rooms?.length > 0) {
          selectRoom(res.data.rooms[0]);
        }
      }
    } catch (err) {
      console.warn('Andolan rooms error:', err.message);
    }
  };

  const selectRoom = async (room) => {
    setActiveRoom(room);
    try {
      const res = await getAndolanMessages(room._id);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      // ignore
    }
    if (socket) {
      socket.emit('join_andolan', { roomId: room._id });
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('andolan_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    socket.on('andolan_user_count', ({ count }) => {
      setLiveUsersCount(count);
    });

    return () => {
      socket.off('andolan_message');
      socket.off('andolan_user_count');
    };
  }, [socket, activeRoom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoom) return;
    if (!isAuthenticated) {
      alert('Please log in or create an anonymous handle to participate in Andolan.');
      return;
    }

    const payload = {
      content: messageInput.trim(),
      authorHandle: user?.handle || 'Anonymous Nagrik',
    };

    try {
      const res = await sendAndolanMessage(activeRoom._id, payload);
      if (res.data.success) {
        if (socket) {
          socket.emit('send_andolan_message', {
            roomId: activeRoom._id,
            message: res.data.messageObj,
          });
        } else {
          setMessages((prev) => [...prev, res.data.messageObj]);
        }
        setMessageInput('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending message');
    }
  };

  const handleCreateRoomSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to initiate an Andolan space.');
      return;
    }
    setCreating(true);
    try {
      const res = await createAndolanRoom({
        title: roomTitle,
        topic: roomTopic,
        location: roomLocation,
      });

      if (res.data.success) {
        alert('🎉 48-Hour Ephemeral Andolan Space launched!');
        setShowCreateModal(false);
        setRoomTitle('');
        setRoomTopic('');
        fetchRooms();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">📢 48-HOUR EPHEMERAL ANDOLAN SPACE</span>
              <span>•</span>
              <span className="text-textMuted font-bold">TTL AUTO-DESTRUCT CHAT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Live Civic Mobilization Rooms
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Real-time, zero-footprint decentralized coordination spaces that automatically self-destruct after 48 hours. Zero digital trace left behind.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm flex items-center space-x-2 shrink-0 transition-all active:scale-[0.98]"
          >
            <Radio className="w-4 h-4" />
            <span>Create 48h Andolan Space</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="leading-relaxed">
          <strong>Peaceful Demonstration Protocol:</strong> Maintain strictly non-violent, constitutional civic gatherings. Do not share personally identifiable phone numbers or private addresses.
        </p>
      </div>

      {/* Main Chat & Rooms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rooms Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-textPrimary font-mono uppercase tracking-wider">
            Active 48h Andolans ({rooms.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {rooms.map((r) => (
              <button
                key={r._id}
                onClick={() => selectRoom(r)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  activeRoom?._id === r._id
                    ? 'border-brand-500 bg-brand-50/80 ring-2 ring-brand-200/80 shadow-xs'
                    : 'border-brand-100 bg-white hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-textPrimary font-['Outfit'] text-sm truncate">{r.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono font-bold">
                    48h TTL
                  </span>
                </div>
                <p className="text-xs text-textSecondary truncate">{r.topic}</p>
                <div className="flex items-center justify-between text-[10px] text-textMuted mt-2 pt-2 border-t border-brand-100 font-mono">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{r.location}</span>
                  </span>
                  <span>{r.activeUsers || 1} online</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Chat Panel (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-brand-200/80 shadow-glass flex flex-col justify-between h-[550px] glass-card">
          {activeRoom ? (
            <>
              {/* Room Header */}
              <div className="flex items-center justify-between pb-3 border-b border-brand-100">
                <div>
                  <h3 className="text-lg font-bold text-textPrimary font-['Outfit']">{activeRoom.title}</h3>
                  <p className="text-xs text-textSecondary">{activeRoom.location} • {activeRoom.topic}</p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{liveUsersCount} Nagriks Active</span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-xs text-textMuted font-mono">
                    Space initiated. Post first anonymous ground coordination update.
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                        m.authorHandle === user?.handle
                          ? 'ml-auto bg-gradient-cta text-white shadow-xs'
                          : 'bg-brand-50/60 border border-brand-100 text-textPrimary'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-80 mb-1 font-mono">
                        <span className="font-bold">{m.authorHandle}</span>
                        <span>{new Date(m.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{m.content}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-3 border-t border-brand-100">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Share live ground updates, legal aid helpline info..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-500 shadow-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] flex items-center space-x-1 shadow-xs transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-32 text-textMuted">Select an Andolan space to enter live stream.</div>
          )}
        </div>
      </div>

      {/* Create Andolan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-md w-full p-8 shadow-glass-lg relative glass-dropdown">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              Create 48h Andolan Space
            </h3>
            <p className="text-xs text-textSecondary mb-4">
              Decentralized ephemeral room with 48h auto-destruct TTL.
            </p>

            <form onSubmit={handleCreateRoomSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Andolan Title</label>
                <input
                  type="text"
                  required
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="e.g. Save Hasdeo Forest — Peaceful Vigil"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Core Demand / Topic</label>
                <textarea
                  required
                  rows={2}
                  value={roomTopic}
                  onChange={(e) => setRoomTopic(e.target.value)}
                  placeholder="State the constitutional demand..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Assembly Location</label>
                <input
                  type="text"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  placeholder="e.g. Jantar Mantar, New Delhi"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all disabled:opacity-50 mt-2"
              >
                {creating ? 'Launching...' : '📢 Launch 48h Ephemeral Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
