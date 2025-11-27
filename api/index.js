/**
 * Vercel Serverless Function - Express API Wrapper
 * 
 * This wraps our Express server for Vercel's serverless environment
 * Web 2.0 compliant, enterprise-grade serverless deployment!
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { listBuckets, listBucketObjects, uploadFile, validateCredentials, generatePresignedUrl } from '../server/aws-wrapper.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

var app = express();

// 🎃 CRITICAL: Enable CORS with wildcard to prevent ANY demo failures
app.use(cors({ origin: '*' }));
app.use(express.json());

// Configure multer for file uploads - handling multipart/form-data like a pro
var upload = multer({ dest: os.tmpdir() });

/**
 * Middleware to simulate 2006 network latency
 * Only in demo mode - real AWS is fast!
 */
function latencyMiddleware(req, res, next) {
  if (process.env.DEMO_MODE === 'true') {
    setTimeout(next, 800);
  } else {
    next();
  }
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

// Apply latency to all API routes - but only in demo mode!
app.use('/api', latencyMiddleware);

/**
 * GET /api/buckets - List all S3 buckets (demo mode)
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
 * POST /api/buckets-with-creds - List buckets using client-provided credentials
 */
app.post('/api/buckets-with-creds', async function(req, res, next) {
  try {
    var creds = req.body;
    
    if (!creds.accessKeyId || !creds.secretAccessKey || !creds.region) {
      return res.json({ error: { message: 'Missing credentials' } });
    }
    
    var command = 'AWS_ACCESS_KEY_ID="' + creds.accessKeyId + '" AWS_SECRET_ACCESS_KEY="' + creds.secretAccessKey + '" AWS_DEFAULT_REGION="' + creds.region + '" aws s3 ls';
    
    var exec = (await import('child_process')).exec;
    
    exec(command, function(error, stdout, stderr) {
      if (error) {
        res.json({ error: { message: stderr || error.message } });
      } else {
        var buckets = [];
        var lines = stdout.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line) {
            var match = line.match(/^(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\s+(.+)$/);
            if (match) {
              buckets.push({
                name: match[2],
                creationDate: match[1],
                region: creds.region
              });
            }
          }
        }
        res.json({ buckets: buckets });
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/upload - Upload a file to S3 (demo mode)
 */
app.post('/api/upload', upload.single('file'), async function(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NoFileProvided',
          message: 'No file was uploaded.',
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
          message: 'Please specify a bucket name.',
          service: 'S3',
          timestamp: Date.now()
        }
      });
    }
    
    var result = await uploadFile(bucketName, req.file.originalname, req.file.path);
    
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
 * GET /api/status - Check system status
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

/**
 * GET /api/buckets/:bucketName/objects - List objects in a bucket
 */
app.get('/api/buckets/:bucketName/objects', async function(req, res, next) {
  try {
    var bucketName = req.params.bucketName;
    var result = await listBucketObjects(bucketName);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/buckets-with-creds/:bucketName/objects - List bucket objects with credentials
 */
app.post('/api/buckets-with-creds/:bucketName/objects', async function(req, res, next) {
  try {
    var bucketName = req.params.bucketName;
    var creds = req.body;
    
    if (!creds.accessKeyId || !creds.secretAccessKey || !creds.region) {
      return res.json({ error: { message: 'Missing credentials' } });
    }
    
    var command = 'AWS_ACCESS_KEY_ID="' + creds.accessKeyId + '" AWS_SECRET_ACCESS_KEY="' + creds.secretAccessKey + '" AWS_DEFAULT_REGION="' + creds.region + '" aws s3 ls "s3://' + bucketName + '/"';
    
    var exec = (await import('child_process')).exec;
    
    exec(command, function(error, stdout, stderr) {
      if (error) {
        res.json({ error: { message: stderr || error.message } });
      } else {
        var objects = [];
        var lines = stdout.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line) {
            var match = line.match(/^(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\s+(\d+)\s+(.+)$/);
            if (match) {
              objects.push({
                key: match[3],
                size: parseInt(match[2], 10),
                lastModified: match[1]
              });
            }
          }
        }
        res.json({ objects: objects });
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/share - Generate pre-signed URL
 */
app.post('/api/share', async function(req, res, next) {
  try {
    var bucketName = req.body.bucketName;
    var key = req.body.key;
    var expiresIn = req.body.expiresIn || 3600;
    
    if (!bucketName || !key) {
      return res.status(400).json({
        error: {
          code: 'MissingParameters',
          message: 'Please specify both bucketName and key.',
          service: 'S3',
          timestamp: Date.now()
        }
      });
    }
    
    var result = await generatePresignedUrl(bucketName, key, expiresIn);
    
    if (result.error) {
      res.status(500).json(result);
    } else {
      res.json(result);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/create-bucket-with-creds - Create bucket with credentials
 */
app.post('/api/create-bucket-with-creds', async function(req, res, next) {
  try {
    var data = req.body;
    var creds = data.credentials;
    var bucketName = data.bucketName;
    
    if (!creds || !bucketName) {
      return res.json({ success: false, error: { message: 'Missing required fields' } });
    }
    
    var exec = (await import('child_process')).exec;
    
    var command;
    if (creds.region === 'us-east-1') {
      command = 'AWS_ACCESS_KEY_ID="' + creds.accessKeyId + '" AWS_SECRET_ACCESS_KEY="' + creds.secretAccessKey + '" AWS_DEFAULT_REGION="' + creds.region + '" aws s3api create-bucket --bucket "' + bucketName + '"';
    } else {
      command = 'AWS_ACCESS_KEY_ID="' + creds.accessKeyId + '" AWS_SECRET_ACCESS_KEY="' + creds.secretAccessKey + '" AWS_DEFAULT_REGION="' + creds.region + '" aws s3api create-bucket --bucket "' + bucketName + '" --create-bucket-configuration LocationConstraint=' + creds.region;
    }
    
    exec(command, function(error, stdout, stderr) {
      if (error) {
        var errorMsg = stderr || error.message;
        if (errorMsg.includes('BucketAlreadyExists') || errorMsg.includes('BucketAlreadyOwnedByYou')) {
          res.json({ success: false, error: { message: 'Bucket name already exists.' } });
        } else if (errorMsg.includes('InvalidBucketName')) {
          res.json({ success: false, error: { message: 'Invalid bucket name.' } });
        } else {
          res.json({ success: false, error: { message: errorMsg } });
        }
      } else {
        res.json({ success: true, bucketName: bucketName, region: creds.region });
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/share-with-creds - Generate pre-signed URL with credentials
 */
app.post('/api/share-with-creds', async function(req, res, next) {
  try {
    var data = req.body;
    var creds = data.credentials;
    var bucketName = data.bucketName;
    var key = data.key;
    var expiresIn = data.expiresIn || 3600;
    
    if (!creds || !bucketName || !key) {
      return res.json({ error: { message: 'Missing required fields' } });
    }
    
    var exec = (await import('child_process')).exec;
    
    var getBucketRegionCmd = 'AWS_ACCESS_KEY_ID="' + creds.accessKeyId + '" AWS_SECRET_ACCESS_KEY="' + creds.secretAccessKey + '" AWS_DEFAULT_REGION="' + creds.region + '" aws s3api get-bucket-location --bucket "' + bucketName + '"';
    
    exec(getBucketRegionCmd, function(regionError, regionStdout, regionStderr) {
      var bucketRegion = creds.region;
      
      if (!regionError && regionStdout) {
        try {
          var locationResult = JSON.parse(regionStdout);
          bucketRegion = locationResult.LocationConstraint || 'us-east-1';
        } catch (e) {
          // Use default region
        }
      }
      
      var command = 'AWS_ACCESS_KEY_ID="' + creds.accessKeyId + '" AWS_SECRET_ACCESS_KEY="' + creds.secretAccessKey + '" AWS_DEFAULT_REGION="' + bucketRegion + '" aws s3 presign "s3://' + bucketName + '/' + key + '" --expires-in ' + expiresIn + ' --region ' + bucketRegion;
      
      exec(command, function(error, stdout, stderr) {
        if (error) {
          res.json({ error: { message: stderr || error.message } });
        } else {
          res.json({ url: stdout.trim(), expiresIn: expiresIn });
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

// Apply error handler
app.use(errorHandler);

// Export for Vercel serverless
export default app;
