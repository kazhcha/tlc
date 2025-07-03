-- 🔍 Diagnostic Script - Run this to verify your setup
-- Copy and paste this into Supabase SQL Editor to check everything is working

-- Check if all tables exist and have data
SELECT 
  'departments' as table_name, 
  COUNT(*) as row_count,
  'Expected: 8' as expected
FROM departments
UNION ALL
SELECT 
  'team_members' as table_name, 
  COUNT(*) as row_count,
  'Expected: 18' as expected
FROM team_members
UNION ALL
SELECT 
  'leave_requests' as table_name, 
  COUNT(*) as row_count,
  'Expected: 10+' as expected
FROM leave_requests
UNION ALL
SELECT 
  'audit_log' as table_name, 
  COUNT(*) as row_count,
  'Expected: 0+' as expected
FROM audit_log;

-- Check if functions exist
SELECT 
  'check_table_exists function' as test_name,
  CASE 
    WHEN check_table_exists('departments') THEN 'PASS ✅'
    ELSE 'FAIL ❌'
  END as result;

-- Check if views exist
SELECT 
  'team_overview view' as test_name,
  COUNT(*) as row_count,
  'Should show team stats' as description
FROM team_overview
LIMIT 5;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('departments', 'team_members', 'leave_requests')
ORDER BY tablename;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Diagnostic check complete!';
    RAISE NOTICE '📊 If you see data in all tables above, your setup is working correctly.';
    RAISE NOTICE '🔒 RLS should show "true" for all tables.';
    RAISE NOTICE '✅ Your database is ready for production use!';
END $$;
