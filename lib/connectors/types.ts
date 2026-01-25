/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { z } from 'zod'

/**
 * Supported data connector providers
 */
export const ConnectorProvider = {
  // Analytics
  GOOGLE_ANALYTICS: 'google_analytics',
  ADOBE_ANALYTICS: 'adobe_analytics',
  MIXPANEL: 'mixpanel',
  AMPLITUDE: 'amplitude',

  // CRM
  SALESFORCE: 'salesforce',
  HUBSPOT: 'hubspot',
  ZOHO_CRM: 'zoho_crm',
  PIPEDRIVE: 'pipedrive',

  // Social
  FACEBOOK_ADS: 'facebook_ads',
  GOOGLE_ADS: 'google_ads',
  LINKEDIN_ADS: 'linkedin_ads',
  TWITTER_ADS: 'twitter_ads',
  TIKTOK_ADS: 'tiktok_ads',

  // Advertising
  DV360: 'dv360',
  TRADE_DESK: 'trade_desk',
  AMAZON_ADS: 'amazon_ads',

  // Data Warehouses
  SNOWFLAKE: 'snowflake',
  BIGQUERY: 'bigquery',
  REDSHIFT: 'redshift',
  DATABRICKS: 'databricks',

  // Databases
  POSTGRESQL: 'postgresql',
  MYSQL: 'mysql',
  MONGODB: 'mongodb',

  // Files & Storage
  AWS_S3: 'aws_s3',
  GOOGLE_CLOUD_STORAGE: 'google_cloud_storage',
  AZURE_BLOB: 'azure_blob',
  SFTP: 'sftp',

  // Marketing
  MAILCHIMP: 'mailchimp',
  KLAVIYO: 'klaviyo',
  BRAZE: 'braze',

  // Survey
  QUALTRICS: 'qualtrics',
  SURVEY_MONKEY: 'survey_monkey',
  TYPEFORM: 'typeform',
} as const

export type ConnectorProviderType = typeof ConnectorProvider[keyof typeof ConnectorProvider]

/**
 * Connector type categories - Must match Prisma DataConnectorType enum
 */
export const ConnectorType = {
  ANALYTICS: 'ANALYTICS',
  CRM: 'CRM',
  SOCIAL: 'SOCIAL',
  ADVERTISING: 'ADVERTISING',
  DATABASE: 'DATABASE',
  FILE: 'FILE',
  API: 'API',
} as const

export type ConnectorTypeValue = typeof ConnectorType[keyof typeof ConnectorType]

/**
 * Connector provider metadata
 */
export interface ConnectorProviderConfig {
  id: ConnectorProviderType
  name: string
  description: string
  type: ConnectorTypeValue
  icon: string
  authType: 'oauth' | 'api_key' | 'credentials' | 'connection_string'
  configSchema: z.ZodObject<any>
  credentialsSchema: z.ZodObject<any>
  popular?: boolean
  comingSoon?: boolean
}

// Base configuration schemas
const oauthCredentialsSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenExpiry: z.string().datetime().optional(),
  scope: z.string().optional(),
})

const apiKeyCredentialsSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().optional(),
})

const databaseCredentialsSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().min(1).max(65535),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  ssl: z.boolean().default(true),
})

const cloudStorageCredentialsSchema = z.object({
  accessKeyId: z.string().min(1, 'Access Key ID is required'),
  secretAccessKey: z.string().min(1, 'Secret Access Key is required'),
  region: z.string().optional(),
})

