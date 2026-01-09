import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"

const queries = [
  {
    query: "Gen Z sustainability attitudes in fashion",
    count: 234,
    agent: "Audience Strategy",
    category: "Consumer Insights",
  },
  {
    query: "Competitive analysis: Nike vs Adidas social media",
    count: 189,
    agent: "Competitive Tracker",
    category: "Competitive",
  },
  {
    query: "Health and wellness trends 2025",
    count: 156,
    agent: "Trend Forecaster",
    category: "Trends",
  },
  {
    query: "Millennial media consumption patterns",
    count: 142,
    agent: "Audience Strategy",
    category: "Consumer Insights",
  },
  {
    query: "Beauty brand positioning opportunities",
    count: 128,
    agent: "Creative Brief Builder",
    category: "Creative",
  },
]

const categoryColors: Record<string, string> = {
  "Consumer Insights": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Competitive: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Trends: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Creative: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

export function TopQueries() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Queries</CardTitle>
        <CardDescription>Most frequently asked questions this period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {queries.map((query, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-relaxed">{query.query}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={categoryColors[query.category]}>
                  {query.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{query.agent}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {query.count}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
