"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Circle, ExternalLink, Database, Key, Settings, Rocket, Copy, RefreshCw } from "lucide-react"
import { Label } from "@/components/ui/label"

interface SetupWizardProps {
  onComplete: () => void
  onRetry: () => void
}

export function SetupWizard({ onComplete, onRetry }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    {
      id: 1,
      title: "Create Supabase Project",
      description: "Set up your cloud database",
      icon: Database,
    },
    {
      id: 2,
      title: "Run Database Scripts",
      description: "Initialize tables and data",
      icon: Settings,
    },
    {
      id: 3,
      title: "Configure Environment Variables",
      description: "Connect your app to the database",
      icon: Key,
    },
    {
      id: 4,
      title: "Deploy & Test",
      description: "Verify everything works",
      icon: Rocket,
    },
  ]

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Setup Cloud Database</h2>
        <p className="text-gray-600 mt-2">Enable multi-user support and cloud sync with Supabase</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          const Icon = step.icon

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2
                ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                      ? "border-blue-500 text-blue-500"
                      : "border-gray-300 text-gray-400"
                }
              `}
              >
                {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
              </div>
              <div className="text-center">
                <div
                  className={`font-medium ${isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"}`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-full mt-6 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep - 1].icon} {/* Fixed JSX attribute */}
            Step {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <Alert>
                <Database className="h-4 w-4" />
                <AlertTitle>Create Your Supabase Project</AlertTitle>
                <AlertDescription>
                  Supabase provides a free PostgreSQL database with real-time features.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  <span>Go to supabase.com and create an account</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  <span>Click "New Project"</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  <span>Name: "team-leave-manager"</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  <span>Generate a strong database password</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  <span>Choose your preferred region</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild>
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Supabase
                  </a>
                </Button>
                <Button variant="outline" onClick={() => markStepComplete(1)}>
                  Project Created
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertTitle>Initialize Database Schema</AlertTitle>
                <AlertDescription>Run the SQL scripts to create tables, indexes, and sample data.</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">1. Create Tables Script</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">scripts/001-create-tables.sql</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard("-- Copy the contents of scripts/001-create-tables.sql")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Creates departments, team_members, leave_requests, and audit_log tables
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">2. Sample Data Script</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">scripts/002-seed-data.sql</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard("-- Copy the contents of scripts/002-seed-data.sql")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Inserts sample departments, team members, and leave requests
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Instructions:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>1. Go to your Supabase project → SQL Editor</li>
                    <li>2. Create a new query and paste the first script</li>
                    <li>3. Click "Run" to execute</li>
                    <li>4. Create another query and paste the second script</li>
                    <li>5. Click "Run" to execute</li>
                  </ol>
                </div>
              </div>

              <Button onClick={() => markStepComplete(2)}>Scripts Executed Successfully</Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertTitle>Configure Environment Variables</AlertTitle>
                <AlertDescription>Connect your Vercel app to your Supabase database.</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Get Your Supabase Credentials</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600 mb-2">In your Supabase project, go to Settings → API</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3" />
                        <span className="text-sm">Copy "Project URL"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3" />
                        <span className="text-sm">Copy "Anon public" key</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Add to Vercel Environment Variables</Label>
                  <div className="mt-1 space-y-2">
                    <div className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-center">
                        <code className="text-sm">NEXT_PUBLIC_SUPABASE_URL</code>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_URL")}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Your Supabase project URL</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-center">
                        <code className="text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_ANON_KEY")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Your Supabase anon key</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Instructions:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>1. Go to your Vercel project dashboard</li>
                    <li>2. Navigate to Settings → Environment Variables</li>
                    <li>3. Add both variables with their values</li>
                    <li>4. Save and redeploy your app</li>
                  </ol>
                </div>
              </div>

              <Button onClick={() => markStepComplete(3)}>Environment Variables Added</Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <Alert>
                <Rocket className="h-4 w-4" />
                <AlertTitle>Deploy & Test</AlertTitle>
                <AlertDescription>Verify your cloud database is working correctly.</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">✅ What to Check</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Header shows "Cloud Synced"</li>
                      <li>• Can create team members</li>
                      <li>• Can submit leave requests</li>
                      <li>• Data persists after refresh</li>
                      <li>• No error messages</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🎯 New Features Enabled</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Multi-user collaboration</li>
                      <li>• Real-time data sync</li>
                      <li>• Audit logging</li>
                      <li>• Advanced reporting</li>
                      <li>• Scalable architecture</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={onRetry} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button onClick={onComplete}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setup Complete!
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild>
              <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase Docs
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Vercel Docs
              </a>
            </Button>
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
