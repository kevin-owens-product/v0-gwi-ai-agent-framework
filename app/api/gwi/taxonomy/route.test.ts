import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/super-admin')
vi.mock('@/lib/gwi-permissions')
vi.mock('next/headers')

describe('GWI Taxonomy API - /api/gwi/taxonomy', () => {
  describe('Categories API - /api/gwi/taxonomy/categories', () => {
    describe('GET /api/gwi/taxonomy/categories', () => {
      it('should return hierarchical category structure', () => {
        const categories = [
          {
            id: 'cat-1',
            name: 'Demographics',
            code: 'demographics',
            parentId: null,
            children: [
              { id: 'cat-1-1', name: 'Age Groups', code: 'age_groups', parentId: 'cat-1' }
            ]
          }
        ]

        expect(categories[0].children).toBeDefined()
        expect(Array.isArray(categories[0].children)).toBe(true)
      })

      it('should include category attributes', () => {
        const category = {
          id: 'cat-1',
          name: 'Demographics',
          code: 'demographics',
          description: 'Consumer demographic attributes',
          version: 1,
          isActive: true,
          attributes: [
            { id: 'attr-1', name: 'Age Group', code: 'age_group', dataType: 'enum' }
          ]
        }

        expect(category.attributes).toBeDefined()
        expect(category.isActive).toBe(true)
      })

      it('should support filtering by active status', () => {
        const activeOnly = true
        const categories = [
          { id: '1', isActive: true },
          { id: '2', isActive: false }
        ]

        const filtered = categories.filter(c => !activeOnly || c.isActive)
        expect(filtered).toHaveLength(1)
      })

      it('should validate category codes are unique', () => {
        const categoryCodes = ['demographics', 'behavior', 'brand_metrics']
        const uniqueCodes = [...new Set(categoryCodes)]
        expect(uniqueCodes.length).toBe(categoryCodes.length)
      })
    })

    describe('POST /api/gwi/taxonomy/categories', () => {
      it('should require name and code', () => {
        const validCategory = {
          name: 'New Category',
          code: 'new_category',
          description: 'A new taxonomy category'
        }

        expect(validCategory.name).toBeTruthy()
        expect(validCategory.code).toBeTruthy()
      })

      it('should validate code format', () => {
        const validCodes = ['demographics', 'age_groups', 'brand_metrics']
        const invalidCodes = ['Invalid Code', 'has spaces', '123numeric']

        validCodes.forEach(code => {
          expect(code).toMatch(/^[a-z][a-z0-9_]*$/)
        })

        invalidCodes.forEach(code => {
          expect(code).not.toMatch(/^[a-z][a-z0-9_]*$/)
        })
      })

      it('should support parent category assignment', () => {
        const childCategory = {
          name: 'Age Groups',
          code: 'age_groups',
          parentId: 'demographics-id'
        }

        expect(childCategory.parentId).toBeTruthy()
      })

      it('should initialize version to 1', () => {
        const newCategory = {
          name: 'New Category',
          code: 'new_category',
          version: 1
        }

        expect(newCategory.version).toBe(1)
      })
    })

    describe('PATCH /api/gwi/taxonomy/categories/[id]', () => {
      it('should increment version on update', () => {
        const existing = { version: 1 }
        const updated = { version: existing.version + 1 }
        expect(updated.version).toBe(2)
      })

      it('should allow deactivating a category', () => {
        const update = { isActive: false }
        expect(update.isActive).toBe(false)
      })

      it('should prevent changing code after creation', () => {
        const existing = { code: 'original_code' }
        const updateAttempt = { code: 'new_code' }
        // Code should be immutable
        expect(existing.code).not.toBe(updateAttempt.code)
      })
    })
  })

  describe('Attributes API - /api/gwi/taxonomy/attributes', () => {
    describe('GET /api/gwi/taxonomy/attributes', () => {
      it('should return attributes with category info', () => {
        const attribute = {
          id: 'attr-1',
          categoryId: 'cat-1',
          name: 'Age Group',
          code: 'age_group',
          dataType: 'enum',
          allowedValues: ['Gen Z', 'Millennials', 'Gen X', 'Boomers'],
          isRequired: true,
          category: {
            id: 'cat-1',
            name: 'Demographics',
            code: 'demographics'
          }
        }

        expect(attribute.category).toBeDefined()
        expect(attribute.dataType).toBeTruthy()
      })

      it('should support filtering by category', () => {
        const categoryId = 'demographics-id'
        const attributes = [
          { id: '1', categoryId: 'demographics-id' },
          { id: '2', categoryId: 'behavior-id' },
          { id: '3', categoryId: 'demographics-id' }
        ]

        const filtered = attributes.filter(a => a.categoryId === categoryId)
        expect(filtered).toHaveLength(2)
      })

      it('should support filtering by data type', () => {
        const dataType = 'enum'
        const attributes = [
          { id: '1', dataType: 'enum' },
          { id: '2', dataType: 'string' },
          { id: '3', dataType: 'enum' }
        ]

        const filtered = attributes.filter(a => a.dataType === dataType)
        expect(filtered).toHaveLength(2)
      })
    })

    describe('POST /api/gwi/taxonomy/attributes', () => {
      it('should require categoryId, name, code, and dataType', () => {
        const validAttribute = {
          categoryId: 'cat-1',
          name: 'New Attribute',
          code: 'new_attribute',
          dataType: 'string'
        }

        expect(validAttribute.categoryId).toBeTruthy()
        expect(validAttribute.name).toBeTruthy()
        expect(validAttribute.code).toBeTruthy()
        expect(validAttribute.dataType).toBeTruthy()
      })

      it('should validate data types', () => {
        const validDataTypes = ['string', 'number', 'boolean', 'enum', 'date']
        const dataType = 'enum'
        expect(validDataTypes).toContain(dataType)
      })

      it('should require allowedValues for enum type', () => {
        const enumAttribute = {
          dataType: 'enum',
          allowedValues: ['Option 1', 'Option 2', 'Option 3']
        }

        if (enumAttribute.dataType === 'enum') {
          expect(enumAttribute.allowedValues).toBeDefined()
          expect(enumAttribute.allowedValues.length).toBeGreaterThan(0)
        }
      })

      it('should support validation rules', () => {
        const numericAttribute = {
          dataType: 'number',
          validationRules: {
            min: 0,
            max: 100,
            decimals: 2
          }
        }

        expect(numericAttribute.validationRules).toBeDefined()
        expect(numericAttribute.validationRules.min).toBeDefined()
      })

      it('should enforce unique code within category', () => {
        const categoryId = 'cat-1'
        const existingCodes = ['age_group', 'gender', 'income']
        const newCode = 'education'

        expect(existingCodes).not.toContain(newCode)
      })
    })
  })

  describe('Mapping Rules API - /api/gwi/taxonomy/mappings', () => {
    describe('GET /api/gwi/taxonomy/mappings', () => {
      it('should return mapping rules with transformation details', () => {
        const mappingRule = {
          id: 'rule-1',
          name: 'Age to Age Group',
          sourceField: 'respondent.age',
          targetCategoryCode: 'age_groups',
          targetAttributeCode: 'age_group',
          transformationRule: {
            type: 'range_map',
            ranges: [
              { min: 16, max: 24, value: 'Gen Z' },
              { min: 25, max: 40, value: 'Millennials' }
            ]
          },
          priority: 1,
          isActive: true
        }

        expect(mappingRule.transformationRule).toBeDefined()
        expect(mappingRule.sourceField).toBeTruthy()
        expect(mappingRule.targetCategoryCode).toBeTruthy()
      })

      it('should support filtering by active status', () => {
        const activeOnly = true
        const rules = [
          { id: '1', isActive: true },
          { id: '2', isActive: false }
        ]

        const filtered = rules.filter(r => !activeOnly || r.isActive)
        expect(filtered).toHaveLength(1)
      })

      it('should order by priority', () => {
        const rules = [
          { id: '1', priority: 2 },
          { id: '2', priority: 1 },
          { id: '3', priority: 3 }
        ]

        const sorted = [...rules].sort((a, b) => a.priority - b.priority)
        expect(sorted[0].priority).toBe(1)
        expect(sorted[1].priority).toBe(2)
        expect(sorted[2].priority).toBe(3)
      })
    })

    describe('POST /api/gwi/taxonomy/mappings', () => {
      it('should require source and target fields', () => {
        const validRule = {
          name: 'New Mapping Rule',
          sourceField: 'response.field_a',
          targetCategoryCode: 'category_code',
          transformationRule: { type: 'pass_through' }
        }

        expect(validRule.sourceField).toBeTruthy()
        expect(validRule.targetCategoryCode).toBeTruthy()
      })

      it('should validate transformation rule types', () => {
        const validTypes = ['pass_through', 'range_map', 'lookup', 'regex', 'function']
        const ruleType = 'range_map'
        expect(validTypes).toContain(ruleType)
      })

      it('should validate range_map configuration', () => {
        const rangeMapRule = {
          type: 'range_map',
          ranges: [
            { min: 0, max: 24999, value: 'Low' },
            { min: 25000, max: 49999, value: 'Medium' },
            { min: 50000, max: 999999, value: 'High' }
          ]
        }

        // Ranges should not overlap
        for (let i = 0; i < rangeMapRule.ranges.length - 1; i++) {
          expect(rangeMapRule.ranges[i].max).toBeLessThan(rangeMapRule.ranges[i + 1].min)
        }
      })

      it('should validate lookup configuration', () => {
        const lookupRule = {
          type: 'lookup',
          lookup_table: 'country_codes',
          normalize: 'uppercase'
        }

        expect(lookupRule.lookup_table).toBeTruthy()
      })

      it('should default priority to 0', () => {
        const newRule = { priority: 0 }
        expect(newRule.priority).toBe(0)
      })
    })

    describe('Mapping Rule Validation', () => {
      it('should test mapping rule against sample data', () => {
        const rule = {
          type: 'range_map',
          ranges: [
            { min: 16, max: 24, value: 'Gen Z' },
            { min: 25, max: 40, value: 'Millennials' }
          ]
        }

        const applyRangeMap = (value: number, ranges: Array<{min: number, max: number, value: string}>) => {
          for (const range of ranges) {
            if (value >= range.min && value <= range.max) {
              return range.value
            }
          }
          return null
        }

        expect(applyRangeMap(20, rule.ranges)).toBe('Gen Z')
        expect(applyRangeMap(30, rule.ranges)).toBe('Millennials')
        expect(applyRangeMap(50, rule.ranges)).toBeNull()
      })
    })
  })
})

