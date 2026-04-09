import { motion } from 'motion/react';
import Navbar from '@/components/layout/Navbar';
import { Shield, Zap, Users, Trophy } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto py-24 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full animate-pulse" />
          <div className="relative w-32 h-32 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center">
            <Shield size={64} className="text-purple-400" />
          </div>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(219,39,119,0.5)]"
          >
            <Zap size={24} className="text-white" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 italic"
        >
          TEAMS FEATURE<br />
          <span className="text-purple-500">COMING SOON</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-xl max-w-2xl mx-auto mb-12"
        >
          We're building a professional team management system. Create your squad, recruit players, and dominate the Kerala Valorant scene together.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {[
            { icon: Users, title: 'Squad Building', desc: 'Create your own team and invite players.' },
            { icon: Trophy, title: 'Team Rankings', desc: 'Climb the team leaderboards together.' },
            { icon: Zap, title: 'Scrim Finder', desc: 'Find other teams to practice against.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <item.icon size={24} className="text-purple-400 mb-4 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
