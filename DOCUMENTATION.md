# VentureSim — Technical Documentation

Version 1.0.0 · Production Release

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Component Hierarchy](#3-component-hierarchy)
4. [Routing System](#4-routing-system)
5. [State Management](#5-state-management)
6. [Data Layer](#6-data-layer)
7. [Calculation Engines](#7-calculation-engines)
8. [Page Documentation](#8-page-documentation)
9. [Design System](#9-design-system)
10. [Animation System](#10-animation-system)
11. [Responsiveness Architecture](#11-responsiveness-architecture)
12. [Performance Architecture](#12-performance-architecture)
13. [Security Considerations](#13-security-considerations)
14. [Deployment Guide](#14-deployment-guide)
15. [Technical Decisions](#15-technical-decisions)
16. [Future Scalability](#16-future-scalability)

---

## 1. Architecture Overview

VentureSim is a single-page application (SPA) built with React that simulates startup viability. Users configure a startup, evaluate market conditions, model financials, and receive strategic analysis through an interactive dashboard and result engine.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (SPA)                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐    ┌───────────────────────────┐  │
│  │   React DOM   │    │    React Router v7        │  │
│  │   (index.js)  │───▶│    (routes.js)            │  │
│  └──────────────┘    └───────────────────────────┘  │
│         │                        │                  │
│         ▼                        ▼                  │
│  ┌──────────────┐    ┌───────────────────────────┐  │
│  │    Layout     │    │         Pages              │  │
│  │  (navbar +   │    │  Landing → Setup → Market  │  │
│  │   content)   │    │  → Finance → Dashboard     │  │
│  └──────────────┘    │  → Result                  │  │
│                      └───────────────────────────┘  │
│                               │                     │
│                               ▼                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              Service Layer                     │  │
│  │  decisionEngine · outcomeEngine · eventEngine  │  │
│  │  insightsEngine · projectionEngine             │  │
│  │  analysisEngine                                │  │
│  └───────────────────────────────────────────────┘  │
│                               │                     │
│                               ▼                     │
│  ┌───────────────────────────────────────────────┐  │
│  │          Context / State (StartupContext)       │  │
│  │     localStorage persistence (auto-save)       │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │               Data Layer                       │  │
│  │  phases.js · decisions.js · industries.js      │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | React | 19.2.4 |
| Routing | react-router-dom | 7.13.0 |
| Build | react-scripts (CRA) | 5.0.1 |
| Styling | Vanilla CSS (Single file) | — |
| Persistence | localStorage | Native |
| Charts | Hand-built SVG | — |
| Fonts | Google Fonts (Inter) | — |

### Design Principles

1. **Zero external charting dependencies** — All visualizations are hand-built SVG components, eliminating bundle bloat from libraries like recharts or d3.
2. **Single CSS file architecture** — All styles live in `index.css` with CSS custom properties for theming, keeping the runtime overhead at zero JavaScript-driven styles.
3. **Functional components only** — No class components exist in the codebase. All state is managed through hooks.
4. **Derived state over stored state** — Metrics like `operationalEfficiency`, `healthScore`, and `feasibility` are computed at render time rather than stored, preventing stale data.
5. **Stateless service layer** — All engine functions are pure: they accept input and return output with no side effects.

---

## 2. Folder Structure

```
venturesim/
├── public/
│   ├── index.html              # HTML shell with SEO meta tags
│   ├── manifest.json           # PWA manifest
│   ├── favicon.ico             # App icon
│   ├── logo192.png             # PWA icon (192×192)
│   ├── logo512.png             # PWA icon (512×512)
│   └── robots.txt              # Crawler directives
│
├── src/
│   ├── index.js                # React DOM mount point
│   ├── App.js                  # Root component with Layout + routing
│   ├── routes.js               # Route definitions
│   ├── index.css               # Complete design system + all component styles
│   │
│   ├── components/
│   │   └── Layout.js           # Navbar + page content wrapper
│   │
│   ├── context/
│   │   └── StartupContext.js   # Global state provider with localStorage persistence
│   │
│   ├── data/
│   │   ├── phases.js           # Simulation phase names
│   │   ├── decisions.js        # Decision catalog with metric effects
│   │   └── industries.js       # Industry benchmark data
│   │
│   ├── pages/
│   │   ├── LandingPage.js      # Hero + tabbed insight system
│   │   ├── SetupPage.js        # Multi-step startup configuration
│   │   ├── MarketPage.js       # 16-question market analysis engine
│   │   ├── FinancePage.js      # Financial modeling dashboard
│   │   ├── DashboardPage.js    # Strategic dashboard with charts
│   │   └── ResultPage.js       # Final viability verdict
│   │
│   └── services/
│       ├── decisionEngine.js   # Decision processing + metric application
│       ├── outcomeEngine.js    # Failure/success condition checks
│       ├── eventEngine.js      # Random event generation
│       ├── insightsEngine.js   # Metric-based insight generation
│       ├── projectionEngine.js # Outcome projection calculator
│       └── analysisEngine.js   # Startup health analysis
│
├── package.json                # Dependencies and scripts
├── CNAME                       # Custom domain for GitHub Pages
└── README.md                   # Project readme
```

### File Count Summary

| Category | Count |
|----------|-------|
| Pages | 6 |
| Components | 1 |
| Services | 6 |
| Data files | 3 |
| Infrastructure (context, routes, index, App) | 4 |
| CSS | 1 |
| **Total source files** | **21** |

---

## 3. Component Hierarchy

```
<BrowserRouter>
  <StartupProvider>
    <App>
      <Layout>
        <nav>  (navbar with NavLinks)
        <main>
          <Routes>
            / ──────────▶ <LandingPage>
            /setup ─────▶ <SetupPage>
            /market ────▶ <MarketPage>
            /finance ───▶ <FinancePage>
            /dashboard ─▶ <DashboardPage>
                            ├── <InsightStrip>
                            ├── <HealthDial>
                            ├── <StabilityMap>
                            ├── <MetricCard> (×10)
                            │   └── <Sparkline>
                            ├── <GraphPanel>
                            │   └── <SVGLineChart> (×4)
                            ├── <RiskTimeline>
                            ├── <InsightFeed>
                            └── <SimulationPanel>
            /result ────▶ <ResultPage>
                            ├── <AnimNum>
                            └── <RadarChart>
          </Routes>
        </main>
      </Layout>
    </App>
  </StartupProvider>
</BrowserRouter>
```

### Sub-Component Registry (DashboardPage)

| Component | Purpose | Props |
|-----------|---------|-------|
| `InsightStrip` | Contextual insight banner at top | `metrics`, `healthScore` |
| `HealthDial` | Animated SVG circular progress gauge | `score` |
| `StabilityMap` | 2D scatter plot (market vs execution) | `marketDemand`, `executionStrength` |
| `MetricCard` | Individual metric display with sparkline | `title`, `metricKey`, `value`, `historyData` |
| `Sparkline` | Inline SVG mini-chart | `data`, `width`, `height` |
| `SVGLineChart` | Full SVG line chart with axes | `data`, `dataKey`, `label`, `W`, `H`, `loaded` |
| `GraphPanel` | Predictive graph section container | `chartData`, `metrics` |
| `RiskTimeline` | Horizontal timeline with survival projections | `metrics` |
| `InsightFeed` | Dynamic insight list from metrics | `metrics`, `allInsights` |
| `SimulationPanel` | Forward projection simulator | `metrics`, `capital` |

### Sub-Component Registry (ResultPage)

| Component | Purpose | Props |
|-----------|---------|-------|
| `AnimNum` | Animated number counter | `value`, `suffix` |
| `RadarChart` | Pentagonal radar visualization | `data` |

---

## 4. Routing System

### Route Configuration

Routes are defined in `src/routes.js` as a flat array consumed by React Router's `useRoutes` hook:

```javascript
var routes = [
    { path: '/',          element: <LandingPage /> },
    { path: '/setup',     element: <SetupPage /> },
    { path: '/market',    element: <MarketPage /> },
    { path: '/finance',   element: <FinancePage /> },
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/result',    element: <ResultPage /> }
];
```

### Navigation Flow

```
Landing (/) ──▶ Setup (/setup) ──▶ Market (/market) ──▶ Finance (/finance)
                                                              │
                Result (/result) ◀── Dashboard (/dashboard) ◀─┘
```

### Navigation Mechanisms

| Mechanism | Location | Trigger |
|-----------|----------|---------|
| `useNavigate()` | SetupPage → MarketPage | Form submission |
| `useNavigate()` | MarketPage → FinancePage | "Continue to Finance" button |
| `useNavigate()` | FinancePage → DashboardPage | "Continue to Dashboard" button |
| `useNavigate()` | DashboardPage → ResultPage | Phase advance past final phase |
| `useNavigate()` | DashboardPage → ResultPage | Failure/success condition met |
| `useNavigate()` | LandingPage → Setup/Dashboard | Hero CTA (conditional on state) |
| `<NavLink>` | Layout navbar | Direct navigation to any page |

### Layout Integration

`App.js` wraps all routes inside `<Layout>`, which provides:
- Fixed floating navbar with glassmorphism styling
- Scroll-aware transparency transitions
- Mobile hamburger menu
- `<main className="page-content">` container with max-width constraints

---

## 5. State Management

### Architecture

VentureSim uses React Context (`StartupContext`) as its global state container. There is no Redux, Zustand, or other external state library.

### State Shape

```javascript
{
    startup: {
        name: "",            // Startup name
        industry: "",        // Selected industry key
        capital: 0,          // Starting capital in dollars
        experience: 0,       // Founder experience (0–10)
        riskTolerance: 0,    // Risk tolerance (0–100)
        status: "active"     // "active" | "failed" | "success"
    },
    metrics: {
        marketFit: 0,        // Product-market alignment (0–100)
        teamStrength: 0,     // Team execution capacity (0–100)
        growth: 0,           // Growth rate index (0–100)
        revenue: 0,          // Revenue health index (0–100)
        risk: 0,             // Risk exposure (0–100, higher = worse)
        burnRate: 0,         // Monthly burn rate index (0–100)
        runway: 0,           // Capital runway index (0–100)
        brand: 0,            // Brand strength (0–100)
        scalability: 0       // Infrastructure scalability (0–100)
    },
    currentPhase: 0,         // Current simulation phase index
    history: [],             // Array of phase snapshots
    insights: [],            // Accumulated insight strings
    futureEffects: []        // Deferred effects for future phases
}
```

### Persistence

State is persisted to `localStorage` under the key `venture_sim_state`:

- **On load**: `loadState()` reads from localStorage, falling back to `initialState` if empty or corrupt.
- **On update**: Every call to `setState()` writes the full state to localStorage via `saveState()`.
- **Error handling**: Both read and write operations are wrapped in try/catch to handle storage quota errors and invalid JSON gracefully.

### State Flow

```
SetupPage ─────────▶ Sets startup config + initial metrics
                     (name, industry, capital, experience, risk)

MarketPage ─────────▶ Updates marketFit, brand, scalability
                     (derived from 16 slider inputs)

FinancePage ────────▶ Updates burnRate, runway, revenue
                     (derived from cost/revenue model)

DashboardPage ──────▶ Reads all metrics for display
                     Applies decisions (processDecision)
                     Advances phases (handleNextPhase)
                     Checks failure/success conditions

ResultPage ─────────▶ Read-only analysis of final state
```

### Context Provider

```javascript
function StartupProvider({ children }) {
    const [state, setStateInternal] = useState(loadState);
    const setState = useCallback(function (newState) {
        setStateInternal(newState);
        saveState(newState);
    }, []);
    return (
        <StartupContext.Provider value={{ state, setState }}>
            {children}
        </StartupContext.Provider>
    );
}
```

The `useCallback` wrapper ensures `setState` has a stable reference, preventing unnecessary re-renders in consuming components.

---

## 6. Data Layer

### phases.js

Defines the six simulation phases as a string array:

```javascript
const phases = ["Idea", "Team", "Product", "Funding", "Marketing", "Scaling"];
```

Phase progression is index-based. When `currentPhase >= phases.length`, the simulation ends and redirects to `/result`.

### decisions.js

Contains 8 strategic decisions, each with an `id`, `title`, and `effects` map:

| Decision | Key Effects |
|----------|-------------|
| Hire Senior Developer | teamStrength +15, burnRate +12, scalability +10 |
| Launch Paid Ad Campaign | brand +20, growth +10, burnRate +8, revenue +5 |
| Pivot the Product | marketFit +25, risk +15, growth −10, brand −5 |
| Raise a Funding Round | growth +15, scalability +12, risk +10 |
| Cut Operational Costs | burnRate −20, teamStrength −10, risk −5 |
| Expand to New Market | growth +20, risk +18, revenue +12 |
| Build Strategic Partnerships | scalability +15, brand +12, revenue +8 |
| Invest in Product Quality | marketFit +18, brand +10, scalability +8 |

Effects are applied directly to the metrics object with clamping to `[0, 100]`.

### industries.js

Provides benchmark data for three core industries:

| Industry | Avg Margin | Failure Rate | Break-even (months) | Risk Base |
|----------|-----------|-------------|---------------------|-----------|
| Restaurant | 6% | 60% | 18 | 55 |
| SaaS | 72% | 42% | 24 | 40 |
| Retail | 10% | 50% | 14 | 48 |

This data is used by the LandingPage for contextual analysis. The SetupPage uses a separate, expanded `industryBenchmarks` map for capital benchmarking across 15 industries.

---

## 7. Calculation Engines

### decisionEngine.js

**Purpose**: Applies a decision's effects to the current state.

**Function**: `processDecision(state, decision) → newState`

**Logic**:
1. Deep-clone relevant state branches (startup, metrics, history, insights, futureEffects)
2. Iterate over `decision.effects` keys
3. For each key present in `metrics`, add the effect value
4. Clamp the result to `[0, 100]`
5. Return the new state object

**Clamping**: Implemented as `clamp(value, 0, 100)`, ensuring no metric can exceed bounds.

### outcomeEngine.js

**Purpose**: Determines if the simulation should end in failure or success.

**Functions**:

```
checkFailure(metrics, capital) → boolean
```
Returns `true` if any of:
- Capital ≤ 0
- Risk > 90
- Growth < 10

```
checkSuccess(metrics) → boolean
```
Returns `true` if all of:
- Growth > 80
- Risk < 40
- Revenue > 50

### eventEngine.js

**Purpose**: Generates random events during phase transitions.

**Function**: `generateRandomEvent() → event | null`

**Logic**:
1. Roll a random number 1–100
2. If roll > 20, return `null` (80% chance of no event)
3. Otherwise, randomly select from three events:
   - "Competitor Entered Market" → risk +10
   - "Viral Growth" → growth +15
   - "Supplier Cost Increase" → burnRate +10

### insightsEngine.js

**Purpose**: Generates metric-based insight messages.

**Function**: `generateInsights(metrics) → string[]`

**Conditions checked**:
- Risk > 70 → "Warning: Risk level is high"
- Growth < 30 → "Growth is weak"
- Market fit < 40 → "Market demand is low"
- Runway < 3 → "Runway critically low"
- Revenue > 70 → "Revenue performing strongly"

### projectionEngine.js

**Purpose**: Computes best/expected/worst case outcome projections.

**Function**: `predictOutcomes(metrics) → { bestCase, expectedCase, worstCase }`

**Logic**:
1. Compute a weighted average of all metrics (with risk and burnRate inverted)
2. Best case = base + 15 (clamped 0–100)
3. Expected case = base (clamped 0–100)
4. Worst case = base − 20 (clamped 0–100)

### analysisEngine.js

**Purpose**: Produces a health assessment with strengths and weaknesses.

**Function**: `analyzeStartup(state) → { healthStatus, warnings, strengths, weaknesses }`

**Logic**:
1. Determine `healthStatus`: "Unstable" if risk > 70, "Healthy" if growth > 70 and risk < 40, otherwise "Moderate"
2. Generate warnings for low runway, high risk, slowing growth
3. Classify each metric as strength (> 70) or weakness (< 30)

---

## 8. Page Documentation

### LandingPage

**Route**: `/`

**Purpose**: First impression and entry point. Displays VentureSim branding and a tabbed insight system.

**Key Features**:
- Full-viewport hero section with custom scroll animation on first visit
- Session-aware: auto-scrolls past hero on return visits (via `sessionStorage`)
- 5-tab insight panel (Revenue, Growth, Risk, Market, Strategy) with cross-fade transitions
- Tab content is dynamically generated based on current simulation state
- Conditional CTA: "Start Simulation" for new users, "Go to Dashboard" for returning users

**State Dependencies**: Reads `state.startup.name` to determine if a simulation exists.

**Service Dependencies**: `analyzeStartup()`, `predictOutcomes()`

### SetupPage

**Route**: `/setup`

**Purpose**: Multi-step configuration wizard for startup parameters.

**Steps**:
1. **Identity** — Name and industry selection (15 industries)
2. **Capital** — Starting capital input with industry benchmarking
3. **Founder** — Experience level (0–10 scale)
4. **Risk** — Risk tolerance slider (0–100)
5. **Review** — Summary of all inputs with feasibility score and industry difficulty

**Key Features**:
- Sliding capsule tab indicator with CSS-animated transitions
- Step-to-step cross-fade animation (200ms)
- Real-time feasibility calculation: `(capitalScore + experienceScore + riskScore) / 3`
- Industry difficulty classification (Low/Medium/High)
- Body scroll lock during configuration

**On Submit**: Initializes all state fields and navigates to `/market`.

### MarketPage

**Route**: `/market`

**Purpose**: 16-question market analysis engine across 4 strategic layers.

**Layers**:
1. **Demand Reality** (4 inputs) — Problem frequency, severity, growth, timing
2. **Customer Behavior** (4 inputs) — Switching willingness, budget, adoption speed, price sensitivity
3. **Competitive Landscape** (4 inputs) — Density, differentiation, saturation, brand loyalty
4. **Market Viability** (4 inputs) — Entry barriers, regulation, distribution, scalability

**Computed Metrics**:

| Metric | Formula |
|--------|---------|
| Demand Score | avg(frequency, severity, growth, timing) |
| Customer Readiness | avg(switching, budget, adoption, 100 − priceSensitivity) |
| Competitive Pressure | avg(density, 100 − differentiation, saturation, brandLoyalty) |
| Execution Difficulty | weighted avg(entryBarrier, regulation, distribution) |
| Opportunity Index | demand + customer − competition − difficulty + scalability |

**On Continue**: Maps computed scores to `marketFit`, `brand`, and `scalability` metrics.

### FinancePage

**Route**: `/finance`

**Purpose**: Real-time financial modeling with live metric calculation.

**Input Categories**:
- **Operating Costs**: Rent, salaries, utilities, tools, inventory, marketing
- **Revenue Model**: Price per unit, customers/month, growth rate, retention rate
- **Capital Structure**: Starting capital (read-only), loan amount, interest rate
- **Advanced Variables**: Churn rate, cost inflation, scaling multiplier
- **Advanced Accuracy Mode**: 8 additional sliders (pricing flexibility, supplier stability, etc.)

**Live Calculations**:

| Output | Formula |
|--------|---------|
| Monthly Revenue | baseRevenue × retentionFactor × churnFactor × advancedModifier |
| Total Cost | (operatingCosts × inflationAdj × scalingMultiplier) + monthlyInterest |
| Monthly P/L | revenue − totalCost |
| Burn Rate | abs(P/L) if negative, else 0 |
| Runway | capital / burnRate (capped at 120 months) |
| Break-even Month | capital / burnRate if losing money |
| Survival Probability | weighted composite of runway, growth, risk, profit, marketFit |
| Scaling Threshold | ceil(totalCost × 1.5 / (monthlyRevenue / 12 + 1)) |

**State Sync**: A `useEffect` hook syncs computed `burnRate`, `runway`, and `revenue` back to the global state using a ref-based callback pattern to avoid stale closures.

### DashboardPage

**Route**: `/dashboard`

**Purpose**: Central strategic dashboard showing all metrics, charts, decisions, and projections.

**Sections** (top to bottom):
1. **Insight Strip** — Contextual one-line insight with pulsing indicator
2. **Startup Health** — Animated SVG dial + metric bars + phase indicator
3. **Stability Map** — 2D scatter plot (market demand vs execution strength)
4. **Priority Decision Engine** — Ranked decision list with impact scoring
5. **Metric Intelligence Grid** — 10 metric cards with sparklines
6. **Predictive Graph Panel** — 3 forward-projection charts + historical chart
7. **Risk Timeline** — 4-point survival forecast (Month 1, 3, 6, 12)
8. **Insight Feed** — Dynamic insights from metrics and simulation history
9. **Simulation Engine** — "Run next 3 months" forward projection

**Decision Ranking Algorithm** (`buildDecisionRanking`):
- For each decision, calculate weighted impact based on current metric weaknesses
- Metrics below threshold get multiplied by 1.1–1.3× weight
- Risk reductions score higher than risk increases
- Sort by total impact score descending

**Phase Advancement** (`handleNextPhase`):
1. Apply any deferred future effects for the target phase
2. Generate a random event (20% chance)
3. Clamp all metrics to [0, 100]
4. Record history snapshot
5. Check failure/success conditions
6. Navigate to `/result` if terminal, otherwise increment phase

### ResultPage

**Route**: `/result`

**Purpose**: Final viability analysis with dual-mode display.

**Modes**:
- **Founder Mode** — Full analysis with insights, timeline, diagnostics, scenarios, actions
- **Investor Mode** — Condensed view with risk, survival probability, ROI outlook

**Verdict Tiers**:

| Confidence Score | Verdict | Class |
|-----------------|---------|-------|
| ≥ 72 | HIGH POTENTIAL | Green |
| ≥ 50 | MODERATE POTENTIAL | Neutral |
| ≥ 30 | HIGH RISK | Warning |
| < 30 | UNSTABLE MODEL | Critical |

**Sections** (Founder Mode):
1. **Verdict Badge** — Animated confidence score
2. **Analyst Insights** — 4 conditional insight statements
3. **Future Timeline** — 4-node timeline (Mo 1, 3, 6, 12) with status dots
4. **Diagnostic Analysis** — Radar chart + risk detector
5. **Strategic Output** — Scenario comparison, action roadmap, decision impact map

---

## 9. Design System

### CSS Architecture

All styles are in a single file: `src/index.css` (4,369 lines). The system uses CSS custom properties (variables) for complete theming control.

### Design Tokens

#### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-main` | `#f6f7fb` | Page background |
| `--surface-glass` | `rgba(255,255,255,0.55)` | Glass surfaces |
| `--surface-solid` | `rgba(255,255,255,0.85)` | Solid surfaces |
| `--text-primary` | `#0f172a` | Primary text |
| `--text-secondary` | `#64748b` | Secondary text |
| `--accent-primary` | `#3b82f6` | Interactive elements |
| `--accent-hover` | `#2563eb` | Hover states |
| `--success` | `#22c55e` | Positive indicators |
| `--danger` | `#ef4444` | Negative indicators |
| `--warning` | `#f59e0b` | Warning indicators |

#### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-stack` | Inter, system-ui, sans-serif | All text |
| `--fs-hero` | 40px | Page titles |
| `--fs-section` | 26px | Section headings |
| `--fs-card` | 18px | Card titles |
| `--fs-body` | 15px | Body text |
| `--fs-meta` | 13px | Labels, metadata |

#### Spacing Scale

| Token | Value |
|-------|-------|
| `--sp-1` | 8px |
| `--sp-2` | 16px |
| `--sp-3` | 24px |
| `--sp-4` | 32px |
| `--sp-5` | 48px |
| `--sp-6` | 72px |
| `--sp-7` | 120px |

#### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 20px | Cards, sections |
| `--radius-sm` | 12px | Inputs, buttons |
| `--radius-xs` | 8px | Small elements |

#### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-soft` | `0 4px 24px rgba(0,0,0,0.06)` | Default card shadow |
| `--shadow-hover` | `0 8px 30px rgba(0,0,0,0.08)` | Hover elevation |
| `--shadow-elevated` | `0 8px 30px rgba(0,0,0,0.08)` | Elevated elements |

### Glass Morphism System

```css
background: rgba(255, 255, 255, 0.55);
backdrop-filter: blur(18px);
-webkit-backdrop-filter: blur(18px);
border: 1px solid rgba(255, 255, 255, 0.4);
```

Applied to: navbar, cards, sections, modals, input fields.

### Naming Conventions

CSS classes use a **page-prefix** pattern to avoid conflicts in the single CSS file:

| Prefix | Page |
|--------|------|
| `hp-` | LandingPage (Home Page) |
| `sp-` | SetupPage |
| `ma-` | MarketPage (Market Analysis) |
| `fp-` | FinancePage |
| `dp-` | DashboardPage |
| `rp-` | ResultPage |

Shared styles (navbar, global resets, typography) have no prefix.

---

## 10. Animation System

### Custom Hooks

#### `useAnimatedProgress(target, duration)`
- **Location**: DashboardPage
- **Purpose**: Animates a number from 0 to target using `requestAnimationFrame`
- **Easing**: Cubic ease-out: `1 - (1 - t)³`
- **Usage**: Health dial score animation

#### `useAnimatedNumber(target, duration)`
- **Location**: ResultPage, FinancePage
- **Purpose**: Animates between previous and current number values
- **Easing**: Cubic ease-out
- **Cleanup**: Cancels animation frame on unmount via `useEffect` cleanup

#### `useOnMount(fn)`
- **Location**: DashboardPage
- **Purpose**: Runs a callback once on mount using a ref-based pattern
- **Implementation**: Stores callback in `useRef` to avoid dependency warnings

### CSS Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Card hover lift | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Section hover |
| Tab slide | 250ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Tab indicator |
| Content fade | 200ms | `ease-out` | Step transitions |
| Button scale | 200ms | ease-out | Button hover/active |
| Navbar blur transition | 250ms | ease-out | Scroll state change |
| StabilityMap dot | 600ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Dot position |

### Scroll Animations

- **LandingPage**: Custom `animateScrollTo()` with exponential ease-out
- **First visit**: 7-second delay → smooth scroll past hero
- **Return visits**: Instant scroll to content via `sessionStorage` flag

### Staggered Reveals

- **RiskTimeline**: 4 nodes appear sequentially with 120ms delay each
- **InsightFeed items**: `animationDelay: i * 80ms`
- **MarketPage progress dots**: Sequential reveal on interaction

---

## 11. Responsiveness Architecture

### Breakpoint Strategy

The CSS uses `@media` queries at standard breakpoints:

| Breakpoint | Target |
|------------|--------|
| `max-width: 480px` | Small mobile |
| `max-width: 600px` | Mobile |
| `max-width: 768px` | Large mobile / small tablet |
| `max-width: 900px` | Tablet |
| `max-width: 1024px` | Small laptop |
| `max-width: 1200px` | Standard laptop |

### Mobile Navigation

- Hamburger menu button (`☰` / `✕`) appears below 768px
- `navbar-links` transforms to vertical dropdown with `mobile-open` class
- Background overlay with backdrop blur
- Links close menu on click

### Layout Adaptations

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Navbar | Horizontal links | Hamburger dropdown |
| SetupPage card | 720×520px fixed | Full-width, flexible height |
| MarketPage | Side-by-side (questions + intelligence) | Stacked vertically |
| FinancePage | 3-column layout | Single column stacked |
| Dashboard metrics grid | Multi-column grid | 2-column or single-column |
| Dashboard graphs | 3-column grid | Single column |
| ResultPage scenarios | Horizontal row | Vertical stack |

### Fluid Typography

- Hero title: `clamp(52px, 8vw, 96px)`
- Hero tagline: `clamp(14px, 1.5vw, 18px)`
- All other typography uses fixed sizes from the token system

### Overflow Prevention

- `box-sizing: border-box` on all elements
- `overflow-x: hidden` on page content
- SVG charts use `viewBox` for responsive scaling
- No fixed widths that could cause horizontal scroll

---

## 12. Performance Architecture

### Bundle Size

| Asset | Size (gzipped) |
|-------|----------------|
| JavaScript | 94.61 KB |
| CSS | 11.28 KB |
| **Total** | **~106 KB** |

This is achieved by:
- Zero charting library dependencies (all SVG is hand-built)
- Zero CSS framework overhead
- Single CSS file (no CSS-in-JS runtime)
- No unnecessary utility libraries

### Rendering Optimizations

1. **`useMemo` for expensive computations**:
   - `buildDecisionRanking()` — Decision sorting with weighted impact scoring
   - `buildInsightFeed()` — Conditional insight generation

2. **Ref-based mount callbacks**:
   - `useOnMount()` uses `useRef` to avoid dependency churn

3. **Local state isolation**:
   - Sub-components like `InsightStrip`, `SimulationPanel`, `InputBlock` manage their own visibility/loading state
   - Parent does not re-render when child animation state changes

4. **Derived state**:
   - `healthScore`, `operationalEfficiency`, `feasibility` are computed at render time, not stored
   - Prevents stale data and reduces state update frequency

### SVG Chart Performance

All charts are rendered as static SVG polylines:
- No DOM manipulation libraries
- No canvas overhead
- GPU-accelerated via CSS transitions on `stroke-dashoffset`
- Path drawing animation uses `ref` callback for `getTotalLength()`

### State Persistence

- `localStorage` read happens once on initial mount (passed as initializer to `useState`)
- Write happens synchronously per state update via `useCallback`-wrapped `setState`
- No debouncing needed since state updates are user-driven (not continuous)

---

## 13. Security Considerations

### Client-Side Only

VentureSim is a fully client-side application with no backend, API calls, or external data transmission. All computation happens in the browser.

### Data Storage

- All data is stored in `localStorage` under a single key
- No cookies, session tokens, or authentication
- No personally identifiable information (PII) is collected
- Users can clear data by clearing browser storage

### Code Safety

- No `eval()`, `Function()`, or dynamic code execution
- No `innerHTML` or `dangerouslySetInnerHTML` usage
- No external CDN dependencies at runtime (only Google Fonts)
- All user inputs are numeric (parsed via `Number()`) or string-only
- No SQL injection vectors (no database)
- No XSS vectors (React handles escaping)

### Dependencies

Minimal dependency surface:
- `react` — Core framework
- `react-dom` — DOM renderer
- `react-router-dom` — Client-side routing
- `react-scripts` — Build tooling (not shipped to production)

---

## 14. Deployment Guide

### Prerequisites

- Node.js 18+ installed
- npm 9+ installed

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start
# Opens at http://localhost:3000
```

### Production Build

```bash
# Create optimized production build
npm run build

# Output directory: ./build/
# Contains:
#   build/static/js/main.[hash].js
#   build/static/css/main.[hash].css
#   build/index.html
```

### Static Hosting Deployment

The `build/` directory contains a fully static site that can be deployed to any static hosting provider.

#### GitHub Pages

1. Install the GitHub Pages package:
   ```bash
   npm install gh-pages --save-dev
   ```
2. Add to `package.json`:
   ```json
   "homepage": "https://yourdomain.com",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`

#### Custom Server (serve)

```bash
npm install -g serve
serve -s build -l 3000
```

### Environment Variables

No environment variables are required. The application runs entirely with default configuration.

### Custom Domain

A `CNAME` file exists in the project root for GitHub Pages custom domain configuration.

---

## 15. Technical Decisions

### Why No Charting Library?

The application uses hand-built SVG components instead of libraries like recharts, Chart.js, or d3:

1. **Bundle size**: Charting libraries add 50–200 KB gzipped. The entire VentureSim JS bundle is 94 KB.
2. **Control**: SVG polylines and circles are fully controllable with CSS transitions.
3. **Consistency**: Hand-built charts match the design system exactly.
4. **Performance**: No runtime chart computation overhead.

### Why Single CSS File?

All 4,369 lines of CSS live in `index.css`:

1. **Zero runtime cost**: No CSS-in-JS processing, no style injection.
2. **Full cascade control**: Specificity is managed through page-prefixed class names.
3. **Design system coherence**: All tokens are defined once in `:root`.
4. **Fast development**: No component-scoped CSS module overhead.

### Why var Instead of const/let in Some Files?

Several components use `var` declarations. This is intentional for broad browser compatibility and consistency with the project's established pattern. All `var` usage is scoped to function bodies where hoisting behavior is not a concern.

### Why Context Instead of Redux?

1. **Single state tree**: The entire application state fits in one compact object.
2. **No middleware needs**: No async operations, no logging, no devtools requirement.
3. **Bundle savings**: Context is built into React. Redux would add 7+ KB.
4. **Simplicity**: Direct `setState` calls are easier to trace than dispatch/reducer patterns.

### Why localStorage Instead of IndexedDB?

1. **Data size**: The state object serializes to < 5 KB.
2. **Synchronous access**: No async overhead for read/write.
3. **Browser support**: Universal, including older browsers.
4. **Simplicity**: `JSON.stringify`/`JSON.parse` is sufficient.

### Why useRef Pattern for useOnMount?

The `useOnMount` hook uses `useRef` to store the callback:

```javascript
function useOnMount(fn) {
    var ref = useRef(fn);
    ref.current = fn;
    useEffect(function () { ref.current(); }, []);
}
```

This avoids the `react-hooks/exhaustive-deps` ESLint warning without suppressing it. The ref ensures the latest callback is always available without requiring it as a dependency.

---

## 16. Future Scalability

### Adding New Metrics

1. Add the metric key to `initialState.metrics` in `StartupContext.js`
2. Add the metric to `coreMetrics` array in `DashboardPage.js`
3. Add an insight function to `METRIC_INSIGHTS` in `DashboardPage.js`
4. Add relevant conditions to `insightsEngine.js` and `outcomeEngine.js`

### Adding New Decisions

1. Add the decision object to `decisions.js` with `id`, `title`, and `effects`
2. The decision will automatically appear in the Priority Decision Engine

### Adding New Phases

1. Add the phase name string to the `phases` array in `phases.js`
2. The dashboard will automatically handle the additional phase

### Adding New Pages

1. Create the page component in `src/pages/`
2. Add the route entry in `routes.js`
3. Add the NavLink in `Layout.js`
4. Add page-specific CSS with a new prefix in `index.css`

### Adding a Backend

If a backend is needed in the future:

1. **API layer**: Create a `src/api/` directory with fetch wrappers
2. **State sync**: Replace `localStorage` persistence with API calls in `StartupContext`
3. **Authentication**: Add an auth context and protected route wrapper
4. **Environment config**: Add `.env` files for API URLs

### Code Splitting

For larger bundles, implement route-based code splitting:

```javascript
import { lazy, Suspense } from 'react';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
```

Currently unnecessary given the 94 KB total bundle size.

---

## Appendix: File Reference

| File | Lines | Bytes | Purpose |
|------|-------|-------|---------|
| `index.css` | 4,369 | 74,455 | Complete design system |
| `DashboardPage.js` | 791 | 35,062 | Strategic dashboard |
| `FinancePage.js` | 515 | 23,900 | Financial modeling |
| `MarketPage.js` | 414 | 20,275 | Market analysis |
| `ResultPage.js` | 417 | 18,889 | Final results |
| `SetupPage.js` | 369 | 13,745 | Setup wizard |
| `LandingPage.js` | 260 | 8,577 | Landing page |
| `Layout.js` | 51 | 2,550 | Navigation shell |
| `decisions.js` | 85 | 1,747 | Decision data |
| `StartupContext.js` | 78 | 1,494 | State management |
| `analysisEngine.js` | 49 | 1,264 | Health analysis |
| `projectionEngine.js` | 34 | 756 | Outcome projection |
| `decisionEngine.js` | 29 | 692 | Decision processor |
| `routes.js` | 18 | 621 | Route config |
| `eventEngine.js` | 26 | 561 | Random events |
| `insightsEngine.js` | 28 | 549 | Insight generator |
| `index.js` | 18 | 458 | Entry point |
| `industries.js` | 23 | 423 | Industry data |
| `App.js` | 15 | 281 | Root component |
| `phases.js` | 11 | 125 | Phase names |
