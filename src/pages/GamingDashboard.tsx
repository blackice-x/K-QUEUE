import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { getChallenges, checkDailyStreak, DIVISIONS, useInventoryItem, claimReward } from '@/services/gamingService';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Gift, 
  Package, 
  Flame, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  Sparkles,
  Crown,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function GamingDashboard() {
  const { profile, user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'challenges' | 'rewards' | 'inventory'>('challenges');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (user) {
        await checkDailyStreak(user.uid);
        const challengeData = await getChallenges();
        setChallenges(challengeData);
      }
      setLoading(false);
    };
    init();
  }, [user]);

  const rewards = [
    { 
      id: 'nitro', 
      name: 'Discord Nitro', 
      description: '1 Month Subscription', 
      cost: 5000, 
      image: "https://i.ibb.co/yBQ0rpgq/images-1.jpg",
      stock: 5 
    },
    { 
      id: 'netflix', 
      name: 'Netflix Gift Card', 
      description: '$15 Credit', 
      cost: 8000, 
      image: "https://i.ibb.co/fd48JCx9/Brand-Assets-Logos-02-NSymbol.jpg",
      stock: 2 
    },
    { 
      id: 'valorant', 
      name: '1000 VP', 
      description: 'Valorant Points', 
      cost: 4500, 
      image: "https://i.ibb.co/n80cWhTM/images-1.png",
      stock: 10 
    },
    { 
      id: 'spotify', 
      name: 'Spotify Premium', 
      description: '1 Month Subscription', 
      cost: 3000, 
      image: "https://i.ibb.co/BHDbHpJR/images.png",
      stock: 8 
    },
  ];

  const inventoryItems = profile?.inventory || [];

  const handleUseItem = async (itemName: string) => {
    if (!user) return;
    setActionLoading(itemName);
    try {
      const updates = await useInventoryItem(user.uid, itemName);
      await updateProfile(updates);
      toast.success(`${itemName} activated!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to use item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimReward = async (reward: any) => {
    if (!user) return;
    setActionLoading(reward.id);
    try {
      await claimReward(user.uid, reward);
      await updateProfile({ xp: (profile?.xp || 0) - reward.cost });
      toast.success(`${reward.name} claimed! Check your email for details.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim reward');
    } finally {
      setActionLoading(null);
    }
  };

  const isBoostActive = profile?.boostActiveUntil && new Date(profile.boostActiveUntil) > new Date();
  const isShieldActive = profile?.shieldActiveUntil && new Date(profile.shieldActiveUntil) > new Date();

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto py-12">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <Card className="lg:col-span-2 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={120} />
            </div>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-600 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  <Trophy className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white italic tracking-tight">AGENT PROGRESS</h2>
                  <p className="text-purple-400 text-sm font-bold uppercase tracking-widest">{profile?.division || 'Ensign'} Division</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">XP Progress</span>
                  <span className="text-white">{profile?.xp || 0} / 5000 XP</span>
                </div>
                <Progress value={((profile?.xp || 0) / 5000) * 100} className="h-3 bg-white/5" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Current Streak</p>
                  <div className="flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} />
                    <span className="text-xl font-black text-white">{profile?.streak || 0} Days</span>
                  </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Global Rank</p>
                  <div className="flex items-center gap-2">
                    <Crown className="text-yellow-400" size={20} />
                    <span className="text-xl font-black text-white">#{profile?.rankPosition || '---'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
                <Clock size={20} className="text-blue-400" />
                DAILY BONUS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="text-blue-400" size={32} />
              </div>
              <p className="text-sm font-bold text-white mb-1">Next Reward in 14h</p>
              <p className="text-xs text-gray-500 mb-6">Login tomorrow for +50 XP</p>
              <Button disabled className="w-full rounded-xl bg-zinc-800 text-zinc-500">Claimed Today</Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
                <Shield size={20} className="text-green-400" />
                ACTIVE BOOSTS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center py-6">
              <div className={`w-16 h-16 ${isBoostActive ? 'bg-yellow-500/20' : 'bg-green-500/10'} rounded-full flex items-center justify-center mb-4`}>
                <TrendingUp className={isBoostActive ? 'text-yellow-400' : 'text-green-400'} size={32} />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {isBoostActive ? 'XP Boost Active!' : 'No Active Boosts'}
              </p>
              <p className="text-xs text-gray-500 mb-6">
                {isBoostActive ? `Expires: ${new Date(profile.boostActiveUntil).toLocaleTimeString()}` : 'Activate from inventory'}
              </p>
              <Button variant="outline" onClick={() => setActiveTab('inventory')} className="w-full rounded-xl border-white/10 hover:bg-white/5">
                {isBoostActive ? 'Manage Boosts' : 'View Inventory'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mb-8 bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
          {[
            { id: 'challenges', label: 'Challenges', icon: <Target size={18} /> },
            { id: 'rewards', label: 'Rewards', icon: <Gift size={18} /> },
            { id: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'challenges' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.length > 0 ? challenges.map((challenge) => (
                  <Card key={challenge.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-3xl overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={challenge.type === 'daily' ? 'bg-blue-600' : 'bg-purple-600'}>
                          {challenge.type.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-500 font-black text-xs">
                          <Zap size={12} />
                          +{challenge.xpReward} XP
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-white mb-2 italic">{challenge.title}</h3>
                      <p className="text-gray-400 text-sm mb-6">{challenge.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-white">0 / {challenge.goal}</span>
                        </div>
                        <Progress value={0} className="h-2 bg-white/5" />
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  // Mock challenges if none in DB
                  [
                    { title: 'Match Warrior', desc: 'Play 5 matches in any mode', reward: 100, goal: 5, type: 'daily' },
                    { title: 'Headshot Master', desc: 'Get 20 headshots', reward: 250, goal: 20, type: 'weekly' },
                    { title: 'Win Streak', desc: 'Win 3 matches in a row', reward: 500, goal: 3, type: 'weekly' },
                  ].map((c, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-3xl overflow-hidden group">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge className={c.type === 'daily' ? 'bg-blue-600' : 'bg-purple-600'}>
                            {c.type.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-500 font-black text-xs">
                            <Zap size={12} />
                            +{c.reward} XP
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 italic">{c.title}</h3>
                        <p className="text-gray-400 text-sm mb-6">{c.desc}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-white">0 / {c.goal}</span>
                          </div>
                          <Progress value={0} className="h-2 bg-white/5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-3xl overflow-hidden flex flex-col group">
                    <div className="h-40 bg-white/5 flex items-center justify-center overflow-hidden">
                      <img 
                        src={reward.image} 
                        alt={reward.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-black text-white mb-1">{reward.name}</h3>
                      <p className="text-gray-500 text-xs mb-4">{reward.description}</p>
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-purple-400 font-black text-sm">{reward.cost} XP</div>
                        <div className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{reward.stock} Left</div>
                      </div>
                      <Button 
                        disabled={(profile?.xp || 0) < reward.cost || actionLoading === reward.id}
                        onClick={() => handleClaimReward(reward)}
                        className="w-full mt-auto rounded-xl bg-purple-600 hover:bg-purple-700 font-bold"
                      >
                        {actionLoading === reward.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (profile?.xp || 0) < reward.cost ? (
                          'Insufficient XP'
                        ) : (
                          'Claim Reward'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventoryItems.length > 0 ? inventoryItems.map((item, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-3xl overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          {item.itemName.includes('Boost') ? <Zap size={24} className="text-yellow-400" /> : <Shield size={24} className="text-blue-400" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{item.itemName}</h3>
                          <p className="text-gray-500 text-xs">
                            {item.itemName.includes('Boost') ? 'Double XP for 24 hours' : 'Protects your streak for 1 day'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Quantity</span>
                          <Badge variant="outline" className="bg-white/5 border-white/10 text-white">{item.quantity}</Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          disabled={actionLoading === item.itemName}
                          onClick={() => handleUseItem(item.itemName)}
                          className="rounded-xl border-white/10 hover:bg-white/5 text-xs font-bold h-9"
                        >
                          {actionLoading === item.itemName ? <Loader2 className="animate-spin" size={14} /> : 'Use Item'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-full py-24 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Inventory Empty</h3>
                    <p className="text-gray-500">Earn rewards and claim items to see them here.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
