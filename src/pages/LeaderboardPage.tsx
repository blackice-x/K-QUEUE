import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { getLeaderboard, DIVISIONS, getDivision } from '@/services/gamingService';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Flame, Target, Shield, Zap, TrendingUp, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 italic">GLOBAL LEADERBOARD</h1>
            <p className="text-gray-400">The elite agents of K-QUEUE. Earn XP to climb the ranks.</p>
          </div>
          
          {profile && (
            <Card className="bg-purple-600/10 border-purple-500/20 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1">Your Rank</p>
                  <p className="text-2xl font-black text-white">#{profile.rankPosition || '?'}</p>
                </div>
                <div className="h-10 w-px bg-purple-500/20" />
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1">Division</p>
                  <Badge className="bg-purple-600 text-white border-none">{profile.division || 'Ensign'}</Badge>
                </div>
                <div className="h-10 w-px bg-purple-500/20" />
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1">Total XP</p>
                  <p className="text-2xl font-black text-white">{profile.xp || 0}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top 3 Spotlight */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {leaderboard.slice(0, 3).map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative overflow-hidden border-2 h-full ${
                  i === 0 ? 'bg-yellow-500/5 border-yellow-500/30' : 
                  i === 1 ? 'bg-gray-400/5 border-gray-400/30' : 
                  'bg-amber-600/5 border-amber-600/30'
                } rounded-3xl backdrop-blur-md`}>
                  <div className="absolute top-0 right-0 p-4">
                    {getRankIcon(i + 1)}
                  </div>
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`absolute -inset-1 rounded-full blur-md opacity-50 ${
                        i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`} />
                      <Avatar className="h-24 w-24 border-4 border-black relative">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback className="bg-zinc-800 text-2xl font-bold text-white">
                          {player.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1">{player.username}</h3>
                    <p className="text-purple-400 font-mono text-sm mb-4">{player.tag}</p>
                    <div className="flex items-center gap-2 mb-6">
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-white px-3 py-1 rounded-full">
                        {player.division}
                      </Badge>
                      <Badge className="bg-purple-600 text-white px-3 py-1 rounded-full">
                        {player.xp} XP
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">K/D</p>
                        <p className="text-lg font-bold text-white">{player.kd?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Streak</p>
                        <div className="flex items-center justify-center gap-1">
                          <Flame size={14} className="text-orange-500" />
                          <p className="text-lg font-bold text-white">{player.streak || 0}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Leaderboard Table */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black italic tracking-tight">RANKINGS</CardTitle>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>Agent</span>
                    <span className="w-24 text-right">Division</span>
                    <span className="w-24 text-right">XP</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {leaderboard.slice(3).map((player, i) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between p-4 hover:bg-white/5 transition-all group ${
                        profile?.uid === player.id ? 'bg-purple-600/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center">
                          <span className="text-sm font-bold text-gray-500">#{player.rank}</span>
                        </div>
                        <Avatar className="h-10 w-10 border border-white/10">
                          <AvatarImage src={player.avatar} />
                          <AvatarFallback className="bg-zinc-800 text-xs font-bold text-white">
                            {player.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                            {player.username}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono">{player.tag}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="w-24 text-right">
                          <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] text-gray-400">
                            {player.division}
                          </Badge>
                        </div>
                        <div className="w-24 text-right">
                          <span className="text-sm font-black text-white">{player.xp}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Stats & Info */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-400" />
                  DIVISION SYSTEM
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {DIVISIONS.map((div) => (
                  <div key={div.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: div.color }} />
                      <span className="text-sm font-bold text-white">{div.name}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-500">{div.minXP}+ XP</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2 text-white">
                  <Zap size={20} className="text-yellow-400" />
                  XP BONUSES
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Flame size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Daily Streak</p>
                    <p className="text-xs text-gray-400">Login daily for bonus XP. 7 days = 300 XP bonus!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Target size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Challenges</p>
                    <p className="text-xs text-gray-400">Complete daily and weekly missions for massive rewards.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Shield size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Inventory Boosts</p>
                    <p className="text-xs text-gray-400">Use XP Boosts to double your earnings for 24 hours.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
