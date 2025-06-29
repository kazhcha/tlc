import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a fallback client or throw a descriptive error
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found. Using fallback mode.")
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
})()

export const isSupabaseConfigured = () => {
  return supabase !== null && !!supabaseUrl && !!supabaseAnonKey
}

// Completely safe table existence check
export const checkSupabaseTables = async (): Promise<boolean> => {
  if (!supabase) {
    console.log("❌ No Supabase client available")
    return false
  }

  try {
    console.log("🔍 Checking if tables exist...")

    // Use a very simple approach - try to select from information_schema
    // This is the most reliable way to check table existence
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["departments", "team_members", "leave_requests"])

    if (error) {
      console.log("❌ Could not query information_schema:", error.message)
      // If we can't query information_schema, try a different approach
      return await fallbackTableCheck()
    }

    const tableNames = data?.map((row) => row.table_name) || []
    const requiredTables = ["departments", "team_members", "leave_requests"]
    const hasAllTables = requiredTables.every((table) => tableNames.includes(table))

    console.log("📋 Found tables:", tableNames)
    console.log("✅ Has all required tables:", hasAllTables)

    return hasAllTables
  } catch (error) {
    console.log("❌ Error checking tables via information_schema:", error)
    return await fallbackTableCheck()
  }
}

// Fallback method to check tables
const fallbackTableCheck = async (): Promise<boolean> => {
  if (!supabase) return false

  try {
    console.log("🔄 Using fallback table check method...")

    // Try to query each table with a very simple query
    const tableChecks = await Promise.allSettled([
      supabase.rpc("check_table_exists", { table_name: "departments" }),
      supabase.rpc("check_table_exists", { table_name: "team_members" }),
      supabase.rpc("check_table_exists", { table_name: "leave_requests" }),
    ])

    // If RPC functions don't exist, try direct queries with error handling
    if (tableChecks.every((result) => result.status === "rejected")) {
      console.log("🔄 RPC functions not available, trying direct queries...")
      return await directTableCheck()
    }

    const allTablesExist = tableChecks.every((result) => result.status === "fulfilled" && result.value.data === true)

    console.log("✅ Fallback check result:", allTablesExist)
    return allTablesExist
  } catch (error) {
    console.log("❌ Fallback check failed:", error)
    return await directTableCheck()
  }
}

// Direct table check as last resort
const directTableCheck = async (): Promise<boolean> => {
  if (!supabase) return false

  try {
    console.log("🔄 Using direct table check (last resort)...")

    // Try very simple queries and catch specific errors
    const checks = await Promise.allSettled([
      supabase.from("departments").select("count", { count: "exact", head: true }),
      supabase.from("team_members").select("count", { count: "exact", head: true }),
      supabase.from("leave_requests").select("count", { count: "exact", head: true }),
    ])

    const tablesExist = checks.filter((result) => {
      if (result.status === "rejected") return false
      if (result.value.error) {
        const errorMessage = result.value.error.message.toLowerCase()
        // Check for table/relation not found errors
        return (
          !errorMessage.includes("relation") &&
          !errorMessage.includes("does not exist") &&
          !errorMessage.includes("table") &&
          !errorMessage.includes("not found")
        )
      }
      return true
    }).length

    const allExist = tablesExist === 3
    console.log("✅ Direct check result:", allExist, `(${tablesExist}/3 tables found)`)
    return allExist
  } catch (error) {
    console.log("❌ Direct check failed completely:", error)
    return false
  }
}

export type Database = {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          created_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          email: string
          department: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          department: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          department?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          employee_name: string
          employee_id: string
          start_date: string
          end_date: string
          leave_type: "vacation" | "sick" | "personal" | "maternity" | "paternity"
          reason: string
          submitted_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_name: string
          employee_id: string
          start_date: string
          end_date: string
          leave_type: "vacation" | "sick" | "personal" | "maternity" | "paternity"
          reason: string
          submitted_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_name?: string
          employee_id?: string
          start_date?: string
          end_date?: string
          leave_type?: "vacation" | "sick" | "personal" | "maternity" | "paternity"
          reason?: string
          submitted_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
