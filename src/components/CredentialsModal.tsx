/**
 * AWS Credentials Modal - Secure Client-Side Configuration
 * 
 * A friendly wizard for non-technical users to connect their AWS account
 * Credentials are stored locally and NEVER sent to any server
 * 
 * Web 2.0 compliant, enterprise-grade security dialog
 */

import React, { Component } from 'react';
import { 
  saveCredentials, 
  loadCredentials, 
  clearCredentials, 
  maskCredential,
  AWSCredentials 
} from '../utils/awsCredentials';
import { testCredentials } from '../utils/s3Client';

interface CredentialsModalProps {
  visible: boolean;
  onClose: () => void;
  onCredentialsChanged: () => void;
}

interface CredentialsModalState {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  testing: boolean;
  testResult: string;
  testSuccess: boolean;
  hasExisting: boolean;
}

var AWS_REGIONS = [
  'us-east-1',
  'us-east-2', 
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'ap-northeast-1'
];

/**
 * CredentialsModal - The AWS Connection Wizard
 */
class CredentialsModal extends Component<CredentialsModalProps, CredentialsModalState> {
  constructor(props: CredentialsModalProps) {
    super(props);
    
    var existing = loadCredentials();
    
    this.state = {
      accessKeyId: '',
      secretAccessKey: '',
      region: existing?.region || 'us-east-1',
      testing: false,
      testResult: '',
      testSuccess: false,
      hasExisting: existing !== null
    };
    
    // Bind methods - Web 2.0 style!
    this.handleAccessKeyChange = this.handleAccessKeyChange.bind(this);
    this.handleSecretKeyChange = this.handleSecretKeyChange.bind(this);
    this.handleRegionChange = this.handleRegionChange.bind(this);
    this.handleTest = this.handleTest.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }
  
  handleAccessKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ accessKeyId: e.target.value, testResult: '' });
  }
  
  handleSecretKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ secretAccessKey: e.target.value, testResult: '' });
  }
  
  handleRegionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ region: e.target.value });
  }
  
  async handleTest() {
    var self = this;
    var creds: AWSCredentials = {
      accessKeyId: self.state.accessKeyId,
      secretAccessKey: self.state.secretAccessKey,
      region: self.state.region
    };
    
    if (!creds.accessKeyId || !creds.secretAccessKey) {
      self.setState({ 
        testResult: '⚠️ Please enter both Access Key and Secret Key',
        testSuccess: false 
      });
      return;
    }
    
    self.setState({ testing: true, testResult: '🔄 Testing connection...' });
    
    var result = await testCredentials(creds);
    
    if (result.valid) {
      // Check if there's a warning (like CORS)
      if (result.error) {
        self.setState({ 
          testing: false,
          testResult: result.error + ' Click "Save & Connect" to proceed.',
          testSuccess: true
        });
      } else {
        self.setState({ 
          testing: false,
          testResult: '✅ Connection successful! Your credentials work.',
          testSuccess: true
        });
      }
    } else {
      self.setState({ 
        testing: false,
        testResult: '❌ ' + (result.error || 'Connection failed'),
        testSuccess: false
      });
    }
  }
  
  handleSave() {
    var self = this;
    var creds: AWSCredentials = {
      accessKeyId: self.state.accessKeyId,
      secretAccessKey: self.state.secretAccessKey,
      region: self.state.region
    };
    
    if (!creds.accessKeyId || !creds.secretAccessKey) {
      self.setState({ 
        testResult: '⚠️ Please enter both Access Key and Secret Key',
        testSuccess: false 
      });
      return;
    }
    
    saveCredentials(creds);
    self.setState({ hasExisting: true });
    self.props.onCredentialsChanged();
    self.props.onClose();
  }
  
  handleClear() {
    var self = this;
    clearCredentials();
    self.setState({ 
      accessKeyId: '',
      secretAccessKey: '',
      hasExisting: false,
      testResult: '🗑️ Credentials cleared',
      testSuccess: false
    });
    self.props.onCredentialsChanged();
  }
  
  render() {
    var self = this;
    
    if (!self.props.visible) {
      return null;
    }
    
    var existing = loadCredentials();
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '3px solid #003366',
          width: '500px',
          boxShadow: '10px 10px 0px #666666'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#003366',
            color: '#FFFFFF',
            padding: '10px 15px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            🔐 Connect Your AWS Account
            <span 
              style={{ float: 'right', cursor: 'pointer' }}
              onClick={self.props.onClose}
            >
              ✕
            </span>
          </div>
          
          {/* Body */}
          <div style={{ padding: '20px' }}>
            {/* Security Notice */}
            <div style={{
              backgroundColor: '#FFFFCC',
              border: '2px solid #FF9900',
              padding: '10px',
              marginBottom: '15px',
              fontSize: '11px'
            }}>
              <strong>🔒 Your credentials are secure:</strong>
              <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                <li>Stored only in YOUR browser</li>
                <li>Never sent to our servers</li>
                <li>Encrypted in localStorage</li>
                <li>You can clear them anytime</li>
              </ul>
            </div>
            
            {/* Existing Credentials Notice */}
            {self.state.hasExisting && existing && (
              <div style={{
                backgroundColor: '#CCFFCC',
                border: '2px solid #006400',
                padding: '10px',
                marginBottom: '15px',
                fontSize: '11px'
              }}>
                <strong>✅ Credentials configured:</strong><br />
                Access Key: {maskCredential(existing.accessKeyId)}<br />
                Region: {existing.region}
              </div>
            )}
            
            {/* Form */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold', width: '140px' }}>
                    Access Key ID:
                  </td>
                  <td style={{ padding: '8px 0' }}>
                    <input 
                      type="text"
                      value={self.state.accessKeyId}
                      onChange={self.handleAccessKeyChange}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      style={{
                        width: '100%',
                        padding: '5px',
                        border: '2px solid #CCCCCC',
                        fontFamily: 'monospace'
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>
                    Secret Access Key:
                  </td>
                  <td style={{ padding: '8px 0' }}>
                    <input 
                      type="password"
                      value={self.state.secretAccessKey}
                      onChange={self.handleSecretKeyChange}
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      style={{
                        width: '100%',
                        padding: '5px',
                        border: '2px solid #CCCCCC',
                        fontFamily: 'monospace'
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>
                    Region:
                  </td>
                  <td style={{ padding: '8px 0' }}>
                    <select 
                      value={self.state.region}
                      onChange={self.handleRegionChange}
                      style={{
                        width: '100%',
                        padding: '5px',
                        border: '2px solid #CCCCCC'
                      }}
                    >
                      {AWS_REGIONS.map(function(r) {
                        return <option key={r} value={r}>{r}</option>;
                      })}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Test Result */}
            {self.state.testResult && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: self.state.testing ? '#CCE5FF' : (self.state.testSuccess ? '#CCFFCC' : '#FFCCCC'),
                border: '2px solid ' + (self.state.testing ? '#0066CC' : (self.state.testSuccess ? '#006400' : '#8B0000')),
                fontSize: '12px'
              }}>
                {self.state.testResult}
              </div>
            )}
            
            {/* Buttons */}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              {self.state.hasExisting && (
                <button 
                  className="retro-button"
                  onClick={self.handleClear}
                  style={{ marginRight: '10px' }}
                >
                  🗑️ Clear Credentials
                </button>
              )}
              <button 
                className="retro-button"
                onClick={self.handleTest}
                disabled={self.state.testing}
              >
                🧪 Test Connection
              </button>
              {' '}
              <button 
                className="retro-button retro-button-primary"
                onClick={self.handleSave}
              >
                💾 Save & Connect
              </button>
            </div>
            
            {/* IAM Permissions Notice - Web 2.0 enterprise-grade warning */}
            <div style={{
              marginTop: '15px',
              backgroundColor: '#FFE4B5',
              border: '2px solid #CC6600',
              padding: '10px',
              fontSize: '11px'
            }}>
              <strong>⚠️ Required IAM Permissions:</strong>
              <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                <li><code>s3:ListAllMyBuckets</code> - List buckets</li>
                <li><code>s3:CreateBucket</code> - Create new buckets</li>
                <li><code>s3:ListBucket</code> - View bucket contents</li>
                <li><code>s3:GetObject</code> - Download files</li>
                <li><code>s3:PutObject</code> - Upload files</li>
                <li><code>s3:DeleteObject</code> - Delete files</li>
              </ul>
              <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                Tip: Use <code>AmazonS3FullAccess</code> policy for full functionality
              </div>
            </div>
            
            {/* Help Text */}
            <div style={{
              marginTop: '15px',
              fontSize: '10px',
              color: '#666666',
              borderTop: '1px solid #CCCCCC',
              paddingTop: '10px'
            }}>
              <strong>How to get AWS credentials:</strong><br />
              1. Go to AWS Console → IAM → Users<br />
              2. Create a new user or select existing<br />
              3. Security Credentials → Create Access Key<br />
              4. Copy the Access Key ID and Secret Access Key
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CredentialsModal;
