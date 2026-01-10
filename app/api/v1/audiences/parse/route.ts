import { NextResponse } from "next/server"

// AI-Powered Audience Query Parser
// Converts natural language queries into structured audience criteria

interface ParsedAttribute {
  dimension: string
  operator: string
  value: string
  confidence: number
  source: string
}

interface ParsedAudience {
  attributes: ParsedAttribute[]
  estimatedSize: number
  naturalLanguageSummary: string
  suggestions: string[]
}

// Dimension mappings for common terms
const dimensionMappings: Record<string, { dimension: string; values?: Record<string, string> }> = {
  // Age/Generation terms
  "gen z": { dimension: "age", values: { operator: "between", value: "18-24" } },
  "genz": { dimension: "age", values: { operator: "between", value: "18-24" } },
  "generation z": { dimension: "age", values: { operator: "between", value: "18-24" } },
  "millennials": { dimension: "age", values: { operator: "between", value: "25-40" } },
  "millennial": { dimension: "age", values: { operator: "between", value: "25-40" } },
  "gen y": { dimension: "age", values: { operator: "between", value: "25-40" } },
  "gen x": { dimension: "age", values: { operator: "between", value: "41-56" } },
  "generation x": { dimension: "age", values: { operator: "between", value: "41-56" } },
  "boomers": { dimension: "age", values: { operator: "between", value: "57-75" } },
  "baby boomers": { dimension: "age", values: { operator: "between", value: "57-75" } },
  "young adults": { dimension: "age", values: { operator: "between", value: "18-34" } },
  "middle-aged": { dimension: "age", values: { operator: "between", value: "35-54" } },
  "seniors": { dimension: "age", values: { operator: "gte", value: "55" } },
  "teenagers": { dimension: "age", values: { operator: "between", value: "13-19" } },
  "young professionals": { dimension: "age", values: { operator: "between", value: "25-35" } },

  // Income terms
  "high income": { dimension: "income", values: { operator: "gte", value: "150000" } },
  "affluent": { dimension: "income", values: { operator: "gte", value: "150000" } },
  "wealthy": { dimension: "income", values: { operator: "gte", value: "200000" } },
  "middle income": { dimension: "income", values: { operator: "between", value: "50000-150000" } },
  "middle class": { dimension: "income", values: { operator: "between", value: "50000-150000" } },
  "low income": { dimension: "income", values: { operator: "lte", value: "50000" } },
  "budget-conscious": { dimension: "income", values: { operator: "lte", value: "75000" } },

  // Location terms
  "urban": { dimension: "location_type", values: { operator: "is", value: "urban" } },
  "suburban": { dimension: "location_type", values: { operator: "is", value: "suburban" } },
  "rural": { dimension: "location_type", values: { operator: "is", value: "rural" } },
  "city dwellers": { dimension: "location_type", values: { operator: "is", value: "urban" } },
  "metro": { dimension: "location_type", values: { operator: "is", value: "metro" } },

  // Gender terms
  "women": { dimension: "gender", values: { operator: "is", value: "female" } },
  "female": { dimension: "gender", values: { operator: "is", value: "female" } },
  "men": { dimension: "gender", values: { operator: "is", value: "male" } },
  "male": { dimension: "gender", values: { operator: "is", value: "male" } },

  // Education terms
  "college educated": { dimension: "education", values: { operator: "gte", value: "bachelors" } },
  "graduate degree": { dimension: "education", values: { operator: "gte", value: "masters" } },
  "highly educated": { dimension: "education", values: { operator: "gte", value: "masters" } },
  "university": { dimension: "education", values: { operator: "gte", value: "bachelors" } },

  // Interests/Behaviors
  "sustainability": { dimension: "interests", values: { operator: "contains", value: "sustainability" } },
  "eco-conscious": { dimension: "interests", values: { operator: "contains", value: "sustainability,environment" } },
  "environmentally conscious": { dimension: "interests", values: { operator: "contains", value: "sustainability,environment" } },
  "green": { dimension: "interests", values: { operator: "contains", value: "sustainability" } },
  "tech savvy": { dimension: "interests", values: { operator: "contains", value: "technology,gadgets" } },
  "technology": { dimension: "interests", values: { operator: "contains", value: "technology" } },
  "early adopters": { dimension: "behavior", values: { operator: "is", value: "early_adopter" } },
  "fitness": { dimension: "interests", values: { operator: "contains", value: "fitness,health" } },
  "health conscious": { dimension: "interests", values: { operator: "contains", value: "health,wellness" } },
  "travel": { dimension: "interests", values: { operator: "contains", value: "travel" } },
  "luxury": { dimension: "interests", values: { operator: "contains", value: "luxury,premium" } },
  "fashion": { dimension: "interests", values: { operator: "contains", value: "fashion,style" } },
  "gaming": { dimension: "interests", values: { operator: "contains", value: "gaming,esports" } },
  "gamers": { dimension: "interests", values: { operator: "contains", value: "gaming" } },
  "foodies": { dimension: "interests", values: { operator: "contains", value: "food,dining,culinary" } },
  "food enthusiasts": { dimension: "interests", values: { operator: "contains", value: "food,dining" } },
  "music lovers": { dimension: "interests", values: { operator: "contains", value: "music" } },
  "sports fans": { dimension: "interests", values: { operator: "contains", value: "sports" } },
  "pet owners": { dimension: "behavior", values: { operator: "is", value: "pet_owner" } },
  "parents": { dimension: "life_stage", values: { operator: "is", value: "parent" } },
  "homeowners": { dimension: "housing", values: { operator: "is", value: "owner" } },
  "renters": { dimension: "housing", values: { operator: "is", value: "renter" } },

  // Shopping behaviors
  "online shoppers": { dimension: "shopping_behavior", values: { operator: "is", value: "online_primary" } },
  "shop online": { dimension: "shopping_behavior", values: { operator: "is", value: "online_primary" } },
  "e-commerce": { dimension: "shopping_behavior", values: { operator: "is", value: "online_primary" } },
  "in-store shoppers": { dimension: "shopping_behavior", values: { operator: "is", value: "in_store_primary" } },
  "premium shoppers": { dimension: "shopping_behavior", values: { operator: "is", value: "premium" } },
  "discount shoppers": { dimension: "shopping_behavior", values: { operator: "is", value: "discount" } },

  // Social media
  "social media users": { dimension: "social_media", values: { operator: "gte", value: "active" } },
  "heavy social media": { dimension: "social_media", values: { operator: "is", value: "heavy" } },
  "instagram users": { dimension: "platform_usage", values: { operator: "contains", value: "instagram" } },
  "tiktok users": { dimension: "platform_usage", values: { operator: "contains", value: "tiktok" } },
  "content creators": { dimension: "behavior", values: { operator: "is", value: "content_creator" } },
  "influencers": { dimension: "behavior", values: { operator: "is", value: "influencer" } },
}

