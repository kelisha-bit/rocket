-- ============================================================
-- Add additional ministries to the database
-- Safe to run multiple times (ON CONFLICT DO NOTHING)
-- ============================================================

INSERT INTO ministries (name, meeting_day, meeting_time, status)
VALUES
  ('Women Ministry',        'Saturday',      '10:00 AM', 'Active'),
  ('Men Ministry',          'Saturday',      '8:00 AM',  'Active'),
  ('Marriage & Family',     'Friday',        '6:00 PM',  'Active'),
  ('Finance Committee',     'First Monday',  '5:00 PM',  'Active'),
  ('Elders Board',          'Second Sunday', '1:00 PM',  'Active'),
  ('Welfare Ministry',      'Wednesday',     '5:00 PM',  'Active'),
  ('Sanctuary Keepers',     'Sunday',        '6:00 AM',  'Active'),
  ('Intercessory Prayer',   'Tuesday',       '6:00 AM',  'Active'),
  ('Missions Ministry',     'Monthly',       'Various',  'Active'),
  ('Discipleship Ministry', 'Thursday',      '7:00 PM',  'Active'),
  ('Dance Ministry',        'Friday',        '5:00 PM',  'Active'),
  ('Security Ministry',     'Sunday',        '6:30 AM',  'Active')
ON CONFLICT (name) DO NOTHING;

-- Verify
SELECT name, meeting_day, meeting_time, status
FROM   ministries
ORDER  BY name;
