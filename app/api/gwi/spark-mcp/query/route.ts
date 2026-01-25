import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Validate required API configuration
    const apiBaseUrl = process.env.GWI_API_BASE_URL
    const apiKey = process.env.GWI_SPARK_API_KEY

    if (!apiBaseUrl || !apiKey) {
      console.error("[API] GWI Spark API not configured")
      return NextResponse.json(
        { error: "GWI Spark integration not configured" },
        { status: 503 }
      )
    }

    const { query, context } = await request.json()

    // Call GWI Spark MCP API
    const response = await fetch(`${apiBaseUrl}/spark-mcp/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, context }),
    })

    if (!response.ok) {
      console.error(`[API] GWI Spark API returned ${response.status}`)
      return NextResponse.json(
        { error: "Failed to query GWI Spark" },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Spark MCP query failed:", error)
    return NextResponse.json({ error: "Failed to query Spark MCP" }, { status: 500 })
  }
}
