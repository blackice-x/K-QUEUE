import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { useQueue } from '@/hooks/useQueue';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2, Users, Clock, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function QueuePage() {
  const { profile } = useAuth();
  const { queue, isInQueue, joinQueue, leaveQueue } = useQueue();
  const [timer, setTimer] = useState(0);
  const [selectedMode, setSelectedMode] = useState('Competitive');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await joinQueue(selectedMode);
    } finally {
      setIsJoining(false);
    }
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/10 border border-purple-500/20 mb-6"
          >
            <Search size={16} className="text-purple-400" />
            <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Matchmaking System</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            FIND YOUR NEXT MATCH
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Join the queue to be matched with players of similar skill levels. 
            Balanced teams, competitive maps, and real-time updates.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Queue Action Card */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-purple-500/20">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {isInQueue ? (
                  <motion.div
                    key="in-queue"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-purple-500/20 flex items-center justify-center relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-4 border-t-purple-500 rounded-full"
                        />
                        <div className="text-3xl font-black font-mono text-white">
                          {formatTime(timer)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Searching for Match...</h2>
                      <p className="text-gray-400">Estimated wait time: 1:30</p>
                    </div>

                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={leaveQueue}
                      className="h-14 px-12 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                    >
                      Leave Queue
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="not-in-queue"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="w-24 h-24 rounded-3xl bg-purple-600/20 flex items-center justify-center mx-auto">
                      <Search size={48} className="text-purple-400" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Ready to Play?</h2>
                      <p className="text-gray-400 mb-6">You will be matched based on your {profile?.rank} rank.</p>
                      
                      <div className="flex items-center justify-center gap-4 mb-8">
                        {['Competitive', 'Custom'].map((m) => (
                          <button
                            key={m}
                            onClick={() => setSelectedMode(m)}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                              selectedMode === m
                                ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleJoin}
                      disabled={isJoining}
                      className="h-16 px-16 bg-white text-black hover:bg-gray-200 rounded-full font-black text-xl shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isJoining ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="animate-spin" />
                          JOINING...
                        </div>
                      ) : (
                        'JOIN QUEUE'
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Live Queue List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-purple-400" />
                Live Queue ({queue.length})
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Real-time
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {queue.map((entry, i) => (
                  <motion.div
                    key={entry.uid}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4"
                  >
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarFallback className="bg-purple-900 text-white text-xs">
                        {entry.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{entry.username}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest">{entry.rank}</p>
                        <span className="text-[10px] text-gray-600">•</span>
                        <p className="text-[10px] text-pink-400 font-mono uppercase tracking-widest">{entry.mode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Clock size={12} className="text-gray-500 ml-auto mb-1" />
                      <p className="text-[10px] text-gray-500 font-mono">WAITING</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {queue.length === 0 && (
                <div className="col-span-full p-12 text-center rounded-3xl border-2 border-dashed border-white/5">
                  <p className="text-gray-500 font-medium italic">Queue is currently empty. Be the first to join!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
