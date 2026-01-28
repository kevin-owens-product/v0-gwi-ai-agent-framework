import { PrismaClient, SurveyStatus, QuestionType, PipelineType, PipelineRunStatus, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

// Helper for JSON null handling in Prisma
const JsonNull = Prisma.JsonNull

// GWI's 54 Core Markets (from gwi.com/data-coverage)
const GWI_MARKETS = {
  // Americas
  americas: ['US', 'CA', 'MX', 'BR', 'AR', 'CO'],
  // Europe
  europe: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'AT', 'CH', 'IE', 'PT', 'GR', 'RO', 'HU', 'UA', 'RU', 'TR'],
  // Asia Pacific
  apac: ['CN', 'JP', 'KR', 'IN', 'AU', 'NZ', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'TW', 'HK'],
  // Middle East & Africa
  mea: ['SA', 'AE', 'EG', 'ZA', 'NG', 'KE', 'IL'],
}
const ALL_MARKETS = [...GWI_MARKETS.americas, ...GWI_MARKETS.europe, ...GWI_MARKETS.apac, ...GWI_MARKETS.mea]

// GWI Sample Sizes by Product
const GWI_SAMPLE_SIZES = {
  core: 960000,      // 960K annual, quarterly updates
  usa: 80000,        // USA-specific deep dive
  gaming: 65000,     // Gaming dataset
  sports: 80000,     // Sports dataset
  kids: 20000,       // Kids (18 markets)
  luxury: 13000,     // Luxury consumers
  zeitgeist: 12000,  // Monthly pulse survey
}

