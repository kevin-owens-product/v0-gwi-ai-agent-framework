# Audience Enhancements Documentation

This document describes the comprehensive enhancements made to the Audiences feature, transforming it from basic demographic data into a rich, multi-dimensional consumer insights platform.

## Overview

The enhanced Audiences feature provides deep consumer understanding through:
- **AI-Generated Personas** - Visual representations with personality profiles
- **Day in the Life** - Temporal activity patterns and touchpoints
- **Habits & Behaviors** - Behavioral patterns with population indexing
- **Media Consumption** - Platform usage across social, streaming, audio, and news
- **Brand Affinities** - Brand preferences, loyalty patterns, and strategic insights

## New Components

### 1. AudiencePersona (`components/audiences/audience-persona.tsx`)

Generates AI-powered persona profiles representing typical audience members.

**Features:**
- Visual avatar generation using DiceBear API
- Demographic information (age, location, occupation, income)
- Personality traits with strength indicators
- Core values and motivations
- Pain points and frustrations
- Lifestyle indicators and hobbies
- Goals and challenges (short-term and long-term)
- Decision-making patterns (style, timeline, influences)
- Regenerate functionality for variant personas

**Props:**
```typescript
interface AudiencePersonaProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: string
}
```

**Tabs:**
- Overview - Quick summary of persona
- Personality - Traits and values
- Lifestyle - Hobbies and interests
- Goals & Challenges - Aspirations and obstacles
- Decision Making - Purchase and choice patterns

---

### 2. DayInTheLife (`components/audiences/day-in-the-life.tsx`)

Visualizes typical daily activities and media touchpoints.

**Features:**
- Weekday vs weekend activity patterns
- Hourly timeline with activities and locations
- Media moments throughout the day
- Device usage breakdown
- Mood and energy level tracking
- Peak engagement periods

**Props:**
```typescript
interface DayInTheLifeProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: string
}
```

**Tabs:**
- Timeline - Hourly activity breakdown
- Media Moments - When/where media is consumed
- Devices - Device preference distribution
- Mood & Energy - Emotional state patterns

**Time Periods:**
- Early Morning (5-7 AM)
- Morning (7-9 AM)
- Late Morning (9-12 PM)
- Lunch (12-2 PM)
- Afternoon (2-5 PM)
- Evening (5-8 PM)
- Night (8-11 PM)
- Late Night (11 PM-5 AM)

---

### 3. HabitsAndBehaviors (`components/audiences/habits-behaviors.tsx`)

Displays behavioral patterns with population indexing.

**Features:**
- Behavioral categories with frequency and strength
- Population index (100 = average, >100 = over-indexed)
- Shopping behaviors and preferred channels
- Purchase decision factors
- Brand loyalty indicators
- Digital habits and platform usage
- Peak activity times

**Props:**
```typescript
interface HabitsAndBehaviorsProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: string
}
```

**Behavioral Categories:**
- Shopping & Spending
- Health & Wellness
- Digital Habits
- Sustainability
- Financial Habits
- Social Behaviors

**Index Interpretation:**
- 150+ = Strongly over-indexed (significantly more likely than average)
- 120-149 = Over-indexed (more likely than average)
- 80-119 = Average
- <80 = Under-indexed (less likely than average)

---

### 4. MediaConsumption (`components/audiences/media-consumption.tsx`)

Detailed media habits across all platform types.

**Features:**
- Social media platform penetration and usage
- Engagement styles and ad receptivity
- Streaming service preferences
- Genre preferences and watching behaviors
- Audio/podcast consumption
- News consumption patterns
- Content length preferences

**Props:**
```typescript
interface MediaConsumptionProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: string
}
```

**Tabs:**
- Social Media - Platform usage and engagement
- Streaming - Video service preferences
- Audio - Music and podcast habits
- News - Information source preferences

**Metrics:**
- Penetration % - Percentage of audience using platform
- Daily Usage - Time spent per day
- Engagement Style - Active creator vs passive consumer
- Ad Receptivity - Openness to advertising
- Primary Genres - Content preferences

---

### 5. BrandAffinities (`components/audiences/brand-affinities.tsx`)

Brand preferences, loyalty patterns, and strategic recommendations.

**Features:**
- Brand affinity by category
- Affinity strength and population index
- Trend indicators (growing/stable/declining)
- Sentiment analysis
- Loyalty profile metrics
- Top loyalty drivers
- Strategic recommendations

**Props:**
```typescript
interface BrandAffinitiesProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: string
}
```

**Brand Categories:**
- Technology
- Automotive
- Food & Beverage
- Fashion & Apparel
- Travel & Hospitality
- Financial Services

**Loyalty Metrics:**
- Overall Loyalty Score (0-100)
- Switching Propensity (High/Medium/Low)
- Price vs Loyalty Balance
- Advocacy Level

---

## Integration

All components are integrated into the audience detail page (`app/dashboard/audiences/[id]/page.tsx`) through a tabbed interface:

```typescript
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="persona">Persona</TabsTrigger>
    <TabsTrigger value="day-in-life">Day in the Life</TabsTrigger>
    <TabsTrigger value="habits">Habits & Behaviors</TabsTrigger>
    <TabsTrigger value="media">Media Consumption</TabsTrigger>
    <TabsTrigger value="brands">Brand Affinities</TabsTrigger>
  </TabsList>

  <TabsContent value="persona">
    <AudiencePersona
      audienceId={id}
      audienceName={audience.name}
      audienceCriteria={audience.criteria}
    />
  </TabsContent>
  {/* ... other tabs */}
</Tabs>
```

## Data Generation

All data is generated deterministically based on the `audienceId` prop, ensuring:
- Consistent data across page refreshes
- Unique data for each audience
- Realistic, contextually appropriate values

The generation uses a seeded random function:
```typescript
const generateSeed = (audienceId: string): number => {
  let hash = 0
  for (let i = 0; i < audienceId.length; i++) {
    const char = audienceId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}
```

## Future Enhancements

Potential areas for future development:
1. **Real Data Integration** - Connect to actual GWI API data
2. **Export Functionality** - PDF/PowerPoint export of insights
3. **Comparison Mode** - Side-by-side audience comparison
4. **Custom Personas** - User-defined persona attributes
5. **AI Insights** - LLM-powered narrative insights
6. **Time Series** - Historical trend analysis

## Dependencies

- `@radix-ui/react-tabs` - Tab navigation
- `lucide-react` - Icons
- `shadcn/ui` - UI components (Card, Badge, Progress, Button)
- DiceBear API - Avatar generation

## File Structure

```
components/audiences/
├── audience-persona.tsx      # AI-generated persona profiles
├── brand-affinities.tsx      # Brand preferences and loyalty
├── day-in-the-life.tsx       # Daily activity timeline
├── habits-behaviors.tsx      # Behavioral patterns
├── media-consumption.tsx     # Media platform usage
└── audience-insights.tsx     # Comprehensive insights wrapper

app/dashboard/audiences/
├── page.tsx                  # Audience list page
└── [id]/
    └── page.tsx              # Enhanced audience detail page
```
