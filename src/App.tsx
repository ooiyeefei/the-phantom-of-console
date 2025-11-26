/**
 * The Phantom of the Console - Main Application
 * 
 * Web 2.0 compliant React application
 * Enterprise-grade S3 management with a haunted twist
 * 
 * Remember: In 2006, this is cutting-edge technology!
 */

import React, { Component } from 'react';
import BucketTable from './components/BucketTable';
import GhostAgent from './components/GhostAgent';
import SpookyEffects from './components/SpookyEffects';

// Web 2.0 compliant interface definitions
interface S3Bucket {
  name: string;
  creationDate: string;
  region: string;
}

interface AppState {
  buckets: S3Bucket[];
  loading: boolean;
  error: any;
  audioEnabled: boolean;
  dialupPlayed: boolean;
  ghostMessage: string;
  showGhost: boolean;
  headerBleeding: boolean;
}

/**
 * Main Application Component
 * Using Class Components because that's how React was meant to be used!
 */
class App extends Component<{}, AppState> {
  private dialupAudio: HTMLAudioElement | null = null;
  private hddAudio: HTMLAudioElement | null = null;
  
  constructor(props: {}) {
    super(props);
    this.state = {
      buckets: [],
      loading: false,
      error: null,
      audioEnabled: false,
      dialupPlayed: false,
      ghostMessage: 'I see you\'re using Kiro... but can Vibe Coding save you from the legacy code lurking in these buckets?',
      showGhost: true,
      headerBleeding: false
    };
    
    // Bind methods - no arrow functions in 2006!
    this.loadBuckets = this.loadBuckets.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleUploadClick = this.handleUploadClick.bind(this);
    this.enableAudio = this.enableAudio.bind(this);
    this.playHddSound = this.playHddSound.bind(this);
    this.triggerGhost = this.triggerGhost.bind(this);
    this.triggerBloodHeader = this.triggerBloodHeader.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleGhostSpeak = this.handleGhostSpeak.bind(this);
  }

  
  componentDidMount() {
    // Load buckets on mount
    this.loadBuckets();
  }
  
  /**
   * Enable audio and play dial-up sound ONCE on first interaction
   */
  enableAudio() {
    var self = this;
    if (!self.state.audioEnabled) {
      self.setState({ audioEnabled: true });
      
      // Play dial-up sound only ONCE on first interaction
      if (!self.state.dialupPlayed) {
        self.setState({ dialupPlayed: true });
        self.dialupAudio = new Audio('/sounds/dialup.mp3');
        self.dialupAudio.play().catch(function(e) {
          console.error('Could not play dial-up sound:', e);
        });
      }
    }
  }
  
  /**
   * Play HDD crunch sound for button clicks
   */
  playHddSound() {
    var self = this;
    if (self.state.audioEnabled) {
      self.hddAudio = new Audio('/sounds/hdd-crunch.mp3');
      self.hddAudio.play().catch(function(e) {
        console.error('Could not play HDD sound:', e);
      });
    }
  }
  
  /**
   * Trigger blood header effect
   */
  triggerBloodHeader() {
    var self = this;
    self.setState({ headerBleeding: true });
    setTimeout(function() {
      self.setState({ headerBleeding: false });
    }, 1000);
  }
  
  /**
   * Handle when ghost speaks - trigger glitch
   */
  handleGhostSpeak() {
    // Additional effects when ghost speaks can go here
    this.playHddSound();
  }
  
