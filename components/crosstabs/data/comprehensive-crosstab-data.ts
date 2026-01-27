/**
 * Comprehensive Crosstab Sample Data
 *
 * Real-world GWI-style data with 150+ metrics across 20+ audience segments
 * Organized by category for easy navigation and filtering
 */

import { CrosstabRow, CrosstabColumn } from "../advanced-crosstab-grid"

// =============================================================================
// AUDIENCE COLUMNS (20+ segments)
// =============================================================================

export const COMPREHENSIVE_COLUMNS: CrosstabColumn[] = [
  // Generational segments
  { id: "gen_z", key: "Gen Z (18-24)", label: "Gen Z (18-24)", category: "Generation" },
  { id: "mill_young", key: "Young Mill (25-30)", label: "Young Mill (25-30)", category: "Generation" },
  { id: "mill_old", key: "Older Mill (31-40)", label: "Older Mill (31-40)", category: "Generation" },
  { id: "gen_x", key: "Gen X (41-56)", label: "Gen X (41-56)", category: "Generation" },
  { id: "boomers", key: "Boomers (57-75)", label: "Boomers (57-75)", category: "Generation" },

  // Gender segments
  { id: "male", key: "Male", label: "Male", category: "Gender" },
  { id: "female", key: "Female", label: "Female", category: "Gender" },
  { id: "non_binary", key: "Non-Binary", label: "Non-Binary", category: "Gender" },

  // Income segments
  { id: "low_income", key: "Low Income", label: "Low Income (<$30K)", category: "Income" },
  { id: "mid_income", key: "Middle Income", label: "Middle Income ($30-75K)", category: "Income" },
  { id: "upper_mid", key: "Upper Middle", label: "Upper Middle ($75-150K)", category: "Income" },
  { id: "high_income", key: "High Income", label: "High Income ($150K+)", category: "Income" },

  // Regional segments
  { id: "urban", key: "Urban", label: "Urban", category: "Location" },
  { id: "suburban", key: "Suburban", label: "Suburban", category: "Location" },
  { id: "rural", key: "Rural", label: "Rural", category: "Location" },

  // Behavioral segments
  { id: "early_adopters", key: "Early Adopters", label: "Early Adopters", category: "Behavioral" },
  { id: "brand_loyalists", key: "Brand Loyalists", label: "Brand Loyalists", category: "Behavioral" },
  { id: "price_sensitive", key: "Price Sensitive", label: "Price Sensitive", category: "Behavioral" },
  { id: "eco_conscious", key: "Eco-Conscious", label: "Eco-Conscious", category: "Behavioral" },
  { id: "tech_enthusiasts", key: "Tech Enthusiasts", label: "Tech Enthusiasts", category: "Behavioral" },

  // Total column
  { id: "total", key: "Total Population", label: "Total", category: "Total", isTotal: true },
]

// =============================================================================
// METRICS DATA (150+ rows organized by category)
// =============================================================================

