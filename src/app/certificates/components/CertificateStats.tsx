'use client';

import React from 'react';
import { 
  Award, 
  FileText, 
  Users, 
  TrendingUp,
  Droplets,
  Heart,
  BookOpen,
  Crown,
  Star,
  Ban
} from 'lucide-react';

interface CertificateStatsProps {
  stats: {
    total_certificates: number;
    active_certificates: number;
    revoked_certificates: number;
    expired_certificates: number;
    baptism_certificates: number;
    membership_certificates: number;
    achievement_certificates: number;
    appreciation_certificates: number;
    completion_certificates: number;
    ordination_certificates: number;
    leadership_certificates: number;
    issued_last_30_days: number;
    issued_last_90_days: number;
  };
}

export default function CertificateStats({ stats }: CertificateStatsProps) {
  const cards = [
    { 
      label: 'Total Certificates', 
      value: stats.total_certificates, 
      icon: Award, 
      color: 'bg-blue-500',
      description: 'All time issued'
    },
    { 
      label: 'Active', 
      value: stats.active_certificates, 
      icon: FileText, 
      color: 'bg-green-500',
      description: 'Currently valid'
    },
    { 
      label: 'Issued (30 days)', 
      value: stats.issued_last_30_days, 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      description: 'Recent issuances'
    },
    { 
      label: 'Revoked', 
      value: stats.revoked_certificates, 
      icon: Ban, 
      color: 'bg-red-500',
      description: 'Invalidated'
    },
  ];

  const typeBreakdown = [
    { label: 'Membership', value: stats.membership_certificates, icon: Users, color: 'text-blue-600' },
    { label: 'Baptism', value: stats.baptism_certificates, icon: Droplets, color: 'text-cyan-600' },
    { label: 'Achievement', value: stats.achievement_certificates, icon: Award, color: 'text-amber-600' },
    { label: 'Appreciation', value: stats.appreciation_certificates, icon: Heart, color: 'text-pink-600' },
    { label: 'Completion', value: stats.completion_certificates, icon: BookOpen, color: 'text-emerald-600' },
    { label: 'Ordination', value: stats.ordination_certificates, icon: Crown, color: 'text-violet-600' },
    { label: 'Leadership', value: stats.leadership_certificates, icon: Star, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl border border-border shadow-card p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{card.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
              </div>
              <div className={`${card.color} text-white p-2.5 rounded-lg`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Type Breakdown */}
      <div className="bg-white rounded-xl border border-border shadow-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Certificate Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {typeBreakdown.map((type, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <type.icon size={16} className={type.color} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
