'use client';

import React, { useEffect, useState } from 'react';
import { Users, Calendar, Award, X, Plus } from 'lucide-react';
import { fetchMemberMinistries, Ministry as DBMinistry, fetchMinistries } from '@/lib/supabase/ministries';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface MinistryInvolvementProps {
  userId?: string;
}

export default function MinistryInvolvement({ userId }: MinistryInvolvementProps) {
  const [ministries, setMinistries] = useState<DBMinistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [availableMinistries, setAvailableMinistries] = useState<DBMinistry[]>([]);
  const [joining, setJoining] = useState(false);

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

      <button 
        onClick={() => setShowJoinModal(true)}
        className="w-full mt-4 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Join a Ministry
      </button>

      {/* Join Ministry Modal */}
      {showJoinModal && (
        <JoinMinistryModal
          userId={userId}
          currentMinistries={ministries}
          onClose={() => setShowJoinModal(false)}
          onJoined={() => {
            setShowJoinModal(false);
            // Refresh ministries list
            if (userId) {
              fetchMemberMinistries(userId).then(setMinistries);
            }
          }}
        />
      )}
    </div>
  );
}

// Join Ministry Modal Component
interface JoinMinistryModalProps {
  userId?: string;
  currentMinistries: DBMinistry[];
  onClose: () => void;
  onJoined: () => void;
}

function JoinMinistryModal({ userId, currentMinistries, onClose, onJoined }: JoinMinistryModalProps) {
  const [availableMinistries, setAvailableMinistries] = useState<DBMinistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    const loadAvailable = async () => {
      try {
        setLoading(true);
        const allMinistries = await fetchMinistries();
        // Filter out ministries user is already in
        const currentIds = new Set(currentMinistries.map(m => m.id));
        const available = allMinistries.filter(m => !currentIds.has(m.id));
        setAvailableMinistries(available);
      } catch (err) {
        console.error('Failed to load ministries:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAvailable();
  }, [currentMinistries]);

  const handleJoin = async (ministryId: string) => {
    if (!userId) {
      toast.error('Please sign in to join a ministry');
      return;
    }

    setJoining(ministryId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('member_ministries')
        .insert({
          member_id: userId,
          ministry_id: ministryId,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Successfully joined ministry!');
      onJoined();
    } catch (err) {
      console.error('Error joining ministry:', err);
      toast.error('Failed to join ministry');
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Join a Ministry</h2>
              <p className="text-xs text-muted-foreground">Select a ministry to join</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : availableMinistries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No available ministries to join.</p>
            <p className="text-xs text-muted-foreground mt-1">You are already a member of all ministries!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableMinistries.map((ministry) => (
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
                      <h3 className="text-sm font-semibold text-foreground">{ministry.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ministry.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Calendar size={12} />
                        <span>{ministry.meeting_day} &middot; {ministry.meeting_time}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoin(ministry.id)}
                    disabled={joining === ministry.id}
                    className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {joining === ministry.id ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
