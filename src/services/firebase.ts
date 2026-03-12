import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  onValue,
  set,
  ref,
  push,
  query,
  orderByChild,
  limitToLast,
  get,
} from 'firebase/database';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDntWB97lVscLepvDe_t1a6Z5eYnhFUwXo',
  authDomain: 'fusion2048.firebaseapp.com',
  projectId: 'fusion2048',
  databaseURL: 'https://fusion2048-default-rtdb.firebaseio.com',
  storageBucket: 'fusion2048.firebasestorage.app',
  messagingSenderId: '913585696575',
  appId: '1:913585696575:web:5a6e7cb82b816120062d8a',
  measurementId: 'G-LW64G5CPBX',
};

// Initialize Firebase
let app;
let auth;
let database;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app, firebaseConfig.databaseURL);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Initialize Firebase auth state listener
 */
export const initializeFirebase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!auth) {
      reject(new Error('Firebase not initialized'));
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      () => {
        unsubscribe();
        resolve();
      },
      (error) => {
        // Keep app available even if persisted auth session fails to restore.
        console.warn('Firebase auth listener error:', error);
        unsubscribe();
        resolve();
      }
    );
  });
};

/**
 * Create account with email/password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  if (!auth) throw new Error('Firebase not initialized');

  const credentials = await createUserWithEmailAndPassword(auth, email, password);

  if (username.trim()) {
    await updateProfile(credentials.user, {
      displayName: username.trim(),
    });
  }

  return credentials.user;
};

/**
 * Sign in with email/password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  if (!auth) throw new Error('Firebase not initialized');

  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return credentials.user;
};

/**
 * Sign out current user
 */
export const signOutCurrentUser = async (): Promise<void> => {
  if (!auth) throw new Error('Firebase not initialized');
  await signOut(auth);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth?.currentUser ?? null;
};

/**
 * Subscribe to auth changes
 */
export const onCurrentUserChanged = (
  callback: (user: User | null) => void
): (() => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user ID
 */
export const getCurrentUserId = (): string | null => {
  return auth?.currentUser?.uid ?? null;
};

/**
 * Save player profile to Firebase
 */
export const savePlayerToFirebase = async (
  username: string,
  profileData: any
): Promise<void> => {
  if (!database || !auth?.currentUser) return;

  try {
    const playerRef = ref(database, `players/${auth.currentUser.uid}`);
    await set(playerRef, {
      ...profileData,
      username,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving player to Firebase:', error);
  }
};

/**
 * Get player profile from Firebase
 */
export const getPlayerFromFirebase = async (
  userId: string
): Promise<any | null> => {
  if (!database) return null;

  try {
    const playerRef = ref(database, `players/${userId}`);
    const snapshot = await get(playerRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting player from Firebase:', error);
    return null;
  }
};

/**
 * Save score to leaderboard
 */
export const saveScoreToLeaderboard = async (
  username: string,
  score: number
): Promise<void> => {
  if (!database || !auth?.currentUser) return;

  try {
    const scoresRef = ref(database, 'leaderboard');
    await push(scoresRef, {
      userId: auth.currentUser.uid,
      username,
      score,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving score to leaderboard:', error);
  }
};

/**
 * Get top scores from leaderboard
 */
export const getTopScores = async (limit: number = 100): Promise<any[]> => {
  if (!database) return [];

  try {
    const scoresQuery = query(
      ref(database, 'leaderboard'),
      orderByChild('score'),
      limitToLast(limit)
    );

    const snapshot = await get(scoresQuery);

    if (!snapshot.exists()) return [];

    const scores: any[] = [];
    snapshot.forEach((child) => {
      scores.unshift({
        id: child.key,
        ...child.val(),
      });
    });

    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting top scores:', error);
    return [];
  }
};

/**
 * Listen to player profile updates in real-time
 */
export const listenToPlayerUpdates = (
  userId: string,
  callback: (data: any) => void
): (() => void) => {
  if (!database) return () => {};

  const playerRef = ref(database, `players/${userId}`);

  const unsubscribe = onValue(playerRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });

  return unsubscribe;
};

/**
 * Listen to leaderboard updates in real-time
 */
export const listenToLeaderboardUpdates = (
  callback: (data: any[]) => void
): (() => void) => {
  if (!database) return () => {};

  const leaderboardRef = ref(database, 'leaderboard');

  const unsubscribe = onValue(leaderboardRef, (snapshot) => {
    if (snapshot.exists()) {
      const scores: any[] = [];
      snapshot.forEach((child) => {
        scores.push({
          id: child.key,
          ...child.val(),
        });
      });
      callback(scores.sort((a, b) => b.score - a.score));
    }
  });

  return unsubscribe;
};

export { app, auth, database };
