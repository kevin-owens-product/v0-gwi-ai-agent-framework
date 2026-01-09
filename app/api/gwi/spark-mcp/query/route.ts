import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query, context } = await request.json()

    // Call GWI Spark MCP API
    const response = await fetch(`${process.env.GWI_API_BASE_URL}/spark-mcp/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GWI_SPARK_API_KEY}`,
      },
      body: JSON.stringify({ query, context }),
    })

    if (!response.ok) {
      throw new Error(`GWI API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Spark MCP query failed:", error)
    return NextResponse.json({ error: "Failed to query Spark MCP" }, { status: 500 })
  }
}
