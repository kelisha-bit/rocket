'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricCard from '@/components/ui/MetricCard';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Calendar,
  Phone,
  Mail,
  Activity,
  Target,
  DollarSign,
  Sparkles,
  Plus,
  Download,
  Search,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchMembers, Member } from '@/lib/supabase/members';
import { fetchMinistryByName, fetchMinistryMembers, MinistryWithLeader } from '@/lib/supabase/ministry-helpers';
import {
  createMinistryEvent,
  fetchMinistryActivities,
  fetchMinistryAttendance,
  fetchMinistryContributions,
  fetchMinistryEvents,
  MinistryActivity,
  MinistryAttendance,
  MinistryContribution,
  MinistryEvent,
} from '@/lib/supabase/ministry-analytics';
import ActivityTimeline from '@/components/ministry/ActivityTimeline';
import EventsCalendar from '@/components/ministry/EventsCalendar';
import ContributionsTable from '@/components/ministry/ContributionsTable';
import AttendanceChart from '@/components/ministry/AttendanceChart';

type TabType = 'overview' | 'members' | 'attendance' | 'contributions' | 'events' | 'activities';

interface EventFormData {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  expected_attendance: number;
}

export default function WomenMinistryPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [ministry, setMinistry] = useState<MinistryWithLeader | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [attendance, setAttendance] = useState<MinistryAttendance[]>([]);
  const [contributions, setContributions] = useState<MinistryContribution[]>([]);
  const [events, setEvents] = useState<MinistryEvent[]>([]);
  const [activities, setActivities] = useState<MinistryActivity[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    date: '',
    time: '09:00',
    location: '',
    description: '',
    expected_attendance: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    const loadMinistryData = async () => {
      try {
        setLoadingMembers(true);
        setError(null);

        const ministryData = await fetchMinistryByName('Women Ministry');
        setMinistry(ministryData);

        if (ministryData?.id) {
          const ministryMembers = await fetchMinistryMembers(ministryData.id);
          setMembers(ministryMembers);
          await loadAnalyticsData(ministryData.id, ministryData.name);
        } else {
          const fetchedMembers = await fetchMembers();
          const femaleMembers = fetchedMembers.filter(
            (member) => member.gender?.toLowerCase() === 'female' || member.gender?.toLowerCase() === 'f'
          );
          setMembers(femaleMembers);
        }
      } catch (err) {
        console.error('Failed to load ministry data:', err);
        setError(`Failed to load ministry data: ${(err as Error)?.message || 'Please try again.'}`);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMinistryData();
  }, []);

  const loadAnalyticsData = async (ministryId: string, ministryName: string) => {
    setLoadingAnalytics(true);
    try {
      const [attendanceData, contributionsData, eventsData, activitiesData] = await Promise.all([
        fetchMinistryAttendance(ministryId),
        fetchMinistryContributions(ministryId),
        fetchMinistryEvents(ministryId),
        fetchMinistryActivities(ministryId, ministryName),
      ]);

      setAttendance(attendanceData);
      setContributions(contributionsData);
      setEvents(eventsData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (!loading && !session) router.push('/login');
  }, [useSupabaseAuth, loading, session, router]);

  if (loading || !session) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </AppLayout>
    );
  }

  const activeMembers = members.filter((member) => member.status === 'active');
  const totalMembers = members.length;
  const averageAttendanceRate =
    attendance.length > 0
      ? Math.round(attendance.reduce((sum, a) => sum + a.attendance_rate, 0) / attendance.length)
      : 0;
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'members' as TabType, label: 'Members', icon: <Users className="h-4 w-4" /> },
    { id: 'attendance' as TabType, label: 'Attendance', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'contributions' as TabType, label: 'Contributions', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'events' as TabType, label: 'Events', icon: <Calendar className="h-4 w-4" /> },
    { id: 'activities' as TabType, label: 'Activities', icon: <Sparkles className="h-4 w-4" /> },
  ];

  const handleCreateEvent = async () => {
    if (!ministry?.id) {
      toast.error('Ministry not found');
      return;
    }

    if (!eventFormData.title.trim() || !eventFormData.date || !eventFormData.time.trim() || !eventFormData.location.trim()) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      await createMinistryEvent(
        ministry.id,
        {
          title: eventFormData.title,
          date: eventFormData.date,
          time: eventFormData.time,
          location: eventFormData.location,
          notes: eventFormData.description || undefined,
          expected_attendance: eventFormData.expected_attendance,
          status: 'Scheduled',
        },
        session.user?.email || undefined
      );

      toast.success('Event scheduled successfully!');
      setShowEventModal(false);
      setEventFormData({
        title: '',
        date: '',
        time: '09:00',
        location: '',
        description: '',
        expected_attendance: 0,
      });

      const eventsData = await fetchMinistryEvents(ministry.id);
      setEvents(eventsData);
    } catch (err) {
      toast.error('Failed to schedule event');
      console.error(err);
    }
  };

  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = member.full_name.toLowerCase().includes(q) || member.phone.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout currentPath="/ministries/women">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Women’s Ministry Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage members, track attendance & contributions, and schedule events</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEventModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus size={20} />
              Schedule Event
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

        {ministry?.leader && (
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {ministry.leader.full_name?.charAt(0) || 'L'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-pink-100">Ministry Leader</p>
                <h3 className="text-2xl font-bold">{ministry.leader.full_name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-pink-100">
                  {ministry.leader.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {ministry.leader.phone}
                    </span>
                  )}
                  {ministry.leader.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {ministry.leader.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-pink-100">Next Meeting</p>
                <p className="text-lg font-semibold">{ministry.meeting_day}</p>
                <p className="text-sm text-pink-100">{ministry.meeting_time}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Members"
            value={totalMembers.toString()}
            icon={<Users className="h-6 w-6 text-pink-600" />}
            trend={12}
          />
          <MetricCard
            label="Active Members"
            value={activeMembers.length.toString()}
            icon={<Activity className="h-6 w-6 text-green-600" />}
            trend={8}
          />
          <MetricCard
            label="Avg Attendance"
            value={`${averageAttendanceRate}%`}
            icon={<Target className="h-6 w-6 text-orange-600" />}
            subValue="Last 30 days"
          />
          <MetricCard
            label="Contributions"
            value={`$${totalContributions.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
            subValue="This month"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-pink-600 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'members' && renderMembersTab()}
            {activeTab === 'attendance' && <AttendanceChart attendance={attendance} loading={loadingAnalytics} />}
            {activeTab === 'contributions' && <ContributionsTable contributions={contributions} loading={loadingAnalytics} />}
            {activeTab === 'events' && renderEventsTab()}
            {activeTab === 'activities' && <ActivityTimeline activities={activities} loading={loadingAnalytics} />}
          </div>
        </div>
      </div>

      <Modal open={showEventModal} onClose={() => setShowEventModal(false)} title="Schedule New Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input
              type="text"
              value={eventFormData.title}
              onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Women of Virtue Prayer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={eventFormData.date}
                onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={eventFormData.time}
                onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={eventFormData.location}
              onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Prayer Room"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={eventFormData.description}
              onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Event details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendance</label>
            <input
              type="number"
              value={eventFormData.expected_attendance}
              onChange={(e) =>
                setEventFormData({ ...eventFormData, expected_attendance: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleCreateEvent} className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
              Create Event
            </button>
            <button onClick={() => setShowEventModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Member Detail Modal */}
      {selectedMember && (
        <Modal open={true} onClose={() => setSelectedMember(null)} title="Member Profile">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-2xl font-bold">
                {selectedMember.full_name?.charAt(0) || 'M'}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedMember.full_name}</h3>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedMember.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : selectedMember.status === 'new'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedMember.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {selectedMember.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${selectedMember.phone}`} className="text-pink-600 hover:underline">
                    {selectedMember.phone}
                  </a>
                </div>
              )}
              {selectedMember.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${selectedMember.email}`} className="text-pink-600 hover:underline">
                    {selectedMember.email}
                  </a>
                </div>
              )}
              {selectedMember.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Born: {new Date(selectedMember.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.push(`/member-management?member=${selectedMember.id}`)}
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Full Profile
              </button>
              <button
                onClick={() => setSelectedMember(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );

  function renderOverviewTab() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-pink-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-pink-600">
                  {attendance.slice(0, 1).reduce((sum, a) => sum + a.present_count, 0)}
                </p>
                <p className="text-xs text-gray-500">Members attended</p>
              </div>
              <Users className="h-10 w-10 text-pink-600 opacity-50" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-green-600">{events.length}</p>
                <p className="text-xs text-gray-500">Scheduled</p>
              </div>
              <Calendar className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Activities</p>
                <p className="text-2xl font-bold text-purple-600">{activities.length}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <Sparkles className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <ActivityTimeline activities={activities.slice(0, 5)} loading={loadingAnalytics} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <button onClick={() => setActiveTab('events')} className="text-sm text-pink-600 hover:text-pink-700">
              View all →
            </button>
          </div>
          <EventsCalendar events={events.slice(0, 3)} loading={loadingAnalytics} />
        </div>
      </div>
    );
  }

  function renderMembersTab() {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="new">New</option>
          </select>
          <button
            onClick={() => router.push('/member-management')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            <UserPlus size={20} />
            Add Member
          </button>
        </div>

        {loadingMembers ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold text-lg">
                      {member.full_name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{member.full_name}</h4>
                      <p className="text-sm text-gray-500">{member.phone}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : member.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="flex-1 text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => member.phone && window.open(`tel:${member.phone}`)}
                    className="flex-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderEventsTab() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Ministry Events</h3>
          <button onClick={() => setShowEventModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
            <Plus size={20} />
            New Event
          </button>
        </div>
        <EventsCalendar events={events} loading={loadingAnalytics} />
      </div>
    );
  }
}