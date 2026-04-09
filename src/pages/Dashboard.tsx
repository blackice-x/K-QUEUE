import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { useQueue } from '@/hooks/useQueue';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Search, History, TrendingUp, Zap, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card as UICard, CardContent as UICardContent, CardHeader as UICardHeader, CardTitle as UICardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ValorantStats from '@/components/profile/ValorantStats';

export default function Dashboard() {
  const { profile, updateProfile } = useAuth();
  const { isInQueue } = useQueue();
  const [timer, setTimer] = useState(0);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  // Onboarding form state
  const [riotId, setRiotId] = useState('');
  const [age, setAge] = useState('');
  const [rank, setRank] = useState('Iron');

  useEffect(() => {
    if (profile && (!profile.riotId || !profile.age)) {
      setIsOnboardingOpen(true);
      setRiotId(profile.riotId || '');
      setAge(profile.age?.toString() || '');
      setRank(profile.rank || 'Iron');
    }
  }, [profile]);

  useEffect(() => {
    let interval: any;
    if (isInQueue) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isInQueue]);

  const handleOnboardingSubmit = async () => {
    if (!riotId.includes('#')) {
      toast.error('Format must be NAME#TAG (e.g., AUSTIN#ZUEX)');
      return;
    }
    if (!age || parseInt(age) < 13) {
      toast.error('Please enter a valid age (13+)');
      return;
    }
    try {
      await updateProfile({
        riotId: riotId.toUpperCase(),
        age: parseInt(age),
        rank: rank
      });
      toast.success('Profile updated! Welcome to K-QUEUE.');
      setIsOnboardingOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = [
    { label: 'Total XP', value: profile?.xp || 0, icon: Zap, color: 'text-yellow-400' },
    { label: 'K/D Ratio', value: profile?.kd?.toFixed(2) || '0.00', icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Division', value: profile?.division || 'Ensign', icon: Trophy, color: 'text-purple-400' },
  ];

  const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'];

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-12">
        {/* Onboarding Dialog */}
        <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
          <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-center">COMPLETE YOUR PROFILE</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">In-Game Riot ID (NAME#TAG)</label>
                <Input
                  placeholder="e.g., AUSTIN#ZUEX"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 h-12 rounded-xl font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Age</label>
                <Input
                  type="number"
                  placeholder="e.g., 18"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Rank</label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full h-12 bg-white/5 border-white/10 rounded-xl px-4 text-sm outline-none focus:ring-2 ring-purple-500/50"
                >
                  {ranks.map(r => (
                    <option key={r} value={r} className="bg-zinc-900">{r}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleOnboardingSubmit} className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                Start Playing
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-[2rem] bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-white/10 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              WELCOME BACK, {profile?.username?.toUpperCase()}
            </h1>
            <p className="text-purple-400 font-black italic text-lg md:text-xl tracking-tight">
              "ഒരു ടാപ്പിൽ തീർക്കാം, നമ്മളാരാ മോൻ!"
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={120} />
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-80 shrink-0"
          >
            <UICard className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden rounded-3xl">
              <div className="h-24 bg-gradient-to-r from-purple-600 to-pink-600 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="w-20 h-20 rounded-2xl bg-black border-4 border-black overflow-hidden shadow-2xl">
                    <img src={profile?.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
              <UICardContent className="pt-14 pb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">{profile?.username}</h2>
                <p className="text-purple-400 font-mono text-sm uppercase tracking-widest mb-6">
                  {profile?.riotId || profile?.rank}
                </p>
                
                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={i} 
                      className="text-center"
                      whileHover={{ scale: 1.1, y: -2 }}
                    >
                      <stat.icon size={16} className={`${stat.color} mx-auto mb-2`} />
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-medium">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </UICardContent>
            </UICard>

            <div className="mt-6 flex flex-col gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/queue">
                  <Button className={`w-full h-12 rounded-2xl font-bold gap-2 group transition-all ${
                    isInQueue 
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}>
                    {isInQueue ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        In Queue: {formatTime(timer)}
                      </>
                    ) : (
                      <>
                        <Search size={18} className="group-hover:scale-110 transition-transform" />
                        Join Queue
                      </>
                    )}
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/lobbies">
                  <Button variant="outline" className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold gap-2">
                    <Users size={18} />
                    Find Lobbies
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 w-full space-y-8">
            <ValorantStats />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <History className="text-purple-400" />
                  Recent Matches
                </h3>
              </div>
              
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-[2rem] border-dashed">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4"
                >
                  <Zap className="text-purple-400" size={32} />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-2">MATCH HISTORY COMING SOON</h4>
                <p className="text-gray-500 text-center max-w-xs">
                  We're building a powerful match tracking system. Stay tuned!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
