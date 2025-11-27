/**
 * BucketContents Component - Browse Your Cloud Files
 * 
 * Displays files within an S3 bucket in a proper HTML table
 * Like Windows Explorer but for the cloud!
 * 
 * Web 2.0 compliant, enterprise-grade component
 */

import React, { Component } from 'react';

// Web 2.0 compliant interfaces
interface S3Object {
  key: string;
  size: number;
  lastModified: string;
}

interface BucketContentsProps {
  bucketName: string;
  objects: S3Object[];
  loading: boolean;
  onBack: () => void;
  onShare: (key: string) => void;
  onRefresh: () => void;
}

/**
 * BucketContents - Enterprise-grade file browser
 * Using HTML tables because that's how professionals display data!
 */
class BucketContents extends Component<BucketContentsProps> {
  constructor(props: BucketContentsProps) {
    super(props);
    
    // Bind methods - no arrow functions in 2006!
    this.formatFileSize = this.formatFileSize.bind(this);
    this.handleShareClick = this.handleShareClick.bind(this);
  }
  
  /**
   * Format file size from bytes to human-readable format
   * Web 2.0 compliant file size formatting!
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1073741824) {
      return (bytes / 1048576).toFixed(1) + ' MB';
    } else {
      return (bytes / 1073741824).toFixed(1) + ' GB';
    }
  }
  
  /**
   * Handle share button click
   */
  handleShareClick(key: string) {
    var self = this;
    self.props.onShare(key);
  }
  
  render() {
    var self = this;
    var bucketName = self.props.bucketName;
    var objects = self.props.objects;
    var loading = self.props.loading;
    
    // Loading state
    if (loading) {
      return (
        <div className="loading">
          Loading files from {bucketName}...
        </div>
      );
    }
    
    // Empty state
    if (!objects || objects.length === 0) {
      return (
        <div>
          <div className="section-header">
            📁 Bucket: {bucketName}
            <button 
              className="retro-button" 
              style={{ float: 'left', marginTop: '-3px', marginRight: '10px' }}
              onClick={self.props.onBack}
            >
              ⬅️ Back to Buckets
            </button>
          </div>
          <div className="status-box status-info">
            <strong>No files found!</strong>
            <br />
            This bucket is empty. Upload some files to get started!
          </div>
        </div>
      );
    }
    
    // Render the file table - HTML tables are web scale!
    return (
      <div>
        <div className="section-header">
          📁 Bucket: {bucketName}
          <button 
            className="retro-button" 
            style={{ float: 'right', marginTop: '-3px' }}
            onClick={self.props.onRefresh}
          >
            🔄 Refresh
          </button>
          <button 
            className="retro-button" 
            style={{ float: 'left', marginTop: '-3px', marginRight: '10px' }}
            onClick={self.props.onBack}
          >
            ⬅️ Back to Buckets
          </button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>File Name</th>
              <th style={{ width: '15%' }}>Size</th>
              <th style={{ width: '20%' }}>Last Modified</th>
              <th style={{ width: '15%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {objects.map(function(obj, index) {
              return (
                <tr key={obj.key + '-' + index}>
                  <td>
                    📄 {obj.key}
                  </td>
                  <td>{self.formatFileSize(obj.size)}</td>
                  <td>{obj.lastModified}</td>
                  <td>
                    <button 
                      className="retro-button"
                      onClick={function() { self.handleShareClick(obj.key); }}
                      title="Share via Messenger"
                    >
                      ⚡ Share
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Table footer with stats */}
        <div style={{ 
          fontSize: '10px', 
          color: '#666666', 
          textAlign: 'right',
          marginTop: '5px'
        }}>
          Showing {objects.length} file(s)
        </div>
      </div>
    );
  }
}

export default BucketContents;