// GWI Demographics (from data coverage page)
const GWI_DEMOGRAPHICS = {
  gender: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  ageGroups: ['16-24', '25-34', '35-44', '45-54', '55-64', '65+'],
  sexualOrientation: ['Heterosexual', 'Gay/Lesbian', 'Bisexual', 'Other', 'Prefer not to say'],
  ethnicity: ['White/Caucasian', 'Black/African', 'Hispanic/Latino', 'Asian', 'Middle Eastern', 'Mixed/Multiple', 'Other', 'Prefer not to say'],
  education: ['No formal education', 'Primary/Elementary', 'Secondary/High School', 'Vocational/Technical', 'Some college', 'Bachelor\'s degree', 'Master\'s degree', 'Doctorate/PhD'],
  householdIncome: ['Under $15,000', '$15,000-$29,999', '$30,000-$49,999', '$50,000-$74,999', '$75,000-$99,999', '$100,000-$149,999', '$150,000-$199,999', '$200,000+'],
  relationshipStatus: ['Single', 'In a relationship', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'],
  children: ['No children', '1 child', '2 children', '3 children', '4+ children'],
  pets: ['No pets', 'Dog(s)', 'Cat(s)', 'Fish', 'Bird(s)', 'Other pets', 'Multiple types'],
}

// GWI Brand Categories (5000+ brands tracked)
const GWI_BRAND_CATEGORIES = {
  automotive: ['Toyota', 'Volkswagen', 'Ford', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla', 'Hyundai', 'Kia', 'Nissan', 'Chevrolet', 'Porsche', 'Lexus', 'Mazda', 'Subaru'],
  consumerTech: ['Apple', 'Samsung', 'Google', 'Microsoft', 'Sony', 'LG', 'Huawei', 'Xiaomi', 'Dell', 'HP', 'Lenovo', 'ASUS', 'OnePlus', 'Oppo', 'Vivo', 'Nothing'],
  spiritsAlcohol: ['Johnnie Walker', 'Jack Daniel\'s', 'Bacardi', 'Smirnoff', 'Absolut', 'Grey Goose', 'Hennessy', 'Rémy Martin', 'Patrón', 'Don Julio', 'Heineken', 'Budweiser', 'Corona', 'Guinness'],
  luxuryFashion: ['Louis Vuitton', 'Gucci', 'Chanel', 'Hermès', 'Prada', 'Dior', 'Burberry', 'Versace', 'Balenciaga', 'Fendi', 'Cartier', 'Rolex', 'Omega', 'TAG Heuer'],
  streaming: ['Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+', 'Paramount+', 'Peacock', 'YouTube Premium', 'Spotify', 'Apple Music', 'Tidal'],
  socialMedia: ['Instagram', 'TikTok', 'Facebook', 'Twitter/X', 'LinkedIn', 'Snapchat', 'Pinterest', 'Reddit', 'WhatsApp', 'Telegram', 'Discord', 'BeReal'],
  gaming: ['PlayStation', 'Xbox', 'Nintendo', 'Steam', 'Epic Games', 'EA', 'Activision', 'Ubisoft', 'Rockstar', 'Riot Games', 'Blizzard', 'Valve'],
  foodBeverage: ['Coca-Cola', 'Pepsi', 'Starbucks', 'McDonald\'s', 'Nestlé', 'Unilever', 'Red Bull', 'Monster Energy', 'Dunkin\'', 'Subway', 'KFC', 'Pizza Hut'],
}

// Helper to safely run a seed section that might reference tables that don't exist
async function safeSeedSection(sectionName: string, seedOperation: () => Promise<void>): Promise<void> {
  try {
    await seedOperation()
    console.log(`✅ ${sectionName}`)
  } catch (error: unknown) {
    const prismaError = error as { code?: string; message?: string }
    if (prismaError?.code === 'P2021') {
      console.log(`⚠️  Skipping ${sectionName} - table not yet migrated`)
      return
    }
    console.error(`❌ ${sectionName} failed:`, prismaError?.message || error)
    throw error
  }
}

// Helper to safely delete from tables that might not exist yet
async function safeDeleteMany(deleteOperation: () => Promise<unknown>): Promise<void> {
  try {
    await deleteOperation()
  } catch (error: unknown) {
    const prismaError = error as { code?: string }
    if (prismaError?.code === 'P2021') {
      return
    }
    throw error
  }
}

async function main() {
  console.log('🌱 Starting GWI Portal test data seed...\n')

  // Get a GWI admin to use as creator
  const gwiAdmin = await prisma.superAdmin.findFirst({
    where: { role: { in: ['GWI_ADMIN', 'SUPER_ADMIN'] } }
  })

  if (!gwiAdmin) {
    console.error('❌ No GWI Admin found. Please run the main seed first.')
    process.exit(1)
  }

  const dataEngineer = await prisma.superAdmin.findFirst({
    where: { role: 'DATA_ENGINEER' }
  }) || gwiAdmin

  const taxonomyManager = await prisma.superAdmin.findFirst({
    where: { role: 'TAXONOMY_MANAGER' }
  }) || gwiAdmin

  const mlEngineer = await prisma.superAdmin.findFirst({
    where: { role: 'ML_ENGINEER' }
  }) || gwiAdmin

  // Clean existing GWI data
  console.log('🧹 Cleaning existing GWI data...')
  await safeDeleteMany(() => prisma.lLMUsageRecord.deleteMany())
  await safeDeleteMany(() => prisma.lLMConfiguration.deleteMany())
  await safeDeleteMany(() => prisma.promptTemplate.deleteMany())
  await safeDeleteMany(() => prisma.pipelineRun.deleteMany())
  await safeDeleteMany(() => prisma.pipelineValidationRule.deleteMany())
  await safeDeleteMany(() => prisma.dataPipeline.deleteMany())
  await safeDeleteMany(() => prisma.surveyResponse.deleteMany())
  await safeDeleteMany(() => prisma.surveyDistribution.deleteMany())
  await safeDeleteMany(() => prisma.surveyQuestion.deleteMany())
  await safeDeleteMany(() => prisma.survey.deleteMany())
  await safeDeleteMany(() => prisma.taxonomyAttribute.deleteMany())
  await safeDeleteMany(() => prisma.taxonomyMappingRule.deleteMany())
  await safeDeleteMany(() => prisma.taxonomyCategory.deleteMany())
  await safeDeleteMany(() => prisma.systemToolConfiguration.deleteMany())
  await safeDeleteMany(() => prisma.systemAgentTemplate.deleteMany())
  await safeDeleteMany(() => prisma.gWIDataSourceConnection.deleteMany())
  await safeDeleteMany(() => prisma.gWIMonitoringAlert.deleteMany())
  await safeDeleteMany(() => prisma.gWIErrorLog.deleteMany())
  console.log('')

  // ==================== SURVEYS ====================
  await safeSeedSection('Surveys & Questions', async () => {
    // Survey 1: GWI Core Survey (flagship quarterly study)
    const coreSurvey = await prisma.survey.create({
      data: {
        name: 'GWI Core Q1 2024',
        description: `GWI's flagship ongoing study of online consumers across ${ALL_MARKETS.length} markets. Refreshed quarterly with 50,000+ profiling points covering attitudes, interests, lifestyle, purchase behavior, media consumption, and brand tracking for 5,000+ brands.`,
        version: 4,
        status: SurveyStatus.ACTIVE,
        createdById: taxonomyManager.id,
      }
    })

    await prisma.surveyQuestion.createMany({
      data: [
        // Demographics Section
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_AGE',
          text: 'What is your age?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.ageGroups),
          order: 0,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'age_group' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_GENDER',
          text: 'What is your gender?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.gender),
          order: 1,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'gender' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_ORIENTATION',
          text: 'How would you describe your sexual orientation?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.sexualOrientation),
          order: 2,
          required: false,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'sexual_orientation' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_ETHNICITY',
          text: 'Which of the following best describes your ethnic background?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.ethnicity),
          order: 3,
          required: false,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'ethnicity' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_EDUCATION',
          text: 'What is the highest level of education you have completed?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.education),
          order: 4,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'education' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_INCOME',
          text: 'What is your annual household income?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.householdIncome),
          order: 5,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'income_bracket' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_RELATIONSHIP',
          text: 'What is your current relationship status?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.relationshipStatus),
          order: 6,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'relationship_status' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_CHILDREN',
          text: 'How many children do you have?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.children),
          order: 7,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'children' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'DEMO_PETS',
          text: 'What pets do you have in your household?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(GWI_DEMOGRAPHICS.pets),
          order: 8,
          required: false,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'pets' }),
        },
        // Brand Tracking Section
        {
          surveyId: coreSurvey.id,
          code: 'BRAND_TECH_AWARENESS',
          text: 'Which of the following consumer tech brands are you aware of?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(GWI_BRAND_CATEGORIES.consumerTech),
          order: 10,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'brand_metrics', attribute: 'awareness', industry: 'consumer_tech' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'BRAND_TECH_CONSIDERATION',
          text: 'Which consumer tech brands would you consider purchasing from in the next 12 months?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(GWI_BRAND_CATEGORIES.consumerTech),
          order: 11,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'brand_metrics', attribute: 'consideration', industry: 'consumer_tech' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'BRAND_STREAMING_USAGE',
          text: 'Which streaming services have you used in the past month?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(GWI_BRAND_CATEGORIES.streaming),
          order: 12,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'brand_metrics', attribute: 'usage', industry: 'streaming' }),
        },
        // Social Media Section
        {
          surveyId: coreSurvey.id,
          code: 'SOCIAL_PLATFORMS_USED',
          text: 'Which social media platforms have you used in the past month?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(GWI_BRAND_CATEGORIES.socialMedia),
          order: 20,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'media', attribute: 'social_platforms' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'SOCIAL_DAILY_TIME',
          text: 'On average, how many hours per day do you spend on social media?',
          type: QuestionType.NUMERIC,
          validationRules: JSON.stringify({ min: 0, max: 24, decimals: 1 }),
          order: 21,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'media', attribute: 'social_media_hours' }),
        },
        // Purchase Behavior Section
        {
          surveyId: coreSurvey.id,
          code: 'PURCHASE_ONLINE_FREQ',
          text: 'How often do you make purchases online?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Daily', 'Several times a week', 'Once a week', 'Several times a month', 'Once a month', 'Less than once a month', 'Never']),
          order: 30,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'behavior', attribute: 'online_purchase_frequency' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'PURCHASE_DRIVERS',
          text: 'What factors are most important when making a purchase decision?',
          type: QuestionType.MATRIX,
          options: JSON.stringify({
            rows: ['Price', 'Quality', 'Brand reputation', 'Reviews/ratings', 'Sustainability', 'Convenience', 'Exclusivity'],
            columns: ['Very important', 'Somewhat important', 'Not very important', 'Not at all important']
          }),
          order: 31,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'behavior', attribute: 'purchase_drivers' }),
        },
        // Attitudes Section
        {
          surveyId: coreSurvey.id,
          code: 'ATTITUDE_SUSTAINABILITY',
          text: 'To what extent do you agree: "I try to buy products that are environmentally friendly"',
          type: QuestionType.SCALE,
          options: JSON.stringify({ min: 1, max: 5, labels: { 1: 'Strongly disagree', 5: 'Strongly agree' } }),
          order: 40,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'attitudes', attribute: 'sustainability' }),
        },
        {
          surveyId: coreSurvey.id,
          code: 'ATTITUDE_TECH_ADOPTION',
          text: 'Which statement best describes your approach to new technology?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['I\'m usually first to try new tech', 'I adopt early once others prove it works', 'I wait until tech is mainstream', 'I\'m slow to adopt new technology', 'I avoid new technology when possible']),
          order: 41,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'attitudes', attribute: 'tech_adoption' }),
        },
      ]
    })

    // Survey 2: GWI Gaming (65K sample across 18 markets)
    const gamingSurvey = await prisma.survey.create({
      data: {
        name: 'GWI Gaming Q1 2024',
        description: `GWI's dedicated gaming research covering ${GWI_SAMPLE_SIZES.gaming.toLocaleString()} annual respondents across 18 markets. Tracks gaming platforms, genres, esports, streaming, in-game purchases, and gaming attitudes.`,
        version: 2,
        status: SurveyStatus.ACTIVE,
        createdById: taxonomyManager.id,
      }
    })

    await prisma.surveyQuestion.createMany({
      data: [
        {
          surveyId: gamingSurvey.id,
          code: 'GAMING_PLATFORMS',
          text: 'Which gaming platforms have you used in the past month?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC (Steam)', 'PC (Epic Games)', 'Mobile (iOS)', 'Mobile (Android)', 'Cloud Gaming', 'VR Headset']),
          order: 0,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'gaming', attribute: 'platforms' }),
        },
        {
          surveyId: gamingSurvey.id,
          code: 'GAMING_GENRES',
          text: 'Which game genres do you play most often?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(['Action/Adventure', 'First-Person Shooter', 'RPG', 'Sports', 'Racing', 'Strategy', 'Puzzle', 'Battle Royale', 'MOBA', 'MMO', 'Simulation', 'Fighting', 'Horror']),
          order: 1,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'gaming', attribute: 'genres' }),
        },
        {
          surveyId: gamingSurvey.id,
          code: 'GAMING_HOURS_WEEKLY',
          text: 'How many hours per week do you spend gaming?',
          type: QuestionType.NUMERIC,
          validationRules: JSON.stringify({ min: 0, max: 100 }),
          order: 2,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'gaming', attribute: 'weekly_hours' }),
        },
        {
          surveyId: gamingSurvey.id,
          code: 'GAMING_SPEND_MONTHLY',
          text: 'How much do you typically spend on games and in-game purchases per month?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['$0', '$1-$10', '$11-$25', '$26-$50', '$51-$100', '$100+']),
          order: 3,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'gaming', attribute: 'monthly_spend' }),
        },
        {
          surveyId: gamingSurvey.id,
          code: 'ESPORTS_ENGAGEMENT',
          text: 'How do you engage with esports?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(['Watch tournaments live', 'Watch VODs/highlights', 'Follow esports teams/players', 'Bet on esports', 'Attend events in person', 'Play competitively myself', 'Not interested in esports']),
          order: 4,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'gaming', attribute: 'esports_engagement' }),
        },
        {
          surveyId: gamingSurvey.id,
          code: 'GAME_STREAMING',
          text: 'Which game streaming platforms do you use?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(['Twitch', 'YouTube Gaming', 'Facebook Gaming', 'TikTok', 'Kick', 'I don\'t watch game streaming']),
          order: 5,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'gaming', attribute: 'streaming_platforms' }),
        },
      ]
    })

    // Survey 3: GWI USA (80K sample, all 50 states + DC)
    const usaSurvey = await prisma.survey.create({
      data: {
        name: 'GWI USA Q1 2024',
        description: `GWI's USA-specific deep dive with ${GWI_SAMPLE_SIZES.usa.toLocaleString()} annual respondents across all 50 states plus DC. Provides state-level data for granular regional analysis.`,
        version: 3,
        status: SurveyStatus.ACTIVE,
        createdById: gwiAdmin.id,
      }
    })

    await prisma.surveyQuestion.createMany({
      data: [
        {
          surveyId: usaSurvey.id,
          code: 'USA_STATE',
          text: 'Which state do you currently reside in?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia']),
          order: 0,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'us_state' }),
        },
        {
          surveyId: usaSurvey.id,
          code: 'USA_METRO',
          text: 'Do you live in a metropolitan area?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Major metro (1M+ population)', 'Mid-size metro (250K-1M)', 'Small metro (100K-250K)', 'Micropolitan area', 'Rural/non-metro']),
          order: 1,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'demographics', attribute: 'urbanicity' }),
        },
        {
          surveyId: usaSurvey.id,
          code: 'USA_POLITICAL',
          text: 'How would you describe your political views?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Very liberal', 'Somewhat liberal', 'Moderate', 'Somewhat conservative', 'Very conservative', 'Prefer not to say']),
          order: 2,
          required: false,
          taxonomyLinks: JSON.stringify({ category: 'attitudes', attribute: 'political_leaning' }),
        },
        {
          surveyId: usaSurvey.id,
          code: 'USA_CORD_CUTTING',
          text: 'What is your TV subscription status?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Traditional cable/satellite', 'Streaming only (cord cutter)', 'Both cable and streaming', 'Free/antenna TV only', 'No TV subscription']),
          order: 3,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'media', attribute: 'tv_subscription_status' }),
        },
      ]
    })

    // Survey 4: GWI Zeitgeist (12K monthly pulse survey)
    const zeitgeistSurvey = await prisma.survey.create({
      data: {
        name: 'GWI Zeitgeist January 2024',
        description: `GWI's monthly pulse survey with ${GWI_SAMPLE_SIZES.zeitgeist.toLocaleString()} respondents capturing real-time consumer sentiment on trending topics, current events, and emerging behaviors.`,
        version: 1,
        status: SurveyStatus.COMPLETED,
        createdById: taxonomyManager.id,
      }
    })

    await prisma.surveyQuestion.createMany({
      data: [
        {
          surveyId: zeitgeistSurvey.id,
          code: 'ZEITGEIST_AI_USAGE',
          text: 'Have you used any AI tools (like ChatGPT, Claude, Gemini) in the past month?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Yes, for work', 'Yes, for personal use', 'Yes, both work and personal', 'No, but I plan to', 'No, and I don\'t plan to']),
          order: 0,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'technology', attribute: 'ai_tool_usage' }),
        },
        {
          surveyId: zeitgeistSurvey.id,
          code: 'ZEITGEIST_ECONOMIC_OUTLOOK',
          text: 'How do you feel about the economy over the next 12 months?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Very optimistic', 'Somewhat optimistic', 'Neutral', 'Somewhat pessimistic', 'Very pessimistic']),
          order: 1,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'attitudes', attribute: 'economic_sentiment' }),
        },
        {
          surveyId: zeitgeistSurvey.id,
          code: 'ZEITGEIST_SPENDING_CHANGE',
          text: 'Compared to last month, how has your discretionary spending changed?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Spending significantly more', 'Spending somewhat more', 'About the same', 'Spending somewhat less', 'Spending significantly less']),
          order: 2,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'behavior', attribute: 'spending_change' }),
        },
        {
          surveyId: zeitgeistSurvey.id,
          code: 'ZEITGEIST_BRAND_TRUST',
          text: 'Which factors most impact your trust in a brand right now?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(['Environmental practices', 'Data privacy', 'Employee treatment', 'Political stance', 'Product quality', 'Customer service', 'Price transparency']),
          order: 3,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'attitudes', attribute: 'brand_trust_factors' }),
        },
      ]
    })

    // Survey 5: GWI Sports (80K sample across 18 markets)
    const sportsSurvey = await prisma.survey.create({
      data: {
        name: 'GWI Sports Q1 2024',
        description: `GWI's dedicated sports research with ${GWI_SAMPLE_SIZES.sports.toLocaleString()} annual respondents across 18 markets. Covers sports fandom, viewing habits, betting behavior, and sports brand engagement.`,
        version: 2,
        status: SurveyStatus.ACTIVE,
        createdById: gwiAdmin.id,
      }
    })

    await prisma.surveyQuestion.createMany({
      data: [
        {
          surveyId: sportsSurvey.id,
          code: 'SPORTS_FOLLOWED',
          text: 'Which sports do you follow regularly?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(['Football/Soccer', 'American Football', 'Basketball', 'Baseball', 'Ice Hockey', 'Tennis', 'Golf', 'Cricket', 'Rugby', 'Formula 1', 'MMA/UFC', 'Boxing', 'Swimming', 'Athletics/Track & Field', 'Cycling', 'Esports']),
          order: 0,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'sports', attribute: 'sports_followed' }),
        },
        {
          surveyId: sportsSurvey.id,
          code: 'SPORTS_VIEWING',
          text: 'How do you typically watch live sports?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(['Cable/satellite TV', 'Streaming service (ESPN+, DAZN, etc.)', 'Free-to-air TV', 'League/team streaming apps', 'Social media highlights', 'In-person at events', 'Radio/audio']),
          order: 1,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'sports', attribute: 'viewing_method' }),
        },
        {
          surveyId: sportsSurvey.id,
          code: 'SPORTS_BETTING',
          text: 'Do you bet on sports?',
          type: QuestionType.SINGLE_SELECT,
          options: JSON.stringify(['Yes, regularly', 'Yes, occasionally', 'Only during major events', 'I used to but stopped', 'Never']),
          order: 2,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'sports', attribute: 'betting_frequency' }),
        },
        {
          surveyId: sportsSurvey.id,
          code: 'SPORTS_MERCHANDISE',
          text: 'Have you purchased sports merchandise in the past 12 months?',
          type: QuestionType.MULTI_SELECT,
          options: JSON.stringify(['Team jerseys/shirts', 'Hats/caps', 'Footwear', 'Equipment', 'Memorabilia', 'No purchases']),
          order: 3,
          required: true,
          taxonomyLinks: JSON.stringify({ category: 'sports', attribute: 'merchandise_purchases' }),
        },
      ]
    })

    // Create survey distributions (reflecting GWI's quarterly cadence)
    await prisma.surveyDistribution.createMany({
      data: [
        // GWI Core - Quarterly, 240K per quarter across panel providers
        {
          surveyId: coreSurvey.id,
          channel: 'Dynata Panel',
          targetCount: 120000,
          completedCount: 118500,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'active',
        },
        {
          surveyId: coreSurvey.id,
          channel: 'Lucid Marketplace',
          targetCount: 80000,
          completedCount: 76200,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'active',
        },
        {
          surveyId: coreSurvey.id,
          channel: 'Cint Exchange',
          targetCount: 40000,
          completedCount: 38750,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'active',
        },
        // GWI Gaming
        {
          surveyId: gamingSurvey.id,
          channel: 'Panel Network',
          targetCount: 16250,
          completedCount: 15890,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'active',
        },
        // GWI USA
        {
          surveyId: usaSurvey.id,
          channel: 'US Panel Partners',
          targetCount: 20000,
          completedCount: 19450,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'active',
        },
        // GWI Zeitgeist (monthly)
        {
          surveyId: zeitgeistSurvey.id,
          channel: 'Global Panel',
          targetCount: 12000,
          completedCount: 12000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          status: 'completed',
        },
        // GWI Sports
        {
          surveyId: sportsSurvey.id,
          channel: 'Sports Panel',
          targetCount: 20000,
          completedCount: 18200,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'active',
        },
      ]
    })

    // Create survey responses (sample data representing GWI's global coverage)
    const responseData = []

    // Generate responses across GWI's 54 markets with realistic distributions
    for (let i = 0; i < 500; i++) {
      const market = ALL_MARKETS[Math.floor(Math.random() * ALL_MARKETS.length)]
      const ageGroup = GWI_DEMOGRAPHICS.ageGroups[Math.floor(Math.random() * GWI_DEMOGRAPHICS.ageGroups.length)]
      const gender = GWI_DEMOGRAPHICS.gender[Math.floor(Math.random() * GWI_DEMOGRAPHICS.gender.length)]

      responseData.push({
        surveyId: coreSurvey.id,
        respondentId: `GWI-${market}-${String(i + 1).padStart(7, '0')}`,
        answers: JSON.stringify({
          DEMO_AGE: ageGroup,
          DEMO_GENDER: gender,
          DEMO_EDUCATION: GWI_DEMOGRAPHICS.education[Math.floor(Math.random() * GWI_DEMOGRAPHICS.education.length)],
          DEMO_INCOME: GWI_DEMOGRAPHICS.householdIncome[Math.floor(Math.random() * GWI_DEMOGRAPHICS.householdIncome.length)],
          DEMO_RELATIONSHIP: GWI_DEMOGRAPHICS.relationshipStatus[Math.floor(Math.random() * GWI_DEMOGRAPHICS.relationshipStatus.length)],
          DEMO_CHILDREN: GWI_DEMOGRAPHICS.children[Math.floor(Math.random() * GWI_DEMOGRAPHICS.children.length)],
          BRAND_TECH_AWARENESS: GWI_BRAND_CATEGORIES.consumerTech.slice(0, Math.floor(Math.random() * 8) + 3),
          BRAND_STREAMING_USAGE: GWI_BRAND_CATEGORIES.streaming.slice(0, Math.floor(Math.random() * 4) + 1),
          SOCIAL_PLATFORMS_USED: GWI_BRAND_CATEGORIES.socialMedia.slice(0, Math.floor(Math.random() * 5) + 2),
          SOCIAL_DAILY_TIME: (Math.random() * 6 + 0.5).toFixed(1),
          PURCHASE_ONLINE_FREQ: ['Daily', 'Several times a week', 'Once a week', 'Several times a month'][Math.floor(Math.random() * 4)],
          ATTITUDE_SUSTAINABILITY: Math.floor(Math.random() * 5) + 1,
        }),
        metadata: JSON.stringify({
          market: market,
          region: GWI_MARKETS.americas.includes(market) ? 'Americas' :
                  GWI_MARKETS.europe.includes(market) ? 'Europe' :
                  GWI_MARKETS.apac.includes(market) ? 'APAC' : 'MEA',
          panelProvider: ['Dynata', 'Lucid', 'Cint'][Math.floor(Math.random() * 3)],
          deviceType: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          completionTimeSeconds: Math.floor(Math.random() * 900) + 600, // 10-25 min typical GWI survey
          qualityScore: (Math.random() * 0.3 + 0.7).toFixed(2), // 0.70-1.00 quality score
          wave: 'Q1_2024',
        }),
        completedAt: new Date(Date.now() - Math.random() * 7776000000),
      })
    }
    await prisma.surveyResponse.createMany({ data: responseData })
  })

  // ==================== TAXONOMY ====================
  await safeSeedSection('Taxonomy Categories & Attributes', async () => {
    // Root categories
    const demographics = await prisma.taxonomyCategory.create({
      data: {
        name: 'Demographics',
        code: 'demographics',
        description: 'Consumer demographic attributes including age, gender, income, education, and location.',
        isActive: true,
        version: 1,
      }
    })

    const behavior = await prisma.taxonomyCategory.create({
      data: {
        name: 'Behavior',
        code: 'behavior',
        description: 'Consumer behavior patterns including purchase habits, media consumption, and lifestyle choices.',
        isActive: true,
        version: 1,
      }
    })

    const brandMetrics = await prisma.taxonomyCategory.create({
      data: {
        name: 'Brand Metrics',
        code: 'brand_metrics',
        description: 'Brand health indicators including awareness, consideration, preference, and loyalty.',
        isActive: true,
        version: 1,
      }
    })

    const attitudes = await prisma.taxonomyCategory.create({
      data: {
        name: 'Attitudes & Values',
        code: 'attitudes',
        description: 'Consumer attitudes, values, and psychographic segments.',
        isActive: true,
        version: 1,
      }
    })

    const media = await prisma.taxonomyCategory.create({
      data: {
        name: 'Media',
        code: 'media',
        description: 'Media consumption patterns across platforms and channels.',
        isActive: true,
        version: 1,
      }
    })

    // Sub-categories
    const ageCategory = await prisma.taxonomyCategory.create({
      data: {
        name: 'Age Groups',
        code: 'age_groups',
        description: 'Age-based demographic segments.',
        parentId: demographics.id,
        isActive: true,
        version: 1,
      }
    })

    const incomeCategory = await prisma.taxonomyCategory.create({
      data: {
        name: 'Income Brackets',
        code: 'income_brackets',
        description: 'Household income segments.',
        parentId: demographics.id,
        isActive: true,
        version: 1,
      }
    })

    const purchaseBehavior = await prisma.taxonomyCategory.create({
      data: {
        name: 'Purchase Behavior',
        code: 'purchase_behavior',
        description: 'Shopping and purchasing patterns.',
        parentId: behavior.id,
        isActive: true,
        version: 1,
      }
    })

    const digitalMedia = await prisma.taxonomyCategory.create({
      data: {
        name: 'Digital Media',
        code: 'digital_media',
        description: 'Digital and social media consumption.',
        parentId: media.id,
        isActive: true,
        version: 1,
      }
    })

    // Attributes
    await prisma.taxonomyAttribute.createMany({
      data: [
        // Demographics attributes
        {
          categoryId: ageCategory.id,
          name: 'Age Group',
          code: 'age_group',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Gen Z (16-24)', 'Millennials (25-40)', 'Gen X (41-56)', 'Boomers (57-75)', 'Silent (76+)']),
          isRequired: true,
        },
        {
          categoryId: demographics.id,
          name: 'Gender',
          code: 'gender',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
          isRequired: true,
        },
        {
          categoryId: incomeCategory.id,
          name: 'Income Bracket',
          code: 'income_bracket',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Low (<$25k)', 'Lower-middle ($25-50k)', 'Middle ($50-75k)', 'Upper-middle ($75-150k)', 'High ($150k+)']),
          isRequired: false,
        },
        {
          categoryId: demographics.id,
          name: 'Country',
          code: 'country',
          dataType: 'string',
          validationRules: JSON.stringify({ pattern: '^[A-Z]{2}$', description: 'ISO 3166-1 alpha-2 code' }),
          isRequired: true,
        },
        {
          categoryId: demographics.id,
          name: 'Urban/Rural',
          code: 'urbanicity',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Urban', 'Suburban', 'Rural']),
          isRequired: false,
        },
        // Brand metrics attributes
        {
          categoryId: brandMetrics.id,
          name: 'Brand Awareness',
          code: 'awareness',
          dataType: 'boolean',
          isRequired: false,
        },
        {
          categoryId: brandMetrics.id,
          name: 'Brand Consideration',
          code: 'consideration',
          dataType: 'boolean',
          isRequired: false,
        },
        {
          categoryId: brandMetrics.id,
          name: 'Brand Preference',
          code: 'preference',
          dataType: 'number',
          validationRules: JSON.stringify({ min: 1, max: 10 }),
          isRequired: false,
        },
        {
          categoryId: brandMetrics.id,
          name: 'Net Promoter Score',
          code: 'nps_score',
          dataType: 'number',
          validationRules: JSON.stringify({ min: 0, max: 10 }),
          isRequired: false,
        },
        // Behavior attributes
        {
          categoryId: purchaseBehavior.id,
          name: 'Purchase Frequency',
          code: 'purchase_frequency',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Never']),
          isRequired: false,
        },
        {
          categoryId: purchaseBehavior.id,
          name: 'Average Order Value',
          code: 'aov',
          dataType: 'number',
          validationRules: JSON.stringify({ min: 0, currency: 'USD' }),
          isRequired: false,
        },
        {
          categoryId: purchaseBehavior.id,
          name: 'Preferred Channel',
          code: 'preferred_channel',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Online', 'In-store', 'Mobile app', 'Social commerce', 'Marketplace']),
          isRequired: false,
        },
        // Media attributes
        {
          categoryId: digitalMedia.id,
          name: 'Social Media Hours',
          code: 'social_media_hours',
          dataType: 'number',
          validationRules: JSON.stringify({ min: 0, max: 24, decimals: 1 }),
          isRequired: false,
        },
        {
          categoryId: digitalMedia.id,
          name: 'Streaming Hours',
          code: 'streaming_hours',
          dataType: 'number',
          validationRules: JSON.stringify({ min: 0, max: 168, decimals: 1 }),
          isRequired: false,
        },
        {
          categoryId: digitalMedia.id,
          name: 'Primary Social Platform',
          code: 'primary_social',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Instagram', 'TikTok', 'Facebook', 'Twitter/X', 'LinkedIn', 'YouTube', 'Snapchat', 'None']),
          isRequired: false,
        },
        // Attitudes attributes
        {
          categoryId: attitudes.id,
          name: 'Sustainability Priority',
          code: 'sustainability_priority',
          dataType: 'number',
          validationRules: JSON.stringify({ min: 1, max: 5 }),
          isRequired: false,
        },
        {
          categoryId: attitudes.id,
          name: 'Tech Adoption',
          code: 'tech_adoption',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Innovator', 'Early adopter', 'Early majority', 'Late majority', 'Laggard']),
          isRequired: false,
        },
        {
          categoryId: attitudes.id,
          name: 'Brand Loyalty',
          code: 'brand_loyalty',
          dataType: 'enum',
          allowedValues: JSON.stringify(['Very loyal', 'Somewhat loyal', 'Neutral', 'Switcher', 'Price-driven']),
          isRequired: false,
        },
      ]
    })

    // Mapping rules
    await prisma.taxonomyMappingRule.createMany({
      data: [
        {
          name: 'Age to Age Group',
          sourceField: 'respondent.age',
          targetCategoryCode: 'age_groups',
          targetAttributeCode: 'age_group',
          transformationRule: JSON.stringify({
            type: 'range_map',
            ranges: [
              { min: 16, max: 24, value: 'Gen Z (16-24)' },
              { min: 25, max: 40, value: 'Millennials (25-40)' },
              { min: 41, max: 56, value: 'Gen X (41-56)' },
              { min: 57, max: 75, value: 'Boomers (57-75)' },
              { min: 76, max: 999, value: 'Silent (76+)' },
            ]
          }),
          priority: 1,
          isActive: true,
        },
        {
          name: 'Income USD to Bracket',
          sourceField: 'respondent.income_usd',
          targetCategoryCode: 'income_brackets',
          targetAttributeCode: 'income_bracket',
          transformationRule: JSON.stringify({
            type: 'range_map',
            ranges: [
              { min: 0, max: 24999, value: 'Low (<$25k)' },
              { min: 25000, max: 49999, value: 'Lower-middle ($25-50k)' },
              { min: 50000, max: 74999, value: 'Middle ($50-75k)' },
              { min: 75000, max: 149999, value: 'Upper-middle ($75-150k)' },
              { min: 150000, max: 999999999, value: 'High ($150k+)' },
            ]
          }),
          priority: 1,
          isActive: true,
        },
        {
          name: 'Country Code Normalization',
          sourceField: 'respondent.country',
          targetCategoryCode: 'demographics',
          targetAttributeCode: 'country',
          transformationRule: JSON.stringify({
            type: 'lookup',
            lookup_table: 'country_codes',
            normalize: 'uppercase',
          }),
          priority: 2,
          isActive: true,
        },
        {
          name: 'NPS Score Classification',
          sourceField: 'response.nps',
          targetCategoryCode: 'brand_metrics',
          targetAttributeCode: 'nps_score',
          transformationRule: JSON.stringify({
            type: 'pass_through',
            validation: { min: 0, max: 10 },
          }),
          priority: 1,
          isActive: true,
        },
        {
          name: 'Social Media Usage Category',
          sourceField: 'response.social_hours',
          targetCategoryCode: 'digital_media',
          targetAttributeCode: 'social_media_hours',
          transformationRule: JSON.stringify({
            type: 'number',
            round: 1,
            clamp: { min: 0, max: 24 },
          }),
          priority: 1,
          isActive: true,
        },
      ]
    })
  })

  // ==================== DATA PIPELINES ====================
  await safeSeedSection('Data Pipelines & Runs', async () => {
    // ETL Pipeline for survey data
    const surveyETL = await prisma.dataPipeline.create({
      data: {
        name: 'Survey Response ETL Pipeline',
        description: 'Extracts survey responses, transforms data according to taxonomy rules, and loads into analytics warehouse.',
        type: PipelineType.ETL,
        configuration: JSON.stringify({
          source: {
            type: 'postgres',
            table: 'SurveyResponse',
            incremental: true,
            incrementalField: 'createdAt',
          },
          transform: {
            applyTaxonomyMappings: true,
            validateSchema: true,
            enrichWithDemographics: true,
          },
          destination: {
            type: 'bigquery',
            dataset: 'gwi_analytics',
            table: 'survey_responses_processed',
            writeMode: 'append',
          },
        }),
        schedule: '0 */6 * * *', // Every 6 hours
        isActive: true,
        createdById: dataEngineer.id,
      }
    })

    // Create pipeline runs
    const surveyETLRuns = []
    for (let i = 0; i < 20; i++) {
      const startDate = new Date(Date.now() - i * 6 * 60 * 60 * 1000) // Every 6 hours going back
      const status = i === 0 ? PipelineRunStatus.RUNNING :
                    Math.random() > 0.1 ? PipelineRunStatus.COMPLETED : PipelineRunStatus.FAILED
      surveyETLRuns.push({
        pipelineId: surveyETL.id,
        status,
        startedAt: startDate,
        completedAt: status !== PipelineRunStatus.RUNNING ? new Date(startDate.getTime() + Math.random() * 300000) : null,
        recordsProcessed: status === PipelineRunStatus.COMPLETED ? Math.floor(Math.random() * 5000) + 1000 : null,
        recordsFailed: status === PipelineRunStatus.FAILED ? Math.floor(Math.random() * 100) : 0,
        errorLog: status === PipelineRunStatus.FAILED ? JSON.stringify({
          error: 'Schema validation failed',
          details: 'Unexpected null value in required field: age_group',
          failedRecords: ['RESP-001234', 'RESP-001567'],
        }) : JsonNull,
        metrics: status === PipelineRunStatus.COMPLETED ? JSON.stringify({
          bytesProcessed: Math.floor(Math.random() * 10000000),
          transformationTime: Math.floor(Math.random() * 60000),
          loadTime: Math.floor(Math.random() * 30000),
        }) : JsonNull,
      })
    }
    await prisma.pipelineRun.createMany({ data: surveyETLRuns })

    // Aggregation Pipeline
    const aggregationPipeline = await prisma.dataPipeline.create({
      data: {
        name: 'Daily Metrics Aggregation',
        description: 'Aggregates survey metrics by demographics, brand, and time period for reporting.',
        type: PipelineType.AGGREGATION,
        configuration: JSON.stringify({
          source: {
            type: 'bigquery',
            dataset: 'gwi_analytics',
            table: 'survey_responses_processed',
          },
          aggregations: [
            { metric: 'response_count', groupBy: ['country', 'age_group', 'date'] },
            { metric: 'nps_average', groupBy: ['brand', 'country', 'date'] },
            { metric: 'awareness_rate', groupBy: ['brand', 'demographic_segment'] },
          ],
          destination: {
            type: 'bigquery',
            dataset: 'gwi_analytics',
            table: 'daily_aggregates',
          },
        }),
        schedule: '0 2 * * *', // Daily at 2 AM
        isActive: true,
        createdById: dataEngineer.id,
      }
    })

    // Aggregation pipeline runs
    const aggRuns = []
    for (let i = 0; i < 14; i++) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - i)
      startDate.setHours(2, 0, 0, 0)
      aggRuns.push({
        pipelineId: aggregationPipeline.id,
        status: PipelineRunStatus.COMPLETED,
        startedAt: startDate,
        completedAt: new Date(startDate.getTime() + Math.random() * 1800000),
        recordsProcessed: Math.floor(Math.random() * 500000) + 100000,
        recordsFailed: 0,
        metrics: JSON.stringify({
          aggregationsComputed: 3,
          rowsAggregated: Math.floor(Math.random() * 500000) + 100000,
          outputRows: Math.floor(Math.random() * 10000) + 5000,
        }),
      })
    }
    await prisma.pipelineRun.createMany({ data: aggRuns })

    // Export Pipeline
    await prisma.dataPipeline.create({
      data: {
        name: 'Client Data Export',
        description: 'Generates and exports client-specific data files in requested formats.',
        type: PipelineType.EXPORT,
        configuration: JSON.stringify({
          source: {
            type: 'bigquery',
            query: 'SELECT * FROM gwi_analytics.daily_aggregates WHERE client_id = @client_id',
          },
          formats: ['csv', 'parquet', 'json'],
          destination: {
            type: 'gcs',
            bucket: 'gwi-client-exports',
            path: 'exports/{client_id}/{date}/',
          },
          encryption: true,
          compression: 'gzip',
        }),
        schedule: null, // On-demand
        isActive: true,
        createdById: dataEngineer.id,
      }
    })

    // Sync Pipeline
    await prisma.dataPipeline.create({
      data: {
        name: 'Panel Provider Sync',
        description: 'Synchronizes respondent data with panel providers for sample management.',
        type: PipelineType.SYNC,
        configuration: JSON.stringify({
          providers: ['Dynata', 'Lucid', 'Cint'],
          direction: 'bidirectional',
          syncFields: ['respondentId', 'completionStatus', 'qualityScore'],
          conflictResolution: 'provider_wins',
        }),
        schedule: '*/30 * * * *', // Every 30 minutes
        isActive: true,
        createdById: dataEngineer.id,
      }
    })

    // Transformation Pipeline
    const transformPipeline = await prisma.dataPipeline.create({
      data: {
        name: 'Data Quality Transformation',
        description: 'Applies data quality rules, deduplication, and standardization.',
        type: PipelineType.TRANSFORMATION,
        configuration: JSON.stringify({
          rules: [
            { type: 'deduplication', field: 'respondentId', window: '30d' },
            { type: 'outlier_removal', field: 'completion_time', threshold: 3 },
            { type: 'standardization', field: 'country', format: 'ISO-3166-1' },
            { type: 'null_handling', strategy: 'impute_median', fields: ['income'] },
          ],
          qualityThreshold: 0.95,
        }),
        schedule: '0 */4 * * *', // Every 4 hours
        isActive: true,
        createdById: dataEngineer.id,
      }
    })

    // Validation rules
    await prisma.pipelineValidationRule.createMany({
      data: [
        {
          pipelineId: surveyETL.id,
          name: 'Required Fields Check',
          rule: JSON.stringify({
            type: 'not_null',
            fields: ['respondentId', 'surveyId', 'answers'],
          }),
          severity: 'error',
          isActive: true,
        },
        {
          pipelineId: surveyETL.id,
          name: 'Age Range Validation',
          rule: JSON.stringify({
            type: 'range',
            field: 'age',
            min: 16,
            max: 99,
          }),
          severity: 'warning',
          isActive: true,
        },
        {
          pipelineId: surveyETL.id,
          name: 'Country Code Format',
          rule: JSON.stringify({
            type: 'regex',
            field: 'country',
            pattern: '^[A-Z]{2}$',
          }),
          severity: 'error',
          isActive: true,
        },
        {
          pipelineId: aggregationPipeline.id,
          name: 'Minimum Sample Size',
          rule: JSON.stringify({
            type: 'threshold',
            metric: 'count',
            minValue: 30,
            groupBy: ['country', 'demographic_segment'],
          }),
          severity: 'warning',
          isActive: true,
        },
        {
          pipelineId: transformPipeline.id,
          name: 'Duplication Rate Check',
          rule: JSON.stringify({
            type: 'threshold',
            metric: 'duplication_rate',
            maxValue: 0.05,
          }),
          severity: 'error',
          isActive: true,
        },
      ]
    })
  })

  // ==================== LLM CONFIGURATION ====================
  await safeSeedSection('LLM Configurations & Prompts', async () => {
    // LLM Configurations
    const gpt4Config = await prisma.lLMConfiguration.create({
      data: {
        name: 'GPT-4 Turbo Production',
        provider: 'openai',
        model: 'gpt-4-turbo',
        apiKeyRef: 'OPENAI_API_KEY',
        defaultParams: JSON.stringify({
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 0.95,
        }),
        rateLimits: JSON.stringify({
          requestsPerMinute: 500,
          tokensPerMinute: 150000,
        }),
        isActive: true,
      }
    })

    const claude3Config = await prisma.lLMConfiguration.create({
      data: {
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        apiKeyRef: 'ANTHROPIC_API_KEY',
        defaultParams: JSON.stringify({
          temperature: 0.5,
          max_tokens: 4096,
        }),
        rateLimits: JSON.stringify({
          requestsPerMinute: 60,
          tokensPerMinute: 100000,
        }),
        isActive: true,
      }
    })

    const gpt35Config = await prisma.lLMConfiguration.create({
      data: {
        name: 'GPT-3.5 Turbo Fast',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKeyRef: 'OPENAI_API_KEY',
        defaultParams: JSON.stringify({
          temperature: 0.3,
          max_tokens: 2048,
        }),
        rateLimits: JSON.stringify({
          requestsPerMinute: 3500,
          tokensPerMinute: 90000,
        }),
        isActive: true,
      }
    })

    const embeddingConfig = await prisma.lLMConfiguration.create({
      data: {
        name: 'Text Embedding Ada',
        provider: 'openai',
        model: 'text-embedding-ada-002',
        apiKeyRef: 'OPENAI_API_KEY',
        defaultParams: JSON.stringify({}),
        rateLimits: JSON.stringify({
          requestsPerMinute: 3000,
          tokensPerMinute: 1000000,
        }),
        isActive: true,
      }
    })

    // Prompt Templates
    await prisma.promptTemplate.createMany({
      data: [
        {
          name: 'Survey Analysis Summary',
          description: 'Generates executive summary of survey results',
          category: 'analysis',
          template: `Analyze the following survey results and provide an executive summary:

Survey: {{survey_name}}
Sample Size: {{sample_size}}
Date Range: {{date_range}}

Key Metrics:
{{metrics}}

Response Data Summary:
{{data_summary}}

Please provide:
1. Key findings (3-5 bullet points)
2. Notable trends or patterns
3. Demographic insights
4. Recommendations for stakeholders

Format the response in a professional, business-appropriate tone.`,
          variables: JSON.stringify(['survey_name', 'sample_size', 'date_range', 'metrics', 'data_summary']),
          version: 2,
          isActive: true,
          createdById: mlEngineer.id,
        },
        {
          name: 'Open-End Response Coding',
          description: 'Categorizes open-ended survey responses',
          category: 'classification',
          template: `You are an expert at coding survey responses. Categorize the following open-ended response into the provided categories.

Response: "{{response_text}}"

Available Categories:
{{categories}}

Instructions:
- Select the most appropriate primary category
- Select up to 2 secondary categories if applicable
- Identify the sentiment (positive, negative, neutral, mixed)
- Extract key themes mentioned

Return as JSON:
{
  "primary_category": "",
  "secondary_categories": [],
  "sentiment": "",
  "themes": [],
  "confidence": 0.0
}`,
          variables: JSON.stringify(['response_text', 'categories']),
          version: 3,
          isActive: true,
          createdById: mlEngineer.id,
        },
        {
          name: 'Brand Health Report',
          description: 'Generates comprehensive brand health analysis',
          category: 'reporting',
          template: `Generate a brand health report based on the following data:

Brand: {{brand_name}}
Time Period: {{time_period}}
Markets: {{markets}}

Metrics:
- Awareness: {{awareness}}%
- Consideration: {{consideration}}%
- Preference: {{preference}}%
- NPS: {{nps}}

Competitor Comparison:
{{competitor_data}}

Historical Trends:
{{trend_data}}

Please generate a comprehensive report covering:
1. Executive Summary
2. Brand Performance Overview
3. Competitive Position Analysis
4. Market-by-Market Breakdown
5. Key Drivers and Detractors
6. Strategic Recommendations`,
          variables: JSON.stringify(['brand_name', 'time_period', 'markets', 'awareness', 'consideration', 'preference', 'nps', 'competitor_data', 'trend_data']),
          version: 1,
          isActive: true,
          createdById: mlEngineer.id,
        },
        {
          name: 'Data Quality Assessment',
          description: 'Analyzes data quality issues and suggests fixes',
          category: 'data_quality',
          template: `Analyze the following data quality report and provide recommendations:

Dataset: {{dataset_name}}
Records Analyzed: {{record_count}}

Quality Issues Found:
{{quality_issues}}

Field Statistics:
{{field_stats}}

Please provide:
1. Severity assessment for each issue
2. Root cause analysis
3. Recommended remediation steps
4. Impact on downstream analytics
5. Prevention strategies`,
          variables: JSON.stringify(['dataset_name', 'record_count', 'quality_issues', 'field_stats']),
          version: 1,
          isActive: true,
          createdById: dataEngineer.id,
        },
        {
          name: 'Taxonomy Suggestion',
          description: 'Suggests taxonomy mappings for new data fields',
          category: 'taxonomy',
          template: `Given the following new data field, suggest appropriate taxonomy mappings:

Field Name: {{field_name}}
Sample Values: {{sample_values}}
Source System: {{source_system}}

Existing Taxonomy Categories:
{{existing_categories}}

Please suggest:
1. Most appropriate existing category to map to
2. If no good match, suggest a new category structure
3. Transformation rules needed
4. Data type and validation rules
5. Confidence level in the suggestion`,
          variables: JSON.stringify(['field_name', 'sample_values', 'source_system', 'existing_categories']),
          version: 1,
          isActive: true,
          createdById: taxonomyManager.id,
        },
        {
          name: 'Insight Generator',
          description: 'Generates actionable insights from data patterns',
          category: 'insights',
          template: `Based on the following data patterns, generate actionable business insights:

Data Context: {{context}}
Key Patterns Identified:
{{patterns}}

Business Objectives:
{{objectives}}

Generate insights that are:
1. Actionable - clear next steps
2. Specific - backed by data
3. Relevant - aligned with objectives
4. Timely - considering market context

Format each insight as:
- Headline (1 sentence)
- Supporting data
- Business implication
- Recommended action`,
          variables: JSON.stringify(['context', 'patterns', 'objectives']),
          version: 2,
          isActive: true,
          createdById: mlEngineer.id,
        },
      ]
    })

    // Usage records (simulating historical usage)
    const usageRecords = []
    const configs = [gpt4Config, claude3Config, gpt35Config, embeddingConfig]
    const costs = { [gpt4Config.id]: 0.01, [claude3Config.id]: 0.015, [gpt35Config.id]: 0.001, [embeddingConfig.id]: 0.0001 }

    for (let day = 0; day < 30; day++) {
      for (const config of configs) {
        const numCalls = Math.floor(Math.random() * (config.id === embeddingConfig.id ? 500 : 100)) + 10
        for (let i = 0; i < numCalls; i++) {
          const promptTokens = Math.floor(Math.random() * 2000) + 100
          const completionTokens = config.id === embeddingConfig.id ? 0 : Math.floor(Math.random() * 1000) + 50
          usageRecords.push({
            configurationId: config.id,
            promptTokens,
            completionTokens,
            totalCost: new Decimal(((promptTokens + completionTokens) * costs[config.id] / 1000).toFixed(6)),
            latencyMs: Math.floor(Math.random() * 5000) + 200,
            metadata: JSON.stringify({
              useCase: ['analysis', 'classification', 'reporting', 'embeddings'][Math.floor(Math.random() * 4)],
              success: Math.random() > 0.02,
            }),
            createdAt: new Date(Date.now() - day * 24 * 60 * 60 * 1000 - Math.random() * 86400000),
          })
        }
      }
    }
    await prisma.lLMUsageRecord.createMany({ data: usageRecords })
  })

  // ==================== AGENT TEMPLATES & TOOLS ====================
  await safeSeedSection('Agent Templates & Tools', async () => {
    // System Tool Configurations
    await prisma.systemToolConfiguration.createMany({
      data: [
        {
          name: 'survey_query',
          description: 'Query and filter survey response data',
          type: 'data_access',
          configuration: JSON.stringify({
            allowedOperations: ['select', 'filter', 'aggregate'],
            maxRows: 10000,
            allowedTables: ['SurveyResponse', 'Survey', 'SurveyQuestion'],
            rateLimit: { requestsPerMinute: 100 },
          }),
          permissions: JSON.stringify({
            requiredRoles: ['DATA_ENGINEER', 'ML_ENGINEER', 'TAXONOMY_MANAGER', 'GWI_ADMIN'],
          }),
          isActive: true,
        },
        {
          name: 'taxonomy_lookup',
          description: 'Look up and validate taxonomy categories and attributes',
          type: 'data_access',
          configuration: JSON.stringify({
            allowedOperations: ['read', 'validate'],
            cacheEnabled: true,
            cacheTTL: 3600,
          }),
          permissions: JSON.stringify({
            requiredRoles: ['TAXONOMY_MANAGER', 'DATA_ENGINEER', 'ML_ENGINEER', 'GWI_ADMIN'],
          }),
          isActive: true,
        },
        {
          name: 'llm_invoke',
          description: 'Invoke configured LLM models',
          type: 'ai_service',
          configuration: JSON.stringify({
            allowedModels: ['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus-20240229'],
            maxTokens: 4096,
            requirePromptTemplate: true,
          }),
          permissions: JSON.stringify({
            requiredRoles: ['ML_ENGINEER', 'GWI_ADMIN'],
          }),
          isActive: true,
        },
        {
          name: 'pipeline_trigger',
          description: 'Trigger data pipeline runs',
          type: 'orchestration',
          configuration: JSON.stringify({
            allowedPipelineTypes: ['ETL', 'TRANSFORMATION', 'EXPORT'],
            requireApproval: false,
            maxConcurrent: 5,
          }),
          permissions: JSON.stringify({
            requiredRoles: ['DATA_ENGINEER', 'GWI_ADMIN'],
          }),
          isActive: true,
        },
        {
          name: 'report_generator',
          description: 'Generate and export reports',
          type: 'reporting',
          configuration: JSON.stringify({
            outputFormats: ['pdf', 'xlsx', 'pptx', 'csv'],
            templates: ['brand_health', 'survey_summary', 'trend_analysis'],
            maxDataPoints: 100000,
          }),
          permissions: JSON.stringify({
            requiredRoles: ['ML_ENGINEER', 'TAXONOMY_MANAGER', 'GWI_ADMIN'],
          }),
          isActive: true,
        },
        {
          name: 'notification_sender',
          description: 'Send notifications via email, Slack, or webhook',
          type: 'communication',
          configuration: JSON.stringify({
            channels: ['email', 'slack', 'webhook'],
            templates: ['alert', 'report_ready', 'pipeline_complete'],
            rateLimit: { messagesPerHour: 100 },
          }),
          permissions: JSON.stringify({
            requiredRoles: ['DATA_ENGINEER', 'ML_ENGINEER', 'GWI_ADMIN'],
          }),
          isActive: true,
        },
        {
          name: 'data_validator',
          description: 'Validate data against schemas and rules',
          type: 'validation',
          configuration: JSON.stringify({
            validationTypes: ['schema', 'business_rules', 'quality_checks'],
            outputFormat: 'detailed_report',
          }),
          permissions: JSON.stringify({
            requiredRoles: ['DATA_ENGINEER', 'TAXONOMY_MANAGER', 'GWI_ADMIN'],
          }),
          isActive: true,
        },
      ]
    })

    // System Agent Templates
    await prisma.systemAgentTemplate.createMany({
      data: [
        {
          name: 'Survey Analysis Agent',
          description: 'Analyzes survey responses, identifies patterns, and generates insights.',
          category: 'analysis',
          configuration: JSON.stringify({
            model: 'gpt-4-turbo',
            temperature: 0.3,
            maxIterations: 10,
            capabilities: ['data_analysis', 'pattern_recognition', 'insight_generation'],
          }),
          defaultTools: JSON.stringify(['survey_query', 'llm_invoke', 'report_generator']),
          defaultPrompts: JSON.stringify({
            system: 'You are an expert survey analyst. Your goal is to analyze survey data and provide actionable insights.',
            analysis_template: 'Survey Analysis Summary',
          }),
          isPublished: true,
          version: 2,
          createdById: mlEngineer.id,
        },
        {
          name: 'Open-End Coding Agent',
          description: 'Automatically codes and categorizes open-ended survey responses.',
          category: 'classification',
          configuration: JSON.stringify({
            model: 'gpt-3.5-turbo',
            temperature: 0.1,
            batchSize: 50,
            capabilities: ['text_classification', 'sentiment_analysis', 'theme_extraction'],
          }),
          defaultTools: JSON.stringify(['survey_query', 'llm_invoke', 'taxonomy_lookup']),
          defaultPrompts: JSON.stringify({
            system: 'You are an expert at coding survey responses. Be consistent and accurate in your categorizations.',
            coding_template: 'Open-End Response Coding',
          }),
          isPublished: true,
          version: 3,
          createdById: mlEngineer.id,
        },
        {
          name: 'Data Quality Agent',
          description: 'Monitors data quality, identifies issues, and suggests remediation.',
          category: 'data_quality',
          configuration: JSON.stringify({
            model: 'gpt-4-turbo',
            temperature: 0.2,
            checkInterval: '1h',
            capabilities: ['anomaly_detection', 'quality_scoring', 'remediation_suggestion'],
          }),
          defaultTools: JSON.stringify(['survey_query', 'data_validator', 'notification_sender', 'llm_invoke']),
          defaultPrompts: JSON.stringify({
            system: 'You are a data quality expert. Your goal is to ensure data integrity and identify issues before they impact downstream systems.',
            assessment_template: 'Data Quality Assessment',
          }),
          isPublished: true,
          version: 1,
          createdById: dataEngineer.id,
        },
        {
          name: 'Report Generation Agent',
          description: 'Generates customized reports based on user requirements.',
          category: 'reporting',
          configuration: JSON.stringify({
            model: 'gpt-4-turbo',
            temperature: 0.5,
            capabilities: ['report_writing', 'data_visualization', 'executive_summary'],
          }),
          defaultTools: JSON.stringify(['survey_query', 'llm_invoke', 'report_generator']),
          defaultPrompts: JSON.stringify({
            system: 'You are an expert business analyst specializing in market research reports.',
            report_template: 'Brand Health Report',
          }),
          isPublished: true,
          version: 2,
          createdById: mlEngineer.id,
        },
        {
          name: 'Taxonomy Management Agent',
          description: 'Assists with taxonomy updates, mappings, and validation.',
          category: 'taxonomy',
          configuration: JSON.stringify({
            model: 'gpt-4-turbo',
            temperature: 0.2,
            capabilities: ['taxonomy_analysis', 'mapping_suggestion', 'validation'],
          }),
          defaultTools: JSON.stringify(['taxonomy_lookup', 'llm_invoke', 'data_validator']),
          defaultPrompts: JSON.stringify({
            system: 'You are an expert in data taxonomy and classification systems.',
            suggestion_template: 'Taxonomy Suggestion',
          }),
          isPublished: true,
          version: 1,
          createdById: taxonomyManager.id,
        },
        {
          name: 'Pipeline Orchestration Agent',
          description: 'Manages and optimizes data pipeline execution.',
          category: 'orchestration',
          configuration: JSON.stringify({
            model: 'gpt-3.5-turbo',
            temperature: 0.1,
            capabilities: ['scheduling', 'dependency_resolution', 'error_handling'],
          }),
          defaultTools: JSON.stringify(['pipeline_trigger', 'notification_sender', 'data_validator']),
          defaultPrompts: JSON.stringify({
            system: 'You are a data pipeline orchestration expert. Optimize execution order and handle failures gracefully.',
          }),
          isPublished: false,
          version: 1,
          createdById: dataEngineer.id,
        },
      ]
    })
  })

  // ==================== DATA SOURCES ====================
  await safeSeedSection('Data Source Connections', async () => {
    await prisma.gWIDataSourceConnection.createMany({
      data: [
        {
          name: 'Primary Survey Database',
          type: 'postgresql',
          connectionString: 'postgresql://readonly:***@survey-db.gwi.internal:5432/surveys',
          configuration: JSON.stringify({
            ssl: true,
            poolSize: 10,
            timeout: 30000,
          }),
          credentials: JSON.stringify({ encrypted: true, keyRef: 'SURVEY_DB_KEY' }),
          isActive: true,
          lastSyncAt: new Date(Date.now() - 1800000),
          syncStatus: 'healthy',
          createdById: dataEngineer.id,
        },
        {
          name: 'BigQuery Analytics Warehouse',
          type: 'bigquery',
          configuration: JSON.stringify({
            projectId: 'gwi-analytics-prod',
            dataset: 'gwi_analytics',
            location: 'US',
          }),
          credentials: JSON.stringify({ encrypted: true, keyRef: 'GCP_SERVICE_ACCOUNT' }),
          isActive: true,
          lastSyncAt: new Date(Date.now() - 3600000),
          syncStatus: 'healthy',
          createdById: dataEngineer.id,
        },
        {
          name: 'Dynata Panel API',
          type: 'api',
          configuration: JSON.stringify({
            baseUrl: 'https://api.dynata.com/v2',
            authType: 'oauth2',
            rateLimit: 1000,
          }),
          credentials: JSON.stringify({ encrypted: true, keyRef: 'DYNATA_API_KEY' }),
          isActive: true,
          lastSyncAt: new Date(Date.now() - 900000),
          syncStatus: 'healthy',
          createdById: dataEngineer.id,
        },
        {
          name: 'Lucid Sample Platform',
          type: 'api',
          configuration: JSON.stringify({
            baseUrl: 'https://api.lucid.co/v1',
            authType: 'api_key',
            rateLimit: 500,
          }),
          credentials: JSON.stringify({ encrypted: true, keyRef: 'LUCID_API_KEY' }),
          isActive: true,
          lastSyncAt: new Date(Date.now() - 1200000),
          syncStatus: 'healthy',
          createdById: dataEngineer.id,
        },
        {
          name: 'AWS S3 Data Lake',
          type: 's3',
          configuration: JSON.stringify({
            bucket: 'gwi-data-lake-prod',
            region: 'us-east-1',
            prefix: 'raw/',
          }),
          credentials: JSON.stringify({ encrypted: true, keyRef: 'AWS_CREDENTIALS' }),
          isActive: true,
          lastSyncAt: new Date(Date.now() - 7200000),
          syncStatus: 'healthy',
          createdById: dataEngineer.id,
        },
        {
          name: 'Salesforce CRM',
          type: 'salesforce',
          configuration: JSON.stringify({
            instanceUrl: 'https://gwi.my.salesforce.com',
            apiVersion: 'v58.0',
            objects: ['Account', 'Contact', 'Opportunity'],
          }),
          credentials: JSON.stringify({ encrypted: true, keyRef: 'SALESFORCE_CREDENTIALS' }),
          isActive: true,
          lastSyncAt: new Date(Date.now() - 14400000),
          syncStatus: 'healthy',
          createdById: dataEngineer.id,
        },
        {
          name: 'Legacy MySQL Database',
          type: 'mysql',
          connectionString: 'mysql://readonly:***@legacy-db.gwi.internal:3306/legacy_surveys',
          configuration: JSON.stringify({
            ssl: true,
            timeout: 60000,
          }),
          credentials: JSON.stringify({ encrypted: true, keyRef: 'LEGACY_DB_KEY' }),
          isActive: false,
          lastSyncAt: new Date(Date.now() - 86400000 * 7),
          syncStatus: 'disabled',
          errorLog: JSON.stringify({ message: 'Deprecated - migrated to PostgreSQL' }),
          createdById: dataEngineer.id,
        },
        {
          name: 'Snowflake Data Share',
          type: 'snowflake',
          configuration: JSON.stringify({
            account: 'gwi-partner',
            warehouse: 'COMPUTE_WH',
            database: 'SHARED_DATA',
            schema: 'PUBLIC',
          }),
          credentials: JSON.stringify({ encrypted: true, keyRef: 'SNOWFLAKE_CREDENTIALS' }),
          isActive: true,
          lastSyncAt: new Date(Date.now() - 5400000),
          syncStatus: 'syncing',
          createdById: dataEngineer.id,
        },
      ]
    })
  })

  // ==================== MONITORING & ALERTS ====================
  await safeSeedSection('Monitoring Alerts & Error Logs', async () => {
    await prisma.gWIMonitoringAlert.createMany({
      data: [
        {
          name: 'Pipeline Failure Alert',
          type: 'pipeline',
          condition: JSON.stringify({
            event: 'pipeline_run_failed',
            consecutive_failures: 2,
          }),
          threshold: JSON.stringify({ count: 2, window: '1h' }),
          recipients: ['data-team@gwi.com', 'oncall-slack-channel'],
          isActive: true,
          lastTriggeredAt: new Date(Date.now() - 86400000 * 3),
          triggerCount: 5,
          createdById: dataEngineer.id,
        },
        {
          name: 'LLM Cost Threshold',
          type: 'llm',
          condition: JSON.stringify({
            metric: 'daily_cost',
            operator: '>',
            value: 1000,
          }),
          threshold: JSON.stringify({ amount: 1000, currency: 'USD', period: 'daily' }),
          recipients: ['ml-team@gwi.com', 'finance@gwi.com'],
          isActive: true,
          lastTriggeredAt: null,
          triggerCount: 0,
          createdById: mlEngineer.id,
        },
        {
          name: 'Data Quality Degradation',
          type: 'data_quality',
          condition: JSON.stringify({
            metric: 'quality_score',
            operator: '<',
            value: 0.95,
          }),
          threshold: JSON.stringify({ score: 0.95, consecutive_checks: 3 }),
          recipients: ['data-team@gwi.com', 'taxonomy-team@gwi.com'],
          isActive: true,
          lastTriggeredAt: new Date(Date.now() - 86400000 * 7),
          triggerCount: 2,
          createdById: dataEngineer.id,
        },
        {
          name: 'High Error Rate',
          type: 'system',
          condition: JSON.stringify({
            metric: 'error_rate',
            operator: '>',
            value: 0.05,
          }),
          threshold: JSON.stringify({ rate: 0.05, window: '15m' }),
          recipients: ['oncall@gwi.com'],
          isActive: true,
          lastTriggeredAt: new Date(Date.now() - 86400000),
          triggerCount: 12,
          createdById: gwiAdmin.id,
        },
        {
          name: 'Survey Response Volume Drop',
          type: 'data_quality',
          condition: JSON.stringify({
            metric: 'response_volume',
            operator: '<',
            value: 0.7,
            comparison: 'previous_period',
          }),
          threshold: JSON.stringify({ dropPercent: 30, window: '24h' }),
          recipients: ['survey-ops@gwi.com'],
          isActive: true,
          lastTriggeredAt: null,
          triggerCount: 0,
          createdById: taxonomyManager.id,
        },
        {
          name: 'API Rate Limit Warning',
          type: 'system',
          condition: JSON.stringify({
            metric: 'api_rate_usage',
            operator: '>',
            value: 0.8,
          }),
          threshold: JSON.stringify({ usagePercent: 80 }),
          recipients: ['dev-team@gwi.com'],
          isActive: true,
          lastTriggeredAt: new Date(Date.now() - 3600000),
          triggerCount: 8,
          createdById: dataEngineer.id,
        },
      ]
    })

    // Error logs
    await prisma.gWIErrorLog.createMany({
      data: [
        {
          source: 'pipeline',
          sourceId: 'survey-etl-pipeline',
          errorType: 'VALIDATION_ERROR',
          message: 'Schema validation failed: unexpected null value in required field "age_group"',
          stackTrace: 'at validateRecord (pipeline/validator.ts:45)\n  at processRecord (pipeline/etl.ts:123)\n  at runPipeline (pipeline/runner.ts:78)',
          context: JSON.stringify({
            pipelineId: 'survey-etl',
            recordId: 'RESP-001234',
            field: 'age_group',
          }),
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          source: 'llm',
          sourceId: 'gpt-4-turbo',
          errorType: 'RATE_LIMIT_EXCEEDED',
          message: 'OpenAI API rate limit exceeded: 429 Too Many Requests',
          context: JSON.stringify({
            provider: 'openai',
            model: 'gpt-4-turbo',
            requestsInWindow: 502,
            limit: 500,
          }),
          createdAt: new Date(Date.now() - 7200000),
          resolvedAt: new Date(Date.now() - 6900000),
        },
        {
          source: 'data_source',
          sourceId: 'dynata-api',
          errorType: 'CONNECTION_TIMEOUT',
          message: 'Connection to Dynata API timed out after 30000ms',
          context: JSON.stringify({
            endpoint: '/v2/respondents',
            timeout: 30000,
            attempt: 3,
          }),
          createdAt: new Date(Date.now() - 14400000),
          resolvedAt: new Date(Date.now() - 14100000),
        },
        {
          source: 'agent',
          sourceId: 'open-end-coding-agent',
          errorType: 'PROCESSING_ERROR',
          message: 'Failed to parse LLM response as JSON',
          stackTrace: 'at parseResponse (agents/coding.ts:89)\n  at processResponse (agents/base.ts:156)',
          context: JSON.stringify({
            agentId: 'open-end-coding-agent',
            inputText: 'Response was truncated...',
            rawOutput: '{"primary_category": "product_feedback", "secondary_categories": [',
          }),
          createdAt: new Date(Date.now() - 21600000),
        },
        {
          source: 'pipeline',
          sourceId: 'daily-aggregation',
          errorType: 'INSUFFICIENT_DATA',
          message: 'Aggregation skipped: minimum sample size (30) not met for segment',
          context: JSON.stringify({
            segment: 'US/Gen Z/High Income',
            actualCount: 12,
            requiredCount: 30,
          }),
          createdAt: new Date(Date.now() - 86400000),
        },
      ]
    })
  })

  // ==================== GWI AUDIT LOGS ====================
  await safeSeedSection('GWI Audit Logs', async () => {
    await prisma.gWIAuditLog.createMany({
      data: [
        {
          adminId: taxonomyManager.id,
          action: 'CREATE_SURVEY',
          resourceType: 'survey',
          resourceId: 'survey-001',
          newState: JSON.stringify({ name: 'Global Consumer Trends Q1 2024', status: 'DRAFT' }),
          createdAt: new Date(Date.now() - 86400000 * 30),
        },
        {
          adminId: taxonomyManager.id,
          action: 'UPDATE_SURVEY',
          resourceType: 'survey',
          resourceId: 'survey-001',
          previousState: JSON.stringify({ status: 'DRAFT' }),
          newState: JSON.stringify({ status: 'ACTIVE' }),
          createdAt: new Date(Date.now() - 86400000 * 28),
        },
        {
          adminId: dataEngineer.id,
          action: 'CREATE_PIPELINE',
          resourceType: 'pipeline',
          resourceId: 'pipeline-001',
          newState: JSON.stringify({ name: 'Survey Response ETL Pipeline', type: 'ETL' }),
          createdAt: new Date(Date.now() - 86400000 * 25),
        },
        {
          adminId: mlEngineer.id,
          action: 'UPDATE_LLM_CONFIG',
          resourceType: 'llm_configuration',
          resourceId: 'llm-001',
          previousState: JSON.stringify({ rateLimits: { requestsPerMinute: 100 } }),
          newState: JSON.stringify({ rateLimits: { requestsPerMinute: 500 } }),
          createdAt: new Date(Date.now() - 86400000 * 15),
        },
        {
          adminId: gwiAdmin.id,
          action: 'CREATE_DATA_SOURCE',
          resourceType: 'data_source',
          resourceId: 'ds-001',
          newState: JSON.stringify({ name: 'BigQuery Analytics Warehouse', type: 'bigquery' }),
          createdAt: new Date(Date.now() - 86400000 * 20),
        },
        {
          adminId: taxonomyManager.id,
          action: 'CREATE_TAXONOMY_CATEGORY',
          resourceType: 'taxonomy_category',
          resourceId: 'tax-001',
          newState: JSON.stringify({ name: 'Demographics', code: 'demographics' }),
          createdAt: new Date(Date.now() - 86400000 * 35),
        },
        {
          adminId: mlEngineer.id,
          action: 'PUBLISH_AGENT_TEMPLATE',
          resourceType: 'agent_template',
          resourceId: 'agent-001',
          previousState: JSON.stringify({ isPublished: false }),
          newState: JSON.stringify({ isPublished: true }),
          createdAt: new Date(Date.now() - 86400000 * 10),
        },
        {
          adminId: dataEngineer.id,
          action: 'RUN_PIPELINE',
          resourceType: 'pipeline',
          resourceId: 'pipeline-001',
          newState: JSON.stringify({ runId: 'run-123', trigger: 'manual' }),
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
      ]
    })
  })

  // Seed Services data
  await safeSeedSection('Services Module', async () => {
    const { seedServices } = await import('./seed-services')
    await seedServices()
  })

  console.log('\n✅ GWI Portal test data seed completed!')
  console.log('\nSummary (reflecting GWI data coverage from gwi.com/data-coverage):')
  console.log(`- 5 GWI Surveys: Core (${ALL_MARKETS.length} markets), Gaming, USA, Zeitgeist, Sports`)
  console.log('- 500 sample responses across 54 global markets')
  console.log('- Taxonomy hierarchy with GWI\'s 50K+ profiling points structure')
  console.log('- Brand tracking for 100+ brands across 8 categories')
  console.log('- 5 Data pipelines with run history and validation rules')
  console.log('- 4 LLM configurations with 30 days of usage data')
  console.log('- 6 Prompt templates for survey analysis and coding')
  console.log('- 6 Agent templates and 7 tool configurations')
  console.log('- 8 Data source connections (BigQuery, Snowflake, Panel APIs, etc.)')
  console.log('- 6 Monitoring alerts and sample error logs')
  console.log('- Audit log entries for compliance')
  console.log('- Services Module: 6 clients, 5 projects, 5 employees, 4 vendors, time entries, and invoices')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
