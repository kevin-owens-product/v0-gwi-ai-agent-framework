'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Download, FileText, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
}

export default function DataExportsPage() {
  const [exports, setExports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [exportType, setExportType] = useState('ORGANIZATION_DATA')
  const [format, setFormat] = useState('JSON')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchExports()
  }, [])

  const fetchExports = async () => {
    try {
      const response = await fetch('/api/v1/organization/exports')
      if (response.ok) {
        const data = await response.json()
        setExports(data)
      }
    } catch (error) {
      console.error('Failed to fetch exports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequest = async () => {
    setRequesting(true)
    try {
      const response = await fetch('/api/v1/organization/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportType, format, description }),
      })

      if (!response.ok) {
        throw new Error('Failed to request export')
      }

      toast.success('Data export requested successfully')
      setDialogOpen(false)
      setDescription('')
      fetchExports()
    } catch (error) {
      toast.error('Failed to request data export')
    } finally {
      setRequesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Data Exports</h1>
        <p className="text-muted-foreground">Request exports of your organization data for GDPR compliance or backup purposes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export Requests</CardTitle>
              <CardDescription>View and download your data export requests</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Data Export</DialogTitle>
                  <DialogDescription>
                    Request an export of your organization data. You'll be notified when it's ready to download.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Export Type</Label>
                    <Select value={exportType} onValueChange={setExportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ORGANIZATION_DATA">Organization Data</SelectItem>
                        <SelectItem value="USER_DATA">User Data</SelectItem>
                        <SelectItem value="COMPLIANCE_DATA">Compliance Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JSON">JSON</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      placeholder="Describe the purpose of this export..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleRequest} disabled={requesting}>
                    {requesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Request Export
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No data exports yet</p>
              <p className="text-sm text-muted-foreground">Request an export to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exp: any) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.exportType.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{exp.format}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[exp.status as keyof typeof STATUS_COLORS]}>
                        {exp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exp.expiresAt ? new Date(exp.expiresAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {exp.status === 'COMPLETED' && exp.downloadUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={exp.downloadUrl} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Data Exports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>Organization Data:</strong> Includes all organization settings, team members, agents, workflows, and generated content.
          </p>
          <p>
            <strong>User Data:</strong> Includes personal user data and activity history for GDPR data portability requests.
          </p>
          <p>
            <strong>Compliance Data:</strong> Includes audit logs, security events, and compliance-related records.
          </p>
          <p>
            <strong>Note:</strong> Exports expire after 7 days for security purposes. You can request a new export at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
