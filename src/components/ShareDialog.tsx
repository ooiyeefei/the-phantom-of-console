/**
 * ShareDialog Component - 2006 File Sharing
 * 
 * Modal dialog for generating pre-signed URLs with custom expiration
 * Like sharing files on Messenger but with AWS S3!
 * 
 * Web 2.0 compliant, enterprise-grade component
 */

import React, { Component } from 'react';

// Web 2.0 compliant interfaces
interface ShareDialogProps {
  visible: boolean;
  fileName: string;
  bucketName: string;
  fileKey: string;
  onClose: () => void;
  onGenerate: (expiresIn: number) => void;
  generatedUrl?: string;
  loading?: boolean;
}

interface ShareDialogState {
  selectedExpiry: number;
  copySuccess: boolean;
}

/**
 * ShareDialog - Enterprise-grade file sharing modal
 * Using 2006-style modal dialogs with beveled borders!
 */
class ShareDialog extends Component<ShareDialogProps, ShareDialogState> {
  private urlInputRef: HTMLInputElement | null = null;
  
  constructor(props: ShareDialogProps) {
    super(props);
    this.state = {
      selectedExpiry: 3600, // Default to 1 hour
      copySuccess: false
    };
    
    // Bind methods - no arrow functions in 2006!
    this.handleExpiryChange = this.handleExpiryChange.bind(this);
    this.handleGenerate = this.handleGenerate.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
  }
  
  /**
   * Handle expiry dropdown change
   */
  handleExpiryChange(event: React.ChangeEvent<HTMLSelectElement>) {
    var self = this;
    self.setState({ selectedExpiry: parseInt(event.target.value, 10) });
  }
  
  /**
   * Handle generate button click
   */
  handleGenerate() {
    var self = this;
    self.props.onGenerate(self.state.selectedExpiry);
  }
  
  /**
   * Handle copy to clipboard - 2006 style!
   */
  handleCopy() {
    var self = this;
    if (self.urlInputRef) {
      self.urlInputRef.select();
      try {
        // Use the old-school execCommand - Web 2.0 compliant!
        var success = document.execCommand('copy');
        if (success) {
          self.setState({ copySuccess: true });
          // Hide success message after 3 seconds
          setTimeout(function() {
            self.setState({ copySuccess: false });
          }, 3000);
        }
      } catch (err) {
        // Fallback - just select the text
        self.urlInputRef.select();
      }
    }
  }
  
  /**
   * Handle overlay click to close dialog
   */
  handleOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
    var self = this;
    if (event.target === event.currentTarget) {
      self.props.onClose();
    }
  }
  
  render() {
    var self = this;
    
    if (!self.props.visible) {
      return null;
    }
    
    var expiryOptions = [
      { value: 3600, label: '1 hour' },
      { value: 86400, label: '24 hours' },
      { value: 604800, label: '7 days' }
    ];
    
    return (
      <div>
        {/* Overlay */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998
          }}
          onClick={self.handleOverlayClick}
        />
        
        {/* Dialog */}
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#CCCCCC',
            border: '3px outset #999999',
            padding: '20px',
            width: '500px',
            zIndex: 9999,
            fontFamily: 'Verdana, sans-serif'
          }}
        >
          {/* Header */}
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: '#003366',
            fontSize: '14px'
          }}>
            🔗 Share File via Messenger
          </h3>
          
          {/* File name */}
          <div style={{ marginBottom: '15px' }}>
            <strong>File:</strong> {self.props.fileName}
          </div>
          
          {/* Expiry selector */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Link expires in:
            </label>
            <select 
              value={self.state.selectedExpiry}
              onChange={self.handleExpiryChange}
              style={{
                width: '100%',
                padding: '5px',
                border: '2px inset #999999',
                fontFamily: 'Verdana, sans-serif',
                fontSize: '12px'
              }}
            >
              {expiryOptions.map(function(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Generate button */}
          {!self.props.generatedUrl && (
            <div style={{ marginBottom: '15px' }}>
              <button 
                className="retro-button"
                onClick={self.handleGenerate}
                disabled={self.props.loading}
                style={{ width: '100%' }}
              >
                {self.props.loading ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          )}
          
          {/* Generated URL */}
          {self.props.generatedUrl && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Generated URL:
              </label>
              <input 
                ref={function(ref) { self.urlInputRef = ref; }}
                type="text"
                value={self.props.generatedUrl}
                readOnly
                style={{
                  width: '100%',
                  padding: '5px',
                  border: '2px inset #999999',
                  background: 'white',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
          
          {/* Success message */}
          {self.state.copySuccess && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              background: '#90EE90',
              border: '2px solid #006400',
              color: '#006400',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              ✓ URL copied to clipboard! Now paste it in Messenger and send to your buddy!
            </div>
          )}
          
          {/* Action buttons */}
          <div style={{ textAlign: 'right' }}>
            {self.props.generatedUrl && (
              <button 
                className="retro-button"
                onClick={self.handleCopy}
                style={{ marginRight: '10px' }}
              >
                📋 Copy to Clipboard
              </button>
            )}
            <button 
              className="retro-button"
              onClick={self.props.onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ShareDialog;
