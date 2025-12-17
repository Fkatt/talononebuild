import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import {
  LayoutDashboard,
  Server,
  ArrowRightLeft,
  Archive,
  BrainCircuit,
  ShieldAlert,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Database,
  Award,
  PlayCircle,
  Layout,
  Loader2,
  LogOut
} from 'lucide-react';
import { Login } from './components/views/Login';

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

  // For now, redirect to the full TalonForge UI
  // We'll load the complete component
  return <TalonForgeApp user={user} onLogout={logout} />;
};

// Complete TalonForge Application Component
// This is the integration of talononeuiv2.html with backend auth
const TalonForgeApp = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [protectedMode] = useState(true);
  // const [aiConfig, setAiConfig] = useState({...}); // Commented out for now
  // const [backups, setBackups] = useState<any>({}); // Commented out for now

  // Load instances from backend
  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/instances`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSites(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load instances:', error);
    }
  };

  // const showNotification = (message: string, type: string = 'success') => {
  //   setNotification({ message, type });
  //   setTimeout(() => setNotification(null), 3000);
  // };

  const handleLogout = () => {
    onLogout();
  };

  const currentUser = {
    name: user?.email || 'User',
    role: user?.role || 'Admin',
    avatar: (user?.email?.[0] || 'U').toUpperCase() + (user?.email?.[1] || 'S').toUpperCase()
  };

  // Sidebar Component
  const SidebarItem = ({ icon: Icon, label, active, onClick, alert }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
        ${active
          ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
    >
      <Icon size={20} className={active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
      <span className="font-medium text-sm">{label}</span>
      {alert && <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Server className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">TalonForge</h1>
              <p className="text-[10px] text-slate-500">v2.4.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Server} label="Instance Manager" active={activeTab === 'sites'} onClick={() => setActiveTab('sites')} />
          <SidebarItem icon={ArrowRightLeft} label="Migration Hub" active={activeTab === 'migration'} onClick={() => setActiveTab('migration')} />
          <SidebarItem icon={Archive} label="Backup Vault" active={activeTab === 'backups'} onClick={() => setActiveTab('backups')} />
          <SidebarItem icon={Database} label="Schema Manager" active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} />
          <SidebarItem icon={Award} label="Loyalty Tools" active={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')} />
          <SidebarItem icon={PlayCircle} label="Demo Simulator" active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} />
          <SidebarItem icon={BrainCircuit} label="AI Architect" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        </nav>

        <div className="mt-auto px-3 py-6 border-t border-slate-800 space-y-1">
          <SidebarItem
            icon={ShieldAlert}
            label="Admin Settings"
            active={activeTab === 'admin'}
            onClick={() => setActiveTab('admin')}
            alert={!protectedMode}
          />

          <div className="mt-4 bg-slate-800/50 rounded-lg p-3 flex items-center justify-between group">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {currentUser.avatar}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">{currentUser.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-white" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8">
          <div className="text-sm breadcrumbs text-slate-500">
            <span>Console</span>
            <span className="mx-2">/</span>
            <span className="text-white font-medium capitalize">{activeTab.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center space-x-4">
            {!protectedMode && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded text-xs font-bold animate-pulse flex items-center">
                <AlertTriangle size={12} className="mr-2" />
                PROTECTED MODE DISABLED
              </div>
            )}
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-0 right-0"></div>
              <button className="text-slate-400 hover:text-white transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {activeTab === 'dashboard' && <DashboardPlaceholder sites={sites} user={currentUser} />}
          {activeTab === 'sites' && <InstancesPlaceholder />}
          {activeTab === 'migration' && <PlaceholderView title="Migration Hub" />}
          {activeTab === 'backups' && <PlaceholderView title="Backup Vault" />}
          {activeTab === 'schema' && <PlaceholderView title="Schema Manager" />}
          {activeTab === 'loyalty' && <PlaceholderView title="Loyalty Tools" />}
          {activeTab === 'simulator' && <PlaceholderView title="Demo Simulator" />}
          {activeTab === 'ai' && <PlaceholderView title="AI Architect" />}
          {activeTab === 'admin' && <PlaceholderView title="Admin Settings" />}
        </main>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl border flex items-center animate-in slide-in-from-bottom-5 duration-300 z-50
          ${notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 'bg-slate-800 border-blue-500 text-white'}
        `}>
          {notification.type === 'error' ? <AlertTriangle className="mr-3" /> : <CheckCircle2 className="mr-3 text-emerald-400" />}
          <div>
            <h4 className="font-bold text-sm">{notification.type === 'error' ? 'Warning' : 'Success'}</h4>
            <p className="text-xs opacity-90">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Temporary placeholder components - we'll replace these with the full versions
const DashboardPlaceholder = ({ sites, user }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome back, {user.name.split('@')[0]}</h2>
        <p className="text-slate-400 text-sm mt-1">System operational. {sites.length} active instances linked.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-slate-400 text-sm font-medium mb-1">Managed Instances</h3>
        <p className="text-3xl font-bold text-white">{sites.length}</p>
        <div className="mt-4 flex items-center text-xs space-x-3">
          <span className="flex items-center text-blue-400">
            <Server size={12} className="mr-1"/> {sites.filter((s: any) => s.type === 'talon').length} Talon
          </span>
          <span className="flex items-center text-yellow-400">
            <Layout size={12} className="mr-1"/> {sites.filter((s: any) => s.type === 'contentful').length} Contentful
          </span>
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-slate-400 text-sm font-medium mb-1">Recent Migrations</h3>
        <p className="text-3xl font-bold text-white">0</p>
        <div className="mt-4 text-blue-400 text-xs">
          Ready to migrate
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-slate-400 text-sm font-medium mb-1">AI Generated Rules</h3>
        <p className="text-3xl font-bold text-white">0</p>
        <div className="mt-4 flex items-center text-purple-400 text-xs">
          <Zap size={14} className="mr-1" /> Get started
        </div>
      </div>
    </div>
  </div>
);

const InstancesPlaceholder = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-white">Instance Manager</h2>
      <p className="text-slate-400 text-sm">Full instance management coming up next...</p>
    </div>
  </div>
);

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-slate-400 text-sm mt-2">This feature is being integrated with your backend...</p>
    </div>
  </div>
);

export default App;
