-- =====================================================
-- ADD MISSING EVENT COLUMNS
-- Run this in Supabase SQL Editor to fix PGRST204 error
-- =====================================================

-- Add missing columns to events table (if they don't exist)
DO $$
BEGIN
    -- Add 'date' column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'date'
    ) THEN
        ALTER TABLE events ADD COLUMN date DATE;
        -- Set default for existing rows
        UPDATE events SET date = CURRENT_DATE WHERE date IS NULL;
        ALTER TABLE events ALTER COLUMN date SET NOT NULL;
    END IF;

    -- Add 'time' column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'time'
    ) THEN
        ALTER TABLE events ADD COLUMN time TEXT DEFAULT '09:00';
    END IF;

    -- Add 'department' column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'department'
    ) THEN
        ALTER TABLE events ADD COLUMN department TEXT DEFAULT 'Church-wide';
        -- Add constraint
        ALTER TABLE events ADD CONSTRAINT chk_department 
            CHECK (department IN ('Church-wide', 'Youth', 'Women', 'Men', 'Children'));
    END IF;

    -- Add 'expected_attendance' column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'expected_attendance'
    ) THEN
        ALTER TABLE events ADD COLUMN expected_attendance INTEGER DEFAULT 0;
    END IF;

    -- Add 'actual_attendance' column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'actual_attendance'
    ) THEN
        ALTER TABLE events ADD COLUMN actual_attendance INTEGER;
    END IF;

    -- Add 'notes' column (maps to description in frontend)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'notes'
    ) THEN
        ALTER TABLE events ADD COLUMN notes TEXT;
    END IF;

    -- Remove old columns if they exist (clean up)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'starts_at'
    ) THEN
        ALTER TABLE events DROP COLUMN IF EXISTS starts_at;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'ends_at'
    ) THEN
        ALTER TABLE events DROP COLUMN IF EXISTS ends_at;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'description'
    ) THEN
        ALTER TABLE events DROP COLUMN IF EXISTS description;
    END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date ASC);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND table_schema = 'public'
ORDER BY ordinal_position;
