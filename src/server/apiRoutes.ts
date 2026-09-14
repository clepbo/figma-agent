import { Router } from 'express';
import { FigmaWebSocketBridge } from './wsBridge';
import { FigmaRestClient } from '../figma/restClient';
import { FigmaAgent } from '../agent/agent';
import { BriefParser } from '../agent/briefParser';
import { InspirationEngine } from '../agent/inspiration';

export function createApiRouter(
  bridge: FigmaWebSocketBridge,
  restClient: FigmaRestClient,
  agent: FigmaAgent
): Router {
  const router = Router();
  const briefParser = new BriefParser();
  const inspirationEngine = new InspirationEngine();

  // Status check endpoint
  router.get('/status', (req, res) => {
    res.json({
      pluginConnected: bridge.isConnected(),
      hasRestToken: restClient.hasToken(),
      timestamp: Date.now()
    });
  });

  // Get available tools
  router.get('/tools', (req, res) => {
    const tools = agent.getAvailableTools().map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));
    res.json({ tools });
  });

  // Get installed skills
  router.get('/skills', (req, res) => {
    const skills = agent.getSkills();
    res.json({ skills });
  });

  // Install custom skill markdown
  router.post('/skills/install', (req, res) => {
    const { markdown } = req.body;
    if (!markdown || typeof markdown !== 'string') {
      return res.status(400).json({ error: 'Field "markdown" (string) is required' });
    }

    try {
      const skill = agent.registerCustomSkill(markdown);
      res.json({ success: true, message: `Skill '${skill.name}' installed successfully!`, skill });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get curated inspirations & design styles
  router.get('/inspiration', (req, res) => {
    const inspirations = inspirationEngine.getAllInspirations();
    res.json({ inspirations });
  });

  // Parse PRD / Design Brief endpoint
  router.post('/brief/parse', (req, res) => {
    const { brief } = req.body;
    if (!brief || typeof brief !== 'string') {
      return res.status(400).json({ error: 'Field "brief" (string) is required' });
    }

    const spec = briefParser.parsePRD(brief);
    const style = inspirationEngine.searchInspiration(brief);
    res.json({ spec, style });
  });

  // Process natural language prompt / skill execution
  router.post('/agent/prompt', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Field "prompt" (string) is required' });
    }

    try {
      const result = await agent.processPrompt(prompt);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct tool execution
  router.post('/agent/tool', async (req, res) => {
    const { name, args } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Field "name" (tool name) is required' });
    }

    try {
      const result = await agent.executeTool(name, args || {});
      res.json({ success: true, name, result });
    } catch (err: any) {
      res.status(500).json({ success: false, name, error: err.message });
    }
  });

  // Update configuration (Tokens & LLM settings)
  router.post('/config', (req, res) => {
    const { figmaAccessToken, llmProvider, openAiApiKey, anthropicApiKey } = req.body;

    if (figmaAccessToken !== undefined) {
      restClient.setAccessToken(figmaAccessToken);
    }

    if (llmProvider || openAiApiKey || anthropicApiKey) {
      agent.updateLLMConfig({
        provider: llmProvider,
        apiKey: llmProvider === 'openai' ? openAiApiKey : anthropicApiKey
      });
    }

    res.json({
      message: 'Configuration updated successfully',
      hasRestToken: restClient.hasToken()
    });
  });

  // Fetch Figma REST file
  router.get('/figma/file/:fileKey', async (req, res) => {
    try {
      const { fileKey } = req.params;
      const depth = req.query.depth ? parseInt(req.query.depth as string, 10) : undefined;
      const data = await restClient.getFile(fileKey, depth);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
