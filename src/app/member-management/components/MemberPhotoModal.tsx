'use client';

import React, { useState } from 'react';
import { X, Camera, Upload, Trash2 } from 'lucide-react';
import { Member } from './memberData';
import PhotoUpload from '@/components/ui/PhotoUpload';
import { toast } from 'sonner';

interface MemberPhotoModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpdate: (memberId: string, photoUrl: string, photoAlt: string) => void;
}

export default function MemberPhotoModal({
  member,
  isOpen,
  onClose,
  onPhotoUpdate,
}: MemberPhotoModalProps) {
  const [photoAlt, setPhotoAlt] = useState(member.photoAlt || '');
  const [currentPhoto, setCurrentPhoto] = useState(member.photo || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handlePhotoChange = (photoUrl: string) => {
    setCurrentPhoto(photoUrl);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Generate alt text if not provided
      const altText = photoAlt.trim() || `${member.name} profile photo`;
      
      // Update the member photo
      onPhotoUpdate(member.id, currentPhoto, altText);
      
      toast.success('Photo updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = () => {
    setCurrentPhoto('');
    setPhotoAlt('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Update Photo - {member.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Photo Display */}
          <div className="text-center">
            <PhotoUpload
              currentPhoto={currentPhoto}
              onPhotoChange={handlePhotoChange}
              onPhotoRemove={handleRemovePhoto}
              size="xl"
              name={member.name}
              className="mx-auto"
            />
          </div>

          {/* Photo Alt Text */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Photo Description (Alt Text)
            </label>
            <input
              type="text"
              value={photoAlt}
              onChange={(e) => setPhotoAlt(e.target.value)}
              placeholder={`${member.name} profile photo`}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Helps with accessibility and SEO
            </p>
          </div>

          {/* Photo Guidelines */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Photo Guidelines</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use high-quality, clear photos</li>
              <li>• Face should be clearly visible</li>
              <li>• Professional or semi-professional appearance</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Supported formats: JPG, PNG, GIF</li>
              <li>• Square aspect ratio works best</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                // Generate a random avatar as placeholder
                const avatarUrl = `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70) + 1}`;
                setCurrentPhoto(avatarUrl);
                toast.info('Random avatar selected');
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Camera size={16} />
              <span className="text-sm">Random Avatar</span>
            </button>
            <button
              onClick={() => {
                // Generate initials avatar
                const initials = member.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=1B4F8A&color=ffffff&bold=true`;
                setCurrentPhoto(avatarUrl);
                toast.info('Initials avatar generated');
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Upload size={16} />
              <span className="text-sm">Generate Initials</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {currentPhoto && (
              <button
                onClick={handleRemovePhoto}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}