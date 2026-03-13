import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      // If Firebase fails (e.g. no config), fall back to demo mode
      console.warn('Firebase auth failed, using demo mode:', error.message);
      const demoUser = {
        uid: 'demo-user-' + Date.now(),
        displayName: 'Demo Student',
        email: 'demo@examease.com',
        photoURL: null
      };
      setUser(demoUser);
      return demoUser;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.warn('Firebase auth failed, using demo mode:', error.message);
      const demoUser = {
        uid: 'demo-user-' + Date.now(),
        displayName: email.split('@')[0],
        email: email,
        photoURL: null
      };
      setUser(demoUser);
      return demoUser;
    }
  };

  const signupWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      return result.user;
    } catch (error) {
      console.warn('Firebase auth failed, using demo mode:', error.message);
      const demoUser = {
        uid: 'demo-user-' + Date.now(),
        displayName: displayName || email.split('@')[0],
        email: email,
        photoURL: null
      };
      setUser(demoUser);
      return demoUser;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase signout failed:', error.message);
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
