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

- [x] **10. Implement Quick Share Feature (2006 File Sharing)** - COMPLETED, NOW ENHANCING
  - [x] 10.1 Add `generate_presigned_url` MCP tool to backend
  - [x] 10.2 Add HTTP endpoint for share functionality
  - [x] 10.3 Update BucketTable component with Share button
  - [x] 10.4 Implement share interaction logic in App.tsx

- [ ] **10B. Implement Bucket Contents Browsing**
  - [x] 10B.1 Add `list_bucket_objects` MCP tool to backend
    - Update `server/mcp-registry.js` to register new tool with input schema `{ bucketName: string }`
    - Implement tool handler in `server/aws-wrapper.js` that executes `aws s3 ls s3://<bucket>/`
    - Parse AWS CLI output into JSON array: `{ key, size, lastModified }`
    - Add Séance Mode support: return mock files `[{ key: 'linkin-park-numb.mp3', size: 3355443, lastModified: '2006-06-06' }, { key: 'myspace-profile.html', size: 12456, lastModified: '2006-03-14' }, { key: 'aim-buddy-icon.gif', size: 8192, lastModified: '2006-05-20' }]`
    - _Requirements: 7.3, 7.5_

  - [x] 10B.2 Add HTTP endpoint for bucket contents
    - Create `GET /api/buckets/:bucketName/objects` endpoint in `server/index.js`
    - Call MCP `list_bucket_objects` tool
    - Apply 800ms latency simulation
    - Return `{ objects: Array<S3Object> }` response
    - _Requirements: 7.3_

  - [x] 10B.3 Create BucketContents component
    - Create `src/components/BucketContents.tsx` using Class Component (2006 style)
    - Display files in HTML `<table>` with columns: File Name, Size, Last Modified, Actions
    - Format file sizes (bytes → KB/MB using division and `toFixed()`)
    - Add "⬅️ Back to Buckets" button in header
    - Add "⚡ Share via AIM" button for each file
    - Use beveled button styles and 2006 table styling
    - _Requirements: 7.4, 7.6_

  - [x] 10B.4 Update App.tsx with navigation logic
    - Add state: `currentView: 'bucket-list' | 'bucket-contents'`, `selectedBucket: string`, `bucketContents: S3Object[]`
    - Create `handleBrowse(bucketName)` function using `var` (2006 style)
    - Create `handleBackToBuckets()` function
    - Load bucket contents using `XMLHttpRequest` to `GET /api/buckets/:bucketName/objects`
    - Conditionally render BucketTable or BucketContents based on `currentView`
    - Play `hdd-crunch.mp3` sound when browsing
    - _Requirements: 7.1, 7.2, 7.7_

  - [x] 10B.5 Update BucketTable to remove Share button and add Browse callback
    - Remove "Share via AIM" button from BucketTable (moved to BucketContents)
    - Update BucketTable props to include `onBrowse` callback
    - Wire "Browse" button to `onBrowse` callback
    - _Requirements: 7.1_

- [ ] **10C. Implement Enhanced Share Dialog**
  - [x] 10C.1 Create ShareDialog component
    - Create `src/components/ShareDialog.tsx` using Class Component (2006 style)
    - Modal overlay with 2006-style beveled border and centered positioning
    - Display file name in dialog header
    - Add dropdown/select for expiration time with options: "1 hour", "24 hours", "7 days"
    - Map display values to seconds: 3600, 86400, 604800
    - Add "Generate Link" button (beveled style)
    - Add text input (read-only) to display generated URL
    - Add "Copy to Clipboard" button using `document.execCommand('copy')` (2006 style)
    - Add "Close" button to dismiss dialog
    - _Requirements: 8.2, 8.3, 8.8_

  - [x] 10C.2 Update `generate_presigned_url` MCP tool to accept expiresIn
    - Update input schema in `server/mcp-registry.js` to include `expiresIn: number` (optional, default 3600)
    - Update `generatePresignedUrl()` in `server/aws-wrapper.js` to use `expiresIn` parameter
    - Update AWS CLI command: `aws s3 presign s3://<bucket>/<key> --expires-in <expiresIn>`
    - Update mock URL in Séance Mode to include expiration: `http://limewire.s3.amazon.com/<key>?token=expired&expires=<expiresIn>`
    - _Requirements: 8.5, 8.6_

  - [x] 10C.3 Update share endpoint to accept expiresIn
    - Update `POST /api/share` endpoint in `server/index.js` to accept `expiresIn` in request body
    - Pass `expiresIn` to MCP tool
    - Default to 3600 if not provided
    - _Requirements: 8.5_

  - [x] 10C.4 Integrate ShareDialog into App.tsx
    - Add state: `showShareDialog: boolean`, `shareDialogFile: { key: string, bucketName: string }`
    - Create `handleOpenShareDialog(key)` function
    - Create `handleGenerateShareLink(expiresIn)` function using `var` (2006 style)
    - Play `hdd-crunch.mp3` sound when generating link
    - Trigger Ghost Agent with message: "I'm generating a temporary link because you clearly don't understand IAM Policies."
    - Call `POST /api/share` using `XMLHttpRequest` with `{ bucketName, key, expiresIn }`
    - Pass generated URL back to ShareDialog for display
    - _Requirements: 8.4, 8.7, 8.9_

  - [x] 10C.5 Wire ShareDialog to BucketContents
    - Update BucketContents `onShare` prop to trigger ShareDialog
    - Pass file key and bucket name to parent component
    - _Requirements: 8.1_

