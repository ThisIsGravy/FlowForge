// FlowForge - Intelligent Process Automation Portfolio
// Showcasing low-code, AI integration, and automation expertise

import './style.css';

// Application State
const state = {
  currentTab: 'onboarding',
  isSimulating: false,
  simulationLogs: [],
  activeNodes: []
};

// Process Demo Data
const processFlows = {
  onboarding: {
    title: 'Employee Onboarding Automation',
    steps: [
      { icon: '📥', title: 'HR Submits Request', desc: 'New hire form received' },
      { icon: '🤖', title: 'AI Analyzes Role', desc: 'Determines requirements' },
      { icon: '⚡', title: 'Auto-Provisioning', desc: 'Accounts & access created' },
      { icon: '📋', title: 'Task Assignment', desc: 'Training tasks queued' },
      { icon: '✅', title: 'Completion', desc: 'Ready for day one' }
    ],
    metrics: [
      { value: '85%', label: 'Time Saved' },
      { value: '< 2 min', label: 'Processing Time' },
      { value: '0', label: 'Manual Steps' },
      { value: '100%', label: 'Accuracy' }
    ]
  },
  ticketing: {
    title: 'AI-Powered Ticket Classification',
    steps: [
      { icon: '🎫', title: 'Ticket Created', desc: 'Support request received' },
      { icon: '🧠', title: 'AI Classification', desc: 'Category & priority set' },
      { icon: '🎯', title: 'Smart Routing', desc: 'Assigned to right team' },
      { icon: '📊', title: 'SLA Tracking', desc: 'Deadline monitored' },
      { icon: '💬', title: 'Auto-Response', desc: 'Initial reply sent' }
    ],
    metrics: [
      { value: '92%', label: 'Classification Accuracy' },
      { value: '< 30s', label: 'Routing Time' },
      { value: '45%', label: 'Faster Resolution' },
      { value: '24/7', label: 'Availability' }
    ]
  },
  approvals: {
    title: 'Smart Approval Workflows',
    steps: [
      { icon: '📝', title: 'Request Submitted', desc: 'Approval request created' },
      { icon: '🔍', title: 'Policy Check', desc: 'Auto-validated against rules' },
      { icon: '👤', title: 'Approver Identified', desc: 'Based on org hierarchy' },
      { icon: '📱', title: 'Multi-Channel Notify', desc: 'Email, Slack, Teams' },
      { icon: '✨', title: 'Action Triggered', desc: 'Downstream systems updated' }
    ],
    metrics: [
      { value: '3x', label: 'Faster Approvals' },
      { value: '98%', label: 'Policy Compliance' },
      { value: '< 1 hr', label: 'Avg. Cycle Time' },
      { value: '50+', label: 'Integrations' }
    ]
  }
};

// n8n Workflow Export Templates
const workflowExports = {
  onboarding: {
    name: "Employee Onboarding Workflow",
    nodes: [
      {
        "parameters": {
          "httpMethod": "POST",
          "path": "new-hire",
          "responseMode": "onReceived"
        },
        "id": "webhook-trigger",
        "name": "Webhook Trigger",
        "type": "n8n-nodes-base.webhook",
        "position": [240, 300]
      },
      {
        "parameters": {
          "model": "gpt-4",
          "messages": {
            "values": [
              {
                "content": "Analyze the following employee data and determine: 1) Role category (Engineering, Sales, Operations, etc), 2) Required software access, 3) Team assignment. Return as JSON.\n\nEmployee: {{$json.name}}\nTitle: {{$json.title}}\nDepartment: {{$json.department}}"
              }
            ]
          }
        },
        "id": "ai-classification",
        "name": "AI Role Classification",
        "type": "@n8n/n8n-nodes-langchain.openAi",
        "position": [460, 300]
      },
      {
        "parameters": {
          "batchSize": 3,
          "options": {}
        },
        "id": "parallel-split",
        "name": "Split for Parallel Processing",
        "type": "n8n-nodes-base.splitInBatches",
        "position": [680, 300]
      },
      {
        "parameters": {
          "url": "https://graph.microsoft.com/v1.0/users",
          "authentication": "oAuth2",
          "method": "POST"
        },
        "id": "create-azure-user",
        "name": "Create Azure AD User",
        "type": "n8n-nodes-base.httpRequest",
        "position": [900, 200]
      },
      {
        "parameters": {
          "channel": "#hr-onboarding",
          "text": "🎉 New hire {{$json.name}} has been fully onboarded! All systems provisioned."
        },
        "id": "slack-notify",
        "name": "Slack Notification",
        "type": "n8n-nodes-base.slack",
        "position": [1120, 300]
      }
    ],
    connections: {
      "Webhook Trigger": { "main": [[{ "node": "AI Role Classification" }]] },
      "AI Role Classification": { "main": [[{ "node": "Split for Parallel Processing" }]] },
      "Split for Parallel Processing": { "main": [[{ "node": "Create Azure AD User" }]] },
      "Create Azure AD User": { "main": [[{ "node": "Slack Notification" }]] }
    }
  },
  ticketing: {
    name: "AI Ticket Classification",
    nodes: [
      {
        "parameters": {
          "httpMethod": "POST",
          "path": "support-ticket"
        },
        "id": "ticket-webhook",
        "name": "Ticket Webhook",
        "type": "n8n-nodes-base.webhook",
        "position": [240, 300]
      },
      {
        "parameters": {
          "model": "gpt-4",
          "messages": {
            "values": [
              {
                "content": "Classify this support ticket. Return JSON with: category, priority (low/medium/high/urgent), team, sentiment, estimated_resolution_time.\n\nTicket: {{$json.subject}}\n{{$json.body}}"
              }
            ]
          }
        },
        "id": "ai-classify",
        "name": "AI Classification",
        "type": "@n8n/n8n-nodes-langchain.openAi",
        "position": [460, 300]
      },
      {
        "parameters": {
          "conditions": {
            "string": [{ "value1": "={{$json.priority}}", "value2": "urgent" }]
          }
        },
        "id": "priority-check",
        "name": "Priority Router",
        "type": "n8n-nodes-base.if",
        "position": [680, 300]
      }
    ]
  }
};

