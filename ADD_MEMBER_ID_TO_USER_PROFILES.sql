-- Migration: Add member_id column to user_profiles table
-- This links user accounts to their corresponding member records

-- Add member_id column with foreign key constraint
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_member_id ON user_profiles(member_id);

-- Add comment explaining the column
COMMENT ON COLUMN user_profiles.member_id IS 'Links user account to member record for syncing profile data (attendance, giving, etc.)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
