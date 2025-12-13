// Sidebar Navigation Component

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  alert?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
  alert,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${
        active
          ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
  >
    <Icon
      size={20}
      className={active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}
    />
    <span className="font-medium text-sm">{label}</span>
    {alert && <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
  </button>
);

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  items: Array<{
    id: string;
    icon: LucideIcon;
    label: string;
    alert?: boolean;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, items }) => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">TalonForge</h1>
        <p className="text-xs text-slate-400 mt-1">v3.0 Enterprise</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeView === item.id}
            onClick={() => onViewChange(item.id)}
            alert={item.alert}
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
