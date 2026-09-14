import { config } from './config';
import { FigmaWebSocketBridge } from './server/wsBridge';
import { FigmaRestClient } from './figma/restClient';
import { FigmaAgent } from './agent/agent';
import { createServerApp } from './server/app';

async function main() {
  console.log('=== Starting Figma Agent Server ===');

  // 1. Initialize REST Client
  const restClient = new FigmaRestClient(config.figmaAccessToken);

  // 2. Initialize WebSocket Bridge Server
  const wsBridge = new FigmaWebSocketBridge(config.wsPort);
  await wsBridge.start();

  // 3. Initialize Agent Engine
  const agent = new FigmaAgent(wsBridge, restClient, {
    provider: config.llmProvider,
    apiKey: config.llmProvider === 'openai' ? config.openAiApiKey : config.anthropicApiKey
  });

  // 4. Create and start Express HTTP Web UI App
  const app = createServerApp(wsBridge, restClient, agent);

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[HTTP Server] Web Dashboard running on http://0.0.0.0:${config.port}`);
    console.log(`[Figma Plugin Bridge] Waiting for Figma plugin connection at ws://0.0.0.0:${config.wsPort}`);
    console.log(`[Status] Figma REST Token: ${restClient.hasToken() ? 'Configured' : 'Not set (optional)'}`);
  });
}

main().catch((err) => {
  console.error('Fatal error starting Figma Agent Server:', err);
  process.exit(1);
});
