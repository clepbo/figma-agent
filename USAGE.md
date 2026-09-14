# 📖 Figma Agent Step-by-Step Usage Guide

This guide walks you through setting up and using **Figma Agent** for natural language Figma canvas automation (Read and Write).

---

## 🛠️ Step 1: Start the Agent Backend & Web Dashboard

In your terminal, run:

```bash
# Install dependencies
npm install

# Build plugin and server binaries
npm run build

# Start the Agent server
npm start
```

You will see the following startup logs:
```
[WebSocket Bridge] Server listening on ws://0.0.0.0:3050
[HTTP Server] Web Dashboard running on http://0.0.0.0:3000
[Status] Figma REST Token: Not set (optional)
```

Open `http://localhost:3000` in your web browser to view the interactive **Figma Agent Dashboard**.

---

## 🎨 Step 2: Load the Figma Plugin into Figma

1. Open **Figma** (Desktop application or Web browser at `figma.com`).
2. Create or open any Figma document.
3. In the Figma menu bar, navigate to **Plugins** -> **Development** -> **Import manifest from file...**
4. Navigate to the repository folder and select `plugin/manifest.json`.
5. Run the imported plugin **Figma AI Agent Bridge**.
6. The plugin window will open in Figma. Click the **Connect Agent** button.
7. The status badge will change to `● Connected` in green!

---

## 🚀 Step 3: Interacting with Figma via Natural Language

You can now issue design requests using the Web Dashboard or terminal CLI!

### Examples:

#### 1. Generate UI Component Cards
In the Web Dashboard prompt bar, type:
> *"Create a dark mode login card with email, password fields and a blue primary button"*

Figma Agent will instantly construct the card frame, text titles, input fields, auto-layout parameters, and button elements directly on your open Figma canvas!

#### 2. Generate a Complete Design System
Type:
> *"Create a design system with primary color #8B5CF6 and dark background"*

Figma Agent will create color swatches (Primary, Secondary, Background, Surface, Text) along with styled primary and secondary button components.

#### 3. Inspect Selected Canvas Elements
Select any layer or frame in Figma, then type in the prompt bar:
> *"Inspect current selection"*

Figma Agent will retrieve node geometry, font properties, colors, and layout dimensions and display them in the Web UI log.

#### 4. Export Selection as High-Res Image
Select any frame in Figma and type:
> *"Export selection image"*

The agent will render the frame in Figma and display a live image preview in the **Image Preview** tab!

---

## 💻 Terminal CLI Usage

You can also control Figma directly from your terminal:

```bash
npm run cli -- "Create a red rounded button with text 'Delete Account'"
```

---

## ⚙️ Optional: Figma REST Access Token & External LLM Setup

Click **⚙️ Settings** in the Web Dashboard header to configure optional settings:
- **Figma Access Token**: Generate a personal access token in Figma Settings -> Personal Access Tokens. Provides token-based file reading even when the plugin is closed.
- **LLM Provider**: Switch between **Built-in Design Engine** (default, no API key required), **OpenAI (GPT-4o)**, or **Anthropic (Claude 3.5)**.
