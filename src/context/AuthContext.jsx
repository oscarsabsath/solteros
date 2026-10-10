import { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService, isSupabaseConfigured } from '../services/supabaseService';
import { firebaseService, isFirebaseConfigured } from '../services/firebaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar usuario al cargar
    const existing = supabaseService.getCurrentUser();
    if (existing) {
      setUser(existing);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userSession = isFirebaseConfigured
      ? await firebaseService.login(email, password)
      : await supabaseService.login(email, password);
    setUser(userSession);
    return userSession;
  };

  const register = async (formData) => {
    const userSession = isFirebaseConfigured
      ? await firebaseService.register(formData)
      : await supabaseService.register(formData);
    setUser(userSession);
    return userSession;
  };

  const loginWithGoogle = async () => {
    const userSession = await firebaseService.loginWithGoogle();
    if (userSession) {
      setUser(userSession);
    }
    return userSession;
  };

  const logout = async () => {
    await supabaseService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured || isFirebaseConfigured,
        isFirebase: isFirebaseConfigured,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return ctx;
}
