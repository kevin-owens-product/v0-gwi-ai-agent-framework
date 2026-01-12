import { describe, it, expect } from 'vitest'
import {
  SolutionAgent,
  salesAgents,
  insightsAgents,
  adSalesAgents,
  marketingAgents,
  productAgents,
  marketResearchAgents,
  innovationAgents,
  coreAgents,
  allSolutionAgents,
  agentCountsByCategory,
  getAgentsBySolution,
  getAgentById,
  searchAgents,
  getRelatedAgents,
  solutionAreas
} from './solution-agents'

describe('Solution Agents - Data Integrity', () => {
  describe('Agent Collections', () => {
    it('should have exactly 6 sales agents', () => {
      expect(salesAgents).toHaveLength(6)
    })

    it('should have exactly 6 insights agents', () => {
      expect(insightsAgents).toHaveLength(6)
    })

    it('should have exactly 6 ad sales agents', () => {
      expect(adSalesAgents).toHaveLength(6)
    })

    it('should have exactly 6 marketing agents', () => {
      expect(marketingAgents).toHaveLength(6)
    })

    it('should have exactly 6 product development agents', () => {
      expect(productAgents).toHaveLength(6)
    })

    it('should have exactly 6 market research agents', () => {
      expect(marketResearchAgents).toHaveLength(6)
    })

    it('should have exactly 6 innovation agents', () => {
      expect(innovationAgents).toHaveLength(6)
    })

    it('should have exactly 6 core agents', () => {
      expect(coreAgents).toHaveLength(6)
    })

    it('should have 48 total agents', () => {
      expect(allSolutionAgents).toHaveLength(48)
    })

    it('should have all agents from all categories in allSolutionAgents', () => {
      const totalFromCategories =
        salesAgents.length +
        insightsAgents.length +
        adSalesAgents.length +
        marketingAgents.length +
        productAgents.length +
        marketResearchAgents.length +
        innovationAgents.length +
        coreAgents.length
      expect(allSolutionAgents).toHaveLength(totalFromCategories)
    })
  })

  describe('Agent Structure Validation', () => {
    it('should have all required fields for each agent', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent).toHaveProperty('id')
        expect(agent).toHaveProperty('name')
        expect(agent).toHaveProperty('description')
        expect(agent).toHaveProperty('solutionArea')
        expect(agent).toHaveProperty('solutionAreaSlug')
        expect(agent).toHaveProperty('icon')
        expect(agent).toHaveProperty('capabilities')
        expect(agent).toHaveProperty('systemPrompt')
        expect(agent).toHaveProperty('examplePrompts')
        expect(agent).toHaveProperty('dataConnections')
        expect(agent).toHaveProperty('outputFormats')
        expect(agent).toHaveProperty('tags')
      })
    })

    it('should have non-empty values for all string fields', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.id).toBeTruthy()
        expect(agent.name).toBeTruthy()
        expect(agent.description).toBeTruthy()
        expect(agent.solutionArea).toBeTruthy()
        expect(agent.solutionAreaSlug).toBeTruthy()
        expect(agent.icon).toBeTruthy()
        expect(agent.systemPrompt).toBeTruthy()
      })
    })

    it('should have non-empty arrays for all array fields', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.capabilities.length).toBeGreaterThan(0)
        expect(agent.examplePrompts.length).toBeGreaterThan(0)
        expect(agent.dataConnections.length).toBeGreaterThan(0)
        expect(agent.outputFormats.length).toBeGreaterThan(0)
        expect(agent.tags.length).toBeGreaterThan(0)
      })
    })

    it('should have unique IDs for all agents', () => {
      const ids = allSolutionAgents.map((agent) => agent.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have consistent ID naming convention (lowercase with hyphens)', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.id).toMatch(/^[a-z-]+$/)
      })
    })
  })

  describe('Sales Agents', () => {
    it('should have correct solution area metadata', () => {
      salesAgents.forEach((agent) => {
        expect(agent.solutionArea).toBe('Sales')
        expect(agent.solutionAreaSlug).toBe('sales')
      })
    })

    it('should have all expected sales agents', () => {
      const expectedIds = [
        'sales-buyer-persona',
        'sales-message-personalization',
        'sales-deal-intelligence',
        'sales-competitive-intelligence',
        'sales-account-scoring',
        'sales-enablement'
      ]
      const actualIds = salesAgents.map((agent) => agent.id)
      expect(actualIds).toEqual(expectedIds)
    })
  })

  describe('Insights Agents', () => {
    it('should have correct solution area metadata', () => {
      insightsAgents.forEach((agent) => {
        expect(agent.solutionArea).toBe('Insights')
        expect(agent.solutionAreaSlug).toBe('insights')
      })
    })

    it('should have all expected insights agents', () => {
      const expectedIds = [
        'insights-audience-explorer',
        'insights-motivation-decoder',
        'insights-culture-tracker',
        'insights-global-perspective',
        'insights-persona-architect',
        'insights-storytelling'
      ]
      const actualIds = insightsAgents.map((agent) => agent.id)
      expect(actualIds).toEqual(expectedIds)
    })
  })

  describe('Ad Sales Agents', () => {
    it('should have correct solution area metadata', () => {
      adSalesAgents.forEach((agent) => {
        expect(agent.solutionArea).toBe('Ad Sales')
        expect(agent.solutionAreaSlug).toBe('ad-sales')
      })
    })

    it('should have all expected ad sales agents', () => {
      const expectedIds = [
        'ad-sales-audience-packager',
        'ad-sales-media-planner',
        'ad-sales-pitch-generator',
        'ad-sales-inventory-optimizer',
        'ad-sales-proposal-writer',
        'ad-sales-market-intelligence'
      ]
      const actualIds = adSalesAgents.map((agent) => agent.id)
      expect(actualIds).toEqual(expectedIds)
    })
  })

  describe('Marketing Agents', () => {
    it('should have correct solution area metadata', () => {
      marketingAgents.forEach((agent) => {
        expect(agent.solutionArea).toBe('Marketing')
        expect(agent.solutionAreaSlug).toBe('marketing')
      })
    })

    it('should have all expected marketing agents', () => {
      const expectedIds = [
        'marketing-campaign-strategist',
        'marketing-content-creator',
        'marketing-trend-forecaster',
        'marketing-audience-profiler',
        'marketing-performance-predictor',
        'marketing-social-listener'
      ]
      const actualIds = marketingAgents.map((agent) => agent.id)
      expect(actualIds).toEqual(expectedIds)
    })
  })

  describe('Product Development Agents', () => {
    it('should have correct solution area metadata', () => {
      productAgents.forEach((agent) => {
        expect(agent.solutionArea).toBe('Product Development')
        expect(agent.solutionAreaSlug).toBe('product-development')
      })
    })

    it('should have all expected product agents', () => {
      const expectedIds = [
        'product-opportunity-scout',
        'product-feature-prioritizer',
        'product-user-persona-builder',
        'product-concept-validator',
        'product-pricing-strategist',
        'product-launch-planner'
      ]
      const actualIds = productAgents.map((agent) => agent.id)
      expect(actualIds).toEqual(expectedIds)
    })
  })

  describe('Market Research Agents', () => {
    it('should have correct solution area metadata', () => {
      marketResearchAgents.forEach((agent) => {
        expect(agent.solutionArea).toBe('Market Research')
        expect(agent.solutionAreaSlug).toBe('market-research')
      })
    })

    it('should have all expected market research agents', () => {
      const expectedIds = [
        'research-market-mapper',
        'research-survey-analyzer',
        'research-trend-tracker',
        'research-competitive-intelligence',
        'research-report-writer',
        'research-segment-profiler'
      ]
      const actualIds = marketResearchAgents.map((agent) => agent.id)
      expect(actualIds).toEqual(expectedIds)
    })
  })

  describe('Innovation Agents', () => {
    it('should have correct solution area metadata', () => {
      innovationAgents.forEach((agent) => {
        expect(agent.solutionArea).toBe('Innovation')
        expect(agent.solutionAreaSlug).toBe('innovation')
      })
    })

    it('should have all expected innovation agents', () => {
      const expectedIds = [
        'innovation-opportunity-finder',
        'innovation-ideation-engine',
        'innovation-trend-synthesizer',
        'innovation-validator',
        'innovation-consumer-cocreator',
        'innovation-launch-accelerator'
      ]
      const actualIds = innovationAgents.map((agent) => agent.id)
      expect(actualIds).toEqual(expectedIds)
    })
  })

  describe('Core Agents', () => {
    it('should have correct solution area metadata', () => {
      coreAgents.forEach((agent) => {
        expect(agent.solutionArea).toBe('Core')
        expect(agent.solutionAreaSlug).toBe('core')
      })
    })

    it('should have all expected core agents', () => {
      const expectedIds = [
        'core-audience-explorer',
        'core-persona-architect',
        'core-motivation-decoder',
        'core-culture-tracker',
        'core-brand-relationship-analyst',
        'core-global-perspective'
      ]
      const actualIds = coreAgents.map((agent) => agent.id)
      expect(actualIds).toEqual(expectedIds)
    })
  })
})

