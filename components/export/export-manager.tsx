"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileJson,
  File,
  Loader2,
  Settings,
  Clock,
  Copy,
  ChevronDown,
  Eye,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

// Export format types
export type ExportFormat = "pdf" | "excel" | "csv" | "png" | "svg" | "json" | "pptx" | "html"

// Export options interface
export interface ExportOptions {
  format: ExportFormat
  fileName: string
  includeTitle: boolean
  includeTimestamp: boolean
  includeLogo: boolean
  logoUrl?: string
  orientation: "portrait" | "landscape"
  paperSize: "a4" | "a3" | "letter" | "legal"
  quality: "low" | "medium" | "high"
  compression: boolean
  watermark?: string
  password?: string
  // PDF specific
  pdfMargins?: { top: number; right: number; bottom: number; left: number }
  pdfHeader?: string
  pdfFooter?: string
  // Excel specific
  excelSheetName?: string
  excelIncludeFormulas?: boolean
  excelAutoFilter?: boolean
  excelFreezeRows?: number
  excelFreezeColumns?: number
  excelNumberFormat?: string
  // CSV specific
  csvDelimiter?: "," | ";" | "\t" | "|"
  csvQuoteStrings?: boolean
  csvEncoding?: "utf-8" | "utf-16" | "ascii"
  // Image specific
  imageWidth?: number
  imageHeight?: number
  imageScale?: number
  imageBackground?: string
  // Scheduling
  scheduled?: boolean
  scheduleFrequency?: "daily" | "weekly" | "monthly"
  scheduleTime?: string
  scheduleEmail?: string
}

// Export data interface
export interface ExportData {
  type: "dashboard" | "crosstab" | "chart" | "table" | "report"
  title: string
  data: any
  columns?: { key: string; label: string; type?: string }[]
  metadata?: {
    createdAt?: string
    createdBy?: string
    description?: string
    filters?: any
    dateRange?: { start: string; end: string }
  }
}

// Export result interface
export interface ExportResult {
  success: boolean
  format: ExportFormat
  fileName: string
  fileSize?: number
  downloadUrl?: string
  error?: string
}

// Export history item
interface ExportHistoryItem {
  id: string
  format: ExportFormat
  fileName: string
  timestamp: Date
  status: "pending" | "processing" | "completed" | "failed"
  fileSize?: number
  downloadUrl?: string
  error?: string
}

interface ExportManagerProps {
  data: ExportData
  onExport?: (result: ExportResult) => void
  className?: string
  trigger?: React.ReactNode
}

const FORMAT_ICONS: Record<ExportFormat, { icon: React.ReactNode; extension: string }> = {
  pdf: { icon: <FileText className="h-4 w-4" />, extension: ".pdf" },
  excel: { icon: <FileSpreadsheet className="h-4 w-4" />, extension: ".xlsx" },
  csv: { icon: <File className="h-4 w-4" />, extension: ".csv" },
  png: { icon: <FileImage className="h-4 w-4" />, extension: ".png" },
  svg: { icon: <FileImage className="h-4 w-4" />, extension: ".svg" },
  json: { icon: <FileJson className="h-4 w-4" />, extension: ".json" },
  pptx: { icon: <FileText className="h-4 w-4" />, extension: ".pptx" },
  html: { icon: <FileText className="h-4 w-4" />, extension: ".html" },
}

const DEFAULT_OPTIONS: ExportOptions = {
  format: "pdf",
  fileName: "export",
  includeTitle: true,
  includeTimestamp: true,
  includeLogo: false,
  orientation: "landscape",
  paperSize: "a4",
  quality: "high",
  compression: true,
  pdfMargins: { top: 20, right: 20, bottom: 20, left: 20 },
  excelSheetName: "Data",
  excelIncludeFormulas: true,
  excelAutoFilter: true,
  excelFreezeRows: 1,
  excelFreezeColumns: 0,
  csvDelimiter: ",",
  csvQuoteStrings: true,
  csvEncoding: "utf-8",
  imageScale: 2,
  imageBackground: "#ffffff",
}

