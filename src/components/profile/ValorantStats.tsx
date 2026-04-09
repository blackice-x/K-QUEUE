import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, Target, Trophy, RefreshCw, Loader2, AlertCircle, User, Sword } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { addXP } from '@/services/gamingService';

export default function ValorantStats() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  const syncStats = async () => {
    if (!profile?.riotId) {
      toast.error('Please set your Riot ID in profile settings first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/valorant/stats/${encodeURIComponent(profile.riotId)}`);
      const data = response.data.data;
      setStatsData(data);
      
      // Extract overview stats
      const overview = data.segments.find((s: any) => s.type === 'overview');
      if (overview) {
        const stats = overview.stats;
        const matchesPlayed = stats.matchesPlayed?.value || 0;
        const matchesDiff = matchesPlayed - (profile.matchesPlayed || 0);
        
        const updates = {
          kd: stats.kdRatio?.value || 0,
          hsPercent: stats.headshotPercentage?.value || 0,
          winRate: stats.winPercentage?.value || 0,
          matchesPlayed: matchesPlayed,
          lastUpdated: new Date().toISOString(),
        };
        
        await updateProfile(updates);
        
        // Add XP for matches played since last sync
        if (matchesDiff > 0) {
          const xpEarned = matchesDiff * 20;
          await addXP(profile.uid, xpEarned, 'match_played');
          toast.success(`Stats synced! Earned ${xpEarned} XP for ${matchesDiff} matches.`);
        } else {
          toast.success('Stats synced from Tracker.gg!');
        }
      }
    } catch (error: any) {
      console.error('Sync Error:', error);
      const status = error.response?.status;
      let message = error.response?.data?.error || 'Failed to sync stats.';
      
      if (status === 403) {
        message = "Tracker.gg is currently blocking the sync request (403). This happens when their firewall flags the server's IP. Please try again in a few minutes or visit Tracker.gg directly to index your profile.";
      }

      toast.error(message, {
        description: status === 403 ? 'The Tracker.gg firewall is active. Try again later.' : 'If your profile is new, try searching for yourself on Tracker.gg first to index your account.',
        action: {
          label: 'Go to Tracker.gg',
          onClick: () => window.open(`https://tracker.gg/valorant/profile/riot/${encodeURIComponent(profile.riotId!)}/overview`, '_blank')
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.riotId) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 rounded-[2rem] overflow-hidden">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tight">No Riot ID Set</h3>
          <p className="text-zinc-500 text-sm">Set your Riot ID in the profile menu to track your Valorant stats.</p>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    { label: 'K/D Ratio', value: profile.kd?.toFixed(2) || '0.00', icon: Zap, color: 'text-purple-400' },
    { label: 'HS %', value: `${profile.hsPercent?.toFixed(1) || '0.0'}%`, icon: Target, color: 'text-red-400' },
    { label: 'Win Rate', value: `${profile.winRate?.toFixed(1) || '0.0'}%`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Matches', value: profile.matchesPlayed || '0', icon: Trophy, color: 'text-yellow-400' },
  ];

  const topAgent = statsData?.segments?.find((s: any) => s.type === 'agent');
  const topWeapon = statsData?.segments?.find((s: any) => s.type === 'weapon');

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl rounded-[2rem] overflow-hidden group">
        <CardHeader className="p-8 border-b border-zinc-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Valorant Stats</CardTitle>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
              {profile.riotId} • {profile.lastUpdated ? `Last synced: ${new Date(profile.lastUpdated).toLocaleDateString()}` : 'Never synced'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={syncStats}
            disabled={loading}
            className="rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          </Button>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map((item, idx) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-zinc-500">
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                </div>
                <p className={`text-3xl font-black italic tracking-tighter ${item.color}`}>
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topAgent && (
            <Card className="bg-zinc-900/50 border-zinc-800 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Top Agent</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex items-center gap-6">
                <img 
                  src={topAgent.metadata?.imageUrl} 
                  alt={topAgent.metadata?.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-zinc-800"
                />
                <div>
                  <p className="text-2xl font-black italic uppercase text-white">{topAgent.metadata?.name}</p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                    {topAgent.stats?.matchesPlayed?.displayValue} Matches • {topAgent.stats?.winPercentage?.displayValue} WR
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {topWeapon && (
            <Card className="bg-zinc-900/50 border-zinc-800 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sword className="w-4 h-4 text-red-400" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Top Weapon</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex items-center gap-6">
                <img 
                  src={topWeapon.metadata?.imageUrl} 
                  alt={topWeapon.metadata?.name}
                  className="w-24 h-12 object-contain"
                />
                <div>
                  <p className="text-2xl font-black italic uppercase text-white">{topWeapon.metadata?.name}</p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                    {topWeapon.stats?.kills?.displayValue} Kills • {topWeapon.stats?.headshotPercentage?.displayValue} HS%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
