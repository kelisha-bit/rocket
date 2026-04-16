-- =====================================================
-- CREATE attendance_sessions + attendance_records
-- =====================================================
-- This replaces the old member_attendance table approach
-- with a two-table design:
--   attendance_sessions  — one row per service session
--   attendance_records   — one row per member per session
--
-- attendance_records has a FK to members(id), which is
-- what PostgREST needs to resolve the join in queries like:
--   .from('attendance_records').select('..., members(...)')
-- =====================================================

-- ── 1. attendance_sessions ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN (
                  'Sunday Service', 'Midweek Service', 'Cell Group',
                  'Special Event', 'Prayer Meeting'
               )),
  session_date DATE NOT NULL,
  starts_at    TIMESTAMP WITH TIME ZONE,
  ends_at      TIMESTAMP WITH TIME ZONE,
  notes        TEXT,
  created_by   TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique: only one session per type per date
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_sessions_unique
  ON attendance_sessions(session_type, session_date);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date
  ON attendance_sessions(session_date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_type
  ON attendance_sessions(session_type);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_attendance_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_attendance_sessions_updated_at ON attendance_sessions;
CREATE TRIGGER trigger_update_attendance_sessions_updated_at
  BEFORE UPDATE ON attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION update_attendance_sessions_updated_at();

-- RLS
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_attendance_sessions"   ON attendance_sessions;
DROP POLICY IF EXISTS "anon_insert_attendance_sessions" ON attendance_sessions;
DROP POLICY IF EXISTS "anon_update_attendance_sessions" ON attendance_sessions;
DROP POLICY IF EXISTS "anon_delete_attendance_sessions" ON attendance_sessions;

CREATE POLICY "anon_read_attendance_sessions"
  ON attendance_sessions FOR SELECT USING (true);
CREATE POLICY "anon_insert_attendance_sessions"
  ON attendance_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_attendance_sessions"
  ON attendance_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_attendance_sessions"
  ON attendance_sessions FOR DELETE USING (true);


-- ── 2. attendance_records ─────────────────────────────────────────────────────
-- This table MUST have a FK to members(id) so PostgREST can resolve
-- the relationship used in:
--   .from('attendance_records').select('..., members(...)')

CREATE TABLE IF NOT EXISTS attendance_records (
  session_id    UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  present       BOOLEAN NOT NULL DEFAULT true,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  notes         TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (session_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_member_id
  ON attendance_records(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id
  ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_present
  ON attendance_records(present);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_attendance_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER trigger_update_attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_attendance_records_updated_at();

-- RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_attendance_records"   ON attendance_records;
DROP POLICY IF EXISTS "anon_insert_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "anon_update_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "anon_delete_attendance_records" ON attendance_records;

CREATE POLICY "anon_read_attendance_records"
  ON attendance_records FOR SELECT USING (true);
CREATE POLICY "anon_insert_attendance_records"
  ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_attendance_records"
  ON attendance_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_attendance_records"
  ON attendance_records FOR DELETE USING (true);


-- ── 3. Verify ─────────────────────────────────────────────────────────────────

SELECT '✅ attendance_sessions table ready' AS status;
SELECT '✅ attendance_records table ready (FK → members)' AS status;

-- Confirm the FK exists (PostgREST uses this to resolve joins)
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name  AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('attendance_records', 'attendance_sessions')
ORDER BY tc.table_name;
