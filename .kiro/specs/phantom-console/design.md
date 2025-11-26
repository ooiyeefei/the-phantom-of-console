# Design Document: The Phantom of the Console

## 1. Overview
The Phantom of the Console is a three-tier haunted web application that resurrects the 2006 AWS Console aesthetic while managing real AWS S3 resources through modern tooling. The architecture combines a retro HTML/CSS frontend, a Node.js MCP server for AWS operations, and Kiro-powered AI agents with strict steering rules to maintain period-accurate code generation.

### Design Philosophy
1.  **Authentic Resurrection**: Every visual and interaction pattern must feel genuinely from 2006.
2.  **Functional Horror**: Spooky effects enhance rather than obstruct real AWS operations.
3.  **Controlled Chaos**: Kiro steering ensures AI-generated code follows deprecated patterns.
4.  **Performance Theater**: Artificial delays simulate 2006 network conditions.
5.  **🎃 Demo is God (Séance Mode)**: The system must support a "Mock Mode" to ensure the demo succeeds even if AWS credentials fail during the presentation.

## 2. Architecture

### System Diagram
```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Retro UI     │  │ Ghost Agent  │  │ Spooky FX    │  │
│  │ (React/Vite) │  │ (LLM Client) │  │ (CSS/Audio)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                  │                             │
└─────────┼──────────────────┼─────────────────────────────┘
          │                  │
          │ MCP Protocol     │ LLM API (OpenAI/Anthropic)
          │                  │
┌─────────▼──────────────────▼─────────────────────────────┐
│              Node.js MCP Server                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ MCP Tools    │  │ AWS CLI      │  │ Latency      │  │
│  │ Registry     │  │ Wrapper      │  │ Simulator    │  │
│  └──────────────┘  └──────┬───────┘  └──────────────┘  │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │  Séance Mode    │ 🎃 (New)            │
│                  │  (Mock Data)    │                     │
│                  └────────┬────────┘                     │
└───────────────────────────┼──────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   AWS S3 API    │
                   └─────────────────┘
```

### Component Responsibilities

**Frontend (Browser)**
*   Render table-based layouts with 2006 styling.
*   Handle user interactions and file uploads.
*   Invoke MCP tools for AWS operations.
*   Manage Ghost Agent popup behavior.
*   Trigger spooky effects on errors.

**MCP Server (Node.js)**
*   Expose MCP tools for S3 operations.
*   Execute AWS CLI commands with proper error handling.
*   Simulate 800ms network latency on all responses.
*   Parse AWS CLI output into structured JSON.
*   Validate AWS credentials before execution.
*   **🎃 Séance Mode:** Serve hardcoded "Ghost Buckets" if the `DEMO_MODE` env var is set or AWS fails.

**Ghost Agent (LLM Integration)**
*   Generate contextual insults based on user actions.
*   Maintain 2006 sysadmin persona consistency.
*   Trigger on specific UI events (hover, click).

**Spooky Effects System**
*   Apply CSS animations on error states.
*   Play audio cues for system events.
*   Manage effect timing and cleanup.

## 3. Components and Interfaces

### 1. Frontend Components

#### RetroConsole (Root Component)
```typescript
interface RetroConsoleProps {
  mcpClient: MCPClient;
  ghostAgent: GhostAgent;
}

interface RetroConsoleState {
  buckets: S3Bucket[];
  loading: boolean;
  error: AWSError | null;
  ghostVisible: boolean;
}
```
**Responsibilities:**
*   Initialize MCP client connection.
*   Manage global application state.
*   Coordinate between child components.
*   Play dial-up sound on mount.

#### BucketTable Component
```typescript
interface BucketTableProps {
  buckets: S3Bucket[];
  onUpload: (bucketName: string, file: File) => Promise<void>;
  onRefresh: () => Promise<void>;
}
```
**Rendering Strategy:**
*   Use HTML `<table>` with inline styles.
*   Apply beveled button styles (`border-style: outset`).
*   Display columns: Name, Creation Date, Region, Actions.
*   No responsive design (fixed 1024px width).

#### GhostAgent Component
```typescript
interface GhostAgentProps {
  llmClient: LLMClient;
  persona: PersonaConfig;
  triggerEvents: TriggerEvent[];
}

interface PersonaConfig {
  name: string;
  backstory: string;
  vocabulary: string[];
  hatedTechnologies: string[];
}
```
**Behavior:**
*   Float in bottom-right corner (position: fixed).
*   Draggable via mouse events.
*   Auto-popup on specific triggers.
*   Minimize to "glaring eyes" icon.
*   Generate responses via LLM API with persona prompt.

#### SpookyEffects Component
```typescript
interface SpookyEffectsProps {
  errorState: AWSError | null;
  audioEnabled: boolean;
}
```
**Effect Implementations:**
*   Screen tearing: Apply `glitch-overlay` class with CSS transforms.
*   Blood dripping: Keyframe animation with red gradients.
*   Audio playback: HTML5 Audio API for sound effects.

### 2. MCP Server Components

#### MCP Tool Registry
```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (params: any) => Promise<any>;
}
```
**Registered Tools:**
1.  **list_buckets**
    *   Input: None
    *   Output: `{ buckets: Array<{ name: string, creationDate: string, region: string }> }`
    *   Implementation: Check `DEMO_MODE` ? Return Mock : Execute `aws s3 ls`.
2.  **upload_file**
    *   Input: `{ bucketName: string, fileName: string, fileContent: Buffer }`
    *   Output: `{ success: boolean, url: string }`
    *   Implementation: Write temp file, execute `aws s3 cp`, cleanup.

