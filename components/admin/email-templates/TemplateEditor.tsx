/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useRef, useCallback } from "react"
import { } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Bold,
  Italic,
  Link2,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Code,
  Variable,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react"

interface TemplateVariable {
  name: string
  description: string
  required: boolean
  defaultValue?: string
}

interface TemplateEditorProps {
  value: string
  onChange: (value: string) => void
  onInsertVariable: (variableName: string) => void
  variables: TemplateVariable[]
}

export function TemplateEditor({
  value,
  onChange,
  onInsertVariable,
  variables,
}: TemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  const updateSelection = useCallback(() => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart)
      setSelectionEnd(textareaRef.current.selectionEnd)
    }
  }, [])

  const insertAtCursor = useCallback(
    (before: string, after: string = "") => {
      if (!textareaRef.current) return

      const start = selectionStart
      const end = selectionEnd
      const selectedText = value.substring(start, end)
      const newText =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end)

      onChange(newText)

      // Restore focus and selection
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newCursorPos = start + before.length + selectedText.length
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    },
    [value, onChange, selectionStart, selectionEnd]
  )

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      if (!textareaRef.current) return

      const start = selectionStart
      const end = selectionEnd
      const selectedText = value.substring(start, end)

      const newText =
        value.substring(0, start) + before + selectedText + after + value.substring(end)

      onChange(newText)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(start + before.length, end + before.length)
        }
      }, 0)
    },
    [value, onChange, selectionStart, selectionEnd]
  )

  const insertHeading = (level: 1 | 2 | 3) => {
    const tags = {
      1: ['<h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">', "</h1>"],
      2: ['<h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">', "</h2>"],
      3: ['<h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">', "</h3>"],
    }
    wrapSelection(tags[level][0], tags[level][1])
  }

  const insertBold = () => {
    wrapSelection("<strong>", "</strong>")
  }

  const insertItalic = () => {
    wrapSelection("<em>", "</em>")
  }

  const insertLink = () => {
    const selectedText = value.substring(selectionStart, selectionEnd)
    if (selectedText) {
      wrapSelection('<a href="#" style="color: #2563eb; text-decoration: underline;">', "</a>")
    } else {
      insertAtCursor(
        '<a href="#" style="color: #2563eb; text-decoration: underline;">Link text</a>'
      )
    }
  }

  const insertImage = () => {
    insertAtCursor(
      '<img src="{{imageUrl}}" alt="Image description" style="max-width: 100%; height: auto; border-radius: 8px;" />'
    )
  }

  const insertButton = () => {
    insertAtCursor(
      '<a href="{{buttonUrl}}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">Button Text</a>'
    )
  }

  const insertUnorderedList = () => {
    insertAtCursor(
      '<ul style="padding-left: 20px; margin: 16px 0;">\n  <li style="margin-bottom: 8px;">Item 1</li>\n  <li style="margin-bottom: 8px;">Item 2</li>\n  <li style="margin-bottom: 8px;">Item 3</li>\n</ul>'
    )
  }

  const insertOrderedList = () => {
    insertAtCursor(
      '<ol style="padding-left: 20px; margin: 16px 0;">\n  <li style="margin-bottom: 8px;">Item 1</li>\n  <li style="margin-bottom: 8px;">Item 2</li>\n  <li style="margin-bottom: 8px;">Item 3</li>\n</ol>'
    )
  }

  const insertDivider = () => {
    insertAtCursor(
      '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />'
    )
  }

  const setAlignment = (align: "left" | "center" | "right") => {
    wrapSelection(`<div style="text-align: ${align};">`, "</div>")
  }

  const insertCodeBlock = () => {
    wrapSelection(
      '<pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto;"><code>',
      "</code></pre>"
    )
  }

  const handleVariableInsert = (variableName: string) => {
    insertAtCursor(`{{${variableName}}}`)
    onInsertVariable(variableName)
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <Label>HTML Content</Label>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-muted rounded-t-lg border border-b-0">
          {/* Headings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Heading1 className="h-4 w-4 mr-1" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => insertHeading(1)}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertHeading(2)}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertHeading(3)}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Formatting */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={insertBold}>
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={insertItalic}>
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Alignment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setAlignment("left")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setAlignment("center")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setAlignment("right")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={insertUnorderedList}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={insertOrderedList}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Insert Elements */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={insertLink}>
                <Link2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={insertImage}>
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={insertCodeBlock}>
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Button Insert */}
          <Button variant="ghost" size="sm" className="h-8" onClick={insertButton}>
            Button
          </Button>

          <Button variant="ghost" size="sm" className="h-8" onClick={insertDivider}>
            Divider
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Variables */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <Variable className="h-4 w-4 mr-1" />
                Insert Variable
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {variables.map((variable) => (
                <DropdownMenuItem
                  key={variable.name}
                  onClick={() => handleVariableInsert(variable.name)}
                >
                  <code className="text-xs mr-2">{`{{${variable.name}}}`}</code>
                  <span className="text-muted-foreground text-xs">
                    {variable.description || variable.name}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Editor */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={updateSelection}
          onFocus={updateSelection}
          rows={20}
          className="font-mono text-sm rounded-t-none border-t-0 resize-y min-h-[400px]"
          placeholder="Enter HTML email content..."
        />

        <p className="text-xs text-muted-foreground">
          Use {"{{variableName}}"} syntax for dynamic variables. Email clients have limited CSS
          support - use inline styles for best compatibility.
        </p>
      </div>
    </TooltipProvider>
  )
}
