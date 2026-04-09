import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { useLobbies, Lobby } from '@/hooks/useLobbies';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Search, Filter, ShieldCheck, Gamepad2, Trash2, Edit2, Check, X, Crown, Mic, Copy, LogOut, Settings, MessageSquare, Map as MapIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestoreErrorHandler';
import { toast } from 'sonner';
import VoiceChat from '@/components/lobby/VoiceChat';
import LobbyChat from '@/components/lobby/LobbyChat';

const MAPS = ['Haven', 'Bind', 'Split', 'Ascent', 'Icebox', 'Breeze', 'Fracture', 'Pearl', 'Lotus', 'Sunset', 'Abyss'];
const VARIATIONS = ['Standard', 'Spike Rush', 'Swiftplay', 'Escalation', 'Deathmatch', 'Team Deathmatch'];

export default function LobbyPage() {
  const { user, profile } = useAuth();
  const { lobbies, loading, createLobby, joinLobby, leaveLobby, deleteLobby, updateLobbyTitle, updateLobbySettings, toggleVoice } = useLobbies();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, { username: string, avatar: string }>>({});
  
  // UI state
  const [editingLobbyId, setEditingLobbyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [settingsLobbyId, setSettingsLobbyId] = useState<string | null>(null);
  const [showChatLobbyId, setShowChatLobbyId] = useState<string | null>(null);

  // Party code entry
  const [joiningLobbyId, setJoiningLobbyId] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');

  // Fetch player profiles for avatars
  useEffect(() => {
    const fetchProfiles = async () => {
      const uids = new Set<string>();
      lobbies.forEach(l => l.players.forEach(uid => {
        if (!playerProfiles[uid]) uids.add(uid);
      }));

      if (uids.size === 0) return;

      const newProfiles = { ...playerProfiles };
      await Promise.all(Array.from(uids).map(async (uid) => {
        const path = `users/${uid}`;
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            newProfiles[uid] = { 
              username: data.username || 'Agent', 
              avatar: data.avatar || '' 
            };
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      }));
      setPlayerProfiles(newProfiles);
    };

    if (lobbies.length > 0) {
      fetchProfiles();
    }
  }, [lobbies]);
  
  // Create lobby form state
  const [title, setTitle] = useState('');
  const [rankReq, setRankReq] = useState('Any');
  const [mode, setMode] = useState('Competitive');
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [partyCode, setPartyCode] = useState('');
  const [modeFilter, setModeFilter] = useState('All');

  const filteredLobbies = lobbies.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
                         l.hostName.toLowerCase().includes(search.toLowerCase());
    const matchesMode = modeFilter === 'All' || l.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const handleCreate = async () => {
    if (!title) return;
    try {
      await createLobby(title, rankReq, maxPlayers, mode, partyCode);
      setIsCreateOpen(false);
      // Reset form
      setTitle('');
      setRankReq('Any');
      setMode('Competitive');
      setMaxPlayers(5);
      setPartyCode('');
    } catch (error) {
      console.error('Failed to create lobby', error);
    }
  };

  const handleJoin = async (lobby: Lobby) => {
    if (lobby.players.includes(user?.uid || '')) {
      toast.info('You are already in this lobby.');
      return;
    }
    if (lobby.partyCode) {
      setJoiningLobbyId(lobby.id);
      return;
    }
    await joinLobby(lobby.id);
  };

  const submitCode = async () => {
    const lobby = lobbies.find(l => l.id === joiningLobbyId);
    if (lobby && enteredCode.toUpperCase() === lobby.partyCode?.toUpperCase()) {
      await joinLobby(lobby.id);
      setJoiningLobbyId(null);
      setEnteredCode('');
    } else {
      toast.error('Invalid party code!');
    }
  };

  const handleSaveTitle = async (lobbyId: string) => {
    if (!editTitle.trim()) return;
    try {
      await updateLobbyTitle(lobbyId, editTitle);
      setEditingLobbyId(null);
    } catch (error) {
      console.error('Failed to update title', error);
    }
  };

  const handleUpdateSettings = async (lobbyId: string, updates: any) => {
    try {
      await updateLobbySettings(lobbyId, updates);
    } catch (error) {
      console.error('Failed to update settings', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Party code copied!');
  };

  const currentSettingsLobby = lobbies.find(l => l.id === settingsLobbyId);

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 italic">LOBBY FINDER</h1>
            <p className="text-gray-400">Join custom games or create your own lobby.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
              {['All', 'Competitive', 'Custom'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    modeFilter === m
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Search lobbies or hosts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-purple-500/50"
              />
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all">
                  <Plus size={20} />
                  Create Lobby
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black tracking-tight">CREATE LOBBY</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lobby Title</label>
                    <Input
                      placeholder="e.g., 5v5 Competitive Scrims"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white/5 border-white/10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Game Mode</label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full h-12 bg-white/5 border-white/10 rounded-xl px-4 text-sm outline-none focus:ring-2 ring-purple-500/50"
                      >
                        {['Competitive', 'Custom'].map(m => (
                          <option key={m} value={m} className="bg-zinc-900">{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max Players</label>
                      <Input
                        type="number"
                        min={2}
                        max={10}
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Party Code (Optional)</label>
                    <Input
                      placeholder="e.g., KERALA123"
                      value={partyCode}
                      onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                      className="bg-white/5 border-white/10 h-12 rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rank Required</label>
                    <select
                      value={rankReq}
                      onChange={(e) => setRankReq(e.target.value)}
                      className="w-full h-12 bg-white/5 border-white/10 rounded-xl px-4 text-sm outline-none focus:ring-2 ring-purple-500/50"
                    >
                      {['Any', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'].map(r => (
                        <option key={r} value={r} className="bg-zinc-900">{r}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleCreate} className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    Launch Lobby
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredLobbies.map((lobby, i) => (
              <motion.div
                key={lobby.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
                layout
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group rounded-3xl overflow-hidden border-2 border-transparent hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {lobby.rankRequired} Rank
                        </Badge>
                        <Badge variant="outline" className="bg-pink-500/10 text-pink-400 border-pink-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {lobby.mode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users size={14} />
                        <span className="text-xs font-bold">{lobby.playerCount}/{lobby.maxPlayers}</span>
                      </div>
                    </div>
                      <div className="flex items-center gap-2">
                        {editingLobbyId === lobby.id ? (
                          <div className="flex items-center gap-2 w-full">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-8 bg-white/10 border-white/20 text-sm font-bold italic uppercase tracking-tight"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle(lobby.id);
                                if (e.key === 'Escape') setEditingLobbyId(null);
                              }}
                            />
                            <Button 
                              size="icon-xs" 
                              variant="ghost" 
                              onClick={() => handleSaveTitle(lobby.id)}
                              className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            >
                              <Check size={14} />
                            </Button>
                            <Button 
                              size="icon-xs" 
                              variant="ghost" 
                              onClick={() => setEditingLobbyId(null)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-xl font-black italic text-white group-hover:text-purple-400 transition-colors tracking-tight">
                              {lobby.title}
                            </CardTitle>
                            {user && lobby.hostId === user.uid && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => {
                                    setEditingLobbyId(lobby.id);
                                    setEditTitle(lobby.title);
                                  }}
                                  className="text-gray-500 hover:text-purple-400 hover:bg-purple-400/10"
                                >
                                  <Edit2 size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => setSettingsLobbyId(lobby.id)}
                                  className="text-gray-500 hover:text-purple-400 hover:bg-purple-400/10"
                                >
                                  <Settings size={14} />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    {user && lobby.hostId === user.uid && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLobby(lobby.id);
                        }}
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <ShieldCheck size={16} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">Host</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white">{lobby.hostName}</p>
                                {user && lobby.hostId === user.uid && (
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-2 py-0 h-4 rounded-full text-[8px] font-black uppercase tracking-widest">
                                      You
                                    </Badge>
                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-2 py-0 h-4 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                      <Crown size={8} />
                                      Owner
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {lobby.partyCode && (
                            <div className="text-right">
                              <p className="text-[10px] text-gray-500 uppercase font-bold">Code</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-purple-400 font-mono tracking-widest">{lobby.partyCode}</p>
                                <Button 
                                  variant="ghost" 
                                  size="icon-xs" 
                                  onClick={() => copyCode(lobby.partyCode!)}
                                  className="text-gray-500 hover:text-white"
                                >
                                  <Copy size={12} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                            <MapIcon size={16} className="text-purple-400" />
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">Map</p>
                              <p className="text-xs font-bold text-white">{lobby.map || 'Haven'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                            <Gamepad2 size={16} className="text-pink-400" />
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">Variation</p>
                              <p className="text-xs font-bold text-white">{lobby.modeVariation || 'Standard'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Players</p>
                          <div className="flex flex-wrap gap-2">
                            {lobby.players.map((uid) => (
                              <div key={uid} className="flex items-center gap-2 bg-white/5 pr-3 pl-1 py-1 rounded-full border border-white/10 group/player relative">
                                <Avatar className="h-6 w-6 border border-white/10">
                                  <AvatarImage src={playerProfiles[uid]?.avatar} />
                                  <AvatarFallback className="bg-purple-900 text-[8px] text-white">
                                    {playerProfiles[uid]?.username?.substring(0, 2).toUpperCase() || '??'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-bold text-gray-300 group-hover/player:text-white transition-colors">
                                  {playerProfiles[uid]?.username || 'Loading...'}
                                </span>
                                {(lobby.voiceParticipants || []).includes(uid) && (
                                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border border-black">
                                    <Mic size={8} className="text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {Array.from({ length: lobby.maxPlayers - lobby.playerCount }).map((_, idx) => (
                              <div key={`empty-${idx}`} className="w-8 h-8 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center">
                                <Plus size={12} className="text-zinc-800" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {user && lobby.players.includes(user.uid) && (
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setShowChatLobbyId(showChatLobbyId === lobby.id ? null : lobby.id)}
                                variant="outline"
                                className={`flex-1 h-10 rounded-xl border-white/10 gap-2 ${showChatLobbyId === lobby.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}
                              >
                                <MessageSquare size={16} />
                                {showChatLobbyId === lobby.id ? 'Hide Chat' : 'Lobby Chat'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => leaveLobby(lobby.id)}
                                className="h-10 w-10 rounded-xl border-white/10 text-red-400 hover:bg-red-500/10 hover:text-red-300 p-0"
                              >
                                <LogOut size={16} />
                              </Button>
                            </div>
                            
                            {showChatLobbyId === lobby.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <LobbyChat lobbyId={lobby.id} />
                              </motion.div>
                            )}

                            <VoiceChat 
                              lobbyId={lobby.id} 
                              participants={lobby.voiceParticipants || []} 
                              onToggleVoice={(isJoining) => toggleVoice(lobby.id, isJoining)}
                            />
                          </div>
                        )}
                        
                        {(!user || !lobby.players.includes(user.uid)) && (
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => handleJoin(lobby)}
                              disabled={lobby.playerCount >= lobby.maxPlayers}
                              className={`w-full h-12 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg border-b-4 active:border-b-0 ${
                                lobby.playerCount >= lobby.maxPlayers
                                  ? 'bg-zinc-800 text-zinc-500 border-zinc-900'
                                  : 'bg-white text-black hover:bg-gray-200 border-gray-400'
                              }`}
                            >
                              {lobby.playerCount >= lobby.maxPlayers 
                                ? 'Lobby Full' 
                                : lobby.partyCode ? 'Enter Code to Join' : 'Join Lobby'}
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredLobbies.length === 0 && !loading && (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 size={40} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Lobbies Found</h3>
              <p className="text-gray-500">Try adjusting your search or create a new lobby.</p>
            </div>
          )}
        </div>
      </div>

      {/* Party Code Dialog */}
      <Dialog open={!!joiningLobbyId} onOpenChange={(open) => !open && setJoiningLobbyId(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">ENTER PARTY CODE</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Code</label>
              <Input
                placeholder="ENTER CODE"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                className="bg-white/5 border-white/10 h-12 rounded-xl text-center font-mono text-xl tracking-widest"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && submitCode()}
              />
            </div>
            <Button onClick={submitCode} className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl">
              Join Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={!!settingsLobbyId} onOpenChange={(open) => !open && setSettingsLobbyId(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">Lobby Settings</DialogTitle>
          </DialogHeader>
          {currentSettingsLobby && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Map</label>
                  <select
                    value={currentSettingsLobby.map || 'Haven'}
                    onChange={(e) => handleUpdateSettings(currentSettingsLobby.id, { map: e.target.value })}
                    className="w-full h-12 bg-white/5 border-white/10 rounded-xl px-4 text-sm outline-none focus:ring-2 ring-purple-500/50"
                  >
                    {MAPS.map(m => (
                      <option key={m} value={m} className="bg-zinc-900">{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Variation</label>
                  <select
                    value={currentSettingsLobby.modeVariation || 'Standard'}
                    onChange={(e) => handleUpdateSettings(currentSettingsLobby.id, { modeVariation: e.target.value })}
                    className="w-full h-12 bg-white/5 border-white/10 rounded-xl px-4 text-sm outline-none focus:ring-2 ring-purple-500/50"
                  >
                    {VARIATIONS.map(v => (
                      <option key={v} value={v} className="bg-zinc-900">{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Advanced Settings</label>
                <div className="space-y-2">
                  {[
                    { key: 'cheats', label: 'Allow Cheats' },
                    { key: 'tournamentMode', label: 'Tournament Mode' },
                    { key: 'overtime', label: 'Win by Two (Overtime)' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-sm font-medium">{setting.label}</span>
                      <button
                        onClick={() => handleUpdateSettings(currentSettingsLobby.id, {
                          settings: {
                            ...currentSettingsLobby.settings,
                            [setting.key]: !currentSettingsLobby.settings?.[setting.key as keyof typeof currentSettingsLobby.settings]
                          }
                        })}
                        className={`w-10 h-6 rounded-full transition-all relative ${
                          currentSettingsLobby.settings?.[setting.key as keyof typeof currentSettingsLobby.settings] ? 'bg-purple-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          currentSettingsLobby.settings?.[setting.key as keyof typeof currentSettingsLobby.settings] ? 'left-5' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => setSettingsLobbyId(null)} className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl">
                Close Settings
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
