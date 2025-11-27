/**
 * S3 Client - Browser-Side AWS Operations
 * 
 * All S3 operations happen directly from the browser
 * Credentials NEVER touch our server
 * 
 * This is the future of cloud computing! (circa 2006)
 */

import { S3Client, ListBucketsCommand, PutObjectCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { loadCredentials, AWSCredentials } from './awsCredentials';

// S3 Bucket interface
export interface S3Bucket {
  name: string;
  creationDate: string;
  region: string;
}

/**
 * Create S3 client with stored credentials
 */
function createS3Client(creds: AWSCredentials): S3Client {
  return new S3Client({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey
    }
  });
}

/**
 * List all S3 buckets using server proxy with client credentials
 * This avoids CORS issues while keeping credentials client-side
 */
export async function listBucketsClient(): Promise<{ buckets: S3Bucket[], error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      buckets: [], 
      error: 'No AWS credentials configured. Click "Connect AWS" to add your credentials.' 
    };
  }
  
  try {
    // Use server proxy to list buckets (credentials sent per-request, not stored on server)
    var response = await fetch('/api/buckets-with-creds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    
    var result = await response.json();
    
    if (result.error) {
      return { buckets: [], error: result.error.message || result.error };
    }
    
    return { buckets: result.buckets || [] };
  } catch (error: any) {
    return { buckets: [], error: 'Failed to connect to server: ' + error.message };
  }
}

/**
 * List objects in an S3 bucket using server proxy with client credentials
 */
export async function listBucketObjectsClient(bucketName: string): Promise<{ objects: any[], error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      objects: [], 
      error: 'No AWS credentials configured.' 
    };
  }
  
  try {
    // Use server proxy to list bucket objects (credentials sent per-request)
    var response = await fetch('/api/buckets-with-creds/' + bucketName + '/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    
    var result = await response.json();
    
    if (result.error) {
      return { objects: [], error: result.error.message || result.error };
    }
    
    return { objects: result.objects || [] };
  } catch (error: any) {
    return { objects: [], error: 'Failed to list bucket contents: ' + error.message };
  }
}

/**
 * Upload file to S3 bucket via API proxy (avoids CORS issues)
 * Uploads through our Vercel API which then uploads to S3
 * 
 * LIMITATION: Files must be under 4MB due to Vercel serverless function limits
 */
export async function uploadFileClient(
  bucketName: string, 
  fileName: string, 
  fileContent: ArrayBuffer
): Promise<{ success: boolean, url?: string, error?: string, tooLarge?: boolean }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      success: false, 
      error: 'No AWS credentials configured.' 
    };
  }
  
  // Check file size limit (4MB = 4 * 1024 * 1024 bytes)
  // With base64 encoding overhead, we limit to 3MB actual file size
  var maxFileSize = 3 * 1024 * 1024; // 3MB
  if (fileContent.byteLength > maxFileSize) {
    return {
      success: false,
      tooLarge: true,
      error: 'File is too large (' + (fileContent.byteLength / 1024 / 1024).toFixed(1) + ' MB). Maximum size is 3 MB due to serverless function limits.'
    };
  }
  
  try {
    // Convert ArrayBuffer to base64 for JSON transmission
    // Use chunked approach for better performance with large files
    var bytes = new Uint8Array(fileContent);
    var chunkSize = 8192; // Process 8KB at a time
    var binaryChunks = [];
    
    for (var i = 0; i < bytes.byteLength; i += chunkSize) {
      var chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
      binaryChunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
    }
    
    var binary = binaryChunks.join('');
    var base64 = window.btoa(binary);
    
    // Upload via API proxy (avoids CORS issues)
    var response = await fetch('/api/upload-with-creds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentials: creds,
        bucketName: bucketName,
        fileName: fileName,
        fileContent: base64
      })
    });
    
    var result = await response.json();
    
    if (result.success) {
      return { 
        success: true, 
        url: result.url 
      };
    } else {
      return {
        success: false,
        error: result.error?.message || result.error || 'Upload failed'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to upload: ' + error.message
    };
  }
}

/**
 * Generate presigned URL using server proxy with client credentials
 */