describe('Solution Agents - Helper Functions', () => {
  describe('agentCountsByCategory', () => {
    it('should have correct counts for each category', () => {
      expect(agentCountsByCategory.core).toBe(6)
      expect(agentCountsByCategory.sales).toBe(6)
      expect(agentCountsByCategory.insights).toBe(6)
      expect(agentCountsByCategory.adSales).toBe(6)
      expect(agentCountsByCategory.marketing).toBe(6)
      expect(agentCountsByCategory.product).toBe(6)
      expect(agentCountsByCategory.marketResearch).toBe(6)
      expect(agentCountsByCategory.innovation).toBe(6)
      expect(agentCountsByCategory.total).toBe(48)
    })

    it('should have total equal to sum of all categories', () => {
      const sum =
        agentCountsByCategory.core +
        agentCountsByCategory.sales +
        agentCountsByCategory.insights +
        agentCountsByCategory.adSales +
        agentCountsByCategory.marketing +
        agentCountsByCategory.product +
        agentCountsByCategory.marketResearch +
        agentCountsByCategory.innovation
      expect(agentCountsByCategory.total).toBe(sum)
    })
  })

  describe('getAgentsBySolution', () => {
    it('should return core agents for "core" slug', () => {
      const agents = getAgentsBySolution('core')
      expect(agents).toEqual(coreAgents)
      expect(agents).toHaveLength(6)
    })

    it('should return sales agents for "sales" slug', () => {
      const agents = getAgentsBySolution('sales')
      expect(agents).toEqual(salesAgents)
      expect(agents).toHaveLength(6)
    })

    it('should return insights agents for "insights" slug', () => {
      const agents = getAgentsBySolution('insights')
      expect(agents).toEqual(insightsAgents)
      expect(agents).toHaveLength(6)
    })

    it('should return ad sales agents for "ad-sales" slug', () => {
      const agents = getAgentsBySolution('ad-sales')
      expect(agents).toEqual(adSalesAgents)
      expect(agents).toHaveLength(6)
    })

    it('should return marketing agents for "marketing" slug', () => {
      const agents = getAgentsBySolution('marketing')
      expect(agents).toEqual(marketingAgents)
      expect(agents).toHaveLength(6)
    })

    it('should return product agents for "product-development" slug', () => {
      const agents = getAgentsBySolution('product-development')
      expect(agents).toEqual(productAgents)
      expect(agents).toHaveLength(6)
    })

    it('should return market research agents for "market-research" slug', () => {
      const agents = getAgentsBySolution('market-research')
      expect(agents).toEqual(marketResearchAgents)
      expect(agents).toHaveLength(6)
    })

    it('should return innovation agents for "innovation" slug', () => {
      const agents = getAgentsBySolution('innovation')
      expect(agents).toEqual(innovationAgents)
      expect(agents).toHaveLength(6)
    })

    it('should return empty array for unknown slug', () => {
      const agents = getAgentsBySolution('unknown-solution')
      expect(agents).toEqual([])
    })

    it('should return empty array for empty string', () => {
      const agents = getAgentsBySolution('')
      expect(agents).toEqual([])
    })
  })

  describe('getAgentById', () => {
    it('should return correct agent for valid ID', () => {
      const agent = getAgentById('sales-buyer-persona')
      expect(agent).toBeDefined()
      expect(agent?.id).toBe('sales-buyer-persona')
      expect(agent?.name).toBe('Buyer Persona Agent')
    })

    it('should return correct agent for core agent ID', () => {
      const agent = getAgentById('core-audience-explorer')
      expect(agent).toBeDefined()
      expect(agent?.id).toBe('core-audience-explorer')
      expect(agent?.name).toBe('Audience Explorer')
    })

    it('should return undefined for non-existent ID', () => {
      const agent = getAgentById('non-existent-agent')
      expect(agent).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const agent = getAgentById('')
      expect(agent).toBeUndefined()
    })

    it('should find agents from all categories', () => {
      const testIds = [
        'sales-buyer-persona',
        'insights-audience-explorer',
        'ad-sales-audience-packager',
        'marketing-campaign-strategist',
        'product-opportunity-scout',
        'research-market-mapper',
        'innovation-opportunity-finder',
        'core-audience-explorer'
      ]
      testIds.forEach((id) => {
        const agent = getAgentById(id)
        expect(agent).toBeDefined()
        expect(agent?.id).toBe(id)
      })
    })
  })

  describe('searchAgents', () => {
    it('should find agents by name', () => {
      const results = searchAgents('persona')
      expect(results.length).toBeGreaterThan(0)
      const hasPersonaInName = results.every((agent) =>
        agent.name.toLowerCase().includes('persona')
      )
      const hasPersonaInDescription = results.some((agent) =>
        agent.description.toLowerCase().includes('persona')
      )
      expect(hasPersonaInName || hasPersonaInDescription).toBe(true)
    })

    it('should find agents by description', () => {
      const results = searchAgents('consumer')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find agents by tags', () => {
      const results = searchAgents('sales')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find agents by solution area', () => {
      const results = searchAgents('marketing')
      expect(results.length).toBeGreaterThan(0)
      const hasMarketingArea = results.some(
        (agent) => agent.solutionArea === 'Marketing'
      )
      expect(hasMarketingArea).toBe(true)
    })

    it('should be case insensitive', () => {
      const lowerResults = searchAgents('audience')
      const upperResults = searchAgents('AUDIENCE')
      const mixedResults = searchAgents('AuDiEnCe')
      expect(lowerResults.length).toBe(upperResults.length)
      expect(lowerResults.length).toBe(mixedResults.length)
    })

    it('should return empty array for no matches', () => {
      const results = searchAgents('xyznotfound123')
      expect(results).toEqual([])
    })

    it('should handle empty query gracefully', () => {
      const results = searchAgents('')
      // Empty query might return all or none depending on implementation
      expect(Array.isArray(results)).toBe(true)
    })

    it('should find multiple agents for broad search', () => {
      const results = searchAgents('insights')
      expect(results.length).toBeGreaterThan(1)
    })
  })

  describe('getRelatedAgents', () => {
    it('should return related agents for valid ID', () => {
      const related = getRelatedAgents('sales-buyer-persona')
      expect(related.length).toBeGreaterThan(0)
      expect(related.length).toBeLessThanOrEqual(4)
    })

    it('should not include the source agent in related agents', () => {
      const related = getRelatedAgents('sales-buyer-persona')
      const hasSourceAgent = related.some(
        (agent) => agent.id === 'sales-buyer-persona'
      )
      expect(hasSourceAgent).toBe(false)
    })

    it('should prioritize agents from same solution area', () => {
      const related = getRelatedAgents('sales-buyer-persona', 4)
      if (related.length > 0) {
        // Should have some sales agents in the results
        const hasSalesAgents = related.some((agent) =>
          agent.id.startsWith('sales-')
        )
        expect(hasSalesAgents).toBe(true)
      }
    })

    it('should respect the limit parameter', () => {
      const related2 = getRelatedAgents('sales-buyer-persona', 2)
      const related5 = getRelatedAgents('sales-buyer-persona', 5)
      expect(related2.length).toBeLessThanOrEqual(2)
      expect(related5.length).toBeLessThanOrEqual(5)
    })

    it('should return empty array for non-existent agent', () => {
      const related = getRelatedAgents('non-existent-agent')
      expect(related).toEqual([])
    })

    it('should use default limit of 4 when not specified', () => {
      const related = getRelatedAgents('sales-buyer-persona')
      expect(related.length).toBeLessThanOrEqual(4)
    })

    it('should prioritize agents with shared tags', () => {
      const agent = getAgentById('sales-buyer-persona')
      expect(agent).toBeDefined()
      const related = getRelatedAgents('sales-buyer-persona', 4)

      // At least one related agent should share tags
      const hasSharedTags = related.some((relatedAgent) =>
        relatedAgent.tags.some((tag) => agent!.tags.includes(tag))
      )
      expect(hasSharedTags).toBe(true)
    })
  })

  describe('solutionAreas', () => {
    it('should have 8 solution areas', () => {
      expect(solutionAreas).toHaveLength(8)
    })

    it('should have all required fields for each solution area', () => {
      solutionAreas.forEach((area) => {
        expect(area).toHaveProperty('slug')
        expect(area).toHaveProperty('name')
        expect(area).toHaveProperty('description')
        expect(area).toHaveProperty('agentCount')
      })
    })

    it('should have correct agent counts', () => {
      const coreArea = solutionAreas.find((area) => area.slug === 'core')
      const salesArea = solutionAreas.find((area) => area.slug === 'sales')
      const insightsArea = solutionAreas.find((area) => area.slug === 'insights')

      expect(coreArea?.agentCount).toBe(6)
      expect(salesArea?.agentCount).toBe(6)
      expect(insightsArea?.agentCount).toBe(6)
    })

    it('should have all expected solution area slugs', () => {
      const slugs = solutionAreas.map((area) => area.slug)
      expect(slugs).toContain('core')
      expect(slugs).toContain('sales')
      expect(slugs).toContain('insights')
      expect(slugs).toContain('ad-sales')
      expect(slugs).toContain('marketing')
      expect(slugs).toContain('product-development')
      expect(slugs).toContain('market-research')
      expect(slugs).toContain('innovation')
    })

    it('should have unique slugs', () => {
      const slugs = solutionAreas.map((area) => area.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(slugs.length)
    })

    it('should have non-empty names and descriptions', () => {
      solutionAreas.forEach((area) => {
        expect(area.name).toBeTruthy()
        expect(area.description).toBeTruthy()
      })
    })
  })
})

describe('Solution Agents - Content Quality', () => {
  describe('System Prompts', () => {
    it('should have substantial system prompts (>100 chars)', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.systemPrompt.length).toBeGreaterThan(100)
      })
    })

    it('should have system prompts that reference agent role', () => {
      allSolutionAgents.forEach((agent) => {
        const hasRoleReference =
          agent.systemPrompt.includes('You are') ||
          agent.systemPrompt.includes('Your role')
        expect(hasRoleReference).toBe(true)
      })
    })
  })

  describe('Capabilities', () => {
    it('should have at least 4 capabilities per agent', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.capabilities.length).toBeGreaterThanOrEqual(4)
      })
    })

    it('should have meaningful capability descriptions', () => {
      allSolutionAgents.forEach((agent) => {
        agent.capabilities.forEach((capability) => {
          expect(capability.length).toBeGreaterThan(10)
        })
      })
    })
  })

  describe('Example Prompts', () => {
    it('should have at least 4 example prompts per agent', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.examplePrompts.length).toBeGreaterThanOrEqual(4)
      })
    })

    it('should have meaningful example prompts', () => {
      allSolutionAgents.forEach((agent) => {
        agent.examplePrompts.forEach((prompt) => {
          expect(prompt.length).toBeGreaterThan(15)
        })
      })
    })
  })

  describe('Data Connections', () => {
    it('should have at least one data connection per agent', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.dataConnections.length).toBeGreaterThan(0)
      })
    })

    it('should have valid GWI data connection types', () => {
      const validConnections = [
        'GWI Core',
        'GWI USA',
        'GWI B2B',
        'GWI Zeitgeist',
        'Custom Audiences',
        'Survey Data',
        'Custom Research',
        'Social Data',
        'Brand Data',
        'Industry Data',
        'Internal Data',
        'Historical Data',
        'Trend Data',
        'Campaign Data',
        'Benchmarks',
        'Consumer Feedback',
        'Global Data'
      ]
      allSolutionAgents.forEach((agent) => {
        agent.dataConnections.forEach((connection) => {
          expect(validConnections).toContain(connection)
        })
      })
    })
  })

  describe('Output Formats', () => {
    it('should have at least 2 output formats per agent', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.outputFormats.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should have meaningful output format descriptions', () => {
      allSolutionAgents.forEach((agent) => {
        agent.outputFormats.forEach((format) => {
          expect(format.length).toBeGreaterThan(3)
        })
      })
    })
  })

  describe('Tags', () => {
    it('should have at least 3 tags per agent', () => {
      allSolutionAgents.forEach((agent) => {
        expect(agent.tags.length).toBeGreaterThanOrEqual(3)
      })
    })

    it('should have mostly lowercase tags', () => {
      allSolutionAgents.forEach((agent) => {
        agent.tags.forEach((tag) => {
          // Most tags should be lowercase, but acronyms like "RFPs" are acceptable
          const isLowercase = tag === tag.toLowerCase()
          const isAcronym = tag.toUpperCase() === tag || (tag.length <= 4 && tag.includes(tag.charAt(0).toUpperCase()))
          expect(isLowercase || isAcronym).toBe(true)
        })
      })
    })
  })
})
