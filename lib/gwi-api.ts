// GWI API Client Library
// Provides methods to interact with GWI Platform API, Spark API, and Spark MCP

export class GWIClient {
  public readonly baseUrl: string
  public readonly apiToken: string

  constructor(apiToken?: string) {
    this.baseUrl = process.env.GWI_API_BASE_URL || "https://api.globalwebindex.com"
    this.apiToken = apiToken || process.env.GWI_API_TOKEN || ""
  }

  // Spark MCP - Conversational AI queries
  async querySparkMCP(query: string, context?: Record<string, any>) {
    try {
      const response = await fetch("/api/gwi/spark-mcp/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, context }),
      })
      return await response.json()
    } catch (error) {
      console.error("[GWI] Spark MCP query failed:", error)
      throw error
    }
  }

  // Spark API - Quick insights
  async getInsights(topic: string, audience?: string) {
    try {
      const response = await fetch("/api/gwi/spark/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience }),
      })
      return await response.json()
    } catch (error) {
      console.error("[GWI] Spark insights failed:", error)
      throw error
    }
  }

  // Platform API - Create audience
  async createAudience(definition: Record<string, any>) {
    try {
      const response = await fetch("/api/gwi/platform/audiences/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(definition),
      })
      return await response.json()
    } catch (error) {
      console.error("[GWI] Create audience failed:", error)
      throw error
    }
  }

  // Platform API - Fetch data
  async fetchData(audienceId: string, metrics: string[], options?: Record<string, any>) {
    try {
      const response = await fetch("/api/gwi/platform/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audienceId, metrics, ...options }),
      })
      return await response.json()
    } catch (error) {
      console.error("[GWI] Fetch data failed:", error)
      throw error
    }
  }

  // Platform API - Generate crosstab
  async generateCrosstab(audiences: string[], metrics: string[], options?: Record<string, any>) {
    try {
      const response = await fetch("/api/gwi/platform/crosstab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audiences, metrics, ...options }),
      })
      return await response.json()
    } catch (error) {
      console.error("[GWI] Generate crosstab failed:", error)
      throw error
    }
  }
}

// Export singleton instance
export const gwiClient = new GWIClient()
