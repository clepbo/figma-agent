# 🎨 Figma Agent - Intelligent AI Design Engine (No-MCP)

An advanced, full-stack AI Agent designed for Figma to **translate complex design briefs, PRDs, user stories, and visual inspirations into full-fidelity Figma canvas designs** without relying on Model Context Protocol (MCP).

---

## 🌟 Core Capabilities

### 1. 📄 PRD & Brief Translator
- Accepts raw Product Requirement Documents (PRDs), feature specifications, user stories, or markdown briefs.
- Parses requirements into product categories, theme constraints, color palettes, and screen architecture blueprints.
- Constructs multi-screen Figma UI layouts with responsive Auto-Layout containers.

### 2. ✨ Design Inspiration & Style Token Engine
- Queries design trends (Glassmorphism Dark SaaS, FinTech Emerald, Minimalist Light Enterprise, Cyber Neon) and extracts style tokens:
  - Color palettes (Primary, Secondary, Background, Surface, Text, Accent).
  - Typography pairs (Font family, display/heading/body sizes).
  - Component effects (Corner radii, border strokes, shadows).
- Translates inspiration specs directly into Figma canvas elements.

### 3. 📚 Installable Skills Framework
- Includes a modular **Skills System** supporting `.md` skill files and slash commands:
  - `/translate-prd-brief`: Translate PRDs into UI screens.
  - `/find-inspiration`: Search trends and apply style tokens.
  - `/compose-complex-design`: Build complex Landing Pages, Dashboards, Mobile Apps, Checkouts.
  - `/edit-and-refine-design`: Rebrand, re-theme, and refactor existing canvas elements.
  - `/ui-consistency-checker`: Audit padding grid and corner radii consistency.
  - `/generate-responsive-variants`: Generate 375px mobile responsive frame variants from desktop designs.
- Users can write or upload custom markdown skill files via the Web Dashboard or API.

### 4. 🚀 Complex Screen Blueprint Composer
- Generates multi-component responsive layouts with auto-layout padding and spacing:
  - **SaaS Landing Page**: Sticky Header, Hero Section with Badge & Dual CTAs, Metrics Bar, 3-Card Feature Grid, Callout Banner, Footer.
  - **Analytics Dashboard**: Sidebar Nav, 4 Metric KPI Cards (with trend badges), Chart Visualization, Recent Transactions Data Table.
  - **Mobile Banking App**: Notch/Status bar, Account Balance Card, 4 Quick Action Circle Buttons, Recent Activity List, Bottom Navigation Bar.
  - **Checkout & Settings Panel**: Form Field Sections, Order Summary Sidebar, Total Price Breakdown, Security Badges.

### 5. 🪄 Contextual Design Editor & Refiner
- Inspects existing canvas layers and performs contextual edits:
  - **Re-theming**: Updates color themes (Dark/Light mode) across child layers recursively.
  - **Auto-Layout Refactoring**: Converts static frames into responsive Auto-Layout frames with balanced padding and spacing.
  - **Feature Additions**: Inserts badges, toggles, buttons, or input fields into existing frame containers.

---

## 🏁 Quick Start Guide

### 1. Install & Build
```bash
npm install
npm run build
```

### 2. Start the Figma Agent Server
```bash
npm start
```
Starts:
- **Interactive Web Dashboard**: `http://localhost:3000`
- **Figma WebSocket Bridge**: `ws://localhost:3050`

### 3. Load the Figma Plugin into Figma
1. Open Figma (Desktop or Web).
2. Go to **Plugins** -> **Development** -> **Import manifest from file...**
3. Select `plugin/manifest.json`.
4. Run **Figma AI Agent Bridge** and click **Connect Agent**.

---

## 🧪 Automated Testing

Run the test suite:

```bash
npm test
```
All 14 unit and integration tests pass cleanly across skill loading, PRD translation, inspiration lookup, layout composition, and WebSocket bridge RPC messaging.
