import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, Users, Trophy, Search, LogOut, Menu, ChevronDown, Shield, UserCircle, Edit3, LifeBuoy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, logout, updateRank, updateRiotId } = useAuth();
  const location = useLocation();
  const [isRiotIdOpen, setIsRiotIdOpen] = useState(false);
  const [newRiotId, setNewRiotId] = useState(profile?.riotId || '');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Queue', path: '/queue', icon: Search },
    { name: 'Lobbies', path: '/lobbies', icon: Users },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Ecosystem', path: '/ecosystem', icon: Zap },
    { name: 'Teams', path: '/teams', icon: Shield },
    { name: 'Support', path: '/support', icon: LifeBuoy },
  ];

  const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'];

  const handleRankUpdate = async (rank: string) => {
    try {
      await updateRank(rank);
      toast.success(`Rank updated to ${rank}`);
    } catch (error) {
      toast.error('Failed to update rank');
    }
  };

  const handleRiotIdUpdate = async () => {
    if (!newRiotId.includes('#')) {
      toast.error('Format must be NAME#TAG (e.g., AUSTIN#ZUEX)');
      return;
    }
    try {
      await updateRiotId(newRiotId);
      toast.success('Riot ID updated!');
      setIsRiotIdOpen(false);
    } catch (error) {
      toast.error('Failed to update Riot ID');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img 
                  src="https://i.ibb.co/5h6yk4NF/Futuristic-esports-K-QUEUE-logo-design.png" 
                  alt="K-QUEUE Logo" 
                  className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">K-QUEUE</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === item.path
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={16} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{profile?.username}</p>
                  <p className="text-[10px] text-purple-400 font-mono uppercase tracking-wider">
                    {profile?.riotId || profile?.rank}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none">
                      <Avatar className="h-8 w-8 border border-white/20 hover:border-purple-500 transition-colors">
                        <AvatarImage src={profile?.avatar} />
                        <AvatarFallback className="bg-purple-900 text-white text-xs">
                          {profile?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-white/10 text-white w-72 rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2">
                    <div className="px-4 py-6 border-b border-white/5 mb-4 bg-white/5 rounded-[1.5rem]">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-12 w-12 border-2 border-purple-500">
                          <AvatarImage src={profile?.avatar} />
                          <AvatarFallback className="bg-purple-900 text-white">
                            {profile?.username?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-lg font-black text-white leading-none mb-1">{profile?.username}</p>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Level 1 Agent</p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">In-Game ID</p>
                      <p className="text-base font-black text-purple-400 font-mono tracking-tighter">
                        {profile?.riotId || 'NOT SET'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Dialog open={isRiotIdOpen} onOpenChange={setIsRiotIdOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl cursor-pointer flex items-center gap-3 py-3 px-4 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                            <Edit3 size={18} className="text-purple-400" />
                            Update Riot ID
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-3xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight">UPDATE RIOT ID</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Riot ID (NAME#TAG)</label>
                              <Input
                                placeholder="e.g., AUSTIN#ZUEX"
                                value={newRiotId}
                                onChange={(e) => setNewRiotId(e.target.value.toUpperCase())}
                                className="bg-white/5 border-white/10 h-12 rounded-xl font-mono"
                              />
                            </div>
                            <Button onClick={handleRiotIdUpdate} className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl">
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenuSeparator className="bg-white/5 my-2" />
                      
                      <DropdownMenuLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2">Select Rank</DropdownMenuLabel>
                      <div className="grid grid-cols-2 gap-2 p-2">
                        {ranks.map((r) => (
                          <DropdownMenuItem
                            key={r}
                            onClick={() => handleRankUpdate(r)}
                            className={`text-[10px] font-black uppercase tracking-tighter rounded-xl cursor-pointer py-2 px-3 transition-all text-center justify-center ${
                              profile?.rank === r 
                                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                                : 'hover:bg-white/5 text-gray-400 hover:text-white border border-white/5'
                            }`}
                          >
                            {r}
                          </DropdownMenuItem>
                        ))}
                      </div>
                      
                      <DropdownMenuSeparator className="bg-white/5 my-2" />
                      
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-red-400 hover:bg-red-400/10 hover:text-red-400 rounded-xl cursor-pointer font-bold flex items-center gap-3 py-3 px-4 transition-all"
                      >
                        <LogOut size={18} />
                        Logout
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