  /**
   * Load S3 buckets using XMLHttpRequest
   */
  loadBuckets() {
    var self = this;
    self.setState({ loading: true, error: null });
    self.playHddSound();
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          self.setState({ 
            buckets: response.buckets, 
            loading: false 
          });
        } else {
          self.handleError({
            code: 'FetchError',
            message: 'Failed to load buckets. Status: ' + xhr.status,
            service: 'S3'
          });
        }
      }
    };
    xhr.open('GET', '/api/buckets', true);
    xhr.send();
  }
  
  /**
   * Handle upload button click - trigger ghost and blood header
   */
  handleUploadClick(bucketName: string) {
    var self = this;
    self.playHddSound();
    self.triggerBloodHeader();
    self.triggerGhost('upload', 'Whoa there! Uploading to "' + bucketName + '"? In MY day, we used FTP and we LIKED it! Hope you have 4 hours to spare on this 56k connection...');
  }
  
  /**
   * Handle file upload to S3
   */
  handleUpload(bucketName: string, file: File) {
    var self = this;
    
    var formData = new FormData();
    formData.append('file', file);
    formData.append('bucketName', bucketName);
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          if (response.success) {
            self.triggerGhost('success', 'Fine, your file uploaded. But don\'t come crying to me when "the cloud" loses all your data! I\'ve seen things... terrible things in us-east-1.');
            self.loadBuckets();
          } else {
            self.handleError(response.error);
          }
        } else {
          self.handleError({
            code: 'UploadError',
            message: 'Upload failed. Status: ' + xhr.status,
            service: 'S3'
          });
        }
      }
    };
    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
  }
  
  /**
   * Trigger the Ghost Agent with a message
   */
  triggerGhost(trigger: string, message: string) {
    this.setState({ 
      showGhost: true, 
      ghostMessage: message 
    });
  }
  
  /**
   * Handle errors - trigger the horror effects!
   */
  handleError(error: any) {
    var self = this;
    self.setState({ 
      error: error, 
      loading: false 
    });
    self.triggerBloodHeader();
    self.triggerGhost('error', 'ERROR! ' + error.message + ' This is why I miss physical servers. You could KICK them when they misbehaved!');
  }

  
  render() {
    var self = this;
    var headerClass = 'phantom-header' + (self.state.headerBleeding ? ' bleeding' : '');
    
    return (
      <div className="phantom-container" onClick={self.enableAudio}>
        {/* Spooky Effects Layer */}
        <SpookyEffects error={self.state.error} />
        
        {/* Header - AWS Orange Glory (or Blood Red when bleeding) */}
        <header className={headerClass}>
          <h1>👻 Amazon Web Services - S3 Management Console</h1>
          <div className="tagline">Simple Storage Service - Enterprise-Grade Cloud Storage (Beta) | Powered by Kiro</div>
        </header>
        
        {/* Navigation */}
        <nav className="phantom-nav">
          <a href="#buckets">My Buckets</a>
          <a href="#upload">Upload Files</a>
          <a href="#help">Help</a>
          <a href="#about">About S3</a>
        </nav>
        
        {/* Main Content */}
        <main className="phantom-main">
          <div className="section-header">
            📦 Your S3 Buckets
            <button 
              className="retro-button" 
              style={{ float: 'right', marginTop: '-3px' }}
              onClick={function() { self.playHddSound(); self.loadBuckets(); }}
            >
              🔄 Refresh
            </button>
          </div>
          
          {/* Status Messages */}
          {self.state.error && (
            <div className="status-box status-error">
              <strong>⚠️ ERROR:</strong> {self.state.error.message}
              <br />
              <small>Error Code: {self.state.error.code} | Service: {self.state.error.service}</small>
            </div>
          )}
          
          {/* Bucket Table */}
          <BucketTable 
            buckets={self.state.buckets}
            loading={self.state.loading}
            onUpload={self.handleUpload}
            onUploadClick={self.handleUploadClick}
            onRefresh={self.loadBuckets}
          />
          
          {/* Info Box */}
          <div className="status-box status-info">
            <strong>💡 Did you know?</strong> Amazon S3 launched on March 14, 2006. 
            It's the future of storage! No more buying hard drives or managing RAID arrays.
            Just upload your files to "the cloud" and trust that Amazon will keep them safe forever!
            <br /><br />
            <small>🎃 <em>This console is haunted by The Kiro Phantom - a bitter sysadmin from 2006 who hates serverless.</em></small>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="phantom-footer">
          © 2006 Amazon Web Services, Inc. All rights reserved. | 
          <a href="#privacy">Privacy Policy</a> | 
          <a href="#terms">Terms of Service</a> |
          Best viewed in Internet Explorer 6.0 at 1024x768 |
          🎃 Kiroween Hackathon Entry
        </footer>
        
        {/* Ghost Agent - The Kiro Phantom */}
        <GhostAgent 
          visible={self.state.showGhost}
          message={self.state.ghostMessage}
          onClose={function() { self.setState({ showGhost: false }); }}
          onSpeak={self.handleGhostSpeak}
          audioEnabled={self.state.audioEnabled}
        />
      </div>
    );
  }
}

export default App;
