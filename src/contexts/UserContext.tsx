"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'tester' | 'viewer';
  avatar?: string;
  createdAt: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    setIsClient(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: userData.role || 'tester',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || firebaseUser.email?.split('@')[0] || 'U')}&background=random`,
              createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : new Date().toISOString(),
            };
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          } else {
            // Create default user if not exists in Firestore
            const user: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: 'tester',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'U')}&background=random`,
              createdAt: new Date().toISOString(),
            };
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        } catch (firestoreError: any) {
          console.error('Firestore permission error - user data not accessible:', firestoreError);
          // Check if it's a permission error specifically
          if (firestoreError.code === 'permission-denied' ||
              firestoreError.message?.includes('permission') ||
              firestoreError.message?.includes('Permission')) {
            console.warn('Permission error detected - user will be logged in with minimal data');
          }
          // Fallback to basic user data when Firestore access fails due to permissions
          const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            role: 'tester',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'U')}&background=random`,
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local state
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};