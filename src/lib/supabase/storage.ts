'use client';

import { createClient } from './client';

const MEMBER_PHOTOS_BUCKET = 'member-photos';

/**
 * Upload a member photo to Supabase Storage
 * @param file - The image file to upload
 * @param memberId - Optional member ID to use in the file path
 * @returns The public URL of the uploaded photo
 */
export async function uploadMemberPhoto(file: File, memberId?: string): Promise<string> {
  const supabase = createClient();
  
  // Generate a unique file name
  const fileExt = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const fileName = memberId 
    ? `${memberId}/${timestamp}-${randomId}.${fileExt}`
    : `uploads/${timestamp}-${randomId}.${fileExt}`;
  
  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from(MEMBER_PHOTOS_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (uploadError) {
    // If the bucket doesn't exist, try to create it
    if (uploadError.message?.includes('not found') || uploadError.message?.includes('does not exist')) {
      // Attempt to create the bucket
      const { error: createError } = await supabase.storage.createBucket(MEMBER_PHOTOS_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error('Failed to create storage bucket:', createError);
        throw new Error(`Failed to create storage bucket: ${createError.message}`);
      }
      
      // Retry the upload
      const { error: retryError } = await supabase.storage
        .from(MEMBER_PHOTOS_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (retryError) {
        throw new Error(`Upload failed: ${retryError.message}`);
      }
    } else {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
  }
  
  // Get the public URL
  const { data } = supabase.storage
    .from(MEMBER_PHOTOS_BUCKET)
    .getPublicUrl(fileName);
  
  return data.publicUrl;
}

/**
 * Delete a member photo from Supabase Storage
 * @param photoUrl - The public URL of the photo to delete
 */
export async function deleteMemberPhoto(photoUrl: string): Promise<void> {
  const supabase = createClient();
  
  // Extract the file path from the public URL
  try {
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === MEMBER_PHOTOS_BUCKET);
    
    if (bucketIndex === -1) {
      console.warn('Could not extract file path from URL:', photoUrl);
      return;
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from(MEMBER_PHOTOS_BUCKET)
      .remove([filePath]);
    
    if (error) {
      console.error('Failed to delete photo:', error);
    }
  } catch (error) {
    console.error('Failed to parse photo URL:', error);
  }
}

/**
 * Check if a URL is a Supabase Storage URL
 * @param url - The URL to check
 * @returns True if the URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  
  try {
    const urlObj = new URL(url);
    const supabaseUrlObj = new URL(supabaseUrl);
    return urlObj.origin === supabaseUrlObj.origin;
  } catch {
    return false;
  }
}

/**
 * Check if a URL is a temporary blob URL
 * @param url - The URL to check
 * @returns True if the URL is a blob URL
 */
export function isBlobUrl(url: string): boolean {
  return url?.startsWith('blob:') || false;
}
