'use client';

import React, { useState } from 'react';
import { 
  Download, Upload, RefreshCw, Trash2, Calendar, 
  Database, Shield, AlertTriangle, CheckCircle2, 
  Clock, FileText, Archive, HardDrive 
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'auto' | 'manual';
  status: 'completed' | 'in-progress' | 'failed';
}

const mockBackups: BackupFile[] = [
  {
    id: 'backup-1',
    name: 'church-data-2026-04-15-auto.zip',
    size: '2.4 MB',
    date: '2026-04-15 03:00 AM',
    type: 'auto',
    status: 'completed'
  },
  {
    id: 'backup-2',
    name: 'church-data-2026-04-14-manual.zip',
    size: '2.3 MB',
    date: '2026-04-14 10:30 AM',
    type: 'manual',
    status: 'completed'
  },
  {
    id: 'backup-3',
    name: 'church-data-2026-04-13-auto.zip',
    size: '2.2 MB',
    date: '2026-04-13 03:00 AM',
    type: 'auto',
    status: 'completed'
  },
  {
    id: 'backup-4',
    name: 'church-data-2026-04-12-auto.zip',
    size: '2.1 MB',
    date: '2026-04-12 03:00 AM',
    type: 'auto',
    status: 'failed'
  }
];

export default function BackupManager() {
  const [backups, setBackups] = useState<BackupFile[]>(mockBackups);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedBackups, setSelectedBackups] = useState<Set<string>>(new Set());

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    
    // Simulate backup creation
    setTimeout(() => {
      const newBackup: BackupFile = {
        id: `backup-${Date.now()}`,
        name: `church-data-${new Date().toISOString().split('T')[0]}-manual.zip`,
        size: '2.5 MB',
        date: new Date().toLocaleString(),
        type: 'manual',
        status: 'completed'
      };
      
      setBackups(prev => [newBackup, ...prev]);
      setIsCreatingBackup(false);
      toast.success('Backup created successfully');
    }, 3000);
    
    toast.info('Creating backup...', { description: 'This may take a few minutes' });
  };

  const handleDownloadBackup = (backup: BackupFile) => {
    toast.success('Download started', { description: `Downloading ${backup.name}` });
    // Simulate download
  };

  const handleDeleteBackup = (backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId));
    toast.success('Backup deleted');
  };

  const handleBulkDelete = () => {
    setBackups(prev => prev.filter(b => !selectedBackups.has(b.id)));
    setSelectedBackups(new Set());
    toast.success(`${selectedBackups.size} backup(s) deleted`);
  };

  const toggleSelectBackup = (backupId: string) => {
    setSelectedBackups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(backupId)) {
        newSet.delete(backupId);
      } else {
        newSet.add(backupId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: BackupFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'in-progress':
        return <RefreshCw size={16} className="text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle size={16} className="text-red-600" />;
    }
  };

  const getTypeIcon = (type: BackupFile['type']) => {
    return type === 'auto' ? (
      <Clock size={14} className="text-blue-600" />
    ) : (
      <FileText size={14} className="text-green-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="flex items-center justify-center gap-3 p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingBackup ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <Archive size={20} />
          )}
          <div className="text-left">
            <p className="font-semibold">Create Backup</p>
            <p className="text-sm opacity-90">Manual backup now</p>
          </div>
        </button>

        <button className="flex items-center justify-center gap-3 p-4 bg-white border border-border rounded-xl hover:bg-muted transition-colors">
          <Upload size={20} className="text-muted-foreground" />
          <div className="text-left">
            <p className="font-semibold text-foreground">Restore Backup</p>
            <p className="text-sm text-muted-foreground">Upload & restore</p>
          </div>
        </button>

        <button className="flex items-center justify-center gap-3 p-4 bg-white border border-border rounded-xl hover:bg-muted transition-colors">
          <HardDrive size={20} className="text-muted-foreground" />
          <div className="text-left">
            <p className="font-semibold text-foreground">Storage Info</p>
            <p className="text-sm text-muted-foreground">12.5 MB used</p>
          </div>
        </button>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-800">Successful</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {backups.filter(b => b.status === 'completed').length}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-sm font-semibold text-red-800">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-900">
            {backups.filter(b => b.status === 'failed').length}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Auto Backups</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {backups.filter(b => b.type === 'auto').length}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Total Size</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">12.5 MB</p>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Backup History</h3>
            {selectedBackups.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
                Delete Selected ({selectedBackups.size})
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {backups.map(backup => (
            <div
              key={backup.id}
              className={`px-6 py-4 hover:bg-muted/40 transition-colors ${
                selectedBackups.has(backup.id) ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedBackups.has(backup.id)}
                    onChange={() => toggleSelectBackup(backup.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  
                  <div className="flex items-center gap-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">
                          {backup.name}
                        </p>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(backup.type)}
                          <span className="text-xs text-muted-foreground capitalize">
                            {backup.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{backup.size}</span>
                        <span>{backup.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {backup.status === 'completed' && (
                    <button
                      onClick={() => handleDownloadBackup(backup)}
                      className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Schedule Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Calendar size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-1">Automatic Backup Schedule</h4>
            <p className="text-sm text-blue-700 mb-2">
              Backups are automatically created daily at 3:00 AM and retained for 30 days.
            </p>
            <p className="text-xs text-blue-600">
              Next backup: Tomorrow at 3:00 AM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}