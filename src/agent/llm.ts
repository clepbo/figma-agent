import { figmaTools, ToolDefinition } from './tools';
import { DesignPlanner, PlannedStep } from './planner';

export interface LLMConfig {
  provider: 'builtin' | 'openai' | 'anthropic';
  apiKey?: string;
  model?: string;
}

export class LLMProvider {
  private planner = new DesignPlanner();

  constructor(private config: LLMConfig = { provider: 'builtin' }) {}

  public updateConfig(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generates planned tool calls for user query
   */
  async planToolCalls(userPrompt: string): Promise<PlannedStep[]> {
    if (this.config.provider === 'openai' && this.config.apiKey) {
      try {
        return await this.callOpenAI(userPrompt);
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to built-in Design Planner:', err);
      }
    }

    if (this.config.provider === 'anthropic' && this.config.apiKey) {
      try {
        return await this.callAnthropic(userPrompt);
      } catch (err) {
        console.warn('Anthropic API call failed, falling back to built-in Design Planner:', err);
      }
    }

    // Default: Built-in Design Planner
    return this.planner.planActions(userPrompt);
  }

  private async callOpenAI(userPrompt: string): Promise<PlannedStep[]> {
    const toolsPayload = figmaTools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are FigmaAgent, an AI design assistant capable of reading and writing Figma canvas elements using tools. Choose appropriate tools to fulfill the user request.'
          },
          { role: 'user', content: userPrompt }
        ],
        tools: toolsPayload,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    const toolCalls = data.choices?.[0]?.message?.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      // Fallback to planner if LLM returned text only
      return this.planner.planActions(userPrompt);
    }

    return toolCalls.map((tc: any) => ({
      toolName: tc.function.name,
      args: JSON.parse(tc.function.arguments || '{}'),
      description: `Execute ${tc.function.name}`
    }));
  }

  private async callAnthropic(userPrompt: string): Promise<PlannedStep[]> {
    const toolsPayload = figmaTools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        tools: toolsPayload,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    const content = data.content || [];
    const toolUseBlocks = content.filter((b: any) => b.type === 'tool_use');

    if (toolUseBlocks.length === 0) {
      return this.planner.planActions(userPrompt);
    }

    return toolUseBlocks.map((tu: any) => ({
      toolName: tu.name,
      args: tu.input || {},
      description: `Execute ${tu.name}`
    }));
  }
}
