"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import type { TeamMember, LeaveRequest } from "@/app/page"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface TeamOverviewProps {
  teamMembers: TeamMember[]
  leaveRequests: LeaveRequest[]
  onEditLeave: (leave: LeaveRequest) => void
  onDeleteLeave: (leaveId: string) => void
}

const leaveTypeColors = {
  vacation: "bg-blue-100 text-blue-800",
  sick: "bg-red-100 text-red-800",
  personal: "bg-green-100 text-green-800",
  maternity: "bg-purple-100 text-purple-800",
  paternity: "bg-orange-100 text-orange-800",
}

const getUpcomingLeaves = (leaveRequests: LeaveRequest[]) => {
  const today = new Date()
  return leaveRequests
    .filter((leave) => new Date(leave.startDate) >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5)
}

export function TeamOverview({ teamMembers, leaveRequests, onEditLeave, onDeleteLeave }: TeamOverviewProps) {
  const getLeaveRequestsForEmployee = (employeeId: string) => {
    return leaveRequests.filter((leave) => leave.employeeId === employeeId)
  }

  const upcomingLeaves = getUpcomingLeaves(leaveRequests)

  return (
    <div className="space-y-6">
      {/* Upcoming Leaves */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Leaves</CardTitle>
          <CardDescription>Next 5 scheduled leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingLeaves.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming approved leaves</p>
          ) : (
            <div className="space-y-3">
              {upcomingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {leave.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{leave.employeeName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge className={leaveTypeColors[leave.leaveType]}>{leave.leaveType}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Overview of all team members and their departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => {
              const memberLeaves = getLeaveRequestsForEmployee(member.id)
              const totalLeaves = memberLeaves.length

              return (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline">{totalLeaves} scheduled leaves</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* All Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
          <CardDescription>Complete list of all leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.employeeName}</TableCell>
                  <TableCell>
                    <Badge className={leaveTypeColors[leave.leaveType]}>{leave.leaveType}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(leave.startDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(new Date(leave.endDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create a simple edit handler that prompts for new dates
                          const newStartDate = prompt("Enter new start date (YYYY-MM-DD):", leave.startDate)
                          const newEndDate = prompt("Enter new end date (YYYY-MM-DD):", leave.endDate)
                          const newReason = prompt("Enter new reason:", leave.reason)

                          if (newStartDate && newEndDate && newReason) {
                            onEditLeave({
                              ...leave,
                              startDate: newStartDate,
                              endDate: newEndDate,
                              reason: newReason,
                            })
                          }
                        }}
                      >
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
                            <AlertDialogTitle>Delete Leave Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this leave request for {leave.employeeName}? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteLeave(leave.id)}
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
    </div>
  )
}
