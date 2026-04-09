import { useState, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, SkipBack, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const TRACKS = [
  { id: "0meKaCIRBKA", title: "Song 1", thumbnail: "https://i.ytimg.com/vi/0meKaCIRBKA/hqdefault.jpg" },
  { id: "wann-ENL_Xw", title: "Song 2", thumbnail: "https://i.ytimg.com/vi/wann-ENL_Xw/hqdefault.jpg" },
  { id: "BXc4HIHIWos", title: "Song 3", thumbnail: "https://i.ytimg.com/vi/BXc4HIHIWos/hqdefault.jpg" },
  { id: "lHrDDuFjhDY", title: "Song 4", thumbnail: "https://i.ytimg.com/vi/lHrDDuFjhDY/hqdefault.jpg" },
  { id: "5KTDN4keQmU", title: "Default Chill", thumbnail: "https://i.ytimg.com/vi/5KTDN4keQmU/hqdefault.jpg" }
];

export default function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const currentTrack = TRACKS[currentTrackIndex];
  
  const toggleSound = () => {
    setIsMuted(!isMuted);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  return (
    <>
      {/* Hidden YouTube Iframe */}
      <iframe
        id="yt-bg-music"
        src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${currentTrack.id}&controls=0&showinfo=0&modestbranding=1`}
        allow="autoplay"
        className="fixed top-0 left-0 w-0 h-0 pointer-events-none border-none"
        title="Background Music"
      />

      {/* Floating Music Control */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl w-64"
            >
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={currentTrack.thumbnail} 
                  alt={currentTrack.title}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10"
                />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Now Playing</p>
                  <p className="text-sm font-black text-white truncate italic uppercase">{currentTrack.title}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={prevTrack}
                  className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  <SkipBack size={20} />
                </Button>
                <Button 
                  onClick={toggleSound}
                  className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                    isMuted ? 'bg-zinc-800 text-gray-400' : 'bg-purple-600 text-white'
                  }`}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={nextTrack}
                  className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  <SkipForward size={20} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setShowControls(!showControls)}
          className={`h-12 px-6 rounded-2xl font-bold gap-3 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] border-2 ${
            showControls 
              ? 'bg-purple-600 border-purple-400 text-white' 
              : 'bg-zinc-900 border-white/10 text-gray-400 hover:text-white hover:border-purple-500/50'
          }`}
        >
          <Music2 size={20} className={!isMuted ? "animate-spin-slow" : ""} />
          <span>{showControls ? "Close Player" : "Music Player"}</span>
        </Button>
      </div>
    </>
  );
}