export const COMPREHENSIVE_DATA: CrosstabRow[] = [
  // =========================================================================
  // SOCIAL MEDIA PLATFORMS (25 metrics)
  // =========================================================================
  {
    id: "sm_1",
    metric: "Instagram - Daily Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 82, "Young Mill (25-30)": 75, "Older Mill (31-40)": 62, "Gen X (41-56)": 38, "Boomers (57-75)": 18, "Male": 52, "Female": 68, "Non-Binary": 72, "Low Income": 55, "Middle Income": 58, "Upper Middle": 62, "High Income": 65, "Urban": 68, "Suburban": 58, "Rural": 42, "Early Adopters": 78, "Brand Loyalists": 55, "Price Sensitive": 52, "Eco-Conscious": 65, "Tech Enthusiasts": 75, "Total Population": 55 },
    metadata: { description: "Used Instagram at least once daily in the past month", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_2",
    metric: "Instagram - Weekly Stories Engagement",
    category: "Social Media",
    values: { "Gen Z (18-24)": 78, "Young Mill (25-30)": 72, "Older Mill (31-40)": 55, "Gen X (41-56)": 32, "Boomers (57-75)": 12, "Male": 45, "Female": 62, "Non-Binary": 68, "Low Income": 48, "Middle Income": 52, "Upper Middle": 58, "High Income": 62, "Urban": 62, "Suburban": 52, "Rural": 35, "Early Adopters": 75, "Brand Loyalists": 52, "Price Sensitive": 48, "Eco-Conscious": 58, "Tech Enthusiasts": 72, "Total Population": 48 },
    metadata: { description: "Viewed or posted Instagram Stories weekly", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_3",
    metric: "Instagram - Reels Consumption",
    category: "Social Media",
    values: { "Gen Z (18-24)": 88, "Young Mill (25-30)": 78, "Older Mill (31-40)": 58, "Gen X (41-56)": 28, "Boomers (57-75)": 8, "Male": 48, "Female": 65, "Non-Binary": 72, "Low Income": 52, "Middle Income": 55, "Upper Middle": 58, "High Income": 55, "Urban": 65, "Suburban": 52, "Rural": 38, "Early Adopters": 82, "Brand Loyalists": 48, "Price Sensitive": 52, "Eco-Conscious": 58, "Tech Enthusiasts": 78, "Total Population": 52 },
    metadata: { description: "Watched Instagram Reels weekly", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_4",
    metric: "TikTok - Daily Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 87, "Young Mill (25-30)": 68, "Older Mill (31-40)": 42, "Gen X (41-56)": 22, "Boomers (57-75)": 8, "Male": 42, "Female": 55, "Non-Binary": 68, "Low Income": 48, "Middle Income": 52, "Upper Middle": 48, "High Income": 45, "Urban": 58, "Suburban": 48, "Rural": 35, "Early Adopters": 78, "Brand Loyalists": 42, "Price Sensitive": 52, "Eco-Conscious": 55, "Tech Enthusiasts": 72, "Total Population": 45 },
    metadata: { description: "Used TikTok at least once daily", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_5",
    metric: "TikTok - Content Creation",
    category: "Social Media",
    values: { "Gen Z (18-24)": 45, "Young Mill (25-30)": 32, "Older Mill (31-40)": 18, "Gen X (41-56)": 8, "Boomers (57-75)": 2, "Male": 18, "Female": 28, "Non-Binary": 42, "Low Income": 22, "Middle Income": 24, "Upper Middle": 22, "High Income": 25, "Urban": 28, "Suburban": 22, "Rural": 15, "Early Adopters": 48, "Brand Loyalists": 18, "Price Sensitive": 22, "Eco-Conscious": 28, "Tech Enthusiasts": 42, "Total Population": 22 },
    metadata: { description: "Created and posted TikTok content monthly", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_6",
    metric: "TikTok Shop - Made Purchase",
    category: "Social Media",
    values: { "Gen Z (18-24)": 38, "Young Mill (25-30)": 32, "Older Mill (31-40)": 22, "Gen X (41-56)": 12, "Boomers (57-75)": 4, "Male": 18, "Female": 28, "Non-Binary": 32, "Low Income": 22, "Middle Income": 25, "Upper Middle": 24, "High Income": 28, "Urban": 28, "Suburban": 22, "Rural": 15, "Early Adopters": 42, "Brand Loyalists": 22, "Price Sensitive": 28, "Eco-Conscious": 25, "Tech Enthusiasts": 38, "Total Population": 22 },
    metadata: { description: "Made a purchase via TikTok Shop in past 3 months", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "sm_7",
    metric: "YouTube - Daily Viewing",
    category: "Social Media",
    values: { "Gen Z (18-24)": 91, "Young Mill (25-30)": 88, "Older Mill (31-40)": 82, "Gen X (41-56)": 72, "Boomers (57-75)": 58, "Male": 78, "Female": 75, "Non-Binary": 82, "Low Income": 72, "Middle Income": 78, "Upper Middle": 82, "High Income": 85, "Urban": 82, "Suburban": 78, "Rural": 68, "Early Adopters": 92, "Brand Loyalists": 75, "Price Sensitive": 78, "Eco-Conscious": 78, "Tech Enthusiasts": 92, "Total Population": 78 },
    metadata: { description: "Watched YouTube content daily", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_8",
    metric: "YouTube Shorts - Weekly Viewing",
    category: "Social Media",
    values: { "Gen Z (18-24)": 78, "Young Mill (25-30)": 68, "Older Mill (31-40)": 52, "Gen X (41-56)": 35, "Boomers (57-75)": 18, "Male": 52, "Female": 48, "Non-Binary": 58, "Low Income": 48, "Middle Income": 52, "Upper Middle": 52, "High Income": 55, "Urban": 58, "Suburban": 48, "Rural": 38, "Early Adopters": 72, "Brand Loyalists": 45, "Price Sensitive": 52, "Eco-Conscious": 52, "Tech Enthusiasts": 72, "Total Population": 48 },
    metadata: { description: "Watched YouTube Shorts weekly", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_9",
    metric: "YouTube Premium Subscriber",
    category: "Social Media",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 32, "Older Mill (31-40)": 28, "Gen X (41-56)": 22, "Boomers (57-75)": 12, "Male": 28, "Female": 22, "Non-Binary": 32, "Low Income": 12, "Middle Income": 22, "Upper Middle": 32, "High Income": 45, "Urban": 32, "Suburban": 25, "Rural": 15, "Early Adopters": 48, "Brand Loyalists": 28, "Price Sensitive": 15, "Eco-Conscious": 28, "Tech Enthusiasts": 45, "Total Population": 25 },
    metadata: { description: "Active YouTube Premium subscription", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_10",
    metric: "Facebook - Daily Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 55, "Older Mill (31-40)": 68, "Gen X (41-56)": 72, "Boomers (57-75)": 68, "Male": 58, "Female": 65, "Non-Binary": 48, "Low Income": 62, "Middle Income": 65, "Upper Middle": 62, "High Income": 55, "Urban": 58, "Suburban": 65, "Rural": 68, "Early Adopters": 52, "Brand Loyalists": 68, "Price Sensitive": 65, "Eco-Conscious": 55, "Tech Enthusiasts": 52, "Total Population": 62 },
    metadata: { description: "Used Facebook at least once daily", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_11",
    metric: "Facebook Marketplace - Active Buyer",
    category: "Social Media",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 38, "Older Mill (31-40)": 45, "Gen X (41-56)": 42, "Boomers (57-75)": 35, "Male": 38, "Female": 42, "Non-Binary": 35, "Low Income": 48, "Middle Income": 45, "Upper Middle": 38, "High Income": 28, "Urban": 35, "Suburban": 45, "Rural": 48, "Early Adopters": 38, "Brand Loyalists": 35, "Price Sensitive": 55, "Eco-Conscious": 48, "Tech Enthusiasts": 38, "Total Population": 38 },
    metadata: { description: "Made purchase on Facebook Marketplace in past 3 months", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "sm_12",
    metric: "LinkedIn - Weekly Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 52, "Older Mill (31-40)": 58, "Gen X (41-56)": 48, "Boomers (57-75)": 32, "Male": 48, "Female": 42, "Non-Binary": 52, "Low Income": 22, "Middle Income": 38, "Upper Middle": 58, "High Income": 72, "Urban": 55, "Suburban": 45, "Rural": 28, "Early Adopters": 58, "Brand Loyalists": 42, "Price Sensitive": 32, "Eco-Conscious": 48, "Tech Enthusiasts": 62, "Total Population": 42 },
    metadata: { description: "Used LinkedIn at least weekly for professional networking", source: "GWI Work Q4 2024" }
  },
  {
    id: "sm_13",
    metric: "Twitter/X - Daily Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 38, "Young Mill (25-30)": 42, "Older Mill (31-40)": 38, "Gen X (41-56)": 32, "Boomers (57-75)": 18, "Male": 42, "Female": 28, "Non-Binary": 48, "Low Income": 28, "Middle Income": 32, "Upper Middle": 38, "High Income": 45, "Urban": 42, "Suburban": 32, "Rural": 22, "Early Adopters": 52, "Brand Loyalists": 32, "Price Sensitive": 28, "Eco-Conscious": 38, "Tech Enthusiasts": 55, "Total Population": 32 },
    metadata: { description: "Used Twitter/X at least once daily", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_14",
    metric: "Snapchat - Daily Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 72, "Young Mill (25-30)": 48, "Older Mill (31-40)": 25, "Gen X (41-56)": 12, "Boomers (57-75)": 4, "Male": 32, "Female": 42, "Non-Binary": 48, "Low Income": 35, "Middle Income": 38, "Upper Middle": 35, "High Income": 32, "Urban": 42, "Suburban": 35, "Rural": 25, "Early Adopters": 52, "Brand Loyalists": 32, "Price Sensitive": 38, "Eco-Conscious": 38, "Tech Enthusiasts": 48, "Total Population": 35 },
    metadata: { description: "Used Snapchat at least once daily", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_15",
    metric: "Pinterest - Monthly Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 45, "Young Mill (25-30)": 52, "Older Mill (31-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 35, "Male": 28, "Female": 58, "Non-Binary": 48, "Low Income": 38, "Middle Income": 45, "Upper Middle": 52, "High Income": 55, "Urban": 48, "Suburban": 48, "Rural": 38, "Early Adopters": 52, "Brand Loyalists": 48, "Price Sensitive": 42, "Eco-Conscious": 58, "Tech Enthusiasts": 45, "Total Population": 45 },
    metadata: { description: "Used Pinterest at least monthly", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_16",
    metric: "Reddit - Weekly Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 48, "Older Mill (31-40)": 38, "Gen X (41-56)": 25, "Boomers (57-75)": 12, "Male": 45, "Female": 25, "Non-Binary": 52, "Low Income": 32, "Middle Income": 35, "Upper Middle": 42, "High Income": 48, "Urban": 45, "Suburban": 35, "Rural": 22, "Early Adopters": 58, "Brand Loyalists": 32, "Price Sensitive": 35, "Eco-Conscious": 42, "Tech Enthusiasts": 62, "Total Population": 35 },
    metadata: { description: "Used Reddit at least weekly", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_17",
    metric: "Discord - Weekly Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 42, "Older Mill (31-40)": 28, "Gen X (41-56)": 15, "Boomers (57-75)": 5, "Male": 42, "Female": 25, "Non-Binary": 52, "Low Income": 32, "Middle Income": 35, "Upper Middle": 38, "High Income": 42, "Urban": 42, "Suburban": 32, "Rural": 22, "Early Adopters": 58, "Brand Loyalists": 28, "Price Sensitive": 32, "Eco-Conscious": 35, "Tech Enthusiasts": 65, "Total Population": 32 },
    metadata: { description: "Used Discord at least weekly", source: "GWI Gaming Q4 2024" }
  },
  {
    id: "sm_18",
    metric: "Threads - Weekly Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 32, "Young Mill (25-30)": 35, "Older Mill (31-40)": 28, "Gen X (41-56)": 18, "Boomers (57-75)": 8, "Male": 25, "Female": 28, "Non-Binary": 35, "Low Income": 22, "Middle Income": 25, "Upper Middle": 28, "High Income": 32, "Urban": 32, "Suburban": 25, "Rural": 15, "Early Adopters": 48, "Brand Loyalists": 25, "Price Sensitive": 22, "Eco-Conscious": 28, "Tech Enthusiasts": 42, "Total Population": 25 },
    metadata: { description: "Used Threads at least weekly", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_19",
    metric: "BeReal - Weekly Active Use",
    category: "Social Media",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 18, "Older Mill (31-40)": 8, "Gen X (41-56)": 4, "Boomers (57-75)": 1, "Male": 12, "Female": 18, "Non-Binary": 22, "Low Income": 12, "Middle Income": 15, "Upper Middle": 15, "High Income": 18, "Urban": 18, "Suburban": 12, "Rural": 8, "Early Adopters": 32, "Brand Loyalists": 12, "Price Sensitive": 12, "Eco-Conscious": 18, "Tech Enthusiasts": 25, "Total Population": 12 },
    metadata: { description: "Used BeReal at least weekly", source: "GWI Core Q4 2024" }
  },
  {
    id: "sm_20",
    metric: "WhatsApp - Daily Messaging",
    category: "Social Media",
    values: { "Gen Z (18-24)": 72, "Young Mill (25-30)": 78, "Older Mill (31-40)": 82, "Gen X (41-56)": 75, "Boomers (57-75)": 62, "Male": 72, "Female": 78, "Non-Binary": 75, "Low Income": 72, "Middle Income": 75, "Upper Middle": 78, "High Income": 82, "Urban": 82, "Suburban": 75, "Rural": 65, "Early Adopters": 82, "Brand Loyalists": 75, "Price Sensitive": 72, "Eco-Conscious": 78, "Tech Enthusiasts": 85, "Total Population": 75 },
    metadata: { description: "Used WhatsApp for messaging daily", source: "GWI Core Q4 2024" }
  },

  // =========================================================================
  // E-COMMERCE & SHOPPING (25 metrics)
  // =========================================================================
  {
    id: "ec_1",
    metric: "Amazon - Monthly Purchase",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 68, "Young Mill (25-30)": 78, "Older Mill (31-40)": 82, "Gen X (41-56)": 75, "Boomers (57-75)": 62, "Male": 72, "Female": 75, "Non-Binary": 72, "Low Income": 58, "Middle Income": 72, "Upper Middle": 82, "High Income": 88, "Urban": 78, "Suburban": 78, "Rural": 65, "Early Adopters": 85, "Brand Loyalists": 72, "Price Sensitive": 75, "Eco-Conscious": 62, "Tech Enthusiasts": 85, "Total Population": 72 },
    metadata: { description: "Made at least one Amazon purchase in the past month", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_2",
    metric: "Amazon Prime Member",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 68, "Older Mill (31-40)": 72, "Gen X (41-56)": 65, "Boomers (57-75)": 52, "Male": 62, "Female": 65, "Non-Binary": 62, "Low Income": 38, "Middle Income": 58, "Upper Middle": 75, "High Income": 88, "Urban": 68, "Suburban": 68, "Rural": 52, "Early Adopters": 78, "Brand Loyalists": 72, "Price Sensitive": 55, "Eco-Conscious": 55, "Tech Enthusiasts": 78, "Total Population": 62 },
    metadata: { description: "Active Amazon Prime subscription", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_3",
    metric: "Buy Now Pay Later - Used in Past 6 Months",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 48, "Older Mill (31-40)": 38, "Gen X (41-56)": 25, "Boomers (57-75)": 12, "Male": 32, "Female": 42, "Non-Binary": 45, "Low Income": 48, "Middle Income": 42, "Upper Middle": 32, "High Income": 22, "Urban": 42, "Suburban": 35, "Rural": 28, "Early Adopters": 52, "Brand Loyalists": 32, "Price Sensitive": 55, "Eco-Conscious": 35, "Tech Enthusiasts": 48, "Total Population": 35 },
    metadata: { description: "Used BNPL services (Klarna, Afterpay, etc.) in past 6 months", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_4",
    metric: "Mobile Commerce - Weekly Purchase",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 55, "Older Mill (31-40)": 48, "Gen X (41-56)": 35, "Boomers (57-75)": 18, "Male": 42, "Female": 48, "Non-Binary": 52, "Low Income": 38, "Middle Income": 45, "Upper Middle": 52, "High Income": 55, "Urban": 52, "Suburban": 45, "Rural": 32, "Early Adopters": 65, "Brand Loyalists": 42, "Price Sensitive": 48, "Eco-Conscious": 45, "Tech Enthusiasts": 62, "Total Population": 42 },
    metadata: { description: "Made purchase via mobile device weekly", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_5",
    metric: "Social Commerce - Purchased via Social Media",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 48, "Young Mill (25-30)": 42, "Older Mill (31-40)": 32, "Gen X (41-56)": 18, "Boomers (57-75)": 8, "Male": 25, "Female": 38, "Non-Binary": 42, "Low Income": 28, "Middle Income": 32, "Upper Middle": 35, "High Income": 38, "Urban": 38, "Suburban": 28, "Rural": 18, "Early Adopters": 52, "Brand Loyalists": 28, "Price Sensitive": 35, "Eco-Conscious": 35, "Tech Enthusiasts": 48, "Total Population": 28 },
    metadata: { description: "Made purchase directly through social media platform", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_6",
    metric: "Grocery Delivery - Weekly User",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 32, "Young Mill (25-30)": 42, "Older Mill (31-40)": 48, "Gen X (41-56)": 35, "Boomers (57-75)": 22, "Male": 35, "Female": 42, "Non-Binary": 38, "Low Income": 22, "Middle Income": 35, "Upper Middle": 52, "High Income": 65, "Urban": 55, "Suburban": 38, "Rural": 15, "Early Adopters": 55, "Brand Loyalists": 42, "Price Sensitive": 28, "Eco-Conscious": 42, "Tech Enthusiasts": 52, "Total Population": 35 },
    metadata: { description: "Used grocery delivery service weekly (Instacart, Amazon Fresh, etc.)", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_7",
    metric: "Subscription Box - Active Subscriber",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 35, "Older Mill (31-40)": 32, "Gen X (41-56)": 22, "Boomers (57-75)": 12, "Male": 22, "Female": 32, "Non-Binary": 35, "Low Income": 18, "Middle Income": 25, "Upper Middle": 35, "High Income": 45, "Urban": 32, "Suburban": 28, "Rural": 18, "Early Adopters": 45, "Brand Loyalists": 38, "Price Sensitive": 18, "Eco-Conscious": 35, "Tech Enthusiasts": 38, "Total Population": 25 },
    metadata: { description: "Active subscription box service (beauty, food, clothing)", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_8",
    metric: "Click & Collect - Used in Past Month",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 52, "Older Mill (31-40)": 58, "Gen X (41-56)": 52, "Boomers (57-75)": 38, "Male": 48, "Female": 52, "Non-Binary": 48, "Low Income": 42, "Middle Income": 52, "Upper Middle": 55, "High Income": 58, "Urban": 48, "Suburban": 58, "Rural": 42, "Early Adopters": 58, "Brand Loyalists": 55, "Price Sensitive": 52, "Eco-Conscious": 55, "Tech Enthusiasts": 55, "Total Population": 48 },
    metadata: { description: "Used buy online, pickup in store in past month", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_9",
    metric: "Second-hand/Resale - Purchased Items",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 48, "Older Mill (31-40)": 42, "Gen X (41-56)": 35, "Boomers (57-75)": 28, "Male": 35, "Female": 48, "Non-Binary": 55, "Low Income": 52, "Middle Income": 45, "Upper Middle": 38, "High Income": 32, "Urban": 48, "Suburban": 42, "Rural": 35, "Early Adopters": 52, "Brand Loyalists": 32, "Price Sensitive": 58, "Eco-Conscious": 68, "Tech Enthusiasts": 45, "Total Population": 42 },
    metadata: { description: "Purchased second-hand items online (Poshmark, ThredUp, eBay)", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_10",
    metric: "Voice Commerce - Made Purchase via Voice Assistant",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 22, "Young Mill (25-30)": 28, "Older Mill (31-40)": 25, "Gen X (41-56)": 18, "Boomers (57-75)": 8, "Male": 22, "Female": 18, "Non-Binary": 25, "Low Income": 12, "Middle Income": 18, "Upper Middle": 28, "High Income": 38, "Urban": 25, "Suburban": 22, "Rural": 12, "Early Adopters": 42, "Brand Loyalists": 22, "Price Sensitive": 15, "Eco-Conscious": 22, "Tech Enthusiasts": 45, "Total Population": 18 },
    metadata: { description: "Made purchase using voice assistant (Alexa, Google)", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_11",
    metric: "Livestream Shopping - Participated",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 25, "Older Mill (31-40)": 18, "Gen X (41-56)": 12, "Boomers (57-75)": 5, "Male": 15, "Female": 22, "Non-Binary": 28, "Low Income": 18, "Middle Income": 18, "Upper Middle": 22, "High Income": 25, "Urban": 25, "Suburban": 18, "Rural": 12, "Early Adopters": 38, "Brand Loyalists": 18, "Price Sensitive": 22, "Eco-Conscious": 18, "Tech Enthusiasts": 35, "Total Population": 18 },
    metadata: { description: "Participated in livestream shopping event", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_12",
    metric: "Digital Wallet - Primary Payment Method",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 52, "Older Mill (31-40)": 42, "Gen X (41-56)": 28, "Boomers (57-75)": 15, "Male": 38, "Female": 42, "Non-Binary": 48, "Low Income": 35, "Middle Income": 38, "Upper Middle": 45, "High Income": 52, "Urban": 48, "Suburban": 38, "Rural": 25, "Early Adopters": 62, "Brand Loyalists": 35, "Price Sensitive": 42, "Eco-Conscious": 45, "Tech Enthusiasts": 65, "Total Population": 38 },
    metadata: { description: "Uses digital wallet as primary payment (Apple Pay, Google Pay)", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_13",
    metric: "Shein - Purchased in Past 3 Months",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 48, "Young Mill (25-30)": 38, "Older Mill (31-40)": 25, "Gen X (41-56)": 15, "Boomers (57-75)": 5, "Male": 18, "Female": 42, "Non-Binary": 35, "Low Income": 38, "Middle Income": 32, "Upper Middle": 25, "High Income": 18, "Urban": 35, "Suburban": 28, "Rural": 22, "Early Adopters": 42, "Brand Loyalists": 22, "Price Sensitive": 48, "Eco-Conscious": 12, "Tech Enthusiasts": 32, "Total Population": 28 },
    metadata: { description: "Made purchase from Shein in past 3 months", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_14",
    metric: "Temu - Purchased in Past 3 Months",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 38, "Older Mill (31-40)": 32, "Gen X (41-56)": 28, "Boomers (57-75)": 18, "Male": 28, "Female": 35, "Non-Binary": 32, "Low Income": 42, "Middle Income": 35, "Upper Middle": 28, "High Income": 22, "Urban": 32, "Suburban": 32, "Rural": 32, "Early Adopters": 45, "Brand Loyalists": 25, "Price Sensitive": 52, "Eco-Conscious": 15, "Tech Enthusiasts": 38, "Total Population": 32 },
    metadata: { description: "Made purchase from Temu in past 3 months", source: "GWI Commerce Q4 2024" }
  },
  {
    id: "ec_15",
    metric: "Luxury E-commerce - Purchased Online",
    category: "E-commerce",
    values: { "Gen Z (18-24)": 18, "Young Mill (25-30)": 25, "Older Mill (31-40)": 28, "Gen X (41-56)": 22, "Boomers (57-75)": 15, "Male": 22, "Female": 25, "Non-Binary": 22, "Low Income": 5, "Middle Income": 12, "Upper Middle": 28, "High Income": 55, "Urban": 28, "Suburban": 22, "Rural": 12, "Early Adopters": 35, "Brand Loyalists": 38, "Price Sensitive": 8, "Eco-Conscious": 22, "Tech Enthusiasts": 32, "Total Population": 22 },
    metadata: { description: "Purchased luxury items online ($500+)", source: "GWI Commerce Q4 2024" }
  },

  // =========================================================================
  // STREAMING & ENTERTAINMENT (25 metrics)
  // =========================================================================
  {
    id: "ent_1",
    metric: "Netflix - Active Subscriber",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 72, "Young Mill (25-30)": 78, "Older Mill (31-40)": 75, "Gen X (41-56)": 68, "Boomers (57-75)": 52, "Male": 68, "Female": 72, "Non-Binary": 75, "Low Income": 52, "Middle Income": 68, "Upper Middle": 78, "High Income": 85, "Urban": 75, "Suburban": 72, "Rural": 58, "Early Adopters": 82, "Brand Loyalists": 75, "Price Sensitive": 58, "Eco-Conscious": 72, "Tech Enthusiasts": 82, "Total Population": 68 },
    metadata: { description: "Active Netflix subscription (personal or shared)", source: "GWI Entertainment Q4 2024" }
  },
  {
    id: "ent_2",
    metric: "Disney+ - Active Subscriber",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 58, "Older Mill (31-40)": 62, "Gen X (41-56)": 48, "Boomers (57-75)": 32, "Male": 48, "Female": 55, "Non-Binary": 52, "Low Income": 35, "Middle Income": 48, "Upper Middle": 58, "High Income": 68, "Urban": 55, "Suburban": 55, "Rural": 42, "Early Adopters": 65, "Brand Loyalists": 58, "Price Sensitive": 42, "Eco-Conscious": 52, "Tech Enthusiasts": 62, "Total Population": 52 },
    metadata: { description: "Active Disney+ subscription", source: "GWI Entertainment Q4 2024" }
  },
  {
    id: "ent_3",
    metric: "HBO Max - Active Subscriber",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 52, "Older Mill (31-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 28, "Male": 45, "Female": 42, "Non-Binary": 48, "Low Income": 28, "Middle Income": 42, "Upper Middle": 52, "High Income": 62, "Urban": 52, "Suburban": 45, "Rural": 32, "Early Adopters": 58, "Brand Loyalists": 48, "Price Sensitive": 35, "Eco-Conscious": 45, "Tech Enthusiasts": 55, "Total Population": 42 },
    metadata: { description: "Active HBO Max subscription", source: "GWI Entertainment Q4 2024" }
  },
  {
    id: "ent_4",
    metric: "Spotify - Premium Subscriber",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 62, "Young Mill (25-30)": 58, "Older Mill (31-40)": 48, "Gen X (41-56)": 32, "Boomers (57-75)": 18, "Male": 45, "Female": 48, "Non-Binary": 55, "Low Income": 32, "Middle Income": 45, "Upper Middle": 55, "High Income": 65, "Urban": 55, "Suburban": 45, "Rural": 32, "Early Adopters": 68, "Brand Loyalists": 52, "Price Sensitive": 35, "Eco-Conscious": 52, "Tech Enthusiasts": 65, "Total Population": 45 },
    metadata: { description: "Active Spotify Premium subscription", source: "GWI Entertainment Q4 2024" }
  },
  {
    id: "ent_5",
    metric: "Apple Music - Subscriber",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 35, "Young Mill (25-30)": 38, "Older Mill (31-40)": 32, "Gen X (41-56)": 25, "Boomers (57-75)": 15, "Male": 32, "Female": 28, "Non-Binary": 35, "Low Income": 18, "Middle Income": 28, "Upper Middle": 38, "High Income": 52, "Urban": 38, "Suburban": 32, "Rural": 22, "Early Adopters": 48, "Brand Loyalists": 42, "Price Sensitive": 22, "Eco-Conscious": 32, "Tech Enthusiasts": 52, "Total Population": 28 },
    metadata: { description: "Active Apple Music subscription", source: "GWI Entertainment Q4 2024" }
  },
  {
    id: "ent_6",
    metric: "Podcast - Weekly Listener",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 48, "Young Mill (25-30)": 55, "Older Mill (31-40)": 52, "Gen X (41-56)": 42, "Boomers (57-75)": 25, "Male": 48, "Female": 42, "Non-Binary": 52, "Low Income": 35, "Middle Income": 45, "Upper Middle": 55, "High Income": 62, "Urban": 55, "Suburban": 48, "Rural": 32, "Early Adopters": 62, "Brand Loyalists": 45, "Price Sensitive": 38, "Eco-Conscious": 55, "Tech Enthusiasts": 62, "Total Population": 45 },
    metadata: { description: "Listens to podcasts at least weekly", source: "GWI Entertainment Q4 2024" }
  },
  {
    id: "ent_7",
    metric: "Gaming - Daily Player",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 48, "Older Mill (31-40)": 35, "Gen X (41-56)": 22, "Boomers (57-75)": 12, "Male": 52, "Female": 28, "Non-Binary": 48, "Low Income": 38, "Middle Income": 42, "Upper Middle": 42, "High Income": 45, "Urban": 45, "Suburban": 38, "Rural": 32, "Early Adopters": 58, "Brand Loyalists": 42, "Price Sensitive": 38, "Eco-Conscious": 35, "Tech Enthusiasts": 65, "Total Population": 38 },
    metadata: { description: "Plays video games daily", source: "GWI Gaming Q4 2024" }
  },
  {
    id: "ent_8",
    metric: "Mobile Gaming - Daily Player",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 48, "Older Mill (31-40)": 42, "Gen X (41-56)": 35, "Boomers (57-75)": 28, "Male": 42, "Female": 45, "Non-Binary": 48, "Low Income": 42, "Middle Income": 45, "Upper Middle": 42, "High Income": 38, "Urban": 45, "Suburban": 42, "Rural": 38, "Early Adopters": 52, "Brand Loyalists": 42, "Price Sensitive": 48, "Eco-Conscious": 38, "Tech Enthusiasts": 55, "Total Population": 42 },
    metadata: { description: "Plays mobile games daily", source: "GWI Gaming Q4 2024" }
  },
  {
    id: "ent_9",
    metric: "Console Gaming - Weekly Player",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 48, "Young Mill (25-30)": 42, "Older Mill (31-40)": 32, "Gen X (41-56)": 22, "Boomers (57-75)": 8, "Male": 45, "Female": 18, "Non-Binary": 38, "Low Income": 28, "Middle Income": 35, "Upper Middle": 38, "High Income": 42, "Urban": 38, "Suburban": 35, "Rural": 25, "Early Adopters": 52, "Brand Loyalists": 38, "Price Sensitive": 28, "Eco-Conscious": 28, "Tech Enthusiasts": 55, "Total Population": 32 },
    metadata: { description: "Plays console games weekly (PlayStation, Xbox, Nintendo)", source: "GWI Gaming Q4 2024" }
  },
  {
    id: "ent_10",
    metric: "PC Gaming - Weekly Player",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 38, "Older Mill (31-40)": 28, "Gen X (41-56)": 18, "Boomers (57-75)": 8, "Male": 42, "Female": 15, "Non-Binary": 35, "Low Income": 25, "Middle Income": 32, "Upper Middle": 35, "High Income": 38, "Urban": 35, "Suburban": 28, "Rural": 22, "Early Adopters": 48, "Brand Loyalists": 32, "Price Sensitive": 28, "Eco-Conscious": 25, "Tech Enthusiasts": 58, "Total Population": 28 },
    metadata: { description: "Plays PC games weekly", source: "GWI Gaming Q4 2024" }
  },
  {
    id: "ent_11",
    metric: "Esports - Watches Monthly",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 35, "Young Mill (25-30)": 28, "Older Mill (31-40)": 18, "Gen X (41-56)": 8, "Boomers (57-75)": 3, "Male": 32, "Female": 12, "Non-Binary": 28, "Low Income": 22, "Middle Income": 22, "Upper Middle": 25, "High Income": 28, "Urban": 28, "Suburban": 22, "Rural": 15, "Early Adopters": 42, "Brand Loyalists": 22, "Price Sensitive": 22, "Eco-Conscious": 18, "Tech Enthusiasts": 48, "Total Population": 22 },
    metadata: { description: "Watches esports content monthly", source: "GWI Gaming Q4 2024" }
  },
  {
    id: "ent_12",
    metric: "Live TV - Daily Viewer",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 25, "Young Mill (25-30)": 32, "Older Mill (31-40)": 42, "Gen X (41-56)": 58, "Boomers (57-75)": 72, "Male": 48, "Female": 52, "Non-Binary": 42, "Low Income": 52, "Middle Income": 52, "Upper Middle": 48, "High Income": 42, "Urban": 42, "Suburban": 52, "Rural": 62, "Early Adopters": 32, "Brand Loyalists": 55, "Price Sensitive": 52, "Eco-Conscious": 42, "Tech Enthusiasts": 35, "Total Population": 48 },
    metadata: { description: "Watches live/linear TV daily", source: "GWI Entertainment Q4 2024" }
  },
  {
    id: "ent_13",
    metric: "Audiobooks - Monthly Listener",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 35, "Older Mill (31-40)": 32, "Gen X (41-56)": 28, "Boomers (57-75)": 22, "Male": 28, "Female": 32, "Non-Binary": 35, "Low Income": 22, "Middle Income": 28, "Upper Middle": 38, "High Income": 48, "Urban": 38, "Suburban": 32, "Rural": 22, "Early Adopters": 45, "Brand Loyalists": 32, "Price Sensitive": 25, "Eco-Conscious": 38, "Tech Enthusiasts": 42, "Total Population": 28 },
    metadata: { description: "Listens to audiobooks monthly (Audible, Libby)", source: "GWI Entertainment Q4 2024" }
  },
  {
    id: "ent_14",
    metric: "VR/AR Gaming - Used in Past Month",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 22, "Young Mill (25-30)": 18, "Older Mill (31-40)": 12, "Gen X (41-56)": 8, "Boomers (57-75)": 3, "Male": 18, "Female": 8, "Non-Binary": 15, "Low Income": 8, "Middle Income": 12, "Upper Middle": 18, "High Income": 28, "Urban": 18, "Suburban": 12, "Rural": 8, "Early Adopters": 35, "Brand Loyalists": 15, "Price Sensitive": 8, "Eco-Conscious": 12, "Tech Enthusiasts": 38, "Total Population": 12 },
    metadata: { description: "Used VR/AR for gaming in past month", source: "GWI Gaming Q4 2024" }
  },
  {
    id: "ent_15",
    metric: "Streaming Bundles - Has Multiple Services",
    category: "Entertainment",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 68, "Older Mill (31-40)": 65, "Gen X (41-56)": 55, "Boomers (57-75)": 38, "Male": 55, "Female": 58, "Non-Binary": 62, "Low Income": 35, "Middle Income": 55, "Upper Middle": 68, "High Income": 82, "Urban": 65, "Suburban": 58, "Rural": 42, "Early Adopters": 78, "Brand Loyalists": 62, "Price Sensitive": 42, "Eco-Conscious": 55, "Tech Enthusiasts": 75, "Total Population": 55 },
    metadata: { description: "Subscribes to 3+ streaming services", source: "GWI Entertainment Q4 2024" }
  },

  // =========================================================================
  // TECHNOLOGY & DEVICES (20 metrics)
  // =========================================================================
  {
    id: "tech_1",
    metric: "Smartphone - iPhone User",
    category: "Technology",
    values: { "Gen Z (18-24)": 72, "Young Mill (25-30)": 65, "Older Mill (31-40)": 58, "Gen X (41-56)": 48, "Boomers (57-75)": 42, "Male": 52, "Female": 58, "Non-Binary": 55, "Low Income": 35, "Middle Income": 52, "Upper Middle": 65, "High Income": 82, "Urban": 62, "Suburban": 55, "Rural": 42, "Early Adopters": 72, "Brand Loyalists": 68, "Price Sensitive": 38, "Eco-Conscious": 52, "Tech Enthusiasts": 68, "Total Population": 55 },
    metadata: { description: "Primary smartphone is iPhone", source: "GWI Tech Q4 2024" }
  },
  {
    id: "tech_2",
    metric: "Smart Speaker - Owns One",
    category: "Technology",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 52, "Older Mill (31-40)": 55, "Gen X (41-56)": 45, "Boomers (57-75)": 32, "Male": 48, "Female": 45, "Non-Binary": 48, "Low Income": 28, "Middle Income": 45, "Upper Middle": 58, "High Income": 72, "Urban": 52, "Suburban": 52, "Rural": 35, "Early Adopters": 72, "Brand Loyalists": 52, "Price Sensitive": 35, "Eco-Conscious": 45, "Tech Enthusiasts": 75, "Total Population": 45 },
    metadata: { description: "Owns a smart speaker (Alexa, Google Home, HomePod)", source: "GWI Tech Q4 2024" }
  },
  {
    id: "tech_3",
    metric: "Smartwatch - Daily Wearer",
    category: "Technology",
    values: { "Gen Z (18-24)": 38, "Young Mill (25-30)": 45, "Older Mill (31-40)": 42, "Gen X (41-56)": 32, "Boomers (57-75)": 18, "Male": 38, "Female": 35, "Non-Binary": 42, "Low Income": 18, "Middle Income": 32, "Upper Middle": 48, "High Income": 62, "Urban": 45, "Suburban": 38, "Rural": 25, "Early Adopters": 62, "Brand Loyalists": 45, "Price Sensitive": 22, "Eco-Conscious": 38, "Tech Enthusiasts": 68, "Total Population": 35 },
    metadata: { description: "Wears smartwatch daily (Apple Watch, Samsung, Fitbit)", source: "GWI Tech Q4 2024" }
  },
  {
    id: "tech_4",
    metric: "Smart Home Devices - Owns 3+",
    category: "Technology",
    values: { "Gen Z (18-24)": 25, "Young Mill (25-30)": 38, "Older Mill (31-40)": 45, "Gen X (41-56)": 38, "Boomers (57-75)": 22, "Male": 42, "Female": 32, "Non-Binary": 38, "Low Income": 15, "Middle Income": 32, "Upper Middle": 48, "High Income": 68, "Urban": 42, "Suburban": 42, "Rural": 25, "Early Adopters": 68, "Brand Loyalists": 42, "Price Sensitive": 22, "Eco-Conscious": 45, "Tech Enthusiasts": 72, "Total Population": 35 },
    metadata: { description: "Owns 3+ smart home devices", source: "GWI Tech Q4 2024" }
  },
  {
    id: "tech_5",
    metric: "AI Assistant - Uses Daily",
    category: "Technology",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 55, "Older Mill (31-40)": 48, "Gen X (41-56)": 35, "Boomers (57-75)": 22, "Male": 45, "Female": 42, "Non-Binary": 52, "Low Income": 32, "Middle Income": 42, "Upper Middle": 52, "High Income": 62, "Urban": 52, "Suburban": 45, "Rural": 32, "Early Adopters": 72, "Brand Loyalists": 45, "Price Sensitive": 38, "Eco-Conscious": 48, "Tech Enthusiasts": 78, "Total Population": 42 },
    metadata: { description: "Uses AI assistant daily (Siri, Alexa, Google Assistant)", source: "GWI Tech Q4 2024" }
  },
  {
    id: "tech_6",
    metric: "ChatGPT - Used in Past Month",
    category: "Technology",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 55, "Older Mill (31-40)": 45, "Gen X (41-56)": 28, "Boomers (57-75)": 12, "Male": 45, "Female": 35, "Non-Binary": 52, "Low Income": 28, "Middle Income": 38, "Upper Middle": 52, "High Income": 62, "Urban": 52, "Suburban": 42, "Rural": 28, "Early Adopters": 72, "Brand Loyalists": 38, "Price Sensitive": 35, "Eco-Conscious": 45, "Tech Enthusiasts": 78, "Total Population": 42 },
    metadata: { description: "Used ChatGPT or similar AI chatbot in past month", source: "GWI Tech Q4 2024" }
  },
  {
    id: "tech_7",
    metric: "Electric Vehicle - Owns or Plans to Buy",
    category: "Technology",
    values: { "Gen Z (18-24)": 35, "Young Mill (25-30)": 42, "Older Mill (31-40)": 45, "Gen X (41-56)": 38, "Boomers (57-75)": 25, "Male": 42, "Female": 32, "Non-Binary": 45, "Low Income": 18, "Middle Income": 32, "Upper Middle": 48, "High Income": 62, "Urban": 45, "Suburban": 42, "Rural": 22, "Early Adopters": 58, "Brand Loyalists": 42, "Price Sensitive": 25, "Eco-Conscious": 68, "Tech Enthusiasts": 55, "Total Population": 38 },
    metadata: { description: "Currently owns or plans to buy EV in next 2 years", source: "GWI Auto Q4 2024" }
  },
  {
    id: "tech_8",
    metric: "5G - Active User",
    category: "Technology",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 55, "Older Mill (31-40)": 48, "Gen X (41-56)": 38, "Boomers (57-75)": 22, "Male": 48, "Female": 42, "Non-Binary": 48, "Low Income": 32, "Middle Income": 42, "Upper Middle": 55, "High Income": 68, "Urban": 58, "Suburban": 45, "Rural": 22, "Early Adopters": 72, "Brand Loyalists": 48, "Price Sensitive": 35, "Eco-Conscious": 45, "Tech Enthusiasts": 72, "Total Population": 45 },
    metadata: { description: "Uses 5G network on mobile device", source: "GWI Tech Q4 2024" }
  },
  {
    id: "tech_9",
    metric: "Tablet - Regular User",
    category: "Technology",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 48, "Older Mill (31-40)": 52, "Gen X (41-56)": 48, "Boomers (57-75)": 42, "Male": 45, "Female": 48, "Non-Binary": 48, "Low Income": 32, "Middle Income": 45, "Upper Middle": 55, "High Income": 68, "Urban": 52, "Suburban": 48, "Rural": 38, "Early Adopters": 62, "Brand Loyalists": 52, "Price Sensitive": 38, "Eco-Conscious": 45, "Tech Enthusiasts": 62, "Total Population": 45 },
    metadata: { description: "Uses tablet device weekly", source: "GWI Tech Q4 2024" }
  },
  {
    id: "tech_10",
    metric: "Cryptocurrency - Has Invested",
    category: "Technology",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 35, "Older Mill (31-40)": 28, "Gen X (41-56)": 18, "Boomers (57-75)": 8, "Male": 32, "Female": 15, "Non-Binary": 28, "Low Income": 15, "Middle Income": 22, "Upper Middle": 32, "High Income": 42, "Urban": 32, "Suburban": 25, "Rural": 15, "Early Adopters": 48, "Brand Loyalists": 22, "Price Sensitive": 22, "Eco-Conscious": 22, "Tech Enthusiasts": 52, "Total Population": 22 },
    metadata: { description: "Has invested in cryptocurrency", source: "GWI Finance Q4 2024" }
  },

  // =========================================================================
  // FINANCE & BANKING (15 metrics)
  // =========================================================================
  {
    id: "fin_1",
    metric: "Mobile Banking - Weekly User",
    category: "Finance",
    values: { "Gen Z (18-24)": 72, "Young Mill (25-30)": 82, "Older Mill (31-40)": 78, "Gen X (41-56)": 62, "Boomers (57-75)": 42, "Male": 65, "Female": 68, "Non-Binary": 72, "Low Income": 55, "Middle Income": 68, "Upper Middle": 75, "High Income": 82, "Urban": 75, "Suburban": 68, "Rural": 52, "Early Adopters": 85, "Brand Loyalists": 68, "Price Sensitive": 65, "Eco-Conscious": 72, "Tech Enthusiasts": 85, "Total Population": 65 },
    metadata: { description: "Uses mobile banking app weekly", source: "GWI Finance Q4 2024" }
  },
  {
    id: "fin_2",
    metric: "Contactless Payment - Regular User",
    category: "Finance",
    values: { "Gen Z (18-24)": 78, "Young Mill (25-30)": 82, "Older Mill (31-40)": 75, "Gen X (41-56)": 58, "Boomers (57-75)": 38, "Male": 65, "Female": 68, "Non-Binary": 75, "Low Income": 52, "Middle Income": 65, "Upper Middle": 75, "High Income": 85, "Urban": 78, "Suburban": 68, "Rural": 48, "Early Adopters": 88, "Brand Loyalists": 68, "Price Sensitive": 62, "Eco-Conscious": 72, "Tech Enthusiasts": 85, "Total Population": 65 },
    metadata: { description: "Regularly uses contactless payments (tap to pay)", source: "GWI Finance Q4 2024" }
  },
  {
    id: "fin_3",
    metric: "Investment App - Active User",
    category: "Finance",
    values: { "Gen Z (18-24)": 38, "Young Mill (25-30)": 52, "Older Mill (31-40)": 48, "Gen X (41-56)": 38, "Boomers (57-75)": 25, "Male": 48, "Female": 32, "Non-Binary": 42, "Low Income": 22, "Middle Income": 38, "Upper Middle": 52, "High Income": 68, "Urban": 48, "Suburban": 42, "Rural": 28, "Early Adopters": 62, "Brand Loyalists": 42, "Price Sensitive": 35, "Eco-Conscious": 45, "Tech Enthusiasts": 58, "Total Population": 42 },
    metadata: { description: "Uses investment app (Robinhood, Acorns, etc.)", source: "GWI Finance Q4 2024" }
  },
  {
    id: "fin_4",
    metric: "Neobank - Primary Bank",
    category: "Finance",
    values: { "Gen Z (18-24)": 32, "Young Mill (25-30)": 38, "Older Mill (31-40)": 28, "Gen X (41-56)": 15, "Boomers (57-75)": 5, "Male": 25, "Female": 22, "Non-Binary": 32, "Low Income": 25, "Middle Income": 25, "Upper Middle": 28, "High Income": 25, "Urban": 32, "Suburban": 22, "Rural": 12, "Early Adopters": 48, "Brand Loyalists": 22, "Price Sensitive": 32, "Eco-Conscious": 28, "Tech Enthusiasts": 45, "Total Population": 22 },
    metadata: { description: "Uses digital-only bank as primary (Chime, Revolut)", source: "GWI Finance Q4 2024" }
  },
  {
    id: "fin_5",
    metric: "Budgeting App - Regular User",
    category: "Finance",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 52, "Older Mill (31-40)": 48, "Gen X (41-56)": 35, "Boomers (57-75)": 22, "Male": 38, "Female": 45, "Non-Binary": 48, "Low Income": 42, "Middle Income": 45, "Upper Middle": 42, "High Income": 38, "Urban": 48, "Suburban": 42, "Rural": 32, "Early Adopters": 55, "Brand Loyalists": 42, "Price Sensitive": 58, "Eco-Conscious": 52, "Tech Enthusiasts": 52, "Total Population": 42 },
    metadata: { description: "Uses budgeting app regularly (Mint, YNAB)", source: "GWI Finance Q4 2024" }
  },

  // =========================================================================
  // VALUES & LIFESTYLE (20 metrics)
  // =========================================================================
  {
    id: "val_1",
    metric: "Sustainability - Major Purchase Factor",
    category: "Values",
    values: { "Gen Z (18-24)": 65, "Young Mill (25-30)": 62, "Older Mill (31-40)": 55, "Gen X (41-56)": 45, "Boomers (57-75)": 38, "Male": 45, "Female": 58, "Non-Binary": 68, "Low Income": 42, "Middle Income": 52, "Upper Middle": 58, "High Income": 62, "Urban": 58, "Suburban": 52, "Rural": 42, "Early Adopters": 62, "Brand Loyalists": 52, "Price Sensitive": 42, "Eco-Conscious": 92, "Tech Enthusiasts": 55, "Total Population": 52 },
    metadata: { description: "Considers sustainability important when making purchases", source: "GWI Zeitgeist Q4 2024" }
  },
  {
    id: "val_2",
    metric: "Mental Health - Actively Prioritizes",
    category: "Values",
    values: { "Gen Z (18-24)": 72, "Young Mill (25-30)": 68, "Older Mill (31-40)": 58, "Gen X (41-56)": 48, "Boomers (57-75)": 38, "Male": 48, "Female": 62, "Non-Binary": 72, "Low Income": 52, "Middle Income": 55, "Upper Middle": 58, "High Income": 62, "Urban": 62, "Suburban": 55, "Rural": 48, "Early Adopters": 62, "Brand Loyalists": 52, "Price Sensitive": 52, "Eco-Conscious": 68, "Tech Enthusiasts": 58, "Total Population": 55 },
    metadata: { description: "Actively prioritizes mental health and wellness", source: "GWI Zeitgeist Q4 2024" }
  },
  {
    id: "val_3",
    metric: "Work-Life Balance - Top Priority",
    category: "Values",
    values: { "Gen Z (18-24)": 78, "Young Mill (25-30)": 75, "Older Mill (31-40)": 72, "Gen X (41-56)": 65, "Boomers (57-75)": 55, "Male": 65, "Female": 72, "Non-Binary": 78, "Low Income": 68, "Middle Income": 72, "Upper Middle": 68, "High Income": 62, "Urban": 72, "Suburban": 68, "Rural": 62, "Early Adopters": 72, "Brand Loyalists": 65, "Price Sensitive": 72, "Eco-Conscious": 78, "Tech Enthusiasts": 68, "Total Population": 68 },
    metadata: { description: "Prioritizes work-life balance over career advancement", source: "GWI Work Q4 2024" }
  },
  {
    id: "val_4",
    metric: "Remote Work - Prefers Full Remote",
    category: "Values",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 52, "Older Mill (31-40)": 48, "Gen X (41-56)": 38, "Boomers (57-75)": 28, "Male": 42, "Female": 45, "Non-Binary": 52, "Low Income": 38, "Middle Income": 42, "Upper Middle": 48, "High Income": 55, "Urban": 48, "Suburban": 45, "Rural": 52, "Early Adopters": 55, "Brand Loyalists": 42, "Price Sensitive": 45, "Eco-Conscious": 52, "Tech Enthusiasts": 58, "Total Population": 42 },
    metadata: { description: "Prefers fully remote work arrangement", source: "GWI Work Q4 2024" }
  },
  {
    id: "val_5",
    metric: "Diversity - Values in Brands",
    category: "Values",
    values: { "Gen Z (18-24)": 72, "Young Mill (25-30)": 65, "Older Mill (31-40)": 55, "Gen X (41-56)": 45, "Boomers (57-75)": 35, "Male": 48, "Female": 58, "Non-Binary": 78, "Low Income": 52, "Middle Income": 52, "Upper Middle": 55, "High Income": 58, "Urban": 62, "Suburban": 52, "Rural": 42, "Early Adopters": 62, "Brand Loyalists": 52, "Price Sensitive": 48, "Eco-Conscious": 72, "Tech Enthusiasts": 58, "Total Population": 52 },
    metadata: { description: "Values diversity and inclusion in brands they support", source: "GWI Zeitgeist Q4 2024" }
  },
  {
    id: "val_6",
    metric: "Experiences Over Things",
    category: "Values",
    values: { "Gen Z (18-24)": 68, "Young Mill (25-30)": 72, "Older Mill (31-40)": 65, "Gen X (41-56)": 55, "Boomers (57-75)": 48, "Male": 58, "Female": 65, "Non-Binary": 72, "Low Income": 52, "Middle Income": 62, "Upper Middle": 68, "High Income": 72, "Urban": 68, "Suburban": 62, "Rural": 52, "Early Adopters": 72, "Brand Loyalists": 58, "Price Sensitive": 52, "Eco-Conscious": 75, "Tech Enthusiasts": 65, "Total Population": 62 },
    metadata: { description: "Prefers spending on experiences over material items", source: "GWI Zeitgeist Q4 2024" }
  },
  {
    id: "val_7",
    metric: "Privacy Concerns - Very Concerned",
    category: "Values",
    values: { "Gen Z (18-24)": 55, "Young Mill (25-30)": 62, "Older Mill (31-40)": 68, "Gen X (41-56)": 72, "Boomers (57-75)": 75, "Male": 65, "Female": 68, "Non-Binary": 72, "Low Income": 62, "Middle Income": 68, "Upper Middle": 68, "High Income": 72, "Urban": 68, "Suburban": 68, "Rural": 65, "Early Adopters": 68, "Brand Loyalists": 65, "Price Sensitive": 65, "Eco-Conscious": 72, "Tech Enthusiasts": 72, "Total Population": 68 },
    metadata: { description: "Very concerned about online privacy", source: "GWI Zeitgeist Q4 2024" }
  },
  {
    id: "val_8",
    metric: "Plant-Based Diet - Follows or Interested",
    category: "Values",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 38, "Older Mill (31-40)": 32, "Gen X (41-56)": 25, "Boomers (57-75)": 18, "Male": 25, "Female": 38, "Non-Binary": 48, "Low Income": 28, "Middle Income": 32, "Upper Middle": 35, "High Income": 38, "Urban": 38, "Suburban": 32, "Rural": 22, "Early Adopters": 42, "Brand Loyalists": 28, "Price Sensitive": 25, "Eco-Conscious": 62, "Tech Enthusiasts": 35, "Total Population": 32 },
    metadata: { description: "Follows or interested in plant-based diet", source: "GWI Health Q4 2024" }
  },
  {
    id: "val_9",
    metric: "Fitness - Exercises 3+ Times Weekly",
    category: "Values",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 58, "Older Mill (31-40)": 52, "Gen X (41-56)": 45, "Boomers (57-75)": 38, "Male": 52, "Female": 48, "Non-Binary": 52, "Low Income": 38, "Middle Income": 48, "Upper Middle": 55, "High Income": 62, "Urban": 55, "Suburban": 52, "Rural": 42, "Early Adopters": 58, "Brand Loyalists": 52, "Price Sensitive": 42, "Eco-Conscious": 58, "Tech Enthusiasts": 55, "Total Population": 48 },
    metadata: { description: "Exercises 3 or more times per week", source: "GWI Health Q4 2024" }
  },
  {
    id: "val_10",
    metric: "News - Consumes Daily",
    category: "Values",
    values: { "Gen Z (18-24)": 48, "Young Mill (25-30)": 55, "Older Mill (31-40)": 62, "Gen X (41-56)": 72, "Boomers (57-75)": 82, "Male": 68, "Female": 62, "Non-Binary": 58, "Low Income": 55, "Middle Income": 62, "Upper Middle": 68, "High Income": 75, "Urban": 68, "Suburban": 65, "Rural": 58, "Early Adopters": 68, "Brand Loyalists": 65, "Price Sensitive": 58, "Eco-Conscious": 72, "Tech Enthusiasts": 68, "Total Population": 62 },
    metadata: { description: "Consumes news content daily", source: "GWI Media Q4 2024" }
  },

  // =========================================================================
  // BRAND PERCEPTIONS (20 metrics)
  // =========================================================================
  {
    id: "brand_1",
    metric: "Apple - Brand Affinity",
    category: "Brand",
    values: { "Gen Z (18-24)": 72, "Young Mill (25-30)": 68, "Older Mill (31-40)": 62, "Gen X (41-56)": 52, "Boomers (57-75)": 42, "Male": 55, "Female": 62, "Non-Binary": 65, "Low Income": 38, "Middle Income": 55, "Upper Middle": 68, "High Income": 82, "Urban": 65, "Suburban": 58, "Rural": 45, "Early Adopters": 78, "Brand Loyalists": 72, "Price Sensitive": 42, "Eco-Conscious": 58, "Tech Enthusiasts": 75, "Total Population": 58 },
    metadata: { description: "Strong affinity for Apple brand", source: "GWI Brand Q4 2024" }
  },
  {
    id: "brand_2",
    metric: "Nike - Brand Affinity",
    category: "Brand",
    values: { "Gen Z (18-24)": 68, "Young Mill (25-30)": 65, "Older Mill (31-40)": 58, "Gen X (41-56)": 48, "Boomers (57-75)": 38, "Male": 58, "Female": 55, "Non-Binary": 62, "Low Income": 48, "Middle Income": 55, "Upper Middle": 62, "High Income": 68, "Urban": 62, "Suburban": 55, "Rural": 48, "Early Adopters": 65, "Brand Loyalists": 62, "Price Sensitive": 45, "Eco-Conscious": 52, "Tech Enthusiasts": 58, "Total Population": 55 },
    metadata: { description: "Strong affinity for Nike brand", source: "GWI Brand Q4 2024" }
  },
  {
    id: "brand_3",
    metric: "Tesla - Brand Consideration",
    category: "Brand",
    values: { "Gen Z (18-24)": 45, "Young Mill (25-30)": 52, "Older Mill (31-40)": 48, "Gen X (41-56)": 38, "Boomers (57-75)": 25, "Male": 52, "Female": 32, "Non-Binary": 45, "Low Income": 22, "Middle Income": 38, "Upper Middle": 52, "High Income": 68, "Urban": 52, "Suburban": 45, "Rural": 28, "Early Adopters": 65, "Brand Loyalists": 48, "Price Sensitive": 28, "Eco-Conscious": 62, "Tech Enthusiasts": 68, "Total Population": 42 },
    metadata: { description: "Would consider purchasing Tesla", source: "GWI Auto Q4 2024" }
  },
  {
    id: "brand_4",
    metric: "Amazon - Trust Rating",
    category: "Brand",
    values: { "Gen Z (18-24)": 62, "Young Mill (25-30)": 68, "Older Mill (31-40)": 72, "Gen X (41-56)": 68, "Boomers (57-75)": 65, "Male": 68, "Female": 68, "Non-Binary": 62, "Low Income": 62, "Middle Income": 68, "Upper Middle": 72, "High Income": 75, "Urban": 68, "Suburban": 72, "Rural": 62, "Early Adopters": 72, "Brand Loyalists": 75, "Price Sensitive": 72, "Eco-Conscious": 52, "Tech Enthusiasts": 72, "Total Population": 68 },
    metadata: { description: "High trust rating for Amazon", source: "GWI Brand Q4 2024" }
  },
  {
    id: "brand_5",
    metric: "Patagonia - Brand Affinity",
    category: "Brand",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 48, "Older Mill (31-40)": 45, "Gen X (41-56)": 38, "Boomers (57-75)": 28, "Male": 38, "Female": 45, "Non-Binary": 52, "Low Income": 25, "Middle Income": 38, "Upper Middle": 52, "High Income": 62, "Urban": 48, "Suburban": 42, "Rural": 32, "Early Adopters": 52, "Brand Loyalists": 48, "Price Sensitive": 22, "Eco-Conscious": 78, "Tech Enthusiasts": 42, "Total Population": 42 },
    metadata: { description: "Strong affinity for Patagonia brand", source: "GWI Brand Q4 2024" }
  },

  // =========================================================================
  // MEDIA CONSUMPTION (15 metrics)
  // =========================================================================
  {
    id: "media_1",
    metric: "Ad-Free Streaming - Prefers Paying",
    category: "Media",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 58, "Older Mill (31-40)": 55, "Gen X (41-56)": 48, "Boomers (57-75)": 42, "Male": 52, "Female": 52, "Non-Binary": 55, "Low Income": 32, "Middle Income": 48, "Upper Middle": 62, "High Income": 78, "Urban": 58, "Suburban": 52, "Rural": 42, "Early Adopters": 68, "Brand Loyalists": 55, "Price Sensitive": 28, "Eco-Conscious": 52, "Tech Enthusiasts": 65, "Total Population": 52 },
    metadata: { description: "Prefers paying for ad-free streaming experience", source: "GWI Media Q4 2024" }
  },
  {
    id: "media_2",
    metric: "Influencer Content - Trusts Recommendations",
    category: "Media",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 48, "Older Mill (31-40)": 35, "Gen X (41-56)": 22, "Boomers (57-75)": 12, "Male": 32, "Female": 42, "Non-Binary": 48, "Low Income": 35, "Middle Income": 38, "Upper Middle": 38, "High Income": 35, "Urban": 42, "Suburban": 35, "Rural": 28, "Early Adopters": 52, "Brand Loyalists": 38, "Price Sensitive": 42, "Eco-Conscious": 42, "Tech Enthusiasts": 48, "Total Population": 35 },
    metadata: { description: "Trusts influencer product recommendations", source: "GWI Media Q4 2024" }
  },
  {
    id: "media_3",
    metric: "Newsletter - Subscribed to 3+",
    category: "Media",
    values: { "Gen Z (18-24)": 28, "Young Mill (25-30)": 42, "Older Mill (31-40)": 48, "Gen X (41-56)": 45, "Boomers (57-75)": 38, "Male": 42, "Female": 42, "Non-Binary": 45, "Low Income": 32, "Middle Income": 42, "Upper Middle": 48, "High Income": 55, "Urban": 48, "Suburban": 42, "Rural": 35, "Early Adopters": 55, "Brand Loyalists": 48, "Price Sensitive": 38, "Eco-Conscious": 52, "Tech Enthusiasts": 52, "Total Population": 42 },
    metadata: { description: "Subscribed to 3+ email newsletters", source: "GWI Media Q4 2024" }
  },
  {
    id: "media_4",
    metric: "Second Screen - Uses While Watching TV",
    category: "Media",
    values: { "Gen Z (18-24)": 82, "Young Mill (25-30)": 78, "Older Mill (31-40)": 72, "Gen X (41-56)": 58, "Boomers (57-75)": 42, "Male": 65, "Female": 68, "Non-Binary": 72, "Low Income": 62, "Middle Income": 68, "Upper Middle": 68, "High Income": 72, "Urban": 72, "Suburban": 68, "Rural": 58, "Early Adopters": 78, "Brand Loyalists": 65, "Price Sensitive": 68, "Eco-Conscious": 68, "Tech Enthusiasts": 82, "Total Population": 65 },
    metadata: { description: "Uses second screen device while watching TV", source: "GWI Media Q4 2024" }
  },
  {
    id: "media_5",
    metric: "Ad Blocker - Active User",
    category: "Media",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 55, "Older Mill (31-40)": 48, "Gen X (41-56)": 38, "Boomers (57-75)": 22, "Male": 52, "Female": 38, "Non-Binary": 55, "Low Income": 42, "Middle Income": 45, "Upper Middle": 48, "High Income": 52, "Urban": 52, "Suburban": 45, "Rural": 35, "Early Adopters": 62, "Brand Loyalists": 42, "Price Sensitive": 52, "Eco-Conscious": 48, "Tech Enthusiasts": 68, "Total Population": 45 },
    metadata: { description: "Uses ad blocker on browser or apps", source: "GWI Media Q4 2024" }
  },

  // =========================================================================
  // TRAVEL & EXPERIENCES (10 metrics)
  // =========================================================================
  {
    id: "travel_1",
    metric: "International Travel - Past 12 Months",
    category: "Travel",
    values: { "Gen Z (18-24)": 35, "Young Mill (25-30)": 45, "Older Mill (31-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 35, "Male": 42, "Female": 42, "Non-Binary": 45, "Low Income": 18, "Middle Income": 35, "Upper Middle": 52, "High Income": 72, "Urban": 52, "Suburban": 42, "Rural": 28, "Early Adopters": 55, "Brand Loyalists": 45, "Price Sensitive": 28, "Eco-Conscious": 38, "Tech Enthusiasts": 52, "Total Population": 42 },
    metadata: { description: "Traveled internationally in past 12 months", source: "GWI Travel Q4 2024" }
  },
  {
    id: "travel_2",
    metric: "Airbnb - Prefers Over Hotels",
    category: "Travel",
    values: { "Gen Z (18-24)": 52, "Young Mill (25-30)": 58, "Older Mill (31-40)": 52, "Gen X (41-56)": 38, "Boomers (57-75)": 22, "Male": 42, "Female": 48, "Non-Binary": 55, "Low Income": 42, "Middle Income": 48, "Upper Middle": 52, "High Income": 55, "Urban": 55, "Suburban": 48, "Rural": 35, "Early Adopters": 62, "Brand Loyalists": 42, "Price Sensitive": 55, "Eco-Conscious": 52, "Tech Enthusiasts": 58, "Total Population": 45 },
    metadata: { description: "Prefers Airbnb over traditional hotels", source: "GWI Travel Q4 2024" }
  },
  {
    id: "travel_3",
    metric: "Sustainable Travel - Willing to Pay More",
    category: "Travel",
    values: { "Gen Z (18-24)": 48, "Young Mill (25-30)": 52, "Older Mill (31-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 35, "Male": 42, "Female": 48, "Non-Binary": 58, "Low Income": 32, "Middle Income": 45, "Upper Middle": 52, "High Income": 62, "Urban": 52, "Suburban": 48, "Rural": 38, "Early Adopters": 55, "Brand Loyalists": 48, "Price Sensitive": 28, "Eco-Conscious": 78, "Tech Enthusiasts": 48, "Total Population": 45 },
    metadata: { description: "Willing to pay more for sustainable travel options", source: "GWI Travel Q4 2024" }
  },
  {
    id: "travel_4",
    metric: "Staycation - Prefers Local",
    category: "Travel",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 45, "Older Mill (31-40)": 52, "Gen X (41-56)": 55, "Boomers (57-75)": 58, "Male": 48, "Female": 52, "Non-Binary": 48, "Low Income": 62, "Middle Income": 55, "Upper Middle": 48, "High Income": 42, "Urban": 48, "Suburban": 52, "Rural": 58, "Early Adopters": 42, "Brand Loyalists": 52, "Price Sensitive": 65, "Eco-Conscious": 58, "Tech Enthusiasts": 45, "Total Population": 52 },
    metadata: { description: "Prefers staycations or local travel", source: "GWI Travel Q4 2024" }
  },
  {
    id: "travel_5",
    metric: "Business Travel - Frequent Traveler",
    category: "Travel",
    values: { "Gen Z (18-24)": 12, "Young Mill (25-30)": 28, "Older Mill (31-40)": 35, "Gen X (41-56)": 32, "Boomers (57-75)": 18, "Male": 32, "Female": 22, "Non-Binary": 25, "Low Income": 8, "Middle Income": 22, "Upper Middle": 38, "High Income": 52, "Urban": 35, "Suburban": 25, "Rural": 15, "Early Adopters": 38, "Brand Loyalists": 28, "Price Sensitive": 18, "Eco-Conscious": 22, "Tech Enthusiasts": 35, "Total Population": 25 },
    metadata: { description: "Travels for business 5+ times per year", source: "GWI Work Q4 2024" }
  },

  // =========================================================================
  // FOOD & DINING (10 metrics)
  // =========================================================================
  {
    id: "food_1",
    metric: "Food Delivery Apps - Weekly User",
    category: "Food & Dining",
    values: { "Gen Z (18-24)": 58, "Young Mill (25-30)": 62, "Older Mill (31-40)": 52, "Gen X (41-56)": 38, "Boomers (57-75)": 22, "Male": 45, "Female": 48, "Non-Binary": 52, "Low Income": 35, "Middle Income": 48, "Upper Middle": 55, "High Income": 62, "Urban": 62, "Suburban": 45, "Rural": 25, "Early Adopters": 65, "Brand Loyalists": 48, "Price Sensitive": 38, "Eco-Conscious": 42, "Tech Enthusiasts": 62, "Total Population": 45 },
    metadata: { description: "Uses food delivery apps weekly (DoorDash, Uber Eats)", source: "GWI Consumer Q4 2024" }
  },
  {
    id: "food_2",
    metric: "Meal Kit Subscription - Active User",
    category: "Food & Dining",
    values: { "Gen Z (18-24)": 22, "Young Mill (25-30)": 32, "Older Mill (31-40)": 35, "Gen X (41-56)": 28, "Boomers (57-75)": 15, "Male": 25, "Female": 32, "Non-Binary": 28, "Low Income": 12, "Middle Income": 25, "Upper Middle": 38, "High Income": 48, "Urban": 35, "Suburban": 32, "Rural": 18, "Early Adopters": 42, "Brand Loyalists": 35, "Price Sensitive": 15, "Eco-Conscious": 38, "Tech Enthusiasts": 38, "Total Population": 28 },
    metadata: { description: "Active meal kit subscription (HelloFresh, Blue Apron)", source: "GWI Consumer Q4 2024" }
  },
  {
    id: "food_3",
    metric: "Plant-Based Alternatives - Regular Consumer",
    category: "Food & Dining",
    values: { "Gen Z (18-24)": 38, "Young Mill (25-30)": 42, "Older Mill (31-40)": 35, "Gen X (41-56)": 25, "Boomers (57-75)": 18, "Male": 25, "Female": 38, "Non-Binary": 52, "Low Income": 25, "Middle Income": 32, "Upper Middle": 38, "High Income": 42, "Urban": 42, "Suburban": 32, "Rural": 22, "Early Adopters": 45, "Brand Loyalists": 32, "Price Sensitive": 22, "Eco-Conscious": 68, "Tech Enthusiasts": 38, "Total Population": 32 },
    metadata: { description: "Regularly consumes plant-based meat alternatives", source: "GWI Consumer Q4 2024" }
  },
  {
    id: "food_4",
    metric: "Coffee Shop - Daily Visitor",
    category: "Food & Dining",
    values: { "Gen Z (18-24)": 35, "Young Mill (25-30)": 42, "Older Mill (31-40)": 38, "Gen X (41-56)": 32, "Boomers (57-75)": 25, "Male": 32, "Female": 38, "Non-Binary": 42, "Low Income": 22, "Middle Income": 35, "Upper Middle": 42, "High Income": 52, "Urban": 48, "Suburban": 35, "Rural": 22, "Early Adopters": 45, "Brand Loyalists": 48, "Price Sensitive": 22, "Eco-Conscious": 38, "Tech Enthusiasts": 42, "Total Population": 35 },
    metadata: { description: "Visits coffee shop daily", source: "GWI Consumer Q4 2024" }
  },
  {
    id: "food_5",
    metric: "Organic Food - Regular Purchaser",
    category: "Food & Dining",
    values: { "Gen Z (18-24)": 38, "Young Mill (25-30)": 45, "Older Mill (31-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 35, "Male": 38, "Female": 48, "Non-Binary": 52, "Low Income": 25, "Middle Income": 42, "Upper Middle": 55, "High Income": 68, "Urban": 52, "Suburban": 45, "Rural": 35, "Early Adopters": 52, "Brand Loyalists": 48, "Price Sensitive": 25, "Eco-Conscious": 78, "Tech Enthusiasts": 45, "Total Population": 42 },
    metadata: { description: "Regularly purchases organic food products", source: "GWI Consumer Q4 2024" }
  },

  // =========================================================================
  // HEALTH & FITNESS (10 metrics)
  // =========================================================================
  {
    id: "health_1",
    metric: "Fitness App - Daily User",
    category: "Health",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 48, "Older Mill (31-40)": 45, "Gen X (41-56)": 35, "Boomers (57-75)": 22, "Male": 42, "Female": 42, "Non-Binary": 45, "Low Income": 32, "Middle Income": 42, "Upper Middle": 48, "High Income": 55, "Urban": 48, "Suburban": 42, "Rural": 32, "Early Adopters": 55, "Brand Loyalists": 45, "Price Sensitive": 35, "Eco-Conscious": 52, "Tech Enthusiasts": 58, "Total Population": 42 },
    metadata: { description: "Uses fitness/workout app daily", source: "GWI Health Q4 2024" }
  },
  {
    id: "health_2",
    metric: "Gym Membership - Active Member",
    category: "Health",
    values: { "Gen Z (18-24)": 38, "Young Mill (25-30)": 45, "Older Mill (31-40)": 42, "Gen X (41-56)": 32, "Boomers (57-75)": 22, "Male": 42, "Female": 35, "Non-Binary": 38, "Low Income": 22, "Middle Income": 38, "Upper Middle": 48, "High Income": 58, "Urban": 45, "Suburban": 42, "Rural": 28, "Early Adopters": 48, "Brand Loyalists": 45, "Price Sensitive": 28, "Eco-Conscious": 45, "Tech Enthusiasts": 45, "Total Population": 38 },
    metadata: { description: "Has active gym membership", source: "GWI Health Q4 2024" }
  },
  {
    id: "health_3",
    metric: "Mental Health App - Uses Regularly",
    category: "Health",
    values: { "Gen Z (18-24)": 35, "Young Mill (25-30)": 38, "Older Mill (31-40)": 32, "Gen X (41-56)": 22, "Boomers (57-75)": 12, "Male": 22, "Female": 35, "Non-Binary": 45, "Low Income": 28, "Middle Income": 28, "Upper Middle": 32, "High Income": 35, "Urban": 35, "Suburban": 28, "Rural": 22, "Early Adopters": 42, "Brand Loyalists": 28, "Price Sensitive": 25, "Eco-Conscious": 42, "Tech Enthusiasts": 38, "Total Population": 28 },
    metadata: { description: "Uses mental health/meditation app regularly", source: "GWI Health Q4 2024" }
  },
  {
    id: "health_4",
    metric: "Sleep Tracking - Uses Device/App",
    category: "Health",
    values: { "Gen Z (18-24)": 32, "Young Mill (25-30)": 42, "Older Mill (31-40)": 38, "Gen X (41-56)": 28, "Boomers (57-75)": 18, "Male": 35, "Female": 32, "Non-Binary": 38, "Low Income": 22, "Middle Income": 32, "Upper Middle": 42, "High Income": 52, "Urban": 38, "Suburban": 35, "Rural": 25, "Early Adopters": 55, "Brand Loyalists": 38, "Price Sensitive": 25, "Eco-Conscious": 38, "Tech Enthusiasts": 58, "Total Population": 32 },
    metadata: { description: "Uses sleep tracking device or app", source: "GWI Health Q4 2024" }
  },
  {
    id: "health_5",
    metric: "Telehealth - Used in Past Year",
    category: "Health",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 52, "Older Mill (31-40)": 55, "Gen X (41-56)": 48, "Boomers (57-75)": 38, "Male": 42, "Female": 52, "Non-Binary": 55, "Low Income": 42, "Middle Income": 48, "Upper Middle": 52, "High Income": 55, "Urban": 55, "Suburban": 48, "Rural": 42, "Early Adopters": 62, "Brand Loyalists": 48, "Price Sensitive": 48, "Eco-Conscious": 52, "Tech Enthusiasts": 58, "Total Population": 48 },
    metadata: { description: "Used telehealth/virtual doctor visit in past year", source: "GWI Health Q4 2024" }
  },

  // =========================================================================
  // AUTOMOTIVE & TRANSPORTATION (8 metrics)
  // =========================================================================
  {
    id: "auto_1",
    metric: "Ride-Sharing - Weekly User",
    category: "Automotive",
    values: { "Gen Z (18-24)": 42, "Young Mill (25-30)": 48, "Older Mill (31-40)": 38, "Gen X (41-56)": 25, "Boomers (57-75)": 12, "Male": 35, "Female": 38, "Non-Binary": 42, "Low Income": 28, "Middle Income": 35, "Upper Middle": 42, "High Income": 52, "Urban": 58, "Suburban": 28, "Rural": 8, "Early Adopters": 52, "Brand Loyalists": 35, "Price Sensitive": 38, "Eco-Conscious": 45, "Tech Enthusiasts": 52, "Total Population": 35 },
    metadata: { description: "Uses ride-sharing services weekly (Uber, Lyft)", source: "GWI Auto Q4 2024" }
  },
  {
    id: "auto_2",
    metric: "Car Subscription/Rental - Interested",
    category: "Automotive",
    values: { "Gen Z (18-24)": 32, "Young Mill (25-30)": 35, "Older Mill (31-40)": 28, "Gen X (41-56)": 18, "Boomers (57-75)": 8, "Male": 28, "Female": 22, "Non-Binary": 32, "Low Income": 28, "Middle Income": 25, "Upper Middle": 28, "High Income": 32, "Urban": 35, "Suburban": 22, "Rural": 12, "Early Adopters": 42, "Brand Loyalists": 22, "Price Sensitive": 32, "Eco-Conscious": 35, "Tech Enthusiasts": 38, "Total Population": 25 },
    metadata: { description: "Interested in car subscription services", source: "GWI Auto Q4 2024" }
  },
  {
    id: "auto_3",
    metric: "Public Transit - Regular User",
    category: "Automotive",
    values: { "Gen Z (18-24)": 38, "Young Mill (25-30)": 42, "Older Mill (31-40)": 35, "Gen X (41-56)": 28, "Boomers (57-75)": 22, "Male": 32, "Female": 35, "Non-Binary": 42, "Low Income": 48, "Middle Income": 35, "Upper Middle": 28, "High Income": 22, "Urban": 62, "Suburban": 22, "Rural": 5, "Early Adopters": 38, "Brand Loyalists": 28, "Price Sensitive": 48, "Eco-Conscious": 55, "Tech Enthusiasts": 35, "Total Population": 32 },
    metadata: { description: "Uses public transportation regularly", source: "GWI Auto Q4 2024" }
  },
]

