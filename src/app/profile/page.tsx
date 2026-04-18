'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, X, Edit2, Lock, Bell, Shield, X as CloseIcon } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { fetchMemberMinistries } from '@/lib/supabase/ministries';
import { fetchMemberById, fetchMemberByEmail } from '@/lib/supabase/members';
import { uploadMemberPhoto } from '@/lib/supabase/storage';
import ProfileStats from './components/ProfileStats';
import MinistryInvolvement from './components/MinistryInvolvement';
import ActivityTimeline from './components/ActivityTimeline';
import QuickActions from './components/QuickActions';
import PasswordChangeModal from './components/PasswordChangeModal';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  role?: string;
  created_at?: string;
  member_id?: string;
  attendance_rate?: number;
  total_giving?: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading, useSupabaseAuth, signOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [ministriesCount, setMinistriesCount] = useState(0);
  const [memberStats, setMemberStats] = useState({ attendanceRate: 0, totalGiving: 0 });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Always load profile when component mounts
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      if (!useSupabaseAuth) {
        // Mock data for non-Supabase mode
        const mockProfile: UserProfile = {
          id: 'mock-user-id',
          full_name: 'Ps. Emmanuel Asante',
          email: 'emmanuel.asante@greaterworks.org',
          phone: '+233 24 123 4567',
          address: '123 Church Street',
          city: 'Accra',
          country: 'Ghana',
          avatar_url: 'https://i.pravatar.cc/150?img=12',
          bio: 'Senior Pastor at Greater Works City Church. Passionate about building communities and spreading the gospel.',
          date_of_birth: '1980-05-15',
          role: 'Pastor / Admin',
          created_at: '2020-01-01T00:00:00Z',
        };
        setProfile(mockProfile);
        setFormData(mockProfile);
        setLoading(false);
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      // Try to fetch from user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        console.error('Error loading profile:', error);
      }

      // Construct profile from available data
      const userProfile: UserProfile = {
        id: user.id,
        full_name: data?.full_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: data?.phone || user.user_metadata?.phone || '',
        address: data?.address || '',
        city: data?.city || '',
        country: data?.country || '',
        avatar_url: data?.avatar_url || user.user_metadata?.avatar_url || '',
        bio: data?.bio || '',
        date_of_birth: data?.date_of_birth || '',
        role: data?.role || 'Staff',
        created_at: user.created_at,
        member_id: data?.member_id,
      };

      setProfile(userProfile);
      setFormData(userProfile);

      // Fetch real ministry count for this user
      try {
        const memberMinistries = await fetchMemberMinistries(user.id);
        setMinistriesCount(memberMinistries.length);
      } catch (err) {
        // fallback: count stays 0
        console.warn('Could not load member ministries:', err);
      }

      // Fetch member stats from members table if linked
      let linkedMemberId = data?.member_id;
      
      // Auto-link by email if no member_id exists
      if (!linkedMemberId && user.email) {
        try {
          const memberByEmail = await fetchMemberByEmail(user.email);
          if (memberByEmail) {
            linkedMemberId = memberByEmail.id;
            // Update user profile with member_id for future lookups
            await supabase
              .from('user_profiles')
              .upsert({
                id: user.id,
                member_id: linkedMemberId,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
          }
        } catch {
          // Silent fail - will retry next time
        }
      }
      
      if (linkedMemberId) {
        try {
          const memberData = await fetchMemberById(linkedMemberId);
          if (memberData) {
            setMemberStats({
              attendanceRate: memberData.attendance_rate || 0,
              totalGiving: memberData.total_giving || 0,
            });
          }
        } catch {
          // fallback: keep default stats
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!useSupabaseAuth || !user) {
        // Mock save for non-Supabase mode
        setProfile(prev => ({ ...prev, ...formData } as UserProfile));
        setIsEditing(false);
        toast.success('Profile updated successfully');
        setSaving(false);
        return;
      }

      const supabase = createClient();

      // Update or insert profile
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          avatar_url: formData.avatar_url,
          bio: formData.bio,
          date_of_birth: formData.date_of_birth || null,
          role: formData.role,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      setProfile(prev => ({ ...prev, ...formData } as UserProfile));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error('Failed to update profile', { description: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;

    setUploadingPhoto(true);

    try {
      const file = event.target.files[0];
      const publicUrl = await uploadMemberPhoto(file, user?.id);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    if (!useSupabaseAuth || !user) {
      toast.error('Please sign in to change password');
      return;
    }

    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('Password changed successfully');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error('Failed to change password', { description: errorMessage });
    } finally {
      setChangingPassword(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Profile not found</p>
          <p className="text-muted-foreground">Unable to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[#A67C00] h-48 relative">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
        {/* Profile Stats */}
        <ProfileStats
          memberSince={profile.created_at || '2020-01-01'}
          attendanceRate={memberStats.attendanceRate}
          totalGiving={memberStats.totalGiving}
          ministriesCount={ministriesCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
              {/* Profile Header */}
              <div className="px-6 sm:px-8 pt-8 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-muted">
                      {profile.avatar_url ? (
                        <AppImage
                          key={profile.avatar_url}
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <User size={48} className="text-primary" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {uploadingPhoto ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera size={18} className="text-white" />
                        )}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>

                  {/* Name and Role */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                      {profile.full_name || 'No name set'}
                    </h1>
                    <p className="text-muted-foreground mb-3">{profile.role || 'Staff'}</p>
                    {profile.created_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span>Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Edit Button */}
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                          disabled={saving}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                          disabled={saving}
                        >
                          <Save size={16} />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="border-t border-border px-6 sm:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {profile.bio || 'No bio added yet'}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Phone size={16} />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="+233 24 123 4567"
                      />
                    ) : (
                      <p className="text-muted-foreground px-4 py-2">
                        {profile.phone || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Calendar size={16} />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <p className="text-muted-foreground px-4 py-2">
                        {profile.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <User size={16} />
                      Role
                    </label>
                    <input
                      type="text"
                      value={profile.role || 'Staff'}
                      disabled
                      className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Contact admin to change role</p>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="123 Church Street"
                      />
                    ) : (
                      <p className="text-muted-foreground px-4 py-2">
                        {profile.address || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Accra"
                      />
                    ) : (
                      <p className="text-muted-foreground px-4 py-2">
                        {profile.city || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ghana"
                      />
                    ) : (
                      <p className="text-muted-foreground px-4 py-2">
                        {profile.country || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            <MinistryInvolvement userId={profile.id} />
            <ActivityTimeline userId={profile.id} memberId={profile.member_id} />
            <QuickActions
              onSignOut={async () => {
                if (useSupabaseAuth && signOut) {
                  await signOut();
                }
                router.push('/sign-up-login-screen');
              }}
            />
          </div>
        </div>

        {/* Bottom Section - Security & Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Account Security */}
          <div className="bg-white rounded-xl shadow border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Account Security</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
              >
                <Lock size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Change Password</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Update your password</p>
                </div>
              </button>
              <button
                onClick={() => toast.info('2FA', { description: 'Two-factor authentication coming soon' })}
                className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
              >
                <Shield size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security</p>
                </div>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Preferences</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
              >
                <Bell size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Notification Settings</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your notifications</p>
                </div>
              </button>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
              >
                <Shield size={18} className="text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Privacy Settings</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Control your privacy</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <PasswordChangeModal
            onClose={() => setShowPasswordModal(false)}
            onSubmit={handleChangePassword}
            isLoading={changingPassword}
          />
        )}
      </div>
    </div>
  );
}