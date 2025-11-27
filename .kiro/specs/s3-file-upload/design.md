# Design Document: S3 File Upload

## Overview

This feature adds file upload capability to the Phantom Console, allowing users to upload files to their S3 buckets without requiring CORS configuration. The design uses a proxy pattern where uploads flow through the Vercel serverless API, which then uploads to S3 using the AWS SDK. This eliminates browser CORS restrictions while maintaining the 2006 aesthetic.

## Architecture

### Upload Flow

```
User Browser → File Selection → Base64 Encoding → Vercel API → AWS SDK → S3 Bucket
     ↓                                                  ↓
  Display UI                                      Return Status
     ↓                                                  ↓
  Show Success/Error ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### Key Design Decisions

1. **Proxy Pattern**: Upload through Vercel API instead of direct presigned URLs
   - Rationale: Avoids CORS preflight requests entirely
   - Trade-off: Slightly higher latency, but eliminates user configuration

2. **Base64 Encoding**: Encode file content for JSON transmission
   - Rationale: Simple, works with existing API structure
   - Trade-off: ~33% size overhead, acceptable for files under 50MB

3. **2006 Patterns**: Use XMLHttpRequest and FileReader with callbacks
   - Rationale: Maintains retro theme consistency
   - Trade-off: More verbose code, but authentic to the era

## Components and Interfaces

### Frontend Components

#### UploadButton Component
- Renders a file input and upload button
- Handles file selection and validation
- Triggers upload process
- Displays status messages

**Props Interface:**
```typescript
interface UploadButtonProps {
  bucketName: string;
  credentials: AWSCredentials;
  onUploadComplete: () => void;
  onUploadError: (error: string) => void;
}
```

**State Interface:**
```typescript
interface UploadButtonState {
  selectedFile: File | null;
  uploading: boolean;
  uploadStatus: string;
  uploadError: string;
}
```

#### BucketContents Component (Modified)
- Add UploadButton component to the header
- Pass bucket name and credentials
- Handle upload completion by refreshing contents

### Backend API

#### POST /api/upload-with-creds (Already Exists)
- Receives: bucketName, fileName, fileContent (base64), credentials
- Decodes base64 content to Buffer
- Gets bucket region
- Uploads to S3 using AWS SDK
- Returns: success status or error

## Data Models

### File Upload Request
```typescript
interface UploadRequest {
  bucketName: string;
  fileName: string;
  fileContent: string; // base64 encoded
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region?: string;
  };
}
```

### File Upload Response
```typescript
interface UploadResponse {
  success: boolean;
  url?: string;
  message?: string;
  error?: {
    code: string;
    message: string;
    service: string;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Upload button visibility
*For any* bucket view state, when the bucket contents are displayed, the upload button should be visible and enabled (unless an upload is in progress)
**Validates: Requirements 1.1**

### Property 2: File selection updates state
*For any* file selected through the file input, the component state should update to reflect the selected file's name and size
**Validates: Requirements 1.3**

### Property 3: Upload disables button
*For any* upload operation in progress, the upload button should be disabled to prevent concurrent uploads
**Validates: Requirements 2.2**

### Property 4: Successful upload refreshes view
*For any* successful upload, the bucket contents should be refreshed to include the newly uploaded file
**Validates: Requirements 1.5**

### Property 5: Failed upload shows error
*For any* failed upload, an error message should be displayed and the upload button should be re-enabled
**Validates: Requirements 2.4, 2.5**

### Property 6: Upload uses proxy endpoint
*For any* file upload, the request should be sent to the Vercel API endpoint, not directly to S3
**Validates: Requirements 3.1, 3.2**

### Property 7: Base64 encoding round-trip
*For any* file content, encoding to base64 then decoding should produce the original content
**Validates: Requirements 4.3, 4.4**

### Property 8: Large file rejection
*For any* file over 50MB, the system should reject the upload and display an error message
**Validates: Requirements 4.5**

### Property 9: XMLHttpRequest usage
*For any* upload request, the implementation should use XMLHttpRequest, not fetch API
**Validates: Requirements 5.3**

### Property 10: FileReader callback pattern
*For any* file reading operation, the implementation should use FileReader with onload callbacks, not Promises
**Validates: Requirements 5.4**

## Error Handling

### Client-Side Errors

1. **No File Selected**: Display message "Please select a file to upload"
2. **File Too Large**: Display message "File exceeds 50MB limit"
3. **No Credentials**: Display message "Please connect AWS credentials first"
4. **Network Error**: Display message "Upload failed: Network error"

### Server-Side Errors

1. **Invalid Credentials**: Return 400 with "AWS credentials are required"
2. **Missing Parameters**: Return 400 with "bucketName, fileName, and fileContent are required"
3. **S3 Upload Failure**: Return 500 with AWS error details
4. **Region Detection Failure**: Fallback to us-east-1

### Error Recovery

- All errors re-enable the upload button
- Error messages are displayed in 2006-style status boxes
- Users can retry immediately after an error

## Testing Strategy

### Unit Tests

1. **UploadButton Component**
   - Test file selection updates state
   - Test upload button disabled during upload
   - Test error message display
   - Test success message display

2. **File Size Validation**
   - Test files under 5MB are accepted
   - Test files over 50MB are rejected
   - Test warning for files 5-50MB

3. **Base64 Encoding**
   - Test encoding produces valid base64
   - Test decoding produces original content

### Property-Based Tests

1. **Property 7: Base64 Round-Trip**
   - Generate random binary data
   - Encode to base64
   - Decode back to binary
   - Verify original === decoded

2. **Property 8: Large File Rejection**
   - Generate files of various sizes
   - Verify files > 50MB are rejected
   - Verify files ≤ 50MB are accepted

### Integration Tests

1. **End-to-End Upload Flow**
   - Select a test file
   - Trigger upload
   - Verify API receives correct data
   - Verify S3 receives file
   - Verify UI updates

2. **Error Scenarios**
   - Test with invalid credentials
   - Test with non-existent bucket
   - Test with network failure

### Testing Framework

- **Unit Tests**: Jest with React Testing Library
- **Property-Based Tests**: fast-check (JavaScript PBT library)
- **Integration Tests**: Playwright or Cypress

## Implementation Notes

### 2006 Compliance

All code must follow the 2006 patterns defined in the steering rules:
- Use `var` instead of `const`/`let`
- Use `function` declarations instead of arrow functions
- Use `XMLHttpRequest` instead of `fetch`
- Use callback patterns instead of Promises
- Use string concatenation instead of template literals

### File Size Considerations

- Files under 5MB: Upload without warning
- Files 5-50MB: Show warning about upload time
- Files over 50MB: Reject with error message

The 50MB limit is chosen because:
1. Vercel serverless functions have payload limits
2. Base64 encoding adds 33% overhead
3. Browser memory constraints in 2006-era code

### Performance Optimizations

1. **Chunked Reading**: Use FileReader to read file in one operation
2. **Region Caching**: Cache bucket regions to avoid repeated lookups
3. **Immediate Feedback**: Show status messages immediately

## Security Considerations

1. **Credential Handling**: Credentials are sent with each request (existing pattern)
2. **File Validation**: Validate file size before upload
3. **Content Type**: Let S3 infer content type from file extension
4. **No Presigned URLs**: Avoid CORS issues by using proxy pattern

## Future Enhancements

1. **Drag and Drop**: Add drag-and-drop file upload
2. **Multiple Files**: Support uploading multiple files at once
3. **Progress Bar**: Add visual progress indicator
4. **Resume Uploads**: Support resuming failed uploads
5. **Folder Upload**: Support uploading entire folders
