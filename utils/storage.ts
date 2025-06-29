import type { TeamMember, LeaveRequest, Department } from "@/app/page"

const STORAGE_KEYS = {
  TEAM_MEMBERS: "team-leave-app-members",
  LEAVE_REQUESTS: "team-leave-app-leaves",
  DEPARTMENTS: "team-leave-app-departments",
}

// Team Members Storage
export const saveTeamMembers = (members: TeamMember[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members))
  }
}

export const loadTeamMembers = (): TeamMember[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Leave Requests Storage
export const saveLeaveRequests = (requests: LeaveRequest[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests))
  }
}

export const loadLeaveRequests = (): LeaveRequest[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Departments Storage
export const saveDepartments = (departments: Department[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments))
  }
}

export const loadDepartments = (): Department[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Initialize with default data if empty
export const initializeDefaultData = () => {
  if (typeof window === "undefined") return

  const members = loadTeamMembers()
  const requests = loadLeaveRequests()
  const departments = loadDepartments()

  // Default departments
  if (departments.length === 0) {
    const defaultDepartments: Department[] = [
      {
        id: "1",
        name: "Engineering",
        description:
          "Responsible for software development, system architecture, and technical infrastructure. Handles product development and maintains our technology stack.",
        createdDate: "2024-01-01",
      },
      {
        id: "2",
        name: "Design",
        description:
          "Creates user experiences, visual designs, and brand materials. Focuses on user research, prototyping, and design systems.",
        createdDate: "2024-01-01",
      },
      {
        id: "3",
        name: "Marketing",
        description:
          "Drives brand awareness, lead generation, and customer acquisition. Manages campaigns, content creation, and market research.",
        createdDate: "2024-01-01",
      },
      {
        id: "4",
        name: "HR",
        description:
          "Manages talent acquisition, employee relations, and organizational development. Handles benefits, policies, and workplace culture.",
        createdDate: "2024-01-01",
      },
      {
        id: "5",
        name: "Sales",
        description:
          "Responsible for revenue generation, client relationships, and business development. Manages the sales pipeline and customer success.",
        createdDate: "2024-01-01",
      },
    ]
    saveDepartments(defaultDepartments)
  }

  // Default team members
  if (members.length === 0) {
    const defaultMembers: TeamMember[] = [
      { id: "1", name: "Alice Johnson", email: "alice@company.com", department: "Engineering" },
      { id: "2", name: "Bob Smith", email: "bob@company.com", department: "Design" },
      { id: "3", name: "Carol Davis", email: "carol@company.com", department: "Marketing" },
      { id: "4", name: "David Wilson", email: "david@company.com", department: "Engineering" },
      { id: "5", name: "Eva Brown", email: "eva@company.com", department: "HR" },
    ]
    saveTeamMembers(defaultMembers)
  }

  // Default leave requests
  if (requests.length === 0) {
    const defaultRequests: LeaveRequest[] = [
      {
        id: "1",
        employeeName: "Alice Johnson",
        employeeId: "1",
        startDate: "2024-12-23",
        endDate: "2024-12-27",
        leaveType: "vacation",
        reason: "Christmas holidays",
        submittedDate: "2024-12-01",
      },
      {
        id: "2",
        employeeName: "Bob Smith",
        employeeId: "2",
        startDate: "2024-12-30",
        endDate: "2025-01-02",
        leaveType: "vacation",
        reason: "New Year break",
        submittedDate: "2024-12-05",
      },
      {
        id: "3",
        employeeName: "Carol Davis",
        employeeId: "3",
        startDate: "2025-01-15",
        endDate: "2025-01-17",
        leaveType: "personal",
        reason: "Family event",
        submittedDate: "2024-12-20",
      },
    ]
    saveLeaveRequests(defaultRequests)
  }
}
