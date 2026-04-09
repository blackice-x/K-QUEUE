import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

interface UserProfile {
  uid: string;
  username: string;
  tag?: string;
  avatar: string;
  rank: string;
  riotId?: string;
  age?: number;
  kd: number;
  hsPercent?: number;
  winRate?: number;
  matchesPlayed?: number;
  points: number;
  xp: number;
  division: string;
  streak: number;
  lastActiveDate?: string;
  rankPosition?: number;
  inventory: { itemName: string; quantity: number }[];
  boostActiveUntil?: any;
  shieldActiveUntil?: any;
  lastUpdated?: any;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateRank: (newRank: string) => Promise<void>;
  updateRiotId: (newRiotId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const path = `users/${user.uid}`;
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            // Create default profile
            const newProfile: UserProfile = {
              uid: user.uid,
              username: user.displayName || 'Agent',
              tag: `#${Math.floor(1000 + Math.random() * 9000)}`,
              avatar: user.photoURL || '',
              rank: 'Iron',
              riotId: '',
              age: 0,
              kd: 0,
              points: 0,
              xp: 0,
              division: 'Ensign',
              streak: 0,
              inventory: [],
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        toast.error('Domain Not Authorized', {
          description: `Please add "${domain}" to the Authorized Domains in your Firebase Console (Authentication > Settings).`,
          duration: 10000,
        });
      } else {
        toast.error(error.message || 'Failed to login');
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateRank = async (newRank: string) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), { rank: newRank }, { merge: true });
      setProfile(prev => prev ? { ...prev, rank: newRank } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateRiotId = async (newRiotId: string) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), { riotId: newRiotId }, { merge: true });
      setProfile(prev => prev ? { ...prev, riotId: newRiotId } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateRank, updateRiotId, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
