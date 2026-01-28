/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, Eye, RotateCcw, Clock, User, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface TemplateVersion {
  id: string
  version: number
  subject: string
  htmlContent: string
  textContent: string | null
  changedBy: string | null
  changeNote: string | null
  createdAt: string
}

interface VersionHistoryProps {
  versions: TemplateVersion[]
  currentVersion: number
  onRestore: (version: TemplateVersion) => void
}

export function VersionHistory({ versions, currentVersion, onRestore }: VersionHistoryProps) {
  const t = useTranslations("admin.emailTemplates")
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [compareVersions, setCompareVersions] = useState<{
    old: TemplateVersion | null
    new: TemplateVersion | null
  }>({ old: null, new: null })

  const handlePreview = (version: TemplateVersion) => {
    setSelectedVersion(version)
    setPreviewOpen(true)
  }

  const handleCompare = (oldVersion: TemplateVersion, newVersion: TemplateVersion) => {
    setCompareVersions({ old: oldVersion, new: newVersion })
    setCompareOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <div>
            <CardTitle>{t("versionHistory.title")}</CardTitle>
            <CardDescription>
              {t("versionHistory.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("versionHistory.noHistory")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">{t("versionHistory.version")}</TableHead>
                <TableHead>{t("versionHistory.subject")}</TableHead>
                <TableHead>{t("versionHistory.changeNote")}</TableHead>
                <TableHead>{t("versionHistory.changedBy")}</TableHead>
                <TableHead>{t("versionHistory.date")}</TableHead>
                <TableHead className="w-32 text-right">{t("versionHistory.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version, index) => (
                <TableRow
                  key={version.id}
                  className={cn(version.version === currentVersion && "bg-muted/50")}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">v{version.version}</span>
                      {version.version === currentVersion && (
                        <Badge variant="default" className="text-xs">
                          {t("versionHistory.current")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {version.subject}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {version.changeNote || "-"}
                  </TableCell>
                  <TableCell>
                    {version.changedBy ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-sm">{version.changedBy.slice(0, 8)}...</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="h-3 w-3" />
                      {formatDate(version.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(version)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {index < versions.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompare(versions[index + 1], version)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      {version.version !== currentVersion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestore(version)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t("versionHistory.versionPreview", { version: selectedVersion?.version || 0 })}
              </DialogTitle>
              <DialogDescription>
                {selectedVersion?.changeNote || t("versionHistory.noChangeNote")}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">{t("versionHistory.tabs.preview")}</TabsTrigger>
                <TabsTrigger value="html">{t("versionHistory.tabs.html")}</TabsTrigger>
                <TabsTrigger value="text">{t("versionHistory.tabs.plainText")}</TabsTrigger>
              </TabsList>
              <TabsContent value="preview">
                <div className="border rounded-lg bg-white p-4">
                  <div className="border-b pb-2 mb-4">
                    <p className="text-sm font-medium">
                      {t("versionHistory.subject")}: {selectedVersion?.subject}
                    </p>
                  </div>
                  {selectedVersion?.htmlContent && (
                    <iframe
                      srcDoc={selectedVersion.htmlContent}
                      className="w-full border-0"
                      style={{ minHeight: "400px" }}
                      title="Version Preview"
                      sandbox="allow-same-origin"
                    />
                  )}
                </div>
              </TabsContent>
              <TabsContent value="html">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-[400px] overflow-y-auto">
                  {selectedVersion?.htmlContent}
                </pre>
              </TabsContent>
              <TabsContent value="text">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                  {selectedVersion?.textContent || t("versionHistory.noPlainText")}
                </pre>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                {t("versionHistory.close")}
              </Button>
              {selectedVersion && selectedVersion.version !== currentVersion && (
                <Button
                  onClick={() => {
                    onRestore(selectedVersion)
                    setPreviewOpen(false)
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("versionHistory.restoreThisVersion")}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Compare Dialog */}
        <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t("versionHistory.compareVersions", { oldVersion: compareVersions.old?.version || 0, newVersion: compareVersions.new?.version || 0 })}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">
                  {t("versionHistory.versionOlder", { version: compareVersions.old?.version || 0 })}
                </h4>
                <div className="border rounded-lg p-4 bg-red-50/50">
                  <p className="text-sm mb-2">
                    <span className="font-medium">{t("versionHistory.subject")}:</span>{" "}
                    {compareVersions.old?.subject}
                  </p>
                  <pre className="text-xs font-mono bg-background p-2 rounded max-h-[300px] overflow-auto">
                    {compareVersions.old?.htmlContent.slice(0, 2000)}
                    {(compareVersions.old?.htmlContent.length || 0) > 2000 && "..."}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  {t("versionHistory.versionNewer", { version: compareVersions.new?.version || 0 })}
                </h4>
                <div className="border rounded-lg p-4 bg-green-50/50">
                  <p className="text-sm mb-2">
                    <span className="font-medium">{t("versionHistory.subject")}:</span>{" "}
                    {compareVersions.new?.subject}
                  </p>
                  <pre className="text-xs font-mono bg-background p-2 rounded max-h-[300px] overflow-auto">
                    {compareVersions.new?.htmlContent.slice(0, 2000)}
                    {(compareVersions.new?.htmlContent.length || 0) > 2000 && "..."}
                  </pre>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setCompareOpen(false)}>
                {t("versionHistory.close")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
