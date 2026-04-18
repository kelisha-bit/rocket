'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Global client instance to prevent multiple instances causing lock contention
let globalClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Return existing client if available (prevents lock contention)
  if (globalClient) {
    return globalClient;
  }

  // Create new client with storage options to avoid lock issues
  globalClient = createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Use memory storage for auth to avoid IndexedDB lock issues
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    },
    global: {
      // Add headers to prevent caching issues
      headers: {
        'X-Client-Info': 'supabase-js-web',
      },
    },
  });

  return globalClient;
}

// Helper to handle lock errors with retry logic
export async function withLockRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // Check if it's a lock error
      if (error?.message?.includes('Lock broken') || error?.name === 'AbortError') {
        console.warn(`Lock contention detected, retrying... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      // Not a lock error, throw immediately
      throw error;
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
