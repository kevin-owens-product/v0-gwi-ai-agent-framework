# ADR-003: Taxonomy System Design

## Status
Accepted

## Date
2024-01-15

## Context
GWI's data standardization requires a hierarchical taxonomy system to classify and transform survey responses into consistent, comparable data points across markets and time periods. The taxonomy must:
- Support hierarchical categories (e.g., Demographics > Age Groups)
- Define attributes with validation rules
- Enable automatic data mapping via transformation rules
- Version-control changes for audit compliance

## Decision
We implement a three-tier taxonomy system:

### Data Model

```
TaxonomyCategory (1) ---> (N) TaxonomyCategory (children)
TaxonomyCategory (1) ---> (N) TaxonomyAttribute
TaxonomyMappingRule (N) ---> TaxonomyCategory
```

### Key Design Decisions

1. **Self-Referential Category Hierarchy**:
   - Categories reference parent via `parentId`
   - Enables unlimited nesting depth
   - Root categories have `null` parentId

2. **Attribute Data Types**:
   - `string` - Free text
   - `number` - Numeric values with min/max
   - `boolean` - True/false flags
   - `enum` - Constrained value list
   - `date` - Date values

3. **Unique Code Convention**:
   - Categories: globally unique `code` (e.g., `demographics`, `age_groups`)
   - Attributes: unique `code` within category (e.g., `age_group`, `gender`)
   - Codes use snake_case, lowercase

4. **Validation Rules as JSON**:
   ```json
   {
     "min": 0,
     "max": 100,
     "pattern": "^[A-Z]{2}$",
     "decimals": 2
   }
   ```

5. **Mapping Rules with Priorities**:
   - Multiple rules can target same field
   - Priority determines execution order
   - Higher priority rules override lower
   - Supports transformation types:
     - `pass_through` - Direct value copy
     - `range_map` - Numeric range to category
     - `lookup` - Table-based translation
     - `regex` - Pattern-based extraction
     - `function` - Custom transformation logic

6. **Active/Inactive States**:
   - Categories and rules can be deactivated
   - Deactivation doesn't delete, preserves history
   - Queries filter by `isActive` by default

## Consequences

### Positive
- Flexible hierarchy supports any classification structure
- JSON validation rules extensible without schema changes
- Priority-based rules handle complex transformations
- Version tracking enables audit compliance

### Negative
- Self-referential queries can be expensive
- No database-level validation of transformation results
- Circular reference possible in hierarchy

### Mitigation
- Add `hierarchyPath` for efficient ancestor queries
- Pipeline validation catches transformation errors
- Application-level cycle detection on category creation

## Example Taxonomy Structure

```
demographics (root)
├── age_groups
│   └── age_group (enum: Gen Z, Millennials, Gen X, Boomers)
├── gender (enum: Male, Female, Non-binary)
└── income_brackets
    └── income_bracket (enum: Low, Medium, High)

behavior (root)
├── purchase_behavior
│   ├── purchase_frequency (enum: Daily, Weekly, Monthly)
│   └── aov (number: min 0)
└── media_consumption
    └── social_media_hours (number: min 0, max 24)
```

## Implementation Notes
- Category CRUD: `app/api/gwi/taxonomy/categories/route.ts`
- Attribute management: `app/api/gwi/taxonomy/attributes/route.ts`
- Mapping rules: `app/api/gwi/taxonomy/mappings/route.ts`
- Validation testing: `app/api/gwi/taxonomy/validate/route.ts`
