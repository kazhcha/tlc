-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID,
  budget DECIMAL(10,2),
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  avatar_url TEXT,
  phone TEXT,
  hire_date DATE,
  leave_balance JSONB DEFAULT '{"vacation": 20, "sick": 10, "personal": 5}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'jury_duty')),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES team_members(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  days_count INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  submitted_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES team_members(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave_conflicts view for detecting overlapping leaves
CREATE OR REPLACE VIEW leave_conflicts AS
SELECT 
  l1.id as leave_id_1,
  l2.id as leave_id_2,
  l1.employee_name as employee_1,
  l2.employee_name as employee_2,
  l1.start_date,
  l1.end_date,
  l2.start_date as conflict_start,
  l2.end_date as conflict_end
FROM leave_requests l1
JOIN leave_requests l2 ON l1.id != l2.id
WHERE l1.status = 'approved' 
  AND l2.status = 'approved'
  AND (l1.start_date, l1.end_date) OVERLAPS (l2.start_date, l2.end_date);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_type ON leave_requests(leave_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- Add foreign key constraint for department manager
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_manager 
FOREIGN KEY (manager_id) REFERENCES team_members(id) ON DELETE SET NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at 
    BEFORE UPDATE ON team_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at 
    BEFORE UPDATE ON leave_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
DROP TRIGGER IF EXISTS audit_departments ON departments;
CREATE TRIGGER audit_departments
    AFTER INSERT OR UPDATE OR DELETE ON departments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_team_members ON team_members;
CREATE TRIGGER audit_team_members
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_leave_requests ON leave_requests;
CREATE TRIGGER audit_leave_requests
    AFTER INSERT OR UPDATE OR DELETE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create RPC function to check table existence
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to get leave statistics
CREATE OR REPLACE FUNCTION get_leave_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_requests', COUNT(*),
        'approved_requests', COUNT(*) FILTER (WHERE status = 'approved'),
        'pending_requests', COUNT(*) FILTER (WHERE status = 'pending'),
        'by_type', json_object_agg(leave_type, type_count)
    ) INTO result
    FROM (
        SELECT 
            leave_type,
            COUNT(*) as type_count,
            status
        FROM leave_requests 
        GROUP BY leave_type, status
    ) stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In production, you'd want more restrictive policies based on user authentication

-- Departments policies
DROP POLICY IF EXISTS "Allow all operations on departments" ON departments;
CREATE POLICY "Allow all operations on departments" ON departments FOR ALL USING (true);

-- Team members policies
DROP POLICY IF EXISTS "Allow all operations on team_members" ON team_members;
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true);

-- Leave requests policies
DROP POLICY IF EXISTS "Allow all operations on leave_requests" ON leave_requests;
CREATE POLICY "Allow all operations on leave_requests" ON leave_requests FOR ALL USING (true);

-- Audit log policies (read-only for most users)
DROP POLICY IF EXISTS "Allow read access to audit_log" ON audit_log;
CREATE POLICY "Allow read access to audit_log" ON audit_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert to audit_log" ON audit_log;
CREATE POLICY "Allow insert to audit_log" ON audit_log FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create helpful views
CREATE OR REPLACE VIEW team_overview AS
SELECT 
    tm.id,
    tm.name,
    tm.email,
    tm.department,
    tm.role,
    tm.hire_date,
    tm.leave_balance,
    COUNT(lr.id) as total_leaves,
    COUNT(lr.id) FILTER (WHERE lr.status = 'approved') as approved_leaves,
    COUNT(lr.id) FILTER (WHERE lr.start_date >= CURRENT_DATE) as upcoming_leaves
FROM team_members tm
LEFT JOIN leave_requests lr ON tm.id = lr.employee_id
GROUP BY tm.id, tm.name, tm.email, tm.department, tm.role, tm.hire_date, tm.leave_balance;

CREATE OR REPLACE VIEW department_stats AS
SELECT 
    d.id,
    d.name,
    d.description,
    d.manager_id,
    d.budget,
    COUNT(tm.id) as member_count,
    COUNT(lr.id) as total_leave_requests,
    COUNT(lr.id) FILTER (WHERE lr.status = 'approved' AND lr.start_date >= CURRENT_DATE) as upcoming_leaves
FROM departments d
LEFT JOIN team_members tm ON d.name = tm.department
LEFT JOIN leave_requests lr ON tm.id = lr.employee_id
GROUP BY d.id, d.name, d.description, d.manager_id, d.budget;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables: departments, team_members, leave_requests, audit_log';
    RAISE NOTICE '🔍 Views: leave_conflicts, team_overview, department_stats';
    RAISE NOTICE '⚡ Functions: check_table_exists, get_leave_statistics';
    RAISE NOTICE '🔒 RLS enabled with public access policies';
END $$;
