import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  wsPort: parseInt(process.env.WS_PORT || '3050', 10),
  figmaAccessToken: process.env.FIGMA_ACCESS_TOKEN || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  llmProvider: (process.env.LLM_PROVIDER || 'builtin') as 'builtin' | 'openai' | 'anthropic'
};
