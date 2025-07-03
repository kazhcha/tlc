# 🚀 Supabase Setup Guide for Team Leave Manager

This guide will help you set up Supabase for cloud database and multi-user support.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Your deployed Vercel app URL

## 🔧 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign in or create an account**
4. **Click "New Project"**
5. **Fill in project details:**
   - Organization: Select or create
   - Name: `team-leave-manager`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
6. **Click "Create new project"**

## 🗄️ Step 2: Run Database Scripts

1. **Open your Supabase project dashboard**
2. **Go to SQL Editor (left sidebar)**
3. **Create a new query**
4. **Copy and paste the contents of `scripts/001-create-tables.sql`**
5. **Click "Run" to execute**
6. **Create another new query**
7. **Copy and paste the contents of `scripts/002-seed-data.sql`**
8. **Click "Run" to execute**

## 🔑 Step 3: Get API Keys

1. **Go to Settings → API (left sidebar)**
2. **Copy these values:**
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## ⚙️ Step 4: Configure Vercel Environment Variables

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add these variables:**

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

4. **Click "Save"**
5. **Redeploy your app** (go to Deployments → click "..." → Redeploy)

## ✅ Step 5: Verify Setup

1. **Wait for redeployment to complete**
2. **Visit your app**
3. **Look for "Cloud Synced" indicator in the header**
4. **Test creating/editing team members and leave requests**
5. **Check Supabase dashboard → Table Editor to see data**

## 🔒 Step 6: Security Configuration (Optional)

For production use, consider these security enhancements:

### Enable Email Authentication
\`\`\`sql
-- In Supabase SQL Editor
ALTER TABLE team_members ADD COLUMN user_id UUID REFERENCES auth.users(id);
\`\`\`

### Restrict RLS Policies
\`\`\`sql
-- Example: Only allow users to see their own data
CREATE POLICY "Users can view own data" ON team_members
FOR SELECT USING (auth.uid() = user_id);
\`\`\`

## 📊 Step 7: Database Features Enabled

Your database now includes:

### ✅ **Core Tables**
- `departments` - Department management with budgets
- `team_members` - Enhanced user profiles with roles
- `leave_requests` - Leave tracking with approval workflow
- `audit_log` - Change tracking and history

### ✅ **Advanced Features**
- **Leave balance tracking** - JSON field for different leave types
- **Role-based access** - Admin, Manager, Member roles
- **Audit logging** - Automatic change tracking
- **Conflict detection** - View for overlapping leaves
- **Statistics** - Built-in reporting functions

### ✅ **Performance Optimizations**
- **Indexes** - Optimized queries for large datasets
- **Triggers** - Automatic timestamp updates
- **Views** - Pre-computed statistics and overviews

## 🎯 What's Next?

Your app now supports:
- ☁️ **Cloud sync** across all devices
- 👥 **Multi-user collaboration**
- 📊 **Real-time updates**
- 🔄 **Data persistence**
- 📈 **Scalable architecture**

## 🆘 Troubleshooting

### App still shows "Local Storage"?
- Check environment variables are set correctly
- Ensure you redeployed after adding variables
- Verify Supabase project URL and key

### Database connection errors?
- Confirm SQL scripts ran without errors
- Check Supabase project is active (not paused)
- Verify RLS policies are enabled

### Need help?
- Check Supabase logs in dashboard
- Review browser console for errors
- Ensure all tables were created successfully

## 🚀 Production Ready!

Your Team Leave Manager is now ready for production use with:
- Secure cloud database
- Multi-user support
- Real-time synchronization
- Audit trails
- Scalable architecture

Enjoy your fully-featured team leave management system! 🎉
