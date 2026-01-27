"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  Activity,
  Loader2,
  BarChart3,
  Users,
  Target,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface BrandTracking {
  id: string
  brandName: string
  description: string | null
  industry: string | null
  status: string
  competitors: any[]
  audiences: string[]
  lastSnapshot: string | null
  snapshotCount: number
  createdAt: string
  updatedAt: string
  _count?: { snapshots: number }
  snapshots?: Array<{
    id: string
    snapshotDate: string
    brandHealth: number | null
    awareness: number | null
    nps: number | null
    marketShare: number | null
  }>
}

// Demo brand trackings shown when API returns empty
const demoBrandTrackings: BrandTracking[] = [
  {
    id: "1",
    brandName: "Nike",
    description: "Track Nike's brand health and competitive position in athletic wear market",
    industry: "Sportswear",
    status: "ACTIVE",
    competitors: ["Adidas", "Under Armour", "Puma", "Reebok"],
    audiences: ["18-24", "25-34", "Athletes"],
    lastSnapshot: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    snapshotCount: 47,
    createdAt: "2024-11-01",
    updatedAt: new Date().toISOString(),
    _count: { snapshots: 47 },
    snapshots: [{
      id: "demo-1",
      snapshotDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      brandHealth: 82.5,
      awareness: 78.3,
      nps: 45,
      marketShare: 28.4,
    }]
  },
  {
    id: "2",
    brandName: "Coca-Cola",
    description: "Monitor brand perception and market share in beverage industry",
    industry: "Beverages",
    status: "ACTIVE",
    competitors: ["Pepsi", "Dr Pepper", "Sprite"],
    audiences: ["All Ages", "Health Conscious"],
    lastSnapshot: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    snapshotCount: 124,
    createdAt: "2024-10-15",
    updatedAt: new Date().toISOString(),
    _count: { snapshots: 124 },
    snapshots: [{
      id: "demo-2",
      snapshotDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      brandHealth: 88.2,
      awareness: 92.1,
      nps: 52,
      marketShare: 42.8,
    }]
  },
  {
    id: "3",
    brandName: "Tesla",
    description: "Track electric vehicle brand performance and innovation perception",
    industry: "Automotive",
    status: "ACTIVE",
    competitors: ["Ford", "GM", "Rivian", "Lucid"],
    audiences: ["Tech Early Adopters", "Eco-Conscious", "35-54"],
    lastSnapshot: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    snapshotCount: 89,
    createdAt: "2024-09-20",
    updatedAt: new Date().toISOString(),
    _count: { snapshots: 89 },
    snapshots: [{
      id: "demo-3",
      snapshotDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      brandHealth: 76.8,
      awareness: 85.5,
      nps: 62,
      marketShare: 18.2,
    }]
  },
]

const statusColors = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  PAUSED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  DRAFT: "bg-muted text-muted-foreground border-muted",
  ARCHIVED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
}

