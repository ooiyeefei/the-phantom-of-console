/**
 * Vercel Serverless Function - Main API Handler
 * 
 * Handles all /api/* routes for Vercel deployment
 * Web 2.0 compliant, enterprise-grade serverless deployment!
 */

var awsWrapper = require('../server/aws-wrapper.js');
var listBuckets = awsWrapper.listBuckets;
var listBucketObjects = awsWrapper.listBucketObjects;
var uploadFile = awsWrapper.uploadFile;
var validateCredentials = awsWrapper.validateCredentials;
var generatePresignedUrl = awsWrapper.generatePresignedUrl;

// Import AWS SDK for client-side credential handling
var S3Client = require('@aws-sdk/client-s3').S3Client;
var ListBucketsCommand = require('@aws-sdk/client-s3').ListBucketsCommand;
var ListObjectsV2Command = require('@aws-sdk/client-s3').ListObjectsV2Command;
var PutObjectCommand = require('@aws-sdk/client-s3').PutObjectCommand;
var PutBucketCorsCommand = require('@aws-sdk/client-s3').PutBucketCorsCommand;
var GetBucketCorsCommand = require('@aws-sdk/client-s3').GetBucketCorsCommand;
var getSignedUrl = require('@aws-sdk/s3-request-presigner').getSignedUrl;
var GetObjectCommand = require('@aws-sdk/client-s3').GetObjectCommand;
var GetBucketLocationCommand = require('@aws-sdk/client-s3').GetBucketLocationCommand;
var CreateBucketCommand = require('@aws-sdk/client-s3').CreateBucketCommand;
var PutObjectCommand = require('@aws-sdk/client-s3').PutObjectCommand;

// Import STS for credential testing
var STSClient = require('@aws-sdk/client-sts').STSClient;
var GetCallerIdentityCommand = require('@aws-sdk/client-sts').GetCallerIdentityCommand;

/**
 * Get the region for a specific bucket
 * AWS returns null for us-east-1 buckets (classic AWS!)
 */
async function getBucketRegion(s3Client, bucketName) {
  try {
    var command = new GetBucketLocationCommand({ Bucket: bucketName });
    var response = await s3Client.send(command);
    return response.LocationConstraint || 'us-east-1';
  } catch (error) {
    return 'us-east-1'; // Default fallback
  }
}

/**
 * Main serverless function handler
 * Vercel calls this for every /api request
 */
