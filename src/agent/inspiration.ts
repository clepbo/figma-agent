export interface InspirationStyleToken {
  themeName: string;
  category: string;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textMuted: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    displaySize: number;
    headingSize: number;
    bodySize: number;
  };
  effects: {
    cornerRadius: number;
    strokeWeight: number;
    strokeColor: string;
  };
  sampleTags: string[];
}

export class InspirationEngine {
  private curatedStyles: InspirationStyleToken[] = [
    {
      themeName: 'Glassmorphism Dark SaaS',
      category: 'SaaS / AI App',
      palette: {
        primary: '#6366F1', // Indigo
        secondary: '#EC4899', // Pink accent
        background: '#0B0F19', // Deep dark
        surface: '#111827', // Glass surface
        textPrimary: '#F9FAFB',
        textMuted: '#9CA3AF',
        accent: '#38BDF8'
      },
      typography: {
        fontFamily: 'Inter',
        displaySize: 36,
        headingSize: 22,
        bodySize: 14
      },
      effects: {
        cornerRadius: 16,
        strokeWeight: 1,
        strokeColor: '#1F2937'
      },
      sampleTags: ['glassmorphism', 'dark mode', 'ai app', 'saas landing']
    },
    {
      themeName: 'Vibrant Modern Fintech',
      category: 'FinTech / Crypto',
      palette: {
        primary: '#10B981', // Emerald
        secondary: '#3B82F6', // Ocean blue
        background: '#064E3B', // Deep forest dark
        surface: '#022C22',
        textPrimary: '#ECFDF5',
        textMuted: '#6EE7B7',
        accent: '#F59E0B'
      },
      typography: {
        fontFamily: 'Inter',
        displaySize: 32,
        headingSize: 20,
        bodySize: 14
      },
      effects: {
        cornerRadius: 20,
        strokeWeight: 1,
        strokeColor: '#047857'
      },
      sampleTags: ['fintech', 'banking', 'crypto', 'emerald']
    },
    {
      themeName: 'Clean Minimalist Light',
      category: 'Enterprise / E-Commerce',
      palette: {
        primary: '#0F172A', // Slate dark
        secondary: '#2563EB', // Blue
        background: '#F8FAFC', // Off white
        surface: '#FFFFFF', // Pure white card
        textPrimary: '#0F172A',
        textMuted: '#64748B',
        accent: '#3B82F6'
      },
      typography: {
        fontFamily: 'Inter',
        displaySize: 32,
        headingSize: 20,
        bodySize: 14
      },
      effects: {
        cornerRadius: 8,
        strokeWeight: 1,
        strokeColor: '#E2E8F0'
      },
      sampleTags: ['minimalist', 'clean', 'light mode', 'enterprise']
    },
    {
      themeName: 'Neon Cyber Dark',
      category: 'Developer Tools / Web3',
      palette: {
        primary: '#A855F7', // Neon purple
        secondary: '#06B6D4', // Cyan
        background: '#09090B',
        surface: '#18181B',
        textPrimary: '#FAFAFA',
        textMuted: '#A1A1AA',
        accent: '#F43F5E'
      },
      typography: {
        fontFamily: 'Inter',
        displaySize: 36,
        headingSize: 22,
        bodySize: 14
      },
      effects: {
        cornerRadius: 12,
        strokeWeight: 1,
        strokeColor: '#27272A'
      },
      sampleTags: ['neon', 'cyber', 'developer tool', 'dark']
    }
  ];

  /**
   * Search inspiration by query keywords or return best match
   */
  public searchInspiration(query: string): InspirationStyleToken {
    const q = query.toLowerCase();
    const matched = this.curatedStyles.find(style =>
      style.sampleTags.some(tag => q.includes(tag)) ||
      q.includes(style.themeName.toLowerCase()) ||
      q.includes(style.category.toLowerCase())
    );

    if (matched) return matched;

    // Fallback: Customize default token dynamically based on prompt keywords
    return {
      themeName: `Custom Inspiration (${query.substring(0, 20)})`,
      category: 'Custom Design',
      palette: {
        primary: q.includes('purple') ? '#8B5CF6' : q.includes('green') ? '#10B981' : q.includes('orange') ? '#F97316' : '#3B82F6',
        secondary: '#EC4899',
        background: q.includes('light') ? '#F8FAFC' : '#0F172A',
        surface: q.includes('light') ? '#FFFFFF' : '#1E293B',
        textPrimary: q.includes('light') ? '#0F172A' : '#F8FAFC',
        textMuted: q.includes('light') ? '#64748B' : '#94A3B8',
        accent: '#38BDF8'
      },
      typography: {
        fontFamily: 'Inter',
        displaySize: 32,
        headingSize: 20,
        bodySize: 14
      },
      effects: {
        cornerRadius: q.includes('round') ? 24 : 12,
        strokeWeight: 1,
        strokeColor: q.includes('light') ? '#E2E8F0' : '#334155'
      },
      sampleTags: [query]
    };
  }

  public getAllInspirations(): InspirationStyleToken[] {
    return this.curatedStyles;
  }
}
