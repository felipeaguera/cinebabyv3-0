
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cinebaby-purple"></div>
      </div>
    );
  }

  if (user) {
    if (user.type === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/clinic" replace />;
    }
  }

  return <LoginForm />;
};

export default Index;