// Connector provider configurations
export const CONNECTOR_PROVIDERS: Record<ConnectorProviderType, ConnectorProviderConfig> = {
  // Analytics
  [ConnectorProvider.GOOGLE_ANALYTICS]: {
    id: ConnectorProvider.GOOGLE_ANALYTICS,
    name: 'Google Analytics',
    description: 'Import web analytics data from Google Analytics 4',
    type: ConnectorType.ANALYTICS,
    icon: '/connectors/google-analytics.svg',
    authType: 'oauth',
    configSchema: z.object({
      propertyId: z.string().min(1, 'Property ID is required'),
      dataStreams: z.array(z.string()).optional(),
    }),
    credentialsSchema: oauthCredentialsSchema,
    popular: true,
  },
  [ConnectorProvider.ADOBE_ANALYTICS]: {
    id: ConnectorProvider.ADOBE_ANALYTICS,
    name: 'Adobe Analytics',
    description: 'Connect to Adobe Analytics for enterprise analytics data',
    type: ConnectorType.ANALYTICS,
    icon: '/connectors/adobe-analytics.svg',
    authType: 'api_key',
    configSchema: z.object({
      companyId: z.string().min(1, 'Company ID is required'),
      reportSuiteId: z.string().min(1, 'Report Suite ID is required'),
    }),
    credentialsSchema: apiKeyCredentialsSchema.extend({
      clientId: z.string().min(1, 'Client ID is required'),
      clientSecret: z.string().min(1, 'Client Secret is required'),
    }),
  },
  [ConnectorProvider.MIXPANEL]: {
    id: ConnectorProvider.MIXPANEL,
    name: 'Mixpanel',
    description: 'Product analytics and user behavior data from Mixpanel',
    type: ConnectorType.ANALYTICS,
    icon: '/connectors/mixpanel.svg',
    authType: 'api_key',
    configSchema: z.object({
      projectId: z.string().min(1, 'Project ID is required'),
    }),
    credentialsSchema: apiKeyCredentialsSchema,
    popular: true,
  },
  [ConnectorProvider.AMPLITUDE]: {
    id: ConnectorProvider.AMPLITUDE,
    name: 'Amplitude',
    description: 'Product intelligence and analytics from Amplitude',
    type: ConnectorType.ANALYTICS,
    icon: '/connectors/amplitude.svg',
    authType: 'api_key',
    configSchema: z.object({
      projectId: z.string().min(1, 'Project ID is required'),
    }),
    credentialsSchema: apiKeyCredentialsSchema,
  },

  // CRM
  [ConnectorProvider.SALESFORCE]: {
    id: ConnectorProvider.SALESFORCE,
    name: 'Salesforce',
    description: 'Sync CRM data and customer insights from Salesforce',
    type: ConnectorType.CRM,
    icon: '/connectors/salesforce.svg',
    authType: 'oauth',
    configSchema: z.object({
      instanceUrl: z.string().url('Valid Salesforce instance URL required'),
      objects: z.array(z.string()).optional(),
    }),
    credentialsSchema: oauthCredentialsSchema,
    popular: true,
  },
  [ConnectorProvider.HUBSPOT]: {
    id: ConnectorProvider.HUBSPOT,
    name: 'HubSpot',
    description: 'Marketing, sales, and CRM data from HubSpot',
    type: ConnectorType.CRM,
    icon: '/connectors/hubspot.svg',
    authType: 'oauth',
    configSchema: z.object({
      portalId: z.string().optional(),
      objects: z.array(z.string()).optional(),
    }),
    credentialsSchema: oauthCredentialsSchema,
    popular: true,
  },
  [ConnectorProvider.ZOHO_CRM]: {
    id: ConnectorProvider.ZOHO_CRM,
    name: 'Zoho CRM',
    description: 'CRM and sales data from Zoho',
    type: ConnectorType.CRM,
    icon: '/connectors/zoho.svg',
    authType: 'oauth',
    configSchema: z.object({
      modules: z.array(z.string()).optional(),
    }),
    credentialsSchema: oauthCredentialsSchema,
  },
  [ConnectorProvider.PIPEDRIVE]: {
    id: ConnectorProvider.PIPEDRIVE,
    name: 'Pipedrive',
    description: 'Sales pipeline and deal data from Pipedrive',
    type: ConnectorType.CRM,
    icon: '/connectors/pipedrive.svg',
    authType: 'api_key',
    configSchema: z.object({
      companyDomain: z.string().optional(),
    }),
    credentialsSchema: apiKeyCredentialsSchema,
  },

  // Social & Advertising
  [ConnectorProvider.FACEBOOK_ADS]: {
    id: ConnectorProvider.FACEBOOK_ADS,
    name: 'Meta Ads',
    description: 'Facebook and Instagram advertising data',
    type: ConnectorType.ADVERTISING,
    icon: '/connectors/meta.svg',
    authType: 'oauth',
    configSchema: z.object({
      adAccountId: z.string().min(1, 'Ad Account ID is required'),
    }),
    credentialsSchema: oauthCredentialsSchema,
    popular: true,
  },
  [ConnectorProvider.GOOGLE_ADS]: {
    id: ConnectorProvider.GOOGLE_ADS,
    name: 'Google Ads',
    description: 'Google advertising campaign data and performance metrics',
    type: ConnectorType.ADVERTISING,
    icon: '/connectors/google-ads.svg',
    authType: 'oauth',
    configSchema: z.object({
      customerId: z.string().min(1, 'Customer ID is required'),
      managerId: z.string().optional(),
    }),
    credentialsSchema: oauthCredentialsSchema,
    popular: true,
  },
  [ConnectorProvider.LINKEDIN_ADS]: {
    id: ConnectorProvider.LINKEDIN_ADS,
    name: 'LinkedIn Ads',
    description: 'LinkedIn advertising and campaign analytics',
    type: ConnectorType.ADVERTISING,
    icon: '/connectors/linkedin.svg',
    authType: 'oauth',
    configSchema: z.object({
      adAccountId: z.string().min(1, 'Ad Account ID is required'),
    }),
    credentialsSchema: oauthCredentialsSchema,
  },
  [ConnectorProvider.TWITTER_ADS]: {
    id: ConnectorProvider.TWITTER_ADS,
    name: 'X/Twitter Ads',
    description: 'Twitter/X advertising campaign data',
    type: ConnectorType.ADVERTISING,
    icon: '/connectors/x.svg',
    authType: 'oauth',
    configSchema: z.object({
      adAccountId: z.string().min(1, 'Ad Account ID is required'),
    }),
    credentialsSchema: oauthCredentialsSchema,
  },
  [ConnectorProvider.TIKTOK_ADS]: {
    id: ConnectorProvider.TIKTOK_ADS,
    name: 'TikTok Ads',
    description: 'TikTok advertising and campaign performance',
    type: ConnectorType.ADVERTISING,
    icon: '/connectors/tiktok.svg',
    authType: 'oauth',
    configSchema: z.object({
      advertiserId: z.string().min(1, 'Advertiser ID is required'),
    }),
    credentialsSchema: oauthCredentialsSchema,
  },
  [ConnectorProvider.DV360]: {
    id: ConnectorProvider.DV360,
    name: 'Display & Video 360',
    description: 'Programmatic advertising from Google DV360',
    type: ConnectorType.ADVERTISING,
    icon: '/connectors/dv360.svg',
    authType: 'oauth',
    configSchema: z.object({
      partnerId: z.string().min(1, 'Partner ID is required'),
      advertiserId: z.string().optional(),
    }),
    credentialsSchema: oauthCredentialsSchema,
  },
  [ConnectorProvider.TRADE_DESK]: {
    id: ConnectorProvider.TRADE_DESK,
    name: 'The Trade Desk',
    description: 'DSP data from The Trade Desk',
    type: ConnectorType.ADVERTISING,
    icon: '/connectors/trade-desk.svg',
    authType: 'api_key',
    configSchema: z.object({
      partnerId: z.string().min(1, 'Partner ID is required'),
    }),
    credentialsSchema: apiKeyCredentialsSchema,
  },
  [ConnectorProvider.AMAZON_ADS]: {
    id: ConnectorProvider.AMAZON_ADS,
    name: 'Amazon Ads',
    description: 'Amazon advertising and retail data',
    type: ConnectorType.ADVERTISING,
    icon: '/connectors/amazon.svg',
    authType: 'oauth',
    configSchema: z.object({
      profileId: z.string().min(1, 'Profile ID is required'),
    }),
    credentialsSchema: oauthCredentialsSchema,
  },

  // Data Warehouses
  [ConnectorProvider.SNOWFLAKE]: {
    id: ConnectorProvider.SNOWFLAKE,
    name: 'Snowflake',
    description: 'Connect to your Snowflake data warehouse',
    type: ConnectorType.DATABASE,
    icon: '/connectors/snowflake.svg',
    authType: 'credentials',
    configSchema: z.object({
      account: z.string().min(1, 'Account identifier is required'),
      warehouse: z.string().min(1, 'Warehouse is required'),
      database: z.string().min(1, 'Database is required'),
      schema: z.string().default('PUBLIC'),
    }),
    credentialsSchema: z.object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required'),
    }),
    popular: true,
  },
  [ConnectorProvider.BIGQUERY]: {
    id: ConnectorProvider.BIGQUERY,
    name: 'Google BigQuery',
    description: 'Query data from Google BigQuery',
    type: ConnectorType.DATABASE,
    icon: '/connectors/bigquery.svg',
    authType: 'oauth',
    configSchema: z.object({
      projectId: z.string().min(1, 'Project ID is required'),
      dataset: z.string().optional(),
    }),
    credentialsSchema: oauthCredentialsSchema.extend({
      serviceAccountKey: z.string().optional(),
    }),
    popular: true,
  },
  [ConnectorProvider.REDSHIFT]: {
    id: ConnectorProvider.REDSHIFT,
    name: 'Amazon Redshift',
    description: 'Connect to Amazon Redshift data warehouse',
    type: ConnectorType.DATABASE,
    icon: '/connectors/redshift.svg',
    authType: 'credentials',
    configSchema: z.object({
      clusterIdentifier: z.string().min(1, 'Cluster identifier is required'),
      database: z.string().min(1, 'Database is required'),
    }),
    credentialsSchema: databaseCredentialsSchema.omit({ database: true }),
  },
  [ConnectorProvider.DATABRICKS]: {
    id: ConnectorProvider.DATABRICKS,
    name: 'Databricks',
    description: 'Connect to Databricks lakehouse platform',
    type: ConnectorType.DATABASE,
    icon: '/connectors/databricks.svg',
    authType: 'api_key',
    configSchema: z.object({
      workspaceUrl: z.string().url('Valid workspace URL required'),
      httpPath: z.string().min(1, 'HTTP path is required'),
    }),
    credentialsSchema: z.object({
      accessToken: z.string().min(1, 'Access token is required'),
    }),
  },

  // Databases
  [ConnectorProvider.POSTGRESQL]: {
    id: ConnectorProvider.POSTGRESQL,
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases',
    type: ConnectorType.DATABASE,
    icon: '/connectors/postgresql.svg',
    authType: 'credentials',
    configSchema: z.object({
      schema: z.string().default('public'),
    }),
    credentialsSchema: databaseCredentialsSchema,
  },
  [ConnectorProvider.MYSQL]: {
    id: ConnectorProvider.MYSQL,
    name: 'MySQL',
    description: 'Connect to MySQL databases',
    type: ConnectorType.DATABASE,
    icon: '/connectors/mysql.svg',
    authType: 'credentials',
    configSchema: z.object({}),
    credentialsSchema: databaseCredentialsSchema,
  },
  [ConnectorProvider.MONGODB]: {
    id: ConnectorProvider.MONGODB,
    name: 'MongoDB',
    description: 'Connect to MongoDB databases',
    type: ConnectorType.DATABASE,
    icon: '/connectors/mongodb.svg',
    authType: 'connection_string',
    configSchema: z.object({
      collection: z.string().optional(),
    }),
    credentialsSchema: z.object({
      connectionString: z.string().min(1, 'Connection string is required'),
    }),
  },

  // File Storage
  [ConnectorProvider.AWS_S3]: {
    id: ConnectorProvider.AWS_S3,
    name: 'Amazon S3',
    description: 'Import data files from Amazon S3 buckets',
    type: ConnectorType.FILE,
    icon: '/connectors/aws-s3.svg',
    authType: 'credentials',
    configSchema: z.object({
      bucket: z.string().min(1, 'Bucket name is required'),
      prefix: z.string().optional(),
      fileFormat: z.enum(['csv', 'json', 'parquet']).default('csv'),
    }),
    credentialsSchema: cloudStorageCredentialsSchema,
  },
  [ConnectorProvider.GOOGLE_CLOUD_STORAGE]: {
    id: ConnectorProvider.GOOGLE_CLOUD_STORAGE,
    name: 'Google Cloud Storage',
    description: 'Import data files from GCS buckets',
    type: ConnectorType.FILE,
    icon: '/connectors/gcs.svg',
    authType: 'oauth',
    configSchema: z.object({
      bucket: z.string().min(1, 'Bucket name is required'),
      prefix: z.string().optional(),
    }),
    credentialsSchema: oauthCredentialsSchema,
  },
  [ConnectorProvider.AZURE_BLOB]: {
    id: ConnectorProvider.AZURE_BLOB,
    name: 'Azure Blob Storage',
    description: 'Import data files from Azure Blob containers',
    type: ConnectorType.FILE,
    icon: '/connectors/azure.svg',
    authType: 'credentials',
    configSchema: z.object({
      container: z.string().min(1, 'Container name is required'),
      prefix: z.string().optional(),
    }),
    credentialsSchema: z.object({
      accountName: z.string().min(1, 'Account name is required'),
      accountKey: z.string().min(1, 'Account key is required'),
    }),
  },
  [ConnectorProvider.SFTP]: {
    id: ConnectorProvider.SFTP,
    name: 'SFTP',
    description: 'Import data files via SFTP connection',
    type: ConnectorType.FILE,
    icon: '/connectors/sftp.svg',
    authType: 'credentials',
    configSchema: z.object({
      path: z.string().default('/'),
      filePattern: z.string().optional(),
    }),
    credentialsSchema: z.object({
      host: z.string().min(1, 'Host is required'),
      port: z.coerce.number().default(22),
      username: z.string().min(1, 'Username is required'),
      password: z.string().optional(),
      privateKey: z.string().optional(),
    }),
  },

  // Marketing
  [ConnectorProvider.MAILCHIMP]: {
    id: ConnectorProvider.MAILCHIMP,
    name: 'Mailchimp',
    description: 'Email marketing data from Mailchimp',
    type: ConnectorType.API,
    icon: '/connectors/mailchimp.svg',
    authType: 'api_key',
    configSchema: z.object({
      audienceId: z.string().optional(),
    }),
    credentialsSchema: apiKeyCredentialsSchema,
  },
  [ConnectorProvider.KLAVIYO]: {
    id: ConnectorProvider.KLAVIYO,
    name: 'Klaviyo',
    description: 'Email and SMS marketing data from Klaviyo',
    type: ConnectorType.API,
    icon: '/connectors/klaviyo.svg',
    authType: 'api_key',
    configSchema: z.object({}),
    credentialsSchema: apiKeyCredentialsSchema,
  },
  [ConnectorProvider.BRAZE]: {
    id: ConnectorProvider.BRAZE,
    name: 'Braze',
    description: 'Customer engagement data from Braze',
    type: ConnectorType.API,
    icon: '/connectors/braze.svg',
    authType: 'api_key',
    configSchema: z.object({
      instanceUrl: z.string().url('Valid instance URL required'),
    }),
    credentialsSchema: apiKeyCredentialsSchema,
  },

  // Survey
  [ConnectorProvider.QUALTRICS]: {
    id: ConnectorProvider.QUALTRICS,
    name: 'Qualtrics',
    description: 'Survey and research data from Qualtrics',
    type: ConnectorType.API,
    icon: '/connectors/qualtrics.svg',
    authType: 'api_key',
    configSchema: z.object({
      datacenter: z.string().min(1, 'Datacenter is required'),
      surveyId: z.string().optional(),
    }),
    credentialsSchema: apiKeyCredentialsSchema,
    popular: true,
  },
  [ConnectorProvider.SURVEY_MONKEY]: {
    id: ConnectorProvider.SURVEY_MONKEY,
    name: 'SurveyMonkey',
    description: 'Survey responses from SurveyMonkey',
    type: ConnectorType.API,
    icon: '/connectors/surveymonkey.svg',
    authType: 'oauth',
    configSchema: z.object({}),
    credentialsSchema: oauthCredentialsSchema,
  },
  [ConnectorProvider.TYPEFORM]: {
    id: ConnectorProvider.TYPEFORM,
    name: 'Typeform',
    description: 'Form and survey responses from Typeform',
    type: ConnectorType.API,
    icon: '/connectors/typeform.svg',
    authType: 'api_key',
    configSchema: z.object({
      workspaceId: z.string().optional(),
    }),
    credentialsSchema: apiKeyCredentialsSchema,
  },
}

