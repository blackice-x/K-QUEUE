import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export interface Lobby {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  mode: string;
  rankRequired: string;
  maxPlayers: number;
  playerCount: number;
  players: string[]; // Array of user UIDs
  voiceParticipants: string[]; // Array of user UIDs currently in voice
  map?: string;
  modeVariation?: string;
  settings?: {
    cheats?: boolean;
    tournamentMode?: boolean;
    overtime?: boolean;
  };
  partyCode?: string;
  createdAt: any;
}

export function useLobbies() {
  const { user, profile } = useAuth();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'lobbies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lobbyList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lobby));
      setLobbies(lobbyList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'lobbies');
    });
    return () => unsubscribe();
  }, []);

  const createLobby = async (title: string, rankRequired: string, maxPlayers: number, mode: string = 'Competitive', partyCode: string = '') => {
    if (!user || !profile) {
      console.error('Create Lobby failed: No user or profile', { user: !!user, profile: !!profile });
      toast.error('You must be logged in to create a lobby.');
      return;
    }
    const path = 'lobbies';
    try {
      const lobbyRef = doc(collection(db, 'lobbies'));
      const lobbyData = {
        id: lobbyRef.id,
        hostId: user.uid,
        hostName: profile.username,
        title,
        mode,
        rankRequired,
        maxPlayers,
        playerCount: 1,
        players: [user.uid],
        voiceParticipants: [],
        map: 'Haven',
        modeVariation: 'Standard',
        settings: {
          cheats: false,
          tournamentMode: false,
          overtime: true
        },
        partyCode,
        createdAt: serverTimestamp(),
      };
      
      console.log('Attempting to create lobby:', lobbyData);
      await setDoc(lobbyRef, lobbyData);
      toast.success('Lobby created!');
    } catch (error) {
      console.error('Failed to create lobby. Error details:', error);
      toast.error('Failed to create lobby. Please try again.');
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const joinLobby = async (lobbyId: string) => {
    if (!user) return;
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (!lobby) return;

    if (lobby.players.includes(user.uid)) {
      toast.error('You are already in this lobby!');
      return;
    }

    if (lobby.playerCount >= lobby.maxPlayers) {
      toast.error('Lobby is full!');
      return;
    }

    const path = `lobbies/${lobbyId}`;
    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId);
      await updateDoc(lobbyRef, {
        playerCount: increment(1),
        players: [...lobby.players, user.uid]
      });
      toast.success('Joined lobby!');
    } catch (error) {
      toast.error('Failed to join lobby.');
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const leaveLobby = async (lobbyId: string) => {
    if (!user) return;
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (!lobby) return;

    if (!lobby.players.includes(user.uid)) return;

    const path = `lobbies/${lobbyId}`;
    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId);
      const newPlayers = lobby.players.filter(uid => uid !== user.uid);
      const newVoice = (lobby.voiceParticipants || []).filter(uid => uid !== user.uid);
      
      if (newPlayers.length === 0) {
        await deleteDoc(lobbyRef);
      } else {
        await updateDoc(lobbyRef, {
          playerCount: increment(-1),
          players: newPlayers,
          voiceParticipants: newVoice,
          // If host leaves, assign new host
          ...(lobby.hostId === user.uid && { 
            hostId: newPlayers[0],
            hostName: 'New Host' // Ideally fetch the actual name
          })
        });
      }
      toast.success('Left lobby.');
    } catch (error) {
      toast.error('Failed to leave lobby.');
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const toggleVoice = async (lobbyId: string, isJoining: boolean) => {
    if (!user) return;
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (!lobby) return;

    const path = `lobbies/${lobbyId}`;
    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId);
      const currentVoice = lobby.voiceParticipants || [];
      const newVoice = isJoining 
        ? [...currentVoice, user.uid]
        : currentVoice.filter(uid => uid !== user.uid);

      await updateDoc(lobbyRef, {
        voiceParticipants: newVoice
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteLobby = async (lobbyId: string) => {
    if (!user) return;
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (!lobby) return;

    if (lobby.hostId !== user.uid) {
      toast.error('Only the host can delete this lobby!');
      return;
    }

    const path = `lobbies/${lobbyId}`;
    try {
      await deleteDoc(doc(db, 'lobbies', lobbyId));
      toast.success('Lobby deleted!');
    } catch (error) {
      toast.error('Failed to delete lobby.');
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updateLobbySettings = async (lobbyId: string, updates: Partial<Lobby>) => {
    if (!user) return;
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (!lobby) return;

    if (lobby.hostId !== user.uid) {
      toast.error('Only the host can edit settings!');
      return;
    }

    const path = `lobbies/${lobbyId}`;
    try {
      await updateDoc(doc(db, 'lobbies', lobbyId), updates);
      toast.success('Lobby settings updated!');
    } catch (error) {
      toast.error('Failed to update settings.');
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateLobbyTitle = async (lobbyId: string, newTitle: string) => {
    if (!user) return;
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (!lobby) return;

    if (lobby.hostId !== user.uid) {
      toast.error('Only the host can edit this lobby!');
      return;
    }

    const path = `lobbies/${lobbyId}`;
    try {
      await updateDoc(doc(db, 'lobbies', lobbyId), {
        title: newTitle
      });
      toast.success('Lobby title updated!');
    } catch (error) {
      toast.error('Failed to update lobby title.');
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return { lobbies, loading, createLobby, joinLobby, leaveLobby, deleteLobby, updateLobbyTitle, updateLobbySettings, toggleVoice };
}