// Parse natural language into structured attributes
function parseNaturalLanguage(query: string): ParsedAttribute[] {
  const attributes: ParsedAttribute[] = []
  const lowerQuery = query.toLowerCase()

  // Find matching dimensions
  for (const [term, mapping] of Object.entries(dimensionMappings)) {
    if (lowerQuery.includes(term)) {
      const confidence = term.length > 10 ? 0.95 : term.length > 5 ? 0.88 : 0.82
      attributes.push({
        dimension: mapping.dimension,
        operator: mapping.values?.operator || "is",
        value: mapping.values?.value || term,
        confidence,
        source: term,
      })
    }
  }

  // Parse age ranges like "25-40" or "ages 25 to 40"
  const ageRangeMatch = lowerQuery.match(/(?:ages?\s*)?(\d{1,2})\s*[-to]+\s*(\d{1,2})/)
  if (ageRangeMatch && !attributes.find(a => a.dimension === "age")) {
    attributes.push({
      dimension: "age",
      operator: "between",
      value: `${ageRangeMatch[1]}-${ageRangeMatch[2]}`,
      confidence: 0.95,
      source: ageRangeMatch[0],
    })
  }

  // Parse income like "$100k+" or "income over 100000"
  const incomeMatch = lowerQuery.match(/\$?(\d+)k?\+?(?:\s*(?:income|salary|earning))?/)
  if (incomeMatch && lowerQuery.includes("income") && !attributes.find(a => a.dimension === "income")) {
    const value = incomeMatch[1].length <= 3 ? parseInt(incomeMatch[1]) * 1000 : parseInt(incomeMatch[1])
    attributes.push({
      dimension: "income",
      operator: "gte",
      value: value.toString(),
      confidence: 0.85,
      source: incomeMatch[0],
    })
  }

  // Deduplicate by dimension (keep highest confidence)
  const deduped: ParsedAttribute[] = []
  const seen = new Map<string, ParsedAttribute>()
  for (const attr of attributes) {
    const existing = seen.get(attr.dimension)
    if (!existing || attr.confidence > existing.confidence) {
      seen.set(attr.dimension, attr)
    }
  }
  deduped.push(...seen.values())

  return deduped
}

