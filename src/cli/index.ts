#!/usr/bin/env node

import { config } from '../config';
import { FigmaWebSocketBridge } from '../server/wsBridge';
import { FigmaRestClient } from '../figma/restClient';
import { FigmaAgent } from '../agent/agent';

async function runCli() {
  const args = process.argv.slice(2);
  const prompt = args.join(' ').trim();

  if (!prompt) {
    console.log(`
Figma Agent CLI
Usage:
  npx figma-agent "<natural language instruction>"

Examples:
  npx figma-agent "Create a dark mode login form"
  npx figma-agent "Inspect selected elements"
  npx figma-agent "Generate design system"
    `);
    process.exit(0);
  }

  console.log(`Connecting to Figma WebSocket Bridge on ws://localhost:${config.wsPort}...`);

  const restClient = new FigmaRestClient(config.figmaAccessToken);
  const wsBridge = new FigmaWebSocketBridge(config.wsPort);

  // Give 2 seconds for WS connection to establish if server is running
  const agent = new FigmaAgent(wsBridge, restClient, {
    provider: config.llmProvider,
    apiKey: config.openAiApiKey || config.anthropicApiKey
  });

  // Attempt connection or fallback to HTTP server API call if running
  try {
    const httpRes = await fetch(`http://localhost:${config.port}/api/agent/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (httpRes.ok) {
      const data = await httpRes.json();
      console.log('\n=== Execution Result ===');
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    }
  } catch (e) {
    // If HTTP server is not running, attempt direct execution via WS
  }

  try {
    await wsBridge.start();
    console.log('Server started. Processing prompt...');
    const result = await agent.processPrompt(prompt);
    console.log('\n=== Execution Result ===');
    console.log(JSON.stringify(result, null, 2));
    await wsBridge.stop();
  } catch (err: any) {
    console.error('CLI Execution Error:', err.message);
    process.exit(1);
  }
}

runCli();
