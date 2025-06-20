
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/6bd58522-32f8-48b7-bbe7-999d3463508c.png" 
                alt="CineBaby" 
                className="h-10 w-auto"
              />
              {title && (
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              )}
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {user.type === 'admin' ? 'Administrador' : 'Clínica'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Heart className="h-4 w-4 mr-2 text-cinebaby-purple" />
            Feito com carinho pela equipe CineBaby
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
