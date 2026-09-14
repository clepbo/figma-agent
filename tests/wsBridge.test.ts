import { describe, it, expect, afterEach } from 'vitest';
import { FigmaWebSocketBridge } from '../src/server/wsBridge';
import WebSocket from 'ws';

describe('WebSocket Bridge Server', () => {
  let bridge: FigmaWebSocketBridge | null = null;

  afterEach(async () => {
    if (bridge) {
      await bridge.stop();
      bridge = null;
    }
  });

  it('starts on designated port and accepts client connection', async () => {
    const testPort = 3099;
    bridge = new FigmaWebSocketBridge(testPort);
    await bridge.start();

    expect(bridge.isConnected()).toBe(false);

    // Connect mock client
    const ws = new WebSocket(`ws://localhost:${testPort}`);
    await new Promise((resolve) => ws.on('open', resolve));

    // Register plugin
    ws.send(JSON.stringify({
      type: 'REGISTER_PLUGIN',
      info: { documentName: 'Test Document' }
    }));

    // Wait brief moment for registration
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(bridge.isConnected()).toBe(true);
    ws.close();
  });

  it('throws error when executing action on disconnected bridge', async () => {
    bridge = new FigmaWebSocketBridge(3098);
    await bridge.start();

    await expect(bridge.executeAction('GET_SELECTION')).rejects.toThrow('Figma Plugin is not connected');
  });
});
