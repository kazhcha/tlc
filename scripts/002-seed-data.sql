-- Insert default departments
INSERT INTO departments (name, description) VALUES
('Engineering', 'Responsible for software development, system architecture, and technical infrastructure. Handles product development and maintains our technology stack.'),
('Design', 'Creates user experiences, visual designs, and brand materials. Focuses on user research, prototyping, and design systems.'),
('Marketing', 'Drives brand awareness, lead generation, and customer acquisition. Manages campaigns, content creation, and market research.'),
('HR', 'Manages talent acquisition, employee relations, and organizational development. Handles benefits, policies, and workplace culture.'),
('Sales', 'Responsible for revenue generation, client relationships, and business development. Manages the sales pipeline and customer success.');

-- Insert sample team members
INSERT INTO team_members (name, email, department) VALUES
('Alice Johnson', 'alice@company.com', 'Engineering'),
('Bob Smith', 'bob@company.com', 'Design'),
('Carol Davis', 'carol@company.com', 'Marketing'),
('David Wilson', 'david@company.com', 'Engineering'),
('Eva Brown', 'eva@company.com', 'HR');

-- Insert sample leave requests
INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason)
SELECT 
  tm.name,
  tm.id,
  '2024-12-23'::date,
  '2024-12-27'::date,
  'vacation',
  'Christmas holidays'
FROM team_members tm WHERE tm.email = 'alice@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason)
SELECT 
  tm.name,
  tm.id,
  '2024-12-30'::date,
  '2025-01-02'::date,
  'vacation',
  'New Year break'
FROM team_members tm WHERE tm.email = 'bob@company.com';

INSERT INTO leave_requests (employee_name, employee_id, start_date, end_date, leave_type, reason)
SELECT 
  tm.name,
  tm.id,
  '2025-01-15'::date,
  '2025-01-17'::date,
  'personal',
  'Family event'
FROM team_members tm WHERE tm.email = 'carol@company.com';
