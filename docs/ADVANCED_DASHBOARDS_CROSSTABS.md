# Advanced Dashboards & Cross-tabs Documentation

## Overview

This document describes the advanced Dashboard and Cross-tabs features implemented in the GWI AI Agent Framework. These features provide enterprise-grade data visualization, analysis, and export capabilities with full editing, clickable interactions, and comprehensive export options.

## Features Summary

| Feature | Description | Location |
|---------|-------------|----------|
| Dashboard Builder | Drag-drop widget builder with resize | `/dashboard/dashboards/builder` |
| Interactive Chart Editor | Visual chart configuration tool | `components/charts/interactive-chart-editor.tsx` |
| Advanced Crosstab Grid | Editable pivot-style data grid | `components/crosstabs/advanced-crosstab-grid.tsx` |
| Calculated Fields | Formula builder for custom metrics | `components/crosstabs/calculated-fields.tsx` |
| Advanced Filters | Multi-condition filter builder | `components/crosstabs/advanced-filters.tsx` |
| Export Manager | Multi-format export with scheduling | `components/export/export-manager.tsx` |

---

## 1. Advanced Dashboard Builder

### Location
- **Component:** `components/dashboard/advanced-dashboard-builder.tsx`
- **Page:** `app/dashboard/dashboards/builder/page.tsx`
- **Route:** `/dashboard/dashboards/builder`

### Features

#### Widget Management
- **6 Widget Types:**
  - `chart` - Any of the 10 supported chart types
  - `kpi` - Key Performance Indicator cards with value, change %, and target
  - `metric` - Single metric display with icon
  - `table` - Tabular data display
  - `text` - Rich text content
  - `image` - Image display with URL support

#### Drag & Drop
- Click and drag widgets by the grip handle
- Real-time position updates
- Collision-free placement

#### Resize Handles
- 8-directional resize (N, S, E, W, NE, NW, SE, SW)
- Minimum widget size enforced (2x2 grid units)
- Visual feedback during resize

#### Grid System
- Configurable grid dimensions (6, 8, 12, or 16 columns)
- Row count options (4, 6, 8, 10, 12)
- Toggle grid lines visibility
- Snap-to-grid option

#### Undo/Redo
- Full history tracking
- Keyboard shortcuts: `Ctrl+Z` (undo), `Ctrl+Y` or `Ctrl+Shift+Z` (redo)

#### Widget Actions
- **Edit:** Open configuration dialog
- **Duplicate:** Create copy with offset position (`Ctrl+D`)
- **Lock/Unlock:** Prevent accidental moves
- **Hide/Show:** Toggle visibility
- **Delete:** Remove widget (`Delete` key)
- **Fullscreen:** Expand widget to modal view

### Usage Example

```tsx
import { AdvancedDashboardBuilder } from "@/components/dashboard"

<AdvancedDashboardBuilder
  initialState={{
    name: "My Dashboard",
    description: "Sales performance overview",
    widgets: [],
    gridColumns: 12,
    gridRows: 8,
  }}
  onSave={(state) => saveDashboard(state)}
  onExport={(format, state) => exportDashboard(format, state)}
/>
```

### Widget Configuration Options

```typescript
interface WidgetConfig {
  chartType?: ChartType      // For chart widgets
  title?: string
  subtitle?: string
  dataSource?: string        // 'sample' | 'api' | 'crosstab' | 'custom'
  refreshInterval?: number   // Auto-refresh in seconds
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  backgroundColor?: string
  textContent?: string       // For text widgets
  imageUrl?: string          // For image widgets
  kpiValue?: string | number // For KPI/metric widgets
  kpiChange?: number         // Percentage change
  kpiTarget?: number         // Target value
}
```

---

## 2. Interactive Chart Editor

### Location
- **Component:** `components/charts/interactive-chart-editor.tsx`
- **Export:** `components/charts/index.ts`

### Features

#### Chart Type Selection
Visual grid with 10 chart types:
- BAR, LINE, AREA, PIE, DONUT, RADAR, SCATTER, FUNNEL, TREEMAP, HEATMAP

#### Configuration Panels

**General Tab:**
- Chart title and subtitle
- X/Y axis labels
- Chart type specific options

