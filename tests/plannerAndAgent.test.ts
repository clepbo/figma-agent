import { describe, it, expect } from 'vitest';
import { DesignPlanner } from '../src/agent/planner';
import { figmaTools } from '../src/agent/tools';

describe('Design Planner & Agent Tools', () => {
  const planner = new DesignPlanner();

  it('registers all necessary Figma read and write tools', () => {
    const toolNames = figmaTools.map(t => t.name);
    expect(toolNames).toContain('get_document_tree');
    expect(toolNames).toContain('get_selection');
    expect(toolNames).toContain('create_frame');
    expect(toolNames).toContain('create_text');
    expect(toolNames).toContain('create_shape');
    expect(toolNames).toContain('update_node');
    expect(toolNames).toContain('delete_node');
    expect(toolNames).toContain('apply_autolayout');
    expect(toolNames).toContain('create_design_system');
    expect(toolNames).toContain('execute_custom_figma_script');
  });

  it('plans steps for login card creation prompt', () => {
    const steps = planner.planActions('Create a dark mode login card with email and password fields');
    expect(steps.length).toBeGreaterThan(3);
    expect(steps[0].toolName).toBe('create_frame');
    expect(steps[1].toolName).toBe('create_text');
  });

  it('plans steps for design system creation', () => {
    const steps = planner.planActions('Generate a full design system UI kit');
    expect(steps.length).toBe(1);
    expect(steps[0].toolName).toBe('create_design_system');
  });

  it('plans steps for selection inspection', () => {
    const steps = planner.planActions('Inspect current selected elements');
    expect(steps.length).toBe(1);
    expect(steps[0].toolName).toBe('get_selection');
  });
});
