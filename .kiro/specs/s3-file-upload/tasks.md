# Implementation Plan: S3 File Upload

- [ ] 1. Create UploadButton component with file selection
  - Create new component file `src/components/UploadButton.tsx`
  - Implement component class with proper state management (selectedFile, uploading, uploadStatus, uploadError)
  - Add file input element with 2006-style styling
  - Implement file selection handler that updates state with file name and size
  - Add file size validation (reject files > 50MB, warn for files 5-50MB)
  - Use `var` and `function` declarations (no `const`/`let` or arrow functions)
  - _Requirements: 1.1, 1.2, 1.3, 4.2, 4.5, 5.1_

- [ ]* 1.1 Write property test for file selection state update
  - **Property 3: File selection updates state**
  - **Validates: Requirements 1.3**
  - Generate random file metadata (name, size)
  - Simulate file selection
  - Verify component state reflects the selected file

- [ ]* 1.2 Write property test for file size validation
  - **Property 8: Large file rejection**
  - **Validates: Requirements 4.5**
  - Generate files of various sizes (under 5MB, 5-50MB, over 50MB)
  - Verify files > 50MB are rejected with error message
  - Verify files ≤ 50MB are accepted

- [ ] 2. Implement file upload logic with XMLHttpRequest
  - Add upload handler method to UploadButton component
  - Use FileReader API with callback pattern to read file content
  - Encode file content as base64
  - Create XMLHttpRequest to POST to `/api/upload-with-creds`
  - Include bucketName, fileName, fileContent (base64), and credentials in request body
  - Handle upload progress by updating component state
  - Disable upload button while upload is in progress
  - _Requirements: 1.4, 2.2, 3.1, 3.3, 4.3, 5.3, 5.4_

- [ ]* 2.1 Write property test for upload button disabled state
  - **Property 3: Upload disables button**
  - **Validates: Requirements 2.2**
  - For any upload in progress, verify button is disabled
  - Verify button is re-enabled after upload completes or fails

- [ ]* 2.2 Write property test for XMLHttpRequest usage
  - **Property 9: XMLHttpRequest usage**
  - **Validates: Requirements 5.3**
  - Verify upload implementation uses XMLHttpRequest
  - Verify fetch API is not used

- [ ]* 2.3 Write property test for base64 encoding round-trip
  - **Property 7: Base64 encoding round-trip**
  - **Validates: Requirements 4.3, 4.4**
  - Generate random binary data
  - Encode to base64
  - Decode back to binary
  - Verify original === decoded

- [ ] 3. Add upload response handling
  - Implement XMLHttpRequest onload callback for successful responses
  - Implement XMLHttpRequest onerror callback for network errors
  - Parse JSON response from API
  - Update component state with success or error message
  - Call onUploadComplete callback on success
  - Call onUploadError callback on failure
  - Re-enable upload button after completion or error
  - _Requirements: 1.5, 2.3, 2.4, 2.5, 3.4_

- [ ]* 3.1 Write property test for error handling
  - **Property 5: Failed upload shows error**
  - **Validates: Requirements 2.4, 2.5**
  - Simulate various upload failures
  - Verify error message is displayed
  - Verify upload button is re-enabled

- [ ]* 3.2 Write property test for success handling
  - **Property 4: Successful upload refreshes view**
  - **Validates: Requirements 1.5**
  - Mock successful upload
  - Verify onUploadComplete callback is called
  - Verify success message includes file name

- [ ] 4. Add upload UI with 2006 styling
  - Create upload button with retro styling
  - Add file name and size display
  - Add status message area with beveled borders
  - Style success messages with green background
  - Style error messages with red background
  - Use simple text for progress indication (e.g., "Uploading...")
  - Ensure all styling matches existing retro.css patterns
  - _Requirements: 2.1, 5.2, 5.5_

- [ ] 5. Integrate UploadButton into BucketContents component
  - Import UploadButton component
  - Add UploadButton to bucket contents header
  - Pass bucketName prop from BucketContents to UploadButton
  - Pass credentials prop (from App state) to UploadButton
  - Implement onUploadComplete handler that calls onRefresh
  - Implement onUploadError handler that displays error in BucketContents
  - _Requirements: 1.1, 1.5_

- [ ] 6. Update App component to pass credentials to BucketContents
  - Ensure credentials state is passed down to BucketContents component
  - Verify credentials are available when viewing bucket contents
  - Handle case where credentials are not set (show error message)
  - _Requirements: 3.3_

- [ ]* 6.1 Write integration test for end-to-end upload flow
  - Select a test file
  - Trigger upload
  - Verify API receives correct data format
  - Verify UI updates with success message
  - Verify bucket contents refresh

- [ ] 7. Verify API endpoint handles upload correctly
  - Review existing `/api/upload-with-creds` endpoint in `api/index.js`
  - Verify it accepts bucketName, fileName, fileContent (base64), and credentials
  - Verify it decodes base64 content to Buffer
  - Verify it gets bucket region before upload
  - Verify it uploads to S3 using AWS SDK
  - Verify it returns appropriate success or error response
  - Add any missing error handling
  - _Requirements: 3.2, 3.4, 4.4_

- [ ] 8. Add error handling for missing credentials
  - Check if credentials exist before allowing upload
  - Display error message if credentials are not set
  - Disable upload button if credentials are missing
  - Show "Connect AWS" message in upload UI
  - _Requirements: 2.4_

- [ ] 9. Test upload with various file types and sizes
  - Test with small file (< 1MB)
  - Test with medium file (5-10MB)
  - Test with large file (40-50MB)
  - Test with file over 50MB (should be rejected)
  - Test with different file types (images, videos, text, etc.)
  - Verify all uploads complete successfully or show appropriate errors
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
