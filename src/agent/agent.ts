import { FigmaWebSocketBridge } from '../server/wsBridge';
import { FigmaRestClient } from '../figma/restClient';
import { figmaTools, ToolDefinition } from './tools';
import { LLMProvider, LLMConfig } from './llm';
import { DesignPlanner } from './planner';
import { SkillRegistry, SkillMetadata } from './skills';
import { PlannedStep } from './planner';

export interface AgentExecutionLog {
  step: number;
  toolName: string;
  args: any;
  status: 'success' | 'error';
  result?: any;
  error?: string;
  timestamp: number;
}

export interface AgentRunResult {
  prompt: string;
  steps: AgentExecutionLog[];
  success: boolean;
  message: string;
}

export class FigmaAgent {
  private toolsMap = new Map<string, ToolDefinition>();
  private skillRegistry = new SkillRegistry();
  private planner = new DesignPlanner(this.skillRegistry);
  private llmProvider: LLMProvider;

  constructor(
    private bridge: FigmaWebSocketBridge,
    private restClient: FigmaRestClient,
    llmConfig?: LLMConfig
  ) {
    // Register all tools
    figmaTools.forEach(tool => this.toolsMap.set(tool.name, tool));
    this.llmProvider = new LLMProvider(llmConfig);
  }

  public updateLLMConfig(config: Partial<LLMConfig>) {
    this.llmProvider.updateConfig(config);
  }

  /**
   * Execute a single tool directly by name
   */
  public async executeTool(toolName: string, args: any = {}): Promise<any> {
    const tool = this.toolsMap.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' is not registered`);
    }
    return tool.handler(args, this.bridge, this.restClient);
  }

  /**
   * Process a natural language prompt, PRD, skill slash command, or editing request
   */
  public async processPrompt(prompt: string): Promise<AgentRunResult> {
    const logs: AgentExecutionLog[] = [];
    console.log(`[FigmaAgent] Processing prompt: "${prompt.substring(0, 80)}..."`);

    try {
      let steps: PlannedStep[] = [];

      // Check if prompt uses a skill or if LLM provider should plan
      const { skill } = this.skillRegistry.matchSkillInPrompt(prompt);
      if (skill) {
        steps = this.planner.planActions(prompt);
      } else {
        steps = await this.llmProvider.planToolCalls(prompt);
      }

      console.log(`[FigmaAgent] Planned ${steps.length} step(s):`, steps.map(s => s.toolName));

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`[FigmaAgent] Executing Step ${i + 1}/${steps.length}: ${step.toolName}`);

        try {
          const result = await this.executeTool(step.toolName, step.args);
          logs.push({
            step: i + 1,
            toolName: step.toolName,
            args: step.args,
            status: 'success',
            result,
            timestamp: Date.now()
          });
        } catch (err: any) {
          console.error(`[FigmaAgent] Error in step ${i + 1} (${step.toolName}):`, err.message);
          logs.push({
            step: i + 1,
            toolName: step.toolName,
            args: step.args,
            status: 'error',
            error: err.message,
            timestamp: Date.now()
          });

          return {
            prompt,
            steps: logs,
            success: false,
            message: `Failed at step ${i + 1} (${step.toolName}): ${err.message}`
          };
        }
      }

      return {
        prompt,
        steps: logs,
        success: true,
        message: `Successfully executed ${steps.length} action(s) in Figma`
      };
    } catch (err: any) {
      return {
        prompt,
        steps: logs,
        success: false,
        message: `Agent execution failed: ${err.message}`
      };
    }
  }

  public getAvailableTools(): ToolDefinition[] {
    return Array.from(this.toolsMap.values());
  }

  public getSkills(): SkillMetadata[] {
    return this.skillRegistry.getAllSkills();
  }

  public registerCustomSkill(skillMarkdown: string) {
    const parsed = this.skillRegistry.parseSkillMarkdown(skillMarkdown);
    if (parsed) {
      this.skillRegistry.registerSkill(parsed);
      return parsed;
    }
    throw new Error('Could not parse skill markdown file format');
  }
}