**Colors Tab:**
- 8 preset color palettes: Default, Ocean, Sunset, Forest, Warm, Cool, Monochrome, Pastel
- Custom color picker
- Add/remove colors from palette

**Display Tab:**
- Show/hide legend (with position: top, bottom, left, right)
- Show/hide grid lines
- Show/hide tooltips
- Show/hide labels
- Show/hide data values
- Enable/disable animation

**Style Tab:**
- Chart height (200-600px)
- Fill opacity (10-100%)
- Border radius (0-20px)
- Stroke width (1-5px)
- Curved vs straight lines
- Stacked bars option

**Data Tab:**
- Sort order (none, ascending, descending)
- Filter threshold (minimum value)
- Data point editor
- Add/remove data points

### Usage Example

```tsx
import { InteractiveChartEditor } from "@/components/charts"

<InteractiveChartEditor
  initialConfig={{
    type: "BAR",
    title: "Monthly Sales",
  }}
  initialData={salesData}
  onSave={(config, data) => saveChart(config, data)}
  onExport={(format, config, data) => exportChart(format)}
/>
```

---

## 3. Advanced Crosstab Grid

### Location
- **Component:** `components/crosstabs/advanced-crosstab-grid.tsx`
- **Page:** `app/dashboard/crosstabs/analysis/page.tsx`
- **Route:** `/dashboard/crosstabs/analysis`

### Features

#### View Modes
| Mode | Description | Example |
|------|-------------|---------|
| `percentage` | Raw percentage values | `45%` |
| `index` | Index to base column (base = 100) | `125` |
| `difference` | Difference from base | `+12` |
| `raw` | Raw numeric values | `4,523` |

#### Cell Interactions

**Click:**
- Single click: Select cell
- Ctrl+Click: Multi-select cells
- Double-click: Open drill-down modal

**Edit Mode:**
- Enable via Edit toggle button
- Click cell to edit value inline
- Enter to save, Escape to cancel

**Context Menu (Right-click):**
- Drill Down
- Edit Value
- Copy
- Visualize (Bar, Line, Pie)
- Set as Base

#### Statistical Features
- **Significance Testing:** Cells marked with `*` when statistically significant (p < 0.05)
- **Trend Indicators:** ↑ for highest, ↓ for lowest in row
- **Sparklines:** Mini bar charts showing value distribution per row
- **Statistics Columns:** Average, Min, Max for each metric

#### Conditional Formatting
Built-in rules (customizable):
- Values > 70: Green highlight
- Values < 30: Red highlight
- Index > 130: Green
- Index < 70: Red

#### Column Management
- Show/hide columns via dropdown
- Base column selection for index/difference modes
- Frozen first column option

### Data Structures

```typescript
interface CrosstabRow {
  id: string
  metric: string
  category?: string
  values: Record<string, number | null>
  isCalculated?: boolean
  formula?: string
  children?: CrosstabRow[]  // For hierarchical data
  metadata?: {
    description?: string
    source?: string
    lastUpdated?: string
  }
}

interface CrosstabColumn {
  id: string
  key: string
  label: string
  category?: string
  isTotal?: boolean
  isHidden?: boolean
  width?: number
  color?: string
}

interface CrosstabConfig {
  viewMode: "percentage" | "index" | "difference" | "raw"
  baseColumn: string
  showStatistics: boolean
  showSparklines: boolean
  showConditionalFormatting: boolean
  showSignificance: boolean
  significanceLevel: number
  decimalPlaces: number
  showTotals: boolean
  showRowNumbers: boolean
  freezeFirstColumn: boolean
  highlightOnHover: boolean
  editMode: boolean
}
```

### Usage Example

```tsx
import { AdvancedCrosstabGrid } from "@/components/crosstabs"

<AdvancedCrosstabGrid
  columns={audienceColumns}
  data={metricData}
  title="Platform Usage by Generation"
  config={{
    viewMode: "percentage",
    showStatistics: true,
    showSparklines: true,
    showSignificance: true,
    editMode: false,
  }}
  onCellClick={(cell, value) => handleClick(cell)}
  onCellEdit={(cell, newValue) => handleEdit(cell, newValue)}
  onDrillDown={(cell, row) => handleDrillDown(cell, row)}
/>
```

---

## 4. Calculated Fields System

