# 👻 The Phantom of the Console

> *"In 2006, we had REAL servers. You could hear them. You could FEEL them."*
> — The Ghost of Sysadmins Past

A **Kiroween Hackathon** entry in the **"Resurrection"** category. This project brings the 2006 AWS Console back from the dead, complete with a haunted AI assistant who despises modern technology.

## 🎃 What is this?

The Phantom of the Console is a fully functional S3 management tool disguised as a haunted, retro HTML dashboard from 2006. It features:

- **Retro UI**: Table-based layouts, beveled buttons, and that classic orange/blue AWS color scheme
- **The Ghost Agent**: A bitter 2006 sysadmin AI who interrupts you with complaints about "the cloud"
- **Real AWS Integration**: Actually manages your S3 buckets via MCP tools
- **Séance Mode**: Demo-safe mock data when AWS credentials aren't available
- **Spooky Effects**: Screen tearing and blood dripping animations on errors
- **Haunted Commits**: A pre-commit hook that rejects modern JavaScript syntax

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- AWS CLI configured (optional - Séance Mode works without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/phantom-console.git
cd phantom-console

# Install dependencies
npm install

# Install the haunted git hook
npm run prepare
```

### Running the App

**Demo Mode (Séance Mode)** - No AWS credentials needed:
```bash
# Start the backend in demo mode
npm run demo

# In another terminal, start the frontend
npm run dev
```

**Live Mode** - With real AWS:
```bash
# Make sure AWS CLI is configured
aws configure

# Start the backend
npm run server

# In another terminal, start the frontend
npm run dev
```

Then open http://localhost:5173 in your browser.


## 🎭 Kiro Features Used

This project showcases several Kiro IDE features:

### 1. Steering Rules (`.kiro/steering/phantom-rules.md`)
Forces Kiro to generate 2006-style code:
- Uses `var` instead of `const`/`let`
- Uses `XMLHttpRequest` instead of `fetch`
- Avoids arrow functions and template literals
- Adds "Web 2.0 compliant" comments

### 2. MCP Integration (`.kiro/settings/mcp.json`)
Custom MCP server that:
- Lists S3 buckets via AWS CLI
- Uploads files to S3
- Works in Séance Mode for demos

**Try it!** Ask Kiro: *"Use the phantom-aws MCP server to list my S3 buckets"*

### 3. Agent Hooks (`.kiro/hooks/pre-commit-haunt.js`)
A pre-commit hook that:
- Scans for modern JavaScript syntax
- Rejects commits with `const`, `let`, or arrow functions
- Requires commit messages to start with `feat(legacy):`

### 4. Vibe Coding
The UI components were generated using Kiro chat with steering rules active, demonstrating how steering influences code generation.

## 📁 Project Structure

```
phantom-console/
├── .kiro/
│   ├── specs/           # Design documents
│   ├── steering/        # Steering rules for 2006 code
│   ├── hooks/           # Pre-commit hook
│   └── settings/        # MCP configuration
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── styles/          # Retro CSS
│   └── App.tsx          # Main application
├── server/              # Node.js backend
│   ├── index.js         # Express HTTP server
│   ├── mcp-stdio.js     # MCP server for Kiro
│   ├── mcp-registry.js  # Tool definitions
│   └── aws-wrapper.js   # AWS CLI wrapper
├── public/
│   └── sounds/          # Audio effects
└── scripts/
    └── install-hooks.sh # Hook installer
```

## 🔊 Audio Setup

Add these audio files to `public/sounds/`:
- `dialup.mp3` - 3-second modem handshake sound
- `hdd-crunch.mp3` - Hard drive read/write noise
- `error.mp3` - Windows XP error sound

Find royalty-free versions at [freesound.org](https://freesound.org) or [archive.org](https://archive.org).

## 🎬 Demo Script

1. **Page Load**: Dial-up sound plays, buckets load with 800ms delay
2. **List Buckets**: Shows ghost buckets in Séance Mode
3. **Upload File**: Ghost Agent interrupts with complaints
4. **Error State**: Screen tears, blood drips, Ghost mocks you
5. **Commit Code**: Hook rejects modern syntax with ASCII ghost

## 🏆 Hackathon Category: Resurrection

This project "resurrects" the 2006 AWS Console experience while using modern Kiro tooling to manage actual AWS resources. The contrast between the retro UI and the powerful backend demonstrates how far cloud computing has come.

## 📜 License

MIT License - Use this code however you want, but the Ghost will judge you.

---

*Built with 💀 for the Kiroween Hackathon*

*Best viewed in Internet Explorer 6.0 at 1024x768*
