"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BarChart3, LineChart, PieChart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewChartPage() {
  const router = useRouter()
  const [chartType, setChartType] = useState("bar")
  const [selectedAudience, setSelectedAudience] = useState("")
  const [selectedMetric, setSelectedMetric] = useState("")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/charts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Chart</h1>
          <p className="text-muted-foreground mt-1">Visualize your audience data</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label>Chart Type</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button
                  onClick={() => setChartType("bar")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "bar" ? "border-accent bg-accent" : ""
                  }`}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Bar</span>
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "line" ? "border-accent bg-accent" : ""
                  }`}
                >
                  <LineChart className="h-6 w-6" />
                  <span className="text-sm">Line</span>
                </button>
                <button
                  onClick={() => setChartType("pie")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "pie" ? "border-accent bg-accent" : ""
                  }`}
                >
                  <PieChart className="h-6 w-6" />
                  <span className="text-sm">Pie</span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Chart Name</Label>
              <Input id="name" placeholder="e.g., Social Media Usage by Age" />
            </div>

            <div>
              <Label>Select Audience</Label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eco-millennials">Eco-Conscious Millennials</SelectItem>
                  <SelectItem value="tech-adopters">Tech Early Adopters</SelectItem>
                  <SelectItem value="genz-creators">Gen Z Content Creators</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social-usage">Social Media Usage</SelectItem>
                  <SelectItem value="purchase-intent">Purchase Intent</SelectItem>
                  <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Preview</h3>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Chart Options</h3>
            <div>
              <Label>Time Period</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Last 12 months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="space-y-2">
            <Button className="w-full" onClick={() => router.push("/dashboard/charts")}>
              Create Chart
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
