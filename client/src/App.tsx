// Main Application Component

import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/views/Dashboard';
import { InstanceManager } from './components/views/InstanceManager';
import { Login } from './components/views/Login';
import {
  LayoutDashboard,
  Server,
  ArrowRightLeft,
  Archive,
  BrainCircuit,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from './components/shared/Button';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'instances', icon: Server, label: 'Instance Manager' },
    { id: 'migration', icon: ArrowRightLeft, label: 'Migration Hub' },
    { id: 'backups', icon: Archive, label: 'Backup Vault' },
    { id: 'ai', icon: BrainCircuit, label: 'AI Architect' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'instances':
        return <InstanceManager />;
      case 'migration':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Migration Hub</h1>
            <p className="text-slate-400 mt-4">Migration features coming soon...</p>
          </div>
        );
      case 'backups':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Backup Vault</h1>
            <p className="text-slate-400 mt-4">Backup features coming soon...</p>
          </div>
        );
      case 'ai':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white">AI Architect</h1>
            <p className="text-slate-400 mt-4">AI features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 mt-4">Settings coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activeView={activeView} onViewChange={setActiveView} items={menuItems} />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-white">
            {menuItems.find((item) => item.id === activeView)?.label || 'Dashboard'}
          </h2>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white">{user?.email}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={logout} icon={<LogOut size={16} />}>
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">{renderView()}</div>
      </div>
    </div>
  );
};

export default App;
