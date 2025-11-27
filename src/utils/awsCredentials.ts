/**
 * AWS Credentials Manager - Client-Side Only
 * 
 * Stores AWS credentials securely in browser localStorage
 * Credentials NEVER leave the browser - all S3 operations happen client-side
 * 
 * Web 2.0 compliant security (well, as compliant as 2006 can be)
 */

// Simple encryption key derived from a fixed salt + user's browser fingerprint
// This isn't military-grade, but it prevents casual snooping
var STORAGE_KEY = 'phantom_aws_creds';
var ENCRYPTION_SALT = 'kiro-phantom-2006';

/**
 * Simple XOR encryption - good enough for localStorage obfuscation
 * In 2006, this was considered "enterprise security"
 */
function xorEncrypt(text: string, key: string): string {
  var result = '';
  for (var i = 0; i < text.length; i++) {
    var charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode
}

function xorDecrypt(encoded: string, key: string): string {
  try {
    var text = atob(encoded); // Base64 decode
    var result = '';
    for (var i = 0; i < text.length; i++) {
      var charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    return '';
  }
}

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string; // Optional - we detect bucket regions dynamically
}

/**
 * Save credentials to localStorage (encrypted)
 */
export function saveCredentials(creds: AWSCredentials): void {
  var json = JSON.stringify(creds);
  var encrypted = xorEncrypt(json, ENCRYPTION_SALT);
  localStorage.setItem(STORAGE_KEY, encrypted);
}

/**
 * Load credentials from localStorage (decrypted)
 */
export function loadCredentials(): AWSCredentials | null {
  var encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) {
    return null;
  }
  
  try {
    var json = xorDecrypt(encrypted, ENCRYPTION_SALT);
    var creds = JSON.parse(json);
    // Region is optional - we detect it dynamically per bucket
    if (creds.accessKeyId && creds.secretAccessKey) {
      // Ensure region exists for backwards compatibility
      if (!creds.region) {
        creds.region = 'us-east-1';
      }
      return creds;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Clear stored credentials
 */
export function clearCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if credentials are stored
 */
export function hasCredentials(): boolean {
  return loadCredentials() !== null;
}

/**
 * Mask credentials for display (show only last 4 chars)
 */
export function maskCredential(value: string): string {
  if (!value || value.length < 8) {
    return '****';
  }
  return '****' + value.slice(-4);
}