### Location
- **Component:** `components/crosstabs/calculated-fields.tsx`

### Available Functions

#### Math Functions
| Function | Syntax | Description |
|----------|--------|-------------|
| `ABS` | `ABS(value)` | Absolute value |
| `ROUND` | `ROUND(value, decimals)` | Round to decimals |
| `FLOOR` | `FLOOR(value)` | Round down |
| `CEIL` | `CEIL(value)` | Round up |
| `SQRT` | `SQRT(value)` | Square root |
| `POWER` | `POWER(base, exp)` | Power function |
| `LOG` | `LOG(value)` | Natural logarithm |
| `EXP` | `EXP(value)` | Exponential |
| `MOD` | `MOD(value, divisor)` | Modulo |

#### Statistical Functions
| Function | Syntax | Description |
|----------|--------|-------------|
| `AVG` | `AVG(values...)` | Average |
| `SUM` | `SUM(values...)` | Sum |
| `MIN` | `MIN(values...)` | Minimum |
| `MAX` | `MAX(values...)` | Maximum |
| `COUNT` | `COUNT(values...)` | Count |
| `MEDIAN` | `MEDIAN(values...)` | Median |
| `STDEV` | `STDEV(values...)` | Standard deviation |
| `VARIANCE` | `VARIANCE(values...)` | Variance |
| `PERCENTILE` | `PERCENTILE(values, n)` | Nth percentile |

#### Logical Functions
| Function | Syntax | Description |
|----------|--------|-------------|
| `IF` | `IF(cond, true_val, false_val)` | Conditional |
| `AND` | `AND(cond1, cond2, ...)` | Logical AND |
| `OR` | `OR(cond1, cond2, ...)` | Logical OR |
| `NOT` | `NOT(condition)` | Logical NOT |
| `COALESCE` | `COALESCE(val1, val2, ...)` | First non-null |
| `CASE` | `CASE(cond1, val1, ..., default)` | Multiple conditions |

#### Aggregation Functions
| Function | Syntax | Description |
|----------|--------|-------------|
| `INDEX` | `INDEX(value, base)` | Calculate index |
| `GROWTH` | `GROWTH(current, previous)` | Growth rate % |
| `DIFF` | `DIFF(value, base)` | Difference |
| `SHARE` | `SHARE(value, total)` | Share of total % |
| `RANK` | `RANK(value, values...)` | Rank in set |
| `ZSCORE` | `ZSCORE(value, mean, stdev)` | Z-score |

### Pre-built Templates

1. **Index Calculation:** `([Target_Metric] / [Base_Metric]) * 100`
2. **Growth Rate:** `(([Current] - [Previous]) / [Previous]) * 100`
3. **Net Promoter Score:** `[Promoters] - [Detractors]`
4. **Weighted Average:** `SUM([Value1] * [Weight1], ...) / SUM([Weight1], ...)`
5. **Percentage Point Diff:** `[Metric_A] - [Metric_B]`
6. **Share of Voice:** `([Brand_Mentions] / [Total_Mentions]) * 100`
7. **Conversion Rate:** `([Conversions] / [Visitors]) * 100`
8. **Year-over-Year:** `(([This_Year] - [Last_Year]) / [Last_Year]) * 100`

### Usage Example

```tsx
import { CalculatedFieldsManager } from "@/components/crosstabs"

<CalculatedFieldsManager
  fields={existingFields}
  availableVariables={[
    { id: "1", name: "Gen_Z", label: "Gen Z (18-24)", type: "audience", value: 65 },
    { id: "2", name: "Total", label: "Total Sample", type: "constant", value: 10000 },
  ]}
  onFieldAdd={(field) => addField(field)}
  onFieldUpdate={(id, updates) => updateField(id, updates)}
  onFieldDelete={(id) => deleteField(id)}
  onFieldApply={(field) => applyToGrid(field)}
/>
```

---

## 5. Advanced Filters

### Location
- **Component:** `components/crosstabs/advanced-filters.tsx`

### Filter Types