module.exports = async function handler(req, res) {
  // Enable CORS - critical for demo!
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Simulate 2006 latency in demo mode
  if (process.env.DEMO_MODE === 'true') {
    await new Promise(function(resolve) { setTimeout(resolve, 800); });
  }
  
  var url = req.url || '';
  var method = req.method;
  
  try {
    // Route: POST /api/buckets-with-creds (frontend sends credentials per-request)
    if (url.startsWith('/api/buckets-with-creds') && !url.includes('/objects') && method === 'POST') {
      var body = req.body;
      
      if (!body || !body.accessKeyId || !body.secretAccessKey) {
        return res.status(400).json({
          error: {
            code: 'MissingCredentials',
            message: 'AWS credentials are required',
            service: 'S3'
          }
        });
      }
      
      try {
        var s3Client = new S3Client({
          region: body.region || 'us-east-1',
          credentials: {
            accessKeyId: body.accessKeyId,
            secretAccessKey: body.secretAccessKey
          }
        });
        
        var command = new ListBucketsCommand({});
        var response = await s3Client.send(command);
        
        // Fetch actual regions for each bucket (in parallel for speed)
        var bucketPromises = (response.Buckets || []).map(async function(bucket) {
          var region = await getBucketRegion(s3Client, bucket.Name);
          return {
            name: bucket.Name,
            creationDate: bucket.CreationDate ? bucket.CreationDate.toISOString().split('T')[0] : 'unknown',
            region: region
          };
        });
        
        var buckets = await Promise.all(bucketPromises);
        
        return res.status(200).json({ buckets: buckets });
      } catch (error) {
        return res.status(500).json({
          error: {
            code: error.name || 'AWSError',
            message: error.message || 'Failed to list buckets',
            service: 'S3'
          }
        });
      }
    }
    
    // Route: GET /api/buckets
    if (url === '/api/buckets' || url === '/api' || url === '/') {
      if (method === 'GET') {
        var result = await listBuckets();
        return res.status(200).json(result);
      }
    }
    
    // Route: GET /api/status
    if (url === '/api/status' || url === '/status') {
      if (method === 'GET') {
        var credentials = await validateCredentials();
        return res.status(200).json({
          status: 'operational',
          mode: credentials.mode,
          credentialsValid: credentials.valid,
          timestamp: Date.now(),
          message: credentials.mode === 'seance' 
            ? '👻 Running in Séance Mode - Ghost buckets active!' 
            : '🔥 Live mode - Connected to real AWS!'
        });
      }
    }
    
    // Route: POST /api/buckets-with-creds/:bucketName/objects (frontend sends credentials per-request)
    if (url.includes('/buckets-with-creds/') && url.includes('/objects') && method === 'POST') {
      var parts = url.split('/');
      var bucketIndex = parts.indexOf('buckets-with-creds') + 1;
      var bucketName = parts[bucketIndex];
      var body = req.body;
      
      if (!bucketName) {
        return res.status(400).json({
          error: {
            code: 'MissingBucketName',
            message: 'Bucket name is required',
            service: 'S3'
          }
        });
      }
      
      if (!body || !body.accessKeyId || !body.secretAccessKey) {
        return res.status(400).json({
          error: {
            code: 'MissingCredentials',
            message: 'AWS credentials are required',
            service: 'S3'
          }
        });
      }
      
      try {
        // First, create a client to get the bucket's region
        var tempClient = new S3Client({
          region: body.region || 'us-east-1',
          credentials: {
            accessKeyId: body.accessKeyId,
            secretAccessKey: body.secretAccessKey
          }
        });
        
        // Get the bucket's actual region
        var bucketRegion = await getBucketRegion(tempClient, bucketName);
        
        // Create a new client with the correct region
        var s3Client = new S3Client({
          region: bucketRegion,
          credentials: {
            accessKeyId: body.accessKeyId,
            secretAccessKey: body.secretAccessKey
          }
        });
        
        var command = new ListObjectsV2Command({ Bucket: bucketName });
        var response = await s3Client.send(command);
        
        var objects = (response.Contents || []).map(function(obj) {
          return {
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified ? obj.LastModified.toISOString().split('T')[0] : 'unknown'
          };
        });
        
        return res.status(200).json({ objects: objects });
      } catch (error) {
        return res.status(500).json({
          error: {
            code: error.name || 'AWSError',
            message: error.message || 'Failed to list objects',
            service: 'S3'
          }
        });
      }
    }
    
    // Route: GET /api/buckets/:bucketName/objects
    if (url.includes('/buckets/') && url.includes('/objects') && method === 'GET') {
      var parts = url.split('/');
      var bucketIndex = parts.indexOf('buckets') + 1;
      var bucketName = parts[bucketIndex];
      
      if (bucketName) {
        var result = await listBucketObjects(bucketName);
        return res.status(200).json(result);
      }
    }
    
    // Route: POST /api/get-upload-url (generate presigned URL for upload)
    if (url.startsWith('/api/get-upload-url') && method === 'POST') {
      var body = req.body;
      
      // Extract credentials from nested object or top level
      var creds = body.credentials || body;
      
      if (!creds || !creds.accessKeyId || !creds.secretAccessKey) {
        return res.status(400).json({
          error: {
            code: 'MissingCredentials',
            message: 'AWS credentials are required',
            service: 'S3'
          }
        });
      }
      
      if (!body.bucketName || !body.fileName) {
        return res.status(400).json({
          error: {
            code: 'MissingParameters',
            message: 'bucketName and fileName are required',
            service: 'S3'
          }
        });
      }
      
      try {
        // Get bucket region
        var tempClient = new S3Client({
          region: creds.region || 'us-east-1',
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        var bucketRegion = await getBucketRegion(tempClient, body.bucketName);
        
        // Create client with correct region
        var s3Client = new S3Client({
          region: bucketRegion,
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        // Generate presigned URL for PUT operation
        var command = new PutObjectCommand({
          Bucket: body.bucketName,
          Key: body.fileName
        });
        
        var uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        return res.status(200).json({
          uploadUrl: uploadUrl,
          expiresIn: 3600
        });
      } catch (error) {
        return res.status(500).json({
          error: {
            code: error.name || 'PresignError',
            message: error.message || 'Failed to generate upload URL',
            service: 'S3'
          }
        });
      }
    }
    
    // Route: POST /api/upload-with-creds (upload file with client credentials)
    if (url.startsWith('/api/upload-with-creds') && method === 'POST') {
      var body = req.body;
      
      // Extract credentials from nested object or top level
      var creds = body.credentials || body;
      
      if (!creds || !creds.accessKeyId || !creds.secretAccessKey) {
        return res.status(400).json({
          error: {
            code: 'MissingCredentials',
            message: 'AWS credentials are required',
            service: 'S3'
          }
        });
      }
      
      if (!body.bucketName || !body.fileName || !body.fileContent) {
        return res.status(400).json({
          error: {
            code: 'MissingParameters',
            message: 'bucketName, fileName, and fileContent are required',
            service: 'S3'
          }
        });
      }
      
      try {
        // First, get the bucket's region
        var tempClient = new S3Client({
          region: creds.region || 'us-east-1',
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        var bucketRegion = await getBucketRegion(tempClient, body.bucketName);
        
        // Create client with correct region
        var s3Client = new S3Client({
          region: bucketRegion,
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        // Decode base64 file content
        var fileBuffer = Buffer.from(body.fileContent, 'base64');
        
        var command = new PutObjectCommand({
          Bucket: body.bucketName,
          Key: body.fileName,
          Body: fileBuffer
        });
        
        await s3Client.send(command);
        
        return res.status(200).json({
          success: true,
          url: 'https://s3.amazonaws.com/' + body.bucketName + '/' + body.fileName,
          message: 'File uploaded successfully'
        });
      } catch (error) {
        return res.status(500).json({
          error: {
            code: error.name || 'UploadError',
            message: error.message || 'Failed to upload file',
            service: 'S3'
          }
        });
      }
    }
    
    // Route: POST /api/test-credentials (test AWS credentials)
    if (url.startsWith('/api/test-credentials') && method === 'POST') {
      var body = req.body;
      
      if (!body || !body.accessKeyId || !body.secretAccessKey) {
        return res.status(400).json({
          valid: false,
          error: 'AWS credentials are required'
        });
      }
      
      try {
        var stsClient = new STSClient({
          region: body.region || 'us-east-1',
          credentials: {
            accessKeyId: body.accessKeyId,
            secretAccessKey: body.secretAccessKey
          }
        });
        
        var command = new GetCallerIdentityCommand({});
        var response = await stsClient.send(command);
        
        return res.status(200).json({
          valid: true,
          account: response.Account,
          arn: response.Arn,
          userId: response.UserId
        });
      } catch (error) {
        return res.status(200).json({
          valid: false,
          error: error.message || 'Invalid credentials'
        });
      }
    }
    
    // Route: POST /api/create-bucket-with-creds (create bucket with client credentials)
    if (url.startsWith('/api/create-bucket-with-creds') && method === 'POST') {
      var body = req.body;
      
      // Extract credentials from nested object or top level
      var creds = body.credentials || body;
      
      if (!creds || !creds.accessKeyId || !creds.secretAccessKey) {
        return res.status(400).json({
          error: {
            code: 'MissingCredentials',
            message: 'AWS credentials are required',
            service: 'S3'
          }
        });
      }
      
      if (!body.bucketName) {
        return res.status(400).json({
          error: {
            code: 'MissingParameters',
            message: 'bucketName is required',
            service: 'S3'
          }
        });
      }
      
      try {
        var s3Client = new S3Client({
          region: creds.region || 'us-east-1',
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        var command = new CreateBucketCommand({
          Bucket: body.bucketName
        });
        
        await s3Client.send(command);
        
        return res.status(200).json({
          success: true,
          message: 'Bucket created successfully',
          bucketName: body.bucketName
        });
      } catch (error) {
        return res.status(500).json({
          error: {
            code: error.name || 'CreateBucketError',
            message: error.message || 'Failed to create bucket',
            service: 'S3'
          }
        });
      }
    }
    
    // Route: POST /api/share-with-creds (generate presigned URL with client credentials)
    if (url.startsWith('/api/share-with-creds') && method === 'POST') {
      var body = req.body;
      
      // Extract credentials from nested object or top level
      var creds = body.credentials || body;
      
      if (!creds || !creds.accessKeyId || !creds.secretAccessKey) {
        return res.status(400).json({
          error: {
            code: 'MissingCredentials',
            message: 'AWS credentials are required',
            service: 'S3'
          }
        });
      }
      
      if (!body.bucketName || !body.key) {
        return res.status(400).json({
          error: {
            code: 'MissingParameters',
            message: 'bucketName and key are required',
            service: 'S3'
          }
        });
      }
      
      try {
        // First, get the bucket's region
        var tempClient = new S3Client({
          region: creds.region || 'us-east-1',
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        var bucketRegion = await getBucketRegion(tempClient, body.bucketName);
        
        // Create client with correct region
        var s3Client = new S3Client({
          region: bucketRegion,
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        var command = new GetObjectCommand({
          Bucket: body.bucketName,
          Key: body.key
        });
        
        var expiresIn = body.expiresIn || 3600;
        var url = await getSignedUrl(s3Client, command, { expiresIn: expiresIn });
        
        return res.status(200).json({
          url: url,
          expiresIn: expiresIn,
          message: 'Pre-signed URL generated successfully'
        });
      } catch (error) {
        return res.status(500).json({
          error: {
            code: error.name || 'S3PresignError',
            message: error.message || 'Failed to generate presigned URL',
            service: 'S3'
          }
        });
      }
    }
    
    // Route: POST /api/share
    if ((url === '/api/share' || url === '/share') && method === 'POST') {
      var body = req.body;
      var bucketName = body.bucketName;
      var key = body.key;
      var expiresIn = body.expiresIn || 3600;
      
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
        return res.status(500).json(result);
      } else {
        return res.status(200).json(result);
      }
    }
    
    // Route: POST /api/check-bucket-cors (check if CORS is configured)
    if (url.startsWith('/api/check-bucket-cors') && method === 'POST') {
      var body = req.body;
      
      // Extract credentials from nested object or top level
      var creds = body.credentials || body;
      
      if (!creds || !creds.accessKeyId || !creds.secretAccessKey) {
        return res.status(400).json({
          error: {
            code: 'MissingCredentials',
            message: 'AWS credentials are required',
            service: 'S3'
          }
        });
      }
      
      if (!body.bucketName) {
        return res.status(400).json({
          error: {
            code: 'MissingParameters',
            message: 'bucketName is required',
            service: 'S3'
          }
        });
      }
      
      try {
        // Get bucket region
        var tempClient = new S3Client({
          region: creds.region || 'us-east-1',
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        var bucketRegion = await getBucketRegion(tempClient, body.bucketName);
        
        // Create client with correct region
        var s3Client = new S3Client({
          region: bucketRegion,
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        // Check if CORS is configured
        var corsCommand = new GetBucketCorsCommand({
          Bucket: body.bucketName
        });
        
        try {
          await s3Client.send(corsCommand);
          // If we get here, CORS is configured
          return res.status(200).json({
            configured: true
          });
        } catch (corsError) {
          // NoSuchCORSConfiguration error means CORS is not configured
          if (corsError.name === 'NoSuchCORSConfiguration') {
            return res.status(200).json({
              configured: false
            });
          }
          throw corsError;
        }
      } catch (error) {
        return res.status(500).json({
          error: {
            code: error.name || 'CORSCheckError',
            message: error.message || 'Failed to check CORS',
            service: 'S3'
          }
        });
      }
    }
    
    // Route: POST /api/configure-bucket-cors (configure CORS for large file uploads)
    if (url.startsWith('/api/configure-bucket-cors') && method === 'POST') {
      var body = req.body;
      
      // Extract credentials from nested object or top level
      var creds = body.credentials || body;
      
      if (!creds || !creds.accessKeyId || !creds.secretAccessKey) {
        return res.status(400).json({
          error: {
            code: 'MissingCredentials',
            message: 'AWS credentials are required',
            service: 'S3'
          }
        });
      }
      
      if (!body.bucketName) {
        return res.status(400).json({
          error: {
            code: 'MissingParameters',
            message: 'bucketName is required',
            service: 'S3'
          }
        });
      }
      
      try {
        // Get bucket region
        var tempClient = new S3Client({
          region: creds.region || 'us-east-1',
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        var bucketRegion = await getBucketRegion(tempClient, body.bucketName);
        
        // Create client with correct region
        var s3Client = new S3Client({
          region: bucketRegion,
          credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey
          }
        });
        
        // Configure CORS to allow uploads from any origin
        var corsCommand = new PutBucketCorsCommand({
          Bucket: body.bucketName,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                AllowedOrigins: ['*'],
                ExposeHeaders: ['ETag'],
                MaxAgeSeconds: 3000
              }
            ]
          }
        });
        
        await s3Client.send(corsCommand);
        
        return res.status(200).json({
          success: true,
          message: 'CORS configured successfully for bucket: ' + body.bucketName
        });
      } catch (error) {
        return res.status(500).json({
          error: {
            code: error.name || 'CORSConfigError',
            message: error.message || 'Failed to configure CORS',
            service: 'S3'
          }
        });
      }
    }
    
    // Default: 404
    return res.status(404).json({
      error: {
        code: 'NotFound',
        message: 'API endpoint not found: ' + url,
        service: 'PhantomConsole',
        timestamp: Date.now()
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: {
        code: 'InternalError',
        message: error.message || 'Internal server error',
        service: 'PhantomConsole',
        timestamp: Date.now()
      }
    });
  }
}
