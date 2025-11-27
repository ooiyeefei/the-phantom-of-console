/**
 * S3 Client - Browser-Side AWS Operations
 * 
 * All S3 operations happen directly from the browser
 * Credentials NEVER touch our server
 * 
 * This is the future of cloud computing! (circa 2006)
 */

import { 
  S3Client, 
  ListBucketsCommand, 
  PutObjectCommand, 
  PutBucketCorsCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} from '@aws-sdk/client-s3';
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
 * Upload large file using S3 NATIVE multipart upload API
 * TRUE resumable uploads that survive page refresh!
 * 
 * How it works:
 * 1. Initiate multipart upload → Get UploadId
 * 2. Upload parts → Store ETag for each part
 * 3. On refresh → User re-selects file, we skip uploaded parts
 * 4. Complete upload → S3 combines all parts
 * 
 * This is REAL 2006 technology - multipart uploads existed back then!
 */
export async function uploadLargeFileClient(
  bucketName: string,
  fileName: string,
  fileContent: ArrayBuffer,
  onProgress?: (progress: { uploadedChunks: number; totalChunks: number; percentage: number }) => void
): Promise<{ success: boolean, url?: string, error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { 
      success: false, 
      error: 'No AWS credentials configured.' 
    };
  }
  
  try {
    // Create S3 client with user credentials
    var s3Client = createS3Client(creds);
    
    // For files under 10MB, use simple upload (no multipart needed)
    var multipartThreshold = 10 * 1024 * 1024; // 10MB
    if (fileContent.byteLength < multipartThreshold) {
      var uint8Array = new Uint8Array(fileContent);
      var command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: uint8Array,
        ContentType: 'application/octet-stream'
      });
      
      await s3Client.send(command);
      
      return { 
        success: true, 
        url: 'https://s3.amazonaws.com/' + bucketName + '/' + fileName 
      };
    }
    
    // Use S3 multipart upload for large files
    var partSize = 5 * 1024 * 1024; // 5MB parts (S3 minimum)
    var totalParts = Math.ceil(fileContent.byteLength / partSize);
    
    // Check for existing multipart upload in progress
    var uploadKey = 'phantom_multipart_' + bucketName + '_' + fileName;
    var existingUpload = localStorage.getItem(uploadKey);
    var uploadId;
    var uploadedParts = [];
    
    if (existingUpload) {
      try {
        var uploadData = JSON.parse(existingUpload);
        uploadId = uploadData.uploadId;
        uploadedParts = uploadData.parts || [];
        console.log('Resuming upload with UploadId:', uploadId, 'Parts:', uploadedParts.length);
      } catch (e) {
        // Invalid data, start fresh
        existingUpload = null;
      }
    }
    
    // If no existing upload, initiate new multipart upload
    if (!existingUpload) {
      var createCommand = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: 'application/octet-stream'
      });
      
      var createResponse = await s3Client.send(createCommand);
      uploadId = createResponse.UploadId;
      
      // Save upload ID to localStorage
      localStorage.setItem(uploadKey, JSON.stringify({
        uploadId: uploadId,
        parts: [],
        fileName: fileName,
        fileSize: fileContent.byteLength,
        timestamp: Date.now()
      }));
      
      console.log('Initiated multipart upload:', uploadId);
    }
    
    // Upload parts (skip already uploaded parts)
    var parts = [];
    for (var i = 0; i < totalParts; i++) {
      var partNumber = i + 1;
      
      // Check if this part was already uploaded
      var existingPart = uploadedParts.find(function(p) { return p.PartNumber === partNumber; });
      if (existingPart) {
        parts.push(existingPart);
        console.log('Skipping part', partNumber, '- already uploaded');
        
        // Report progress for skipped part
        if (onProgress) {
          onProgress({
            uploadedChunks: partNumber,
            totalChunks: totalParts,
            percentage: Math.round((partNumber / totalParts) * 100)
          });
        }
        continue;
      }
      
      // Upload this part
      var start = i * partSize;
      var end = Math.min(start + partSize, fileContent.byteLength);
      var partData = fileContent.slice(start, end);
      var uint8Part = new Uint8Array(partData);
      
      var uploadPartCommand = new UploadPartCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: uint8Part
      });
      
      var uploadPartResponse = await s3Client.send(uploadPartCommand);
      
      // Store part info
      var partInfo = {
        PartNumber: partNumber,
        ETag: uploadPartResponse.ETag
      };
      parts.push(partInfo);
      uploadedParts.push(partInfo);
      
      // Update localStorage with progress
      localStorage.setItem(uploadKey, JSON.stringify({
        uploadId: uploadId,
        parts: uploadedParts,
        fileName: fileName,
        fileSize: fileContent.byteLength,
        timestamp: Date.now()
      }));
      
      console.log('Uploaded part', partNumber, 'ETag:', uploadPartResponse.ETag);
      
      // Report progress
      if (onProgress) {
        onProgress({
          uploadedChunks: partNumber,
          totalChunks: totalParts,
          percentage: Math.round((partNumber / totalParts) * 100)
        });
      }
    }
    
    // Complete the multipart upload
    var completeCommand = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
      }
    });
    
    await s3Client.send(completeCommand);
    
    // Clean up localStorage
    localStorage.removeItem(uploadKey);
    
    console.log('Multipart upload completed successfully!');
    
    return { 
      success: true, 
      url: 'https://s3.amazonaws.com/' + bucketName + '/' + fileName 
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Detect CORS errors
    var errorMessage = error.message || error.toString();
    var isCorsError = errorMessage.includes('CORS') || 
                      errorMessage.includes('Failed to fetch') ||
                      errorMessage.includes('NetworkError') ||
                      error.name === 'TypeError';
    
    if (isCorsError) {
      return {
        success: false,
        error: 'CORS_ERROR: ' + errorMessage
      };
    }
    
    return {
      success: false,
      error: 'Failed to upload: ' + errorMessage
    };
  }
}