| Type | Operators |
|------|-----------|
| `text` | equals, not_equals, contains, not_contains, starts_with, ends_with, is_null, is_not_null |
| `number` | equals, not_equals, greater_than, less_than, greater_or_equal, less_or_equal, between, not_between, top_n, bottom_n, above_average, below_average, is_null, is_not_null |
| `date` | equals, not_equals, greater_than (after), less_than (before), between, is_null, is_not_null |
| `boolean` | equals |
| `select` | equals, not_equals, in, not_in, is_null, is_not_null |
| `multi-select` | in (includes any), not_in (excludes all), is_null, is_not_null |

### Features

#### Filter Groups
- Multiple groups with AND/OR logic between groups
- Multiple conditions per group with AND/OR logic
- Enable/disable individual conditions or entire groups
- Rename groups for organization

#### Quick Filters
- Search bar to find fields
- Quick filter buttons for common fields
- Instant application without dialog

#### Saved Filters
- Save current filter configuration
- Add name and description
- Load saved filters
- Set default filter

### Data Structures

```typescript
interface FilterField {
  id: string
  name: string
  label: string
  type: FilterType
  options?: { value: string; label: string }[]  // For select types
  min?: number   // For number sliders
  max?: number
  category?: string
}

interface FilterCondition {
  id: string
  fieldId: string
  operator: FilterOperator
  value: any
  value2?: any  // For 'between' operators
  enabled: boolean
}

interface FilterGroup {
  id: string
  name: string
  conditions: FilterCondition[]
  logic: "and" | "or"
  enabled: boolean
}
```

### Usage Example

```tsx
import { AdvancedFilters } from "@/components/crosstabs"

<AdvancedFilters
  fields={[
    { id: "metric", name: "metric", label: "Metric", type: "text" },
    { id: "value", name: "value", label: "Value", type: "number", min: 0, max: 100 },
    { id: "category", name: "category", label: "Category", type: "select", options: [...] },
  ]}
  activeFilters={filters}
  savedFilters={savedFilters}
  onFiltersChange={(filters) => setFilters(filters)}
  onFilterSave={(filter) => saveFilter(filter)}
  onFilterApply={(filters) => applyFilters(filters)}
/>
```

---

## 6. Export Manager

### Location
- **Component:** `components/export/export-manager.tsx`
- **Export:** `components/export/index.ts`

### Supported Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| PDF | `.pdf` | Formatted document with headers/footers |
| Excel | `.xlsx` | Full spreadsheet with formulas, filters |
| CSV | `.csv` | Simple comma-separated values |
| PNG | `.png` | High-quality raster image |
| SVG | `.svg` | Scalable vector graphics |
| JSON | `.json` | Raw data export |
| PPTX | `.pptx` | PowerPoint presentation |
| HTML | `.html` | Interactive web page |

### Format-Specific Options

#### PDF Options
- Orientation: portrait/landscape
- Paper size: A4, A3, Letter, Legal
- Header and footer text
- Margins (top, right, bottom, left)
- Password protection

#### Excel Options
- Sheet name
- Auto-filter on header row
- Freeze rows/columns
- Include formulas
- Number formatting

#### CSV Options
- Delimiter: comma, semicolon, tab, pipe
- Quote string values
- Encoding: UTF-8, UTF-16, ASCII

#### Image Options
- Scale: 1x, 2x, 3x, 4x
- Background color
- Quality: low, medium, high

### Scheduling (Enterprise)
- Daily, weekly, or monthly exports
- Time selection
- Email delivery

### Data Structure

```typescript
interface ExportData {
  type: "dashboard" | "crosstab" | "chart" | "table" | "report"
  title: string
  data: any
  columns?: { key: string; label: string; type?: string }[]
  metadata?: {
    createdAt?: string
    createdBy?: string
    description?: string
    filters?: any
    dateRange?: { start: string; end: string }
  }
}

interface ExportOptions {
  format: ExportFormat
  fileName: string
  includeTitle: boolean
  includeTimestamp: boolean
  includeLogo: boolean
  logoUrl?: string
  orientation: "portrait" | "landscape"
  paperSize: "a4" | "a3" | "letter" | "legal"
  quality: "low" | "medium" | "high"
  compression: boolean
  watermark?: string
  password?: string
  // ... format-specific options
}
```

### Usage Examples