export function ExportManager({
  data,
  onExport,
  className,
  trigger,
}: ExportManagerProps) {
  const t = useTranslations("export")

  // Helper function to get format info with translations
  const getFormatInfo = useCallback((format: ExportFormat) => ({
    icon: FORMAT_ICONS[format].icon,
    extension: FORMAT_ICONS[format].extension,
    label: t(`formats.${format}.label`),
    description: t(`formats.${format}.description`),
  }), [t])

  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_OPTIONS)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<"format" | "options" | "schedule" | "history">("format")
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(data.columns?.map(c => c.key) || [])
  )

  // Update options
  const updateOptions = useCallback((updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }))
  }, [])

  // Toggle column selection
  const toggleColumn = useCallback((key: string) => {
    setSelectedColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }, [])

  // Generate file name
  const getFileName = useCallback(() => {
    let name = options.fileName || data.title || "export"
    if (options.includeTimestamp) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
      name = `${name}_${timestamp}`
    }
    return `${name}${FORMAT_ICONS[options.format].extension}`
  }, [options.fileName, options.format, options.includeTimestamp, data.title])

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const { csvDelimiter, csvQuoteStrings } = options
    const columns = data.columns?.filter(c => selectedColumns.has(c.key)) || []

    let csvContent = ""

    // Header row
    csvContent += columns.map(c =>
      csvQuoteStrings ? `"${c.label}"` : c.label
    ).join(csvDelimiter) + "\n"

    // Data rows
    if (Array.isArray(data.data)) {
      for (const row of data.data) {
        csvContent += columns.map(c => {
          const value = row[c.key]
          if (csvQuoteStrings && typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value?.toString() || ""
        }).join(csvDelimiter) + "\n"
      }
    }

    return csvContent
  }, [data, options, selectedColumns])

  // Export to JSON
  const exportToJSON = useCallback(() => {
    const exportData = {
      title: data.title,
      type: data.type,
      exportedAt: new Date().toISOString(),
      metadata: data.metadata,
      columns: data.columns?.filter(c => selectedColumns.has(c.key)),
      data: Array.isArray(data.data)
        ? data.data.map(row => {
            const filteredRow: any = {}
            for (const col of data.columns || []) {
              if (selectedColumns.has(col.key)) {
                filteredRow[col.key] = row[col.key]
              }
            }
            return filteredRow
          })
        : data.data,
    }
    return JSON.stringify(exportData, null, 2)
  }, [data, selectedColumns])

  // Generate HTML export
  const exportToHTML = useCallback(() => {
    const columns = data.columns?.filter(c => selectedColumns.has(c.key)) || []

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    h1 { color: #1a1a2e; }
    .metadata { color: #666; font-size: 0.9em; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f4f4f4; font-weight: 600; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    tr:hover { background-color: #f5f5f5; }
    .footer { margin-top: 20px; color: #888; font-size: 0.8em; }
  </style>
</head>
<body>
  ${options.includeTitle ? `<h1>${data.title}</h1>` : ""}
  <div class="metadata">
    ${data.metadata?.description ? `<p>${data.metadata.description}</p>` : ""}
    ${options.includeTimestamp ? `<p>Exported: ${new Date().toLocaleString()}</p>` : ""}
  </div>
  <table>
    <thead>
      <tr>
        ${columns.map(c => `<th>${c.label}</th>`).join("\n        ")}
      </tr>
    </thead>
    <tbody>
      ${Array.isArray(data.data)
        ? data.data.map(row => `
      <tr>
        ${columns.map(c => `<td>${row[c.key] ?? ""}</td>`).join("\n        ")}
      </tr>`).join("")
        : ""}
    </tbody>
  </table>
  <div class="footer">
    Generated by GWI AI Agent Framework
  </div>
</body>
</html>`

    return html
  }, [data, options, selectedColumns])

  // Perform export
  const performExport = useCallback(async () => {
    setIsExporting(true)
    setExportProgress(0)

    const historyItem: ExportHistoryItem = {
      id: crypto.randomUUID(),
      format: options.format,
      fileName: getFileName(),
      timestamp: new Date(),
      status: "processing",
    }

    setExportHistory(prev => [historyItem, ...prev.slice(0, 9)])

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setExportProgress(i)
      }

      let content: string
      let mimeType: string

      switch (options.format) {
        case "csv":
          content = exportToCSV()
          mimeType = "text/csv"
          break
        case "json":
          content = exportToJSON()
          mimeType = "application/json"
          break
        case "html":
          content = exportToHTML()
          mimeType = "text/html"
          break
        case "pdf":
        case "excel":
        case "png":
        case "svg":
        case "pptx":
          // For these formats, we'd normally call a server-side API
          // For now, simulate with JSON export
          content = exportToJSON()
          mimeType = "application/json"
          break
        default:
          content = exportToJSON()
          mimeType = "application/json"
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = getFileName()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Update history
      setExportHistory(prev =>
        prev.map(item =>
          item.id === historyItem.id
            ? { ...item, status: "completed", fileSize: blob.size, downloadUrl: url }
            : item
        )
      )

      const result: ExportResult = {
        success: true,
        format: options.format,
        fileName: getFileName(),
        fileSize: blob.size,
      }

      onExport?.(result)

    } catch (error) {
      setExportHistory(prev =>
        prev.map(item =>
          item.id === historyItem.id
            ? { ...item, status: "failed", error: (error as Error).message }
            : item
        )
      )

      onExport?.({
        success: false,
        format: options.format,
        fileName: getFileName(),
        error: (error as Error).message,
      })
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [options, getFileName, exportToCSV, exportToJSON, exportToHTML, onExport])

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    let content: string
    switch (options.format) {
      case "csv":
        content = exportToCSV()
        break
      case "json":
        content = exportToJSON()
        break
      case "html":
        content = exportToHTML()
        break
      default:
        content = exportToJSON()
    }
    await navigator.clipboard.writeText(content)
  }, [options.format, exportToCSV, exportToJSON, exportToHTML])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={className}>
              <Download className="h-4 w-4 mr-2" />
              {t("button")}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("quickExport")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["pdf", "excel", "csv", "png"] as ExportFormat[]).map(format => (
              <DropdownMenuItem
                key={format}
                onClick={() => {
                  updateOptions({ format })
                  performExport()
                }}
              >
                {FORMAT_ICONS[format].icon}
                <span className="ml-2">{getFormatInfo(format).label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              {t("advancedOptions")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("dialog.title", { name: data.title || t("dialog.defaultDataName") })}</DialogTitle>
            <DialogDescription>
              {t("dialog.description")}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="format">{t("tabs.format")}</TabsTrigger>
              <TabsTrigger value="options">{t("tabs.options")}</TabsTrigger>
              <TabsTrigger value="schedule">{t("tabs.schedule")}</TabsTrigger>
              <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
            </TabsList>

            <div className="overflow-auto flex-1 py-4">
              <TabsContent value="format" className="mt-0 space-y-4">
                {/* Format Selection */}
                <div className="grid grid-cols-4 gap-3">
                  {(Object.keys(FORMAT_ICONS) as ExportFormat[]).map((format) => {
                    const info = getFormatInfo(format)
                    return (
                      <button
                        key={format}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg border transition-all",
                          options.format === format
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-muted hover:border-muted-foreground/30 hover:bg-muted/50"
                        )}
                        onClick={() => updateOptions({ format: format as ExportFormat })}
                      >
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                          {info.icon}
                        </div>
                        <span className="font-medium text-sm">{info.label}</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          {info.extension}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* File Name */}
                <div className="space-y-2">
                  <Label>{t("formatTab.fileName")}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={options.fileName}
                      onChange={(e) => updateOptions({ fileName: e.target.value })}
                      placeholder={t("formatTab.fileNamePlaceholder")}
                    />
                    <Badge variant="secondary" className="flex items-center">
                      {FORMAT_ICONS[options.format].extension}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={options.includeTimestamp}
                        onCheckedChange={(v) => updateOptions({ includeTimestamp: !!v })}
                      />
                      {t("formatTab.includeTimestamp")}
                    </label>
                  </div>
                </div>

                {/* Column Selection */}
                {data.columns && data.columns.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("formatTab.columnsToExport")}</Label>
                    <div className="border rounded-lg p-3 max-h-40 overflow-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {data.columns.map(col => (
                          <label key={col.key} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={selectedColumns.has(col.key)}
                              onCheckedChange={() => toggleColumn(col.key)}
                            />
                            {col.label}
                            {col.type && (
                              <Badge variant="outline" className="text-xs">
                                {col.type}
                              </Badge>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedColumns(new Set(data.columns?.map(c => c.key) || []))}
                      >
                        {t("formatTab.selectAll")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedColumns(new Set())}
                      >
                        {t("formatTab.clearAll")}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="options" className="mt-0 space-y-4">
                {/* General Options */}
                <div className="space-y-3">
                  <h4 className="font-medium">{t("optionsTab.generalOptions")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>{t("optionsTab.includeTitle")}</Label>
                      <Switch
                        checked={options.includeTitle}
                        onCheckedChange={(v) => updateOptions({ includeTitle: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("optionsTab.includeLogo")}</Label>
                      <Switch
                        checked={options.includeLogo}
                        onCheckedChange={(v) => updateOptions({ includeLogo: v })}
                      />
                    </div>
                  </div>
                  {options.includeLogo && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("optionsTab.logoUrl")}</Label>
                      <Input
                        value={options.logoUrl || ""}
                        onChange={(e) => updateOptions({ logoUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("optionsTab.watermarkText")}</Label>
                    <Input
                      value={options.watermark || ""}
                      onChange={(e) => updateOptions({ watermark: e.target.value })}
                      placeholder={t("optionsTab.watermarkPlaceholder")}
                    />
                  </div>
                </div>

                {/* Format-specific options */}
                {(options.format === "pdf" || options.format === "pptx") && (
                  <div className="space-y-3">
                    <h4 className="font-medium">{t("optionsTab.documentOptions")}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("optionsTab.orientation")}</Label>
                        <Select
                          value={options.orientation}
                          onValueChange={(v) => updateOptions({ orientation: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">{t("optionsTab.portrait")}</SelectItem>
                            <SelectItem value="landscape">{t("optionsTab.landscape")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("optionsTab.paperSize")}</Label>
                        <Select
                          value={options.paperSize}
                          onValueChange={(v) => updateOptions({ paperSize: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a4">A4</SelectItem>
                            <SelectItem value="a3">A3</SelectItem>
                            <SelectItem value="letter">{t("optionsTab.letter")}</SelectItem>
                            <SelectItem value="legal">{t("optionsTab.legal")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("optionsTab.headerText")}</Label>
                      <Input
                        value={options.pdfHeader || ""}
                        onChange={(e) => updateOptions({ pdfHeader: e.target.value })}
                        placeholder={t("optionsTab.headerPlaceholder")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("optionsTab.footerText")}</Label>
                      <Input
                        value={options.pdfFooter || ""}
                        onChange={(e) => updateOptions({ pdfFooter: e.target.value })}
                        placeholder={t("optionsTab.footerPlaceholder")}
                      />
                    </div>
                  </div>
                )}

                {options.format === "excel" && (
                  <div className="space-y-3">
                    <h4 className="font-medium">{t("optionsTab.excelOptions")}</h4>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("optionsTab.sheetName")}</Label>
                      <Input
                        value={options.excelSheetName || ""}
                        onChange={(e) => updateOptions({ excelSheetName: e.target.value })}
                        placeholder="Sheet1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{t("optionsTab.autoFilter")}</Label>
                        <Switch
                          checked={options.excelAutoFilter}
                          onCheckedChange={(v) => updateOptions({ excelAutoFilter: v })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{t("optionsTab.includeFormulas")}</Label>
                        <Switch
                          checked={options.excelIncludeFormulas}
                          onCheckedChange={(v) => updateOptions({ excelIncludeFormulas: v })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("optionsTab.freezeRows")}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={options.excelFreezeRows || 0}
                          onChange={(e) => updateOptions({ excelFreezeRows: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("optionsTab.freezeColumns")}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={options.excelFreezeColumns || 0}
                          onChange={(e) => updateOptions({ excelFreezeColumns: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {options.format === "csv" && (
                  <div className="space-y-3">
                    <h4 className="font-medium">{t("optionsTab.csvOptions")}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("optionsTab.delimiter")}</Label>
                        <Select
                          value={options.csvDelimiter}
                          onValueChange={(v) => updateOptions({ csvDelimiter: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=",">{t("optionsTab.comma")}</SelectItem>
                            <SelectItem value=";">{t("optionsTab.semicolon")}</SelectItem>
                            <SelectItem value="\t">{t("optionsTab.tab")}</SelectItem>
                            <SelectItem value="|">{t("optionsTab.pipe")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("optionsTab.encoding")}</Label>
                        <Select
                          value={options.csvEncoding}
                          onValueChange={(v) => updateOptions({ csvEncoding: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utf-8">UTF-8</SelectItem>
                            <SelectItem value="utf-16">UTF-16</SelectItem>
                            <SelectItem value="ascii">ASCII</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">{t("optionsTab.quoteStrings")}</Label>
                      <Switch
                        checked={options.csvQuoteStrings}
                        onCheckedChange={(v) => updateOptions({ csvQuoteStrings: v })}
                      />
                    </div>
                  </div>
                )}

                {(options.format === "png" || options.format === "svg") && (
                  <div className="space-y-3">
                    <h4 className="font-medium">{t("optionsTab.imageOptions")}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("optionsTab.scale")}</Label>
                        <Select
                          value={options.imageScale?.toString() || "2"}
                          onValueChange={(v) => updateOptions({ imageScale: parseFloat(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">{t("optionsTab.scale1x")}</SelectItem>
                            <SelectItem value="2">{t("optionsTab.scale2x")}</SelectItem>
                            <SelectItem value="3">{t("optionsTab.scale3x")}</SelectItem>
                            <SelectItem value="4">{t("optionsTab.scale4x")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("optionsTab.background")}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={options.imageBackground || "#ffffff"}
                            onChange={(e) => updateOptions({ imageBackground: e.target.value })}
                            className="w-10 h-8 p-0 border-0"
                          />
                          <Input
                            value={options.imageBackground || "#ffffff"}
                            onChange={(e) => updateOptions({ imageBackground: e.target.value })}
                            className="flex-1 h-8"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("optionsTab.quality")}</Label>
                      <RadioGroup
                        value={options.quality}
                        onValueChange={(v) => updateOptions({ quality: v as any })}
                        className="flex gap-4"
                      >
                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="low" />
                          <span className="text-sm">{t("optionsTab.qualityLow")}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="medium" />
                          <span className="text-sm">{t("optionsTab.qualityMedium")}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="high" />
                          <span className="text-sm">{t("optionsTab.qualityHigh")}</span>
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("scheduleTab.enableScheduled")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("scheduleTab.enableScheduledDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={options.scheduled}
                    onCheckedChange={(v) => updateOptions({ scheduled: v })}
                  />
                </div>

                {options.scheduled && (
                  <>
                    <div className="space-y-1.5">
                      <Label>{t("scheduleTab.frequency")}</Label>
                      <Select
                        value={options.scheduleFrequency}
                        onValueChange={(v) => updateOptions({ scheduleFrequency: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("scheduleTab.selectFrequency")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">{t("scheduleTab.daily")}</SelectItem>
                          <SelectItem value="weekly">{t("scheduleTab.weekly")}</SelectItem>
                          <SelectItem value="monthly">{t("scheduleTab.monthly")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("scheduleTab.time")}</Label>
                      <Input
                        type="time"
                        value={options.scheduleTime || "09:00"}
                        onChange={(e) => updateOptions({ scheduleTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("scheduleTab.sendToEmail")}</Label>
                      <Input
                        type="email"
                        value={options.scheduleEmail || ""}
                        onChange={(e) => updateOptions({ scheduleEmail: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {exportHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mb-4" />
                    <p>{t("historyTab.noHistory")}</p>
                    <p className="text-sm">{t("historyTab.recentExportsWillAppear")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exportHistory.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {FORMAT_ICONS[item.format].icon}
                          <div>
                            <p className="font-medium text-sm">{item.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.timestamp.toLocaleString()}
                              {item.fileSize && ` • ${formatFileSize(item.fileSize)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === "processing" && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {item.status === "completed" && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          {item.status === "failed" && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          {item.downloadUrl && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                {t("actions.copy")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => console.log('Preview mode')}>
                <Eye className="h-4 w-4 mr-2" />
                {t("actions.preview")}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t("actions.cancel")}
              </Button>
              <Button onClick={performExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("actions.exporting", { progress: exportProgress })}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {t("actions.exportFormat", { format: getFormatInfo(options.format).label })}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>

          {/* Progress bar during export */}
          {isExporting && (
            <Progress value={exportProgress} className="absolute bottom-0 left-0 right-0 h-1 rounded-none" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Quick export button component
export function QuickExportButton({
  data,
  format,
  onExport,
  className,
}: {
  data: ExportData
  format: ExportFormat
  onExport?: (result: ExportResult) => void
  className?: string
}) {
  const t = useTranslations("export")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsExporting(false)
    onExport?.({
      success: true,
      format,
      fileName: `${data.title || "export"}${FORMAT_ICONS[format].extension}`,
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        FORMAT_ICONS[format].icon
      )}
      <span className="ml-2">{t(`formats.${format}.label`)}</span>
    </Button>
  )
}
