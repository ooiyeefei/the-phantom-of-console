/**
 * MCP Tool Registry - The Phantom's Arsenal
 * These tools let Kiro (and the web app) talk to AWS
 * Web 2.0 compliant, enterprise-grade tool definitions
 */

import { listBuckets, uploadFile, validateCredentials } from './aws-wrapper.js';

/**
 * Tool definitions for MCP - JSON Schema format
 * This is how we tell the LLM what we can do
 */
export var tools = [
  {
    name: 'list_buckets',
    description: 'List all S3 buckets in the AWS account. Returns bucket names, creation dates, and regions. In Séance Mode (demo), returns haunted mock buckets.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'upload_file',
    description: 'Upload a file to an S3 bucket. Requires bucket name, file name, and file content.',
    inputSchema: {
      type: 'object',
      properties: {
        bucketName: {
          type: 'string',
          description: 'The name of the S3 bucket to upload to'
        },
        fileName: {
          type: 'string',
          description: 'The name to give the file in S3'
        },
        content: {
          type: 'string',
          description: 'The content of the file (base64 encoded for binary files)'
        }
      },
      required: ['bucketName', 'fileName', 'content']
    }
  },
  {
    name: 'validate_credentials',
    description: 'Check if AWS credentials are valid. Returns whether running in live mode or Séance (demo) mode.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

/**
 * Handle tool calls from MCP clients (Kiro or web app)
 * @param {string} name - The tool name
 * @param {object} args - The tool arguments
 */
export async function handleToolCall(name, args) {
  // Web 2.0 compliant switch statement - no fancy pattern matching here!
  if (name === 'list_buckets') {
    return await listBuckets();
  }
  
  if (name === 'upload_file') {
    // For MCP calls, we need to handle the content differently
    // Write content to temp file, then upload
    var fs = await import('fs');
    var path = await import('path');
    var os = await import('os');
    
    var tempDir = os.default.tmpdir();
    var tempPath = path.default.join(tempDir, 'phantom-upload-' + Date.now());
    
    // Decode base64 if needed, otherwise write as-is
    var content = args.content;
    try {
      content = Buffer.from(args.content, 'base64');
    } catch (e) {
      content = args.content;
    }
    
    fs.default.writeFileSync(tempPath, content);
    
    try {
      var result = await uploadFile(args.bucketName, args.fileName, tempPath);
      return result;
    } finally {
      // Clean up temp file - we're responsible sysadmins!
      try { fs.default.unlinkSync(tempPath); } catch (e) { /* ignore */ }
    }
  }
  
  if (name === 'validate_credentials') {
    return await validateCredentials();
  }
  
  throw new Error('Unknown tool: ' + name + '. Did you mean list_buckets or upload_file?');
}
