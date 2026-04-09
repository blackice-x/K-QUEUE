import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Search, Trophy, Users, ShieldCheck, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const { login } = useAuth();

  const scrollToLearnMore = () => {
    document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black flex flex-col items-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[128px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <img 
              src="https://i.ibb.co/5h6yk4NF/Futuristic-esports-K-QUEUE-logo-design.png" 
              alt="K-QUEUE Logo" 
              className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
            <ShieldCheck size={14} className="text-purple-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Kerala's Premier Valorant Platform</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            ENTER THE QUEUE.<br />RULE KERALA.
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-6 max-w-2xl mx-auto leading-relaxed">
            The ultimate matchmaking experience for Kerala's Valorant community. 
            Real-time queues, custom lobbies, and competitive rankings.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <p className="text-purple-400 font-black italic text-xl md:text-2xl tracking-tight">
              "അടിച്ച് കേറി വാ മക്കളെ, ഇത് നമ്മുടെ കളിയാണ്!"
            </p>
            <p className="text-gray-600 text-xs uppercase tracking-[0.2em] mt-2">
              Rule the server. Rule the state.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={login}
              className="h-14 px-8 text-lg font-bold bg-white text-black hover:bg-gray-200 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToLearnMore}
              className="h-14 px-8 text-lg font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 relative z-10 max-w-6xl w-full">
          {[
            { icon: Search, title: 'Smart Queue', desc: 'Advanced matchmaking based on rank and performance.' },
            { icon: Users, title: 'Custom Lobbies', desc: 'Create and join custom games with specific rank requirements.' },
            { icon: Trophy, title: 'Leaderboards', desc: 'Climb the ranks and prove you are the best in Kerala.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learn More Section */}
      <section id="learn-more" className="py-32 w-full max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black tracking-tighter text-white mb-8 italic">WHY K-QUEUE?</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                  <ShieldCheck className="text-purple-400" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Anti-Toxic Community</h4>
                  <p className="text-gray-400">We maintain a strict code of conduct to ensure a healthy gaming environment for everyone in Kerala.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                  <Trophy className="text-purple-400" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Regional Tournaments</h4>
                  <p className="text-gray-400">Exclusive access to Kerala-only tournaments with massive prize pools and local recognition.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                  <Users className="text-purple-400" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Verified Players</h4>
                  <p className="text-gray-400">Every player is verified with their Riot ID to prevent smurfing and ensure fair matches.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full" />
            <div className="relative p-8 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <img 
                src="https://picsum.photos/seed/valorant/800/600" 
                alt="Valorant Gameplay" 
                className="rounded-2xl w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="mt-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Active Players</p>
                  <p className="text-3xl font-black text-white">2,500+</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Matches Today</p>
                  <p className="text-3xl font-black text-purple-400">450+</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 w-full text-center space-y-4">
        <div className="flex items-center justify-center gap-6">
          <Link to="/support" className="text-gray-500 hover:text-purple-400 transition-colors text-sm font-medium flex items-center gap-2">
            <LifeBuoy size={14} />
            Support Center
          </Link>
          <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Terms of Service</a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Privacy Policy</a>
        </div>
        <p className="text-gray-600 text-xs uppercase tracking-widest">© 2026 K-QUEUE. All rights reserved. Built for Kerala.</p>
      </footer>
    </div>
  );
}
