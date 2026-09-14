# 📐 Figma Agent Architecture (No-MCP)

This document explains how **Figma Agent** enables bidirectional communication (Read and Write) with Figma without using Model Context Protocol (MCP).

---

## 🔍 Why Avoid MCP for Figma Write Access?

Figma's official REST API (`https://api.figma.com/v1`) is strictly **read-only** for canvas geometry and document node manipulation. It allows fetching node trees and exporting images, but **does not allow creating layers, changing text, or adding shapes**.

To perform **Write operations** on the canvas, code must run inside Figma's sandboxed environment via the **Figma Plugin API** (`figma.currentPage.appendChild()`, `figma.createText()`, `figma.createFrame()`, etc.).

MCP servers typically wrap REST APIs or headless browser tools. By establishing a direct **WebSocket JSON-RPC Bridge** between an external Agent and a native Figma Plugin, we achieve:
1. **Full Read & Write Capability** on the open canvas.
2. **Sub-millisecond Latency** for canvas inspection and updates.
3. **Zero Third-Party Middlemen or MCP Gateway Dependencies**.

---

## 🧱 Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      User Interfaces                        │
 │  ┌───────────────────────────┐   ┌───────────────────────┐  │
 │  │ Web UI Dashboard (p:3000) │   │ Terminal CLI (`cli`)  │  │
 │  └─────────────┬─────────────┘   └───────────┬───────────┘  │
 └────────────────┼─────────────────────────────┼──────────────┘
                  │ HTTP / REST                 │
                  ▼                             │
 ┌──────────────────────────────────────────────▼──────────────┐
 │                     Figma Agent Server                      │
 │                                                             │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ FigmaAgent Engine (Planner + LLM Router)              │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              │                              │
 │  ┌───────────────────────────▼───────────────────────────┐  │
 │  │ Tools Registry (10+ Read/Write Handlers)              │  │
 │  └─────────────┬───────────────────────────┬─────────────┘  │
 │                │                           │                │
 │  ┌─────────────▼─────────────┐   ┌─────────▼─────────────┐  │
 │  │ WebSocket Bridge (p:3050) │   │ Figma REST Client     │  │
 │  └─────────────┬─────────────┘   └─────────┬─────────────┘  │
 └────────────────┼───────────────────────────┼────────────────┘
                  │ WS                        │ HTTPS
                  ▼                           ▼
 ┌──────────────────────────────┐   ┌──────────────────────────┐
 │ Figma Plugin (UI + Code.ts)  │   │ Figma REST API           │
 │  * Native figma.* JS SDK     │   │  * Token-based Reading   │
 └──────────────────────────────┘   └──────────────────────────┘
```

---

## 🛰️ Communication Protocol

The WebSocket Bridge communicates over `ws://localhost:3050/ws` using a JSON-RPC message protocol:

### Message Format (`PluginMessage`)
```typescript
interface PluginMessage {
  id: string;
  type: 'REGISTER_PLUGIN' | 'EXECUTE_ACTION' | 'ACTION_RESULT' | 'SELECTION_CHANGE' | 'PING' | 'PONG';
  action?: ActionType;
  payload?: any;
  result?: any;
  error?: string;
  status?: 'success' | 'error';
  timestamp?: number;
}
```

### Request Flow
1. **User Request**: User asks: *"Create a dark button with label 'Submit'"*.
2. **Planner / LLM**: `FigmaAgent` plans tool actions: `create_frame` and `create_text`.
3. **Bridge Dispatch**: `FigmaWebSocketBridge.executeAction('CREATE_FRAME', payload)` generates a unique request ID `req_1726300000_1` and sends JSON over WebSocket to `plugin/ui.html`.
4. **Figma Main Thread Execution**: `ui.html` forwards payload via `parent.postMessage()` to `plugin/code.ts`. `code.ts` executes native Figma SDK calls (`figma.createFrame()`).
5. **Response**: `code.ts` serializes created node and sends `ACTION_RESULT` back to `ui.html` -> WebSocket Bridge -> Agent.

---

## 🔒 Security Model

- **Local Scope**: The WebSocket server binds to `0.0.0.0` inside the sandboxed agent runtime.
- **Explicit User Consent**: Actions run only when the user opens and connects the Figma Plugin.
- **Sandboxed Execution**: Custom JavaScript code executed via `execute_custom_figma_script` runs inside Figma's sandboxed iframe environment, preventing access to host OS.