export function BrandTrackingGrid() {
  const router = useRouter()
  const t = useTranslations('ui.empty')
  const [brandTrackings, setBrandTrackings] = useState<BrandTracking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [_hoveredId, setHoveredId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<BrandTracking | null>(null)

  // Fetch brand trackings from API
  useEffect(() => {
    async function fetchBrandTrackings() {
      try {
        const response = await fetch('/api/v1/brand-tracking')
        if (response.ok) {
          const data = await response.json()
          const apiData = data.brandTrackings || data.data || []
          if (apiData.length > 0) {
            setBrandTrackings(apiData)
          } else {
            setBrandTrackings(demoBrandTrackings)
          }
        } else {
          setBrandTrackings(demoBrandTrackings)
        }
      } catch (error) {
        console.error('Failed to fetch brand trackings:', error)
        setBrandTrackings(demoBrandTrackings)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBrandTrackings()
  }, [])

  const handleEdit = (item: BrandTracking) => {
    router.push(`/dashboard/brand-tracking/${item.id}/edit`)
  }

  const handleView = (item: BrandTracking) => {
    router.push(`/dashboard/brand-tracking/${item.id}`)
  }

  const handleToggleStatus = async (item: BrandTracking) => {
    const newStatus = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      const response = await fetch(`/api/v1/brand-tracking/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setBrandTrackings(prev =>
          prev.map(bt => bt.id === item.id ? { ...bt, status: newStatus } : bt)
        )
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = (item: BrandTracking) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await fetch(`/api/v1/brand-tracking/${itemToDelete.id}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Failed to delete brand tracking:', error)
      }
      setBrandTrackings(prev => prev.filter(bt => bt.id !== itemToDelete.id))
    }
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleTakeSnapshot = async (item: BrandTracking) => {
    try {
      const response = await fetch(`/api/v1/brand-tracking/${item.id}/snapshot`, {
        method: 'POST',
      })
      if (response.ok) {
        setBrandTrackings(prev =>
          prev.map(bt => bt.id === item.id
            ? { ...bt, lastSnapshot: new Date().toISOString(), snapshotCount: bt.snapshotCount + 1 }
            : bt
          )
        )
      }
    } catch (error) {
      console.error('Failed to take snapshot:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (brandTrackings.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No brand tracking projects yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating your first brand tracking project.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/brand-tracking/new">Create Brand Tracking</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brandTrackings.map((item) => {
          const snapshotCount = item._count?.snapshots || item.snapshotCount || 0
          const competitorCount = Array.isArray(item.competitors) ? item.competitors.length : 0
          const audienceCount = Array.isArray(item.audiences) ? item.audiences.length : 0
          const latestSnapshot = item.snapshots?.[0]

          return (
            <Card
              key={item.id}
              className="group overflow-hidden transition-all hover:shadow-lg"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <Badge
                        variant="outline"
                        className={statusColors[item.status as keyof typeof statusColors]}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold line-clamp-1">{item.brandName}</h3>
                    {item.industry && (
                      <p className="text-sm text-muted-foreground">{item.industry}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTakeSnapshot(item)}>
                        <Activity className="mr-2 h-4 w-4" />
                        Take Snapshot
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                        {item.status === 'ACTIVE' ? (
                          <>
                            <PauseCircle className="mr-2 h-4 w-4" />
                            Pause Tracking
                          </>
                        ) : (
                          <>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Resume Tracking
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-4">
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {item.description}
                  </p>
                )}

                {/* Key Metrics from Latest Snapshot */}
                {latestSnapshot ? (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="flex flex-col items-center p-2 bg-primary/5 rounded-lg">
                      <span className="text-lg font-bold text-primary">{latestSnapshot.brandHealth?.toFixed(0) || '-'}</span>
                      <span className="text-xs text-muted-foreground">Health</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-emerald-500/5 rounded-lg">
                      <span className="text-lg font-bold text-emerald-600">{latestSnapshot.awareness?.toFixed(0) || '-'}%</span>
                      <span className="text-xs text-muted-foreground">Awareness</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-blue-500/5 rounded-lg">
                      <span className="text-lg font-bold text-blue-600">{latestSnapshot.nps?.toFixed(0) || '-'}</span>
                      <span className="text-xs text-muted-foreground">NPS</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-amber-500/5 rounded-lg">
                      <span className="text-lg font-bold text-amber-600">{latestSnapshot.marketShare?.toFixed(0) || '-'}%</span>
                      <span className="text-xs text-muted-foreground">Share</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-muted/50 rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground">{t('noData')}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-lg font-bold">{snapshotCount}</span>
                    <span className="text-xs text-muted-foreground">Snapshots</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <Target className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-lg font-bold">{competitorCount}</span>
                    <span className="text-xs text-muted-foreground">Competitors</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-lg font-bold">{audienceCount}</span>
                    <span className="text-xs text-muted-foreground">Audiences</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t p-4">
                <div className="text-xs text-muted-foreground">
                  {item.lastSnapshot ? (
                    <span>Last snapshot {formatDistanceToNow(new Date(item.lastSnapshot), { addSuffix: true })}</span>
                  ) : (
                    <span>No snapshots yet</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleView(item)}
                >
                  View Analytics
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand Tracking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete tracking for "{itemToDelete?.brandName}"? This will also delete all snapshots and historical data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
