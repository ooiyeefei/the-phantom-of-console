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
}

interface BucketTableState {
  selectedBucket: string;
  uploadingTo: string;
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
      uploadingTo: ''
    };
    
    // Bind methods - no arrow functions in 2006!
    this.handleUploadClick = this.handleUploadClick.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
  }
  
  /**
   * Handle upload button click
   */
  handleUploadClick(bucketName: string) {
    var self = this;
    self.setState({ uploadingTo: bucketName });
    
    // Notify parent to trigger ghost (if callback provided)
    if (self.props.onUploadClick) {
      self.props.onUploadClick(bucketName);
    }
    
    // Delay file input to let ghost appear first
    setTimeout(function() {
      if (self.fileInputRef) {
        self.fileInputRef.click();
      }
    }, 1500);
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
    
    // Render the table - HTML tables are web scale!
    return (
      <div>
        {/* Hidden file input for uploads */}
        <input 
          type="file"
          ref={function(ref) { self.fileInputRef = ref; }}
          style={{ display: 'none' }}
          onChange={self.handleFileSelect}
        />
        
        {/* The glorious data table */}
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Bucket Name</th>
              <th style={{ width: '20%' }}>Creation Date</th>
              <th style={{ width: '15%' }}>Region</th>
              <th style={{ width: '25%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map(function(bucket, index) {
              return (
                <tr key={bucket.name + '-' + index}>
                  <td>
                    <a href={'#bucket-' + bucket.name}>
                      📁 {bucket.name}
                    </a>
                  </td>
                  <td>{bucket.creationDate}</td>
                  <td>{bucket.region}</td>
                  <td>
                    <button 
                      className="retro-button"
                      onClick={function() { self.handleUploadClick(bucket.name); }}
                    >
                      📤 Upload
                    </button>
                    {' '}
                    <button className="retro-button">
                      👁️ Browse
                    </button>
                    {' '}
                    <button className="retro-button">
                      ⚙️ Settings
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
          Showing {buckets.length} bucket(s) | 
          Last refreshed: {new Date().toLocaleTimeString()}
        </div>
      </div>
    );
  }
}

export default BucketTable;
