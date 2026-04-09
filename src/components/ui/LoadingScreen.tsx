import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-8">
          <motion.img
            src="https://i.ibb.co/5h6yk4NF/Futuristic-esports-K-QUEUE-logo-design.png"
            alt="K-QUEUE Logo"
            className="w-32 h-32 object-contain"
            animate={{ 
              filter: ["drop-shadow(0 0 0px rgba(168,85,247,0))", "drop-shadow(0 0 20px rgba(168,85,247,0.5))", "drop-shadow(0 0 0px rgba(168,85,247,0))"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            referrerPolicy="no-referrer"
          />
          
          {/* Loading Bar */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-purple-400 font-mono text-xs uppercase tracking-[0.3em] mt-4"
        >
          Initializing System...
        </motion.p>
      </motion.div>
      
      {/* Decorative Lines */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
    </div>
  );
}
