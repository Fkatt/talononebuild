// Shared Badge Component for status indicators

import React from 'react';

type BadgeStatus = 'online' | 'offline' | 'maintenance' | 'synced' | 'missing_dest';

interface BadgeProps {
  status: BadgeStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles = {
    online: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    offline: 'bg-red-500/10 text-red-400 border-red-500/20',
    synced: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    missing_dest: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  let label: string = status;
  if (status === 'missing_dest') label = 'Missing in Dest' as any;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${
        styles[status] || styles.offline
      } flex items-center gap-1`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status.includes('missing') || status === 'offline' ? 'bg-red-400' : 'bg-emerald-400'
        }`}
      ></span>
      {label}
    </span>
  );
};

export default Badge;
