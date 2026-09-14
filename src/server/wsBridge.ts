import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { ActionType, PluginMessage } from '../figma/pluginProtocol';

export class FigmaWebSocketBridge extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private activePluginSocket: WebSocket | null = null;
  private pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: Error) => void; timeoutTimer: NodeJS.Timeout }>();
  private requestCounter = 0;

  constructor(private port: number = 3050) {
    super();
  }

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port: this.port });

        this.wss.on('listening', () => {
          console.log(`[WebSocket Bridge] Server listening on ws://0.0.0.0:${this.port}`);
          resolve(this.port);
        });

        this.wss.on('connection', (ws, req) => {
          console.log(`[WebSocket Bridge] Client connected from ${req.socket.remoteAddress}`);
          this.activePluginSocket = ws;
          this.emit('pluginConnected');

          ws.on('message', (messageBuffer) => {
            try {
              const msgString = messageBuffer.toString();
              const msg: PluginMessage = JSON.parse(msgString);
              this.handlePluginMessage(msg, ws);
            } catch (err) {
              console.error('[WebSocket Bridge] Failed to parse message from plugin:', err);
            }
          });

          ws.on('close', () => {
            console.log('[WebSocket Bridge] Plugin disconnected');
            if (this.activePluginSocket === ws) {
              this.activePluginSocket = null;
            }
            this.emit('pluginDisconnected');
          });

          ws.on('error', (err) => {
            console.error('[WebSocket Bridge] Socket error:', err);
          });
        });

        this.wss.on('error', (err) => {
          console.error('[WebSocket Bridge] Server error:', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          console.log('[WebSocket Bridge] Server stopped.');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public isConnected(): boolean {
    return Boolean(this.activePluginSocket && this.activePluginSocket.readyState === WebSocket.OPEN);
  }

  private handlePluginMessage(msg: PluginMessage, socket: WebSocket) {
    this.emit('message', msg);

    if (msg.type === 'REGISTER_PLUGIN') {
      console.log('[WebSocket Bridge] Plugin registered successfully!');
      this.emit('registered', msg.info);
      return;
    }

    if (msg.type === 'SELECTION_CHANGE') {
      this.emit('selectionChange', msg.payload);
      return;
    }

    if (msg.type === 'ACTION_RESULT' && msg.id) {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        clearTimeout(pending.timeoutTimer);
        this.pendingRequests.delete(msg.id);

        if (msg.status === 'success') {
          pending.resolve(msg.result);
        } else {
          pending.reject(new Error(msg.error || 'Action execution failed in Figma'));
        }
      }
    }
  }

  /**
   * Send an action to Figma plugin and await result
   */
  public executeAction(action: ActionType, payload: any = {}, timeoutMs: number = 15000): Promise<any> {
    if (!this.isConnected() || !this.activePluginSocket) {
      return Promise.reject(new Error('Figma Plugin is not connected. Please open the plugin in Figma and connect to ws://localhost:3050/ws'));
    }

    const requestId = `req_${Date.now()}_${++this.requestCounter}`;
    const msg: PluginMessage = {
      id: requestId,
      type: 'EXECUTE_ACTION',
      action,
      payload,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Timeout waiting for Figma action '${action}' response after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeoutTimer });

      try {
        this.activePluginSocket!.send(JSON.stringify(msg));
      } catch (err: any) {
        clearTimeout(timeoutTimer);
        this.pendingRequests.delete(requestId);
        reject(new Error(`Failed to send message to Figma: ${err?.message || err}`));
      }
    });
  }
}
