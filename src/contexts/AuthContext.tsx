
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('cinebaby_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Admin login
    if (email === 'admin@cinebaby.online' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin',
        email: 'admin@cinebaby.online',
        type: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('cinebaby_user', JSON.stringify(adminUser));
      return true;
    }

    // Clinic login (simulate database check)
    const clinics = JSON.parse(localStorage.getItem('cinebaby_clinics') || '[]');
    const clinic = clinics.find((c: any) => c.email === email && c.password === password);
    
    if (clinic) {
      const clinicUser: User = {
        id: clinic.id,
        email: clinic.email,
        type: 'clinic',
        clinicId: clinic.id
      };
      setUser(clinicUser);
      localStorage.setItem('cinebaby_user', JSON.stringify(clinicUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cinebaby_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
