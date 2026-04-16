'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User, Loader2 } from 'lucide-react';
import AppImage from './AppImage';
import { toast } from 'sonner';
import { uploadMemberPhoto, isBlobUrl } from '@/lib/supabase/storage';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string) => void;
  onPhotoRemove?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  name?: string;
  className?: string;
}

export default function PhotoUpload({
  currentPhoto,
  onPhotoChange,
  onPhotoRemove,
  size = 'lg',
  editable = true,
  name = 'Member',
  className = '',
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: 'Please select an image file (JPG, PNG, GIF)' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Please select an image smaller than 5MB' });
      return;
    }

    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    try {
      setUploading(true);

      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      onPhotoChange(previewUrl);
      
      // Upload to Supabase Storage
      const publicUrl = await uploadMemberPhoto(file);
      
      // Update with the permanent URL
      onPhotoChange(publicUrl);
      
      toast.success('Photo uploaded successfully');
      
      // Clean up the preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Upload failed', { description: error instanceof Error ? error.message : 'Please try again' });
      
      // Revert to no photo on error
      onPhotoChange('');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleRemovePhoto = () => {
    if (onPhotoRemove) {
      onPhotoRemove();
    } else {
      onPhotoChange('');
    }
    toast.success('Photo removed');
  };

  const generateInitialsAvatar = () => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=1B4F8A&color=ffffff&bold=true`;
    onPhotoChange(avatarUrl);
    toast.success('Initials avatar generated');
  };

  const generateRandomAvatar = () => {
    const avatarUrl = `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70) + 1}`;
    onPhotoChange(avatarUrl);
    toast.success('Random avatar selected');
  };

  return (
    <div className={`relative group ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-4 border-white shadow-lg overflow-hidden bg-muted relative ${
          editable && !uploading ? 'cursor-pointer' : ''
        } ${dragOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => editable && !uploading && fileInputRef.current?.click()}
      >
        {currentPhoto ? (
          <AppImage
            src={currentPhoto}
            alt={`${name} profile photo`}
            width={size === 'xl' ? 160 : size === 'lg' ? 128 : size === 'md' ? 96 : 64}
            height={size === 'xl' ? 160 : size === 'lg' ? 128 : size === 'md' ? 96 : 64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <User size={iconSizes[size] * 2} className="text-primary" />
          </div>
        )}

        {/* Upload overlay */}
        {editable && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <Loader2 size={iconSizes[size]} className="text-white animate-spin" />
            ) : (
              <Camera size={iconSizes[size]} className="text-white" />
            )}
          </div>
        )}

        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center">
            <Upload size={iconSizes[size]} className="text-primary" />
          </div>
        )}
      </div>

      {/* Action buttons */}
      {editable && currentPhoto && !uploading && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            title="Change photo"
          >
            <Camera size={14} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePhoto();
            }}
            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            title="Remove photo"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

      {/* Add photo button for empty state */}
      {editable && !currentPhoto && !uploading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          title="Add photo"
        >
          <Camera size={18} className="text-white" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload instructions and quick actions */}
      {editable && !currentPhoto && (
        <div className="mt-2 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF up to 5MB
          </p>
          <div className="flex gap-1 justify-center">
            <button
              onClick={generateInitialsAvatar}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
            >
              Initials
            </button>
            <button
              onClick={generateRandomAvatar}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
            >
              Random
            </button>
          </div>
        </div>
      )}
    </div>
  );
}