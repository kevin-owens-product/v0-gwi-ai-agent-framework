/**
 * Comprehensive Crosstab Data Tests
 *
 * Tests for the comprehensive sample data module that provides
 * 105+ metrics across 21 audience segments for GWI-style crosstab analysis.
 */

import { describe, it, expect } from "vitest"
import {
  COMPREHENSIVE_COLUMNS,
  COMPREHENSIVE_DATA,
  COMPREHENSIVE_FILTER_FIELDS,
  COMPREHENSIVE_VARIABLES,
  DATA_SUMMARY,
} from "./comprehensive-crosstab-data"

describe("Comprehensive Crosstab Data", () => {
  describe("COMPREHENSIVE_COLUMNS", () => {
    it("should have 21 audience segments", () => {
      expect(COMPREHENSIVE_COLUMNS).toHaveLength(21)
    })

    it("should have required properties for each column", () => {
      COMPREHENSIVE_COLUMNS.forEach((col) => {
        expect(col).toHaveProperty("id")
        expect(col).toHaveProperty("key")
        expect(col).toHaveProperty("label")
        expect(col).toHaveProperty("category")
      })
    })

    it("should have unique ids", () => {
      const ids = COMPREHENSIVE_COLUMNS.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it("should have unique keys", () => {
      const keys = COMPREHENSIVE_COLUMNS.map((c) => c.key)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })

    it("should include generational segments", () => {
      const categories = COMPREHENSIVE_COLUMNS.map((c) => c.category)
      expect(categories).toContain("Generation")
    })

    it("should include gender segments", () => {
      const categories = COMPREHENSIVE_COLUMNS.map((c) => c.category)
      expect(categories).toContain("Gender")
    })

    it("should include income segments", () => {
      const categories = COMPREHENSIVE_COLUMNS.map((c) => c.category)
      expect(categories).toContain("Income")
    })

    it("should include location segments", () => {
      const categories = COMPREHENSIVE_COLUMNS.map((c) => c.category)
      expect(categories).toContain("Location")
    })

    it("should include behavioral segments", () => {
      const categories = COMPREHENSIVE_COLUMNS.map((c) => c.category)
      expect(categories).toContain("Behavioral")
    })
  })

  describe("COMPREHENSIVE_DATA", () => {
    it("should have 100+ metrics", () => {
      expect(COMPREHENSIVE_DATA.length).toBeGreaterThanOrEqual(100)
    })

    it("should have required properties for each row", () => {
      COMPREHENSIVE_DATA.forEach((row) => {
        expect(row).toHaveProperty("id")
        expect(row).toHaveProperty("metric")
        expect(row).toHaveProperty("category")
        expect(row).toHaveProperty("values")
      })
    })

    it("should have unique ids", () => {
      const ids = COMPREHENSIVE_DATA.map((r) => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it("should have values for all audience columns", () => {
      const columnKeys = COMPREHENSIVE_COLUMNS.map((c) => c.key)
      COMPREHENSIVE_DATA.forEach((row) => {
        columnKeys.forEach((key) => {
          expect(row.values).toHaveProperty(key)
          expect(typeof row.values[key]).toBe("number")
        })
      })
    })

    it("should have values between 0 and 100 (percentages)", () => {
      COMPREHENSIVE_DATA.forEach((row) => {
        Object.values(row.values).forEach((value) => {
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(100)
        })
      })
    })

    it("should include Social Media category", () => {
      const categories = [...new Set(COMPREHENSIVE_DATA.map((r) => r.category))]
      expect(categories).toContain("Social Media")
    })

    it("should include E-commerce category", () => {
      const categories = [...new Set(COMPREHENSIVE_DATA.map((r) => r.category))]
      expect(categories).toContain("E-commerce")
    })

    it("should include Entertainment category", () => {
      const categories = [...new Set(COMPREHENSIVE_DATA.map((r) => r.category))]
      expect(categories).toContain("Entertainment")
    })

    it("should have metadata for each row", () => {
      COMPREHENSIVE_DATA.forEach((row) => {
        expect(row).toHaveProperty("metadata")
        if (row.metadata) {
          expect(row.metadata).toHaveProperty("source")
          // Metadata contains description and source
          expect(typeof row.metadata.source).toBe("string")
        }
      })
    })
  })

  describe("COMPREHENSIVE_FILTER_FIELDS", () => {
    it("should have filter fields defined", () => {
      expect(COMPREHENSIVE_FILTER_FIELDS.length).toBeGreaterThan(0)
    })

    it("should have required properties for each filter field", () => {
      COMPREHENSIVE_FILTER_FIELDS.forEach((field) => {
        expect(field).toHaveProperty("id")
        expect(field).toHaveProperty("label")
        expect(field).toHaveProperty("type")
      })
    })

    it("should include category filter", () => {
      const categoryFilter = COMPREHENSIVE_FILTER_FIELDS.find(
        (f) => f.id === "category"
      )
      expect(categoryFilter).toBeDefined()
    })

    it("should include metric filter", () => {
      const metricFilter = COMPREHENSIVE_FILTER_FIELDS.find(
        (f) => f.id === "metric"
      )
      expect(metricFilter).toBeDefined()
    })
  })

  describe("COMPREHENSIVE_VARIABLES", () => {
    it("should have variables defined", () => {
      expect(COMPREHENSIVE_VARIABLES.length).toBeGreaterThan(0)
    })

    it("should have required properties for each variable", () => {
      COMPREHENSIVE_VARIABLES.forEach((variable) => {
        expect(variable).toHaveProperty("id")
        expect(variable).toHaveProperty("name")
        expect(variable).toHaveProperty("type")
      })
    })
  })

  describe("DATA_SUMMARY", () => {
    it("should have correct totalMetrics count", () => {
      expect(DATA_SUMMARY.totalMetrics).toBe(COMPREHENSIVE_DATA.length)
    })

    it("should have correct totalAudiences count", () => {
      expect(DATA_SUMMARY.totalAudiences).toBe(COMPREHENSIVE_COLUMNS.length)
    })

    it("should have categories array", () => {
      expect(Array.isArray(DATA_SUMMARY.categories)).toBe(true)
      expect(DATA_SUMMARY.categories.length).toBeGreaterThan(0)
    })

    it("should have unique categories", () => {
      const uniqueCategories = new Set(DATA_SUMMARY.categories)
      expect(uniqueCategories.size).toBe(DATA_SUMMARY.categories.length)
    })

    it("should have audienceCategories array", () => {
      expect(Array.isArray(DATA_SUMMARY.audienceCategories)).toBe(true)
      expect(DATA_SUMMARY.audienceCategories.length).toBeGreaterThan(0)
    })

    it("should have categories matching data categories", () => {
      const dataCategories = [...new Set(COMPREHENSIVE_DATA.map((r) => r.category))]
      expect(DATA_SUMMARY.categories.sort()).toEqual(dataCategories.sort())
    })

    it("should have audienceCategories matching column categories", () => {
      const columnCategories = [...new Set(COMPREHENSIVE_COLUMNS.map((c) => c.category))]
      expect(DATA_SUMMARY.audienceCategories.sort()).toEqual(columnCategories.sort())
    })
  })

  describe("Data Consistency", () => {
    it("should have consistent column keys between columns and data values", () => {
      const columnKeys = new Set(COMPREHENSIVE_COLUMNS.map((c) => c.key))
      COMPREHENSIVE_DATA.forEach((row) => {
        const valueKeys = Object.keys(row.values)
        valueKeys.forEach((key) => {
          expect(columnKeys.has(key)).toBe(true)
        })
      })
    })

    it("should have realistic demographic differences in values", () => {
      // Gen Z should generally have higher social media usage
      const instagramMetric = COMPREHENSIVE_DATA.find(
        (r) => r.metric.includes("Instagram") && r.metric.includes("Daily")
      )
      if (instagramMetric) {
        const genZValue = instagramMetric.values["Gen Z (18-24)"]
        const boomersValue = instagramMetric.values["Boomers (57-75)"]
        // Both values should be defined and non-null
        expect(genZValue).toBeDefined()
        expect(boomersValue).toBeDefined()
        if (genZValue !== null && boomersValue !== null) {
          expect(genZValue).toBeGreaterThan(boomersValue)
        }
      }
    })

    it("should have realistic income differences for luxury metrics", () => {
      // High income should have higher luxury brand engagement
      const luxuryMetric = COMPREHENSIVE_DATA.find(
        (r) => r.metric.includes("Luxury") || r.metric.includes("Premium")
      )
      if (luxuryMetric) {
        const highIncomeValue = luxuryMetric.values["High Income"]
        const lowIncomeValue = luxuryMetric.values["Low Income"]
        // Both values should be defined and non-null
        expect(highIncomeValue).toBeDefined()
        expect(lowIncomeValue).toBeDefined()
        if (highIncomeValue !== null && lowIncomeValue !== null) {
          expect(highIncomeValue).toBeGreaterThan(lowIncomeValue)
        }
      }
    })
  })
})
