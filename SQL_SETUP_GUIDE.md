# 📊 Step-by-Step SQL Setup Guide for Supabase

This guide will walk you through running the SQL scripts in your Supabase project with detailed instructions and troubleshooting.

## 🎯 Overview

You need to run 2 SQL scripts:
1. **001-create-tables.sql** - Creates the database structure
2. **002-seed-data.sql** - Adds sample data

## 📋 Step 1: Access Supabase SQL Editor

### 1.1 Open Your Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your **team-leave-manager** project

### 1.2 Navigate to SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. You'll see the SQL Editor interface with a query area

## 🗄️ Step 2: Run the First Script (Create Tables)

### 2.1 Create New Query
1. Click **"New query"** button (usually at the top)
2. You'll get a blank SQL editor

### 2.2 Copy the Script
1. Go back to your downloaded code
2. Open the file: `scripts/001-create-tables.sql`
3. **Select ALL content** (Ctrl+A / Cmd+A)
4. **Copy** (Ctrl+C / Cmd+C)

### 2.3 Paste and Execute
1. **Paste** the script into the Supabase SQL editor (Ctrl+V / Cmd+V)
2. **Optional**: Give your query a name like "Create Tables"
3. Click the **"Run"** button (usually green button or Ctrl+Enter)

### 2.4 Verify Success
You should see:
- ✅ **Green success message** at the bottom
- ✅ **"Query executed successfully"** or similar
- ✅ **Notice messages** about tables being created

**Expected Output:**
\`\`\`
✅ Database schema created successfully!
📊 Tables: departments, team_members, leave_requests, audit_log
🔍 Views: leave_conflicts, team_overview, department_stats
⚡ Functions: check_table_exists, get_leave_statistics
🔒 RLS enabled with public access policies
\`\`\`

## 📊 Step 3: Run the Second Script (Add Data)

### 3.1 Create Another New Query
1. Click **"New query"** again
2. You'll get another blank SQL editor

### 3.2 Copy the Second Script
1. Open the file: `scripts/002-seed-data.sql`
2. **Select ALL content** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C)

### 3.3 Paste and Execute
1. **Paste** the script into the new SQL editor
2. **Optional**: Name it "Seed Data"
3. Click **"Run"**

### 3.4 Verify Success
You should see:
- ✅ **Success messages** for each INSERT operation
- ✅ **Final summary** with counts

**Expected Output:**
\`\`\`
✅ Sample data inserted successfully!
🏢 Departments: 8
👥 Team Members: 18
📅 Leave Requests: 10
🎯 Ready for production use!
\`\`\`

## 🔍 Step 4: Verify Your Database

### 4.1 Check Tables Were Created
1. In the left sidebar, click **"Table Editor"**
2. You should see these tables:
   - ✅ `departments`
   - ✅ `team_members` 
   - ✅ `leave_requests`
   - ✅ `audit_log`

### 4.2 Check Data Was Inserted
1. Click on **`departments`** table
2. You should see 8 departments (Engineering, Design, Marketing, etc.)
3. Click on **`team_members`** table
4. You should see 18 team members
5. Click on **`leave_requests`** table
6. You should see 10+ leave requests

## ❌ Troubleshooting Common Issues

### Issue 1: "Permission Denied" Error
**Solution:**
1. Make sure you're the project owner
2. Check if your project is active (not paused)
3. Try refreshing the page and running again

### Issue 2: "Syntax Error" or "Invalid SQL"
**Solution:**
1. Make sure you copied the **entire** script
2. Check for any missing characters at the beginning/end
3. Try copying the script again from a fresh download

### Issue 3: "Table Already Exists" Error
**Solution:**
This is normal if you're re-running scripts. The scripts use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times.

### Issue 4: "Function Does Not Exist" Error
**Solution:**
1. Make sure you ran the first script (001-create-tables.sql) completely
2. The first script creates functions needed by the second script

### Issue 5: Script Runs But No Success Message
**Solution:**
1. Scroll down in the results panel to see all messages
2. Look for any red error messages
3. If you see warnings (yellow), they're usually okay

## 🔧 Alternative Method: Run Scripts Section by Section

If you're having trouble with the full scripts, you can run them in smaller sections:

### For 001-create-tables.sql:
1. **Section 1**: Extensions and departments table
2. **Section 2**: team_members table  
3. **Section 3**: leave_requests table
4. **Section 4**: Indexes and triggers
5. **Section 5**: RLS policies

### For 002-seed-data.sql:
1. **Section 1**: Insert departments
2. **Section 2**: Insert team members
3. **Section 3**: Insert leave requests

## ✅ Verification Checklist

After running both scripts, verify:

- [ ] **Tables exist**: Go to Table Editor and see all 4 tables
- [ ] **Data exists**: Each table has data (not empty)
- [ ] **No errors**: No red error messages in SQL Editor
- [ ] **Functions work**: Try running `SELECT check_table_exists('departments');`

## 🎯 What's Next?

Once your SQL scripts are running successfully:

1. ✅ **Get your API keys** (Settings → API)
2. ✅ **Add environment variables** to Vercel
3. ✅ **Redeploy your app**
4. ✅ **Test the connection**

## 🆘 Still Having Issues?

### Quick Diagnostic Query
Run this in SQL Editor to check your setup:
\`\`\`sql
-- Check if tables exist and have data
SELECT 
  'departments' as table_name, 
  COUNT(*) as row_count 
FROM departments
UNION ALL
SELECT 
  'team_members' as table_name, 
  COUNT(*) as row_count 
FROM team_members
UNION ALL
SELECT 
  'leave_requests' as table_name, 
  COUNT(*) as row_count 
FROM leave_requests;
\`\`\`

**Expected Result:**
\`\`\`
departments    | 8
team_members   | 18  
leave_requests | 10+
\`\`\`

### Get Help
- 📧 **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- 📖 **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- 💬 **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

---

**🎉 Once both scripts run successfully, your database is ready for production use!**
