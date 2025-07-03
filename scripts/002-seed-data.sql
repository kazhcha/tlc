-- Clear existing data (optional - remove if you want to keep existing data)
-- TRUNCATE TABLE leave_requests, team_members, departments RESTART IDENTITY CASCADE;

-- Insert departments with enhanced data
INSERT INTO departments (name, description, budget) VALUES
('Engineering', 'Responsible for software development, system architecture, and technical infrastructure. Handles product development and maintains our technology stack.', 500000.00),
('Design', 'Creates user experiences, visual designs, and brand materials. Focuses on user research, prototyping, and design systems.', 200000.00),
('Marketing', 'Drives brand awareness, lead generation, and customer acquisition. Manages campaigns, content creation, and market research.', 300000.00),
('Human Resources', 'Manages talent acquisition, employee relations, and organizational development. Handles benefits, policies, and workplace culture.', 150000.00),
('Sales', 'Responsible for revenue generation, client relationships, and business development. Manages the sales pipeline and customer success.', 400000.00),
('Operations', 'Oversees daily business operations, process optimization, and resource management. Ensures efficient workflow and productivity.', 250000.00),
('Finance', 'Manages financial planning, budgeting, accounting, and financial reporting. Ensures fiscal responsibility and compliance.', 180000.00),
('Customer Success', 'Focuses on customer satisfaction, retention, and growth. Manages client relationships and ensures product adoption.', 220000.00)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  budget = EXCLUDED.budget,
  updated_at = NOW();

