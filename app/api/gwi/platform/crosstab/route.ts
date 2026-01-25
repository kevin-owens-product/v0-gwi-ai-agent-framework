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

    const { audiences, metrics, ...options } = await request.json()

    // Call GWI Platform API to generate crosstab
    const response = await fetch(`${apiBaseUrl}/platform/v3/crosstab`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audiences,
        metrics,
        ...options,
      }),
    })

    if (!response.ok) {
      console.error(`[API] GWI API returned ${response.status}`)
      return NextResponse.json(
        { error: "Failed to generate crosstab on GWI Platform" },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Generate crosstab failed:", error)
    return NextResponse.json({ error: "Failed to generate crosstab" }, { status: 500 })
  }
}
