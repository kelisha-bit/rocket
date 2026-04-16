'use client';

import React from 'react';
import { Users, Calendar, Award } from 'lucide-react';

interface Ministry {
  id: string;
  name: string;
  role: string;
  joinedDate: string;
  status: 'active' | 'inactive';
}

interface MinistryInvolvementProps {
  ministries?: Ministry[];
}

export default function MinistryInvolvement({ ministries }: MinistryInvolvementProps) {
  // Mock ministries if none provided
  const defaultMinistries: Ministry[] = [
    {
      id: '1',
      name: 'Worship Team',
      role: 'Lead Vocalist',
      joinedDate: '2020-03-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Finance Committee',
      role: 'Member',
      joinedDate: '2021-01-10',
      status: 'active',
    },
    {
      id: '3',
      name: 'Youth Ministry',
      role: 'Mentor',
      joinedDate: '2019-09-01',
      status: 'active',
    },
  ];

  const displayMinistries = ministries || defaultMinistries;

  return (
    <div className="bg-white rounded-xl shadow border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Ministry Involvement</h2>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {displayMinistries.filter(m => m.status === 'active').length} Active
        </span>
      </div>

      <div className="space-y-3">
        {displayMinistries.map((ministry) => (
          <div
            key={ministry.id}
            className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{ministry.name}</h3>
                    {ministry.status === 'active' && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{ministry.role}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>Since {new Date(ministry.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
        + Join a Ministry
      </button>
    </div>
  );
}
