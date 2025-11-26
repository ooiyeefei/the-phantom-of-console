# 🎃 How We Used Kiro - The Phantom of the Console

This document details how Kiro IDE features were used to build The Phantom of the Console for the Kiroween Hackathon "Resurrection" category.

## Section 1: Vibe Coding 🎨

We used Kiro's chat-based development to rapidly build UI components while the steering rules were active.

### Example: BucketTable Component

**Prompt used:**
> "Generate an HTML table layout for S3 buckets using inline styles and no flexbox. Use 'var' for variables."

**Result:** Kiro generated a table-based component using:
- `var` instead of `const`/`let`
- Traditional function declarations
- HTML `<table>` elements with inline styles
- No modern CSS (flexbox/grid)

```javascript
// Generated code follows 2006 patterns
var buckets = self.props.buckets;
var loading = self.props.loading;

// Render the table - HTML tables are web scale!
return (
  <table className="data-table">
    <thead>
      <tr>
        <th style={{ width: '40%' }}>Bucket Name</th>
        ...
      </tr>
    </thead>
    ...
  </table>
);
```

## Section 2: Steering Rules 📜

The `.kiro/steering/phantom-rules.md` file forces Kiro to generate 2006-style code.

### Steering Configuration

```markdown
---
inclusion: always
---

# 👻 Phantom Console Steering Rules

You are a coding engine trapped in 2006...

## JavaScript Rules
1. Use `var` instead of `const` or `let`
2. Use `function` declarations instead of arrow functions
3. Use `XMLHttpRequest` instead of `fetch`
4. Use callback patterns instead of Promises
...
```

### Evidence of Steering in Action

When asked to make an API call, Kiro generated:

```javascript
// ✅ Kiro generated this (2006 style)
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    var response = JSON.parse(xhr.responseText);
    self.setState({ buckets: response.buckets });
  }
};
xhr.open('GET', '/api/buckets', true);
xhr.send();

// ❌ NOT this (modern style)
// const response = await fetch('/api/buckets');
// const data = await response.json();
```


## Section 3: Agent Hooks 🪝

The `.kiro/hooks/pre-commit-haunt.js` enforces legacy code patterns at commit time.

### Hook Behavior

1. **Scans staged files** for modern JavaScript patterns
2. **Detects forbidden syntax:** `const`, `let`, `=>`, template literals, `async/await`
3. **Blocks commits** that don't follow legacy patterns
4. **Requires commit messages** to start with `feat(legacy):`

### Example Output

```
👻 ═══════════════════════════════════════════════════════════ 👻
   THE HAUNTED PRE-COMMIT HOOK IS SCANNING YOUR CODE...
👻 ═══════════════════════════════════════════════════════════ 👻

     .-.
    (o o)
    | O |
    |   |
    '~~~'

  👻 THE GHOST REJECTS YOUR COMMIT! 👻

   ⚠️  ERROR 666: TOO MODERN! ⚠️

   The Ghost has detected FORBIDDEN modern syntax:

   ❌ const (found 3 time(s))
   ❌ arrow function (=>) (found 2 time(s))

   In 2006, we used VAR and we LIKED it!

👻 ═══════════════════════════════════════════════════════════ 👻
   COMMIT REJECTED BY THE GHOST OF SYSADMINS PAST
👻 ═══════════════════════════════════════════════════════════ 👻
```

## Section 4: MCP Integration 🔌

The project includes a custom MCP server that Kiro can use directly.

### MCP Configuration

`.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "phantom-aws": {
      "command": "node",
      "args": ["server/mcp-stdio.js"],
      "env": { "DEMO_MODE": "true" },
      "autoApprove": ["list_buckets", "upload_file"]
    }
  }
}
```

### Available Tools

1. **list_buckets** - Lists S3 buckets (or ghost buckets in Séance Mode)
2. **upload_file** - Uploads files to S3
3. **validate_credentials** - Checks AWS credential status

### Try It!

Ask Kiro: *"Use the phantom-aws MCP server to list my S3 buckets"*

Expected response:
```json
{
  "buckets": [
    { "name": "bucket-death-star-plans", "creationDate": "2006-06-06", "region": "us-east-1" },
    { "name": "bucket-limewire-music", "creationDate": "2006-01-15", "region": "us-west-1" }
  ]
}
```

### Architecture

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

## Summary

| Kiro Feature | How We Used It |
|--------------|----------------|
| **Steering** | Forced 2006 code patterns (var, XMLHttpRequest, callbacks) |
| **Vibe Coding** | Generated UI components with steering rules active |
| **Agent Hooks** | Pre-commit hook rejects modern JavaScript |
| **MCP** | Custom server lets Kiro manage AWS resources |

---

*Built with 💀 for the Kiroween Hackathon*
