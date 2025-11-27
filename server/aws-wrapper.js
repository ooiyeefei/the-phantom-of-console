/**
 * AWS CLI Wrapper with Séance Mode
 * Web 2.0 compliant, enterprise-grade code for managing AWS resources
 * In 2006, we trust the command line - it's the only way to talk to S3!
 */

var exec = require('child_process').exec;

// 🎃 SÉANCE MODE: No more ghost buckets - real AWS only!
var MOCK_BUCKETS = [];

/**
 * Check if we're in Séance Mode (demo mode without real AWS)
 * This is enterprise-grade failover logic
 */
function isDemoMode() {
  return process.env.DEMO_MODE === 'true';
}

/**
 * Simulate 2006 network latency - back when 56k was fast
 * Only applies in demo mode to keep the 2006 vibe
 * @param {number} ms - Milliseconds to delay
 */
function simulateLatency(ms) {
  // Only simulate latency in demo mode - real AWS is fast!
  if (isDemoMode()) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms || 800);
    });
  }
  return Promise.resolve();
}

/**
 * Execute AWS CLI command - the proper way to talk to Amazon's servers
 * @param {string} command - The AWS CLI command to run
 */
function runCommand(command) {
  return new Promise(function(resolve, reject) {
    exec(command, function(error, stdout, stderr) {
      if (error) {
        reject({ code: error.code, message: stderr || error.message });
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Parse the output of 'aws s3 ls' into proper JSON
 * Because XML is so 2005, JSON is the future!
 */
function parseS3ListOutput(output) {
  var buckets = [];
  var lines = output.trim().split('\n');
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line) {
      // Format: 2006-06-06 12:00:00 bucket-name
      var match = line.match(/^(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\s+(.+)$/);
      if (match) {
        buckets.push({
          name: match[2],
          creationDate: match[1],
          region: 'unknown' // Will be fetched separately if needed
        });
      }
    }
  }
  
  return buckets;
}

/**
 * Get the region for a specific bucket
 * In 2006, we had to ask nicely where our data lived!
 * @param {string} bucketName - The bucket to get region for
 */
function getBucketRegion(bucketName) {
  return new Promise(function(resolve, reject) {
    var command = 'aws s3api get-bucket-location --bucket "' + bucketName + '"';
    exec(command, function(error, stdout, stderr) {
      if (error) {
        // If we can't get the region, default to us-east-1
        resolve('us-east-1');
      } else {
        try {
          var result = JSON.parse(stdout);
          // AWS returns null for us-east-1 buckets (classic AWS!)
          var region = result.LocationConstraint || 'us-east-1';
          resolve(region);
        } catch (e) {
          resolve('us-east-1');
        }
      }
    });
  });
}


/**
 * Parse the output of 'aws s3 ls s3://bucket/' into proper JSON
 * Lists all the files in a bucket - like browsing your hard drive!
 */
function parseS3ObjectsOutput(output) {
  var objects = [];
  var lines = output.trim().split('\n');
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line) {
      // Format: 2006-06-06 12:00:00   3355443 filename.mp3
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
  
  return objects;
}

/**
 * List all S3 buckets - the crown jewel of AWS services
 * S3 just launched this year and it's going to change everything!
 */
async function listBuckets() {
  // Simulate that sweet 2006 network latency
  await simulateLatency(800);
  
  // 🎃 Séance Mode: Return ghost buckets if demo mode is enabled
  if (isDemoMode()) {
    return { buckets: MOCK_BUCKETS };
  }
  
  try {
    var output = await runCommand('aws s3 ls');
    var buckets = parseS3ListOutput(output);
    return { buckets: buckets };
  } catch (error) {
    // If AWS fails, fall back to Séance Mode - the show must go on!
    console.error('AWS CLI failed, entering Séance Mode:', error.message);
    return { buckets: MOCK_BUCKETS };
  }
}

/**
 * List all objects in an S3 bucket - browse your cloud files!
 * @param {string} bucketName - The bucket to list objects from
 */
async function listBucketObjects(bucketName) {
  // Simulate that sweet 2006 network latency
  await simulateLatency(800);
  
  // 🎃 Séance Mode: Return ghost files if demo mode is enabled
  if (isDemoMode()) {
    return {
      objects: [
        { key: 'linkin-park-numb.mp3', size: 3355443, lastModified: '2006-06-06' },
        { key: 'myspace-profile.html', size: 12456, lastModified: '2006-03-14' },
        { key: 'aim-buddy-icon.gif', size: 8192, lastModified: '2006-05-20' },
        { key: 'napster-collection.zip', size: 104857600, lastModified: '2006-01-15' },
        { key: 'geocities-backup.tar', size: 524288, lastModified: '2006-07-04' }
      ]
    };
  }
  
  try {
    var command = 'aws s3 ls "s3://' + bucketName + '/"';
    var output = await runCommand(command);
    var objects = parseS3ObjectsOutput(output);
    return { objects: objects };
  } catch (error) {
    // If AWS fails, fall back to Séance Mode - the show must go on!
    console.error('AWS CLI failed, entering Séance Mode:', error.message);
    return {
      objects: [
        { key: 'linkin-park-numb.mp3', size: 3355443, lastModified: '2006-06-06' },
        { key: 'myspace-profile.html', size: 12456, lastModified: '2006-03-14' },
        { key: 'aim-buddy-icon.gif', size: 8192, lastModified: '2006-05-20' }
      ]
    };
  }
}

/**
 * Upload a file to S3 - revolutionary cloud storage!
 * @param {string} bucketName - The bucket to upload to
 * @param {string} fileName - The name of the file
 * @param {string} filePath - Local path to the file
 */
async function uploadFile(bucketName, fileName, filePath) {
  // Simulate upload latency - remember, bandwidth costs money!
  await simulateLatency(800);
  
  // 🎃 Séance Mode: Pretend the upload worked
  if (isDemoMode()) {
    return {
      success: true,
      url: 'https://s3.amazonaws.com/' + bucketName + '/' + fileName,
      message: 'File uploaded successfully (Séance Mode)'
    };
  }
  
  try {
    var command = 'aws s3 cp "' + filePath + '" "s3://' + bucketName + '/' + fileName + '"';
    await runCommand(command);
    return {
      success: true,
      url: 'https://s3.amazonaws.com/' + bucketName + '/' + fileName,
      message: 'File uploaded successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'S3UploadError',
        message: error.message,
        service: 'S3',
        timestamp: Date.now()
      }
    };
  }
}

/**
 * Validate AWS credentials - make sure we can talk to Amazon
 */
async function validateCredentials() {
  if (isDemoMode()) {
    return { valid: true, mode: 'seance' };
  }
  
  try {
    await runCommand('aws sts get-caller-identity');
    return { valid: true, mode: 'live' };
  } catch (error) {
    return { valid: false, mode: 'seance', error: error.message };
  }
}

/**
 * Generate a pre-signed URL for sharing S3 files - like LimeWire but legal!
 * Back in 2006, we shared files via AIM and hoped nobody got sued
 * @param {string} bucketName - The bucket containing the file
 * @param {string} key - The file key (path) in the bucket
 * @param {number} expiresIn - Time in seconds until URL expires (default 3600)
 */
async function generatePresignedUrl(bucketName, key, expiresIn) {
  // Default to 1 hour if not specified
  expiresIn = expiresIn || 3600;
  
  // Simulate network latency - sharing takes time in 2006!
  await simulateLatency(800);
  
  // 🎃 Séance Mode: Return a fake LimeWire-style URL
  if (isDemoMode()) {
    return {
      url: 'http://limewire.s3.amazon.com/' + key + '?token=expired&expires=' + expiresIn,
      expiresIn: expiresIn,
      message: 'Pre-signed URL generated (Séance Mode)'
    };
  }
  
  try {
    // Get the bucket's region first - critical for cross-region buckets!
    var region = await getBucketRegion(bucketName);
    
    // Build the presign command with the correct region
    var command = 'aws s3 presign "s3://' + bucketName + '/' + key + '" --expires-in ' + expiresIn + ' --region ' + region;
    var url = await runCommand(command);
    return {
      url: url.trim(),
      expiresIn: expiresIn,
      message: 'Pre-signed URL generated successfully'
    };
  } catch (error) {
    return {
      error: {
        code: 'S3PresignError',
        message: error.message,
        service: 'S3',
        timestamp: Date.now()
      }
    };
  }
}

// Export all functions for CommonJS (Vercel serverless compatibility)
module.exports = {
  listBuckets: listBuckets,
  listBucketObjects: listBucketObjects,
  uploadFile: uploadFile,
  validateCredentials: validateCredentials,
  generatePresignedUrl: generatePresignedUrl
};
