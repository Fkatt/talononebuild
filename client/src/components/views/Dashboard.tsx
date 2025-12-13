// Dashboard View Component

import React from 'react';
import { Card } from '../shared/Card';
import { Server, Archive, Activity } from 'lucide-react';
import { useInstances } from '../../hooks/useInstances';

export const Dashboard: React.FC = () => {
  const { data: instances, isLoading } = useInstances();

  const stats = {
    totalInstances: instances?.length || 0,
    onlineInstances: instances?.filter((i: any) => i.status === 'online').length || 0,
    backups: 0,
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Server className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Instances</p>
              <p className="text-2xl font-bold text-white">{stats.totalInstances}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Activity className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Online</p>
              <p className="text-2xl font-bold text-white">{stats.onlineInstances}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Archive className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Backups</p>
              <p className="text-2xl font-bold text-white">{stats.backups}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <p className="text-slate-400">No recent activity to display.</p>
      </Card>
    </div>
  );
};

export default Dashboard;