export async function generatePresignedUrlClient(
  bucketName: string,
  key: string,
  expiresIn: number
): Promise<{ url?: string, error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      error: 'No AWS credentials configured.' 
    };
  }
  
  try {
    var response = await fetch('/api/share-with-creds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentials: creds,
        bucketName: bucketName,
        key: key,
        expiresIn: expiresIn
      })
    });
    
    var result = await response.json();
    
    if (result.url) {
      return { url: result.url };
    } else {
      return { error: result.error?.message || result.error || 'Failed to generate URL' };
    }
  } catch (error: any) {
    return {
      error: 'Failed to generate presigned URL: ' + error.message
    };
  }
}

/**
 * Create a new S3 bucket using server proxy with client credentials
 * Web 2.0 compliant bucket creation - revolutionary cloud storage!
 */
export async function createBucketClient(
  bucketName: string
): Promise<{ success: boolean, error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      success: false, 
      error: 'No AWS credentials configured.' 
    };
  }
  
  try {
    var response = await fetch('/api/create-bucket-with-creds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentials: creds,
        bucketName: bucketName
      })
    });
    
    var result = await response.json();
    
    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error?.message || result.error || 'Failed to create bucket' };
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to create bucket: ' + error.message
    };
  }
}

/**
 * Test credentials via server proxy (avoids CORS issues)
 */
export async function testCredentials(creds: AWSCredentials): Promise<{ valid: boolean, error?: string }> {
  try {
    // Use server proxy to test credentials (avoids browser CORS)
    var response = await fetch('/api/test-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    
    var result = await response.json();
    
    if (result.valid) {
      return { valid: true };
    } else {
      return { valid: false, error: result.error || 'Invalid credentials' };
    }
  } catch (error: any) {
    // If server is not available, do basic validation
    if (creds.accessKeyId && creds.accessKeyId.startsWith('AKIA') && creds.secretAccessKey.length >= 20) {
      return { valid: true, error: '⚠️ Could not verify with AWS (server offline). Credentials format looks valid - try saving anyway.' };
    }
    return { valid: false, error: 'Could not connect to server to verify credentials.' };
  }
}

/**
 * Configure CORS on an S3 bucket to allow large file uploads
 * This enables direct browser-to-S3 uploads for files > 3MB
 */
export async function configureBucketCors(
  bucketName: string
): Promise<{ success: boolean, error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      success: false, 
      error: 'No AWS credentials configured.' 
    };
  }
  
  try {
    // Use server proxy to configure CORS (credentials sent per-request)
    var response = await fetch('/api/configure-bucket-cors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentials: creds,
        bucketName: bucketName
      })
    });
    
    var result = await response.json();
    
    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error?.message || result.error || 'Failed to configure CORS' };
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to configure CORS: ' + error.message
    };
  }
}

/**
 * Check if CORS is configured on a bucket
 * Returns true if CORS is configured, false otherwise
 */
export async function checkBucketCors(
  bucketName: string
): Promise<{ configured: boolean, error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      configured: false, 
      error: 'No AWS credentials configured.' 
    };
  }
  
  try {
    // Use server proxy to check CORS (credentials sent per-request)
    var response = await fetch('/api/check-bucket-cors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentials: creds,
        bucketName: bucketName
      })
    });
    
    var result = await response.json();
    
    return { configured: result.configured || false };
  } catch (error: any) {
    return {
      configured: false,
      error: 'Failed to check CORS: ' + error.message
    };
  }
}

/**
 * Upload large file using presigned URL (requires CORS to be configured)
 * This bypasses the 3MB API limit for files with CORS enabled
 */
export async function uploadLargeFileClient(
  bucketName: string,
  fileName: string,
  fileContent: ArrayBuffer
): Promise<{ success: boolean, url?: string, error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      success: false, 
      error: 'No AWS credentials configured.' 
    };
  }
  
  try {
    // Step 1: Get presigned URL from server
    var presignResponse = await fetch('/api/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentials: creds,
        bucketName: bucketName,
        fileName: fileName
      })
    });
    
    var presignResult = await presignResponse.json();
    
    if (!presignResult.uploadUrl) {
      return { 
        success: false, 
        error: presignResult.error?.message || 'Failed to get upload URL' 
      };
    }
    
    // Step 2: Upload directly to S3 using presigned URL
    var uploadResponse = await fetch(presignResult.uploadUrl, {
      method: 'PUT',
      body: fileContent,
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });
    
    if (!uploadResponse.ok) {
      return {
        success: false,
        error: 'Upload failed: ' + uploadResponse.statusText
      };
    }
    
    return { 
      success: true, 
      url: 'https://s3.amazonaws.com/' + bucketName + '/' + fileName 
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to upload: ' + error.message
    };
  }
}