#### Quick Export Dropdown
```tsx
import { ExportManager } from "@/components/export"

<ExportManager
  data={{
    type: "crosstab",
    title: "Platform Analysis",
    data: crosstabData,
    columns: columnDefinitions,
  }}
  onExport={(result) => handleExportComplete(result)}
/>
```

#### Quick Export Button
```tsx
import { QuickExportButton } from "@/components/export"

<QuickExportButton
  data={exportData}
  format="csv"
  onExport={(result) => console.log(result)}
/>
```

---

## File Structure

```
components/
├── charts/
│   ├── chart-renderer.tsx           # Base chart component
│   ├── interactive-chart-editor.tsx # NEW: Visual chart editor
│   └── index.ts
├── crosstabs/
│   ├── enhanced-data-table.tsx      # Basic crosstab table
│   ├── advanced-crosstab-grid.tsx   # NEW: Full-featured grid
│   ├── calculated-fields.tsx        # NEW: Formula builder
│   ├── advanced-filters.tsx         # NEW: Filter builder
│   ├── crosstab-templates.tsx       # Template selector
│   ├── visualization-modal.tsx      # Chart modal
│   ├── trend-tracking.tsx           # Trend analysis
│   ├── insights-panel.tsx           # AI insights
│   └── index.ts
├── dashboard/
│   ├── advanced-dashboard-builder.tsx # NEW: Drag-drop builder
│   ├── dashboard-header.tsx
│   ├── hero-metrics.tsx
│   ├── performance-charts.tsx
│   └── index.ts
└── export/
    ├── export-manager.tsx           # NEW: Export system
    └── index.ts

app/dashboard/
├── dashboards/
│   ├── builder/
│   │   └── page.tsx                 # NEW: Builder page
│   ├── [id]/
│   │   └── page.tsx
│   └── page.tsx
└── crosstabs/
    ├── analysis/
    │   └── page.tsx                 # NEW: Analysis page
    ├── [id]/
    │   └── page.tsx
    └── page.tsx
```

---

## Keyboard Shortcuts

### Dashboard Builder
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Ctrl+D` | Duplicate selected widget |
| `Ctrl+S` | Save dashboard |
| `Delete` | Delete selected widget |
| `Escape` | Deselect / Close dialogs |

### Crosstab Grid
| Shortcut | Action |
|----------|--------|
| `Ctrl+Click` | Multi-select cells |
| `Double-click` | Drill down |
| `Ctrl+C` | Copy selected cells |
| `Escape` | Cancel edit / Deselect |
| `Enter` | Save cell edit |

---

## API Endpoints

### Dashboards
- `GET /api/v1/dashboards` - List dashboards
- `POST /api/v1/dashboards` - Create dashboard
- `GET /api/v1/dashboards/:id` - Get dashboard
- `PUT /api/v1/dashboards/:id` - Update dashboard
- `DELETE /api/v1/dashboards/:id` - Delete dashboard

### Crosstabs
- `GET /api/v1/crosstabs` - List crosstabs
- `POST /api/v1/crosstabs` - Create crosstab
- `GET /api/v1/crosstabs/:id` - Get crosstab
- `PUT /api/v1/crosstabs/:id` - Update crosstab
- `DELETE /api/v1/crosstabs/:id` - Delete crosstab
- `GET /api/v1/crosstabs/:id/insights` - Generate AI insights

---

## Dependencies

These features use the following dependencies (already installed):

- **recharts** - Chart rendering
- **@radix-ui/react-*** - UI primitives
- **lucide-react** - Icons
- **tailwindcss** - Styling
- **sonner** - Toast notifications

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Performance Considerations

1. **Large Datasets:** The crosstab grid virtualizes rows for datasets > 1000 rows
2. **Widget Count:** Dashboards support up to 50 widgets without performance degradation
3. **Export Size:** Exports are streamed for files > 10MB
4. **Undo History:** Limited to 50 actions to conserve memory

---

## Future Enhancements

1. **Collaborative Editing:** Real-time multi-user dashboard editing
2. **Custom Themes:** Save and share dashboard themes
3. **Data Connectors:** Direct connections to external data sources
4. **Advanced Calculations:** Machine learning-based predictions
5. **Mobile Optimization:** Touch-friendly interactions
6. **Accessibility:** Full WCAG 2.1 AA compliance
7. **Offline Support:** Service worker for offline viewing
