import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database, googleProvider, githubProvider } from '@/lib/firebase';
import { User } from '@/types/momentum';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch or create user profile
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          setUserProfile(snapshot.val());
        } else {
          // Profile creation is typically handled during the new multi-step flow
          // but we provide a fallback for existing users or direct OAuth logins
          const newProfile: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous',
            createdAt: Date.now(),
            reliabilityScore: 0,
            qualityScore: 0,
            tasksCompleted: 0,
            startupsJoined: [],
            pulseScore: 0,
            badges: [],
            level: 1,
            xp: 0,
            achievements: [],
            streak: 0,
            lastActiveDate: Date.now(),
          };

          // Only add photoURL if it exists and is not empty
          if (firebaseUser.photoURL) {
            newProfile.photoURL = firebaseUser.photoURL;
          }

          await set(userRef, newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });

    // Create initial user profile - further details added in multi-step flow
    const newProfile: User = {
      id: result.user.uid,
      email: result.user.email || '',
      displayName,
      createdAt: Date.now(),
      reliabilityScore: 0,
      qualityScore: 0,
      tasksCompleted: 0,
      startupsJoined: [],
      pulseScore: 0,
      badges: [],
      level: 1,
      xp: 0,
      achievements: [],
      streak: 0,
      lastActiveDate: Date.now(),
    };
    await set(ref(database, `users/${result.user.uid}`), newProfile);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithGithub = async () => {
    await signInWithPopup(auth, githubProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    // Remove undefined values - Firebase doesn't accept them
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const userRef = ref(database, `users/${user.uid}`);
    await update(userRef, cleanData);
    setUserProfile(prev => prev ? { ...prev, ...cleanData } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithGithub,
      signOut,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
