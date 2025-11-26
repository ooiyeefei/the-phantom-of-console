/**
 * Express HTTP Server - The Bridge
 * 
 * This server exposes HTTP endpoints for the web frontend.
 * It's separate from mcp-stdio.js which handles Kiro communication.
 * 
 * Web 2.0 compliant, enterprise-grade HTTP API
 * Remember: In 2006, REST APIs are the cutting edge!
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { listBuckets, uploadFile, validateCredentials } from './aws-wrapper.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Load environment variables - .env files are so modern!
dotenv.config();

var app = express();
var PORT = process.env.PORT || 3000;

// 🎃 CRITICAL: Enable CORS with wildcard to prevent ANY demo failures
app.use(cors({ origin: '*' }));
app.use(express.json());

// Configure multer for file uploads - handling multipart/form-data like a pro
var upload = multer({ dest: os.tmpdir() });

/**
 * Middleware to simulate 2006 network latency
 * Back when waiting 800ms for a response was FAST
 */
function latencyMiddleware(req, res, next) {
  setTimeout(next, 800);
}

/**
 * Error handling middleware - format all errors as AWSError objects
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  res.status(500).json({
    error: {
      code: err.code || 'InternalError',
      message: err.message,
      service: 'PhantomConsole',
      timestamp: Date.now()
    }
  });
}

// Apply latency to all API routes - authenticity matters!
app.use('/api', latencyMiddleware);

/**
 * GET /api/buckets - List all S3 buckets
 * The most important endpoint in our haunted console
 */
app.get('/api/buckets', async function(req, res, next) {
  try {
    var result = await listBuckets();
    res.json(result);
  } catch (error) {
    next(error);
  }
});


/**
 * POST /api/upload - Upload a file to S3
 * Revolutionary cloud storage at your fingertips!
 */
app.post('/api/upload', upload.single('file'), async function(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NoFileProvided',
          message: 'No file was uploaded. Did you forget to attach it?',
          service: 'S3',
          timestamp: Date.now()
        }
      });
    }
    
    var bucketName = req.body.bucketName;
    if (!bucketName) {
      return res.status(400).json({
        error: {
          code: 'NoBucketSpecified',
          message: 'Please specify a bucket name. S3 needs to know where to put your file!',
          service: 'S3',
          timestamp: Date.now()
        }
      });
    }
    
    var result = await uploadFile(bucketName, req.file.originalname, req.file.path);
    
    // Clean up temp file - we're responsible sysadmins!
    try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/status - Check system status and credentials
 * Every enterprise app needs a health check endpoint
 */
app.get('/api/status', async function(req, res, next) {
  try {
    var credentials = await validateCredentials();
    res.json({
      status: 'operational',
      mode: credentials.mode,
      credentialsValid: credentials.valid,
      timestamp: Date.now(),
      message: credentials.mode === 'seance' 
        ? '👻 Running in Séance Mode - Ghost buckets active!' 
        : '🔥 Live mode - Connected to real AWS!'
    });
  } catch (error) {
    next(error);
  }
});

// Apply error handler
app.use(errorHandler);

// Start the server - let the haunting begin!
app.listen(PORT, function() {
  console.log('');
  console.log('👻 ═══════════════════════════════════════════════════════════ 👻');
  console.log('');
  console.log('   THE PHANTOM OF THE CONSOLE');
  console.log('   Enterprise-Grade AWS Management (circa 2006)');
  console.log('');
  console.log('   Server running on http://localhost:' + PORT);
  console.log('   Mode: ' + (process.env.DEMO_MODE === 'true' ? '🎃 SÉANCE MODE' : '🔥 LIVE MODE'));
  console.log('');
  console.log('   API Endpoints:');
  console.log('   - GET  /api/buckets  - List S3 buckets');
  console.log('   - POST /api/upload   - Upload file to S3');
  console.log('   - GET  /api/status   - Check system status');
  console.log('');
  console.log('👻 ═══════════════════════════════════════════════════════════ 👻');
  console.log('');
});
