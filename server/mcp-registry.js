/**
 * MCP Tool Registry - The Phantom's Arsenal
 * These tools let Kiro (and the web app) talk to AWS
 * Web 2.0 compliant, enterprise-grade tool definitions
 */

import { listBuckets, listBucketObjects, uploadFile, validateCredentials, generatePresignedUrl } from './aws-wrapper.js';

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
    name: 'list_bucket_objects',
    description: 'List all objects (files) in an S3 bucket. Returns file keys, sizes, and last modified dates. In Séance Mode (demo), returns haunted mock files.',
    inputSchema: {
      type: 'object',
      properties: {
        bucketName: {
          type: 'string',
          description: 'The name of the S3 bucket to list objects from'
        }
      },
      required: ['bucketName']
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
  },
  {
    name: 'generate_presigned_url',
    description: 'Generate a temporary pre-signed URL for sharing an S3 file. URL expires after specified time (default 3600 seconds). In Séance Mode, returns a mock LimeWire-style URL.',
    inputSchema: {
      type: 'object',
      properties: {
        bucketName: {
          type: 'string',
          description: 'The name of the S3 bucket containing the file'
        },
        key: {
          type: 'string',
          description: 'The key (path) of the file in the bucket'
        },
        expiresIn: {
          type: 'number',
          description: 'Time in seconds until the URL expires (default: 3600). Common values: 3600 (1hr), 86400 (24hr), 604800 (7days)'
        }
      },
      required: ['bucketName', 'key']
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
  
  if (name === 'list_bucket_objects') {
    return await listBucketObjects(args.bucketName);
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
  
  if (name === 'generate_presigned_url') {
    var expiresIn = args.expiresIn || 3600; // Default to 1 hour
    return await generatePresignedUrl(args.bucketName, args.key, expiresIn);
  }
  
  throw new Error('Unknown tool: ' + name + '. Did you mean list_buckets, list_bucket_objects, upload_file, or generate_presigned_url?');
}
