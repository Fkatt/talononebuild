import React from 'react';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Login } from './components/views/Login';
import TalonForgeApp from './TalonForgeComplete';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <TalonForgeApp user={user} onLogout={logout} />;
};

export default App;
