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
  onBrowse: (bucketName: string) => void;
  onRefresh: () => Promise<void>;
}
```
**Rendering Strategy:**
*   Use HTML `<table>` with inline styles.
*   Apply beveled button styles (`border-style: outset`).
*   Display columns: Name, Creation Date, Region, Actions.
*   Actions column includes "Upload", "Browse", and "Settings" buttons.
*   No responsive design (fixed 1024px width).

#### BucketContents Component (NEW)
```typescript
interface S3Object {
  key: string;
  size: number;
  lastModified: string;
}

interface BucketContentsProps {
  bucketName: string;
  objects: S3Object[];
  loading: boolean;
  onBack: () => void;
  onShare: (key: string) => void;
  onRefresh: () => void;
}
```
**Rendering Strategy:**
*   Use HTML `<table>` with inline styles.
*   Display columns: File Name, Size, Last Modified, Actions.
*   Actions column includes "⚡ Share via AIM" button.
*   Header shows bucket name and "⬅️ Back to Buckets" button.
*   Format file sizes (bytes → KB/MB).
*   Format dates in 2006 style (YYYY-MM-DD).

#### ShareDialog Component (NEW)
```typescript
interface ShareDialogProps {
  visible: boolean;
  fileName: string;
  bucketName: string;
  fileKey: string;
  onClose: () => void;
  onGenerate: (expiresIn: number) => void;
}

interface ShareDialogState {
  selectedExpiry: number; // 3600, 86400, or 604800
  generatedUrl: string;
  loading: boolean;
}
```
**Rendering Strategy:**
*   Modal overlay with 2006-style beveled border.
*   Dropdown/select for expiration time (1hr, 24hr, 7days).
*   "Generate Link" button triggers URL generation.
*   Text box displays generated URL (read-only, copyable).
*   "Copy to Clipboard" button (uses `document.execCommand('copy')` - 2006 style).
*   "Close" button to dismiss dialog.

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
2.  **list_bucket_objects** (NEW)
    *   Input: `{ bucketName: string }`
    *   Output: `{ objects: Array<{ key: string, size: number, lastModified: string }> }`
    *   Implementation: Check `DEMO_MODE` ? Return Mock Files : Execute `aws s3 ls s3://<bucket>/`.
    *   Mock Data: `[{ key: 'linkin-park-numb.mp3', size: 3355443, lastModified: '2006-06-06' }, { key: 'myspace-profile.html', size: 12456, lastModified: '2006-03-14' }]`
3.  **upload_file**
    *   Input: `{ bucketName: string, fileName: string, fileContent: Buffer }`
    *   Output: `{ success: boolean, url: string }`
    *   Implementation: Write temp file, execute `aws s3 cp`, cleanup.
4.  **generate_presigned_url** (ENHANCED)
    *   Input: `{ bucketName: string, key: string, expiresIn: number }`
    *   Output: `{ url: string, expiresIn: number }`
    *   Implementation: Check `DEMO_MODE` ? Return `http://limewire.s3.amazon.com/<key>?token=expired&expires=<expiresIn>` : Execute `aws s3 presign s3://<bucket>/<key> --expires-in <expiresIn>`.
    *   Default expiresIn: 3600 (1 hour)

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

## 7. Navigation and User Flow

### Application States
```typescript
type ViewState = 'bucket-list' | 'bucket-contents';

interface AppState {
  currentView: ViewState;
  selectedBucket: string | null;
  buckets: S3Bucket[];
  bucketContents: S3Object[];
  // ... other state
}
```

### Navigation Flow
```
[Bucket List View]
    │
    ├─ Click "Browse" ──→ [Bucket Contents View]
    │                          │
    │                          ├─ Click "Share" ──→ [Share Dialog]
    │                          │                         │
    │                          │                         └─ Generate URL
    │                          │
    │                          └─ Click "Back" ──→ [Bucket List View]
    │
    └─ Click "Upload" ──→ [File Upload Flow]
```

### Bucket Contents Browsing Flow
```
User clicks "👁️ Browse" on bucket
    ↓
Play hdd-crunch.mp3 sound
    ↓
Call MCP list_bucket_objects tool
    ↓
Display files in table format
    ↓
User can click "Share" on any file
```

