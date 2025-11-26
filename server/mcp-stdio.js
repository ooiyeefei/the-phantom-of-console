/**
 * MCP Stdio Entry Point - For Kiro IDE Integration
 * 
 * CRITICAL: This file uses stdio transport for Kiro communication.
 * DO NOT use console.log() - it will corrupt the JSON-RPC channel!
 * All logging must go to stderr via console.error()
 * 
 * This is enterprise-grade MCP integration, Web 2.0 style.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import our shared tool registry - code reuse is web scale!
import { tools, handleToolCall } from './mcp-registry.js';

// Create the MCP server instance
var server = new Server(
  {
    name: 'phantom-aws',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle ListTools request - tell Kiro what we can do
server.setRequestHandler(ListToolsRequestSchema, async function() {
  return {
    tools: tools
  };
});

// Handle CallTool request - execute the actual tool
server.setRequestHandler(CallToolRequestSchema, async function(request) {
  try {
    var result = await handleToolCall(request.params.name, request.params.arguments || {});
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: ' + error.message
        }
      ],
      isError: true
    };
  }
});

// Main entry point - connect to Kiro via stdio
async function run() {
  var transport = new StdioServerTransport();
  await server.connect(transport);
  // NOTE: Do NOT console.log() here - it breaks Kiro's JSON-RPC!
  // Use console.error() for debugging if needed
}

run().catch(function(error) {
  // Write errors to stderr so they don't break JSON-RPC on stdout
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});
