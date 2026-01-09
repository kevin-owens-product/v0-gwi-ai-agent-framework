"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewAudiencePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [aiQuery, setAiQuery] = useState("")
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["Global"])
  const [attributes, setAttributes] = useState<{ dimension: string; operator: string; value: string }[]>([])

  const handleSave = () => {
    // Save audience logic here
    router.push("/dashboard/audiences")
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/audiences">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Build New Audience</h1>
          <p className="text-muted-foreground mt-1">Define your target segment using natural language or attributes</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="name">Audience Name</Label>
              <Input
                id="name"
                placeholder="e.g., Eco-Conscious Millennials"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this audience segment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </Card>

          {/* AI Query Builder */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">AI-Powered Query</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Describe your audience in natural language, and we'll build the query for you
            </p>
            <Textarea
              placeholder="e.g., Show me millennials who care about sustainability, live in urban areas, and shop at eco-friendly brands"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              rows={3}
            />
            <Button variant="outline" className="w-full bg-transparent">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Attributes
            </Button>
          </Card>

          {/* Manual Attributes */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Attributes</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAttributes([...attributes, { dimension: "age", operator: "between", value: "25-34" }])
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={attr.dimension}
                    onValueChange={(v) => {
                      const newAttrs = [...attributes]
                      newAttrs[index].dimension = v
                      setAttributes(newAttrs)
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="age">Age</SelectItem>
                      <SelectItem value="gender">Gender</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="interests">Interests</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={attr.operator}
                    onValueChange={(v) => {
                      const newAttrs = [...attributes]
                      newAttrs[index].operator = v
                      setAttributes(newAttrs)
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="is">is</SelectItem>
                      <SelectItem value="between">between</SelectItem>
                      <SelectItem value="contains">contains</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1"
                    value={attr.value}
                    onChange={(e) => {
                      const newAttrs = [...attributes]
                      newAttrs[index].value = e.target.value
                      setAttributes(newAttrs)
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttributes(attributes.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Markets */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Markets</h2>
            <Select value={selectedMarkets[0]} onValueChange={(v) => setSelectedMarkets([v])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Estimated Reach */}
          <Card className="p-6 space-y-2">
            <h2 className="text-lg font-semibold">Estimated Reach</h2>
            <div className="text-3xl font-bold">1.2M</div>
            <p className="text-sm text-muted-foreground">consumers match these criteria</p>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full" onClick={handleSave}>
              Save Audience
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
