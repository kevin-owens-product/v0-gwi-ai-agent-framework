/**
 * @prompt-id forge-v4.1:feature:admin-activity:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  User,
  Building2,
  Shield,
  Settings,
  Flag,
  Lock,
  FileText,
  Clock,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useState } from "react"

interface Admin {
  id: string
  name: string
  email: string
  role: string
}

interface Activity {
  id: string
  adminId: string
  action: string
  resourceType: string
  resourceId: string | null
  description: string | null
  ipAddress: string | null
  userAgent: string | null
  duration: number | null
  status: string
  errorMessage: string | null
  metadata: Record<string, unknown>
  createdAt: string
  admin?: Admin
}

interface ActivityTimelineProps {
  activities: Activity[]
  isLoading?: boolean
  emptyMessage?: string
}

const actionColors: Record<string, string> = {
  success: "bg-green-500",
  failure: "bg-red-500",
  pending: "bg-amber-500",
}

const resourceIcons: Record<string, typeof User> = {
  user: User,
  tenant: Building2,
  admin: Shield,
  config: Settings,
  feature_flag: Flag,
  security_policy: Lock,
  ip_blocklist: Globe,
  session: Clock,
  compliance_audit: FileText,
  data_export: FileText,
  legal_hold: FileText,
  maintenance: Settings,
  incident: AlertCircle,
  release: Flag,
}

function formatActionName(action: string): string {
  return action
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return "just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

export function ActivityTimeline({
  activities,
  isLoading = false,
  emptyMessage,
}: ActivityTimelineProps) {
  const t = useTranslations("admin.activity")
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const defaultEmptyMessage = emptyMessage || t("noActivitiesFound")

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setSheetOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">{defaultEmptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-[600px] pr-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {activities.map((activity) => {
              const ResourceIcon = resourceIcons[activity.resourceType] || FileText
              const isSuccess = activity.status === "success"
              const isFailure = activity.status === "failure"

              return (
                <div
                  key={activity.id}
                  className="relative pl-10 cursor-pointer group"
                  onClick={() => handleActivityClick(activity)}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2.5 top-2 h-3 w-3 rounded-full border-2 border-background transition-all group-hover:scale-125 ${
                      actionColors[activity.status] || "bg-secondary"
                    }`}
                  />

                  {/* Activity card */}
                  <div className="rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            isSuccess
                              ? "bg-green-500/10"
                              : isFailure
                              ? "bg-red-500/10"
                              : "bg-primary/10"
                          }`}
                        >
                          <ResourceIcon
                            className={`h-4 w-4 ${
                              isSuccess
                                ? "text-green-500"
                                : isFailure
                                ? "text-red-500"
                                : "text-primary"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {formatActionName(activity.action)}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {activity.resourceType}
                            </Badge>
                            {isSuccess && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {isFailure && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>

                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {activity.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {activity.admin && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{activity.admin.name}</span>
                              </div>
                            )}
                            {activity.resourceId && (
                              <div className="flex items-center gap-1">
                                <span className="font-mono truncate max-w-[120px]">
                                  {activity.resourceId}
                                </span>
                              </div>
                            )}
                            {activity.duration !== null && (
                              <span>{activity.duration}ms</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Activity Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          {selectedActivity && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("activityDetails")}
                </SheetTitle>
                <SheetDescription>
                  {new Date(selectedActivity.createdAt).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("actionLabel")}</p>
                    <p className="mt-1 font-medium">
                      {formatActionName(selectedActivity.action)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("statusLabel")}</p>
                    <div className="mt-1">
                      <Badge
                        className={`${
                          actionColors[selectedActivity.status] || "bg-secondary"
                        } text-white`}
                      >
                        {selectedActivity.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("resourceType")}</p>
                    <Badge variant="outline" className="mt-1">
                      {selectedActivity.resourceType}
                    </Badge>
                  </div>
                  {selectedActivity.resourceId && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("resourceId")}</p>
                      <p className="mt-1 text-sm font-mono truncate">
                        {selectedActivity.resourceId}
                      </p>
                    </div>
                  )}
                  {selectedActivity.admin && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("adminName")}</p>
                        <p className="mt-1 text-sm font-medium">
                          {selectedActivity.admin.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("adminEmail")}</p>
                        <p className="mt-1 text-sm">{selectedActivity.admin.email}</p>
                      </div>
                    </>
                  )}
                  {selectedActivity.duration !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("duration")}</p>
                      <p className="mt-1 text-sm">{selectedActivity.duration}ms</p>
                    </div>
                  )}
                  {selectedActivity.ipAddress && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("ipAddress")}</p>
                      <p className="mt-1 text-sm font-mono">
                        {selectedActivity.ipAddress}
                      </p>
                    </div>
                  )}
                </div>

                {selectedActivity.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("descriptionLabel")}</p>
                    <p className="text-sm">{selectedActivity.description}</p>
                  </div>
                )}

                {selectedActivity.errorMessage && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("errorMessage")}</p>
                    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
                      {selectedActivity.errorMessage}
                    </p>
                  </div>
                )}

                {selectedActivity.userAgent && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("userAgent")}</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {selectedActivity.userAgent}
                    </p>
                  </div>
                )}

                {Object.keys(selectedActivity.metadata).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("metadata")}</p>
                    <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-[200px]">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
