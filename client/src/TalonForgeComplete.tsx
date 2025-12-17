import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Server, 
  ArrowRightLeft, 
  Archive, 
  BrainCircuit, 
  ShieldAlert, 
  Settings, 
  Plus, 
  Copy, 
  Trash2, 
  Folder, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Zap,
  Key,
  Globe,
  ChevronDown,
  ChevronRight,
  UploadCloud,
  X,
  Database,
  Award,
  PlayCircle,
  Layout,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Store,
  Loader2,
  LogOut,
  User,
  BookOpen,
  MessageSquare,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Hash
} from 'lucide-react';

// --- Mock Data & Constants ---

const USERS = {
  'admin@talonforge.io': {
    name: 'System Admin',
    role: 'Super Admin',
    avatar: 'AD',
    instances: [
      { id: 1, type: 'talon', name: 'Talon - Prod US', url: 'https://talon-prod-us.api.com', region: 'US-East-1', status: 'online', vertical: 'Retail', apiKey: 'sk_live_...93f2', linkedResource: 'contentful-1', bundle: 'GS-Fashion-Alpha' },
      { id: 2, type: 'talon', name: 'Talon - Staging EU', url: 'https://talon-staging-eu.api.com', region: 'EU-West-1', status: 'online', vertical: 'Retail', apiKey: 'sk_test_...88a1', linkedResource: 'contentful-2', bundle: 'GS-Fashion-Beta' },
      { id: 'contentful-1', type: 'contentful', name: 'Contentful - Retail Brand', url: 'https://app.contentful.com/spaces/rt-prod', region: 'Global', status: 'online', vertical: 'Retail', apiKey: 'cfp_...x88z', linkedResource: 1, bundle: 'GS-Fashion-Alpha' },
      { id: 'contentful-2', type: 'contentful', name: 'Contentful - Retail Staging', url: 'https://app.contentful.com/spaces/rt-stage', region: 'Global', status: 'synced', vertical: 'Retail', apiKey: 'cfp_...a99b', linkedResource: 2, bundle: 'GS-Fashion-Beta' },
      { id: 3, type: 'talon', name: 'Talon - Dev Sandbox', url: 'https://talon-dev.api.com', region: 'US-West-2', status: 'maintenance', vertical: 'Gaming', apiKey: 'sk_dev_...22b9', linkedResource: null, bundle: null }
    ]
  },
  'demo@talonforge.io': {
    name: 'Demo User',
    role: 'Sales Engineer',
    avatar: 'DU',
    instances: [
      { id: 101, type: 'talon', name: 'Talon - Demo Corp', url: 'https://talon-demo.api.com', region: 'US-East-1', status: 'online', vertical: 'Retail', apiKey: 'sk_demo_...11x1', linkedResource: null, bundle: null },
      { id: 102, type: 'contentful', name: 'Contentful - Demo Space', url: 'https://app.contentful.com/spaces/demo', region: 'Global', status: 'online', vertical: 'Retail', apiKey: 'cfp_...demo', linkedResource: null, bundle: null }
    ]
  }
};

const DEFAULT_AI_CONFIG = {
  provider: 'gemini',
  apiKeys: { gemini: '', openai: '', claude: '' },
  customEndpoints: { gemini: '', openai: '', claude: '' },
  modelIds: { gemini: 'gemini-1.5-pro', openai: 'gpt-4', claude: 'claude-3-opus' },
  docs: {
    talon: 'https://docs.talon.one/management-api',
    contentful: 'https://www.contentful.com/developers/docs/references/content-management-api/'
  },
  prompts: {
    system: "You are an expert rule architect for Talon.One. Generate valid JSON rule definitions based on the user's intent.",
    promotions: "Focus on cart item filters, coupon validity, and discount effects.",
    loyalty: "Focus on profile attributes, sub-ledgers, and tier upgrades."
  },
  suggestions: [
    "Create a rule for 20% off shoes over $100",
    "Award 50 points for buying specific SKU",
    "Tier upgrade to Gold after 5 purchases"
  ]
};

const MOCK_TALON_ASSETS = [
  { 
    id: 'app-1', type: 'Application', name: 'E-commerce Main', children: [
      { id: 'cmp-1', type: 'Campaign', name: 'Black Friday 2024', children: [
        { id: 'rule-1', type: 'Rule', name: '20% Off Electronics' },
        { id: 'rule-2', type: 'Rule', name: 'Free Shipping VIP' }
      ]},
      { id: 'cmp-2', type: 'Campaign', name: 'Welcome Series', children: [] }
    ]
  },
  { 
    id: 'app-2', type: 'Application', name: 'Mobile Loyalty', children: [
       { id: 'cmp-3', type: 'Campaign', name: 'Referral Bonus', children: [] }
    ]
  }
];

const MOCK_CONTENTFUL_ASSETS = [
  {
    id: 'ct-1', type: 'ContentType', name: 'Landing Page', children: [
      { id: 'ent-1', type: 'Entry', name: 'Home - Black Friday', children: [] },
      { id: 'ent-2', type: 'Entry', name: 'Home - Default', children: [] }
    ]
  },
  {
    id: 'ct-2', type: 'ContentType', name: 'Branding Theme', children: [
      { id: 'asset-1', type: 'Asset', name: 'Logo - Dark Mode.svg', children: [] },
      { id: 'asset-2', type: 'Asset', name: 'Font - Inter.woff', children: [] },
      { id: 'ent-3', type: 'Entry', name: 'Color Palette - Winter 2024', children: [] }
    ]
  }
];

const MOCK_LOYALTY_ASSETS = [
  {
    id: 'prog-1', type: 'Program', name: 'Gold Rewards', children: [
      { id: 'tier-1', type: 'Tier', name: 'Bronze (0-500)', children: [] },
      { id: 'tier-2', type: 'Tier', name: 'Silver (500-2000)', children: [] },
      { id: 'tier-3', type: 'Tier', name: 'Gold (2000+)', children: [] },
      { id: 'rule-l1', type: 'Rule', name: 'Base Earn (1pt/$1)', children: [] }
    ]
  },
  {
    id: 'prog-2', type: 'Program', name: 'Employee Perks', children: [
      { id: 'tier-4', type: 'Tier', name: 'Staff', children: [] }
    ]
  }
];

const MOCK_ATTRIBUTES = [
  { id: 'attr-1', name: 'ShippingCity', type: 'string', entity: 'CustomerProfile', status: 'synced' },
  { id: 'attr-2', name: 'LifetimeSpend', type: 'number', entity: 'CustomerProfile', status: 'synced' },
  { id: 'attr-3', name: 'IsVIP', type: 'boolean', entity: 'CustomerProfile', status: 'missing_dest' },
  { id: 'attr-4', name: 'ShoeSize', type: 'number', entity: 'CartItem', status: 'missing_dest' },
];

const INITIAL_BACKUPS = {
  'Retail': [
    { id: 'bk-1', type: 'talon', name: 'Talon-Prod-Full-Oct.json', date: '2023-10-27', size: '4.2 MB' },
    { id: 'bk-1b', type: 'contentful', name: 'Contentful-Export-Retail-v2.json', date: '2023-10-27', size: '12.8 MB' },
    { id: 'bk-2', type: 'talon', name: 'Talon-Staging-Snapshot.json', date: '2023-11-01', size: '1.8 MB' }
  ],
  'Gaming': [
    { id: 'bk-3', type: 'talon', name: 'Dev-Sandbox-Init.json', date: '2023-09-15', size: '0.5 MB' }
  ],
  'FinTech': []
};

// --- Shared Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, alert }) => (
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

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

