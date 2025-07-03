# ⚡ Quick Start: 5-Minute SQL Setup

## 🎯 Goal
Get your Supabase database running in 5 minutes or less.

## 📋 Prerequisites
- ✅ Supabase account created
- ✅ New project created
- ✅ Project is active (not paused)

## 🚀 Steps

### 1️⃣ Open SQL Editor (30 seconds)
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**

### 2️⃣ Run First Script (2 minutes)
1. Copy **ALL** content from `scripts/001-create-tables.sql`
2. Paste into SQL Editor
3. Click **"Run"** button
4. ✅ Wait for success message

### 3️⃣ Run Second Script (1 minute)
1. Click **"New query"** again
2. Copy **ALL** content from `scripts/002-seed-data.sql`
3. Paste into SQL Editor
4. Click **"Run"** button
5. ✅ Wait for success message

### 4️⃣ Verify Setup (1 minute)
1. Click **"Table Editor"** in left sidebar
2. ✅ See 4 tables: departments, team_members, leave_requests, audit_log
3. ✅ Click each table to see data

### 5️⃣ Get API Keys (30 seconds)
1. Click **"Settings"** → **"API"**
2. Copy **"Project URL"**
3. Copy **"Anon public key"**

## ✅ Done!
Your database is ready. Next: Add these to Vercel environment variables and redeploy.

## 🆘 Problems?
- **Error messages?** → Check the full SQL_SETUP_GUIDE.md
- **No data in tables?** → Run the diagnostic-check.sql script
- **Need to start over?** → Run reset-database.sql then start again
