'use client';

import React from 'react';
import { CalendarDays, MapPin, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDashboard } from '../context/DashboardContext';

const typeColor: Record<string, string> = {
  'Church-wide': 'bg-blue-50 text-blue-700',
  Youth: 'bg-purple-50 text-purple-700',
  Women: 'bg-pink-50 text-pink-700',
  Men: 'bg-teal-50 text-teal-700',
  Children: 'bg-amber-50 text-amber-700',
};

function formatEventDate(iso: string, time: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(`${iso}T00:00:00`);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return time ? `${dateStr} · ${time}` : dateStr;
  } catch {
    return iso;
  }
}

export default function UpcomingEvents() {
  const router = useRouter();
  const { data, loading } = useDashboard();
  const events = data.upcomingEvents.slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <CalendarDays size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Upcoming Events</h3>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : `${events.length} scheduled`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
          <div>
            <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No upcoming events</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin -mr-1 pr-1">
          {events.map(evt => (
            <div
              key={evt.id}
              className="border border-border rounded-lg p-3 hover:border-primary/30 hover:bg-blue-50/20 transition-all cursor-pointer group"
              onClick={() => {
                toast.info('Event selected', { description: evt.title });
                router.push('/events');
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-[13px] font-semibold text-foreground leading-snug flex-1">{evt.title}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${typeColor[evt.department] ?? 'bg-gray-100 text-gray-600'}`}>
                  {evt.department}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays size={10} />
                  {formatEventDate(evt.date, evt.time)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </span>
                {evt.expectedAttendance > 0 && (
                  <span className="flex items-center gap-1 shrink-0 ml-auto">
                    <Users size={10} />
                    {evt.expectedAttendance.toLocaleString()} exp.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
