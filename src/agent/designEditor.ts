import { PlannedStep } from './planner';

export class ContextualDesignEditor {
  /**
   * Plans contextual edits for selected nodes based on user instruction
   */
  public planEdits(instruction: string, currentSelection?: any): PlannedStep[] {
    const q = instruction.toLowerCase();
    const steps: PlannedStep[] = [];

    // 1. Re-theming & Dark/Light mode conversion
    if (q.includes('dark mode') || q.includes('rebrand') || q.includes('theme') || q.includes('glassmorphism')) {
      const isDark = !q.includes('light');
      const bg = isDark ? '#0F172A' : '#F8FAFC';
      const textCol = isDark ? '#F8FAFC' : '#0F172A';
      const strokeCol = isDark ? '#334155' : '#E2E8F0';

      steps.push({
        toolName: 'update_node',
        args: {
          fillColor: bg,
          strokeColor: strokeCol
        },
        description: `Rebrand selection surface fill to ${bg}`
      });

      // Execute custom script to update all children text and stroke nodes recursively
      steps.push({
        toolName: 'execute_custom_figma_script',
        args: {
          code: `
            const sel = figma.currentPage.selection;
            if (sel.length === 0) return 'No nodes selected';
            
            function updateTheme(node) {
              if (node.type === 'TEXT') {
                node.fills = [{ type: 'SOLID', color: ${isDark ? '{r:0.97, g:0.98, b:0.99}' : '{r:0.05, g:0.09, b:0.16}'} }];
              }
              if ('strokes' in node && node.strokes.length > 0) {
                node.strokes = [{ type: 'SOLID', color: ${isDark ? '{r:0.2, g:0.25, b:0.33}' : '{r:0.88, g:0.91, b:0.94}'} }];
              }
              if ('children' in node) {
                node.children.forEach(updateTheme);
              }
            }
            
            sel.forEach(updateTheme);
            return 'Theme updated across selection children';
          `
        },
        description: 'Update child text and stroke colors recursively'
      });

      return steps;
    }

    // 2. Add yearly discount toggle or badge
    if (q.includes('discount') || q.includes('badge') || q.includes('tag') || q.includes('toggle')) {
      const badgeText = q.includes('discount') ? 'Save 20%' : q.includes('popular') ? 'Most Popular' : 'NEW';

      steps.push({
        toolName: 'create_frame',
        args: {
          name: `Badge - ${badgeText}`,
          width: 100,
          height: 28,
          fillColor: '#10B981',
          cornerRadius: 14,
          layoutMode: 'HORIZONTAL',
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 4,
          paddingBottom: 4,
          primaryAxisAlignItems: 'CENTER'
        },
        description: `Create ${badgeText} Badge Tag`
      });

      steps.push({
        toolName: 'create_text',
        args: {
          text: badgeText,
          fontSize: 12,
          fontFamily: 'Inter',
          fontStyle: 'Bold',
          fillColor: '#FFFFFF'
        },
        description: 'Add Badge Text'
      });

      return steps;
    }

    // 3. Convert or Refactor into Auto-Layout
    if (q.includes('auto-layout') || q.includes('autolayout') || q.includes('padding') || q.includes('spacing') || q.includes('align')) {
      const isHorizontal = q.includes('row') || q.includes('horizontal');

      steps.push({
        toolName: 'apply_autolayout',
        args: {
          layoutMode: isHorizontal ? 'HORIZONTAL' : 'VERTICAL',
          itemSpacing: 16,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 24,
          paddingBottom: 24
        },
        description: 'Refactor selection frame to Auto-Layout'
      });

      return steps;
    }

    // Fallback: Default to node property update
    steps.push({
      toolName: 'update_node',
      args: {
        cornerRadius: 12
      },
      description: 'Update selected node properties'
    });

    return steps;
  }
}
