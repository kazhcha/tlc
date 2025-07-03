-- ⚠️ RESET SCRIPT - Use this ONLY if you need to start over
-- This will DELETE ALL DATA and recreate everything from scratch

-- WARNING: This will permanently delete all your data!
-- Only run this if you want to completely reset your database

DO $$
BEGIN
    RAISE NOTICE '⚠️  WARNING: This will delete ALL data in your database!';
    RAISE NOTICE '🛑 Make sure this is what you want to do.';
    RAISE NOTICE '⏱️  Starting reset in 3 seconds...';
END $$;

-- Drop all tables (this will cascade and remove all data)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Drop views
DROP VIEW IF EXISTS leave_conflicts CASCADE;
DROP VIEW IF EXISTS team_overview CASCADE;
DROP VIEW IF EXISTS department_stats CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS check_table_exists(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_leave_statistics() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🗑️  Database reset complete!';
    RAISE NOTICE '📝 Now run the 001-create-tables.sql script to recreate everything.';
    RAISE NOTICE '📊 Then run 002-seed-data.sql to add sample data.';
END $$;
