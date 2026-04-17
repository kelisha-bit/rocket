/**
 * Shared utilities for Supabase error handling
 * Extracted from various adapter files to avoid duplication
 */

/**
 * Extract a human-readable error message from a Supabase error object
 */
export function getSupabaseErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Unknown error';
  const e = error as { message?: string; details?: string; hint?: string; code?: string };
  return [e.message, e.details, e.hint, e.code ? `code=${e.code}` : ''].filter(Boolean).join(' | ') || 'Unknown error';
}

/**
 * Check if error is a duplicate member code error (unique constraint violation)
 */
export function isDuplicateMemberCodeError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; details?: string };
  const text = `${e.message || ''} ${e.details || ''}`.toLowerCase();
  return e.code === '23505' && text.includes('member_code');
}

/**
 * Check if error is a foreign key constraint violation
 */
export function isForeignKeyError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; details?: string };
  return e.code === '23503' || (e.message || '').toLowerCase().includes('foreign key');
}

/**
 * Check if error is a not-null constraint violation
 */
export function isNotNullError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string };
  return e.code === '23502' || (e.message || '').toLowerCase().includes('not null');
}
