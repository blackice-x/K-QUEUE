import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { Mic, MicOff, PhoneOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface VoiceChatProps {
  lobbyId: string;
  participants: string[];
  onToggleVoice: (isJoining: boolean) => void;
}

export default function VoiceChat({ lobbyId, participants, onToggleVoice }: VoiceChatProps) {
  const { user } = useAuth();
  const [peer, setPeer] = useState<Peer | null>(null);
  const [isInVoice, setIsInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCalls, setActiveCalls] = useState<Record<string, any>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudiosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, []);

  const startVoice = async () => {
    if (!user) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Your browser does not support voice chat or it is disabled.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      
      // Use a more unique prefix to avoid collisions on public PeerJS servers
      const peerId = `kqueue-${lobbyId}-${user.uid}`;
      const newPeer = new Peer(peerId);
      
      newPeer.on('open', (id) => {
        console.log('Peer connected with ID:', id);
        setIsInVoice(true);
        onToggleVoice(true);
        
        // Call existing participants
        participants.forEach(pUid => {
          if (pUid !== user.uid) {
            const targetId = `kqueue-${lobbyId}-${pUid}`;
            const call = newPeer.call(targetId, stream);
            handleCall(call, pUid);
          }
        });
      });

      newPeer.on('call', (call) => {
        call.answer(stream);
        const remoteUid = call.peer.split('-').pop() || '';
        handleCall(call, remoteUid);
      });

      newPeer.on('error', (err) => {
        console.error('Peer error:', err);
        if (err.type === 'unavailable-id') {
          toast.error('Voice ID already in use. Try again.');
        } else {
          toast.error('Voice chat connection failed.');
        }
        stopVoice();
      });

      setPeer(newPeer);
    } catch (err) {
      console.error('Failed to get media:', err);
      toast.error('Microphone access denied. Please check browser permissions.');
    }
  };

  const handleCall = (call: any, remoteUid: string) => {
    call.on('stream', (remoteStream: MediaStream) => {
      if (!remoteAudiosRef.current) return;
      
      // Check if audio already exists
      let audio = document.getElementById(`audio-${remoteUid}`) as HTMLAudioElement;
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = `audio-${remoteUid}`;
        audio.autoplay = true;
        remoteAudiosRef.current.appendChild(audio);
      }
      audio.srcObject = remoteStream;
    });

    call.on('close', () => {
      const audio = document.getElementById(`audio-${remoteUid}`);
      if (audio) audio.remove();
    });

    setActiveCalls(prev => ({ ...prev, [remoteUid]: call }));
  };

  const stopVoice = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    setIsInVoice(false);
    onToggleVoice(false);
    setActiveCalls({});
    if (remoteAudiosRef.current) {
      remoteAudiosRef.current.innerHTML = '';
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isInVoice ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Voice Chat</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
          <Users size={12} />
          <span>{participants.length} in voice</span>
        </div>
      </div>

      <div className="flex gap-2">
        {!isInVoice ? (
          <Button 
            onClick={startVoice}
            className="flex-1 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs gap-2"
          >
            <Mic size={16} />
            Join Voice
          </Button>
        ) : (
          <>
            <Button 
              onClick={toggleMute}
              variant="outline"
              className={`flex-1 h-10 rounded-xl font-bold text-xs gap-2 border-white/10 ${isMuted ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-white'}`}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button 
              onClick={stopVoice}
              variant="destructive"
              className="h-10 w-10 rounded-xl p-0"
            >
              <PhoneOff size={16} />
            </Button>
          </>
        )}
      </div>

      <div ref={remoteAudiosRef} className="hidden" />
    </div>
  );
}
