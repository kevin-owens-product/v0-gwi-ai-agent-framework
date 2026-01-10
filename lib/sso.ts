/**
 * SSO/SAML Authentication Service
 *
 * Provides enterprise SSO integration with:
 * - SAML 2.0
 * - OpenID Connect (OIDC)
 * - OAuth 2.0
 */

import { prisma } from './db'

export interface SAMLConfig {
  entryPoint: string
  issuer: string
  cert: string
  callbackUrl: string
  identifierFormat?: string
}

export interface OIDCConfig {
  issuer: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

/**
 * Get SSO configuration for organization
 */
export async function getSSOConfig(orgId: string) {
  const config = await prisma.sSOConfiguration.findFirst({
    where: { orgId, enabled: true },
  })

  if (!config) {
    return null
  }

  const settings = config.settings as Record<string, unknown>

  switch (config.provider) {
    case 'SAML':
      return {
        provider: 'SAML',
        config: {
          entryPoint: settings.entryPoint as string,
          issuer: settings.issuer as string,
          cert: settings.cert as string,
          callbackUrl: settings.callbackUrl as string,
          identifierFormat: settings.identifierFormat as string | undefined,
        } as SAMLConfig,
      }

    case 'OIDC':
      return {
        provider: 'OIDC',
        config: {
          issuer: settings.issuer as string,
          clientId: settings.clientId as string,
          clientSecret: settings.clientSecret as string,
          redirectUri: settings.redirectUri as string,
          scopes: (settings.scopes as string[]) || ['openid', 'profile', 'email'],
        } as OIDCConfig,
      }

    case 'AZURE_AD':
      return {
        provider: 'AZURE_AD',
        config: {
          tenantId: settings.tenantId as string,
          clientId: settings.clientId as string,
          clientSecret: settings.clientSecret as string,
        },
      }

    default:
      return null
  }
}

/**
 * Validate SAML response
 */
export async function validateSAMLResponse(
  samlResponse: string,
  orgId: string
): Promise<{
  valid: boolean
  email?: string
  attributes?: Record<string, unknown>
}> {
  try {
    const config = await getSSOConfig(orgId)
    if (!config || config.provider !== 'SAML') {
      return { valid: false }
    }

    // In production, use a library like passport-saml or saml2-js
    // For now, return a simulated validation

    // Decode and parse SAML response
    const decoded = Buffer.from(samlResponse, 'base64').toString('utf-8')

    // Extract user information (simplified)
    const emailMatch = decoded.match(/<saml:Attribute Name="email">([^<]+)<\/saml:Attribute>/)
    const email = emailMatch ? emailMatch[1] : undefined

    return {
      valid: true,
      email,
      attributes: {
        nameID: email,
        sessionIndex: 'session-' + Date.now(),
      },
    }
  } catch (error) {
    console.error('SAML validation error:', error)
    return { valid: false }
  }
}

/**
 * Exchange OIDC authorization code for tokens
 */
export async function exchangeOIDCCode(
  code: string,
  orgId: string
): Promise<{
  accessToken?: string
  idToken?: string
  refreshToken?: string
  user?: {
    sub: string
    email: string
    name?: string
  }
}> {
  try {
    const config = await getSSOConfig(orgId)
    if (!config || config.provider !== 'OIDC') {
      throw new Error('OIDC not configured')
    }

    const oidcConfig = config.config as OIDCConfig

    // Exchange code for tokens
    const tokenResponse = await fetch(`${oidcConfig.issuer}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: oidcConfig.clientId,
        client_secret: oidcConfig.clientSecret,
        redirect_uri: oidcConfig.redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed')
    }

    const tokens = await tokenResponse.json()

    // Decode ID token to get user info
    const idToken = tokens.id_token
    const [, payloadBase64] = idToken.split('.')
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())

    return {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      user: {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
      },
    }
  } catch (error) {
    console.error('OIDC code exchange error:', error)
    throw error
  }
}

/**
 * Get Azure AD login URL
 */
export function getAzureADLoginURL(orgId: string, tenantId: string, clientId: string): string {
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/azure-ad`
  const state = Buffer.from(JSON.stringify({ orgId })).toString('base64')

  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_mode=query&` +
    `scope=openid%20profile%20email&` +
    `state=${state}`
}

/**
 * Enable SSO for organization
 */
export async function enableSSO(params: {
  orgId: string
  provider: 'SAML' | 'OIDC' | 'AZURE_AD'
  settings: Record<string, unknown>
}) {
  return prisma.sSOConfiguration.create({
    data: {
      orgId: params.orgId,
      provider: params.provider,
      settings: params.settings,
      enabled: true,
    },
  })
}

/**
 * Disable SSO for organization
 */
export async function disableSSO(orgId: string) {
  return prisma.sSOConfiguration.updateMany({
    where: { orgId },
    data: { enabled: false },
  })
}
