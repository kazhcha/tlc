"use client"

import type React from "react"
import type { Department } from "@/types/department" // Import Department type

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { TeamMember, LeaveRequest } from "@/app/page"

// Update the LeaveFormProps interface to include departments
interface LeaveFormProps {
  teamMembers: TeamMember[]
  departments: Department[]
  onSubmit: (leave: Omit<LeaveRequest, "id" | "submittedDate">) => void
}

// Update the component signature
export function LeaveForm({ teamMembers, departments, onSubmit }: LeaveFormProps) {
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [leaveType, setLeaveType] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEmployee || !startDate || !endDate || !leaveType || !reason) {
      alert("Please fill in all fields")
      return
    }

    const employee = teamMembers.find((member) => member.id === selectedEmployee)
    if (!employee) return

    onSubmit({
      employeeName: employee.name,
      employeeId: employee.id,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      leaveType: leaveType as LeaveRequest["leaveType"],
      reason,
    })

    // Reset form
    setSelectedEmployee("")
    setStartDate(undefined)
    setEndDate(undefined)
    setLeaveType("")
    setReason("")

    alert("Leave request submitted and approved successfully!")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="employee">Employee</Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} - {member.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type</Label>
          <Select value={leaveType} onValueChange={setLeaveType}>
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
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => (startDate ? date < startDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          placeholder="Please provide a reason for your leave request..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Submit Leave Request
      </Button>
    </form>
  )
}