// Estimate audience size based on attributes
function estimateAudienceSize(attributes: ParsedAttribute[], markets: string[]): number {
  // Base population (simplified model)
  const marketPopulations: Record<string, number> = {
    Global: 8000000000,
    US: 330000000,
    UK: 67000000,
    DE: 83000000,
    FR: 67000000,
    JP: 125000000,
    BR: 215000000,
    AU: 26000000,
    CA: 40000000,
    KR: 52000000,
    NL: 17500000,
    SG: 6000000,
    HK: 7500000,
    UAE: 10000000,
  }

  // Calculate base population
  let basePopulation = 0
  for (const market of markets) {
    basePopulation += marketPopulations[market] || 50000000
  }

  // Apply filters based on attributes
  let multiplier = 1.0
  for (const attr of attributes) {
    switch (attr.dimension) {
      case "age":
        multiplier *= 0.15 // Age group typically 15% of population
        break
      case "income":
        if (attr.operator === "gte" && parseInt(attr.value) > 100000) {
          multiplier *= 0.15
        } else if (attr.operator === "gte" && parseInt(attr.value) > 50000) {
          multiplier *= 0.35
        } else {
          multiplier *= 0.5
        }
        break
      case "gender":
        multiplier *= 0.5
        break
      case "location_type":
        multiplier *= attr.value === "urban" ? 0.55 : attr.value === "suburban" ? 0.30 : 0.15
        break
      case "interests":
        multiplier *= 0.25
        break
      case "behavior":
        multiplier *= 0.20
        break
      case "education":
        multiplier *= 0.35
        break
      default:
        multiplier *= 0.5
    }
  }

  // Add some randomness for realism
  const variance = 0.9 + Math.random() * 0.2
  return Math.round(basePopulation * multiplier * variance)
}

// Generate suggestions for refining the audience
function generateSuggestions(attributes: ParsedAttribute[], query: string): string[] {
  const suggestions: string[] = []

  // Suggest adding demographics if missing
  if (!attributes.find(a => a.dimension === "age")) {
    suggestions.push("Consider adding an age range to refine your audience")
  }
  if (!attributes.find(a => a.dimension === "income")) {
    suggestions.push("Adding income level could help target purchasing power")
  }
  if (!attributes.find(a => a.dimension === "location_type")) {
    suggestions.push("Specify urban, suburban, or rural to narrow geography")
  }

  // Suggest related interests based on what's already selected
  const interests = attributes.filter(a => a.dimension === "interests")
  if (interests.length > 0) {
    if (interests.some(i => i.value.includes("sustainability"))) {
      suggestions.push("Related: organic food, ethical fashion, renewable energy")
    }
    if (interests.some(i => i.value.includes("technology"))) {
      suggestions.push("Related: gaming, streaming services, smart home")
    }
    if (interests.some(i => i.value.includes("fitness"))) {
      suggestions.push("Related: nutrition, wellness apps, athleisure")
    }
  }

  return suggestions.slice(0, 3)
}

// Generate natural language summary
function generateSummary(attributes: ParsedAttribute[]): string {
  if (attributes.length === 0) {
    return "Enter a description to define your audience"
  }

  const parts: string[] = []

  // Age
  const age = attributes.find(a => a.dimension === "age")
  if (age) {
    if (age.value === "18-24") parts.push("Gen Z consumers")
    else if (age.value === "25-40") parts.push("Millennials")
    else if (age.value === "41-56") parts.push("Gen X adults")
    else if (age.value === "57-75") parts.push("Baby Boomers")
    else parts.push(`Adults aged ${age.value}`)
  }

  // Location
  const location = attributes.find(a => a.dimension === "location_type")
  if (location) {
    parts.push(`in ${location.value} areas`)
  }

  // Income
  const income = attributes.find(a => a.dimension === "income")
  if (income) {
    const incomeVal = parseInt(income.value)
    if (incomeVal >= 150000) parts.push("with high income")
    else if (incomeVal >= 75000) parts.push("with middle-to-upper income")
    else parts.push("who are budget-conscious")
  }

  // Interests
  const interests = attributes.filter(a => a.dimension === "interests" || a.dimension === "behavior")
  if (interests.length > 0) {
    const interestValues = interests.map(i => i.value.split(",")[0]).slice(0, 2)
    parts.push(`interested in ${interestValues.join(" and ")}`)
  }

  return parts.join(" ") || "Audience based on your criteria"
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, markets = ["Global"] } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query string is required" },
        { status: 400 }
      )
    }

    // Parse the natural language query
    const attributes = parseNaturalLanguage(query)

    // Estimate audience size
    const estimatedSize = estimateAudienceSize(attributes, markets)

    // Generate suggestions
    const suggestions = generateSuggestions(attributes, query)

    // Generate summary
    const naturalLanguageSummary = generateSummary(attributes)

    const result: ParsedAudience = {
      attributes,
      estimatedSize,
      naturalLanguageSummary,
      suggestions,
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Parse audience error:", error)
    return NextResponse.json(
      { error: "Failed to parse audience query" },
      { status: 500 }
    )
  }
}
