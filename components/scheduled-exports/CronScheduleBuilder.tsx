/**
 * @prompt-id forge-v4.1:feature:scheduled-exports:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Clock, Calendar, Info } from "lucide-react"

interface CronScheduleBuilderProps {
  value: string
  onChange: (value: string) => void
  timezone?: string
  onTimezoneChange?: (timezone: string) => void
  className?: string
}

type Frequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
]

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
]

const PRESET_SCHEDULES = [
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at 9 AM', cron: '0 9 * * *' },
  { label: 'Every weekday at 9 AM', cron: '0 9 * * 1-5' },
  { label: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
  { label: 'First day of month at 9 AM', cron: '0 9 1 * *' },
]

function parseCronExpression(cron: string): {
  frequency: Frequency
  minute: number
  hour: number
  dayOfMonth: number
  dayOfWeek: number[]
} {
  const parts = cron.split(' ')
  if (parts.length !== 5) {
    return { frequency: 'daily', minute: 0, hour: 9, dayOfMonth: 1, dayOfWeek: [] }
  }

  const [minute, hour, dayOfMonth, , dayOfWeek] = parts

  // Determine frequency based on cron pattern
  let frequency: Frequency = 'custom'

  if (minute === '0' && hour === '*') {
    frequency = 'hourly'
  } else if (dayOfMonth === '*' && dayOfWeek === '*') {
    frequency = 'daily'
  } else if (dayOfMonth === '*' && dayOfWeek !== '*') {
    frequency = 'weekly'
  } else if (dayOfMonth !== '*' && dayOfWeek === '*') {
    frequency = 'monthly'
  }

  // Parse day of week
  let parsedDayOfWeek: number[] = []
  if (dayOfWeek !== '*') {
    if (dayOfWeek.includes('-')) {
      const [start, end] = dayOfWeek.split('-').map(Number)
      for (let i = start; i <= end; i++) {
        parsedDayOfWeek.push(i)
      }
    } else if (dayOfWeek.includes(',')) {
      parsedDayOfWeek = dayOfWeek.split(',').map(Number)
    } else {
      parsedDayOfWeek = [parseInt(dayOfWeek)]
    }
  }

  return {
    frequency,
    minute: minute === '*' ? 0 : parseInt(minute),
    hour: hour === '*' ? 9 : parseInt(hour),
    dayOfMonth: dayOfMonth === '*' ? 1 : parseInt(dayOfMonth),
    dayOfWeek: parsedDayOfWeek,
  }
}

function buildCronExpression(
  frequency: Frequency,
  minute: number,
  hour: number,
  dayOfMonth: number,
  dayOfWeek: number[]
): string {
  switch (frequency) {
    case 'hourly':
      return `${minute} * * * *`
    case 'daily':
      return `${minute} ${hour} * * *`
    case 'weekly':
      const days = dayOfWeek.length > 0 ? dayOfWeek.join(',') : '1'
      return `${minute} ${hour} * * ${days}`
    case 'monthly':
      return `${minute} ${hour} ${dayOfMonth} * *`
    default:
      return `${minute} ${hour} * * *`
  }
}

function describeCronExpression(cron: string): string {
  const { frequency, minute, hour, dayOfMonth, dayOfWeek } = parseCronExpression(cron)

  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

  switch (frequency) {
    case 'hourly':
      return `Every hour at ${minute} minutes past the hour`
    case 'daily':
      return `Every day at ${timeStr}`
    case 'weekly':
      if (dayOfWeek.length === 5 && !dayOfWeek.includes(0) && !dayOfWeek.includes(6)) {
        return `Every weekday at ${timeStr}`
      }
      const dayNames = dayOfWeek.map(d => DAYS_OF_WEEK[d].label).join(', ')
      return `Every ${dayNames} at ${timeStr}`
    case 'monthly':
      const suffix = dayOfMonth === 1 ? 'st' : dayOfMonth === 2 ? 'nd' : dayOfMonth === 3 ? 'rd' : 'th'
      return `On the ${dayOfMonth}${suffix} of every month at ${timeStr}`
    default:
      return `Custom schedule: ${cron}`
  }
}

export function CronScheduleBuilder({
  value,
  onChange,
  timezone = 'UTC',
  onTimezoneChange,
  className,
}: CronScheduleBuilderProps) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [minute, setMinute] = useState(0)
  const [hour, setHour] = useState(9)
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [selectedDays, setSelectedDays] = useState<number[]>([1])
  const [customCron, setCustomCron] = useState(value)

  // Initialize from value
  useEffect(() => {
    const parsed = parseCronExpression(value)
    setFrequency(parsed.frequency)
    setMinute(parsed.minute)
    setHour(parsed.hour)
    setDayOfMonth(parsed.dayOfMonth)
    setSelectedDays(parsed.dayOfWeek.length > 0 ? parsed.dayOfWeek : [1])
    setCustomCron(value)
  }, [value])

  // Update cron when inputs change
  const updateCron = useCallback(() => {
    if (mode === 'advanced') {
      onChange(customCron)
    } else {
      const cron = buildCronExpression(frequency, minute, hour, dayOfMonth, selectedDays)
      onChange(cron)
    }
  }, [mode, frequency, minute, hour, dayOfMonth, selectedDays, customCron, onChange])

  useEffect(() => {
    updateCron()
  }, [frequency, minute, hour, dayOfMonth, selectedDays, mode])

  const toggleDay = (day: number) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day)
      }
      return [...prev, day].sort()
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'simple' | 'advanced')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-4 mt-4">
          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SCHEDULES.map(preset => (
                <Badge
                  key={preset.cron}
                  variant={value === preset.cron ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onChange(preset.cron)}
                >
                  {preset.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          {frequency !== 'hourly' && (
            <div className="space-y-2">
              <Label>Time</Label>
              <div className="flex gap-2">
                <Select value={hour.toString()} onValueChange={(v) => setHour(parseInt(v))}>
                  <SelectTrigger className="w-24">
                    <Clock className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex items-center text-muted-foreground">:</span>
                <Select value={minute.toString()} onValueChange={(v) => setMinute(parseInt(v))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 15, 30, 45].map(m => (
                      <SelectItem key={m} value={m.toString()}>
                        {m.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Minute for hourly */}
          {frequency === 'hourly' && (
            <div className="space-y-2">
              <Label>Minutes past the hour</Label>
              <Select value={minute.toString()} onValueChange={(v) => setMinute(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 15, 30, 45].map(m => (
                    <SelectItem key={m} value={m.toString()}>
                      {m.toString().padStart(2, '0')} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Day of Week Selection */}
          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={selectedDays.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.short}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Day of Month Selection */}
          {frequency === 'monthly' && (
            <div className="space-y-2">
              <Label>Day of Month</Label>
              <Select value={dayOfMonth.toString()} onValueChange={(v) => setDayOfMonth(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Cron Expression</Label>
            <Input
              value={customCron}
              onChange={(e) => setCustomCron(e.target.value)}
              onBlur={() => onChange(customCron)}
              placeholder="0 9 * * *"
              className="font-mono"
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Format: minute hour day-of-month month day-of-week
                <br />
                Example: <code className="bg-muted px-1 rounded">0 9 * * 1-5</code> = Every weekday at 9:00 AM
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Timezone */}
      {onTimezoneChange && (
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(tz => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Schedule Description */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{describeCronExpression(value)}</span>
        {timezone !== 'UTC' && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {TIMEZONES.find(tz => tz.value === timezone)?.label || timezone}
          </Badge>
        )}
      </div>
    </div>
  )
}

export { describeCronExpression }
