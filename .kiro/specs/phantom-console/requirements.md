# Requirements Document: The Phantom of the Console

## 1. Introduction
**The Phantom of the Console** is a "Resurrection" category project that brings the 2006 AWS ecosystem back to life. It is a fully functional S3 management tool disguised as a haunted, retro HTML dashboard. It leverages **Kiro Agents** for logic, **MCP** for real-world execution, and **Kiro Steering** to force the AI to write historically accurate (deprecated) code patterns.

## 2. Glossary
*   **Phantom Console:** The overarching application.
*   **The Ghost (Clippy-Cloud):** The antagonist AI agent that interrupts the user.
*   **MCP Bridge:** The local server connecting the browser to the AWS CLI.
*   **Steering Protocol:** The strict set of rules in `.kiro/steering.md` forcing the AI to generate "2006-style" code.
*   **Ectoplasm Mode:** The visual state when errors occur (screen melting/tearing).

## 3. Functional Requirements

### Requirement 1: The "Resurrection" UI (Visuals)
**User Story:** As a judge, I want to be transported back to 2006 so that I feel the nostalgia of the early internet.
*   **1.1** The Dashboard **SHALL** utilize a "Table-Based Layout" (using HTML `<table>`, `<tr>`, `<td>`) instead of CSS Grid/Flexbox.
*   **1.2** The Color Palette **SHALL** strictly adhere to the "Legacy AWS" scheme: Orange `#FF9900`, Navy `#003366`, and Hyperlink Blue `#0000FF` (underlined).
*   **1.3** The UI **SHALL** use "Times New Roman" or "Verdana" fonts exclusively.
*   **1.4** Buttons **SHALL** utilize the browser default "beveled" look (CSS `border-style: outset`).

### Requirement 2: The Ghost Agent (AI Persona)
**User Story:** As a user, I want to be annoyed by a "Clippy-like" assistant so that I feel the frustration of old tech.
*   **2.1** The Ghost Agent **SHALL** automatically pop up (unsolicited) when the user hovers over the "Deploy" button.
*   **2.2** The Ghost Agent **SHALL** utilize an LLM via Kiro to generate insults based on the user's action (e.g., *“It looks like you’re trying to use S3... in my day we used FTP and we liked it.”*).
*   **2.3** The Ghost Agent **SHALL** persist in the bottom-right corner and cannot be closed, only minimized to a "glaring eyes" icon.

### Requirement 3: MCP Integration (Real Functionality)
**User Story:** As a developer, I want this joke app to actually work, proving Kiro's utility.
*   **3.1** The application **SHALL** run a local MCP Server (`server/mcp-aws.ts`) that wraps the AWS CLI.
*   **3.2** The MCP Tool `list_buckets` **SHALL** execute `aws s3 ls` and parse the raw text output into a JSON object.
*   **3.3** The MCP Tool `upload_file` **SHALL** accept a file buffer and execute `aws s3 cp`.
*   **3.4** **Latency Simulation:** The MCP Server **SHALL** artificially delay all responses by 800ms to simulate 2006 network speeds.

### Requirement 4: The Haunted Hooks (Agent Hooks)
**User Story:** As a committer, I want my development workflow to be themed.
*   **4.1** The project **SHALL** include a Kiro Hook at `.kiro/hooks/pre-commit-haunt.js`.
*   **4.2** The Hook **SHALL** scan the `git diff` for modern syntax (e.g., `const`, `let`, `arrow functions`).
*   **4.3** IF modern syntax is found, the Hook **SHALL** inject a comment into the code: `/* 👻 THE GHOST REJECTS YOUR MODERN SYNTAX... */` but allow the commit to proceed (to avoid blocking the demo).
*   **4.4** The Hook **SHALL** play a system "beep" sound (ASCII bell) if the commit message does not start with "feat(legacy):".

### Requirement 5: Spooky Audio-Visual Effects
**User Story:** As a user, I want to be startled when things go wrong.
*   **5.1** **Screen Tearing:** WHEN an API error occurs, the CSS class `glitch-overlay` **SHALL** be appended to the `<body>` for 2 seconds.
*   **5.2** **Audio Cues:** WHEN the Ghost Agent speaks, a "Hard Drive Write" sound effect **SHALL** loop in the background.
*   **5.3** **Connection Sound:** On initial load, the application **SHALL** play a 3-second "Dial-up Modem Handshake" sound.

### Requirement 6: The "Steering" Implementation
**User Story:** As a judge, I want to see how the entrant controlled Kiro's output.
*   **6.1** The project **MUST** contain a file `.kiro/steering.md`.
*   **6.2** The Steering Doc **SHALL** contain the instruction: *"You are a coding engine stuck in 2006. Prefer `var` over `const`. Prefer `XMLHttpRequest` over `fetch`. Always add comments explaining why the code is 'web scale'."*
*   **6.3** Kiro's generated code for the project **MUST** reflect these steering instructions.

### Requirement 7: The Demo "Happy Path"
**User Story:** As a presenter, I need a fail-safe flow for the video.
*   **7.1** **Step 1:** User logs in (Sound: Dial-up).
*   **7.2** **Step 2:** User clicks "List Buckets". MCP fetches real S3 data.
*   **7.3** **Step 3:** User clicks "Upload". Ghost Agent interrupts: *"File too large for 2006 bandwidth."*
*   **7.4** **Step 4:** User ignores Ghost, clicks upload anyway. Screen glitches, "Blood" drips down the monitor (CSS effect). File successfully uploads via MCP.

### Requirement 8: Technical Architecture
*   **8.1** **Frontend:** Vite + React (but styled like HTML 4.01).
*   **8.2** **Backend:** Node.js MCP Server.
*   **8.3** **Communication:** Frontend calls MCP tools via `window.ai` or equivalent Kiro bridge.
*   **8.4** **Directory Structure:**
    ```text
    /
    ├── .kiro/
    │   ├── specs/
    │   ├── hooks/
    │   └── steering.md
    ├── src/ (Frontend)
    ├── server/ (MCP)
    └── README.md
    ```