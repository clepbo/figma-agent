---
name: compose-complex-design
description: Construct complex multi-component Figma layouts including Dashboards, Landing Pages, Mobile Apps, and Checkout Flows.
category: generation
command: /compose-complex-design
---

# Complex Design Composition Skill

Use this skill to create complex, production-ready multi-component screen layouts.

## Supported Layout Blueprints
1. **SaaS Landing Page**: Sticky Header, Hero Section with Badge & Dual CTAs, Metrics Bar, 3-Card Feature Grid, Callout Banner, Footer.
2. **Analytics Dashboard**: Top Header, Collapsible Sidebar Navigation, 4 Metric KPI Cards (with % trend badges), Chart Visualization Frame, Transactions Data Table with Status Pills.
3. **Mobile Banking App**: Notch/Status bar, Account Balance Card, 4 Quick Action Circle Buttons, Recent Activity List, Bottom Navigation Bar.
4. **Checkout & Settings Panel**: Multi-step Tab Header, Form Field Sections, Order Summary Sidebar, Total Price Breakdown, Security Badges.

## Layout Rules
- Always use nested Auto-Layout frames (`layoutMode: VERTICAL` or `HORIZONTAL`).
- Apply proper padding (`paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`) and item spacing (`itemSpacing`).
- Ensure contrast between background surfaces, cards, text, and primary call-to-action buttons.
