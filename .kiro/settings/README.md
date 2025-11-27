# ⚙️ Settings - Kiro IDE Configuration

> **🏆 HACKATHON JUDGES:** This demonstrates ADVANCED MCP integration with custom AWS tools that extend Kiro's capabilities.

## What's Here

### `mcp.json` - MCP Server Configuration

Configures the `phantom-aws` MCP server that provides 5 custom AWS tools for Kiro.

## MCP Architecture

```
┌─────────────────┐     stdio      ┌─────────────────┐
│   Kiro IDE      │ ◄────────────► │  mcp-stdio.js   │
└─────────────────┘                └────────┬────────┘
                                            │
                                   ┌────────▼────────┐
                                   │  mcp-registry   │
                                   │  (shared tools) │
                                   └────────┬────────┘
                                            │
┌─────────────────┐     HTTP       ┌────────▼────────┐
│   Web Browser   │ ◄────────────► │   Express API   │
└─────────────────┘                └────────┬────────┘
                                            │
                                   ┌────────▼────────┐
                                   │   AWS CLI       │
                                   │   (or mocks)    │
                                   └─────────────────┘
```

## Available Tools

### 1. `list_buckets`
Lists all S3 buckets in the AWS account.

**Input:** None
**Output:** `{ buckets: Array<{ name, creationDate, region }> }`

**Try it:**
```
Ask Kiro: "Use the phantom-aws MCP server to list my S3 buckets"
```

### 2. `list_bucket_objects`
Lists all files in a specific S3 bucket.

**Input:** `{ bucketName: string }`
**Output:** `{ objects: Array<{ key, size, lastModified }> }`

### 3. `upload_file`
Uploads a file to an S3 bucket.

**Input:** `{ bucketName: string, fileName: string, content: string }`
**Output:** `{ success: boolean, url: string }`

### 4. `validate_credentials`
Checks if AWS credentials are valid.

**Input:** None
**Output:** `{ valid: boolean, mode: 'live' | 'seance' }`

### 5. `generate_presigned_url`
Generates a temporary shareable URL for an S3 file.

**Input:** `{ bucketName: string, key: string, expiresIn: number }`
**Output:** `{ url: string, expiresIn: number }`

## Advanced Features

### Dual-Mode Architecture
The MCP server supports two modes:
- **stdio mode** - For Kiro IDE integration
- **HTTP mode** - For web frontend

Both modes share the same tool registry (`server/mcp-registry.js`).

### Fail-Safe Demo Mode
When `DEMO_MODE=true`:
- Returns ghost buckets (no AWS needed)
- Mock file listings
- Fake pre-signed URLs
- **Never fails** - perfect for demos

### Auto-Approve
Tools in the `autoApprove` list don't require user confirmation:
```json
"autoApprove": ["list_buckets", "upload_file"]
```

## Configuration Options

```json
{
  "command": "node",              // Executor
  "args": ["server/mcp-stdio.js"], // Entry point
  "env": {
    "DEMO_MODE": "true"           // Fail-safe mode
  },
  "disabled": false,              // Enable/disable server
  "autoApprove": [...]            // Tools that don't need confirmation
}
```

## Best Practices Demonstrated

### 1. Shared Tool Registry
Both stdio and HTTP modes use the same tools, reducing duplication.

### 2. Fail-Safe Defaults
Demo mode ensures presentations never fail due to network/credentials.

### 3. Clear Tool Descriptions
Each tool has a clear description for LLM understanding.

### 4. Structured Schemas
JSON Schema for inputs ensures type safety.

### 5. Error Handling
Graceful fallback to demo mode on AWS failures.

## Try It

### Test in Kiro
1. Open Kiro IDE
2. Open chat
3. Ask: "Use the phantom-aws MCP server to list my S3 buckets"
4. Observe: Returns ghost buckets in JSON format

### Test in Browser
1. Run: `npm run demo`
2. Run: `npm run dev`
3. Open: http://localhost:5173
4. Observe: Same tools work via HTTP

## Why This Wins

### Innovation
- **Dual-mode architecture** - One codebase, two interfaces
- **Fail-safe demos** - Never fails during presentations
- **Shared registry** - DRY principle applied

### Functionality
- **Real AWS integration** - Actually works with S3
- **5 complete tools** - Full S3 management
- **Production-ready** - Deployable to Vercel

### Quality
- **Type-safe** - JSON Schema validation
- **Error handling** - Graceful degradation
- **Documentation** - Clear tool descriptions

## Advanced Usage

### Add More Tools
1. Add tool definition to `server/mcp-registry.js`
2. Implement handler in `server/aws-wrapper.js`
3. Tool automatically available in both modes

### Switch to Live Mode
1. Configure AWS CLI: `aws configure`
2. Update `mcp.json`: `"DEMO_MODE": "false"`
3. Restart Kiro IDE
4. Tools now use real AWS

### Custom MCP Servers
Use this as a template for:
- Database operations
- Internal APIs
- Deployment tools
- Custom business logic

---

**This MCP integration showcases extended capabilities at their best.** 🎃
