import { PlannedStep } from './planner';
import { SkillRegistry, SkillMetadata } from './skills';
import { BriefParser } from './briefParser';
import { InspirationEngine } from './inspiration';
import { ComplexDesignComposer } from './complexComposer';
import { ContextualDesignEditor } from './designEditor';

export class DesignPlanner {
  private skillRegistry: SkillRegistry;
  private briefParser = new BriefParser();
  private inspirationEngine = new InspirationEngine();
  private complexComposer = new ComplexDesignComposer();
  private designEditor = new ContextualDesignEditor();

  constructor(skillRegistry?: SkillRegistry) {
    this.skillRegistry = skillRegistry || new SkillRegistry();
  }

  /**
   * Main intelligent planning engine
   */
  public planActions(prompt: string): PlannedStep[] {
    const q = prompt.trim();
    const qLower = q.toLowerCase();

    // 1. Check for Slash Commands or Registered Skills
    const { skill, cleanPrompt } = this.skillRegistry.matchSkillInPrompt(q);
    if (skill) {
      return this.executeSkill(skill, cleanPrompt || q);
    }

    // 2. Check if prompt is a PRD or Design Brief
    if (qLower.includes('prd') || qLower.includes('brief') || qLower.includes('requirements') || qLower.includes('user story') || q.length > 150) {
      const briefSpec = this.briefParser.parsePRD(q);
      const styleToken = this.inspirationEngine.searchInspiration(q);
      const allSteps: PlannedStep[] = [];

      let xOffset = 100;
      for (const screen of briefSpec.screens) {
        const screenSteps = this.complexComposer.composeScreen(screen, styleToken, xOffset, 100);
        allSteps.push(...screenSteps);
        xOffset += (screen.screenType === 'mobile_app' ? 440 : 1350);
      }
      return allSteps;
    }

    // 3. Check if prompt asks for Inspiration Lookup
    if (qLower.includes('inspiration') || qLower.includes('trend') || qLower.includes('glassmorphism') || qLower.includes('moodboard') || qLower.includes('neubrutalism')) {
      const styleToken = this.inspirationEngine.searchInspiration(q);
      const mockScreen = {
        screenName: `${styleToken.themeName} - Concept`,
        screenType: (qLower.includes('mobile') ? 'mobile_app' : 'landing') as any,
        description: 'Inspiration generated design concept',
        theme: (styleToken.palette.background === '#0B0F19' ? 'dark' : 'light') as any,
        primaryColor: styleToken.palette.primary,
        secondaryColor: styleToken.palette.secondary,
        components: ['Hero', 'Feature Cards']
      };
      return this.complexComposer.composeScreen(mockScreen, styleToken, 100, 100);
    }

    // 4. Check if prompt asks for Complex Layouts (Landing Page, Dashboard, Login Card, Auth, Checkout, Mobile App)
    if (qLower.includes('dashboard') || qLower.includes('landing page') || qLower.includes('analytics') || qLower.includes('mobile app') || qLower.includes('checkout') || qLower.includes('saas') || qLower.includes('login') || qLower.includes('signup') || qLower.includes('card') || qLower.includes('form') || qLower.includes('auth')) {
      const briefSpec = this.briefParser.parsePRD(q);
      const styleToken = this.inspirationEngine.searchInspiration(q);
      return this.complexComposer.composeScreen(briefSpec.screens[0], styleToken, 100, 100);
    }

    // 5. Check if prompt is an Edit / Update / Refine existing design request
    if (qLower.includes('update') || qLower.includes('edit') || qLower.includes('rebrand') || qLower.includes('add badge') || qLower.includes('change theme') || qLower.includes('autolayout')) {
      return this.designEditor.planEdits(q);
    }

    // 6. Direct Node Actions (Read/Selection/Shapes/Buttons/Text)
    if (qLower.includes('selection') || qLower.includes('selected')) {
      if (qLower.includes('get') || qLower.includes('inspect') || qLower.includes('check') || qLower.includes('show')) {
        return [{ toolName: 'get_selection', args: {}, description: 'Inspect selected nodes' }];
      }
      if (qLower.includes('delete') || qLower.includes('remove')) {
        return [{ toolName: 'delete_node', args: {}, description: 'Delete selected nodes' }];
      }
      if (qLower.includes('duplicate') || qLower.includes('clone')) {
        return [{ toolName: 'clone_node', args: {}, description: 'Clone selected nodes' }];
      }
      if (qLower.includes('export') || qLower.includes('image')) {
        return [{ toolName: 'export_node_image', args: { format: 'PNG', scale: 2 }, description: 'Export selection image' }];
      }
    }

    // 7. Full Design System
    if (qLower.includes('design system') || qLower.includes('ui kit') || qLower.includes('color palette') || qLower.includes('tokens')) {
      return [{
        toolName: 'create_design_system',
        args: {
          themeName: qLower.includes('dark') ? 'Dark Tech' : 'Modern Clean',
          primaryColor: qLower.includes('purple') ? '#8B5CF6' : qLower.includes('emerald') ? '#10B981' : '#3B82F6',
          secondaryColor: '#EC4899',
          backgroundColor: qLower.includes('light') ? '#F8FAFC' : '#0F172A',
          textColor: qLower.includes('light') ? '#0F172A' : '#F8FAFC'
        },
        description: 'Generate Design System Tokens and Components'
      }];
    }

    // 8. Buttons
    if (qLower.includes('button')) {
      const isPrimary = !qLower.includes('secondary');
      const btnColor = qLower.includes('red') ? '#EF4444' : qLower.includes('green') ? '#10B981' : qLower.includes('purple') ? '#8B5CF6' : '#3B82F6';

      return [
        {
          toolName: 'create_frame',
          args: {
            name: isPrimary ? 'Primary Button' : 'Secondary Button',
            x: 100,
            y: 100,
            width: 160,
            height: 44,
            fillColor: isPrimary ? btnColor : '#1E293B',
            strokeColor: isPrimary ? undefined : '#334155',
            strokeWeight: 1,
            cornerRadius: 8,
            layoutMode: 'HORIZONTAL',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
            paddingBottom: 10
          },
          description: 'Create Button Frame'
        },
        {
          toolName: 'create_text',
          args: {
            text: qLower.includes('text') ? q.split(/text/i)[1].trim() : 'Click Me',
            fontSize: 14,
            fontFamily: 'Inter',
            fontStyle: 'Medium',
            fillColor: '#FFFFFF',
            name: 'Button Label'
          },
          description: 'Add Button Label'
        }
      ];
    }

    // Default Fallback
    return [{
      toolName: 'get_document_tree',
      args: {},
      description: 'Fetch canvas document tree'
    }];
  }

