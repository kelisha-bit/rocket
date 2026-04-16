-- First, let's check what columns exist and add missing ones
-- This script is safe to run multiple times

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add full_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'full_name') THEN
    ALTER TABLE user_profiles ADD COLUMN full_name TEXT;
  END IF;

  -- Add phone if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
    ALTER TABLE user_profiles ADD COLUMN phone TEXT;
  END IF;

  -- Add address if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'address') THEN
    ALTER TABLE user_profiles ADD COLUMN address TEXT;
  END IF;

  -- Add city if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'city') THEN
    ALTER TABLE user_profiles ADD COLUMN city TEXT;
  END IF;

  -- Add country if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'country') THEN
    ALTER TABLE user_profiles ADD COLUMN country TEXT;
  END IF;

  -- Add avatar_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add bio if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'bio') THEN
    ALTER TABLE user_profiles ADD COLUMN bio TEXT;
  END IF;

  -- Add date_of_birth if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'date_of_birth') THEN
    ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;
  END IF;

  -- Add role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'Staff';
  END IF;

  -- Add created_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'created_at') THEN
    ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Enable Row Level Security if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create policies for user_profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create an index on the id column for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Create or replace the trigger function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create or replace function to automatically create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information for church members and staff';
COMMENT ON COLUMN user_profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN user_profiles.full_name IS 'Full name of the user';
COMMENT ON COLUMN user_profiles.phone IS 'Phone number';
COMMENT ON COLUMN user_profiles.address IS 'Street address';
COMMENT ON COLUMN user_profiles.city IS 'City';
COMMENT ON COLUMN user_profiles.country IS 'Country';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to profile picture';
COMMENT ON COLUMN user_profiles.bio IS 'User biography';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'Date of birth';
COMMENT ON COLUMN user_profiles.role IS 'User role in the church (e.g., Pastor, Admin, Staff, Member)';

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'User profiles table updated successfully!';
END $$;
