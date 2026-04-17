'use client';

import React, { useEffect, useState } from 'react';
import { Users, Calendar, Award } from 'lucide-react';
import { fetchMemberMinistries, Ministry as DBMinistry } from '@/lib/supabase/ministries';

interface MinistryInvolvementProps {
  userId?: string;
}

export default function MinistryInvolvement({ userId }: MinistryInvolvementProps) {
  const [ministries, setMinistries] = useState<DBMinistry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMemberMinistries(userId);
        if (!cancelled) setMinistries(data);
      } catch (err) {
        console.error('Failed to load member ministries:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const activeCount = ministries.filter(m => m.status === 'Active').length;

  return (
    <div className="bg-white rounded-xl shadow border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Ministry Involvement</h2>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {activeCount} Active
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : ministries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No ministry involvement yet.</p>
      ) : (
        <div className="space-y-3">
          {ministries.map((ministry) => (
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
                      {ministry.status === 'Active' && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {ministry.leader_name ? `Led by ${ministry.leader_name}` : 'No leader assigned'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      <span>{ministry.meeting_day} &middot; {ministry.meeting_time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-4 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
        + Join a Ministry
      </button>
    </div>
  );
}
