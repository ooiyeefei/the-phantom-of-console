/**
 * AWS CLI Wrapper with Séance Mode
 * Web 2.0 compliant, enterprise-grade code for managing AWS resources
 * In 2006, we trust the command line - it's the only way to talk to S3!
 */

import { exec } from 'child_process';

// 🎃 SÉANCE MODE: Ghost buckets for when AWS credentials fail during demo
var MOCK_BUCKETS = [
  { name: 'bucket-death-star-plans', creationDate: '2006-06-06', region: 'us-east-1' },
  { name: 'bucket-limewire-music', creationDate: '2006-01-15', region: 'us-west-1' },
  { name: 'bucket-myspace-backup', creationDate: '2006-03-21', region: 'us-east-1' },
  { name: 'bucket-geocities-archive', creationDate: '2006-08-08', region: 'eu-west-1' }
];

/**
 * Check if we're in Séance Mode (demo mode without real AWS)
 * This is enterprise-grade failover logic
 */
function isDemoMode() {
  return process.env.DEMO_MODE === 'true';
}

/**
 * Simulate 2006 network latency - back when 56k was fast
 * @param {number} ms - Milliseconds to delay
 */
function simulateLatency(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms || 800);
  });
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
          region: 'us-east-1' // S3 was only in us-east-1 in 2006!
        });
      }
    }
  }
  
  return buckets;
}


/**
 * List all S3 buckets - the crown jewel of AWS services
 * S3 just launched this year and it's going to change everything!
 */
export async function listBuckets() {
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
 * Upload a file to S3 - revolutionary cloud storage!
 * @param {string} bucketName - The bucket to upload to
 * @param {string} fileName - The name of the file
 * @param {string} filePath - Local path to the file
 */
export async function uploadFile(bucketName, fileName, filePath) {
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
export async function validateCredentials() {
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