// Make Scenario Export Template
const makeScenarios = {
  onboarding: {
    name: "Employee Onboarding Automation",
    blueprint: {
      "name": "Employee Onboarding",
      "flow": [
        { "id": 1, "module": "gateway:CustomWebHook", "label": "HR Form Webhook" },
        { "id": 2, "module": "openai:CreateCompletion", "label": "AI Role Analysis" },
        { "id": 3, "module": "microsoft-azure-ad:createUser", "label": "Create Azure User" },
        { "id": 4, "module": "google-workspace:createUser", "label": "Create Google User" },
        { "id": 5, "module": "slack:sendMessage", "label": "Notify Team" }
      ],
      "metadata": {
        "version": 1,
        "scenario": { "roundTripTime": 8500, "operations": 5 }
      }
    }
  }
};

// Render the application
function renderApp() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <!-- Navigation -->
    <nav class="nav" id="navbar">
      <div class="container nav-inner">
        <a href="#" class="nav-logo">
          <span class="nav-logo-icon">⚡</span>
          FlowForge
        </a>
        <ul class="nav-links">
          <li><a href="#capabilities" class="nav-link">Capabilities</a></li>
          <li><a href="#tools" class="nav-link">Tools</a></li>
          <li><a href="#demo" class="nav-link">Demo</a></li>
          <li><a href="#exports" class="nav-link">Workflows</a></li>
          <li><a href="#project" class="nav-link">Case Study</a></li>
        </ul>
        <a href="#contact" class="nav-cta">Let's Connect</a>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="hero">
      <div class="container hero-content">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            Available for Automation Roles
          </div>
          <h1 class="hero-title">
            Transforming Business Challenges into
            <span class="hero-title-gradient">Smart Automation</span>
          </h1>
          <p class="hero-subtitle">
            I build intelligent workflows that make processes faster, leaner, and smarter — 
            combining low-code platforms with AI to deliver real business impact.
          </p>
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat-value">n8n</div>
              <div class="hero-stat-label">Workflow Automation</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value">Make</div>
              <div class="hero-stat-label">Integration Expert</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value">AI</div>
              <div class="hero-stat-label">Enhanced Solutions</div>
            </div>
          </div>
          <div class="hero-buttons">
            <a href="#demo" class="btn btn-primary">
              <span>View Live Demo</span>
              <span>→</span>
            </a>
            <a href="#exports" class="btn btn-secondary">
              <span>Download Workflows</span>
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-workflow-card">
            <div class="workflow-header">
              <span class="workflow-title">Smart Onboarding Flow</span>
              <span class="workflow-status">
                <span class="workflow-status-dot"></span>
                Active
              </span>
            </div>
            <div class="workflow-nodes" id="hero-workflow-nodes">
              <div class="workflow-node" data-node="0">
                <div class="workflow-node-icon trigger">📥</div>
                <div class="workflow-node-content">
                  <div class="workflow-node-label">Webhook Trigger</div>
                  <div class="workflow-node-desc">HR system new hire event</div>
                </div>
              </div>
              <div class="workflow-node-connector"></div>
              <div class="workflow-node" data-node="1">
                <div class="workflow-node-icon ai">🧠</div>
                <div class="workflow-node-content">
                  <div class="workflow-node-label">AI Classification</div>
                  <div class="workflow-node-desc">Role type & requirements</div>
                </div>
              </div>
              <div class="workflow-node-connector"></div>
              <div class="workflow-node" data-node="2">
                <div class="workflow-node-icon action">⚡</div>
                <div class="workflow-node-content">
                  <div class="workflow-node-label">Parallel Actions</div>
                  <div class="workflow-node-desc">Create accounts, assign tasks</div>
                </div>
              </div>
              <div class="workflow-node-connector"></div>
              <div class="workflow-node" data-node="3">
                <div class="workflow-node-icon output">✅</div>
                <div class="workflow-node-content">
                  <div class="workflow-node-label">Notify & Complete</div>
                  <div class="workflow-node-desc">Slack + email confirmation</div>
                </div>
              </div>
            </div>
            <div class="hero-float-badge n8n">⚡ Built with n8n</div>
            <div class="hero-float-badge make">🔧 Make Integration</div>
            <div class="hero-float-badge ai">🧠 AI Powered</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities Section -->
    <section class="section" id="capabilities">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">💡 Core Capabilities</span>
          <h2 class="section-title">What I Bring to the Table</h2>
          <p class="section-subtitle">
            A solution-oriented mindset combined with technical expertise to deliver 
            automation solutions that scale.
          </p>
        </div>
        <div class="features-grid">
          <div class="feature-card animate-on-scroll">
            <div class="feature-icon">🔄</div>
            <h3 class="feature-title">Workflow Automation</h3>
            <p class="feature-description">
              Design and implement end-to-end process automations that eliminate manual 
              bottlenecks and reduce processing time by 80%+.
            </p>
            <div class="feature-tags">
              <span class="feature-tag">n8n</span>
              <span class="feature-tag">Make</span>
              <span class="feature-tag">Zapier</span>
              <span class="feature-tag">Power Automate</span>
            </div>
          </div>
          <div class="feature-card animate-on-scroll">
            <div class="feature-icon">🧠</div>
            <h3 class="feature-title">AI Integration</h3>
            <p class="feature-description">
              Embed AI capabilities into workflows for intelligent routing, 
              classification, natural language processing, and predictive automation.
            </p>
            <div class="feature-tags">
              <span class="feature-tag">OpenAI</span>
              <span class="feature-tag">Claude</span>
              <span class="feature-tag">NLP</span>
              <span class="feature-tag">Classification</span>
            </div>
          </div>
          <div class="feature-card animate-on-scroll">
            <div class="feature-icon">🔗</div>
            <h3 class="feature-title">System Integration</h3>
            <p class="feature-description">
              Connect disparate systems seamlessly using APIs, webhooks, and 
              database integrations to create unified data flows.
            </p>
            <div class="feature-tags">
              <span class="feature-tag">REST APIs</span>
              <span class="feature-tag">Webhooks</span>
              <span class="feature-tag">SQL</span>
              <span class="feature-tag">OAuth</span>
            </div>
          </div>
          <div class="feature-card animate-on-scroll">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">Process Analysis</h3>
            <p class="feature-description">
              Break down complex workflows, identify automation opportunities, 
              and design scalable solutions with measurable business impact.
            </p>
            <div class="feature-tags">
              <span class="feature-tag">Process Mapping</span>
              <span class="feature-tag">KPI Tracking</span>
              <span class="feature-tag">Optimization</span>
            </div>
          </div>
          <div class="feature-card animate-on-scroll">
            <div class="feature-icon">🎨</div>
            <h3 class="feature-title">UX-Focused Design</h3>
            <p class="feature-description">
              Build automations that feel intuitive to end users, with clear 
              notifications, simple interfaces, and thoughtful error handling.
            </p>
            <div class="feature-tags">
              <span class="feature-tag">User-Centric</span>
              <span class="feature-tag">Accessibility</span>
              <span class="feature-tag">Documentation</span>
            </div>
          </div>
          <div class="feature-card animate-on-scroll">
            <div class="feature-icon">🔐</div>
            <h3 class="feature-title">Security & Scalability</h3>
            <p class="feature-description">
              Design solutions with security best practices, proper access controls, 
              and architecture that scales with business growth.
            </p>
            <div class="feature-tags">
              <span class="feature-tag">Auth Flows</span>
              <span class="feature-tag">Encryption</span>
              <span class="feature-tag">Error Handling</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tools Section -->
    <section class="section" id="tools">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">🛠️ Technical Toolkit</span>
          <h2 class="section-title">Tools & Technologies</h2>
          <p class="section-subtitle">
            Proficient in leading low-code platforms and supporting technologies 
            to deliver robust automation solutions.
          </p>
        </div>
        <div class="tools-showcase">
          <div class="tool-card animate-on-scroll">
            <div class="tool-icon">🔷</div>
            <div class="tool-name">n8n</div>
            <div class="tool-category">Workflow Automation</div>
          </div>
          <div class="tool-card animate-on-scroll">
            <div class="tool-icon">🟣</div>
            <div class="tool-name">Make (Integromat)</div>
            <div class="tool-category">Integration Platform</div>
          </div>
          <div class="tool-card animate-on-scroll">
            <div class="tool-icon">🐍</div>
            <div class="tool-name">Python</div>
            <div class="tool-category">Scripting & Automation</div>
          </div>
          <div class="tool-card animate-on-scroll">
            <div class="tool-icon">🟨</div>
            <div class="tool-name">JavaScript</div>
            <div class="tool-category">Custom Logic</div>
          </div>
          <div class="tool-card animate-on-scroll">
            <div class="tool-icon">🗄️</div>
            <div class="tool-name">SQL / Databases</div>
            <div class="tool-category">Data Management</div>
          </div>
          <div class="tool-card animate-on-scroll">
            <div class="tool-icon">🔌</div>
            <div class="tool-name">REST APIs</div>
            <div class="tool-category">System Integration</div>
          </div>
          <div class="tool-card animate-on-scroll">
            <div class="tool-icon">🤖</div>
            <div class="tool-name">OpenAI / LLMs</div>
            <div class="tool-category">AI Integration</div>
          </div>
          <div class="tool-card animate-on-scroll">
            <div class="tool-icon">💬</div>
            <div class="tool-name">Slack / Teams</div>
            <div class="tool-category">Communication</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Process Demo Section -->
    <section class="section" id="demo">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">🎯 Interactive Demo</span>
          <h2 class="section-title">Automation in Action</h2>
          <p class="section-subtitle">
            Explore different workflow automations and see how complex business 
            processes can be streamlined. Click "Run Simulation" to see it in action!
          </p>
        </div>
        <div class="process-demo animate-on-scroll">
          <div class="process-demo-header">
            <h3 id="process-title">${processFlows.onboarding.title}</h3>
            <div class="process-demo-tabs">
              <button class="process-tab active" data-tab="onboarding">Onboarding</button>
              <button class="process-tab" data-tab="ticketing">Ticketing</button>
              <button class="process-tab" data-tab="approvals">Approvals</button>
            </div>
          </div>
          
          <!-- Simulation Controls -->
          <div class="simulation-controls">
            <button class="sim-btn" id="run-simulation">
              <span class="sim-icon">▶️</span>
              <span>Run Simulation</span>
            </button>
            <button class="sim-btn" id="reset-simulation">
              <span>🔄</span>
              <span>Reset</span>
            </button>
          </div>
          
          <div class="process-flow" id="process-flow">
            ${renderProcessFlow('onboarding')}
          </div>
          
          <!-- Execution Log -->
          <div class="execution-log" id="execution-log" style="display: none;">
            <div class="log-entry">
              <span class="log-time">[--:--:--]</span>
              <span class="log-message">Ready to run simulation...</span>
            </div>
          </div>
          
          <div class="process-metrics" id="process-metrics">
            ${renderProcessMetrics('onboarding')}
          </div>
        </div>

        <!-- Interactive Node Builder -->
        <div class="node-builder animate-on-scroll">
          <div class="node-builder-header">
            <h4 class="node-builder-title">🛠️ Try Building a Workflow</h4>
            <div class="node-builder-actions">
              <button class="sim-btn" id="clear-canvas">Clear Canvas</button>
            </div>
          </div>
          <div class="node-palette">
            <button class="palette-node" data-type="webhook">📥 Webhook</button>
            <button class="palette-node" data-type="ai">🧠 AI Node</button>
            <button class="palette-node" data-type="http">🔌 HTTP Request</button>
            <button class="palette-node" data-type="slack">💬 Slack</button>
            <button class="palette-node" data-type="email">📧 Email</button>
            <button class="palette-node" data-type="database">🗄️ Database</button>
            <button class="palette-node" data-type="condition">🔀 IF Condition</button>
            <button class="palette-node" data-type="loop">🔁 Loop</button>
          </div>
          <div class="node-builder-canvas" id="node-canvas">
            <span style="color: var(--text-tertiary); font-size: 0.9rem;">
              👆 Click nodes above to add them to your workflow
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Workflow Exports Section -->
    <section class="section" id="exports">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">📦 Ready-to-Use Workflows</span>
          <h2 class="section-title">Downloadable Automation Templates</h2>
          <p class="section-subtitle">
            Export these production-ready workflows and import them directly into 
            n8n or Make. Customize to fit your needs.
          </p>
        </div>
        <div class="exports-grid">
          <div class="export-card animate-on-scroll" data-export="n8n-onboarding">
            <div class="export-card-header">
              <div class="export-icon n8n">⚡</div>
              <div>
                <div class="export-card-title">Employee Onboarding</div>
                <div class="export-card-platform">n8n Workflow</div>
              </div>
            </div>
            <p class="export-card-description">
              Complete onboarding automation with AI role classification, 
              multi-system provisioning, and team notifications.
            </p>
            <div class="export-card-features">
              <span class="export-feature">OpenAI Integration</span>
              <span class="export-feature">Azure AD</span>
              <span class="export-feature">Slack Notify</span>
              <span class="export-feature">5 Nodes</span>
            </div>
            <div class="export-card-action">
              <button class="export-btn" data-workflow="n8n-onboarding">
                📥 Download JSON
              </button>
              <span class="export-file-size">~2.4 KB</span>
            </div>
          </div>

          <div class="export-card animate-on-scroll" data-export="n8n-ticketing">
            <div class="export-card-header">
              <div class="export-icon n8n">⚡</div>
              <div>
                <div class="export-card-title">AI Ticket Classifier</div>
                <div class="export-card-platform">n8n Workflow</div>
              </div>
            </div>
            <p class="export-card-description">
              Automatically classify and route support tickets using AI. 
              Includes priority detection and SLA tracking.
            </p>
            <div class="export-card-features">
              <span class="export-feature">GPT-4 Classification</span>
              <span class="export-feature">Smart Routing</span>
              <span class="export-feature">SLA Rules</span>
            </div>
            <div class="export-card-action">
              <button class="export-btn" data-workflow="n8n-ticketing">
                📥 Download JSON
              </button>
              <span class="export-file-size">~1.8 KB</span>
            </div>
          </div>

          <div class="export-card animate-on-scroll" data-export="make-onboarding">
            <div class="export-card-header">
              <div class="export-icon make">🟣</div>
              <div>
                <div class="export-card-title">Onboarding Scenario</div>
                <div class="export-card-platform">Make (Integromat)</div>
              </div>
            </div>
            <p class="export-card-description">
              Make scenario blueprint for employee onboarding. Includes 
              parallel processing and multi-system integration.
            </p>
            <div class="export-card-features">
              <span class="export-feature">Azure AD</span>
              <span class="export-feature">Google Workspace</span>
              <span class="export-feature">Slack</span>
            </div>
            <div class="export-card-action">
              <button class="export-btn" data-workflow="make-onboarding">
                📥 Download Blueprint
              </button>
              <span class="export-file-size">~1.2 KB</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Integration Section -->
    <section class="section" id="ai">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">🧠 AI-Powered</span>
          <h2 class="section-title">Making Processes Smarter</h2>
          <p class="section-subtitle">
            Embedding AI capabilities to enable intelligent decision-making 
            and natural language understanding in automations.
          </p>
        </div>
        <div class="ai-demo animate-on-scroll">
          <div class="ai-demo-visual">
            <div class="ai-input-box">
              <span class="ai-input-label">📥 Incoming Support Request</span>
              <div class="ai-input-text" id="ai-sample-input">
                "My laptop won't connect to the VPN after the latest Windows update. 
                I need this resolved ASAP as I have a client presentation in 2 hours!"
              </div>
            </div>
            <div class="ai-processing" id="ai-processing">
              <div class="ai-processing-dots">
                <span class="ai-processing-dot"></span>
                <span class="ai-processing-dot"></span>
                <span class="ai-processing-dot"></span>
              </div>
              <span class="ai-processing-text">AI analyzing request...</span>
            </div>
            <div class="ai-output-box" id="ai-output-box">
              <div class="ai-output-header">
                <span>✨</span>
                <span>AI Classification Result</span>
              </div>
              <div class="ai-output-result" id="ai-result">
                <span class="ai-tag">Category: VPN / Network</span>
                <span class="ai-tag priority-high">Priority: Urgent</span>
                <span class="ai-tag">Team: IT Support</span>
                <span class="ai-tag">Sentiment: Frustrated</span>
                <span class="ai-tag">SLA: 1 hour</span>
              </div>
            </div>
            <button class="sim-btn" id="try-ai-demo" style="margin-top: 1rem; width: 100%;">
              <span>🔄</span>
              <span>Try Another Example</span>
            </button>
          </div>
          <div class="ai-demo-content">
            <h3>Intelligent Automation Features</h3>
            <p>
              By integrating AI into workflows, we move beyond simple rule-based 
              automation to systems that understand context, learn patterns, 
              and make smart decisions.
            </p>
            <ul class="ai-feature-list">
              <li class="ai-feature-item">
                <div class="ai-feature-icon">🏷️</div>
                <div class="ai-feature-text">
                  <h4>Smart Classification</h4>
                  <p>Automatically categorize incoming requests based on content analysis</p>
                </div>
              </li>
              <li class="ai-feature-item">
                <div class="ai-feature-icon">🎯</div>
                <div class="ai-feature-text">
                  <h4>Priority Detection</h4>
                  <p>Identify urgency and sentiment to route critical items faster</p>
                </div>
              </li>
              <li class="ai-feature-item">
                <div class="ai-feature-icon">💡</div>
                <div class="ai-feature-text">
                  <h4>Suggested Actions</h4>
                  <p>AI recommends solutions based on similar past tickets</p>
                </div>
              </li>
              <li class="ai-feature-item">
                <div class="ai-feature-icon">📝</div>
                <div class="ai-feature-text">
                  <h4>Auto-Response Generation</h4>
                  <p>Draft personalized initial responses using context awareness</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Case Study Section -->
    <section class="section" id="project">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">📁 Case Study</span>
          <h2 class="section-title">Real-World Impact</h2>
          <p class="section-subtitle">
            A detailed look at a comprehensive automation project demonstrating 
            end-to-end solution design and implementation.
          </p>
        </div>
        <div class="case-study animate-on-scroll">
          <div class="case-study-header">
            <span class="case-study-badge">Featured Project</span>
            <h3 class="case-study-title">Enterprise Onboarding Automation System</h3>
            <p class="case-study-subtitle">
              End-to-end automation of the employee onboarding process, from HR request 
              to day-one readiness, with AI-powered customization.
            </p>
          </div>
          <div class="case-study-content">
            <div class="case-study-grid">
              <div class="case-study-section">
                <h4>🎯 Challenge</h4>
                <ul class="case-study-list">
                  <li>Manual onboarding took 4-5 days per employee</li>
                  <li>10+ different systems needed updates</li>
                  <li>Inconsistent experience across departments</li>
                  <li>HR overwhelmed with repetitive tasks</li>
                  <li>New hires often missing resources on day one</li>
                </ul>
              </div>
              <div class="case-study-section">
                <h4>⚡ Solution</h4>
                <ul class="case-study-list">
                  <li>Built n8n workflow triggered by HR system webhook</li>
                  <li>AI classifies role type and determines requirements</li>
                  <li>Parallel provisioning across all connected systems</li>
                  <li>Dynamic task assignment based on department</li>
                  <li>Automated Slack/Email notifications at each stage</li>
                </ul>
              </div>
              <div class="case-study-section">
                <h4>🔧 Technical Implementation</h4>
                <ul class="case-study-list">
                  <li>n8n for core workflow orchestration</li>
                  <li>OpenAI API for role classification</li>
                  <li>REST API integrations (Azure AD, Google, Slack)</li>
                  <li>PostgreSQL for audit logging</li>
                  <li>Custom JavaScript for complex logic</li>
                </ul>
              </div>
              <div class="case-study-section">
                <h4>🎨 UX Considerations</h4>
                <ul class="case-study-list">
                  <li>Clear progress notifications for HR and managers</li>
                  <li>Error handling with actionable messages</li>
                  <li>Dashboard for real-time onboarding status</li>
                  <li>Self-service portal for new hire</li>
                  <li>Documentation and rollback procedures</li>
                </ul>
              </div>
            </div>
            <div class="case-study-results">
              <div class="case-study-result">
                <div class="case-study-result-value">85%</div>
                <div class="case-study-result-label">Reduction in Processing Time</div>
              </div>
              <div class="case-study-result">
                <div class="case-study-result-value">100%</div>
                <div class="case-study-result-label">Day-One Readiness Rate</div>
              </div>
              <div class="case-study-result">
                <div class="case-study-result-value">20+ hrs</div>
                <div class="case-study-result-label">HR Time Saved Weekly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="section contact-section" id="contact">
      <div class="container">
        <div class="contact-card animate-on-scroll">
          <h2 class="contact-title">Let's Build Something Amazing</h2>
          <p class="contact-text">
            I'm excited about opportunities to transform business challenges 
            into smart, automated solutions. Let's connect and discuss how 
            I can contribute to your team.
          </p>
          <div class="contact-links">
            <a href="mailto:eli.zucker@hotmail.com" class="contact-link">
              <span>📧</span>
              <span>Email Me</span>
            </a>
            <a href="https://www.linkedin.com/in/eli-h-0a792588/" class="contact-link" target="_blank">
              <span>💼</span>
              <span>LinkedIn</span>
            </a>
            <a href="https://github.com/ThisIsGravy" class="contact-link" target="_blank">
              <span>🐙</span>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p class="footer-text">
          © 2026 FlowForge Portfolio • Built to demonstrate low-code automation expertise
        </p>
      </div>
    </footer>

    <!-- Modal for Code Preview -->
    <div class="modal-overlay" id="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title">Workflow Export</h3>
          <button class="modal-close" id="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <pre class="code-preview" id="modal-code"></pre>
        </div>
        <div class="modal-footer">
          <button class="sim-btn" id="copy-code">📋 Copy to Clipboard</button>
          <button class="export-btn" id="download-code">📥 Download File</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
      <span>✓</span>
      <span id="toast-message">Copied to clipboard!</span>
    </div>
  `;

  // Initialize interactions
  initializeInteractions();
  initializeScrollAnimations();
  initializeSimulation();
  initializeNodeBuilder();
  initializeExports();
  initializeAIDemo();
}

// Render process flow steps
function renderProcessFlow(tabId) {
  const flow = processFlows[tabId];
  return flow.steps.map((step, index) => `
    ${index > 0 ? '<span class="process-arrow">→</span>' : ''}
    <div class="process-step" data-step="${index}">
      <div class="process-step-number">${step.icon}</div>
      <div class="process-step-title">${step.title}</div>
      <div class="process-step-desc">${step.desc}</div>
    </div>
  `).join('');
}

// Render process metrics
function renderProcessMetrics(tabId) {
  const flow = processFlows[tabId];
  return flow.metrics.map(metric => `
    <div class="process-metric">
      <div class="process-metric-value">${metric.value}</div>
      <div class="process-metric-label">${metric.label}</div>
    </div>
  `).join('');
}

// Initialize tab interactions
function initializeInteractions() {
  // Process demo tabs
  const tabs = document.querySelectorAll('.process-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update content
      const tabId = tab.dataset.tab;
      const flow = processFlows[tabId];
      state.currentTab = tabId;

      document.getElementById('process-title').textContent = flow.title;
      document.getElementById('process-flow').innerHTML = renderProcessFlow(tabId);
      document.getElementById('process-metrics').innerHTML = renderProcessMetrics(tabId);

      // Reset simulation
      resetSimulation();

      // Animate steps sequentially
      animateProcessSteps();
    });
  });

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(8, 13, 25, 0.95)';
    } else {
      navbar.style.background = 'rgba(8, 13, 25, 0.8)';
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Hero workflow node hover effects
  document.querySelectorAll('#hero-workflow-nodes .workflow-node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      node.classList.add('active');
    });
    node.addEventListener('mouseleave', () => {
      node.classList.remove('active');
    });
  });
}

// Initialize simulation functionality
function initializeSimulation() {
  const runBtn = document.getElementById('run-simulation');
  const resetBtn = document.getElementById('reset-simulation');

  runBtn.addEventListener('click', runSimulation);
  resetBtn.addEventListener('click', resetSimulation);
}

// Run workflow simulation
async function runSimulation() {
  if (state.isSimulating) return;

  state.isSimulating = true;
  const runBtn = document.getElementById('run-simulation');
  const logContainer = document.getElementById('execution-log');

  runBtn.classList.add('running');
  runBtn.innerHTML = '<span class="sim-icon">⏳</span><span>Running...</span>';
  logContainer.style.display = 'block';
  logContainer.innerHTML = '';

  const flow = processFlows[state.currentTab];
  const steps = document.querySelectorAll('.process-step');

  // Simulation messages based on workflow type
  const simMessages = {
    onboarding: [
      { type: 'info', msg: 'Webhook received: New hire request from HR system' },
      { type: 'ai', msg: '🧠 AI analyzing role: "Software Engineer" → Engineering Team' },
      { type: 'info', msg: 'Creating Azure AD account... ✓' },
      { type: 'info', msg: 'Provisioning Google Workspace... ✓' },
      { type: 'info', msg: 'Assigning Slack channels... ✓' },
      { type: 'success', msg: '✅ Onboarding complete! Notifications sent to team.' }
    ],
    ticketing: [
      { type: 'info', msg: 'New ticket received: #TKT-4521' },
      { type: 'ai', msg: '🧠 Analyzing: Category=VPN, Priority=HIGH, Sentiment=Frustrated' },
      { type: 'info', msg: 'Routing to IT Support team...' },
      { type: 'info', msg: 'SLA timer started: 1 hour deadline' },
      { type: 'success', msg: '✅ Auto-response sent to customer.' }
    ],
    approvals: [
      { type: 'info', msg: 'Approval request received: PO-2024-0892' },
      { type: 'info', msg: 'Validating against spending policies... ✓' },
      { type: 'ai', msg: '🧠 Identified approver: Finance Manager (based on amount)' },
      { type: 'info', msg: 'Sending notifications via Slack, Email, Teams...' },
      { type: 'success', msg: '✅ Approval request dispatched. Awaiting response.' }
    ]
  };

  const messages = simMessages[state.currentTab];

  for (let i = 0; i < flow.steps.length; i++) {
    // Activate current step
    steps.forEach((s, idx) => {
      s.classList.remove('active');
      if (idx === i) s.classList.add('active');
    });

    // Add log entry
    if (messages[i]) {
      addLogEntry(messages[i].type, messages[i].msg);
    }

    await sleep(800);
  }

  // Final message
  if (messages.length > flow.steps.length) {
    addLogEntry(messages[messages.length - 1].type, messages[messages.length - 1].msg);
  }

  state.isSimulating = false;
  runBtn.classList.remove('running');
  runBtn.innerHTML = '<span class="sim-icon">▶️</span><span>Run Again</span>';
}

// Reset simulation
function resetSimulation() {
  state.isSimulating = false;
  const runBtn = document.getElementById('run-simulation');
  const logContainer = document.getElementById('execution-log');
  const steps = document.querySelectorAll('.process-step');

  runBtn.classList.remove('running');
  runBtn.innerHTML = '<span class="sim-icon">▶️</span><span>Run Simulation</span>';
  logContainer.style.display = 'none';
  steps.forEach(s => s.classList.remove('active'));
}

// Add log entry
function addLogEntry(type, message) {
  const logContainer = document.getElementById('execution-log');
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });

  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `
    <span class="log-time">[${time}]</span>
    <span class="log-message ${type}">${message}</span>
  `;
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Initialize node builder
function initializeNodeBuilder() {
  const canvas = document.getElementById('node-canvas');
  const clearBtn = document.getElementById('clear-canvas');
  const paletteNodes = document.querySelectorAll('.palette-node');

  let nodeCount = 0;

  const nodeTypes = {
    webhook: { icon: '📥', label: 'Webhook', color: 'trigger' },
    ai: { icon: '🧠', label: 'AI Node', color: 'ai' },
    http: { icon: '🔌', label: 'HTTP', color: 'action' },
    slack: { icon: '💬', label: 'Slack', color: 'output' },
    email: { icon: '📧', label: 'Email', color: 'output' },
    database: { icon: '🗄️', label: 'Database', color: 'action' },
    condition: { icon: '🔀', label: 'IF', color: 'ai' },
    loop: { icon: '🔁', label: 'Loop', color: 'action' }
  };

  paletteNodes.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const nodeInfo = nodeTypes[type];

      // Clear placeholder text on first add
      if (nodeCount === 0) {
        canvas.innerHTML = '';
      }

      // Add connector if not first node
      if (nodeCount > 0) {
        const connector = document.createElement('div');
        connector.className = 'node-connector-line';
        canvas.appendChild(connector);
      }

      // Create node
      const node = document.createElement('div');
      node.className = 'builder-node';
      node.innerHTML = `
        <div class="builder-node-icon workflow-node-icon ${nodeInfo.color}">${nodeInfo.icon}</div>
        <div class="builder-node-label">${nodeInfo.label}</div>
        <div class="builder-node-type">${type}</div>
      `;

      node.addEventListener('click', () => {
        node.classList.toggle('active');
      });

      canvas.appendChild(node);
      nodeCount++;

      // Animate
      node.style.opacity = '0';
      node.style.transform = 'scale(0.8)';
      setTimeout(() => {
        node.style.transition = 'all 0.3s ease-out';
        node.style.opacity = '1';
        node.style.transform = 'scale(1)';
      }, 50);

      showToast(`Added ${nodeInfo.label} node`);
    });
  });

  clearBtn.addEventListener('click', () => {
    nodeCount = 0;
    canvas.innerHTML = `
      <span style="color: var(--text-tertiary); font-size: 0.9rem;">
        👆 Click nodes above to add them to your workflow
      </span>
    `;
  });
}

// Initialize workflow exports
function initializeExports() {
  const exportBtns = document.querySelectorAll('.export-btn');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const copyBtn = document.getElementById('copy-code');
  const downloadBtn = document.getElementById('download-code');

  let currentExport = null;

  exportBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const workflowId = btn.dataset.workflow;

      let exportData;
      let filename;

      if (workflowId === 'n8n-onboarding') {
        exportData = workflowExports.onboarding;
        filename = 'n8n-onboarding-workflow.json';
        document.getElementById('modal-title').textContent = 'n8n Onboarding Workflow';
      } else if (workflowId === 'n8n-ticketing') {
        exportData = workflowExports.ticketing;
        filename = 'n8n-ticketing-workflow.json';
        document.getElementById('modal-title').textContent = 'n8n Ticket Classification';
      } else if (workflowId === 'make-onboarding') {
        exportData = makeScenarios.onboarding;
        filename = 'make-onboarding-scenario.json';
        document.getElementById('modal-title').textContent = 'Make Onboarding Scenario';
      }

      currentExport = { data: exportData, filename };

      document.getElementById('modal-code').textContent = JSON.stringify(exportData, null, 2);
      modal.classList.add('active');
    });
  });

  modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  copyBtn.addEventListener('click', () => {
    if (currentExport) {
      navigator.clipboard.writeText(JSON.stringify(currentExport.data, null, 2));
      showToast('Copied to clipboard!');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (currentExport) {
      const blob = new Blob([JSON.stringify(currentExport.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentExport.filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${currentExport.filename}`);
    }
  });
}

