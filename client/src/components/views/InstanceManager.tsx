// Instance Manager View Component

import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Badge } from '../shared/Badge';
import { Plus, Server, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import {
  useInstances,
  useCreateInstance,
  useDeleteInstance,
  useTestConnection,
} from '../../hooks/useInstances';
import { useNotification } from '../../context/NotificationContext';

export const InstanceManager: React.FC = () => {
  const { data: instances, isLoading } = useInstances();
  const createInstance = useCreateInstance();
  const deleteInstance = useDeleteInstance();
  const testConnection = useTestConnection();
  const { addNotification } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'talon' as 'talon' | 'contentful',
    region: '',
    url: '',
    apiKey: '',
  });

  const handleTestConnection = async () => {
    try {
      const response = await testConnection.mutateAsync({
        type: formData.type,
        url: formData.url,
        credentials: { apiKey: formData.apiKey },
      });

      setConnectionTestResult(response.data);

      if (response.data.success) {
        addNotification('success', 'Connection test successful!');
      } else {
        addNotification('error', response.data.error || 'Connection test failed');
      }
    } catch (error) {
      addNotification('error', 'Connection test failed');
      setConnectionTestResult({ success: false, error: 'Connection test failed' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createInstance.mutateAsync({
        name: formData.name,
        type: formData.type,
        region: formData.region,
        url: formData.url,
        credentials: { apiKey: formData.apiKey },
      });

      addNotification('success', 'Instance created successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', type: 'talon', region: '', url: '', apiKey: '' });
      setConnectionTestResult(null);
    } catch (error) {
      addNotification('error', 'Failed to create instance');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this instance?')) {
      try {
        await deleteInstance.mutateAsync(id);
        addNotification('success', 'Instance deleted successfully!');
      } catch (error) {
        addNotification('error', 'Failed to delete instance');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Loading instances...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Instance Manager</h1>
        <Button icon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
          Add Instance
        </Button>
      </div>

      {/* Instances List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances?.map((instance: any) => (
          <Card key={instance.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Server className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{instance.name}</h3>
                  <p className="text-xs text-slate-400">{instance.type}</p>
                </div>
              </div>
              <Badge status="online" />
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-slate-400">
                <span className="text-slate-500">Region:</span> {instance.region}
              </p>
              <p className="text-sm text-slate-400 truncate">
                <span className="text-slate-500">URL:</span> {instance.url}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1">
                <Edit2 size={16} />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(instance.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}

        {instances?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400">No instances configured yet.</p>
            <Button
              className="mt-4"
              icon={<Plus size={20} />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Your First Instance
            </Button>
          </div>
        )}
      </div>

      {/* Add Instance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setConnectionTestResult(null);
        }}
        title="Add New Instance"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'talon' | 'contentful' })
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="talon">Talon.One</option>
              <option value="contentful">Contentful</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Region</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Connection Test Button */}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleTestConnection}
            loading={testConnection.isPending}
          >
            Test Connection
          </Button>

          {/* Connection Test Result */}
          {connectionTestResult && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                connectionTestResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              {connectionTestResult.success ? (
                <>
                  <CheckCircle className="text-emerald-400" size={20} />
                  <span className="text-emerald-400 text-sm">Connection successful!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-400" size={20} />
                  <span className="text-red-400 text-sm">
                    {connectionTestResult.error || 'Connection failed'}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                setConnectionTestResult(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={createInstance.isPending}
              disabled={!connectionTestResult?.success}
            >
              Create Instance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InstanceManager;
