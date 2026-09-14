export interface ParsedScreenRequirement {
  screenName: string;
  screenType: 'landing' | 'dashboard' | 'mobile_app' | 'checkout' | 'settings' | 'auth' | 'form';
  description: string;
  theme: 'dark' | 'light';
  primaryColor: string;
  secondaryColor: string;
  components: string[];
  fields?: string[];
  ctaText?: string;
}

export interface ParsedBriefSpec {
  productTitle: string;
  category: string;
  summary: string;
  theme: 'dark' | 'light';
  brandColors: {
    primary: string;
    secondary: string;
    bg: string;
    surface: string;
    text: string;
  };
  screens: ParsedScreenRequirement[];
}

export class BriefParser {
  /**
   * Parse PRD text / brief into structured design specifications
   */
  public parsePRD(rawBrief: string): ParsedBriefSpec {
    const text = rawBrief.toLowerCase();

    // 1. Detect Category & Theme
    const isDark = !text.includes('light mode') && (text.includes('dark') || text.includes('black') || text.includes('slate') || text.includes('dashboard') || text.includes('saas') || text.includes('fintech'));

    const primaryColor = text.includes('purple') || text.includes('violet') ? '#8B5CF6'
      : text.includes('emerald') || text.includes('green') ? '#10B981'
      : text.includes('orange') || text.includes('coral') ? '#F97316'
      : text.includes('indigo') ? '#6366F1'
      : '#3B82F6'; // Default energetic blue

    const secondaryColor = text.includes('pink') ? '#EC4899' : '#10B981';
    const bg = isDark ? '#0F172A' : '#F8FAFC';
    const surface = isDark ? '#1E293B' : '#FFFFFF';
    const textColor = isDark ? '#F8FAFC' : '#0F172A';

    // 2. Extract Product Name
    let productTitle = 'AI Product Concept';
    const titleMatch = rawBrief.match(/(?:title|product|app|project|name):\s*([^\n]+)/i);
    if (titleMatch) {
      productTitle = titleMatch[1].trim();
    } else {
      const words = rawBrief.split(' ').slice(0, 5).join(' ');
      if (words.length > 5) productTitle = words.replace(/[^\w\s]/gi, '');
    }

    // 3. Screen Breakdown
    const screens: ParsedScreenRequirement[] = [];

    if (text.includes('login') || text.includes('sign in') || text.includes('signup') || text.includes('auth')) {
      screens.push({
        screenName: `${productTitle} - Auth Card`,
        screenType: 'auth',
        description: 'Login/Signup Card with email, password fields and submit CTA',
        theme: isDark ? 'dark' : 'light',
        primaryColor,
        secondaryColor,
        components: ['Login Frame Container', 'Card Title', 'Email Input', 'Password Input', 'Submit Button']
      });
    }

    if (text.includes('dashboard') || text.includes('analytics') || text.includes('admin') || text.includes('metrics')) {
      screens.push({
        screenName: `${productTitle} - Analytics Overview`,
        screenType: 'dashboard',
        description: 'Main metrics dashboard with summary KPI cards, chart placeholder, and recent transaction data table',
        theme: isDark ? 'dark' : 'light',
        primaryColor,
        secondaryColor,
        components: ['Top Header Nav', 'Sidebar Navigation', 'KPI Cards Grid', 'Analytics Chart Frame', 'Data Table']
      });
    }

    if (text.includes('landing') || text.includes('homepage') || text.includes('marketing') || screens.length === 0) {
      screens.push({
        screenName: `${productTitle} - Landing Page`,
        screenType: 'landing',
        description: 'Modern marketing hero page with badge, headline, dual CTAs, feature grid, and footer',
        theme: isDark ? 'dark' : 'light',
        primaryColor,
        secondaryColor,
        components: ['Navbar', 'Hero Header', 'Metrics Counter Bar', '3-Column Feature Cards', 'Callout Banner', 'Footer']
      });
    }

    if (text.includes('mobile') || text.includes('app') || text.includes('banking') || text.includes('wallet')) {
      screens.push({
        screenName: `${productTitle} - Mobile View`,
        screenType: 'mobile_app',
        description: 'Responsive 375px mobile application screen with top status bar, main card, action icons, and bottom nav bar',
        theme: isDark ? 'dark' : 'light',
        primaryColor,
        secondaryColor,
        components: ['Status Bar', 'Main Balance Card', 'Quick Action Buttons', 'Recent Activity List', 'Bottom Navigation']
      });
    }

    if (text.includes('checkout') || text.includes('pricing') || text.includes('payment') || text.includes('billing')) {
      screens.push({
        screenName: `${productTitle} - Checkout & Pricing`,
        screenType: 'checkout',
        description: 'Pricing comparison table and checkout form with total summary and payment selection',
        theme: isDark ? 'dark' : 'light',
        primaryColor,
        secondaryColor,
        components: ['Tab Header', 'Pricing Plan Cards', 'Order Summary Sidebar', 'Payment Form', 'Security Badges']
      });
    }

    return {
      productTitle,
      category: text.includes('saas') ? 'B2B SaaS' : text.includes('fintech') ? 'FinTech' : text.includes('mobile') ? 'Mobile App' : 'Web Application',
      summary: rawBrief.substring(0, 200) + '...',
      theme: isDark ? 'dark' : 'light',
      brandColors: {
        primary: primaryColor,
        secondary: secondaryColor,
        bg,
        surface,
        text: textColor
      },
      screens
    };
  }
}
