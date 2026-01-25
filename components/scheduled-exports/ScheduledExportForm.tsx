/**
 * @prompt-id forge-v4.1:feature:scheduled-exports:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 */

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CronScheduleBuilder } from "./CronScheduleBuilder"
import { Loader2, Plus, X, Mail, FileText, FileSpreadsheet, FileImage, FileJson, File } from "lucide-react"
import type {
  ScheduledExport,
  CreateScheduledExportInput,
  UpdateScheduledExportInput,
  ExportFormat,
  EntityType,
} from "@/hooks/use-scheduled-exports"

// Form schema
const scheduledExportSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  entityType: z.enum(['report', 'dashboard', 'audience', 'crosstab']),
  entityId: z.string().min(1, "Entity ID is required"),
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'POWERPOINT', 'PNG', 'JSON']),
  schedule: z.string().min(1, "Schedule is required"),
  timezone: z.string().default('UTC'),
  recipients: z.array(z.string().email()).default([]),
  isActive: z.boolean().default(true),
})

type FormData = z.infer<typeof scheduledExportSchema>

interface ScheduledExportFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  export?: ScheduledExport | null
  onSubmit: (data: CreateScheduledExportInput | UpdateScheduledExportInput) => Promise<void>
  isLoading?: boolean
  // Optional: Pre-fill entity info when creating from a specific entity
  defaultEntityType?: EntityType
  defaultEntityId?: string
  defaultEntityName?: string
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'PDF', label: 'PDF Document', icon: <FileText className="h-4 w-4" /> },
  { value: 'EXCEL', label: 'Excel Spreadsheet', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { value: 'CSV', label: 'CSV File', icon: <File className="h-4 w-4" /> },
  { value: 'POWERPOINT', label: 'PowerPoint', icon: <FileText className="h-4 w-4" /> },
  { value: 'PNG', label: 'PNG Image', icon: <FileImage className="h-4 w-4" /> },
  { value: 'JSON', label: 'JSON Data', icon: <FileJson className="h-4 w-4" /> },
]

const ENTITY_TYPE_OPTIONS: { value: EntityType; label: string }[] = [
  { value: 'report', label: 'Report' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'audience', label: 'Audience' },
  { value: 'crosstab', label: 'Crosstab' },
]

export function ScheduledExportForm({
  open,
  onOpenChange,
  export: existingExport,
  onSubmit,
  isLoading,
  defaultEntityType,
  defaultEntityId,
  defaultEntityName,
}: ScheduledExportFormProps) {
  const [newRecipient, setNewRecipient] = useState("")

  const isEdit = !!existingExport

  const form = useForm<FormData>({
    resolver: zodResolver(scheduledExportSchema),
    defaultValues: {
      name: "",
      description: "",
      entityType: defaultEntityType || 'report',
      entityId: defaultEntityId || "",
      format: 'PDF',
      schedule: "0 9 * * *", // Daily at 9 AM
      timezone: "UTC",
      recipients: [],
      isActive: true,
    },
  })

  // Reset form when export changes
  useEffect(() => {
    if (existingExport) {
      form.reset({
        name: existingExport.name,
        description: existingExport.description || "",
        entityType: existingExport.entityType,
        entityId: existingExport.entityId,
        format: existingExport.format,
        schedule: existingExport.schedule,
        timezone: existingExport.timezone,
        recipients: existingExport.recipients,
        isActive: existingExport.isActive,
      })
    } else {
      form.reset({
        name: defaultEntityName ? `${defaultEntityName} Export` : "",
        description: "",
        entityType: defaultEntityType || 'report',
        entityId: defaultEntityId || "",
        format: 'PDF',
        schedule: "0 9 * * *",
        timezone: "UTC",
        recipients: [],
        isActive: true,
      })
    }
  }, [existingExport, defaultEntityType, defaultEntityId, defaultEntityName, form])

  const handleSubmit = async (data: FormData) => {
    if (isEdit) {
      await onSubmit({
        name: data.name,
        description: data.description,
        schedule: data.schedule,
        timezone: data.timezone,
        recipients: data.recipients,
        isActive: data.isActive,
        format: data.format,
      })
    } else {
      await onSubmit({
        name: data.name,
        description: data.description,
        entityType: data.entityType,
        entityId: data.entityId,
        format: data.format,
        schedule: data.schedule,
        timezone: data.timezone,
        recipients: data.recipients,
      })
    }
  }

  const addRecipient = () => {
    const email = newRecipient.trim()
    if (email && z.string().email().safeParse(email).success) {
      const current = form.getValues('recipients')
      if (!current.includes(email)) {
        form.setValue('recipients', [...current, email])
      }
      setNewRecipient("")
    }
  }

  const removeRecipient = (email: string) => {
    const current = form.getValues('recipients')
    form.setValue('recipients', current.filter(e => e !== email))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Scheduled Export' : 'Create Scheduled Export'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the schedule and settings for this export'
              : 'Set up automatic exports on a recurring schedule'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekly Sales Report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of this scheduled export"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Entity Selection - Only for new exports */}
            {!isEdit && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ENTITY_TYPE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter entity ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Format */}
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Format</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FORMAT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Schedule */}
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule</FormLabel>
                  <FormControl>
                    <CronScheduleBuilder
                      value={field.value}
                      onChange={field.onChange}
                      timezone={form.watch('timezone')}
                      onTimezoneChange={(tz) => form.setValue('timezone', tz)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipients */}
            <div className="space-y-2">
              <Label>Email Recipients (optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRecipient()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addRecipient}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.watch('recipients').length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch('recipients').map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email}
                      <button
                        type="button"
                        onClick={() => removeRecipient(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Recipients will receive the export file by email when it runs
              </p>
            </div>

            {/* Active Toggle - Only for edit */}
            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        {field.value
                          ? 'This export is active and will run on schedule'
                          : 'This export is paused and will not run'}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Save Changes' : 'Create Export'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
