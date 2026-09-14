import { PlannedStep } from './planner';
import { InspirationStyleToken } from './inspiration';
import { ParsedScreenRequirement } from './briefParser';

export class ComplexDesignComposer {
  /**
   * Generates multi-step Figma tool actions for a full screen requirement
   */
  public composeScreen(
    screen: ParsedScreenRequirement,
    style: InspirationStyleToken,
    startX = 100,
    startY = 100
  ): PlannedStep[] {
    switch (screen.screenType) {
      case 'dashboard':
        return this.composeAnalyticsDashboard(screen, style, startX, startY);
      case 'mobile_app':
        return this.composeMobileApp(screen, style, startX, startY);
      case 'checkout':
        return this.composeCheckoutPanel(screen, style, startX, startY);
      case 'auth':
        return this.composeAuthForm(screen, style, startX, startY);
      case 'landing':
      default:
        return this.composeLandingPage(screen, style, startX, startY);
    }
  }

  /**
   * 0. Compose Auth / Login Form Card
   */
  private composeAuthForm(screen: ParsedScreenRequirement, style: InspirationStyleToken, startX: number, startY: number): PlannedStep[] {
    const steps: PlannedStep[] = [];
    const p = style.palette;

    // Card Frame
    steps.push({
      toolName: 'create_frame',
      args: {
        name: screen.screenName || 'Login Form Card',
        x: startX,
        y: startY,
        width: 400,
        height: 480,
        fillColor: p.surface,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        cornerRadius: 16,
        layoutMode: 'VERTICAL',
        paddingLeft: 32,
        paddingRight: 32,
        paddingTop: 32,
        paddingBottom: 32,
        itemSpacing: 20
      },
      description: 'Create Login Card Container Frame'
    });

    // Title
    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Welcome Back',
        fontSize: 24,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: p.textPrimary,
        name: 'Card Title'
      },
      description: 'Add Card Title Text'
    });

    // Subtitle
    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Please enter your credentials to access your account.',
        fontSize: 13,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Regular',
        fillColor: p.textMuted,
        name: 'Card Subtitle'
      },
      description: 'Add Subtitle Text'
    });

    // Email Input Field
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Email Input Container',
        width: 336,
        height: 48,
        fillColor: p.background,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12
      },
      description: 'Create Email Field Container'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'name@company.com',
        fontSize: 14,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Regular',
        fillColor: p.textMuted,
        name: 'Email Placeholder'
      },
      description: 'Add Email Field Placeholder'
    });

    // Password Input Field
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Password Input Container',
        width: 336,
        height: 48,
        fillColor: p.background,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12
      },
      description: 'Create Password Field Container'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: '••••••••••••',
        fontSize: 14,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Regular',
        fillColor: p.textMuted,
        name: 'Password Placeholder'
      },
      description: 'Add Password Field Placeholder'
    });

    // Submit Button
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Submit Button',
        width: 336,
        height: 48,
        fillColor: p.primary,
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12,
        primaryAxisAlignItems: 'CENTER'
      },
      description: 'Create Submit Button Container'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Sign In to Account',
        fontSize: 14,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: '#FFFFFF',
        name: 'Button Label'
      },
      description: 'Add Submit Button Label'
    });

    return steps;
  }

  /**
   * 1. Compose Full SaaS Landing Page
   */
  private composeLandingPage(screen: ParsedScreenRequirement, style: InspirationStyleToken, startX: number, startY: number): PlannedStep[] {
    const steps: PlannedStep[] = [];
    const p = style.palette;

    // Main Container Frame
    steps.push({
      toolName: 'create_frame',
      args: {
        name: screen.screenName,
        x: startX,
        y: startY,
        width: 1280,
        height: 900,
        fillColor: p.background,
        layoutMode: 'VERTICAL',
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 32,
        paddingBottom: 40,
        itemSpacing: 48,
        clipsContent: true
      },
      description: 'Create Main Landing Page Outer Container'
    });

    // Top Navbar
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Top Navigation Bar',
        width: 1200,
        height: 64,
        fillColor: p.surface,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        cornerRadius: 12,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 16,
        paddingBottom: 16,
        itemSpacing: 32,
        primaryAxisAlignItems: 'SPACE_BETWEEN',
        counterAxisAlignItems: 'CENTER'
      },
      description: 'Create Top Navbar'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: `⚡ ${screen.screenName.split('-')[0].trim() || 'SaaS'}`,
        fontSize: 18,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: p.primary,
        name: 'Brand Logo'
      },
      description: 'Add Brand Logo'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Features      Solutions      Pricing      Docs',
        fontSize: 14,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Medium',
        fillColor: p.textMuted,
        name: 'Nav Links'
      },
      description: 'Add Nav Links'
    });

    // Hero Section Frame
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Hero Section Frame',
        width: 1200,
        height: 380,
        fillColor: p.surface,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        cornerRadius: style.effects.cornerRadius,
        layoutMode: 'VERTICAL',
        paddingLeft: 48,
        paddingRight: 48,
        paddingTop: 48,
        paddingBottom: 48,
        itemSpacing: 24,
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER'
      },
      description: 'Create Hero Container'
    });

    // Badge Tag
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Version Badge Tag',
        width: 220,
        height: 32,
        fillColor: p.background,
        strokeColor: p.primary,
        strokeWeight: 1,
        cornerRadius: 16,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        paddingBottom: 6,
        primaryAxisAlignItems: 'CENTER'
      },
      description: 'Create Hero Badge Tag'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: '🚀 AI-Powered Platform v2.0',
        fontSize: 12,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Medium',
        fillColor: p.accent,
        name: 'Badge Text'
      },
      description: 'Add Badge Label'
    });

    // Hero Headline
    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Transform Product Requirements Into Designs Instantly',
        fontSize: 36,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: p.textPrimary,
        textAlign: 'CENTER',
        name: 'Hero Headline'
      },
      description: 'Add Hero Headline Text'
    });

    // Hero Subtitle
    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Empower your product team with AI design workflows, real-time Figma canvas syncing, and automated design systems.',
        fontSize: 16,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Regular',
        fillColor: p.textMuted,
        textAlign: 'CENTER',
        name: 'Hero Subtitle'
      },
      description: 'Add Hero Subtitle Text'
    });

    // Dual CTA Buttons Row
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'CTA Button Row',
        width: 380,
        height: 48,
        fillColor: p.surface,
        layoutMode: 'HORIZONTAL',
        itemSpacing: 16,
        primaryAxisAlignItems: 'CENTER'
      },
      description: 'Create Dual CTA Buttons'
    });

    // Primary Button
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Primary Button',
        width: 180,
        height: 48,
        fillColor: p.primary,
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12,
        paddingBottom: 12,
        primaryAxisAlignItems: 'CENTER'
      },
      description: 'Create Primary CTA'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Start Free Trial →',
        fontSize: 14,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: '#FFFFFF',
        name: 'Primary CTA Label'
      },
      description: 'Add Primary CTA Label'
    });

    // Secondary Button
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Secondary Button',
        width: 180,
        height: 48,
        fillColor: p.background,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12,
        paddingBottom: 12,
        primaryAxisAlignItems: 'CENTER'
      },
      description: 'Create Secondary CTA'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Book Live Demo',
        fontSize: 14,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Medium',
        fillColor: p.textPrimary,
        name: 'Secondary CTA Label'
      },
      description: 'Add Secondary CTA Label'
    });

    // 3-Column Feature Grid Frame
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Feature Grid Container',
        width: 1200,
        height: 220,
        fillColor: p.background,
        layoutMode: 'HORIZONTAL',
        itemSpacing: 24
      },
      description: 'Create Feature Cards Row'
    });

    const features = [
      { title: '⚡ Smart PRD Parser', desc: 'Converts product requirements & briefs into production UI screens.' },
      { title: '🎨 Inspiration Lookup', desc: 'Extracts color palettes & design tokens from top web trends.' },
      { title: '🔄 Contextual Editor', desc: 'Updates existing Figma canvas layers and handles auto-layout.' }
    ];

    for (const feat of features) {
      steps.push({
        toolName: 'create_frame',
        args: {
          name: `Feature Card - ${feat.title}`,
          width: 384,
          height: 200,
          fillColor: p.surface,
          strokeColor: style.effects.strokeColor,
          strokeWeight: 1,
          cornerRadius: style.effects.cornerRadius,
          layoutMode: 'VERTICAL',
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 24,
          paddingBottom: 24,
          itemSpacing: 12
        },
        description: `Create Feature Card (${feat.title})`
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: feat.title,
          fontSize: 18,
          fontFamily: style.typography.fontFamily,
          fontStyle: 'Bold',
          fillColor: p.textPrimary,
          name: 'Card Title'
        },
        description: 'Add Feature Card Title'
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: feat.desc,
          fontSize: 13,
          fontFamily: style.typography.fontFamily,
          fontStyle: 'Regular',
          fillColor: p.textMuted,
          name: 'Card Body'
        },
        description: 'Add Feature Card Body'
      });
    }

    return steps;
  }

  /**
   * 2. Compose Full Analytics Dashboard
   */
  private composeAnalyticsDashboard(screen: ParsedScreenRequirement, style: InspirationStyleToken, startX: number, startY: number): PlannedStep[] {
    const steps: PlannedStep[] = [];
    const p = style.palette;

    // Outer Container
    steps.push({
      toolName: 'create_frame',
      args: {
        name: screen.screenName,
        x: startX,
        y: startY,
        width: 1280,
        height: 850,
        fillColor: p.background,
        layoutMode: 'HORIZONTAL',
        itemSpacing: 0,
        clipsContent: true
      },
      description: 'Create Dashboard Outer Shell'
    });

    // Left Sidebar Navigation
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Sidebar Navigation',
        width: 240,
        height: 850,
        fillColor: p.surface,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        layoutMode: 'VERTICAL',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 32,
        paddingBottom: 32,
        itemSpacing: 24
      },
      description: 'Create Sidebar Nav Container'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: `💎 Analytics Studio`,
        fontSize: 16,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: p.primary,
        name: 'Sidebar Logo'
      },
      description: 'Add Sidebar Logo'
    });

    const navItems = ['📊 Overview', '📈 Analytics', '💳 Transactions', '👥 Customers', '⚙️ Settings'];
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      const isActive = i === 0;

      steps.push({
        toolName: 'create_frame',
        args: {
          name: `Nav Item - ${item}`,
          width: 200,
          height: 40,
          fillColor: isActive ? p.primary : p.surface,
          cornerRadius: 8,
          layoutMode: 'HORIZONTAL',
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 10,
          paddingBottom: 10,
          counterAxisAlignItems: 'CENTER'
        },
        description: `Create Sidebar Item (${item})`
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: item,
          fontSize: 13,
          fontFamily: style.typography.fontFamily,
          fontStyle: isActive ? 'Bold' : 'Medium',
          fillColor: isActive ? '#FFFFFF' : p.textMuted,
          name: 'Item Label'
        },
        description: 'Add Nav Item Label'
      });
    }

    // Main Content Column Frame
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Main Workspace Column',
        width: 1040,
        height: 850,
        fillColor: p.background,
        layoutMode: 'VERTICAL',
        paddingLeft: 32,
        paddingRight: 32,
        paddingTop: 32,
        paddingBottom: 32,
        itemSpacing: 32
      },
      description: 'Create Main Content Column'
    });

    // Top Header
    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Executive Summary & Real-Time Performance',
        fontSize: 24,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: p.textPrimary,
        name: 'Dashboard Header'
      },
      description: 'Add Dashboard Header Text'
    });

    // 4 KPI Summary Cards Row
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'KPI Metric Cards Row',
        width: 976,
        height: 120,
        fillColor: p.background,
        layoutMode: 'HORIZONTAL',
        itemSpacing: 16
      },
      description: 'Create KPI Metric Cards Row'
    });

    const kpis = [
      { title: 'Total Revenue', value: '$128,450.00', trend: '+14.2% vs last month', isPos: true },
      { title: 'Active Users', value: '24,890', trend: '+8.1% vs last month', isPos: true },
      { title: 'Conversion Rate', value: '3.42%', trend: '-0.4% vs last month', isPos: false },
      { title: 'Avg Order Value', value: '$86.50', trend: '+5.3% vs last month', isPos: true }
    ];

    for (const kpi of kpis) {
      steps.push({
        toolName: 'create_frame',
        args: {
          name: `KPI Card - ${kpi.title}`,
          width: 232,
          height: 120,
          fillColor: p.surface,
          strokeColor: style.effects.strokeColor,
          strokeWeight: 1,
          cornerRadius: style.effects.cornerRadius,
          layoutMode: 'VERTICAL',
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 16,
          paddingBottom: 16,
          itemSpacing: 8
        },
        description: `Create KPI Card (${kpi.title})`
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: kpi.title,
          fontSize: 12,
          fontFamily: style.typography.fontFamily,
          fontStyle: 'Medium',
          fillColor: p.textMuted,
          name: 'KPI Label'
        },
        description: 'Add KPI Label'
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: kpi.value,
          fontSize: 22,
          fontFamily: style.typography.fontFamily,
          fontStyle: 'Bold',
          fillColor: p.textPrimary,
          name: 'KPI Value'
        },
        description: 'Add KPI Value'
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: kpi.trend,
          fontSize: 11,
          fontFamily: style.typography.fontFamily,
          fontStyle: 'Regular',
          fillColor: kpi.isPos ? '#10B981' : '#EF4444',
          name: 'KPI Trend'
        },
        description: 'Add KPI Trend Text'
      });
    }

    // Chart Placeholder Frame
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Analytics Chart Frame',
        width: 976,
        height: 280,
        fillColor: p.surface,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        cornerRadius: style.effects.cornerRadius,
        layoutMode: 'VERTICAL',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 20,
        paddingBottom: 20,
        itemSpacing: 16
      },
      description: 'Create Chart Container'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Revenue & Traffic Growth (Last 30 Days)',
        fontSize: 15,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: p.textPrimary,
        name: 'Chart Title'
      },
      description: 'Add Chart Title'
    });

    // Mock Chart Graph Line/Bar
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Visual Chart Graph Mock',
        width: 928,
        height: 180,
        fillColor: p.background,
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 20,
        itemSpacing: 24,
        primaryAxisAlignItems: 'SPACE_BETWEEN',
        counterAxisAlignItems: 'MAX'
      },
      description: 'Create Visual Bar Graph'
    });

    const barHeights = [60, 90, 120, 80, 140, 110, 160, 130];
    for (let i = 0; i < barHeights.length; i++) {
      steps.push({
        toolName: 'create_shape',
        args: {
          shapeType: 'RECTANGLE',
          name: `Bar ${i + 1}`,
          width: 28,
          height: barHeights[i],
          fillColor: i === 6 ? p.primary : p.accent,
          cornerRadius: 4
        },
        description: `Add Chart Bar ${i + 1}`
      });
    }

    return steps;
  }

  /**
   * 3. Compose Mobile Banking App Screen
   */
  private composeMobileApp(screen: ParsedScreenRequirement, style: InspirationStyleToken, startX: number, startY: number): PlannedStep[] {
    const steps: PlannedStep[] = [];
    const p = style.palette;

    // Outer Mobile Frame
    steps.push({
      toolName: 'create_frame',
      args: {
        name: screen.screenName,
        x: startX,
        y: startY,
        width: 375,
        height: 812,
        fillColor: p.background,
        cornerRadius: 36,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 2,
        layoutMode: 'VERTICAL',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 20,
        itemSpacing: 20,
        clipsContent: true
      },
      description: 'Create Mobile Phone Shell Frame'
    });

    // Status Bar Notch
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Top Status Bar',
        width: 335,
        height: 24,
        fillColor: p.background,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'SPACE_BETWEEN'
      },
      description: 'Create Top Status Bar'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: '9:41',
        fontSize: 12,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: p.textPrimary
      },
      description: 'Add Clock'
    });

    // Main Balance Card
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Main Account Card',
        width: 335,
        height: 180,
        fillColor: p.primary,
        cornerRadius: 20,
        layoutMode: 'VERTICAL',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 24,
        paddingBottom: 24,
        itemSpacing: 12,
        primaryAxisAlignItems: 'SPACE_BETWEEN'
      },
      description: 'Create Main Account Card'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Total Available Balance',
        fontSize: 12,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Medium',
        fillColor: '#FFFFFF',
        opacity: 0.8
      },
      description: 'Add Card Label'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: '$48,290.50',
        fontSize: 32,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: '#FFFFFF'
      },
      description: 'Add Balance Amount'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: '•••• •••• •••• 8842',
        fontSize: 13,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Medium',
        fillColor: '#FFFFFF'
      },
      description: 'Add Card Number'
    });

    // Quick Actions Row
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Quick Action Buttons Row',
        width: 335,
        height: 72,
        fillColor: p.background,
        layoutMode: 'HORIZONTAL',
        itemSpacing: 16,
        primaryAxisAlignItems: 'SPACE_BETWEEN'
      },
      description: 'Create Action Buttons Row'
    });

    const actions = ['💸 Send', '📥 Receive', '💳 Pay', '🔄 Swap'];
    for (const act of actions) {
      steps.push({
        toolName: 'create_frame',
        args: {
          name: `Action - ${act}`,
          width: 70,
          height: 64,
          fillColor: p.surface,
          strokeColor: style.effects.strokeColor,
          strokeWeight: 1,
          cornerRadius: 16,
          layoutMode: 'VERTICAL',
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 12,
          paddingBottom: 8,
          itemSpacing: 4,
          primaryAxisAlignItems: 'CENTER',
          counterAxisAlignItems: 'CENTER'
        },
        description: `Create Action (${act})`
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: act,
          fontSize: 11,
          fontFamily: style.typography.fontFamily,
          fontStyle: 'Medium',
          fillColor: p.textPrimary
        },
        description: 'Add Action Label'
      });
    }

    return steps;
  }

  /**
   * 4. Compose Checkout & Settings Panel
   */
  private composeCheckoutPanel(screen: ParsedScreenRequirement, style: InspirationStyleToken, startX: number, startY: number): PlannedStep[] {
    const steps: PlannedStep[] = [];
    const p = style.palette;

    steps.push({
      toolName: 'create_frame',
      args: {
        name: screen.screenName,
        x: startX,
        y: startY,
        width: 900,
        height: 600,
        fillColor: p.background,
        cornerRadius: style.effects.cornerRadius,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 32,
        paddingRight: 32,
        paddingTop: 32,
        paddingBottom: 32,
        itemSpacing: 32
      },
      description: 'Create Checkout Frame Shell'
    });

    // Left Payment Form Column
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Payment Details Column',
        width: 500,
        height: 536,
        fillColor: p.surface,
        strokeColor: style.effects.strokeColor,
        strokeWeight: 1,
        cornerRadius: 16,
        layoutMode: 'VERTICAL',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24,
        paddingBottom: 24,
        itemSpacing: 16
      },
      description: 'Create Payment Details Form'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Payment Information',
        fontSize: 20,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: p.textPrimary
      },
      description: 'Add Section Title'
    });

    const fields = ['Cardholder Full Name', 'Card Number (16 digits)', 'Expiration Date (MM/YY)', 'CVV Security Code'];
    for (const field of fields) {
      steps.push({
        toolName: 'create_frame',
        args: {
          name: `Input - ${field}`,
          width: 452,
          height: 44,
          fillColor: p.background,
          strokeColor: style.effects.strokeColor,
          strokeWeight: 1,
          cornerRadius: 8,
          layoutMode: 'HORIZONTAL',
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 10,
          paddingBottom: 10
        },
        description: `Create Field (${field})`
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: field,
          fontSize: 12,
          fontFamily: style.typography.fontFamily,
          fontStyle: 'Regular',
          fillColor: p.textMuted
        },
        description: 'Add Field Label'
      });
    }

    // Submit Pay Button
    steps.push({
      toolName: 'create_frame',
      args: {
        name: 'Complete Order Button',
        width: 452,
        height: 48,
        fillColor: p.primary,
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12,
        primaryAxisAlignItems: 'CENTER'
      },
      description: 'Create Complete Order Button'
    });

    steps.push({
      toolName: 'create_text',
      args: {
        text: 'Pay $299.00 Securely →',
        fontSize: 14,
        fontFamily: style.typography.fontFamily,
        fontStyle: 'Bold',
        fillColor: '#FFFFFF'
      },
      description: 'Add Button Text'
    });

    return steps;
  }
}
