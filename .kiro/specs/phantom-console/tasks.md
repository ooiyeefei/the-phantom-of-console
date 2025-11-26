# Implementation Plan: The Phantom of the Console

- [x] **1. Set up project structure and Kiro steering**
  - Create directory structure: `.kiro/`, `src/`, `server/`, `public/sounds/`
  - Write `.kiro/steering/phantom-rules.md` with 2006 code generation rules (require `var`, `XMLHttpRequest`, `float`)
  - Configure `.kiro/settings/mcp.json` for phantom-aws MCP server
  - Initialize Vite + React project with TypeScript (but steer it to write ES5)
  - _Requirements: 6.1, 6.2, 8.1, 8.4_

- [x] **2. Implement Backend Core (MCP + HTTP Bridge)**
  - [x] 2.1 Create Node.js Express Server (The Bridge)
    - Initialize `server/index.js` with Express
    - **🎃 CRITICAL:** Enable CORS with `{ origin: '*' }` to prevent ANY demo failures
    - Configure `dotenv` for `DEMO_MODE` and AWS credentials
    - Add `package.json` with dependencies: express, cors, dotenv, multer, @modelcontextprotocol/sdk
    - Create npm scripts: `"start": "node server/index.js"`, `"demo": "DEMO_MODE=true node server/index.js"`
    - _Requirements: 8.2, Design Section 2_

  - [x] 2.2 Implement MCP Tool Registry
    - Write `server/mcp-registry.js` using the MCP SDK to define `list_buckets` and `upload_file` tools
    - Ensure tools return JSON schemas compatible with LLM usage
    - _Requirements: 3.1_

  - [x] 2.3 Build AWS CLI Wrapper with **Séance Mode**
    - Write `server/aws-wrapper.js` using `child_process`
    - Implement `runCommand()`: checks `DEMO_MODE` ? returns Mock Data : runs `aws s3 ...`
    - **🎃 Mock Data:** Hardcode `bucket-death-star-plans`, `bucket-limewire-music` with 2006 dates
    - Add credential validation: check if `aws sts get-caller-identity` succeeds before real operations
    - _Requirements: 3.1, 3.2, Design Section 2_

  - [x] 2.4 Create HTTP API Endpoints
    - `GET /api/buckets` -> Calls MCP `list_buckets` -> Returns JSON
    - `POST /api/upload` -> Calls MCP `upload_file` -> Returns JSON
    - **🎃 Latency:** Wrap responses in `setTimeout(..., 800)`
    - Add error handling middleware to format all errors as `AWSError` objects
    - _Requirements: 3.4, 8.3_

  - [x] 2.5 Register MCP for Kiro Usage (The Winning Bonus) 🏆
    - Configure `.kiro/settings/mcp.json` to point to your local MCP server
    - Create standalone MCP entry point `server/mcp-stdio.js` that runs in stdio mode for Kiro
    - Add MCP server config: `{ "command": "node", "args": ["server/mcp-stdio.js"], "env": { "DEMO_MODE": "true" } }`
    - **🎃 GOAL:** Allow judges to ask Kiro Chat "List the S3 buckets" and have it use YOUR tool
    - Test by asking Kiro: "Use the phantom-aws MCP server to list buckets"
    - _Requirements: Hackathon MCP Integration Criteria_

- [x] **3. Implement Backend Business Logic**
  - [x] 3.1 Implement `list_buckets` logic
    - Parse `aws s3 ls` output (text format) into JSON objects
    - Handle AWS CLI errors (e.g., "ExpiredToken") and map to `AWSError` object
    - _Requirements: 3.2_

  - [x] 3.2 Implement `upload_file` logic
    - Use `multer` or similar to handle incoming file streams
    - Write to `/tmp` -> `aws s3 cp` -> delete temp file
    - _Requirements: 3.3_

- [x] **4. Build Retro UI Foundation (Frontend)**
  - [x] 4.1 Create RetroConsole Root
    - Write `src/App.tsx`
    - **🎃 Steering Check:** Ensure it uses `var` and `componentDidMount` (Class Components) if possible, or strict functional with legacy patterns
    - Play `dialup.mp3` on mount using HTML5 Audio API (user interaction required workaround: play on first click)
    - Set up API base URL configuration (point to `http://localhost:3000/api`)
    - _Requirements: 1.1, 5.3_

  - [x] 4.2 Implement Retro Styling (Global)
    - Create `src/styles/retro.css`
    - Force font-family: 'Verdana', 'Times New Roman'
    - Define Colors: `#FF9900` (AWS Orange), `#003366` (Navy), `#0000FF` (Hyperlink Blue)
    - Add beveled button styles: `border-style: outset`, `border-width: 3px`
    - Set fixed page width: 1024px with centered alignment
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 4.3 **Vibe Coding Session: The Table Layout** 🎨
    - **🎃 Task:** Use Kiro Chat to generate the `BucketTable` component
    - Prompt: *"Generate an HTML table layout for S3 buckets using inline styles and no flexbox. Use 'var' for variables."*
    - Save the transcript for submission evidence
    - Verify Kiro follows steering rules (uses `var`, no modern syntax)
    - _Requirements: 1.1, Vibe Coding Criteria_
  
  - [x] 4.4 Add audio assets
    - Add `dialup.mp3` (3s modem sound)
    - Add `hdd-crunch.mp3` (hard drive read/write noise)
    - Add `error.mp3` (Windows XP error sound or similar)
    - Place in `public/sounds/`
    - _Requirements: 5.2, 5.3_

