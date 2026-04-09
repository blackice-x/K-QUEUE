import { db } from '../lib/firebase';
import { 
  doc, 
  updateDoc, 
  increment, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  setDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export const DIVISIONS = [
  { name: "Ensign", minXP: 0, color: "#94a3b8" },
  { name: "Ranger", minXP: 500, color: "#22c55e" },
  { name: "Hero", minXP: 1200, color: "#a855f7" },
  { name: "Legend", minXP: 2000, color: "#eab308" }
];

export function getDivision(xp: number) {
  return [...DIVISIONS].reverse().find(div => xp >= div.minXP) || DIVISIONS[0];
}

export async function addXP(userId: string, amount: number, reason: string) {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    
    const userData = userSnap.data();
    const newXP = (userData.xp || 0) + amount;
    const newDivision = getDivision(newXP).name;
    
    await updateDoc(userRef, {
      xp: increment(amount),
      division: newDivision,
      lastUpdated: serverTimestamp()
    });
    
    // Log XP
    await addDoc(collection(db, 'xp_logs'), {
      userId,
      xpEarned: amount,
      reason,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function checkDailyStreak(userId: string) {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    
    const userData = userSnap.data();
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userData.lastActiveDate;
    
    if (lastActive === today) return; // Already checked today
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    let bonusXP = 25; // Base daily login XP
    
    if (lastActive === yesterdayStr) {
      newStreak = (userData.streak || 0) + 1;
      
      // Bonus XP milestones
      if (newStreak === 3) bonusXP += 100;
      if (newStreak === 7) bonusXP += 300;
    }
    
    await updateDoc(userRef, {
      streak: newStreak,
      lastActiveDate: today
    });
    
    await addXP(userId, bonusXP, 'daily');
    
    return { streak: newStreak, xpEarned: bonusXP };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getLeaderboard() {
  const path = 'users';
  try {
    const q = query(
      collection(db, 'users'), 
      orderBy('xp', 'desc'), 
      limit(30)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getChallenges() {
  const path = 'challenges';
  try {
    const q = query(collection(db, 'challenges'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateChallengeProgress(userId: string, metric: string, value: number) {
  try {
    // Find active challenges for this metric
    const q = query(collection(db, 'challenges'), where('metric', '==', metric));
    const challengesSnap = await getDocs(q);
    
    for (const challengeDoc of challengesSnap.docs) {
      const challenge = challengeDoc.data();
      const userChallengeId = `${userId}_${challengeDoc.id}`;
      const userChallengeRef = doc(db, 'user_challenges', userChallengeId);
      const userChallengeSnap = await getDoc(userChallengeRef);
      
      let currentProgress = 0;
      let completed = false;
      
      if (userChallengeSnap.exists()) {
        const data = userChallengeSnap.data();
        if (data.completed) continue;
        currentProgress = data.progress;
      }
      
      const newProgress = currentProgress + value;
      if (newProgress >= challenge.goal) {
        completed = true;
        await addXP(userId, challenge.xpReward, 'challenge');
      }
      
      await setDoc(userChallengeRef, {
        userId,
        challengeId: challengeDoc.id,
        progress: newProgress,
        completed,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'user_challenges');
  }
}

export async function useInventoryItem(userId: string, itemName: string) {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    
    const userData = userSnap.data();
    const inventory = userData.inventory || [];
    const itemIndex = inventory.findIndex((i: any) => i.itemName === itemName);
    
    if (itemIndex === -1 || inventory[itemIndex].quantity <= 0) {
      throw new Error('Item not found or out of stock');
    }
    
    // Decrement quantity
    const newInventory = [...inventory];
    newInventory[itemIndex].quantity -= 1;
    if (newInventory[itemIndex].quantity === 0) {
      newInventory.splice(itemIndex, 1);
    }
    
    const updates: any = {
      inventory: newInventory,
      lastUpdated: serverTimestamp()
    };
    
    // Apply effect
    const now = new Date();
    if (itemName.includes('XP Boost')) {
      const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      updates.boostActiveUntil = expiry.toISOString();
    } else if (itemName.includes('Shield')) {
      const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      updates.shieldActiveUntil = expiry.toISOString();
    }
    
    await updateDoc(userRef, updates);
    return updates;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function claimReward(userId: string, reward: any) {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    
    const userData = userSnap.data();
    if ((userData.xp || 0) < reward.cost) {
      throw new Error('Insufficient XP');
    }
    
    // Deduct XP
    await updateDoc(userRef, {
      xp: increment(-reward.cost),
      lastUpdated: serverTimestamp()
    });
    
    // In a real app, you'd handle the delivery of the reward here (e.g., email, code generation)
    // For now, we just deduct XP and log it
    await addDoc(collection(db, 'xp_logs'), {
      userId,
      xpEarned: -reward.cost,
      reason: `claimed_${reward.id}`,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