- [ ] **11. Demo "Happy Path" Verification**
  - [ ] 11.1 **Séance Mode Test:** Set `DEMO_MODE=true`, disconnect WiFi, run app. Verify buckets load with 800ms delay.
  - [ ] 11.2 **Browse Test:** Click "Browse" on a bucket. Verify mock files appear (linkin-park-numb.mp3, myspace-profile.html, aim-buddy-icon.gif).
  - [ ] 11.3 **Navigation Test:** Click "Back to Buckets". Verify return to bucket list view.
  - [ ] 11.4 **Share Dialog Test:** Click "Share via AIM" on a file. Verify ShareDialog opens with expiration dropdown.
  - [ ] 11.5 **Share Generation Test:** Select "24 hours" expiration, click "Generate Link". Verify Ghost interrupts with IAM message, URL appears in text box.
  - [ ] 11.6 **Copy Test:** Click "Copy to Clipboard" button. Verify URL is copied (test by pasting).
  - [ ] 11.7 **Upload Test:** Upload a file. Verify Ghost interrupts ("File too large"). Verify screen glitch + blood drip. Verify upload succeeds.
  - [ ] 11.8 **Haunt Test:** Create test file with `const a = 1`. Attempt commit. Verify ASCII ghost appears and commit is blocked.
  - [ ] 11.9 **Steering Validation:** Open source code. Verify `var` usage and `XMLHttpRequest`.
  - [ ] 11.10 **Audio Test:** Verify soundscape (Dial-up, HDD crunch, Error beep).
  - [ ] 11.11 **MCP Integration Test:** Ask Kiro Chat "List my S3 buckets using the phantom-aws server". Verify it uses your MCP tool and returns mock data.

- [ ] **12. Documentation & Evidence Collection (For Winning)**
  - [ ] 12.1 Screenshot the `.kiro` folder structure showing `steering/`, `hooks/`, `specs/`, `settings/`
  - [ ] 12.2 Capture Kiro chat transcript showing steering in action (e.g., Kiro using `var` instead of `const`, `XMLHttpRequest` instead of `fetch`)
  - [ ] 12.3 Screenshot the pre-commit hook blocking a commit with modern syntax
  - [ ] 12.4 Record 3-minute demo video showing: page load with dial-up sound, bucket list, Ghost Agent popup, file upload with glitch effects, Quick Share feature, all in `DEMO_MODE=true`
  - [x] 12.5 Write comprehensive `README.md` with:
    - Project description and hackathon category
    - Setup instructions (npm install, AWS CLI config, hook installation)
    - How to run in demo mode: `npm run demo`
    - How to run with real AWS: `npm start` (requires configured AWS credentials)
    - Explanation of Kiro features used (steering, hooks, MCP, vibe coding)
    - Architecture diagram and technology stack
  - [x] 12.6 Create `KIRO_USAGE.md` (The "Essay" for Judging):
    - **Section 1: Vibe Coding** - How we built the UI with Kiro chat assistance
    - **Section 2: Steering** - How we forced 2006 syntax (include transcript where Kiro refused to use `fetch`)
    - **Section 3: Hooks** - The Haunted Commit (screenshot of blocked commit)
    - **Section 4: MCP** - Connecting Kiro to AWS (demonstrate Kiro using your tool)
    - Include code snippets and screenshots as evidence