- [x] **5. Implement Functional UI Components**
  - [x] 5.1 Build `BucketTable.tsx`
    - Use `XMLHttpRequest` to hit `GET /api/buckets` (per Steering rules)
    - Render data in `<table>`
    - Add "Upload" button (beveled style)
    - _Requirements: 7.2_

  - [x] 5.2 Build `FileUpload.tsx`
    - Hidden file input triggered by button
    - `XMLHttpRequest` upload to `POST /api/upload`
    - _Requirements: 7.3_

- [x] **6. Build Ghost Agent (The "Clippy")**
  - [x] 6.1 Create `GhostAgent.tsx`
    - Draggable `div` (bottom-right fixed)
    - State: `idle` | `speaking` | `minimized`
    - _Requirements: 2.1, 2.3_

  - [x] 6.2 Implement Persona Logic
    - Create `src/services/ghost-brain.js`
    - **🎃 Simple Mock:** Use an array of pre-set insults (e.g., "In 2006, we didn't have async/await, we had PATIENCE.")
    - Optional: Hit OpenAI via server proxy if time permits
    - Triggers: `onHover`, `onError`, `onUpload`
    - _Requirements: 2.2_

- [x] **7. Implement Spooky Effects System**
  - [x] 7.1 Visual FX
    - `src/components/ScreenGlitch.tsx`: Toggles `body.className = 'glitch'`
    - CSS: `@keyframes screen-tear` & `@keyframes blood-drip`
    - _Requirements: 5.1_

  - [x] 7.2 Audio FX
    - `playAudio('error.mp3')` on failures
    - `playAudio('hdd-crunch.mp3')` when Ghost speaks
    - _Requirements: 5.2_

- [x] **8. Error Handling (The Horror Engine)**
  - [x] 8.1 Global Error Interceptor
    - Catch non-200 responses from `XMLHttpRequest`
    - Dispatch to `SpookyEffects`
    - Trigger Ghost Agent insult
    - _Requirements: 8.2_

- [x] **9. Implement Pre-Commit Hook (Judging Requirement)**
  - [x] 9.1 Create `.kiro/hooks/pre-commit-haunt.js`
    - Write Node.js script that executes `git diff --cached`
    - Scan output for modern patterns: `const`, `let`, `=>`, backticks, `async/await`
    - If found: print ASCII ghost art and "ERROR 666: TOO MODERN" message
    - Check commit message for "feat(legacy):" prefix using regex
    - Exit with code 1 (block commit) if validation fails
    - Exit with code 0 (allow commit) if validation passes
    - **🎃 CRITICAL:** Make script executable (`chmod +x .kiro/hooks/pre-commit-haunt.js`)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 9.2 Create hook installer script
    - Write `scripts/install-hooks.sh` that copies hook to `.git/hooks/pre-commit`
    - Make installer executable and add to README setup instructions
    - Test hook by attempting to commit code with `const` keyword
    - _Requirements: 4.1_

- [ ] **10. Demo "Happy Path" Verification**
  - [ ] 10.1 **Séance Mode Test:** Set `DEMO_MODE=true`, disconnect WiFi, run app. Verify `bucket-death-star-plans` loads with 800ms delay.
  - [ ] 10.2 **Haunt Test:** Create test file with `const a = 1`. Attempt commit. Verify ASCII ghost appears and commit is blocked.
  - [ ] 10.3 **Upload Test:** Upload a file. Verify Ghost interrupts ("File too large"). Verify screen glitch + blood drip. Verify upload succeeds.
  - [ ] 10.4 **Steering Validation:** Open source code. Verify `var` usage and `XMLHttpRequest`.
  - [ ] 10.5 **Audio Test:** Verify soundscape (Dial-up, HDD crunch, Error beep).
  - [ ] 10.6 **MCP Integration Test:** Ask Kiro Chat "List my S3 buckets using the phantom-aws server". Verify it uses your MCP tool and returns mock data.

- [ ] **11. Documentation & Evidence Collection (For Winning)**
  - [ ] 11.1 Screenshot the `.kiro` folder structure showing `steering/`, `hooks/`, `specs/`, `settings/`
  - [ ] 11.2 Capture Kiro chat transcript showing steering in action (e.g., Kiro using `var` instead of `const`, `XMLHttpRequest` instead of `fetch`)
  - [ ] 11.3 Screenshot the pre-commit hook blocking a commit with modern syntax
  - [ ] 11.4 Record 3-minute demo video showing: page load with dial-up sound, bucket list, Ghost Agent popup, file upload with glitch effects, all in `DEMO_MODE=true`
  - [x] 11.5 Write comprehensive `README.md` with:
    - Project description and hackathon category
    - Setup instructions (npm install, AWS CLI config, hook installation)
    - How to run in demo mode: `npm run demo`
    - How to run with real AWS: `npm start` (requires configured AWS credentials)
    - Explanation of Kiro features used (steering, hooks, MCP, vibe coding)
    - Architecture diagram and technology stack
  - [x] 11.6 Create `KIRO_USAGE.md` (The "Essay" for Judging):
    - **Section 1: Vibe Coding** - How we built the UI with Kiro chat assistance
    - **Section 2: Steering** - How we forced 2006 syntax (include transcript where Kiro refused to use `fetch`)
    - **Section 3: Hooks** - The Haunted Commit (screenshot of blocked commit)
    - **Section 4: MCP** - Connecting Kiro to AWS (demonstrate Kiro using your tool)
    - Include code snippets and screenshots as evidence