"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  Tag,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  code: string
  description: string | null
  parentId: string | null
  version: number
  isActive: boolean
  _count: {
    attributes: number
    children: number
  }
  children?: Category[]
}

interface TaxonomyTreeProps {
  categories: Category[]
}

function TreeNode({
  category,
  depth = 0,
}: {
  category: Category
  depth?: number
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const hasChildren = category.children && category.children.length > 0

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 group",
          depth > 0 && "ml-6"
        )}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-6 w-6 flex items-center justify-center rounded hover:bg-slate-200",
            !hasChildren && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Icon */}
        {hasChildren ? (
          <FolderTree className="h-4 w-4 text-blue-500" />
        ) : (
          <Tag className="h-4 w-4 text-emerald-500" />
        )}

        {/* Name and Code */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/gwi/taxonomy/categories/${category.id}`}
            className="font-medium hover:text-emerald-600"
          >
            {category.name}
          </Link>
          <span className="ml-2 text-xs text-muted-foreground font-mono">
            {category.code}
          </span>
        </div>

        {/* Status Badge */}
        {!category.isActive && (
          <Badge variant="secondary" className="text-xs">
            Inactive
          </Badge>
        )}

        {/* Counts */}
        {category._count.attributes > 0 && (
          <Badge variant="outline" className="text-xs">
            {category._count.attributes} attrs
          </Badge>
        )}

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/gwi/taxonomy/categories/${category.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/gwi/taxonomy/categories/new?parentId=${category.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Child
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="border-l ml-6">
          {category.children!.map((child) => (
            <TreeNode key={child.id} category={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TaxonomyTree({ categories }: TaxonomyTreeProps) {
  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <TreeNode key={category.id} category={category} />
      ))}
    </div>
  )
}