#### 🎃 Séance Mode (Mock Data Handler)
**New Requirement for Demo Safety:**
```typescript
const MOCK_BUCKETS = [
  { name: "bucket-death-star-plans", creationDate: "2006-06-06", region: "us-east-1" },
  { name: "bucket-limewire-music", creationDate: "2006-01-15", region: "us-west-1" }
];
```
*   If `process.env.DEMO_MODE === 'true'`, bypass AWS CLI and return `MOCK_BUCKETS`.
*   This ensures the demo works even without internet.

#### AWS CLI Wrapper
```typescript
interface AWSCLIWrapper {
  execute(command: string, args: string[]): Promise<CLIResult>;
  parseS3List(output: string): S3Bucket[];
  validateCredentials(): Promise<boolean>;
}

interface CLIResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}
```

#### Latency Simulator
```typescript
interface LatencySimulator {
  delay: number; // 800ms
  simulate<T>(operation: () => Promise<T>): Promise<T>;
}
```

### 3. Kiro Integration Components (Crucial for Judging)

#### Steering Configuration
**File:** `.kiro/steering/phantom-rules.md`
```markdown
---
inclusion: always
---

# Phantom Console Steering Rules

You are a coding engine trapped in 2006. Follow these rules strictly:

1. Use `var` instead of `const` or `let`
2. Use `XMLHttpRequest` instead of `fetch`
3. Use `function` declarations instead of arrow functions
4. Add comments explaining why code is "web scale"
5. Reference deprecated AWS services (SimpleDB, EC2-Classic)
6. Use callback patterns instead of Promises where possible
7. Avoid modern ES6+ features (destructuring, template literals)
```

#### 🎃 Agent Hook: Pre-Commit Haunt
**Updated Strategy: Read-Only Shaming (Safer)**
**File:** `.kiro/hooks/pre-commit-haunt.js`
```javascript
// Hook configuration
{
  "name": "pre-commit-haunt",
  "trigger": "pre-commit",
  "description": "Haunts commits with modern syntax"
}
```
**Logic:**
1.  Read `git diff --cached`.
2.  Scan for modern patterns: `const`, `let`, `=>`, template literals.
3.  If found:
    *   Print ASCII Art Ghost to console.
    *   Print Error: "ERROR 666: TOO MODERN."
4.  Check commit message for "feat(legacy):" prefix.
5.  **Block the commit** (Exit 1) unless user forces it.
    *   *Why? It proves the hook works during the demo without corrupting code.*

## 4. Data Models

### S3Bucket
```typescript
interface S3Bucket {
  name: string;
  creationDate: string; // ISO 8601
  region: string;
}
```

### AWSError
```typescript
interface AWSError {
  code: string;
  message: string;
  service: 'S3' | 'IAM' | 'EC2';
  timestamp: number;
}
```

### GhostMessage
```typescript
interface GhostMessage {
  id: string;
  text: string;
  timestamp: number;
  trigger: TriggerEvent;
  emotion: 'annoyed' | 'bitter' | 'nostalgic';
}

type TriggerEvent = 
  | 'hover_deploy'
  | 'click_upload'
  | 'error_occurred'
  | 'page_load';
```

## 5. Error Handling & Visuals

### Error Flow
```
AWS Error Occurs
    ↓
MCP Server catches error
    ↓
Format as AWSError object
    ↓
Return to Frontend
    ↓
Trigger Spooky Effects
    ↓
Display error in retro alert box
    ↓
Ghost Agent generates snarky comment
```

### Error Categories
1.  **Authentication Errors** (401, 403)
    *   Display: "ACCESS DENIED - Your credentials are as expired as my patience"
    *   Effect: Screen tearing + red flash
2.  **Network Errors** (timeout, connection refused)
    *   Display: "CONNECTION LOST - Just like my will to live in 2006"
    *   Effect: Dial-up disconnect sound
3.  **S3 Errors** (NoSuchBucket, AccessDenied)
    *   Display: "BUCKET ERROR - [specific message]"
    *   Effect: Blood dripping animation

## 6. Implementation Notes

### Technology Stack
**Frontend:**
*   React 18 with Vite
*   No CSS frameworks (inline styles only)
*   HTML5 Audio API for sound effects
*   Native drag-and-drop for Ghost Agent

**Backend:**
*   Node.js 18+
*   MCP SDK for tool registration
*   AWS CLI (must be installed and configured)
*   Child process execution for CLI commands

### Directory Structure (Mandatory for Judging)
```
/
├── .kiro/
│   ├── specs/          # This design doc
│   ├── hooks/          # pre-commit-haunt.js
│   ├── steering/       # phantom-rules.md
│   └── settings/       # mcp.json
├── src/                # React Frontend
├── server/             # MCP Server
└── README.md
```

### Visual Design Specifications

**Color Palette**
```css
:root {
  --legacy-orange: #FF9900;
  --legacy-navy: #003366;
  --hyperlink-blue: #0000FF;
  --background-gray: #CCCCCC;
  --error-red: #8B0000;
}
```

**Animation: Screen Tearing**
```css
@keyframes screen-tear {
  0% { transform: translateX(0); }
  10% { transform: translateX(-20px) skewX(5deg); }
  50% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
```

**Animation: Blood Dripping**
```css
@keyframes blood-drip {
  0% { height: 0; opacity: 0.8; }
  100% { height: 150px; opacity: 0; }
}
```

## 7. Future Enhancements (Out of Scope)
*   EC2 instance management (Classic instances only).
*   SimpleDB query interface.
*   Ghost Agent voice synthesis (text-to-speech).