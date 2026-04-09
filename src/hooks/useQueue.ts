import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, addDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export interface QueueEntry {
  uid: string;
  username: string;
  rank: string;
  mode: string;
  joinedAt: any;
  status: 'waiting' | 'matched';
}

export function useQueue() {
  const { user, profile } = useAuth();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isInQueue, setIsInQueue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'queue'),
      where('status', '==', 'waiting'),
      orderBy('joinedAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc) => doc.data() as QueueEntry);
      setQueue(entries);
      setIsInQueue(entries.some((e) => e.uid === user.uid));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'queue');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const joinQueue = async (mode: string = 'Competitive') => {
    if (!user || !profile) return;
    const path = `queue/${user.uid}`;
    try {
      await setDoc(doc(db, 'queue', user.uid), {
        uid: user.uid,
        username: profile.username,
        rank: profile.rank,
        mode,
        joinedAt: serverTimestamp(),
        status: 'waiting',
      });
      toast.success('Joined the queue!');
    } catch (error) {
      toast.error('Failed to join queue.');
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const leaveQueue = async () => {
    if (!user) return;
    const path = `queue/${user.uid}`;
    try {
      await deleteDoc(doc(db, 'queue', user.uid));
      toast.success('Left the queue.');
    } catch (error) {
      toast.error('Failed to leave queue.');
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return { queue, isInQueue, loading, joinQueue, leaveQueue };
}