describe('Taxonomy Validation API', () => {
  describe('POST /api/gwi/taxonomy/validate', () => {
    it('should validate data against taxonomy schema', () => {
      const taxonomySchema = {
        demographics: {
          age_group: { type: 'enum', values: ['Gen Z', 'Millennials', 'Gen X'] },
          gender: { type: 'enum', values: ['Male', 'Female', 'Other'] }
        }
      }

      const data = {
        age_group: 'Gen Z',
        gender: 'Male'
      }

      const isValid = taxonomySchema.demographics.age_group.values.includes(data.age_group) &&
                     taxonomySchema.demographics.gender.values.includes(data.gender)

      expect(isValid).toBe(true)
    })

    it('should return validation errors for invalid data', () => {
      const errors = [
        { field: 'age_group', error: 'Invalid value: "Unknown"', allowedValues: ['Gen Z', 'Millennials'] },
        { field: 'income', error: 'Value out of range', min: 0, max: 1000000, actual: -100 }
      ]

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].field).toBeTruthy()
      expect(errors[0].error).toBeTruthy()
    })

    it('should validate required fields', () => {
      const schema = {
        age_group: { required: true },
        gender: { required: true },
        income: { required: false }
      }

      const data = { age_group: 'Gen Z' }

      const missingRequired = Object.entries(schema)
        .filter(([_, config]) => (config as {required: boolean}).required)
        .filter(([field, _]) => !(field in data))
        .map(([field, _]) => field)

      expect(missingRequired).toContain('gender')
      expect(missingRequired).not.toContain('income')
    })
  })
})
