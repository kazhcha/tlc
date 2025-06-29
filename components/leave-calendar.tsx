"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import type { LeaveRequest, TeamMember } from "@/app/page"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Pencil, Trash2 } from "lucide-react"
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

interface LeaveCalendarProps {
  leaveRequests: LeaveRequest[]
  teamMembers: TeamMember[]
  onEditLeave: (leave: LeaveRequest) => void
  onDeleteLeave: (leaveId: string) => void
}

const leaveTypeColors = {
  vacation: "bg-blue-100 text-blue-800 border-blue-200",
  sick: "bg-red-100 text-red-800 border-red-200",
  personal: "bg-green-100 text-green-800 border-green-200",
  maternity: "bg-purple-100 text-purple-800 border-purple-200",
  paternity: "bg-orange-100 text-orange-800 border-orange-200",
}

export function LeaveCalendar({ leaveRequests, teamMembers, onEditLeave, onDeleteLeave }: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null)
  const [editStartDate, setEditStartDate] = useState<Date>()
  const [editEndDate, setEditEndDate] = useState<Date>()
  const [editLeaveType, setEditLeaveType] = useState("")
  const [editReason, setEditReason] = useState("")

  const getLeaveForDate = (date: Date) => {
    return leaveRequests.filter((leave) => {
      const leaveStart = new Date(leave.startDate)
      const leaveEnd = new Date(leave.endDate)
      return date >= leaveStart && date <= leaveEnd
    })
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const openEditDialog = (leave: LeaveRequest) => {
    setEditingLeave(leave)
    setEditStartDate(new Date(leave.startDate))
    setEditEndDate(new Date(leave.endDate))
    setEditLeaveType(leave.leaveType)
    setEditReason(leave.reason)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingLeave || !editStartDate || !editEndDate || !editLeaveType || !editReason) {
      alert("Please fill in all fields")
      return
    }

    const updatedLeave: LeaveRequest = {
      ...editingLeave,
      startDate: format(editStartDate, "yyyy-MM-dd"),
      endDate: format(editEndDate, "yyyy-MM-dd"),
      leaveType: editLeaveType as LeaveRequest["leaveType"],
      reason: editReason,
    }

    onEditLeave(updatedLeave)
    setIsEditDialogOpen(false)
    setEditingLeave(null)
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day) => {
          const dayLeaves = getLeaveForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())

          return (
            <Card key={day.toISOString()} className={`min-h-[120px] ${!isCurrentMonth ? "opacity-50" : ""}`}>
              <CardContent className="p-2">
                <div className={`text-sm font-medium mb-2 ${isToday ? "text-blue-600" : ""}`}>{format(day, "d")}</div>
                <div className="space-y-1">
                  {dayLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="text-xs p-1 rounded border bg-white hover:bg-gray-50 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium truncate">{leave.employeeName}</div>
                          <Badge variant="secondary" className={`text-xs ${leaveTypeColors[leave.leaveType]}`}>
                            {leave.leaveType}
                          </Badge>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditDialog(leave)
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 text-red-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Leave Request</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this leave request for {leave.employeeName}? This
                                  action cannot be undone.
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {/* Edit Leave Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogDescription>Update the leave request details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Input value={editingLeave?.employeeName || ""} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editStartDate ? format(editStartDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={editStartDate} onSelect={setEditStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editEndDate ? format(editEndDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editEndDate}
                        onSelect={setEditEndDate}
                        initialFocus
                        disabled={(date) => (editStartDate ? date < editStartDate : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={editLeaveType} onValueChange={setEditLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                    <SelectItem value="paternity">Paternity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Enter reason for leave"
                  rows={3}
                />
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
    </div>
  )
}