// Initialize AI demo
function initializeAIDemo() {
  const tryBtn = document.getElementById('try-ai-demo');

  const examples = [
    {
      input: "My laptop won't connect to the VPN after the latest Windows update. I need this resolved ASAP as I have a client presentation in 2 hours!",
      output: [
        { text: 'Category: VPN / Network', priority: false },
        { text: 'Priority: Urgent', priority: true },
        { text: 'Team: IT Support', priority: false },
        { text: 'Sentiment: Frustrated', priority: false },
        { text: 'SLA: 1 hour', priority: false }
      ]
    },
    {
      input: "Could you help me reset my email password? I forgot it over the weekend. No rush, I can use my phone in the meantime.",
      output: [
        { text: 'Category: Password Reset', priority: false },
        { text: 'Priority: Low', priority: false },
        { text: 'Team: Help Desk', priority: false },
        { text: 'Sentiment: Calm', priority: false },
        { text: 'SLA: 4 hours', priority: false }
      ]
    },
    {
      input: "Our production database is down! Multiple customers are reporting they can't access their accounts. This is a P1 incident!",
      output: [
        { text: 'Category: Database / Infrastructure', priority: false },
        { text: 'Priority: Critical', priority: true },
        { text: 'Team: DevOps + DBA', priority: false },
        { text: 'Sentiment: Urgent', priority: false },
        { text: 'SLA: 15 minutes', priority: false }
      ]
    },
    {
      input: "I'd like to request access to the marketing analytics dashboard. My manager approved it last week.",
      output: [
        { text: 'Category: Access Request', priority: false },
        { text: 'Priority: Normal', priority: false },
        { text: 'Team: IT Admin', priority: false },
        { text: 'Sentiment: Neutral', priority: false },
        { text: 'SLA: 24 hours', priority: false }
      ]
    }
  ];

  let currentIndex = 0;

  tryBtn.addEventListener('click', async () => {
    currentIndex = (currentIndex + 1) % examples.length;
    const example = examples[currentIndex];

    // Show processing
    const processing = document.getElementById('ai-processing');
    const outputBox = document.getElementById('ai-output-box');
    const inputText = document.getElementById('ai-sample-input');

    inputText.textContent = `"${example.input}"`;
    processing.style.display = 'flex';
    outputBox.style.opacity = '0.3';

    await sleep(1200);

    processing.style.display = 'none';
    outputBox.style.opacity = '1';

    // Update result
    const resultContainer = document.getElementById('ai-result');
    resultContainer.innerHTML = example.output.map(tag =>
      `<span class="ai-tag ${tag.priority ? 'priority-high' : ''}">${tag.text}</span>`
    ).join('');
  });
}

// Animate process steps
function animateProcessSteps() {
  const steps = document.querySelectorAll('.process-step');
  steps.forEach((step, index) => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(20px)';

    setTimeout(() => {
      step.style.transition = 'all 0.4s ease-out';
      step.style.opacity = '1';
      step.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

// Initialize scroll animations
function initializeScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  toastMessage.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Utility: sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize the app
renderApp();

// Initial process steps animation
setTimeout(animateProcessSteps, 500);