  /**
   * Execute instructions from a Skill
   */
  private executeSkill(skill: SkillMetadata, promptText: string): PlannedStep[] {
    switch (skill.name) {
      case 'translate-prd-brief': {
        const briefSpec = this.briefParser.parsePRD(promptText);
        const styleToken = this.inspirationEngine.searchInspiration(promptText);
        return this.complexComposer.composeScreen(briefSpec.screens[0], styleToken, 100, 100);
      }
      case 'find-inspiration': {
        const styleToken = this.inspirationEngine.searchInspiration(promptText);
        const mockScreen = {
          screenName: `${styleToken.themeName} - Inspiration Concept`,
          screenType: 'landing' as const,
          description: 'Inspiration generated design concept',
          theme: 'dark' as const,
          primaryColor: styleToken.palette.primary,
          secondaryColor: styleToken.palette.secondary,
          components: ['Hero', 'Feature Cards']
        };
        return this.complexComposer.composeScreen(mockScreen, styleToken, 100, 100);
      }
      case 'compose-complex-design': {
        const briefSpec = this.briefParser.parsePRD(promptText);
        const styleToken = this.inspirationEngine.searchInspiration(promptText);
        return this.complexComposer.composeScreen(briefSpec.screens[0], styleToken, 100, 100);
      }
      case 'edit-and-refine-design': {
        return this.designEditor.planEdits(promptText);
      }
      case 'ui-consistency-checker': {
        return [{
          toolName: 'execute_custom_figma_script',
          args: {
            code: `
              const selection = figma.currentPage.selection;
              if (selection.length === 0) return 'No objects selected to audit';
              
              let auditLogs = [];
              selection.forEach(node => {
                if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
                  node.cornerRadius = 8; // Standardize to 8px
                  auditLogs.push('Standardized corner radius of ' + node.name + ' to 8px');
                }
              });
              return auditLogs.join('\\n');
            `
          },
          description: 'Standardize design system consistency'
        }];
      }
      case 'generate-responsive-variants': {
        return [{
          toolName: 'execute_custom_figma_script',
          args: {
            code: `
              const sel = figma.currentPage.selection;
              if (sel.length === 0) return 'Select a desktop frame first';
              
              const source = sel[0];
              const mobile = source.clone();
              mobile.name = source.name + ' (Mobile 375px)';
              mobile.x += source.width + 40;
              mobile.resize(375, mobile.height);
              figma.currentPage.selection = [mobile];
              return 'Created mobile responsive frame variant';
            `
          },
          description: 'Generate Mobile Responsive Frame Variant'
        }];
      }
      default:
        return this.complexComposer.composeScreen(
          this.briefParser.parsePRD(promptText).screens[0],
          this.inspirationEngine.searchInspiration(promptText)
        );
    }
  }

  public getSkillRegistry(): SkillRegistry {
    return this.skillRegistry;
  }
}
