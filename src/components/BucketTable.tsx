/**
 * BucketTable Component - The Heart of the Console
 * 
 * Displays S3 buckets in a proper HTML table
 * Because tables are the professional way to display data!
 * 
 * Web 2.0 compliant, enterprise-grade component
 */

import React, { Component } from 'react';

// Web 2.0 compliant interface
interface S3Bucket {
  name: string;
  creationDate: string;
  region: string;
}

interface BucketTableProps {
  buckets: S3Bucket[];
  loading: boolean;
  onUpload: (bucketName: string, file: File) => void;
  onRefresh: () => void;
  onUploadClick?: (bucketName: string) => void;
  onBrowse?: (bucketName: string) => void;
  onDelete?: (bucketName: string) => void;
  shakeActive?: boolean;
}

interface BucketTableState {
  selectedBucket: string;
  uploadingTo: string;
  shakingDelete: string;
}

/**
 * BucketTable - Enterprise-grade data display
 * Using HTML tables because that's how professionals do it!
 */
class BucketTable extends Component<BucketTableProps, BucketTableState> {
  // File input ref - for triggering file selection
  private fileInputRef: HTMLInputElement | null = null;
  
  constructor(props: BucketTableProps) {
    super(props);
    this.state = {
      selectedBucket: '',
      uploadingTo: '',
      shakingDelete: ''
    };
    
    // Bind methods - no arrow functions in 2006!
    this.handleUploadClick = this.handleUploadClick.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.handleBrowseClick = this.handleBrowseClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
  }
  
  /**
   * Handle delete button click - but we won't actually delete anything!
   * Security first, enterprise-grade protection!
   */
  handleDeleteClick(bucketName: string) {
    var self = this;
    
    // Trigger shake animation
    self.setState({ shakingDelete: bucketName });
    
    // Remove shake after animation completes
    setTimeout(function() {
      self.setState({ shakingDelete: '' });
    }, 600);
    
    if (self.props.onDelete) {
      self.props.onDelete(bucketName);
    }
  }
  
  /**
   * Handle browse button click
   */
  handleBrowseClick(bucketName: string) {
    var self = this;
    if (self.props.onBrowse) {
      self.props.onBrowse(bucketName);
    }
  }
  
  /**
   * Handle upload button click
   */
  handleUploadClick(bucketName: string) {
    var self = this;
    self.setState({ uploadingTo: bucketName });
    
    // Trigger ghost animation and file picker simultaneously
    if (self.props.onUploadClick) {
      self.props.onUploadClick(bucketName);
    }
    
    // Open file picker immediately (no delay)
    if (self.fileInputRef) {
      self.fileInputRef.click();
    }
  }
  
  /**
   * Handle file selection
   */
  handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    var self = this;
    var files = event.target.files;
    if (files && files.length > 0 && self.state.uploadingTo) {
      self.props.onUpload(self.state.uploadingTo, files[0]);
    }
    // Reset the input
    event.target.value = '';
  }

  
  render() {
    var self = this;
    var buckets = self.props.buckets;
    var loading = self.props.loading;
    
    // Loading state
    if (loading) {
      return (
        <div className="loading">
          Loading buckets from Amazon S3
        </div>
      );
    }
    
    // Empty state
    if (!buckets || buckets.length === 0) {
      return (
        <div className="status-box status-info">
          <strong>No buckets found!</strong>
          <br />
          You don't have any S3 buckets yet. Create one using the AWS Console or CLI.
          <br />
          <small>Tip: Bucket names must be globally unique across all of AWS!</small>
        </div>
      );
    }
    
    // Render the folder grid - like Windows XP! User-friendly and visual!
    return (
      <div>
        {/* Hidden file input for uploads */}
        <input 
          type="file"
          ref={function(ref) { self.fileInputRef = ref; }}
          style={{ display: 'none' }}
          onChange={self.handleFileSelect}
        />
        
        {/* Folder grid container - shakes when ghost speaks! */}
        <div className={self.props.shakeActive ? 'shake' : ''} style={{
          padding: '10px'
        }}>
          {buckets.map(function(bucket, index) {
            return (
              <div 
                key={bucket.name + '-' + index}
                style={{
                  width: '200px',
                  background: '#E8E8E8',
                  border: '2px outset #CCCCCC',
                  padding: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'inline-block',
                  verticalAlign: 'top',
                  margin: '0 15px 15px 0'
                }}
                onDoubleClick={function() { self.handleBrowseClick(bucket.name); }}
              >
                {/* Folder icon - big and visual! */}
                <div 
                  style={{ 
                    fontSize: '64px', 
                    marginBottom: '10px',
                    userSelect: 'none'
                  }}
                  onClick={function() { self.handleBrowseClick(bucket.name); }}
                >
                  📁
                </div>
                
                {/* Bucket name - clickable */}
                <div 
                  style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '5px',
                    wordBreak: 'break-word',
                    fontSize: '12px',
                    color: '#003366',
                    cursor: 'pointer'
                  }}
                  onClick={function() { self.handleBrowseClick(bucket.name); }}
                  title={bucket.name}
                >
                  {bucket.name.length > 25 ? bucket.name.substring(0, 22) + '...' : bucket.name}
                </div>
                
                {/* Metadata */}
                <div style={{ 
                  fontSize: '10px', 
                  color: '#666666',
                  marginBottom: '10px'
                }}>
                  {bucket.region}
                  <br />
                  {bucket.creationDate}
                </div>
                
                {/* Action buttons */}
                <div style={{ 
                  textAlign: 'center'
                }}>
                  <button 
                    className="retro-button"
                    onClick={function(e) { 
                      e.stopPropagation();
                      self.handleBrowseClick(bucket.name); 
                    }}
                    style={{ 
                      fontSize: '11px',
                      padding: '3px 8px',
                      marginRight: '5px'
                    }}
                    title="Open folder"
                  >
                    Open
                  </button>
                  <button 
                    className="retro-button"
                    onClick={function(e) { 
                      e.stopPropagation();
                      self.handleUploadClick(bucket.name); 
                    }}
                    style={{ 
                      fontSize: '11px',
                      padding: '3px 8px',
                      marginRight: '5px'
                    }}
                    title="Upload file"
                  >
                    Upload
                  </button>
                  <button 
                    className={'retro-button' + (self.state.shakingDelete === bucket.name ? ' delete-shake' : '')}
                    onClick={function(e) { 
                      e.stopPropagation();
                      self.handleDeleteClick(bucket.name); 
                    }}
                    style={{ 
                      fontSize: '11px',
                      padding: '3px 8px',
                      backgroundColor: '#FFCCCC',
                      color: '#8B0000'
                    }}
                    title="Delete bucket"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer with stats */}
        <div style={{ 
          fontSize: '10px', 
          color: '#666666', 
          textAlign: 'right',
          marginTop: '10px',
          padding: '0 10px'
        }}>
          {buckets.length} folder(s) | 
          Last refreshed: {new Date().toLocaleTimeString()} | 
          💡 Tip: Double-click a folder to open it
        </div>
      </div>
    );
  }
}

export default BucketTable;