const Badge = ({ status = 'offline' }) => {
  const styles = {
    online: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    offline: 'bg-red-500/10 text-red-400 border-red-500/20',
    synced: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    missing_dest: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  
  let label = status;
  if (status === 'missing_dest') label = 'Missing in Dest';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.offline} flex items-center gap-1`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status.includes('missing') || status === 'offline' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

// --- View Components ---

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@talonforge.io');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (USERS[email]) {
      onLogin(USERS[email]);
    } else {
      setError('Invalid credentials. Try admin@talonforge.io');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50 mb-4">
             <Server className="text-white" size={32} />
           </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-white mb-2">TalonForge</h1>
        <p className="text-slate-400 text-center mb-8">Enterprise Environment Manager</p>
        
        <Card className="bg-slate-800 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input 
                type="password" 
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-2">
              Sign In
            </button>
          </form>
        </Card>
        <p className="text-center text-slate-600 text-xs mt-6">
          v2.4.0 | Protected Environment
        </p>
      </div>
    </div>
  );
};

const DashboardView = ({ sites, setActiveTab, user }) => {
  // Mock recent activity data
  const activities = [
    { id: 1, type: 'migration', message: 'Cloned "Black Friday" from Prod to Staging', time: '10m ago', user: 'System Admin' },
    { id: 2, type: 'snapshot', message: 'Created "Daily Retail Backup"', time: '45m ago', user: 'System Admin' },
    { id: 3, type: 'rule', message: 'AI Generated "VIP Tier Logic"', time: '2h ago', user: 'Demo User' },
    { id: 4, type: 'schema', message: 'Synced 3 missing attributes', time: '5h ago', user: 'System Admin' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {user.name.split(' ')[0]}</h2>
          <p className="text-slate-400 text-sm mt-1">System operational. {sites.length} active instances linked.</p>
        </div>
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-mono">
          {user.role} View
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server size={80} />
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Managed Instances</h3>
          <p className="text-3xl font-bold text-white">{sites.length}</p>
          <div className="mt-4 flex items-center text-xs space-x-3">
            <span className="flex items-center text-blue-400"><Server size={12} className="mr-1"/> {sites.filter(s=>s.type === 'talon').length} Talon</span>
            <span className="flex items-center text-yellow-400"><Layout size={12} className="mr-1"/> {sites.filter(s=>s.type === 'contentful').length} Contentful</span>
          </div>
        </Card>
        
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowRightLeft size={80} />
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Recent Migrations</h3>
          <p className="text-3xl font-bold text-white">12</p>
          <div className="mt-4 flex items-center text-blue-400 text-xs">
            Last: Prod to Staging (1h ago)
          </div>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit size={80} />
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">AI Generated Rules</h3>
          <p className="text-3xl font-bold text-white">84</p>
          <div className="mt-4 flex items-center text-purple-400 text-xs">
            <Zap size={14} className="mr-1" /> Efficiency +15%
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity size={18} className="mr-2 text-blue-400" />
              Live System Activity
            </h3>
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start pb-4 border-b border-slate-700/50 last:border-0 last:pb-0">
                  <div className={`mt-1 w-2 h-2 rounded-full mr-3 shrink-0 ${
                    act.type === 'migration' ? 'bg-blue-500' : 
                    act.type === 'snapshot' ? 'bg-emerald-500' :
                    act.type === 'rule' ? 'bg-purple-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <p className="text-sm text-slate-200">{act.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.time} • {act.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3 flex-1">
               <button onClick={() => setActiveTab('schema')} className="p-4 bg-slate-900/50 hover:bg-orange-600/20 border border-slate-700/50 hover:border-orange-500/50 rounded-lg text-left transition-all group">
                  <Database className="text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium text-slate-200">Sync Schema</div>
                  <div className="text-xs text-slate-500">Align attributes & sets</div>
               </button>
               <button onClick={() => setActiveTab('simulator')} className="p-4 bg-slate-900/50 hover:bg-blue-600/20 border border-slate-700/50 hover:border-blue-500/50 rounded-lg text-left transition-all group">
                  <PlayCircle className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium text-slate-200">Demo Simulator</div>
                  <div className="text-xs text-slate-500">Test Linked Apps</div>
               </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SchemaManagerView = ({ sites, showNotification }) => (
  <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Schema & Attribute Manager</h2>
          <p className="text-slate-400 text-sm">Synchronize Customer Attributes and Cart Item Attributes between environments.</p>
        </div>
        <button 
           onClick={() => showNotification("Schema sync initiated. 2 Attributes created.", "success")}
           className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <RefreshCw size={16} className="mr-2" /> Sync Missing Attributes
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Source (Reference)</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
              {sites.filter(s => s.type === 'talon').map(s => <option key={s.id}>{s.name}</option>)}
            </select>
         </div>
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Destination (Target)</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
               <option>Staging - EU</option>
               <option>Dev Sandbox</option>
            </select>
         </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex-1">
        <table className="w-full text-left text-sm text-slate-400">
           <thead className="bg-slate-900/50 text-xs uppercase font-semibold text-slate-500">
             <tr>
               <th className="px-6 py-4">Attribute Name</th>
               <th className="px-6 py-4">Entity Type</th>
               <th className="px-6 py-4">Data Type</th>
               <th className="px-6 py-4 text-right">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-700/50">
             {MOCK_ATTRIBUTES.map(attr => (
               <tr key={attr.id} className="hover:bg-slate-700/20">
                 <td className="px-6 py-4 font-medium text-slate-200">{attr.name}</td>
                 <td className="px-6 py-4">{attr.entity}</td>
                 <td className="px-6 py-4 font-mono text-xs">{attr.type}</td>
                 <td className="px-6 py-4 text-right">
                    <div className="flex justify-end">
                      <Badge status={attr.status} />
                    </div>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
  </div>
);

const AIArchitectView = ({ sites, showNotification, aiConfig }) => {
  const [deployStep, setDeployStep] = useState(0); 
  const [ruleContext, setRuleContext] = useState('promotions');
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhancePrompt = () => {
    if (!prompt) return;
    setIsEnhancing(true);
    setTimeout(() => {
      setPrompt(prev => `Advanced Enterprise Logic: ${prev} with tier-based validation and sub-ledger tracking.`);
      setIsEnhancing(false);
      showNotification("Prompt enhanced by AI");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
             <BrainCircuit className="mr-3 text-purple-400" /> AI Rule Architect
          </h2>
          <p className="text-slate-400 text-sm">Powered by <span className="text-purple-400 font-bold capitalize">{aiConfig.provider}</span>. Describe your logic in plain English.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        <Card className="flex flex-col relative">
           <div className="absolute top-4 right-4 z-10 bg-slate-900 rounded-lg border border-slate-700 p-1 flex">
             <button 
               onClick={() => setRuleContext('promotions')}
               className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center ${ruleContext === 'promotions' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
               <Zap size={12} className="mr-1.5" /> Promotions
             </button>
             <button 
               onClick={() => setRuleContext('loyalty')}
               className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center ${ruleContext === 'loyalty' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
               <Award size={12} className="mr-1.5" /> Loyalty
             </button>
           </div>

           <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2 mt-10">
             <div className="bg-slate-900/50 p-4 rounded-lg rounded-tl-none border border-slate-700/50 max-w-[90%]">
               <p className="text-slate-300 text-sm">
                 Hello! I'm your TalonForge Assistant. I'm ready to help you build {ruleContext === 'promotions' ? 'discount and coupon' : 'points and tier'} logic. What do you need?
               </p>
             </div>
             
             {/* Suggested Prompts */}
             <div className="flex flex-wrap gap-2 justify-end">
               {aiConfig.suggestions.map((suggestion, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setPrompt(suggestion)}
                   className="text-xs bg-slate-800 border border-slate-600 text-slate-300 px-3 py-1.5 rounded-full hover:bg-purple-900/20 hover:border-purple-500/50 transition-colors"
                 >
                   {suggestion}
                 </button>
               ))}
             </div>
           </div>
           
           <div className="mt-auto">
             <div className="relative flex items-center gap-2">
               <div className="relative flex-1">
                 <input 
                    type="text" 
                    placeholder={`Describe your ${ruleContext} logic...`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                 />
                 <button 
                   onClick={handleEnhancePrompt}
                   disabled={isEnhancing || !prompt}
                   title="Enhance Prompt with AI"
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-400 hover:text-purple-300 rounded-md transition-colors disabled:opacity-50"
                 >
                   {isEnhancing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                 </button>
               </div>
               <button className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                 <Zap size={20} />
               </button>
             </div>
           </div>
        </Card>

        {/* JSON Preview Panel */}
        <Card className="bg-[#1e1e1e] border-slate-700 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
             <span className="text-xs font-mono text-slate-500">GENERATED_RULE.json</span>
             <button className="text-xs flex items-center text-purple-400 hover:text-purple-300">
               <Copy size={12} className="mr-1" /> Copy Code
             </button>
          </div>
          <div className="text-center pt-20 text-slate-600 text-sm flex-1">
            JSON Output Window
          </div>
          {/* Feedback */}
          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
             <span className="text-xs text-slate-500">Was this helpful?</span>
             <div className="flex gap-2">
                <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-green-400"><ThumbsUp size={14}/></button>
                <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"><ThumbsDown size={14}/></button>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AdminView = ({ protectedMode, setProtectedMode, showNotification, aiConfig, setAiConfig }) => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-6">
      <div className="flex items-center space-x-4 mb-6">
        <ShieldAlert size={32} className="text-slate-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Control Center</h2>
          <p className="text-slate-400 text-sm">Global system configuration and API management.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 space-x-6">
        <button onClick={() => setActiveTab('general')} className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
          General & Security
        </button>
        <button onClick={() => setActiveTab('ai')} className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'ai' ? 'text-white border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}>
          AI Configuration
        </button>
        <button onClick={() => setActiveTab('tuning')} className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'tuning' ? 'text-white border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}>
          Rule Architect Tuning
        </button>
        <button onClick={() => setActiveTab('docs')} className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'docs' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
          Documentation Links
        </button>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <Card className={`border-l-4 ${protectedMode ? 'border-l-emerald-500' : 'border-l-red-500'} transition-colors`}>
          <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center">
                  Protected Mode
                  {protectedMode 
                    ? <span className="ml-3 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">ACTIVE</span>
                    : <span className="ml-3 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 animate-pulse">DISABLED</span>
                  }
                </h3>
                <p className="text-sm text-slate-400 mt-1 max-w-lg">
                  When active, destructive actions (Delete Site, Delete Backup, Overwrite Campaign) are disabled UI-wide to prevent accidental data loss.
                </p>
              </div>
              
              <button 
                onClick={() => {
                  setProtectedMode(!protectedMode);
                  showNotification(protectedMode ? "Protected Mode Disabled! Be Careful." : "Protected Mode Enabled.", protectedMode ? "error" : "success");
                }}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${protectedMode ? 'bg-emerald-600 focus:ring-emerald-500' : 'bg-red-600 focus:ring-red-500'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition transition-transform duration-200 ease-in-out ${protectedMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
          </div>
        </Card>
      )}

      {/* AI Config Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">AI Provider Selection</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {['gemini', 'openai', 'claude'].map(provider => (
                <button
                  key={provider}
                  onClick={() => setAiConfig({...aiConfig, provider})}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${aiConfig.provider === provider ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  <BrainCircuit size={24} className="mb-2" />
                  <span className="capitalize font-medium">{provider}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {/* Gemini Config */}
              <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                <h4 className="text-sm font-bold text-white mb-3">Gemini Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key</label>
                    <input 
                      type="password" 
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white font-mono"
                      value={aiConfig.apiKeys.gemini}
                      onChange={(e) => setAiConfig({...aiConfig, apiKeys: {...aiConfig.apiKeys, gemini: e.target.value}})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model ID</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white font-mono"
                        value={aiConfig.modelIds.gemini}
                        onChange={(e) => setAiConfig({...aiConfig, modelIds: {...aiConfig.modelIds, gemini: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custom Endpoint (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white font-mono"
                        placeholder="https://proxy..."
                        value={aiConfig.customEndpoints.gemini}
                        onChange={(e) => setAiConfig({...aiConfig, customEndpoints: {...aiConfig.customEndpoints, gemini: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* OpenAI Config */}
              <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                <h4 className="text-sm font-bold text-white mb-3">OpenAI Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key</label>
                    <input 
                      type="password" 
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white font-mono"
                      value={aiConfig.apiKeys.openai}
                      onChange={(e) => setAiConfig({...aiConfig, apiKeys: {...aiConfig.apiKeys, openai: e.target.value}})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model ID</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white font-mono"
                        value={aiConfig.modelIds.openai}
                        onChange={(e) => setAiConfig({...aiConfig, modelIds: {...aiConfig.modelIds, openai: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custom Endpoint (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white font-mono"
                        placeholder="https://proxy..."
                        value={aiConfig.customEndpoints.openai}
                        onChange={(e) => setAiConfig({...aiConfig, customEndpoints: {...aiConfig.customEndpoints, openai: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-medium" onClick={() => showNotification("AI Settings Saved")}>Save Keys</button>
            </div>
          </Card>
        </div>
      )}

      {/* Tuning Tab */}
      {activeTab === 'tuning' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-white mb-2">System Prompts</h3>
            <p className="text-slate-400 text-xs mb-6">Define the persona and constraints for the AI Rule Architect.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base System Prompt</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white font-mono h-24 focus:outline-none focus:border-purple-500"
                  value={aiConfig.prompts.system}
                  onChange={(e) => setAiConfig({...aiConfig, prompts: {...aiConfig.prompts, system: e.target.value}})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Promotions Context</label>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white font-mono h-32 focus:outline-none focus:border-purple-500"
                    value={aiConfig.prompts.promotions}
                    onChange={(e) => setAiConfig({...aiConfig, prompts: {...aiConfig.prompts, promotions: e.target.value}})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loyalty Context</label>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white font-mono h-32 focus:outline-none focus:border-purple-500"
                    value={aiConfig.prompts.loyalty}
                    onChange={(e) => setAiConfig({...aiConfig, prompts: {...aiConfig.prompts, loyalty: e.target.value}})}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Suggested Prompts</h3>
            <div className="space-y-2">
              {aiConfig.suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                    value={suggestion}
                    onChange={(e) => {
                      const newSuggestions = [...aiConfig.suggestions];
                      newSuggestions[idx] = e.target.value;
                      setAiConfig({...aiConfig, suggestions: newSuggestions});
                    }}
                  />
                  <button className="text-red-400 hover:bg-slate-700 p-2 rounded" onClick={() => {
                     const newSuggestions = aiConfig.suggestions.filter((_, i) => i !== idx);
                     setAiConfig({...aiConfig, suggestions: newSuggestions});
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button 
                className="text-xs text-purple-400 hover:text-purple-300 mt-2 flex items-center"
                onClick={() => setAiConfig({...aiConfig, suggestions: [...aiConfig.suggestions, "New prompt template..."]})}
              >
                <Plus size={14} className="mr-1" /> Add Suggestion
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Docs Tab */}
      {activeTab === 'docs' && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Documentation References</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Talon.One API Documentation URL</label>
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-l p-2 text-sm text-white"
                  value={aiConfig.docs.talon}
                  onChange={(e) => setAiConfig({...aiConfig, docs: {...aiConfig.docs, talon: e.target.value}})}
                />
                <a href={aiConfig.docs.talon} target="_blank" rel="noreferrer" className="bg-slate-700 px-3 flex items-center rounded-r border border-l-0 border-slate-700 hover:bg-slate-600 text-white">
                  <Globe size={16} />
                </a>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contentful API Documentation URL</label>
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-l p-2 text-sm text-white"
                  value={aiConfig.docs.contentful}
                  onChange={(e) => setAiConfig({...aiConfig, docs: {...aiConfig.docs, contentful: e.target.value}})}
                />
                <a href={aiConfig.docs.contentful} target="_blank" rel="noreferrer" className="bg-slate-700 px-3 flex items-center rounded-r border border-l-0 border-slate-700 hover:bg-slate-600 text-white">
                  <Globe size={16} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-medium" onClick={() => showNotification("Links Updated")}>Save Links</button>
            </div>
        </Card>
      )}
    </div>
  );
};

const InstanceManagerView = ({ sites, protectedMode, showNotification, setSites }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'gigastores'
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showAddInstanceModal, setShowAddInstanceModal] = useState(false);
  const [showCreateBundleModal, setShowCreateBundleModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [selectedToAdd, setSelectedToAdd] = useState("");
  const [selectedUnassigned, setSelectedUnassigned] = useState([]);
  const [newBundleName, setNewBundleName] = useState("");

  // Add Instance Form State
  const [newInstance, setNewInstance] = useState({ 
    name: '', 
    type: 'talon', 
    url: '', 
    vertical: 'Retail', 
    apiKey: '', 
    appId: '' 
  });

  const getLinkedSiteName = (linkedId, allSites) => {
    const found = allSites.find(s => s.id === linkedId);
    return found ? found.name : 'Unlinked';
  };

  const handleConfigureBundle = (bundleName) => {
    setEditingBundle(bundleName);
    setShowBundleModal(true);
  };

  const handleAddToBundle = () => {
    if (selectedToAdd) {
      const updatedSites = sites.map(site => {
        if (site.id === parseInt(selectedToAdd) || site.id === selectedToAdd) {
          return { ...site, bundle: editingBundle };
        }
        return site;
      });
      setSites(updatedSites);
      setSelectedToAdd("");
    }
  };

  const handleRemoveFromBundle = (siteId) => {
    const updatedSites = sites.map(site => {
      if (site.id === siteId) {
        return { ...site, bundle: null };
      }
      return site;
    });
    setSites(updatedSites);
  };

  const handleCreateInstance = () => {
    const newSite = {
      id: Date.now(),
      ...newInstance,
      status: 'online',
      linkedResource: null,
      bundle: null
    };
    setSites([...sites, newSite]);
    setShowAddInstanceModal(false);
    showNotification(`New ${newInstance.type} instance created!`);
  };

  const toggleUnassignedSelection = (id) => {
    setSelectedUnassigned(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateBundleFromSelection = () => {
    if (!newBundleName) return;
    const updatedSites = sites.map(site => {
      if (selectedUnassigned.includes(site.id)) {
        return { ...site, bundle: newBundleName };
      }
      return site;
    });
    setSites(updatedSites);
    setShowCreateBundleModal(false);
    setSelectedUnassigned([]);
    setNewBundleName("");
    showNotification(`Bundle "${newBundleName}" created!`);
  };

  // Group sites by bundle for Gigastore view
  const gigastores = sites.reduce((acc, site) => {
    if (site.bundle) {
      if (!acc[site.bundle]) acc[site.bundle] = [];
      acc[site.bundle].push(site);
    }
    return acc;
  }, {});

  const unbundledSites = sites.filter(s => !s.bundle);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Instance Manager</h2>
          <p className="text-slate-400 text-sm">Manage Talon.One API connections and Contentful CMS Spaces.</p>
        </div>
        <div className="flex space-x-2">
           <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex mr-4">
             <button 
               onClick={() => setViewMode('list')}
               className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center ${viewMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
               <Server size={14} className="mr-2" /> List
             </button>
             <button 
               onClick={() => setViewMode('gigastores')}
               className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center ${viewMode === 'gigastores' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
               <Store size={14} className="mr-2" /> Gigastores
             </button>
          </div>
          <button 
            onClick={() => setShowAddInstanceModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
          >
            <Plus size={16} className="mr-2" /> Add Instance
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-900/50 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
             <div className="col-span-1">Type</div>
             <div className="col-span-3">Instance Name</div>
             <div className="col-span-3">Linked Resource</div>
             <div className="col-span-3">Vertical</div>
             <div className="col-span-2 text-right">Status</div>
          </div>
          
          <div className="divide-y divide-slate-700/50">
            {sites.map((site) => (
              <div key={site.id} className="transition-colors hover:bg-slate-700/20">
                <div 
                  className="grid grid-cols-12 px-6 py-4 items-center cursor-pointer"
                  onClick={() => setExpandedId(expandedId === site.id ? null : site.id)}
                >
                   <div className="col-span-1">
                     {site.type === 'talon' ? <Server size={18} className="text-blue-400" /> : <Layout size={18} className="text-yellow-500" />}
                   </div>
                   <div className="col-span-3 flex items-center space-x-3">
                      {expandedId === site.id ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                      <div>
                        <span className={`font-medium block ${expandedId === site.id ? "text-white" : "text-slate-300"}`}>{site.name}</span>
                        {site.bundle && <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 rounded border border-indigo-500/20">{site.bundle}</span>}
                      </div>
                   </div>
                   <div className="col-span-3 text-sm text-slate-400 flex items-center">
                      {site.linkedResource ? (
                        <span className="flex items-center text-xs bg-slate-900/50 px-2 py-1 rounded border border-slate-700">
                          <LinkIcon size={10} className="mr-1 opacity-50" />
                          {getLinkedSiteName(site.linkedResource, sites)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No Linkage</span>
                      )}
                   </div>
                   <div className="col-span-3 text-sm text-slate-400">
                     <span className="bg-slate-700/50 px-2 py-0.5 rounded text-xs">{site.vertical}</span>
                   </div>
                   <div className="col-span-2 flex justify-end">
                      <Badge status={site.status} />
                   </div>
                </div>

                {expandedId === site.id && (
                  <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50 ml-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div>
                             <div className="flex items-center text-xs text-slate-500 mb-1">
                               <Globe size={12} className="mr-1" /> {site.type === 'talon' ? 'API Host URL' : 'Space URL'}
                             </div>
                             <div className="text-sm text-slate-200 font-mono bg-slate-800 border border-slate-700 p-2 rounded truncate">
                               {site.url}
                             </div>
                          </div>
                          <div>
                             <div className="flex items-center text-xs text-slate-500 mb-1">
                               <Key size={12} className="mr-1" /> {site.type === 'talon' ? 'API Key' : 'Content Management Token'}
                             </div>
                             <div className="flex space-x-2">
                               <div className="text-sm text-slate-200 font-mono bg-slate-800 border border-slate-700 p-2 rounded flex-1 truncate">
                                 {site.apiKey}
                               </div>
                               <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300">
                                 <RefreshCw size={14} />
                               </button>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Capabilities</h4>
                            {site.type === 'talon' ? (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs border border-slate-600 text-slate-400 px-2 py-1 rounded">Promotion Engine</span>
                                <span className="text-xs border border-slate-600 text-slate-400 px-2 py-1 rounded">Loyalty</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs border border-yellow-600/50 text-yellow-500/80 px-2 py-1 rounded">CMS Branding</span>
                                <span className="text-xs border border-yellow-600/50 text-yellow-500/80 px-2 py-1 rounded">UI Components</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-3 mt-6">
                             <button className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 py-2 px-4 rounded text-sm font-medium transition-colors">
                               Edit Configuration
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); !protectedMode && showNotification("Instance deleted", "error"); }}
                                disabled={protectedMode}
                                className={`flex items-center justify-center px-4 py-2 rounded text-sm font-medium border transition-colors
                                  ${protectedMode 
                                    ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' 
                                    : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 cursor-pointer'}`}
                              >
                                {protectedMode ? <Lock size={14} className="mr-2" /> : <Trash2 size={14} className="mr-2" />}
                                Delete
                              </button>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           {/* Gigastores View */}
           {Object.entries(gigastores).map(([bundleName, bundleSites]) => (
             <div key={bundleName} className="bg-slate-800/50 rounded-xl border border-indigo-500/30 p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Store size={120} />
               </div>
               <div className="flex items-center mb-6 relative z-10">
                 <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-4 border border-indigo-500/30">
                   <Store size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">{bundleName}</h3>
                    <p className="text-xs text-indigo-300">Gigastore Bundle</p>
                 </div>
                 <div className="ml-auto flex space-x-2">
                   <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors">Launch Demo Store</button>
                   <button 
                     onClick={() => handleConfigureBundle(bundleName)}
                     className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
                   >
                     Configure Bundle
                   </button>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {bundleSites.map(site => (
                     <div key={site.id} className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 flex items-center justify-between group hover:border-slate-600 transition-colors">
                        <div className="flex items-center space-x-3">
                           {site.type === 'talon' ? <Server size={18} className="text-blue-400" /> : <Layout size={18} className="text-yellow-500" />}
                           <div>
                              <div className="text-sm font-medium text-slate-200">{site.name}</div>
                              <div className="text-[10px] text-slate-500">{site.url}</div>
                           </div>
                        </div>
                        <Badge status={site.status} />
                     </div>
                  ))}
               </div>
             </div>
           ))}

           {/* Unbundled Sites in Gigastore View */}
           {unbundledSites.length > 0 && (
             <div>
               <div className="flex items-center justify-between mb-4 pl-1">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Unassigned Instances</h3>
                 {selectedUnassigned.length > 0 && (
                   <button 
                     onClick={() => setShowCreateBundleModal(true)}
                     className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                   >
                     Create Bundle ({selectedUnassigned.length})
                   </button>
                 )}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {unbundledSites.map(site => (
                    <div 
                      key={site.id} 
                      className={`bg-slate-800 border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all ${selectedUnassigned.includes(site.id) ? 'border-indigo-500 bg-indigo-900/10' : 'border-slate-700 hover:border-slate-600'}`}
                      onClick={() => toggleUnassignedSelection(site.id)}
                    >
                        <div className="flex items-center space-x-3">
                           <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedUnassigned.includes(site.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                             {selectedUnassigned.includes(site.id) && <CheckCircle2 size={10} className="text-white" />}
                           </div>
                           {site.type === 'talon' ? <Server size={18} className="text-slate-500" /> : <Layout size={18} className="text-slate-500" />}
                           <div>
                              <div className="text-sm font-medium text-slate-300">{site.name}</div>
                              <div className="text-[10px] text-slate-600">{site.vertical}</div>
                           </div>
                        </div>
                        <div className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">Unbundled</div>
                     </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}

      {/* Configure Bundle Modal */}
      {showBundleModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-[500px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Store className="mr-2 text-indigo-400" size={20} /> Configure: {editingBundle}
              </h3>
              <button onClick={() => setShowBundleModal(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Instances in Bundle</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sites.filter(s => s.bundle === editingBundle).map(site => (
                    <div key={site.id} className="bg-indigo-500/10 border border-indigo-500/30 rounded p-3 flex justify-between items-center animate-in slide-in-from-left-2">
                      <div className="flex items-center">
                        {site.type === 'talon' ? <Server size={14} className="text-blue-400 mr-2" /> : <Layout size={14} className="text-yellow-500 mr-2" />}
                        <span className="text-sm text-white">{site.name}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromBundle(site.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Add Unassigned Instance</h4>
                <div className="flex space-x-2">
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                    value={selectedToAdd}
                    onChange={(e) => setSelectedToAdd(e.target.value)}
                  >
                    <option value="">Select an instance to add...</option>
                    {unbundledSites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                  </select>
                  <button 
                    onClick={handleAddToBundle}
                    disabled={!selectedToAdd}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setShowBundleModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Bundle Modal */}
      {showCreateBundleModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-[400px] shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Bundle</h3>
            <p className="text-sm text-slate-400 mb-4">Grouping {selectedUnassigned.length} instances into a new Gigastore.</p>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bundle Name</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-indigo-500 outline-none"
                placeholder="e.g. GS-New-Retail-Demo"
                value={newBundleName}
                onChange={(e) => setNewBundleName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowCreateBundleModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateBundleFromSelection}
                disabled={!newBundleName}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Instance Modal */}
      {showAddInstanceModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-[450px] shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Provision New Instance</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instance Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      className="mr-2"
                      checked={newInstance.type === 'talon'}
                      onChange={() => setNewInstance({...newInstance, type: 'talon'})}
                    />
                    <span className="text-sm text-white">Talon.One</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      className="mr-2"
                      checked={newInstance.type === 'contentful'}
                      onChange={() => setNewInstance({...newInstance, type: 'contentful'})}
                    />
                    <span className="text-sm text-white">Contentful</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  placeholder="e.g., Summer Campaign Staging"
                  value={newInstance.name}
                  onChange={(e) => setNewInstance({...newInstance, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  {newInstance.type === 'talon' ? 'Management API Endpoint' : 'Content Management API Endpoint'}
                </label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  placeholder="https://..."
                  value={newInstance.url}
                  onChange={(e) => setNewInstance({...newInstance, url: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key / Token</label>
                  <input 
                    type="password" 
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white font-mono"
                    placeholder="sk_..."
                    value={newInstance.apiKey}
                    onChange={(e) => setNewInstance({...newInstance, apiKey: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    {newInstance.type === 'talon' ? 'Application ID' : 'Space ID'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white font-mono"
                    placeholder="ID..."
                    value={newInstance.appId}
                    onChange={(e) => setNewInstance({...newInstance, appId: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vertical</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  value={newInstance.vertical}
                  onChange={(e) => setNewInstance({...newInstance, vertical: e.target.value})}
                >
                  <option>Retail</option>
                  <option>Gaming</option>
                  <option>FinTech</option>
                  <option>On-Demand</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowAddInstanceModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateInstance}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Create Instance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MigrationView = ({ sites, showNotification }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [mode, setMode] = useState('talon'); // 'talon', 'contentful', 'loyalty'
  const [showSchemaWarning, setShowSchemaWarning] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneStage, setCloneStage] = useState(''); // 'analyzing', 'schema', 'copying', 'done'

  // Cascading Selection Logic
  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const newState = { ...prev };
      const isSelected = !prev[item.id];
      newState[item.id] = isSelected;
      if (item.children) {
        const toggleChildren = (children) => {
          children.forEach(child => {
            newState[child.id] = isSelected;
            if (child.children) toggleChildren(child.children);
          });
        };
        toggleChildren(item.children);
      }
      return newState;
    });
  };

  const getAssetsToDisplay = () => {
    if (mode === 'talon') return MOCK_TALON_ASSETS;
    if (mode === 'contentful') return MOCK_CONTENTFUL_ASSETS;
    if (mode === 'loyalty') return MOCK_LOYALTY_ASSETS;
    return [];
  };

  const handleClone = () => {
    // Mock check for schema dependencies
    const hasRisk = Math.random() > 0.5; 
    
    setIsCloning(true);
    setCloneStage('analyzing');

    setTimeout(() => {
      if (hasRisk && mode !== 'contentful') {
        setIsCloning(false);
        setShowSchemaWarning(true);
      } else {
        startActualCloneProcess();
      }
    }, 1500);
  };

  const startActualCloneProcess = () => {
    setCloneStage('copying');
    setTimeout(() => {
      setIsCloning(false);
      setCloneStage('');
      showNotification(`${mode} Migration Complete!`, "success");
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Migration Hub</h2>
          <p className="text-slate-400 text-sm">Clone full ecosystems: Promotions, Loyalty, and CMS Content.</p>
        </div>
        <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex">
           <button 
             onClick={() => setMode('talon')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${mode === 'talon' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             <Server size={14} className="mr-2" /> Promotions
           </button>
           <button 
             onClick={() => setMode('loyalty')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${mode === 'loyalty' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             <Award size={14} className="mr-2" /> Loyalty
           </button>
           <button 
             onClick={() => setMode('contentful')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${mode === 'contentful' ? 'bg-yellow-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             <Layout size={14} className="mr-2" /> Content
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Source Column */}
        <div className="col-span-5 flex flex-col gap-4">
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Source Environment</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {sites.filter(s => mode === 'contentful' ? s.type === 'contentful' : s.type === 'talon').map(s => <option key={s.id}>{s.name}</option>)}
              </select>
           </div>
           
           <div className="bg-slate-800 rounded-xl border border-slate-700 flex-1 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-700 bg-slate-800/50">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Filter assets..." className="w-full bg-slate-900 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                 {getAssetsToDisplay().map((rootItem) => (
                   <div key={rootItem.id} className="mb-2">
                     <div className="flex items-center p-2 hover:bg-slate-700/50 rounded cursor-pointer group" onClick={() => toggleItem(rootItem)}>
                        <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors ${selectedItems[rootItem.id] ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                          {selectedItems[rootItem.id] && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        {mode === 'talon' ? <Folder size={16} className="text-blue-400 mr-2" /> : mode === 'loyalty' ? <Award size={16} className="text-pink-400 mr-2" /> : <Type size={16} className="text-yellow-400 mr-2" />}
                        <span className="text-sm text-slate-200 font-medium">{rootItem.name}</span>
                        <span className="ml-auto text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600">{rootItem.type}</span>
                     </div>
                     
                     {/* Children */}
                     <div className="ml-6 border-l border-slate-700 pl-2 mt-1 space-y-1">
                        {rootItem.children && rootItem.children.map(child => (
                          <div key={child.id}>
                            <div className="flex items-center p-1.5 hover:bg-slate-700/50 rounded cursor-pointer" onClick={() => toggleItem(child)}>
                              <div className={`w-3 h-3 rounded border mr-3 flex items-center justify-center transition-colors ${selectedItems[child.id] ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}></div>
                              <span className="text-xs text-slate-300">{child.name}</span>
                              <span className="ml-auto text-[9px] bg-slate-700/50 text-slate-500 px-1 py-0.5 rounded">{child.type}</span>
                            </div>
                          </div>
                        ))}
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Action Column */}
        <div className="col-span-2 flex flex-col justify-center items-center space-y-4">
          <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-slate-700 to-transparent absolute left-1/2 -z-10 hidden md:block" />
          
          <div className="bg-slate-800 p-4 rounded-full border border-slate-700 shadow-xl z-10 relative">
            {isCloning ? (
               <Loader2 className="animate-spin text-white" size={24} />
            ) : (
               <ArrowRightLeft size={24} className={mode === 'talon' ? "text-blue-400 animate-pulse" : mode === 'loyalty' ? "text-pink-400 animate-pulse" : "text-yellow-400 animate-pulse"} />
            )}
          </div>
          
          <button 
            onClick={handleClone}
            disabled={isCloning}
            className={`w-full text-white p-3 rounded-lg shadow-lg transition-all active:scale-95 flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed
              ${mode === 'talon' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 
                mode === 'loyalty' ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-900/20' : 
                'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20'}`}
          >
            <span className="font-bold text-sm">{isCloning ? 'Processing...' : 'Clone Selected'}</span>
            <span className="text-[10px] opacity-80">
              {Object.values(selectedItems).filter(Boolean).length} Assets Selected
            </span>
          </button>
          
          {isCloning && (
            <div className="text-center">
               <span className="text-xs font-mono text-emerald-400 animate-pulse">
                 {cloneStage === 'analyzing' && 'Analyzing Dependencies...'}
                 {cloneStage === 'copying' && 'Migrating Objects...'}
               </span>
            </div>
          )}

          <div className="text-center px-2">
            <p className="text-xs text-slate-500 mb-2">Options</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center text-xs text-slate-400 cursor-pointer hover:text-white">
                <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-800" defaultChecked />
                Overwrite Existing
              </label>
              <label className="flex items-center text-xs text-slate-400 cursor-pointer hover:text-white">
                <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-800" defaultChecked />
                Publish Immediately
              </label>
            </div>
          </div>
        </div>

        {/* Destination Column */}
        <div className="col-span-5 flex flex-col gap-4">
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Destination Environment</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                 {sites.filter(s => (mode === 'contentful' ? s.type === 'contentful' : s.type === 'talon') && !s.name.includes('Prod')).map(s => <option key={s.id}>{s.name}</option>)}
              </select>
           </div>
           
           <div className="bg-slate-800 rounded-xl border border-slate-700 flex-1 flex items-center justify-center border-dashed border-2 border-slate-700/50 bg-slate-800/30">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Copy size={24} />
                </div>
                <h4 className="text-slate-300 font-medium">Ready to Receive</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto">Selected assets will be cloned here. Existing items with same IDs may be overwritten.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Schema Warning Modal */}
      {showSchemaWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-red-500/50 rounded-xl p-6 w-[450px] shadow-2xl">
            <div className="flex items-start mb-4">
              <div className="bg-red-500/10 p-3 rounded-full mr-4">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Missing Attributes Detected</h3>
                <p className="text-sm text-slate-400 mt-1">
                  The assets you are cloning rely on Attributes that do not exist on the Destination environment. This will cause the migration to fail.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded p-3 mb-6 border border-slate-700">
              <div className="text-xs font-mono text-red-400">Missing: CartItem.ShoeSize</div>
              <div className="text-xs font-mono text-red-400">Missing: CustomerProfile.IsVIP</div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setShowSchemaWarning(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowSchemaWarning(false);
                  startActualCloneProcess();
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center"
              >
                <RefreshCw size={14} className="mr-2" /> Sync & Clone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BackupView = ({ backups, protectedMode, sites, showNotification, setBackups }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(sites.length > 0 ? sites[0].id : "");
  const [activeVertical, setActiveVertical] = useState(Object.keys(backups)[0]);
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  // Update selected site if sites changes and current selection is invalid
  useEffect(() => {
    if (sites.length > 0 && (!selectedSite || !sites.find(s => s.id == selectedSite))) {
      setSelectedSite(sites[0].id);
    }
  }, [sites]);

  const handleAddGroup = () => {
    if (newGroupName && !backups[newGroupName]) {
      const updated = { ...backups, [newGroupName]: [] };
      if (setBackups) setBackups(updated);
      setActiveVertical(newGroupName);
      setIsAddingGroup(false);
      setNewGroupName("");
    }
  };

  const handleCreateSnapshot = () => {
    // Determine type based on selectedSite
    const siteObj = sites.find(s => s.id == selectedSite);
    const type = siteObj ? siteObj.type : 'talon';
    
    const newFile = {
      id: `bk-${Date.now()}`,
      type: type,
      name: `${siteObj?.name.replace(/\s+/g, '-')}-Snapshot.json`,
      date: new Date().toISOString().split('T')[0],
      size: '2.4 MB'
    };

    const updatedBackups = {
      ...backups,
      [activeVertical]: [newFile, ...backups[activeVertical]]
    };
    
    if (setBackups) setBackups(updatedBackups);
    setShowModal(false);
    showNotification("Snapshot created successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Backup Vault</h2>
          <p className="text-slate-400 text-sm">Snapshots organized by vertical hierarchy.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <Archive size={16} className="mr-2" /> Create Snapshot
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[500px]">
        {/* Sidebar Folders */}
        <div className="col-span-3 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Verticals</h3>
          <div className="space-y-1">
            {Object.keys(backups).map(vertical => (
              <button 
                key={vertical} 
                onClick={() => setActiveVertical(vertical)}
                className={`w-full flex items-center p-2 rounded transition-colors text-left group ${activeVertical === vertical ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'hover:bg-slate-700/50 text-slate-300 hover:text-white border border-transparent'}`}
              >
                <Folder size={16} className={`mr-2 ${activeVertical === vertical ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className="text-sm font-medium">{vertical}</span>
                <span className="ml-auto text-xs bg-slate-900 text-slate-500 px-1.5 rounded">{backups[vertical].length}</span>
              </button>
            ))}
            
            {isAddingGroup ? (
              <div className="mt-2 flex items-center">
                <input 
                  autoFocus
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-600 rounded text-xs p-1.5 text-white focus:border-blue-500 outline-none"
                  placeholder="Group Name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                  onBlur={() => setIsAddingGroup(false)}
                />
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingGroup(true)}
                className="w-full flex items-center p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors text-left mt-4 border-t border-slate-700/50 pt-3"
              >
                <Plus size={14} className="mr-2" />
                <span className="text-xs font-medium">Add Vertical Group</span>
              </button>
            )}
          </div>
        </div>

        {/* File Browser */}
        <div className="col-span-9 bg-slate-800 rounded-xl border border-slate-700/50 p-6 flex flex-col">
           <h3 className="text-sm font-medium text-white mb-4 flex items-center">
             <span className="text-slate-500 font-normal mr-2">Root /</span> {activeVertical}
           </h3>
           
           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left text-sm text-slate-400">
               <thead className="bg-slate-900/50 text-xs uppercase font-semibold text-slate-500">
                 <tr>
                   <th className="px-4 py-3 rounded-l-lg">Filename</th>
                   <th className="px-4 py-3">Type</th>
                   <th className="px-4 py-3">Date Created</th>
                   <th className="px-4 py-3">Size</th>
                   <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50">
                 {backups[activeVertical] && backups[activeVertical].length > 0 ? (
                   backups[activeVertical].map(file => (
                     <tr key={file.id} className="group hover:bg-slate-700/20 transition-colors">
                       <td className="px-4 py-3 font-medium text-slate-200 flex items-center">
                         {file.type === 'talon' ? <FileJson size={16} className="mr-3 text-emerald-500" /> : <Layout size={16} className="mr-3 text-yellow-500" />}
                         {file.name}
                       </td>
                       <td className="px-4 py-3">
                         <span className={`text-[10px] px-1.5 py-0.5 rounded border ${file.type === 'talon' ? 'border-emerald-500/30 text-emerald-400' : 'border-yellow-500/30 text-yellow-400'}`}>
                           {file.type.toUpperCase()}
                         </span>
                       </td>
                       <td className="px-4 py-3">{file.date}</td>
                       <td className="px-4 py-3 font-mono text-xs">{file.size}</td>
                       <td className="px-4 py-3 text-right">
                         <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-1 hover:bg-slate-700 rounded text-blue-400" title="Restore">
                             <RefreshCw size={14} />
                           </button>
                           <button 
                             disabled={protectedMode}
                             className={`p-1 rounded ${protectedMode ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-red-500/20 text-red-400 cursor-pointer'}`}
                             title="Delete"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan="5" className="text-center py-12 text-slate-600">
                       No backups found in this folder.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Snapshot Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Archive className="mr-2 text-emerald-400" size={20} /> New Snapshot
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Instance</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                >
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Scope</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-emerald-500/30 bg-emerald-500/10 rounded-lg cursor-pointer">
                    <input type="radio" name="scope" className="text-emerald-500 focus:ring-emerald-500" defaultChecked />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-white">Full Instance Backup</span>
                      <span className="block text-xs text-slate-400">Includes all rules, branding, and assets.</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-slate-700 bg-slate-900/50 rounded-lg cursor-pointer opacity-70">
                     <input type="radio" name="scope" className="text-emerald-500" />
                     <div className="ml-3">
                       <span className="block text-sm font-medium text-slate-300">Partial Archive</span>
                       <span className="block text-xs text-slate-500">Select specific apps or content types.</span>
                     </div>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleCreateSnapshot}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg mt-2 transition-colors"
              >
                Generate Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LoyaltyView = ({ sites }) => {
  const [selectedInstance, setSelectedInstance] = useState(sites.find(s => s.type === 'talon')?.id || "");
  const [editingProgram, setEditingProgram] = useState(null);

  useEffect(() => {
    if (sites.length > 0 && !selectedInstance) {
      setSelectedInstance(sites.find(s => s.type === 'talon')?.id || "");
    }
  }, [sites]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Loyalty Hub</h2>
          <p className="text-slate-400 text-sm">Manage Programs, Tiers, and Point Currencies.</p>
        </div>
        <button className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
          <Plus size={16} className="mr-2" /> New Program
        </button>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Select Instance</label>
         <select 
           className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
           value={selectedInstance}
           onChange={(e) => setSelectedInstance(Number(e.target.value))}
         >
           {sites.filter(s => s.type === 'talon').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
         </select>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className={`transition-all duration-300 ${editingProgram ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_LOYALTY_ASSETS.map(prog => (
              <Card key={prog.id} className="border-t-4 border-t-pink-500 cursor-pointer hover:border-pink-400 transition-colors">
                  <div className="flex justify-between items-start mb-4" onClick={() => setEditingProgram(prog)}>
                    <div>
                      <h3 className="text-xl font-bold text-white">{prog.name}</h3>
                      <span className="text-xs text-slate-400">ID: {prog.id}</span>
                    </div>
                    <div className="bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full text-xs font-bold border border-pink-500/20">
                      Active
                    </div>
                  </div>
                  
                  <div className="space-y-4" onClick={() => setEditingProgram(prog)}>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Structure</div>
                      <div className="flex flex-wrap gap-2">
                        {prog.children.filter(c => c.type === 'Tier').map(tier => (
                          <span key={tier.id} className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs border border-slate-600">
                            {tier.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                        <div className="text-xs text-slate-500">
                          {prog.children.length} Components
                        </div>
                        <button className="text-sm text-pink-400 hover:text-pink-300 font-medium">Edit Program &rarr;</button>
                    </div>
                  </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Edit Overlay */}
        {editingProgram && (
          <div className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 flex flex-col animate-in slide-in-from-right-10">
             <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Award className="mr-2 text-pink-500" />
                    {editingProgram.name}
                  </h3>
                  <p className="text-xs text-slate-400">Program Configuration</p>
                </div>
                <button onClick={() => setEditingProgram(null)} className="text-slate-400 hover:text-white p-2">
                  <X size={24} />
                </button>
             </div>
             <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                      <h4 className="text-sm font-bold text-slate-300 mb-4 uppercase">Tiers</h4>
                      <div className="space-y-3">
                        {editingProgram.children.filter(c => c.type === 'Tier').map(tier => (
                          <div key={tier.id} className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700">
                             <span className="text-sm text-white font-medium">{tier.name}</span>
                             <div className="flex items-center space-x-2">
                               <input type="text" className="bg-slate-900 border border-slate-600 rounded w-20 text-xs p-1 text-center" placeholder="Min Pts" />
                               <button className="text-xs text-pink-400">Edit Rules</button>
                             </div>
                          </div>
                        ))}
                        <button className="w-full py-2 border border-dashed border-slate-600 text-slate-500 rounded text-xs hover:text-white hover:border-slate-500">
                          + Add Tier
                        </button>
                      </div>
                   </div>
                   
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                      <h4 className="text-sm font-bold text-slate-300 mb-4 uppercase">Sub-Ledgers (Point Buckets)</h4>
                      <div className="flex gap-2">
                         <span className="bg-pink-900/30 text-pink-300 border border-pink-500/30 px-3 py-1 rounded text-xs">Paid Points</span>
                         <span className="bg-pink-900/30 text-pink-300 border border-pink-500/30 px-3 py-1 rounded text-xs">Pending</span>
                         <span className="bg-slate-800 text-slate-500 border border-slate-600 px-3 py-1 rounded text-xs border-dashed cursor-pointer hover:text-white">+ Add</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="p-6 border-t border-slate-700 bg-slate-800/80">
                <button 
                  onClick={() => setEditingProgram(null)}
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg font-medium"
                >
                  Save Program
                </button>
             </div>
          </div>
        )}
      </div>
  </div>
  );
};

const SimulatorView = ({ showNotification }) => {
  const [response, setResponse] = useState(null);

  const runSimulation = () => {
    setResponse({
       effects: [
         { type: 'setDiscount', rule: '20% Off Electronics', payload: '20% off applied to item: Sony Headphones' },
         { type: 'addLoyaltyPoints', rule: 'VIP Bonus', payload: 'Added 50 GoldPoints' }
       ],
       state: 'closed'
    });
    showNotification("Simulation executed successfully", "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Talon Tester (Simulator)</h2>
          <p className="text-slate-400 text-sm">Dry-run API calls to verify Rule logic without a frontend.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
         <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
               <h3 className="font-bold text-slate-300 text-sm">Customer Session Payload</h3>
               <span className="text-xs text-slate-500 font-mono">PUT /v2/customer_sessions/session-123</span>
            </div>
            <div className="p-4 flex-1 font-mono text-xs text-blue-300 overflow-y-auto bg-[#0f172a]">
              <pre>{`{
  "customerSession": {
    "profileId": "demo-user-1",
    "cartItems": [
      {
        "name": "Sony Headphones",
        "sku": "sony-xm4",
        "quantity": 1,
        "price": 350.00,
        "category": "Electronics"
      },
      {
        "name": "Nike Air Max",
        "sku": "nike-am-90",
        "quantity": 1,
        "price": 120.00,
        "category": "Shoes"
      }
    ],
    "coupon": "VIP-2024",
    "total": 470.00,
    "attributes": {
       "ShippingCountry": "US"
    }
  }
}`}</pre>
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800">
               <button 
                 onClick={runSimulation}
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 flex justify-center items-center"
               >
                 <PlayCircle size={18} className="mr-2" /> Send Request
               </button>
            </div>
         </div>

         <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
               <h3 className="font-bold text-slate-300 text-sm">API Response (Effects)</h3>
               <div className="flex space-x-2">
                 <span className="w-3 h-3 rounded-full bg-green-500"></span>
                 <span className="text-xs text-green-500 font-bold">200 OK</span>
               </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto bg-[#0f172a] relative">
               {!response ? (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
                   Waiting for request...
                 </div>
               ) : (
                 <div className="space-y-4">
                    {response.effects.map((effect, idx) => (
                      <div key={idx} className="bg-slate-800/50 border-l-4 border-emerald-500 p-3 rounded-r">
                         <div className="flex justify-between mb-1">
                           <span className="text-xs font-bold text-emerald-400">{effect.type}</span>
                           <span className="text-[10px] text-slate-500">{effect.rule}</span>
                         </div>
                         <p className="text-sm text-slate-300">{effect.payload}</p>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-slate-800">
                       <pre className="text-xs text-slate-500 font-mono">{JSON.stringify(response, null, 2)}</pre>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Main Application ---

interface TalonForgeAppProps {
  user: any;
  onLogout: () => void;
}

export default function TalonForgeApp({ user, onLogout }: TalonForgeAppProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [protectedMode, setProtectedMode] = useState(true);
  const [sites, setSites] = useState([]); // Will load from backend
  const [backups, setBackups] = useState(INITIAL_BACKUPS);
  const [notification, setNotification] = useState(null);
  const [aiConfig, setAiConfig] = useState(DEFAULT_AI_CONFIG);

  // Load instances from backend
  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/instances`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSites(data.data || []);
      } else {
        console.error('Failed to fetch instances:', response.status);
      }
    } catch (error) {
      console.error('Failed to load instances:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    onLogout();
  };

  const currentUser = {
    name: user?.email || 'User',
    role: user?.role || 'Admin',
    avatar: (user?.email?.[0] || 'U').toUpperCase() + (user?.email?.[1] || 'S').toUpperCase()
  };

  return (
    <div className="flex h-screen bg-[#0f172a] font-sans text-slate-200 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center space-x-3">
           <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
             <Server className="text-white" size={18} />
           </div>
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
             TalonForge
           </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Server} 
            label="Instance Manager" 
            active={activeTab === 'sites'} 
            onClick={() => setActiveTab('sites')} 
          />
          <SidebarItem 
            icon={ArrowRightLeft} 
            label="Migration & Cloning" 
            active={activeTab === 'migration'} 
            onClick={() => setActiveTab('migration')} 
          />
          <SidebarItem 
            icon={Archive} 
            label="Backup Vault" 
            active={activeTab === 'backups'} 
            onClick={() => setActiveTab('backups')} 
          />
          <SidebarItem 
            icon={Database} 
            label="Schema Sync" 
            active={activeTab === 'schema'} 
            onClick={() => setActiveTab('schema')} 
          />
          <SidebarItem 
            icon={Award} 
            label="Loyalty Hub" 
            active={activeTab === 'loyalty'} 
            onClick={() => setActiveTab('loyalty')} 
          />
          <SidebarItem 
            icon={PlayCircle} 
            label="Talon Tester" 
            active={activeTab === 'simulator'} 
            onClick={() => setActiveTab('simulator')} 
          />
          <SidebarItem 
            icon={BrainCircuit} 
            label="AI Rule Architect" 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
          />
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
           {activeTab === 'dashboard' && <DashboardView sites={sites} setActiveTab={setActiveTab} user={currentUser} />}
           
           {/* Passing setSites to allow local changes in InstanceManager */}
           {activeTab === 'sites' && <InstanceManagerView sites={sites} protectedMode={protectedMode} showNotification={showNotification} setSites={setSites} />}
           
           {activeTab === 'migration' && <MigrationView sites={sites} showNotification={showNotification} />}
           {activeTab === 'backups' && <BackupView backups={backups} protectedMode={protectedMode} sites={sites} showNotification={showNotification} setBackups={setBackups} />}
           {activeTab === 'schema' && <SchemaManagerView sites={sites} showNotification={showNotification} />}
           {activeTab === 'loyalty' && <LoyaltyView sites={sites} />}
           {activeTab === 'simulator' && <SimulatorView showNotification={showNotification} />}
           
           {/* Passing aiConfig to AI View */}
           {activeTab === 'ai' && <AIArchitectView sites={sites} showNotification={showNotification} aiConfig={aiConfig} />}
           
           {/* Passing aiConfig setters to Admin View */}
           {activeTab === 'admin' && (
             <AdminView 
               protectedMode={protectedMode} 
               setProtectedMode={setProtectedMode} 
               showNotification={showNotification} 
               aiConfig={aiConfig}
               setAiConfig={setAiConfig}
             />
           )}
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
}