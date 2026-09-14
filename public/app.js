document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const pluginStatus = document.getElementById('pluginStatus');
  const restStatus = document.getElementById('restStatus');
  const chatHistory = document.getElementById('chatHistory');
  const promptInput = document.getElementById('promptInput');
  const btnSendPrompt = document.getElementById('btnSendPrompt');
  const logStream = document.getElementById('logStream');
  const previewContainer = document.getElementById('previewContainer');

  // Main Nav Tabs
  const mainTabBtns = document.querySelectorAll('.main-tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  // PRD View Elements
  const prdText = document.getElementById('prdText');
  const btnParsePRD = document.getElementById('btnParsePRD');
  const prdSpecResult = document.getElementById('prdSpecResult');

  // Inspiration View Elements
  const inspirationQuery = document.getElementById('inspirationQuery');
  const btnSearchInspiration = document.getElementById('btnSearchInspiration');
  const inspirationGrid = document.getElementById('inspirationGrid');

  // Skills View Elements
  const skillsGrid = document.getElementById('skillsGrid');
  const customSkillMd = document.getElementById('customSkillMd');
  const btnInstallSkill = document.getElementById('btnInstallSkill');

  // Tools View Elements
  const toolSelect = document.getElementById('toolSelect');
  const toolArgs = document.getElementById('toolArgs');
  const btnRunTool = document.getElementById('btnRunTool');
  const toolResultJson = document.getElementById('toolResultJson');

  // Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  const btnSettings = document.getElementById('btnSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const cfgRestToken = document.getElementById('cfgRestToken');
  const cfgLlmProvider = document.getElementById('cfgLlmProvider');
  const cfgApiKey = document.getElementById('cfgApiKey');
  const groupApiKey = document.getElementById('groupApiKey');

  // Tab Navigation Handler
  mainTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mainTabBtns.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
    });
  });

  // Load Status
  async function checkStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();

      if (data.pluginConnected) {
        pluginStatus.className = 'status-badge connected';
        pluginStatus.querySelector('.text').textContent = 'Figma Plugin: Connected';
      } else {
        pluginStatus.className = 'status-badge disconnected';
        pluginStatus.querySelector('.text').textContent = 'Figma Plugin: Disconnected';
      }

      if (data.hasRestToken) {
        restStatus.className = 'status-badge rest-on';
        restStatus.querySelector('.text').textContent = 'REST Token: Configured';
      } else {
        restStatus.className = 'status-badge rest-off';
        restStatus.querySelector('.text').textContent = 'REST Token: Not Set';
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  }

  // Load Available Tools
  async function loadTools() {
    try {
      const res = await fetch('/api/tools');
      const data = await res.json();
      toolSelect.innerHTML = '<option value="">-- Choose Figma Tool --</option>';

      data.tools.forEach(tool => {
        const opt = document.createElement('option');
        opt.value = tool.name;
        opt.textContent = `${tool.name} (${tool.description})`;
        toolSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Failed to load tools:', err);
    }
  }

  toolSelect.addEventListener('change', () => {
    const selected = toolSelect.value;
    if (!selected) {
      toolArgs.value = '';
      return;
    }
    if (selected === 'create_text') {
      toolArgs.value = JSON.stringify({ text: 'Hello World', fontSize: 20, fillColor: '#38BDF8' }, null, 2);
    } else if (selected === 'create_frame') {
      toolArgs.value = JSON.stringify({ name: 'New Frame', width: 300, height: 200, fillColor: '#1E293B' }, null, 2);
    } else if (selected === 'export_node_image') {
      toolArgs.value = JSON.stringify({ format: 'PNG', scale: 2 }, null, 2);
    } else if (selected === 'execute_custom_figma_script') {
      toolArgs.value = JSON.stringify({ code: 'figma.currentPage.selection.forEach(n => n.opacity = 0.5);' }, null, 2);
    } else {
      toolArgs.value = '{}';
    }
  });

  // Load Installed Skills
  async function loadSkills() {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      skillsGrid.innerHTML = '';

      data.skills.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.innerHTML = `
          <h4>${skill.command}</h4>
          <span class="skill-badge">${skill.category}</span>
          <p><strong>${skill.name}</strong>: ${skill.description}</p>
          <button class="btn primary-btn btn-use-skill" data-cmd="${skill.command}">Run Skill</button>
        `;
        skillsGrid.appendChild(card);
      });

      document.querySelectorAll('.btn-use-skill').forEach(btn => {
        btn.addEventListener('click', () => {
          const cmd = btn.getAttribute('data-cmd');
          document.querySelector('[data-tab="chatView"]').click();
          promptInput.value = `${cmd} `;
          promptInput.focus();
        });
      });
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  }

  // Load Curated Inspirations
  async function loadInspirations(query = '') {
    try {
      const url = query ? `/api/inspiration?q=${encodeURIComponent(query)}` : '/api/inspiration';
      const res = await fetch(url);
      const data = await res.json();
      inspirationGrid.innerHTML = '';

      data.inspirations.forEach(style => {
        const card = document.createElement('div');
        card.className = 'inspiration-card';
        card.innerHTML = `
          <h3>${style.themeName}</h3>
          <span class="tag">${style.category}</span>
          <div class="color-swatch-row">
            <div class="swatch" style="background-color: ${style.palette.primary}" title="Primary ${style.palette.primary}"></div>
            <div class="swatch" style="background-color: ${style.palette.secondary}" title="Secondary ${style.palette.secondary}"></div>
            <div class="swatch" style="background-color: ${style.palette.background}" title="BG ${style.palette.background}"></div>
            <div class="swatch" style="background-color: ${style.palette.accent}" title="Accent ${style.palette.accent}"></div>
          </div>
          <button class="btn primary-btn btn-apply-style">Apply Style to Canvas</button>
        `;
        inspirationGrid.appendChild(card);

        card.querySelector('.btn-apply-style').addEventListener('click', () => {
          document.querySelector('[data-tab="chatView"]').click();
          sendPrompt(`/find-inspiration Create UI concept with ${style.themeName}`);
        });
      });
    } catch (err) {
      console.error('Failed to load inspirations:', err);
    }
  }

  btnSearchInspiration.addEventListener('click', () => {
    loadInspirations(inspirationQuery.value.trim());
  });

  // Install Custom Skill
  btnInstallSkill.addEventListener('click', async () => {
    const md = customSkillMd.value.trim();
    if (!md) {
      alert('Please enter markdown skill text');
      return;
    }

    try {
      const res = await fetch('/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Installed skill');
        loadSkills();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (e) {
      alert('Error installing skill');
    }
  });

  // Parse PRD & Generate Figma UI
  btnParsePRD.addEventListener('click', async () => {
    const brief = prdText.value.trim();
    if (!brief) {
      alert('Please paste a PRD or brief text first');
      return;
    }

    try {
      prdSpecResult.innerHTML = `<p class="info">Analyzing PRD requirements and generating Figma UI design system...</p>`;

      const res = await fetch('/api/brief/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief })
      });

      const data = await res.json();
      const spec = data.spec;

      let html = `<h4>Product: ${spec.productTitle} (${spec.category})</h4>`;
      html += `<p><strong>Detected Theme:</strong> ${spec.theme.toUpperCase()} | <strong>Primary Color:</strong> <span style="color:${spec.brandColors.primary}">■</span> ${spec.brandColors.primary}</p>`;
      html += `<p><strong>Screens to Generate (${spec.screens.length}):</strong></p><ul>`;

      spec.screens.forEach(s => {
        html += `<li><strong>${s.screenName}</strong> (${s.screenType}): ${s.description}</li>`;
      });
      html += `</ul><br><button id="btnConfirmGeneratePRD" class="btn primary-btn block-btn">Execute Design Generation in Figma 🚀</button>`;

      prdSpecResult.innerHTML = html;

      document.getElementById('btnConfirmGeneratePRD').addEventListener('click', () => {
        document.querySelector('[data-tab="chatView"]').click();
        sendPrompt(`/translate-prd-brief ${brief}`);
      });
    } catch (err) {
      prdSpecResult.innerHTML = `<p class="error">Error parsing PRD: ${err.message}</p>`;
    }
  });

  // Logger Helper
  function appendLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.textContent = `[${time}] ${msg}`;
    logStream.appendChild(div);
    logStream.scrollTop = logStream.scrollHeight;
  }

  // Chat Message Helper
  function appendChatMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = `msg ${isUser ? 'user-msg' : 'system-msg'}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = isUser ? '👤' : '🤖';

    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = typeof text === 'string' ? text.replace(/\n/g, '<br>') : text;

    msg.appendChild(avatar);
    msg.appendChild(content);
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Send Prompt / Skill
  async function sendPrompt(promptText) {
    if (!promptText) return;

    appendChatMessage(promptText, true);
    promptInput.value = '';
    appendLog(`Processing prompt: "${promptText}"`, 'info');

    try {
      const res = await fetch('/api/agent/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await res.json();

      if (data.success) {
        appendLog(`Execution completed! ${data.message}`, 'success');

        let stepsHtml = `<strong>Result:</strong> ${data.message}<br><br><ol>`;
        data.steps.forEach(step => {
          stepsHtml += `<li><strong>${step.toolName}</strong>: ${step.status === 'success' ? '✅ Executed' : '❌ Error'}`;
          if (step.result && step.result.base64) {
            previewContainer.innerHTML = `<img src="data:${step.result.mimeType};base64,${step.result.base64}" alt="Figma Render Preview" />`;
            stepsHtml += `<br><em>Image preview rendered!</em>`;
          }
          stepsHtml += `</li>`;
        });
        stepsHtml += `</ol>`;

        appendChatMessage(stepsHtml, false);
      } else {
        appendLog(`Execution failed: ${data.message}`, 'error');
        appendChatMessage(`⚠️ <strong>Error:</strong> ${data.message}`, false);
      }
    } catch (err) {
      appendLog(`Server request error: ${err.message}`, 'error');
      appendChatMessage(`⚠️ <strong>Server error:</strong> ${err.message}`, false);
    }
  }

  btnSendPrompt.addEventListener('click', () => sendPrompt(promptInput.value.trim()));

  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendPrompt(promptInput.value.trim());
  });

  // Quick Template Buttons
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-prompt');
      if (p) sendPrompt(p);
    });
  });

  // Manual Tool Runner
  btnRunTool.addEventListener('click', async () => {
    const toolName = toolSelect.value;
    if (!toolName) {
      alert('Please select a tool first');
      return;
    }

    let parsedArgs = {};
    try {
      if (toolArgs.value.trim()) {
        parsedArgs = JSON.parse(toolArgs.value.trim());
      }
    } catch (e) {
      alert('Invalid JSON in arguments field');
      return;
    }

    try {
      const res = await fetch('/api/agent/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: toolName, args: parsedArgs })
      });

      const data = await res.json();
      toolResultJson.textContent = JSON.stringify(data, null, 2);

      if (data.result && data.result.base64) {
        previewContainer.innerHTML = `<img src="data:${data.result.mimeType};base64,${data.result.base64}" alt="Figma Render Preview" />`;
      }
    } catch (err) {
      toolResultJson.textContent = `Error: ${err.message}`;
    }
  });

  // Output Panel Tabs
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      if (target === 'logs') document.getElementById('tabLogs').classList.add('active');
      if (target === 'preview') document.getElementById('tabPreview').classList.add('active');
    });
  });

  // Settings Modal Controls
  btnSettings.addEventListener('click', () => settingsModal.classList.add('active'));
  btnCloseSettings.addEventListener('click', () => settingsModal.classList.remove('active'));

  cfgLlmProvider.addEventListener('change', () => {
    groupApiKey.style.display = cfgLlmProvider.value === 'builtin' ? 'none' : 'block';
  });

  btnSaveConfig.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figmaAccessToken: cfgRestToken.value.trim(),
          llmProvider: cfgLlmProvider.value,
          openAiApiKey: cfgLlmProvider.value === 'openai' ? cfgApiKey.value.trim() : undefined,
          anthropicApiKey: cfgLlmProvider.value === 'anthropic' ? cfgApiKey.value.trim() : undefined
        })
      });
      const data = await res.json();
      alert(data.message || 'Saved settings');
      settingsModal.classList.remove('active');
      checkStatus();
    } catch (e) {
      alert('Failed to save configuration');
    }
  });

  // Initial Load
  setInterval(checkStatus, 3000);
  checkStatus();
  loadTools();
  loadSkills();
  loadInspirations();
});
