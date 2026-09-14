import { describe, it, expect } from 'vitest';
import { SkillRegistry } from '../src/agent/skills';
import { BriefParser } from '../src/agent/briefParser';
import { InspirationEngine } from '../src/agent/inspiration';
import { ComplexDesignComposer } from '../src/agent/complexComposer';
import { ContextualDesignEditor } from '../src/agent/designEditor';

describe('Skill Registry & PRD Translator Engine', () => {
  it('loads installed markdown skills', () => {
    const registry = new SkillRegistry();
    const skills = registry.getAllSkills();
    expect(skills.length).toBeGreaterThan(3);

    const commands = skills.map(s => s.command);
    expect(commands).toContain('/translate-prd-brief');
    expect(commands).toContain('/find-inspiration');
    expect(commands).toContain('/compose-complex-design');
    expect(commands).toContain('/edit-and-refine-design');
    expect(commands).toContain('/ui-consistency-checker');
    expect(commands).toContain('/generate-responsive-variants');
  });

  it('parses PRD text into structured screen requirements', () => {
    const parser = new BriefParser();
    const briefText = `
      Product: CryptoFlow Studio
      Category: FinTech
      Requirements:
      1. Dashboard with analytics metrics overview.
      2. Mobile app screen for quick token swap.
    `;
    const spec = parser.parsePRD(briefText);

    expect(spec.productTitle).toContain('CryptoFlow');
    expect(spec.category).toBe('FinTech');
    expect(spec.screens.length).toBeGreaterThanOrEqual(2);
    expect(spec.brandColors.primary).toBe('#3B82F6');
  });

  it('searches design inspirations and extracts style tokens', () => {
    const engine = new InspirationEngine();
    const style = engine.searchInspiration('Glassmorphism Dark SaaS');

    expect(style.themeName).toBe('Glassmorphism Dark SaaS');
    expect(style.palette.primary).toBe('#6366F1');
    expect(style.palette.background).toBe('#0B0F19');
    expect(style.typography.fontFamily).toBe('Inter');
  });

  it('composes full SaaS Landing Page screen steps', () => {
    const composer = new ComplexDesignComposer();
    const inspirationEngine = new InspirationEngine();
    const style = inspirationEngine.searchInspiration('Dark Mode SaaS');

    const steps = composer.composeScreen({
      screenName: 'SaaS Landing Page',
      screenType: 'landing',
      description: 'Landing page test',
      theme: 'dark',
      primaryColor: '#6366F1',
      secondaryColor: '#EC4899',
      components: ['Hero', 'Feature Cards']
    }, style);

    expect(steps.length).toBeGreaterThan(10);
    expect(steps[0].toolName).toBe('create_frame'); // Outer shell
    expect(steps[1].toolName).toBe('create_frame'); // Navbar
    expect(steps[2].toolName).toBe('create_text');  // Logo
  });

  it('plans contextual design rebranding and auto-layout refactoring', () => {
    const editor = new ContextualDesignEditor();
    const steps = editor.planEdits('Rebrand selected frame to dark mode glassmorphism theme and apply auto-layout');

    expect(steps.length).toBe(2);
    expect(steps[0].toolName).toBe('update_node');
    expect(steps[1].toolName).toBe('execute_custom_figma_script');
  });
});
