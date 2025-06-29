"use client"

import { useState, useEffect } from "react"
import { Calendar, PlusCircle, Users, Settings, AlertCircle, Database, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { LeaveForm } from "@/components/leave-form"
import { LeaveCalendar } from "@/components/leave-calendar"
import { TeamOverview } from "@/components/team-overview"
import { AdminPanel } from "@/components/admin-panel"
import { supabase, isSupabaseConfigured, checkSupabaseTables } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  saveTeamMembers,
  loadTeamMembers,
  saveLeaveRequests,
  loadLeaveRequests,
  saveDepartments,
  loadDepartments,
  initializeDefaultData,
} from "@/utils/storage"

export type LeaveRequest = {
  id: string
  employeeName: string
  employeeId: string
  startDate: string
  endDate: string
  leaveType: "vacation" | "sick" | "personal" | "maternity" | "paternity"
  reason: string
  submittedDate: string
}

export type TeamMember = {
  id: string
  name: string
  email: string
  department: string
  avatar?: string
}

export type Department = {
  id: string
  name: string
  description?: string
  createdDate: string
}

type StorageMode = "localStorage" | "supabase" | "checking"

export default function TeamLeaveApp() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [storageMode, setStorageMode] = useState<StorageMode>("checking")
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const { toast } = useToast()

  // Check storage mode and load data
  useEffect(() => {
    initializeApp()
  }, [])

  // Save data whenever state changes (only for localStorage mode)
  useEffect(() => {
    if (isLoaded && storageMode === "localStorage") {
      try {
        saveTeamMembers(teamMembers)
      } catch (error) {
        console.error("Error saving team members:", error)
      }
    }
  }, [teamMembers, isLoaded, storageMode])

  useEffect(() => {
    if (isLoaded && storageMode === "localStorage") {
      try {
        saveLeaveRequests(leaveRequests)
      } catch (error) {
        console.error("Error saving leave requests:", error)
      }
    }
  }, [leaveRequests, isLoaded, storageMode])

  useEffect(() => {
    if (isLoaded && storageMode === "localStorage") {
      try {
        saveDepartments(departments)
      } catch (error) {
        console.error("Error saving departments:", error)
      }
    }
  }, [departments, isLoaded, storageMode])

  const initializeApp = async () => {
    console.log("🚀 Initializing Team Leave App...")

    try {
      // First check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.log("📱 Supabase not configured, using localStorage")
        setStorageMode("localStorage")
        loadAllDataFromLocalStorage()
        return
      }

      console.log("☁️ Supabase configured, checking database setup...")

      // Check if Supabase tables exist with timeout
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("Database check timeout")), 10000),
      )

      const tablesExist = await Promise.race([checkSupabaseTables(), timeoutPromise])

      console.log("🔍 Tables exist:", tablesExist)

      if (tablesExist) {
        console.log("✅ Database ready, loading from Supabase")
        setStorageMode("supabase")
        await loadAllDataFromSupabase()
      } else {
        console.log("❌ Database not ready, using localStorage")
        setStorageMode("localStorage")
        setSupabaseError("Database tables not found. Please run the SQL setup scripts in your Supabase project.")
        loadAllDataFromLocalStorage()
      }
    } catch (error) {
      console.error("💥 Error during app initialization:", error)
      setStorageMode("localStorage")
      setSupabaseError(
        error instanceof Error
          ? `Database connection failed: ${error.message}. Using local storage mode.`
          : "Failed to connect to database. Using local storage mode.",
      )
      loadAllDataFromLocalStorage()
    }
  }

  const loadAllDataFromLocalStorage = () => {
    console.log("📱 Loading data from localStorage")
    try {
      initializeDefaultData()
      const members = loadTeamMembers()
      const requests = loadLeaveRequests()
      const depts = loadDepartments()

      setTeamMembers(members)
      setLeaveRequests(requests)
      setDepartments(depts)
      setIsLoaded(true)

      console.log("✅ localStorage data loaded:", {
        members: members.length,
        requests: requests.length,
        departments: depts.length,
      })
    } catch (error) {
      console.error("❌ Error loading localStorage data:", error)
      // Initialize with empty data if localStorage fails
      setTeamMembers([])
      setLeaveRequests([])
      setDepartments([])
      setIsLoaded(true)
    }
  }

  const loadAllDataFromSupabase = async () => {
    if (!supabase) {
      console.log("❌ No Supabase client available, falling back to localStorage")
      loadAllDataFromLocalStorage()
      return
    }

    console.log("☁️ Loading data from Supabase database...")

    try {
      // Load all data with individual error handling
      const [deptResult, memberResult, leaveResult] = await Promise.allSettled([
        supabase.from("departments").select("*").order("name"),
        supabase.from("team_members").select("*").order("name"),
        supabase.from("leave_requests").select("*").order("start_date", { ascending: false }),
      ])

      // Process departments
      let departments: Department[] = []
      if (deptResult.status === "fulfilled" && !deptResult.value.error) {
        departments =
          deptResult.value.data?.map((dept) => ({
            id: dept.id,
            name: dept.name,
            description: dept.description || undefined,
            createdDate: dept.created_date,
          })) || []
        console.log("✅ Departments loaded:", departments.length)
      } else {
        console.error(
          "❌ Failed to load departments:",
          deptResult.status === "fulfilled" ? deptResult.value.error : deptResult.reason,
        )
        throw new Error("Failed to load departments")
      }

      // Process team members
      let members: TeamMember[] = []
      if (memberResult.status === "fulfilled" && !memberResult.value.error) {
        members =
          memberResult.value.data?.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            department: member.department,
            avatar: member.avatar_url || undefined,
          })) || []
        console.log("✅ Team members loaded:", members.length)
      } else {
        console.error(
          "❌ Failed to load team members:",
          memberResult.status === "fulfilled" ? memberResult.value.error : memberResult.reason,
        )
        throw new Error("Failed to load team members")
      }

      // Process leave requests
      let leaves: LeaveRequest[] = []
      if (leaveResult.status === "fulfilled" && !leaveResult.value.error) {
        leaves =
          leaveResult.value.data?.map((leave) => ({
            id: leave.id,
            employeeName: leave.employee_name,
            employeeId: leave.employee_id,
            startDate: leave.start_date,
            endDate: leave.end_date,
            leaveType: leave.leave_type,
            reason: leave.reason,
            submittedDate: leave.submitted_date,
          })) || []
        console.log("✅ Leave requests loaded:", leaves.length)
      } else {
        console.error(
          "❌ Failed to load leave requests:",
          leaveResult.status === "fulfilled" ? leaveResult.value.error : leaveResult.reason,
        )
        throw new Error("Failed to load leave requests")
      }

      // Set all data
      setDepartments(departments)
      setTeamMembers(members)
      setLeaveRequests(leaves)
      setIsLoaded(true)

      console.log("🎉 All Supabase data loaded successfully")
    } catch (error) {
      console.error("💥 Error loading data from Supabase:", error)
      setStorageMode("localStorage")
      setSupabaseError(
        `Database error: ${error instanceof Error ? error.message : "Unknown error"}. Using local storage mode.`,
      )
      loadAllDataFromLocalStorage()
    }
  }

  const handleAddMember = async (newMember: Omit<TeamMember, "id">) => {
    if (storageMode === "localStorage" || !supabase) {
      const member: TeamMember = {
        ...newMember,
        id: Date.now().toString(),
      }
      setTeamMembers((prev) => [...prev, member])
      toast({
        title: "Success",
        description: "Team member added successfully!",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("team_members")
        .insert({
          name: newMember.name,
          email: newMember.email,
          department: newMember.department,
          avatar_url: newMember.avatar,
        })
        .select()
        .single()

      if (error) throw error

      const member: TeamMember = {
        id: data.id,
        name: data.name,
        email: data.email,
        department: data.department,
        avatar: data.avatar_url || undefined,
      }

      setTeamMembers((prev) => [...prev, member])
      toast({
        title: "Success",
        description: "Team member added successfully!",
      })
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: "Failed to add team member.",
        variant: "destructive",
      })
    }
  }

  const handleEditMember = async (updatedMember: TeamMember) => {
    if (storageMode === "localStorage" || !supabase) {
      setTeamMembers((prev) => prev.map((member) => (member.id === updatedMember.id ? updatedMember : member)))
      setLeaveRequests((prev) =>
        prev.map((leave) =>
          leave.employeeId === updatedMember.id ? { ...leave, employeeName: updatedMember.name } : leave,
        ),
      )
      toast({
        title: "Success",
        description: "Team member updated successfully!",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("team_members")
        .update({
          name: updatedMember.name,
          email: updatedMember.email,
          department: updatedMember.department,
          avatar_url: updatedMember.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedMember.id)

      if (error) throw error

      setTeamMembers((prev) => prev.map((member) => (member.id === updatedMember.id ? updatedMember : member)))

      // Update leave requests with new employee name if changed
      const { error: leaveError } = await supabase
        .from("leave_requests")
        .update({ employee_name: updatedMember.name })
        .eq("employee_id", updatedMember.id)

      if (leaveError) throw leaveError

      setLeaveRequests((prev) =>
        prev.map((leave) =>
          leave.employeeId === updatedMember.id ? { ...leave, employeeName: updatedMember.name } : leave,
        ),
      )

      toast({
        title: "Success",
        description: "Team member updated successfully!",
      })
    } catch (error) {
      console.error("Error updating member:", error)
      toast({
        title: "Error",
        description: "Failed to update team member.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (storageMode === "localStorage" || !supabase) {
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId))
      setLeaveRequests((prev) => prev.filter((leave) => leave.employeeId !== memberId))
      toast({
        title: "Success",
        description: "Team member deleted successfully!",
      })
      return
    }

    try {
      const { error } = await supabase.from("team_members").delete().eq("id", memberId)

      if (error) throw error

      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId))
      setLeaveRequests((prev) => prev.filter((leave) => leave.employeeId !== memberId))

      toast({
        title: "Success",
        description: "Team member deleted successfully!",
      })
    } catch (error) {
      console.error("Error deleting member:", error)
      toast({
        title: "Error",
        description: "Failed to delete team member.",
        variant: "destructive",
      })
    }
  }

  const handleAddDepartment = async (name: string, description?: string) => {
    if (storageMode === "localStorage" || !supabase) {
      const department: Department = {
        id: Date.now().toString(),
        name,
        description,
        createdDate: new Date().toISOString().split("T")[0],
      }
      setDepartments((prev) => [...prev, department])
      toast({
        title: "Success",
        description: "Department added successfully!",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("departments")
        .insert({
          name,
          description,
        })
        .select()
        .single()

      if (error) throw error

      const department: Department = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        createdDate: data.created_date,
      }

      setDepartments((prev) => [...prev, department])
      toast({
        title: "Success",
        description: "Department added successfully!",
      })
    } catch (error) {
      console.error("Error adding department:", error)
      toast({
        title: "Error",
        description: "Failed to add department.",
        variant: "destructive",
      })
    }
  }

  const handleEditDepartment = async (departmentId: string, newName: string, newDescription?: string) => {
    const oldDepartment = departments.find((dept) => dept.id === departmentId)
    if (!oldDepartment) return

    if (storageMode === "localStorage" || !supabase) {
      setDepartments((prev) =>
        prev.map((dept) => (dept.id === departmentId ? { ...dept, name: newName, description: newDescription } : dept)),
      )
      setTeamMembers((prev) =>
        prev.map((member) => (member.department === oldDepartment.name ? { ...member, department: newName } : member)),
      )
      toast({
        title: "Success",
        description: "Department updated successfully!",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("departments")
        .update({
          name: newName,
          description: newDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", departmentId)

      if (error) throw error

      // Update team members with new department name
      const { error: memberError } = await supabase
        .from("team_members")
        .update({ department: newName })
        .eq("department", oldDepartment.name)

      if (memberError) throw memberError

      setDepartments((prev) =>
        prev.map((dept) => (dept.id === departmentId ? { ...dept, name: newName, description: newDescription } : dept)),
      )

      setTeamMembers((prev) =>
        prev.map((member) => (member.department === oldDepartment.name ? { ...member, department: newName } : member)),
      )

      toast({
        title: "Success",
        description: "Department updated successfully!",
      })
    } catch (error) {
      console.error("Error updating department:", error)
      toast({
        title: "Error",
        description: "Failed to update department.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    const department = departments.find((dept) => dept.id === departmentId)
    if (!department) return

    const membersInDepartment = teamMembers.filter((member) => member.department === department.name)
    if (membersInDepartment.length > 0) {
      toast({
        title: "Cannot Delete",
        description: `Cannot delete department "${department.name}" because ${membersInDepartment.length} team member(s) are assigned to it.`,
        variant: "destructive",
      })
      return
    }

    if (storageMode === "localStorage" || !supabase) {
      setDepartments((prev) => prev.filter((dept) => dept.id !== departmentId))
      toast({
        title: "Success",
        description: "Department deleted successfully!",
      })
      return
    }

    try {
      const { error } = await supabase.from("departments").delete().eq("id", departmentId)

      if (error) throw error

      setDepartments((prev) => prev.filter((dept) => dept.id !== departmentId))
      toast({
        title: "Success",
        description: "Department deleted successfully!",
      })
    } catch (error) {
      console.error("Error deleting department:", error)
      toast({
        title: "Error",
        description: "Failed to delete department.",
        variant: "destructive",
      })
    }
  }

  const handleLeaveSubmit = async (newLeave: Omit<LeaveRequest, "id" | "submittedDate">) => {
    if (storageMode === "localStorage" || !supabase) {
      const leave: LeaveRequest = {
        ...newLeave,
        id: Date.now().toString(),
        submittedDate: new Date().toISOString().split("T")[0],
      }
      setLeaveRequests((prev) => [leave, ...prev])
      toast({
        title: "Success",
        description: "Leave request submitted successfully!",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("leave_requests")
        .insert({
          employee_name: newLeave.employeeName,
          employee_id: newLeave.employeeId,
          start_date: newLeave.startDate,
          end_date: newLeave.endDate,
          leave_type: newLeave.leaveType,
          reason: newLeave.reason,
        })
        .select()
        .single()

      if (error) throw error

      const leave: LeaveRequest = {
        id: data.id,
        employeeName: data.employee_name,
        employeeId: data.employee_id,
        startDate: data.start_date,
        endDate: data.end_date,
        leaveType: data.leave_type,
        reason: data.reason,
        submittedDate: data.submitted_date,
      }

      setLeaveRequests((prev) => [leave, ...prev])
      toast({
        title: "Success",
        description: "Leave request submitted successfully!",
      })
    } catch (error) {
      console.error("Error submitting leave:", error)
      toast({
        title: "Error",
        description: "Failed to submit leave request.",
        variant: "destructive",
      })
    }
  }

  const handleEditLeave = async (updatedLeave: LeaveRequest) => {
    if (storageMode === "localStorage" || !supabase) {
      setLeaveRequests((prev) => prev.map((leave) => (leave.id === updatedLeave.id ? updatedLeave : leave)))
      toast({
        title: "Success",
        description: "Leave request updated successfully!",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          start_date: updatedLeave.startDate,
          end_date: updatedLeave.endDate,
          leave_type: updatedLeave.leaveType,
          reason: updatedLeave.reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedLeave.id)

      if (error) throw error

      setLeaveRequests((prev) => prev.map((leave) => (leave.id === updatedLeave.id ? updatedLeave : leave)))

      toast({
        title: "Success",
        description: "Leave request updated successfully!",
      })
    } catch (error) {
      console.error("Error updating leave:", error)
      toast({
        title: "Error",
        description: "Failed to update leave request.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLeave = async (leaveId: string) => {
    if (storageMode === "localStorage" || !supabase) {
      setLeaveRequests((prev) => prev.filter((leave) => leave.id !== leaveId))
      toast({
        title: "Success",
        description: "Leave request deleted successfully!",
      })
      return
    }

    try {
      const { error } = await supabase.from("leave_requests").delete().eq("id", leaveId)

      if (error) throw error

      setLeaveRequests((prev) => prev.filter((leave) => leave.id !== leaveId))
      toast({
        title: "Success",
        description: "Leave request deleted successfully!",
      })
    } catch (error) {
      console.error("Error deleting leave:", error)
      toast({
        title: "Error",
        description: "Failed to delete leave request.",
        variant: "destructive",
      })
    }
  }

  // Show loading state while checking storage mode
  if (storageMode === "checking" || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading team data...</p>
          <p className="text-sm text-gray-400 mt-2">Checking database connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Team Leave Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">{teamMembers.length} team members</div>
              <div
                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                  storageMode === "localStorage" ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50"
                }`}
              >
                {storageMode === "localStorage" ? (
                  <>
                    <Database className="h-3 w-3" />
                    Local Storage
                  </>
                ) : (
                  <>
                    <Database className="h-3 w-3" />
                    Cloud Synced
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show setup alert if using localStorage due to missing tables */}
        {storageMode === "localStorage" && supabaseError && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required - Using Demo Mode</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <p>{supabaseError}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Supabase Dashboard
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Retry Connection
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Show demo mode alert if no Supabase config */}
        {storageMode === "localStorage" && !supabaseError && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Demo Mode - Local Storage</AlertTitle>
            <AlertDescription>
              You're currently using local storage. Data will be lost when you close the browser. To enable cloud sync
              and multi-user collaboration, configure Supabase integration.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leave Calendar
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Request Leave
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Overview
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Leave Calendar</CardTitle>
                <CardDescription>View and manage all team leave requests - click on any leave to edit</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveCalendar
                  leaveRequests={leaveRequests}
                  teamMembers={teamMembers}
                  onEditLeave={handleEditLeave}
                  onDeleteLeave={handleDeleteLeave}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Leave Request</CardTitle>
                <CardDescription>Request time off and specify the dates and reason</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveForm teamMembers={teamMembers} departments={departments} onSubmit={handleLeaveSubmit} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamOverview
              teamMembers={teamMembers}
              leaveRequests={leaveRequests}
              onEditLeave={handleEditLeave}
              onDeleteLeave={handleDeleteLeave}
            />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <AdminPanel
              teamMembers={teamMembers}
              departments={departments}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onAddDepartment={handleAddDepartment}
              onEditDepartment={handleEditDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
