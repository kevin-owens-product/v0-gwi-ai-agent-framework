import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  storeAgents,
  featuredAgentIds,
  iconMap,
  getStoreAgent,
  getAllStoreAgents,
  getFeaturedAgents,
  getAgentsByCategory,
  getInstalledAgentIds,
  isAgentInstalled,
  installAgent,
  uninstallAgent,
  getInstalledAgents,
} from './store-agents'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('store-agents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('storeAgents data', () => {
    it('contains multiple agents', () => {
      expect(Object.keys(storeAgents).length).toBeGreaterThan(0)
    })

    it('each agent has required fields', () => {
      Object.values(storeAgents).forEach(agent => {
        expect(agent.id).toBeDefined()
        expect(agent.name).toBeDefined()
        expect(agent.description).toBeDefined()
        expect(agent.author).toBeDefined()
        expect(typeof agent.verified).toBe('boolean')
        expect(typeof agent.rating).toBe('number')
        expect(agent.category).toBeDefined()
        expect(agent.price).toBeDefined()
        expect(agent.version).toBeDefined()
        expect(agent.dataSources).toBeDefined()
        expect(agent.capabilities).toBeDefined()
        expect(agent.examplePrompts).toBeDefined()
        expect(agent.greeting).toBeDefined()
        expect(agent.systemPrompt).toBeDefined()
        expect(agent.iconName).toBeDefined()
        expect(agent.color).toBeDefined()
      })
    })

    it('has valid price values', () => {
      const validPrices = ['Included', 'Pro', 'Enterprise']
      Object.values(storeAgents).forEach(agent => {
        expect(validPrices).toContain(agent.price)
      })
    })

    it('has valid icon names', () => {
      const validIcons = Object.keys(iconMap)
      Object.values(storeAgents).forEach(agent => {
        expect(validIcons).toContain(agent.iconName)
      })
    })
  })

  describe('featuredAgentIds', () => {
    it('contains valid agent IDs', () => {
      featuredAgentIds.forEach(id => {
        expect(storeAgents[id]).toBeDefined()
      })
    })

    it('has at least one featured agent', () => {
      expect(featuredAgentIds.length).toBeGreaterThan(0)
    })
  })

  describe('iconMap', () => {
    it('contains expected icons', () => {
      expect(iconMap.target).toBeDefined()
      expect(iconMap.trending).toBeDefined()
      expect(iconMap.palette).toBeDefined()
      expect(iconMap.sparkles).toBeDefined()
      expect(iconMap.megaphone).toBeDefined()
      expect(iconMap.users).toBeDefined()
      expect(iconMap.globe).toBeDefined()
      expect(iconMap.chart).toBeDefined()
      expect(iconMap.file).toBeDefined()
      expect(iconMap.cart).toBeDefined()
      expect(iconMap.brain).toBeDefined()
    })
  })

  describe('getStoreAgent', () => {
    it('returns agent for valid ID', () => {
      const agent = getStoreAgent('audience-strategist-pro')
      expect(agent).toBeDefined()
      expect(agent?.name).toBe('Audience Strategist Pro')
    })

    it('returns undefined for invalid ID', () => {
      const agent = getStoreAgent('non-existent-agent')
      expect(agent).toBeUndefined()
    })

    it('returns undefined for empty string', () => {
      const agent = getStoreAgent('')
      expect(agent).toBeUndefined()
    })
  })

  describe('getAllStoreAgents', () => {
    it('returns array of all agents', () => {
      const agents = getAllStoreAgents()
      expect(Array.isArray(agents)).toBe(true)
      expect(agents.length).toBe(Object.keys(storeAgents).length)
    })

    it('returns agents with correct structure', () => {
      const agents = getAllStoreAgents()
      agents.forEach(agent => {
        expect(agent.id).toBeDefined()
        expect(agent.name).toBeDefined()
      })
    })
  })

  describe('getFeaturedAgents', () => {
    it('returns array of featured agents', () => {
      const agents = getFeaturedAgents()
      expect(Array.isArray(agents)).toBe(true)
      expect(agents.length).toBe(featuredAgentIds.length)
    })

    it('returns agents in correct order', () => {
      const agents = getFeaturedAgents()
      agents.forEach((agent, index) => {
        expect(agent.id).toBe(featuredAgentIds[index])
      })
    })
  })

  describe('getAgentsByCategory', () => {
    it('returns all agents when category is "all"', () => {
      const agents = getAgentsByCategory('all')
      expect(agents.length).toBe(getAllStoreAgents().length)
    })

    it('filters agents by category', () => {
      const agents = getAgentsByCategory('Audience & Targeting')
      expect(agents.length).toBeGreaterThan(0)
      agents.forEach(agent => {
        expect(agent.category).toBe('Audience & Targeting')
      })
    })

    it('returns empty array for non-existent category', () => {
      const agents = getAgentsByCategory('Non-existent Category')
      expect(agents).toEqual([])
    })
  })

  describe('getInstalledAgentIds', () => {
    it('returns empty array when nothing is installed', () => {
      const ids = getInstalledAgentIds()
      expect(ids).toEqual([])
    })

    it('returns installed agent IDs from localStorage', () => {
      const installedIds = ['audience-strategist-pro', 'brand-tracker-360']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))

      const ids = getInstalledAgentIds()
      expect(ids).toEqual(installedIds)
    })

    it('handles invalid JSON gracefully', () => {
      localStorageMock.setItem('gwi-installed-agents', 'invalid-json')
      localStorageMock.getItem.mockReturnValueOnce('invalid-json')

      const ids = getInstalledAgentIds()
      expect(ids).toEqual([])
    })
  })

  describe('isAgentInstalled', () => {
    it('returns false when agent is not installed', () => {
      expect(isAgentInstalled('audience-strategist-pro')).toBe(false)
    })

    it('returns true when agent is installed', () => {
      const installedIds = ['audience-strategist-pro']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))

      expect(isAgentInstalled('audience-strategist-pro')).toBe(true)
    })

    it('returns false for non-installed agent', () => {
      const installedIds = ['audience-strategist-pro']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))

      expect(isAgentInstalled('brand-tracker-360')).toBe(false)
    })
  })

  describe('installAgent', () => {
    it('adds agent to installed list', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      installAgent('audience-strategist-pro')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gwi-installed-agents',
        JSON.stringify(['audience-strategist-pro'])
      )
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'agent-installed',
          detail: { agentId: 'audience-strategist-pro' },
        })
      )
    })

    it('does not duplicate agent ID if already installed', () => {
      const installedIds = ['audience-strategist-pro']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))

      installAgent('audience-strategist-pro')

      // Should still only have one entry
      const calls = localStorageMock.setItem.mock.calls
      const lastCall = calls[calls.length - 1]
      if (lastCall) {
        const savedIds = JSON.parse(lastCall[1])
        expect(savedIds.filter((id: string) => id === 'audience-strategist-pro').length).toBe(1)
      }
    })

    it('adds to existing installed agents', () => {
      const installedIds = ['audience-strategist-pro']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))

      installAgent('brand-tracker-360')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gwi-installed-agents',
        JSON.stringify(['audience-strategist-pro', 'brand-tracker-360'])
      )
    })
  })

  describe('uninstallAgent', () => {
    it('removes agent from installed list', () => {
      const installedIds = ['audience-strategist-pro', 'brand-tracker-360']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      uninstallAgent('audience-strategist-pro')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gwi-installed-agents',
        JSON.stringify(['brand-tracker-360'])
      )
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'agent-uninstalled',
          detail: { agentId: 'audience-strategist-pro' },
        })
      )
    })

    it('handles uninstalling non-existent agent', () => {
      const installedIds = ['audience-strategist-pro']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))

      uninstallAgent('brand-tracker-360')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gwi-installed-agents',
        JSON.stringify(['audience-strategist-pro'])
      )
    })
  })

  describe('getInstalledAgents', () => {
    it('returns empty array when nothing installed', () => {
      const agents = getInstalledAgents()
      expect(agents).toEqual([])
    })

    it('returns installed agents with full data', () => {
      const installedIds = ['audience-strategist-pro', 'brand-tracker-360']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))

      const agents = getInstalledAgents()
      expect(agents.length).toBe(2)
      expect(agents[0].id).toBe('audience-strategist-pro')
      expect(agents[1].id).toBe('brand-tracker-360')
    })

    it('filters out invalid agent IDs', () => {
      const installedIds = ['audience-strategist-pro', 'invalid-agent', 'brand-tracker-360']
      localStorageMock.setItem('gwi-installed-agents', JSON.stringify(installedIds))

      const agents = getInstalledAgents()
      expect(agents.length).toBe(2)
      expect(agents.every(a => a !== undefined)).toBe(true)
    })
  })
})