-- Insert team members with enhanced data
INSERT INTO team_members (name, email, department, role, hire_date, leave_balance, phone) VALUES
-- Engineering Team
('Alice Johnson', 'alice.johnson@company.com', 'Engineering', 'manager', '2022-01-15', '{"vacation": 18, "sick": 8, "personal": 4}', '+1-555-0101'),
('David Wilson', 'david.wilson@company.com', 'Engineering', 'member', '2022-03-20', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0102'),
('Sarah Chen', 'sarah.chen@company.com', 'Engineering', 'member', '2023-02-10', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0103'),
('Michael Rodriguez', 'michael.rodriguez@company.com', 'Engineering', 'member', '2023-06-01', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0104'),

-- Design Team
('Bob Smith', 'bob.smith@company.com', 'Design', 'manager', '2021-11-08', '{"vacation": 15, "sick": 7, "personal": 3}', '+1-555-0201'),
('Emma Thompson', 'emma.thompson@company.com', 'Design', 'member', '2022-09-12', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0202'),
('James Park', 'james.park@company.com', 'Design', 'member', '2023-01-25', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0203'),

-- Marketing Team
('Carol Davis', 'carol.davis@company.com', 'Marketing', 'manager', '2021-08-30', '{"vacation": 16, "sick": 9, "personal": 4}', '+1-555-0301'),
('Lisa Wang', 'lisa.wang@company.com', 'Marketing', 'member', '2022-12-05', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0302'),
('Ryan O''Connor', 'ryan.oconnor@company.com', 'Marketing', 'member', '2023-04-18', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0303'),

-- HR Team
('Eva Brown', 'eva.brown@company.com', 'Human Resources', 'manager', '2021-05-20', '{"vacation": 17, "sick": 8, "personal": 4}', '+1-555-0401'),
('Jennifer Martinez', 'jennifer.martinez@company.com', 'Human Resources', 'member', '2022-07-14', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0402'),

-- Sales Team
('Tom Anderson', 'tom.anderson@company.com', 'Sales', 'manager', '2021-10-12', '{"vacation": 14, "sick": 6, "personal": 3}', '+1-555-0501'),
('Rachel Green', 'rachel.green@company.com', 'Sales', 'member', '2022-11-28', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0502'),
('Kevin Lee', 'kevin.lee@company.com', 'Sales', 'member', '2023-03-08', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0503'),

-- Operations Team
('Maria Garcia', 'maria.garcia@company.com', 'Operations', 'manager', '2022-02-22', '{"vacation": 19, "sick": 9, "personal": 5}', '+1-555-0601'),
('Alex Kim', 'alex.kim@company.com', 'Operations', 'member', '2023-05-15', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0602'),

-- Finance Team
('Robert Taylor', 'robert.taylor@company.com', 'Finance', 'manager', '2021-12-01', '{"vacation": 16, "sick": 8, "personal": 4}', '+1-555-0701'),
('Amanda White', 'amanda.white@company.com', 'Finance', 'member', '2022-08-17', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0702'),

-- Customer Success Team
('Daniel Brown', 'daniel.brown@company.com', 'Customer Success', 'manager', '2022-04-05', '{"vacation": 18, "sick": 9, "personal": 4}', '+1-555-0801'),
('Sophie Miller', 'sophie.miller@company.com', 'Customer Success', 'member', '2023-01-10', '{"vacation": 20, "sick": 10, "personal": 5}', '+1-555-0802')

ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  role = EXCLUDED.role,
  hire_date = EXCLUDED.hire_date,
  leave_balance = EXCLUDED.leave_balance,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- Update department managers
UPDATE departments SET manager_id = (
  SELECT id FROM team_members WHERE email = 'alice.johnson@company.com'
) WHERE name = 'Engineering';

UPDATE departments SET manager_id = (
  SELECT id FROM team_members WHERE email = 'bob.smith@company.com'
) WHERE name = 'Design';

UPDATE departments SET manager_id = (
  SELECT id FROM team_members WHERE email = 'carol.davis@company.com'
) WHERE name = 'Marketing';

UPDATE departments SET manager_id = (
  SELECT id FROM team_members WHERE email = 'eva.brown@company.com'
) WHERE name = 'Human Resources';

UPDATE departments SET manager_id = (
  SELECT id FROM team_members WHERE email = 'tom.anderson@company.com'
) WHERE name = 'Sales';

UPDATE departments SET manager_id = (
  SELECT id FROM team_members WHERE email = 'maria.garcia@company.com'
) WHERE name = 'Operations';

UPDATE departments SET manager_id = (
  SELECT id FROM team_members WHERE email = 'robert.taylor@company.com'
) WHERE name = 'Finance';

UPDATE departments SET manager_id = (
  SELECT id FROM team_members WHERE email = 'daniel.brown@company.com'
) WHERE name = 'Customer Success';

-- Insert sample leave requests with variety
INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status) 
SELECT 
  tm.name,
  tm.id,
  '2024-12-23'::date,
  '2024-12-27'::date,
  'vacation',
  'Christmas holidays with family',
  'approved'
FROM team_members tm WHERE tm.email = 'alice.johnson@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status)
SELECT 
  tm.name,
  tm.id,
  '2024-12-30'::date,
  '2025-01-02'::date,
  'vacation',
  'New Year celebration and rest',
  'approved'
FROM team_members tm WHERE tm.email = 'bob.smith@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status)
SELECT 
  tm.name,
  tm.id,
  '2025-01-15'::date,
  '2025-01-17'::date,
  'personal',
  'Family wedding celebration',
  'approved'
FROM team_members tm WHERE tm.email = 'carol.davis@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status)
SELECT 
  tm.name,
  tm.id,
  '2025-02-14'::date,
  '2025-02-14'::date,
  'personal',
  'Valentine''s Day with spouse',
  'approved'
FROM team_members tm WHERE tm.email = 'david.wilson@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status)
SELECT 
  tm.name,
  tm.id,
  '2025-03-10'::date,
  '2025-03-14'::date,
  'vacation',
  'Spring break vacation',
  'pending'
FROM team_members tm WHERE tm.email = 'eva.brown@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status)
SELECT 
  tm.name,
  tm.id,
  '2025-04-01'::date,
  '2025-04-01'::date,
  'sick',
  'Medical appointment',
  'approved'
FROM team_members tm WHERE tm.email = 'sarah.chen@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status)
SELECT 
  tm.name,
  tm.id,
  '2025-05-20'::date,
  '2025-05-24'::date,
  'vacation',
  'Memorial Day weekend extended vacation',
  'pending'
FROM team_members tm WHERE tm.email = 'tom.anderson@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status)
SELECT 
  tm.name,
  tm.id,
  '2025-06-15'::date,
  '2025-06-19'::date,
  'vacation',
  'Summer vacation with kids',
  'approved'
FROM team_members tm WHERE tm.email = 'maria.garcia@company.com';

-- Add some historical leave requests
INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status, submitted_date)
SELECT 
  tm.name,
  tm.id,
  '2024-11-28'::date,
  '2024-11-29'::date,
  'vacation',
  'Thanksgiving holiday',
  'approved',
  '2024-11-01'::date
FROM team_members tm WHERE tm.email = 'rachel.green@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason, status, submitted_date)
SELECT 
  tm.name,
  tm.id,
  '2024-10-31'::date,
  '2024-10-31'::date,
  'personal',
  'Halloween activities with children',
  'approved',
  '2024-10-15'::date
FROM team_members tm WHERE tm.email = 'jennifer.martinez@company.com';

-- Success message
DO $$
DECLARE
    dept_count INTEGER;
    member_count INTEGER;
    leave_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dept_count FROM departments;
    SELECT COUNT(*) INTO member_count FROM team_members;
    SELECT COUNT(*) INTO leave_count FROM leave_requests;
    
    RAISE NOTICE '✅ Sample data inserted successfully!';
    RAISE NOTICE '🏢 Departments: %', dept_count;
    RAISE NOTICE '👥 Team Members: %', member_count;
    RAISE NOTICE '📅 Leave Requests: %', leave_count;
    RAISE NOTICE '🎯 Ready for production use!';
END $$;