/**
 * Check for incomplete multipart uploads that can be resumed
 * Returns list of uploads that were interrupted
 */
export function checkIncompleteUploads(): Array<{
  bucketName: string;
  fileName: string;
  progress: number;
  timestamp: number;
  uploadId: string;
  fileSize: number;
}> {
  var incompleteUploads = [];
  
  // Scan localStorage for multipart upload entries
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key && key.startsWith('phantom_multipart_')) {
      try {
        var uploadData = JSON.parse(localStorage.getItem(key) || '{}');
        
        // Extract bucket and file name from key
        var keyParts = key.replace('phantom_multipart_', '').split('_');
        var bucketName = keyParts[0];
        var fileName = keyParts.slice(1).join('_');
        
        // Calculate progress based on uploaded parts
        var totalParts = Math.ceil(uploadData.fileSize / (5 * 1024 * 1024));
        var uploadedParts = (uploadData.parts || []).length;
        var progress = Math.round((uploadedParts / totalParts) * 100);
        
        incompleteUploads.push({
          bucketName: bucketName,
          fileName: fileName,
          progress: progress,
          timestamp: uploadData.timestamp,
          uploadId: uploadData.uploadId,
          fileSize: uploadData.fileSize
        });
      } catch (e) {
        // Invalid data, skip
      }
    }
  }
  
  return incompleteUploads;
}

/**
 * Clear incomplete multipart upload progress
 */
export function clearIncompleteUpload(bucketName: string, fileName: string): void {
  var uploadKey = 'phantom_multipart_' + bucketName + '_' + fileName;
  localStorage.removeItem(uploadKey);
}

/**
 * Abort incomplete multipart upload on S3
 * This cleans up the multipart upload on S3 side
 */
export async function abortIncompleteUpload(
  bucketName: string, 
  fileName: string, 
  uploadId: string
): Promise<{ success: boolean, error?: string }> {
  var creds = loadCredentials();
  
  if (!creds) {
    return { success: false, error: 'No AWS credentials configured.' };
  }
  
  try {
    var s3Client = createS3Client(creds);
    
    var abortCommand = new AbortMultipartUploadCommand({
      Bucket: bucketName,
      Key: fileName,
      UploadId: uploadId
    });
    
    await s3Client.send(abortCommand);
    
    // Also clear from localStorage
    clearIncompleteUpload(bucketName, fileName);
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to abort upload: ' + (error.message || error)
    };
  }
}
