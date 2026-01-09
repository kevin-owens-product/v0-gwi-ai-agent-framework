import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { audienceId, metrics, ...options } = await request.json()

    // Call GWI Platform API to fetch data
    const response = await fetch(`${process.env.GWI_API_BASE_URL}/platform/v3/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GWI_PLATFORM_API_KEY}`,
      },
      body: JSON.stringify({
        audience_id: audienceId,
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
    console.error("[API] Fetch data failed:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