/**
 * Get providers by type
 */
export function getProvidersByType(type: ConnectorTypeValue): ConnectorProviderConfig[] {
  return Object.values(CONNECTOR_PROVIDERS).filter(p => p.type === type)
}

/**
 * Get popular providers
 */
export function getPopularProviders(): ConnectorProviderConfig[] {
  return Object.values(CONNECTOR_PROVIDERS).filter(p => p.popular)
}

/**
 * Get all connector type categories
 */
export const CONNECTOR_CATEGORIES = [
  { id: ConnectorType.ANALYTICS, label: 'Analytics', icon: 'BarChart3' },
  { id: ConnectorType.CRM, label: 'CRM', icon: 'Users' },
  { id: ConnectorType.SOCIAL, label: 'Social', icon: 'Share2' },
  { id: ConnectorType.ADVERTISING, label: 'Advertising', icon: 'Megaphone' },
  { id: ConnectorType.DATABASE, label: 'Databases', icon: 'Database' },
  { id: ConnectorType.FILE, label: 'File Storage', icon: 'FolderOpen' },
  { id: ConnectorType.API, label: 'APIs & Services', icon: 'Plug' },
] as const

/**
 * Sync schedule options
 */
export const SYNC_SCHEDULES = [
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 */6 * * *', label: 'Every 6 hours' },
  { value: '0 */12 * * *', label: 'Every 12 hours' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: '0 0 * * 0', label: 'Weekly (Sunday)' },
  { value: '0 0 1 * *', label: 'Monthly (1st day)' },
  { value: null, label: 'Manual only' },
] as const