// =============================================================================
// FILTER FIELDS for the comprehensive data
// =============================================================================

export const COMPREHENSIVE_FILTER_FIELDS = [
  { id: "metric", name: "metric", label: "Metric Name", type: "text" as const, category: "Dimensions" },
  { id: "category", name: "category", label: "Category", type: "select" as const, category: "Dimensions", options: [
    { value: "Social Media", label: "Social Media" },
    { value: "E-commerce", label: "E-commerce" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "Technology", label: "Technology" },
    { value: "Finance", label: "Finance" },
    { value: "Values", label: "Values & Lifestyle" },
    { value: "Brand", label: "Brand Perceptions" },
    { value: "Media", label: "Media Consumption" },
    { value: "Travel", label: "Travel & Experiences" },
    { value: "Food & Dining", label: "Food & Dining" },
    { value: "Health", label: "Health & Fitness" },
    { value: "Automotive", label: "Automotive & Transportation" },
  ]},
  { id: "value", name: "value", label: "Value", type: "number" as const, category: "Metrics", min: 0, max: 100 },
]

// =============================================================================
// CALCULATED FIELD VARIABLES
// =============================================================================

export const COMPREHENSIVE_VARIABLES = [
  // Generational variables
  { id: "genz", name: "Gen_Z", label: "Gen Z (18-24)", type: "audience" as const, value: 65 },
  { id: "mill_young", name: "Young_Millennials", label: "Young Millennials (25-30)", type: "audience" as const, value: 58 },
  { id: "mill_old", name: "Older_Millennials", label: "Older Millennials (31-40)", type: "audience" as const, value: 52 },
  { id: "genx", name: "Gen_X", label: "Gen X (41-56)", type: "audience" as const, value: 45 },
  { id: "boom", name: "Boomers", label: "Boomers (57-75)", type: "audience" as const, value: 35 },

  // Behavioral variables
  { id: "early", name: "Early_Adopters", label: "Early Adopters", type: "audience" as const, value: 72 },
  { id: "eco", name: "Eco_Conscious", label: "Eco-Conscious", type: "audience" as const, value: 58 },
  { id: "tech", name: "Tech_Enthusiasts", label: "Tech Enthusiasts", type: "audience" as const, value: 68 },

  // Constants
  { id: "total", name: "Total_Sample", label: "Total Sample", type: "constant" as const, value: 25000 },
  { id: "base", name: "Base_Index", label: "Base Index", type: "constant" as const, value: 100 },
  { id: "confidence", name: "Confidence_Level", label: "Confidence Level", type: "constant" as const, value: 95 },
]

// =============================================================================
// SUMMARY STATISTICS
// =============================================================================

export const DATA_SUMMARY = {
  totalMetrics: COMPREHENSIVE_DATA.length,
  totalAudiences: COMPREHENSIVE_COLUMNS.length,
  categories: [...new Set(COMPREHENSIVE_DATA.map(d => d.category))],
  audienceCategories: [...new Set(COMPREHENSIVE_COLUMNS.map(c => c.category))],
}
