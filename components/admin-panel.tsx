"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, UserPlus, AlertTriangle, Building2, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TeamMember, Department } from "@/app/page"

interface AdminPanelProps {
  teamMembers: TeamMember[]
  departments: Department[]
  onAddMember: (member: Omit<TeamMember, "id">) => void
  onEditMember: (member: TeamMember) => void
  onDeleteMember: (memberId: string) => void
  onAddDepartment: (name: string) => void
  onEditDepartment: (departmentId: string, newName: string) => void
  onDeleteDepartment: (departmentId: string) => void
}

export function AdminPanel({
  teamMembers,
  departments,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
}: AdminPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  // Department management states
  const [isAddDeptDialogOpen, setIsAddDeptDialogOpen] = useState(false)
  const [isEditDeptDialogOpen, setIsEditDeptDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [newDeptName, setNewDeptName] = useState("")
  const [editDeptName, setEditDeptName] = useState("")

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [department, setDepartment] = useState("")

  const resetForm = () => {
    setName("")
    setEmail("")
    setDepartment("")
  }

  const resetDeptForm = () => {
    setNewDeptName("")
    setEditDeptName("")
    setEditingDepartment(null)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !department) {
      alert("Please fill in all fields")
      return
    }

    // Check if email already exists
    if (teamMembers.some((member) => member.email === email)) {
      alert("A team member with this email already exists")
      return
    }

    onAddMember({ name, email, department })
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !department || !editingMember) {
      alert("Please fill in all fields")
      return
    }

    // Check if email already exists (excluding current member)
    if (teamMembers.some((member) => member.email === email && member.id !== editingMember.id)) {
      alert("A team member with this email already exists")
      return
    }

    onEditMember({
      ...editingMember,
      name,
      email,
      department,
    })

    resetForm()
    setEditingMember(null)
    setIsEditDialogOpen(false)
  }

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDeptName.trim()) {
      alert("Please enter a department name")
      return
    }

    // Check if department already exists
    if (departments.some((dept) => dept.name.toLowerCase() === newDeptName.toLowerCase())) {
      alert("A department with this name already exists")
      return
    }

    onAddDepartment(newDeptName.trim())
    resetDeptForm()
    setIsAddDeptDialogOpen(false)
  }

  const handleEditDepartment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editDeptName.trim() || !editingDepartment) {
      alert("Please enter a department name")
      return
    }

    // Check if department name already exists (excluding current department)
    if (
      departments.some(
        (dept) => dept.name.toLowerCase() === editDeptName.toLowerCase() && dept.id !== editingDepartment.id,
      )
    ) {
      alert("A department with this name already exists")
      return
    }

    onEditDepartment(editingDepartment.id, editDeptName.trim())
    resetDeptForm()
    setIsEditDeptDialogOpen(false)
  }

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member)
    setName(member.name)
    setEmail(member.email)
    setDepartment(member.department)
    setIsEditDialogOpen(true)
  }

  const openEditDeptDialog = (dept: Department) => {
    setEditingDepartment(dept)
    setEditDeptName(dept.name)
    setIsEditDeptDialogOpen(true)
  }

  const handleDelete = (memberId: string) => {
    onDeleteMember(memberId)
  }

  const handleDeleteDept = (departmentId: string) => {
    const department = departments.find((dept) => dept.id === departmentId)
    if (!department) return

    const membersInDepartment = teamMembers.filter((member) => member.department === department.name)
    if (membersInDepartment.length > 0) {
      alert(
        `Cannot delete department "${department.name}" because ${membersInDepartment.length} team member(s) are assigned to it.`,
      )
      return
    }

    onDeleteDepartment(departmentId)
  }

  const getDepartmentStats = () => {
    const stats = teamMembers.reduce(
      (acc, member) => {
        acc[member.department] = (acc[member.department] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return departments.map((dept) => ({
      ...dept,
      memberCount: stats[dept.name] || 0,
    }))
  }

  const departmentStats = getDepartmentStats()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-sm text-gray-500">Total Team Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-sm text-gray-500">Departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {departments.length > 0 ? Math.round(teamMembers.length / departments.length) : 0}
            </div>
            <p className="text-sm text-gray-500">Avg per Department</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Department Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Team member distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {departmentStats.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{dept.name}</span>
                    <Badge variant="secondary">{dept.memberCount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Members Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team members</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to your team. They will be able to submit leave requests.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-name">Full Name</Label>
                          <Input
                            id="add-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-email">Email</Label>
                          <Input
                            id="add-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-department">Department</Label>
                          <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Member</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.department}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(member)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  Delete Team Member
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{member.name}</strong>? This will also remove
                                  all their leave requests. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(member.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          {/* Departments Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>Manage your organization's departments</CardDescription>
                </div>
                <Dialog open={isAddDeptDialogOpen} onOpenChange={setIsAddDeptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                      <DialogDescription>Create a new department for your organization.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddDepartment}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="dept-name">Department Name</Label>
                          <Input
                            id="dept-name"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            placeholder="Enter department name"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddDeptDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Department</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Team Members</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dept.memberCount} members</Badge>
                      </TableCell>
                      <TableCell>{new Date(dept.createdDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDeptDialog(dept)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={dept.memberCount > 0}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  Delete Department
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the <strong>{dept.name}</strong> department? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDept(dept.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update the team member's information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDeptDialogOpen} onOpenChange={setIsEditDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update the department name.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDepartment}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dept-name">Department Name</Label>
                <Input
                  id="edit-dept-name"
                  value={editDeptName}
                  onChange={(e) => setEditDeptName(e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDeptDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
