import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Validate required API configuration
    const apiBaseUrl = process.env.GWI_API_BASE_URL
    const apiKey = process.env.GWI_PLATFORM_API_KEY

    if (!apiBaseUrl || !apiKey) {
      console.error("[API] GWI Platform API not configured")
      return NextResponse.json(
        { error: "GWI Platform integration not configured" },
        { status: 503 }
      )
    }

    const { audienceId, metrics, ...options } = await request.json()

    // Call GWI Platform API to fetch data
    const response = await fetch(`${apiBaseUrl}/platform/v3/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audience_id: audienceId,
        metrics,
        ...options,
      }),
    })

    if (!response.ok) {
      console.error(`[API] GWI API returned ${response.status}`)
      return NextResponse.json(
        { error: "Failed to fetch data from GWI Platform" },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Fetch data failed:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
