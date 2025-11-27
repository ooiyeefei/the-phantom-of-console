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
    if (url === '/api/buckets-with-creds' && method === 'POST') {
      // In demo mode, ignore credentials and return ghost buckets
      var result = await listBuckets();
      return res.status(200).json(result);
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
      
      if (bucketName) {
        // In demo mode, ignore credentials and return ghost objects
        var result = await listBucketObjects(bucketName);
        return res.status(200).json(result);
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
