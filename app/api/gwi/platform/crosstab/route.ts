import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { audiences, metrics, ...options } = await request.json()

    // Call GWI Platform API to generate crosstab
    const response = await fetch(`${process.env.GWI_API_BASE_URL}/platform/v3/crosstab`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GWI_PLATFORM_API_KEY}`,
      },
      body: JSON.stringify({
        audiences,
        metrics,
        ...options,
      }),
    })

    if (!response.ok) {
      throw new Error(`GWI API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Generate crosstab failed:", error)
    return NextResponse.json({ error: "Failed to generate crosstab" }, { status: 500 })
  }
}