### Enhanced Share Feature Flow
```
User clicks "⚡ Share via AIM" on file
    ↓
Open ShareDialog modal
    ↓
User selects expiration time (1hr/24hr/7days)
    ↓
User clicks "Generate Link"
    ↓
Play hdd-crunch.mp3 sound
    ↓
Ghost Agent pops up with IAM insult
    ↓
Call MCP generate_presigned_url tool with expiresIn
    ↓
Display URL in text box (copyable)
    ↓
User copies URL and closes dialog
```

### Implementation Details

**Frontend (App.tsx):**
*   Add state: `currentView`, `selectedBucket`, `bucketContents`
*   Add `handleBrowse(bucketName)` function
*   Add `handleBackToBuckets()` function
*   Add `handleShareFile(key, expiresIn)` function
*   Conditionally render BucketTable or BucketContents based on `currentView`

**Backend (server/):**
*   New endpoint: `GET /api/buckets/:bucketName/objects`
*   Update endpoint: `POST /api/share` to accept `expiresIn` parameter
*   New MCP tool: `list_bucket_objects`
*   Update MCP tool: `generate_presigned_url` with `expiresIn` parameter

## 8. Visual Mockups (2006 Style)

### Bucket List View (Current)
```
┌────────────────────────────────────────────────────────────────┐
│ 📦 Your S3 Buckets                          [🔄 Refresh]       │
├────────────────────────────────────────────────────────────────┤
│ Bucket Name          Creation Date  Region      Actions        │
│ my-bucket-2006       2006-06-06     us-east-1   [📤][👁️][⚙️]  │
│ limewire-backups     2006-03-14     us-west-1   [📤][👁️][⚙️]  │
└────────────────────────────────────────────────────────────────┘
```

### Bucket Contents View (NEW)
```
┌────────────────────────────────────────────────────────────────┐
│ 📁 Bucket: my-bucket-2006                                      │
│ [⬅️ Back to Buckets]                         [🔄 Refresh]      │
├────────────────────────────────────────────────────────────────┤
│ File Name                Size      Last Modified    Actions    │
│ linkin-park-numb.mp3    3.2 MB    2006-06-06      [⚡ Share]  │
│ myspace-profile.html    12.2 KB   2006-03-14      [⚡ Share]  │
│ aim-buddy-icon.gif      8.0 KB    2006-05-20      [⚡ Share]  │
└────────────────────────────────────────────────────────────────┘
```

### Share Dialog (NEW)
```
┌─────────────────────────────────────────────────┐
│ 🔗 Share File via AIM                           │
│                                                 │
│ File: linkin-park-numb.mp3                      │
│                                                 │
│ Link expires in:                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ 24 hours                              [▼]   │ │
│ └─────────────────────────────────────────────┘ │
│   • 1 hour                                      │
│   • 24 hours                                    │
│   • 7 days                                      │
│                                                 │
│ [Generate Link]                                 │
│                                                 │
│ Generated URL:                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ http://limewire.s3.amazon.com/linkin-pa...  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [📋 Copy to Clipboard]  [Close]                 │
└─────────────────────────────────────────────────┘
```

### CSS Styling Notes
```css
/* Share Dialog - 2006 Modal Style */
.share-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #CCCCCC;
  border: 3px outset #999999;
  padding: 20px;
  width: 500px;
  z-index: 9999;
  font-family: Verdana, sans-serif;
}

.share-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

.share-dialog select {
  width: 100%;
  padding: 5px;
  border: 2px inset #999999;
  font-family: Verdana, sans-serif;
  font-size: 12px;
}

.share-dialog input[type="text"] {
  width: 100%;
  padding: 5px;
  border: 2px inset #999999;
  background: white;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}
```

## 9. Future Enhancements (Out of Scope)
*   EC2 instance management (Classic instances only).
*   SimpleDB query interface.
*   Ghost Agent voice synthesis (text-to-speech).
*   File deletion and bucket management.
*   Multi-file upload with progress bars.