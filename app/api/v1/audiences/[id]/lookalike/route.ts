import { NextResponse } from "next/server"

// Lookalike Audience Generation API
// Creates similar audiences based on source audience characteristics

interface LookalikeAttribute {
  dimension: string
  weight: number
  value: string
  matchScore: number
}

interface LookalikeAudience {
  id: string
  name: string
  description: string
  estimatedSize: number
  overlapPercentage: number
  uniquePercentage: number
  keyDifferentiators: string[]
  attributes: LookalikeAttribute[]
  similarity: number
}

// Source audience attributes database (mock)
const audienceProfiles: Record<string, {
  name: string
  attributes: { dimension: string; value: string; weight: number }[]
}> = {
  "1": {
    name: "Eco-Conscious Millennials",
    attributes: [
      { dimension: "age", value: "25-40", weight: 0.9 },
      { dimension: "interests", value: "sustainability", weight: 0.95 },
      { dimension: "income", value: "65000-120000", weight: 0.7 },
      { dimension: "location_type", value: "urban", weight: 0.75 },
      { dimension: "education", value: "bachelors", weight: 0.6 },
      { dimension: "behavior", value: "premium_buyer", weight: 0.8 },
    ],
  },
  "2": {
    name: "Tech Early Adopters",
    attributes: [
      { dimension: "age", value: "28-45", weight: 0.85 },
      { dimension: "interests", value: "technology", weight: 0.95 },
      { dimension: "income", value: "120000+", weight: 0.8 },
      { dimension: "education", value: "graduate", weight: 0.7 },
      { dimension: "behavior", value: "early_adopter", weight: 0.95 },
      { dimension: "location_type", value: "tech_hub", weight: 0.65 },
    ],
  },
  "3": {
    name: "Gen Z Content Creators",
    attributes: [
      { dimension: "age", value: "16-25", weight: 0.95 },
      { dimension: "behavior", value: "content_creator", weight: 0.95 },
      { dimension: "social_media", value: "heavy", weight: 0.9 },
      { dimension: "interests", value: "fashion,music,entertainment", weight: 0.8 },
      { dimension: "platform_usage", value: "tiktok,instagram", weight: 0.85 },
    ],
  },
}

// Generate lookalike audiences based on source attributes
function generateLookalikes(
  sourceAttributes: { dimension: string; value: string; weight: number }[],
  sourceName: string,
  similarityThreshold: number
): LookalikeAudience[] {
  const lookalikes: LookalikeAudience[] = []

  // Lookalike variations
  const variations = [
    {
      name: `${sourceName} - Broader Age Range`,
      adjustments: { age: { expand: true } },
      sizeMultiplier: 1.8,
      similarity: 0.85,
    },
    {
      name: `${sourceName} - Higher Income Variant`,
      adjustments: { income: { increase: true } },
      sizeMultiplier: 0.6,
      similarity: 0.78,
    },
    {
      name: `${sourceName} - Urban Expansion`,
      adjustments: { location_type: { expand: true } },
      sizeMultiplier: 1.5,
      similarity: 0.82,
    },
    {
      name: `${sourceName} - Interest Adjacent`,
      adjustments: { interests: { adjacent: true } },
      sizeMultiplier: 2.2,
      similarity: 0.72,
    },
    {
      name: `${sourceName} - Next Generation`,
      adjustments: { age: { younger: true } },
      sizeMultiplier: 1.3,
      similarity: 0.68,
    },
  ]

  // Base size calculation
  const baseSize = 1200000 * (0.8 + Math.random() * 0.4)

  for (const variation of variations) {
    if (variation.similarity < similarityThreshold) continue

    const lookalikeAttrs = sourceAttributes.map(attr => {
      let newValue = attr.value
      let matchScore = 0.9 + Math.random() * 0.1

      // Apply adjustments
      if (variation.adjustments[attr.dimension as keyof typeof variation.adjustments]) {
        matchScore = 0.7 + Math.random() * 0.2
        // Simplified value adjustments
        if (attr.dimension === "age" && variation.adjustments.age) {
          if ((variation.adjustments.age as any).expand) newValue = "22-48"
          if ((variation.adjustments.age as any).younger) newValue = "18-35"
        }
        if (attr.dimension === "income" && variation.adjustments.income) {
          newValue = "150000+"
        }
      }

      return {
        dimension: attr.dimension,
        weight: attr.weight,
        value: newValue,
        matchScore,
      }
    })

    const estimatedSize = Math.round(baseSize * variation.sizeMultiplier)
    const overlap = Math.round(variation.similarity * 100 * (0.3 + Math.random() * 0.2))

    lookalikes.push({
      id: `lookalike-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: variation.name,
      description: `Similar to ${sourceName} with adjustments for broader reach`,
      estimatedSize,
      overlapPercentage: overlap,
      uniquePercentage: 100 - overlap,
      keyDifferentiators: generateDifferentiators(variation.adjustments),
      attributes: lookalikeAttrs,
      similarity: variation.similarity,
    })
  }

  return lookalikes.sort((a, b) => b.similarity - a.similarity)
}

function generateDifferentiators(adjustments: Record<string, any>): string[] {
  const diffs: string[] = []

  if (adjustments.age?.expand) diffs.push("Wider age range for scale")
  if (adjustments.age?.younger) diffs.push("Skews younger demographic")
  if (adjustments.income?.increase) diffs.push("Higher income bracket")
  if (adjustments.location_type?.expand) diffs.push("Includes suburban markets")
  if (adjustments.interests?.adjacent) diffs.push("Related interest categories")

  if (diffs.length === 0) diffs.push("Behavioral similarity match")

  return diffs
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const similarityThreshold = parseFloat(searchParams.get("similarity") || "0.6")

    // Get source audience profile
    const sourceProfile = audienceProfiles[id]

    if (!sourceProfile) {
      // Generate generic profile for unknown audiences
      const genericProfile = {
        name: `Audience ${id}`,
        attributes: [
          { dimension: "age", value: "25-45", weight: 0.8 },
          { dimension: "interests", value: "general", weight: 0.7 },
          { dimension: "income", value: "50000-100000", weight: 0.6 },
        ],
      }

      const lookalikes = generateLookalikes(
        genericProfile.attributes,
        genericProfile.name,
        similarityThreshold
      )

      return NextResponse.json({
        success: true,
        data: {
          sourceAudience: genericProfile.name,
          lookalikes,
          totalFound: lookalikes.length,
          similarityThreshold,
        },
      })
    }

    const lookalikes = generateLookalikes(
      sourceProfile.attributes,
      sourceProfile.name,
      similarityThreshold
    )

    return NextResponse.json({
      success: true,
      data: {
        sourceAudience: sourceProfile.name,
        lookalikes,
        totalFound: lookalikes.length,
        similarityThreshold,
      },
    })
  } catch (error) {
    console.error("Lookalike generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate lookalike audiences" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { selectedLookalikeId: _selectedLookalikeId, name, markets = ["Global"] } = body

    // In production, this would create the audience in the database
    const newAudience = {
      id: `audience-${Date.now()}`,
      name: name || `Lookalike of ${id}`,
      description: `Lookalike audience based on source audience ${id}`,
      markets,
      createdAt: new Date().toISOString(),
      status: "created",
    }

    return NextResponse.json({
      success: true,
      data: newAudience,
      message: "Lookalike audience created successfully",
    })
  } catch (error) {
    console.error("Create lookalike error:", error)
    return NextResponse.json(
      { error: "Failed to create lookalike audience" },
      { status: 500 }
    )
  }
}
