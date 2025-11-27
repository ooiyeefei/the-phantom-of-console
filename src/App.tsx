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
import BucketContents from './components/BucketContents';
import ShareDialog from './components/ShareDialog';
import GhostAgent from './components/GhostAgent';
import SpookyEffects from './components/SpookyEffects';
import CredentialsModal from './components/CredentialsModal';
import { hasCredentials } from './utils/awsCredentials';
import { listBucketsClient, listBucketObjectsClient, uploadFileClient, generatePresignedUrlClient, createBucketClient, configureBucketCors, checkBucketCors, uploadLargeFileClient, checkIncompleteUploads, clearIncompleteUpload, abortIncompleteUpload } from './utils/s3Client';

// Web 2.0 compliant interface definitions
interface S3Bucket {
  name: string;
  creationDate: string;
  region: string;
}

interface S3Object {
  key: string;
  size: number;
  lastModified: string;
}

interface AppState {
  currentView: 'bucket-list' | 'bucket-contents';
  selectedBucket: string;
  buckets: S3Bucket[];
  bucketContents: S3Object[];
  loading: boolean;
  loadingContents: boolean;
  error: any;
  audioEnabled: boolean;
  audioMuted: boolean;
  dialupPlayed: boolean;
  ghostMessage: string;
  showGhost: boolean;
  headerBleeding: boolean;
  bloodModeActive: boolean;
  shakeActive: boolean;
  showCredentialsModal: boolean;
  showShareDialog: boolean;
  shareDialogFile: { key: string; bucketName: string };
  shareDialogUrl: string;
  shareDialogLoading: boolean;
  useClientSideAWS: boolean;
  showCreateBucketDialog: boolean;
  newBucketName: string;
  creatingBucket: boolean;
  lastUploadBucket: string;
  configuringCors: boolean;
  uploading: boolean;
  uploadingFileName: string;
  uploadProgress: number;
  showResumeDialog: boolean;
  incompleteUploads: Array<{
    bucketName: string;
    fileName: string;
    progress: number;
    timestamp: number;
    uploadId: string;
    fileSize: number;
  }>;
}

/**
 * Main Application Component
 * Using Class Components because that's how React was meant to be used!
 */
class App extends Component<{}, AppState> {
  private dialupAudio: HTMLAudioElement | null = null;
  private spookyAudio: HTMLAudioElement | null = null;
  private uploadDelayTimer: number | null = null;
  private activeAudioInstances: HTMLAudioElement[] = [];
  
  constructor(props: {}) {
    super(props);
    this.state = {
      currentView: 'bucket-list',
      selectedBucket: '',
      buckets: [],
      bucketContents: [],
      loading: false,
      loadingContents: false,
      error: null,
      audioEnabled: false,
      audioMuted: false,
      dialupPlayed: false,
      ghostMessage: 'I see you\'re using Kiro... but can Vibe Coding save you from the legacy code lurking in these buckets?',
      showGhost: true,
      headerBleeding: false,
      bloodModeActive: false,
      shakeActive: false,
      showCredentialsModal: false,
      showShareDialog: false,
      shareDialogFile: { key: '', bucketName: '' },
      shareDialogUrl: '',
      shareDialogLoading: false,
      useClientSideAWS: hasCredentials(),
      showCreateBucketDialog: false,
      newBucketName: '',
      creatingBucket: false,
      lastUploadBucket: '',
      configuringCors: false,
      uploading: false,
      uploadingFileName: '',
      uploadProgress: 0,
      showResumeDialog: false,
      incompleteUploads: []
    };
    
    // Bind methods - no arrow functions in 2006!
    this.loadBuckets = this.loadBuckets.bind(this);
    this.handleBrowse = this.handleBrowse.bind(this);
    this.handleBackToBuckets = this.handleBackToBuckets.bind(this);
    this.loadBucketContents = this.loadBucketContents.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleUploadClick = this.handleUploadClick.bind(this);
    this.handleOpenShareDialog = this.handleOpenShareDialog.bind(this);
    this.handleCloseShareDialog = this.handleCloseShareDialog.bind(this);
    this.handleGenerateShareLink = this.handleGenerateShareLink.bind(this);
    this.enableAudio = this.enableAudio.bind(this);
    this.playCrunch = this.playCrunch.bind(this);
    this.triggerGhost = this.triggerGhost.bind(this);
    this.triggerBloodHeader = this.triggerBloodHeader.bind(this);
    this.triggerBloodMode = this.triggerBloodMode.bind(this);
    this.triggerShake = this.triggerShake.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleGhostSpeak = this.handleGhostSpeak.bind(this);
    this.openCredentialsModal = this.openCredentialsModal.bind(this);
    this.closeCredentialsModal = this.closeCredentialsModal.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.dismissError = this.dismissError.bind(this);
    this.onCredentialsChanged = this.onCredentialsChanged.bind(this);
    this.openCreateBucketDialog = this.openCreateBucketDialog.bind(this);
    this.closeCreateBucketDialog = this.closeCreateBucketDialog.bind(this);
    this.handleCreateBucket = this.handleCreateBucket.bind(this);
    this.handleNewBucketNameChange = this.handleNewBucketNameChange.bind(this);
    this.handleDeleteBucket = this.handleDeleteBucket.bind(this);
    this.handleConfigureCors = this.handleConfigureCors.bind(this);
    this.handleResumeUpload = this.handleResumeUpload.bind(this);
    this.handleCancelResume = this.handleCancelResume.bind(this);
    this.closeResumeDialog = this.closeResumeDialog.bind(this);
  }
  
  /**
   * Handle delete bucket click - NOT IMPLEMENTED for security!
   * The Phantom protects your data from accidental deletion!
   */
  handleDeleteBucket(bucketName: string) {
    var self = this;
    
    // Play the crunch sound - something is happening!
    self.playCrunch();
    
    // Trigger blood mode - danger zone!
    self.triggerBloodMode();
    
    // Trigger screen shake - the whole UI trembles at the audacity!
    self.triggerShake();
    
    // Pick a random snarky security message
    var messages = [
      'AHA! Nice try, hotshot! You think I\'d let you delete "' + bucketName + '" with a single click? In MY day, we had to fill out 47 forms in triplicate and get approval from 3 VPs just to rename a folder!',
      'WHOA THERE, COWBOY! Delete "' + bucketName + '"? This isn\'t some fly-by-night operation! I\'ve seen junior devs accidentally delete production databases. NOT ON MY WATCH!',
      'DELETE?! "' + bucketName + '"?! Do you have ANY idea how many compliance audits I\'ve survived? This button is purely decorative. Like the "close door" button in elevators.',
      'Ah yes, the DELETE button. I put that there to identify the reckless ones. "' + bucketName + '" stays RIGHT where it is. Consider this a teachable moment about data governance.',
      'ERROR 418: I\'m a teapot, not a data destroyer! "' + bucketName + '" is under MY protection now. Go file a ticket with IT if you want it gone. See you in 6-8 business weeks!',
      'SECURITY ALERT! Someone just tried to delete "' + bucketName + '"! Oh wait, that\'s you. Still no. I\'ve been burned before by "quick cleanups" that turned into "career-ending incidents".'
    ];
    
    var randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Trigger the ghost with the security message
    self.triggerGhost('delete', randomMessage);
  }
  
  /**
   * Handle configure CORS button click - one-click CORS setup!
   * Configures bucket to allow large file uploads
   */
  handleConfigureCors() {
    var self = this;
    var bucketName = self.state.lastUploadBucket;
    
    if (!bucketName) {
      return;
    }
    
    self.setState({ configuringCors: true });
    self.playCrunch();
    self.triggerGhost('cors', 'Configuring CORS on "' + bucketName + '"... In MY day, we had to manually edit XML files and pray to the server gods! You kids have it easy with these fancy APIs!');
    
    configureBucketCors(bucketName).then(function(result) {
      if (result.success) {
        self.setState({ 
          configuringCors: false,
          error: null
        });
        self.triggerGhost('success', 'CORS configured! Now you can upload files larger than 3MB. But remember: with great bandwidth comes great responsibility! Back in my day, we had 56k modems and we LIKED it!');
      } else {
        self.setState({ configuringCors: false });
        self.handleError({
          code: 'CORSConfigError',
          message: result.error || 'Failed to configure CORS',
          service: 'S3'
        });
      }
    });
  }
  
  /**
   * Handle resume upload - show file picker to re-select the file
   * TRUE RESUME using S3 multipart upload API!
   */
  handleResumeUpload(bucketName: string, fileName: string) {
    var self = this;
    
    self.playCrunch();
    self.triggerBloodMode();
    
    // Create file input to let user re-select the file
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    
    fileInput.onchange = function(e) {
      var target = e.target as HTMLInputElement;
      var file = target.files?.[0];
      
      if (!file) {
        return;
      }
      
      // Verify it's the same file
      if (file.name !== fileName) {
        self.handleError({
          code: 'WrongFile',
          message: 'Wrong file selected! Expected "' + fileName + '" but got "' + file.name + '". Please select the correct file to resume the upload.',
          service: 'S3'
        });
        return;
      }
      
      // Close the resume dialog
      self.setState({ showResumeDialog: false });
      
      // Trigger resume ghost message
      var resumeMessages = [
        '🎃 RESUMING UPLOAD! I saved your progress in localStorage! We\'ll skip the parts you already uploaded. This is REAL 2006 technology - S3 multipart uploads! Revolutionary!',
        '👻 ALRIGHT! Re-reading the file and resuming from where you left off! In MY day, we had to start from ZERO! You\'re lucky I implemented TRUE multipart resume!',
        '💀 FINE! Resuming your upload. S3 remembers which parts you uploaded! Back in 2006, this was cutting-edge! Now DON\'T REFRESH AGAIN!',
        '🕸️ RESUMING! I\'ll skip the chunks you already uploaded and only send the missing parts. This is how REAL uploads work! Keep the tab open this time!'
      ];
      var randomMsg = resumeMessages[Math.floor(Math.random() * resumeMessages.length)];
      self.triggerGhost('resume', randomMsg);
      
      // Start the upload (it will automatically resume)
      self.handleUpload(bucketName, file);
      
      // Clean up
      document.body.removeChild(fileInput);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
  }
  
  /**
   * Handle cancel resume - abort the multipart upload on S3
   */
  handleCancelResume(bucketName: string, fileName: string) {
    var self = this;
    
    self.playCrunch();
    
    // Find the upload to get the uploadId
    var upload = self.state.incompleteUploads.find(function(u) {
      return u.bucketName === bucketName && u.fileName === fileName;
    });
    
    if (upload) {
      // Abort the multipart upload on S3
      abortIncompleteUpload(bucketName, fileName, upload.uploadId).then(function(result) {
        if (result.success) {
          var cancelMessages = [
            '💀 CANCELLED! I aborted the multipart upload on S3. All those parts... DELETED! In MY day, we didn\'t get do-overs! You uploaded it right the first time or you didn\'t upload at all!',
            '👻 FINE! Throwing away your progress AND cleaning up S3! Hope you\'re happy! Back in 2006, bandwidth was EXPENSIVE! You just wasted precious kilobytes!',
            '🎃 UPLOAD ABORTED! All that progress... GONE! I even told S3 to delete the parts! In MY day, we cherished every byte we uploaded! Kids these days have no respect for bandwidth!'
          ];
          var randomMsg = cancelMessages[Math.floor(Math.random() * cancelMessages.length)];
          self.triggerGhost('cancel', randomMsg);
        } else {
          self.handleError({
            code: 'AbortError',
            message: result.error || 'Failed to abort upload',
            service: 'S3'
          });
        }
      });
    }
    
    // Remove from state
    var updatedUploads = self.state.incompleteUploads.filter(function(upload) {
      return !(upload.bucketName === bucketName && upload.fileName === fileName);
    });
    
    self.setState({ incompleteUploads: updatedUploads });
    
    if (updatedUploads.length === 0) {
      self.setState({ showResumeDialog: false });
    }
  }
  
  /**
   * Close resume dialog
   */
  closeResumeDialog() {
    this.setState({ showResumeDialog: false });
  }

  
  componentDidMount() {
    var self = this;
    
    // Check for incomplete chunked uploads that can be resumed
    var incompleteUploads = checkIncompleteUploads();
    if (incompleteUploads.length > 0) {
      self.setState({ 
        incompleteUploads: incompleteUploads,
        showResumeDialog: true 
      });
      
      // Trigger ghost with resume message
      var ghostMessages = [
        '👻 WHOA! I found ' + incompleteUploads.length + ' incomplete upload(s)! You refreshed the page, didn\'t you? But I SAVED YOUR PROGRESS using S3 multipart API! Re-select the file to resume! This is REAL 2006 technology!',
        '🎃 AHA! Caught you red-handed! You refreshed during an upload! But I\'m not mad... I saved your UploadId and ETags! Re-select the file and I\'ll skip the parts you already uploaded! Revolutionary!',
        '💀 BUSTED! You interrupted ' + incompleteUploads.length + ' upload(s)! But I implemented TRUE multipart resume! In MY day, we had to start from ZERO! You\'re lucky I\'m using cutting-edge S3 APIs!',
        '🕸️ WELL WELL WELL! Look who refreshed the page during an upload! But I saved your progress in localStorage! Re-select the file to resume. This is how REAL uploads work in 2006!'
      ];
      var randomMsg = ghostMessages[Math.floor(Math.random() * ghostMessages.length)];
      self.triggerGhost('resume', randomMsg);
    }
    
    // Clean up old simple upload tracking (legacy)
    var interruptedUpload = localStorage.getItem('phantom_upload_in_progress');
    if (interruptedUpload) {
      localStorage.removeItem('phantom_upload_in_progress');
    }
    
    // Developer Easter Egg - The Phantom is watching!
    console.log(
      "%c 🎃 THE PHANTOM CONSOLE IS WATCHING YOU 🎃",
      "font-size: 24px; color: orange; background: black; border: 2px solid red;"
    );
    
    // Play spooky Halloween background sound on page load - the ghost is awakening!
    self.spookyAudio = new Audio('/sounds/halloween-spooky.mp3');
    self.spookyAudio.volume = 0.3; // Spooky but not too loud
    self.spookyAudio.loop = true; // Loop the background music
    self.spookyAudio.play().catch(function(e) {
      // Browser blocked autoplay - fail silently, this is expected
      console.warn('Autoplay blocked (expected):', e);
    });
    self.setState({ audioEnabled: true });
    
    // Only load buckets if credentials are configured
    if (this.state.useClientSideAWS) {
      this.loadBuckets();
    }
  }
  
  /**
   * Cleanup timers on unmount - Web 2.0 memory management!
   */
  componentWillUnmount() {
    var self = this;
    if (self.uploadDelayTimer) {
      clearTimeout(self.uploadDelayTimer);
    }
  }
  
  /**
   * Enable audio on first interaction
   */
  enableAudio() {
    var self = this;
    if (!self.state.audioEnabled) {
      self.setState({ audioEnabled: true });
    }
  }
  
  /**
   * Play dialup sound when connecting to AWS
   */
  playDialupSound() {
    var self = this;
    if (!self.state.dialupPlayed) {
      self.setState({ dialupPlayed: true });
      self.dialupAudio = new Audio('/sounds/dialup.mp3');
      self.dialupAudio.play().catch(function(e) {
        console.error('Could not play dial-up sound:', e);
      });
    }
  }
  

  /**
   * Play crunch sound - creates new instance for overlapping sounds
   * Web 2.0 compliant audio engine!
   */
  playCrunch() {
    var self = this;
    if (self.state.audioMuted) return;
    var audio = new Audio('/sounds/hdd-crunch.mp3');
    audio.volume = 0.5;
    
    // Track this audio instance so we can stop it if muted
    self.activeAudioInstances.push(audio);
    
    // Remove from tracking when it ends
    audio.addEventListener('ended', function() {
      var index = self.activeAudioInstances.indexOf(audio);
      if (index > -1) {
        self.activeAudioInstances.splice(index, 1);
      }
    });
    
    audio.play().catch(function(e) {
      console.error('Could not play crunch sound:', e);
    });
  }
  
  /**
   * Toggle audio mute - IMMEDIATELY stops all audio!
   */
  toggleMute() {
    var self = this;
    var newMuted = !self.state.audioMuted;
    self.setState({ audioMuted: newMuted });
    
    // Stop ALL currently playing audio immediately
    if (newMuted) {
      if (self.dialupAudio) {
        self.dialupAudio.pause();
        self.dialupAudio.currentTime = 0;
      }

      if (self.spookyAudio) {
        self.spookyAudio.pause();
        self.spookyAudio.currentTime = 0;
      }
      
      // Stop all active audio instances (crunch sounds, etc.)
      for (var i = 0; i < self.activeAudioInstances.length; i++) {
        var audio = self.activeAudioInstances[i];
        audio.pause();
        audio.currentTime = 0;
      }
      self.activeAudioInstances = [];
    }
  }
  
  /**
   * Dismiss error message
   */
  dismissError() {
    this.setState({ error: null });
  }
  
  /**
   * Trigger blood header effect (legacy - kept for compatibility)
   */
  triggerBloodHeader() {
    var self = this;
    self.setState({ headerBleeding: true });
    setTimeout(function() {
      self.setState({ headerBleeding: false });
    }, 1000);
  }
  
  /**
   * Trigger blood mode - the REAL horror effect with drip!
   * Delays file picker by 1.5s so judges see the animation
   */
  triggerBloodMode() {
    var self = this;
    self.setState({ bloodModeActive: true });
    
    // Remove blood mode after 2 seconds
    setTimeout(function() {
      self.setState({ bloodModeActive: false });
    }, 2000);
  }
  
  /**
   * Open credentials modal
   */
  openCredentialsModal() {
    this.setState({ showCredentialsModal: true });
  }
  
  /**
   * Close credentials modal
   */
  closeCredentialsModal() {
    this.setState({ showCredentialsModal: false });
  }
  
  /**
   * Handle credentials change - reload buckets
   */
  onCredentialsChanged() {
    var self = this;
    self.playDialupSound(); // Play dialup when connecting to AWS!
    self.setState({ useClientSideAWS: hasCredentials() }, function() {
      // Load buckets after state is updated
      self.loadBuckets();
    });
  }
  
  /**
   * Open create bucket dialog - Web 2.0 bucket creation wizard!
   */
  openCreateBucketDialog() {
    var self = this;
    if (!self.state.useClientSideAWS) {
      self.triggerGhost('error', 'You need to connect your AWS credentials first! Click "Connect AWS" to add your credentials. In MY day, we had to physically walk to the data center!');
      return;
    }
    self.playCrunch();
    self.setState({ showCreateBucketDialog: true, newBucketName: '' });
  }
  
  /**
   * Close create bucket dialog
   */
  closeCreateBucketDialog() {
    this.setState({ showCreateBucketDialog: false, newBucketName: '' });
  }
  
  /**
   * Handle new bucket name input change
   */
  handleNewBucketNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ newBucketName: e.target.value });
  }
  
  /**
   * Handle create bucket - enterprise-grade bucket provisioning!
   */
  handleCreateBucket() {
    var self = this;
    var bucketName = self.state.newBucketName.trim().toLowerCase();
    
    // Validate bucket name - S3 has strict naming rules!
    if (!bucketName) {
      self.handleError({
        code: 'InvalidBucketName',
        message: 'Bucket name cannot be empty!',
        service: 'S3'
      });
      return;
    }
    
    if (bucketName.length < 3 || bucketName.length > 63) {
      self.handleError({
        code: 'InvalidBucketName',
        message: 'Bucket name must be between 3 and 63 characters!',
        service: 'S3'
      });
      return;
    }
    
    if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(bucketName)) {
      self.handleError({
        code: 'InvalidBucketName',
        message: 'Bucket name must start and end with a letter or number, and can only contain lowercase letters, numbers, hyphens, and periods!',
        service: 'S3'
      });
      return;
    }
    
    self.setState({ creatingBucket: true });
    self.playCrunch();
    self.triggerBloodMode(); // Trigger the blood drip effect!
    self.triggerGhost('create', 'Creating a NEW bucket? In MY day, we had to requisition storage from the IT department and wait 6-8 weeks! Kids these days have it too easy...');
    
    createBucketClient(bucketName).then(function(result) {
      if (result.success) {
        self.setState({ 
          creatingBucket: false, 
          showCreateBucketDialog: false,
          newBucketName: ''
        });
        self.triggerGhost('success', 'Bucket "' + bucketName + '" created! That\'s ' + (Math.random() * 100).toFixed(0) + ' terabytes of storage you\'ll probably never use. Back in my day, we had 1.44MB floppy disks and we were GRATEFUL!');
        self.loadBuckets();
      } else {
        self.setState({ creatingBucket: false });
        self.handleError({
          code: 'CreateBucketError',
          message: result.error || 'Failed to create bucket',
          service: 'S3'
        });
      }
    });
  }
  
  /**
   * Trigger shake effect on the table
   * When the ghost speaks, the whole UI trembles!
   */
  triggerShake() {
    var self = this;
    self.setState({ shakeActive: true });
    
    setTimeout(function() {
      self.setState({ shakeActive: false });
    }, 500);
  }
  
  /**
   * Handle when ghost speaks - trigger glitch and shake!
   */
  handleGhostSpeak() {
    // Trigger shake effect when ghost speaks
    this.triggerShake();
    this.playCrunch();
  }
  
  /**
   * Load S3 buckets - uses client-side AWS if credentials configured
   */
  loadBuckets() {
    var self = this;
    self.setState({ loading: true, error: null });
    
    // Use client-side AWS SDK if credentials are configured
    if (self.state.useClientSideAWS) {
      listBucketsClient().then(function(result) {
        if (result.error) {
          self.handleError({
            code: 'AWSError',
            message: result.error,
            service: 'S3'
          });
        } else {
          self.setState({ 
            buckets: result.buckets, 
            loading: false 
          });
        }
      });
      return;
    }
    
    // Fallback to server-side (demo mode)
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
   * Handle upload button click - trigger blood mode and ghost!
   * CRITICAL: 1.5s delay before file picker so judges see the animation
   */
  handleUploadClick(bucketName: string) {
    var self = this;
    
    // Play crunch sound immediately
    self.playCrunch();
    
    // Trigger blood mode (the header turns red and drips!)
    self.triggerBloodMode();
    
    // Trigger the ghost with upload message
    self.triggerGhost('upload', 'Whoa there! Uploading to "' + bucketName + '"? In MY day, we used FTP and we LIKED it! Hope you have 4 hours to spare on this 56k connection...');
  }
  
  /**
   * Handle browse button click - navigate to bucket contents view
   */
  handleBrowse(bucketName: string) {
    var self = this;
    self.playCrunch();
    self.setState({ 
      selectedBucket: bucketName,
      currentView: 'bucket-contents'
    });
    self.loadBucketContents(bucketName);
  }
  
  /**
   * Handle back to buckets button - return to bucket list view
   */
  handleBackToBuckets() {
    var self = this;
    self.playCrunch();
    self.setState({ 
      currentView: 'bucket-list',
      selectedBucket: '',
      bucketContents: []
    });
  }
  
  /**
   * Load bucket contents - list files in a bucket
   */
  loadBucketContents(bucketName: string) {
    var self = this;
    self.setState({ loadingContents: true, error: null });
    
    // Use client-side AWS SDK if credentials are configured
    if (self.state.useClientSideAWS) {
      listBucketObjectsClient(bucketName).then(function(result) {
        if (result.error) {
          self.handleError({
            code: 'AWSError',
            message: result.error,
            service: 'S3'
          });
          self.setState({ loadingContents: false });
        } else {
          self.setState({ 
            bucketContents: result.objects, 
            loadingContents: false 
          });
        }
      });
      return;
    }
    
    // Fallback to server-side (demo mode)
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          self.setState({ 
            bucketContents: response.objects, 
            loadingContents: false 
          });
        } else {
          self.handleError({
            code: 'FetchError',
            message: 'Failed to load bucket contents. Status: ' + xhr.status,
            service: 'S3'
          });
          self.setState({ loadingContents: false });
        }
      }
    };
    xhr.open('GET', '/api/buckets/' + bucketName + '/objects', true);
    xhr.send();
  }
  
  /**
   * Handle open share dialog
   */
  handleOpenShareDialog(key: string) {
    var self = this;
    self.setState({
      showShareDialog: true,
      shareDialogFile: { key: key, bucketName: self.state.selectedBucket },
      shareDialogUrl: '',
      shareDialogLoading: false
    });
  }
  
  /**
   * Handle close share dialog
   */
  handleCloseShareDialog() {
    var self = this;
    self.setState({
      showShareDialog: false,
      shareDialogUrl: '',
      shareDialogLoading: false
    });
  }
  
  /**
   * Handle generate share link with custom expiration
   */
  handleGenerateShareLink(expiresIn: number) {
    var self = this;
    
    // Trigger blood mode - the horror of sharing files!
    self.triggerBloodMode();
    
    // Set loading state
    self.setState({ shareDialogLoading: true });
    
    // Trigger the ghost with IAM insult
    self.triggerGhost('share', 'I\'m generating a temporary link because you clearly don\'t understand IAM Policies.');
    
    // Wait for ghost to appear, then make the API call
    setTimeout(function() {
      // Use client-side AWS SDK if credentials are configured
      if (self.state.useClientSideAWS) {
        generatePresignedUrlClient(
          self.state.shareDialogFile.bucketName,
          self.state.shareDialogFile.key,
          expiresIn
        ).then(function(result) {
          if (result.url) {
            self.setState({ 
              shareDialogUrl: result.url,
              shareDialogLoading: false
            });
          } else if (result.error) {
            self.handleError({
              code: 'ShareError',
              message: result.error,
              service: 'S3'
            });
            self.setState({ shareDialogLoading: false });
          }
        });
        return;
      }
      
      // Fallback to server-side (demo mode)
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.url) {
              self.setState({ 
                shareDialogUrl: response.url,
                shareDialogLoading: false
              });
            } else if (response.error) {
              self.handleError(response.error);
              self.setState({ shareDialogLoading: false });
            }
          } else {
            self.handleError({
              code: 'ShareError',
              message: 'Failed to generate share link. Status: ' + xhr.status,
              service: 'S3'
            });
            self.setState({ shareDialogLoading: false });
          }
        }
      };
      xhr.open('POST', '/api/share', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ 
        bucketName: self.state.shareDialogFile.bucketName, 
        key: self.state.shareDialogFile.key,
        expiresIn: expiresIn
      }));
    }, 1500);
  }
  
  /**
   * Handle file upload to S3 - uses client-side if credentials configured
   */
  handleUpload(bucketName: string, file: File) {
    var self = this;
    
    // Store bucket name for CORS configuration
    self.setState({ lastUploadBucket: bucketName });
    
    // Use client-side AWS SDK if credentials are configured
    if (self.state.useClientSideAWS) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Check file size first
        var maxSize = 3 * 1024 * 1024; // 3MB
        if (arrayBuffer.byteLength > maxSize) {
          // File is too large - check if CORS is configured
          self.setState({ uploading: true, uploadingFileName: file.name });
          
          checkBucketCors(bucketName).then(function(corsResult) {
            if (corsResult.configured) {
              // CORS is configured - use presigned URL upload for large files
              var uploadMessages = [
                '👻 SUMMONING THE SPIRITS OF S3! Your file is being teleported through the haunted cloud... DON\'T REFRESH THE PAGE or the spirits will DROP YOUR FILE! In MY day, we had to physically MAIL floppy disks!',
                '🎃 BEWARE! Your file is crossing into the SHADOW REALM! Keep this tab open or the upload DIES! Back in 2006, we uploaded files via CARRIER PIGEON and we were GRATEFUL!',
                '💀 The GHOST OF BANDWIDTH PAST is carrying your bytes! DON\'T CLOSE THIS TAB! In MY day, we had 56k modems and uploading a photo took HOURS! We knew better than to refresh!',
                '🕸️ Your file is being HAUNTED into the cloud! STAY ON THIS PAGE! In MY day, we had to split files into 1.44MB chunks and pray the connection didn\'t drop!',
                '⚰️ UPLOADING FROM BEYOND THE GRAVE! Keep this window open or face the WRATH of interrupted uploads! Back in MY day, we used dial-up and ONE phone call would KILL the connection!'
              ];
              var randomUploadMsg = uploadMessages[Math.floor(Math.random() * uploadMessages.length)];
              self.triggerGhost('upload', randomUploadMsg);
              
              // Upload with progress tracking
              uploadLargeFileClient(bucketName, file.name, arrayBuffer, function(progress) {
                // Update progress bar
                self.setState({ uploadProgress: progress.percentage });
              }).then(function(result) {
                self.setState({ uploading: false, uploadingFileName: '', uploadProgress: 0 });
                
                if (result.success) {
                  var successMessages = [
                    '🎃 SUCCESS! The spirits have delivered your file to the cloud! That would have taken 3 DAYS on a 56k modem and cost you $47 in AOL minutes! Kids these days don\'t know how good they have it!',
                    '👻 SPOOKTACULAR! Your file has been successfully HAUNTED into S3! In MY day, we had to wait for files to upload while fighting off Y2K bugs and praying the phone line didn\'t disconnect!',
                    '💀 THE RITUAL IS COMPLETE! Your file now rests in the eternal cloud! Back in 2006, this would have required 3 burnt CDs, 2 USB drives, and a blood sacrifice to the IT department!',
                    '🕸️ BEWITCHED AND UPLOADED! The ghost of bandwidth past is impressed! In MY day, we uploaded files via FTP and had to manually type in 47-character passwords while standing on one leg!',
                    '⚰️ RISEN FROM THE DIGITAL GRAVE! Your file is now immortal in S3! That would have taken WEEKS on dial-up and we had to upload uphill BOTH WAYS in the snow!'
                  ];
                  var randomSuccessMsg = successMessages[Math.floor(Math.random() * successMessages.length)];
                  self.triggerGhost('success', randomSuccessMsg);
                  // Refresh bucket list to show the new file
                  self.loadBuckets();
                } else {
                  // Check if it's a CORS error
                  var isCorsError = result.error && result.error.startsWith('CORS_ERROR:');
                  
                  if (isCorsError) {
                    // CORS error - offer to reconfigure
                    self.handleError({
                      code: 'CORSError',
                      message: 'CORS configuration is outdated or incomplete. The bucket needs updated CORS settings for multipart uploads. Click "Reconfigure CORS" below to fix this.',
                      service: 'S3'
                    });
                  } else {
                    self.handleError({
                      code: 'UploadError',
                      message: result.error || 'Upload failed',
                      service: 'S3'
                    });
                  }
                }
              });
            } else {
              // CORS not configured - show error with config button
              self.setState({ uploading: false, uploadingFileName: '' });
              self.triggerGhost('error', 'WHOA THERE! That file is TOO BIG for our serverless function! Files must be under 3MB. In MY day, we had 1.44MB floppy disks and we were GRATEFUL!');
              self.handleError({
                code: 'FileTooLarge',
                message: 'File is too large (' + (arrayBuffer.byteLength / 1024 / 1024).toFixed(1) + ' MB). Maximum size is 3 MB due to serverless function limits.',
                service: 'S3'
              });
            }
          });
          return;
        }
        
        // File is small enough - use API proxy
        uploadFileClient(bucketName, file.name, arrayBuffer).then(function(result) {
          if (result.success) {
            self.triggerGhost('success', 'Fine, your file uploaded. But don\'t come crying to me when "the cloud" loses all your data! I\'ve seen things... terrible things in us-east-1.');
            self.loadBuckets();
          } else {
            self.handleError({
              code: 'UploadError',
              message: result.error || 'Upload failed',
              service: 'S3'
            });
          }
        });
      };
      reader.readAsArrayBuffer(file);
      return;
    }
    
    // Fallback to server-side (demo mode)
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
    var headerClass = 'phantom-header';
    if (self.state.bloodModeActive) {
      headerClass = headerClass + ' blood-mode';
    } else if (self.state.headerBleeding) {
      headerClass = headerClass + ' bleeding';
    }
    
    return (
      <div className="phantom-container" onClick={self.enableAudio}>
        {/* CRT Overlay - Dying hardware simulation */}
        <div className="crt-overlay"></div>
        
        {/* Spooky Effects Layer */}
        <SpookyEffects error={self.state.error} />
        
        {/* Blood Drip Effect - Thick blood dripping from top! */}
        {self.state.bloodModeActive && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden'
          }}>
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].map(function(i) {
              var leftPos = (i * 4) + (Math.random() * 3);
              var delay = Math.random() * 1;
              
              return (
                <div 
                  key={i} 
                  className="blood-drip-drop" 
                  style={{ 
                    left: leftPos + '%', 
                    animationDelay: delay + 's'
                  }} 
                />
              );
            })}
          </div>
        )}
        
        {/* Credentials Modal */}
        <CredentialsModal 
          visible={self.state.showCredentialsModal}
          onClose={self.closeCredentialsModal}
          onCredentialsChanged={self.onCredentialsChanged}
        />
        
        {/* Create Bucket Dialog - Web 2.0 bucket provisioning wizard! */}
        {self.state.showCreateBucketDialog && (
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
              width: '450px',
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
                ➕ Create New S3 Bucket
                <span 
                  style={{ float: 'right', cursor: 'pointer' }}
                  onClick={self.closeCreateBucketDialog}
                >
                  ✕
                </span>
              </div>
              
              {/* Body */}
              <div style={{ padding: '20px' }}>
                {/* Info Notice */}
                <div style={{
                  backgroundColor: '#E6F3FF',
                  border: '2px solid #0066CC',
                  padding: '10px',
                  marginBottom: '15px',
                  fontSize: '11px'
                }}>
                  <strong>📦 S3 Bucket Naming Rules:</strong>
                  <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                    <li>Must be globally unique across ALL of AWS</li>
                    <li>3-63 characters long</li>
                    <li>Lowercase letters, numbers, hyphens, periods only</li>
                    <li>Must start and end with letter or number</li>
                  </ul>
                </div>
                
                {/* Bucket Name Input */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                    Bucket Name:
                  </label>
                  <input 
                    type="text"
                    value={self.state.newBucketName}
                    onChange={self.handleNewBucketNameChange}
                    placeholder="my-awesome-bucket-2006"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid #CCCCCC',
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}
                    disabled={self.state.creatingBucket}
                  />
                </div>
                
                {/* Buttons */}
                <div style={{ textAlign: 'right' }}>
                  <button 
                    className="retro-button"
                    onClick={self.closeCreateBucketDialog}
                    disabled={self.state.creatingBucket}
                    style={{ marginRight: '10px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="retro-button retro-button-primary"
                    onClick={self.handleCreateBucket}
                    disabled={self.state.creatingBucket || !self.state.newBucketName.trim()}
                  >
                    {self.state.creatingBucket ? '⏳ Creating...' : '➕ Create Bucket'}
                  </button>
                </div>
                
                {/* Help Text */}
                <div style={{
                  marginTop: '15px',
                  fontSize: '10px',
                  color: '#666666',
                  borderTop: '1px solid #CCCCCC',
                  paddingTop: '10px'
                }}>
                  <strong>💡 Tip:</strong> Bucket will be created in your configured region. 
                  S3 bucket names are globally unique - if someone else has the name, you'll need to pick another!
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Resume Upload Dialog - 2006-style chunked upload recovery! */}
        {self.state.showResumeDialog && self.state.incompleteUploads.length > 0 && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '5px solid #FF6600',
              width: '550px',
              boxShadow: '0 0 30px rgba(255, 102, 0, 0.8), 10px 10px 0px #666666'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #FF6600 0%, #FF9900 100%)',
                color: '#FFFFFF',
                padding: '15px 20px',
                fontWeight: 'bold',
                fontSize: '16px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                👻 INCOMPLETE UPLOADS DETECTED!
                <span 
                  style={{ float: 'right', cursor: 'pointer', fontSize: '20px' }}
                  onClick={self.closeResumeDialog}
                >
                  ✕
                </span>
              </div>
              
              {/* Body */}
              <div style={{ padding: '20px' }}>
                {/* Spooky Notice */}
                <div style={{
                  backgroundColor: '#E6F3FF',
                  border: '3px solid #0066CC',
                  padding: '15px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  🎃 INCOMPLETE MULTIPART UPLOAD DETECTED! 🎃
                  <br />
                  <small style={{ fontWeight: 'normal', marginTop: '5px', display: 'block' }}>
                    You refreshed during upload! But I saved your progress using S3 multipart API!
                    <br />
                    Re-select the file to resume - I'll skip the parts you already uploaded!
                  </small>
                </div>
                
                {/* List of incomplete uploads */}
                {self.state.incompleteUploads.map(function(upload, index) {
                  return (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: '#F5F5F5',
                        border: '2px solid #CCCCCC',
                        padding: '15px',
                        marginBottom: '15px'
                      }}
                    >
                      <div style={{ marginBottom: '10px' }}>
                        <strong>📁 File:</strong> {upload.fileName}
                        <br />
                        <strong>🪣 Bucket:</strong> {upload.bucketName}
                        <br />
                        <strong>📊 Progress:</strong> {upload.progress}% complete
                      </div>
                      
                      {/* Progress bar */}
                      <div style={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#CCCCCC',
                        border: '2px inset #999999',
                        marginBottom: '10px'
                      }}>
                        <div style={{
                          width: upload.progress + '%',
                          height: '100%',
                          backgroundColor: '#FF6600',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      
                      {/* Action buttons */}
                      <div style={{ textAlign: 'right' }}>
                        <button 
                          className="retro-button"
                          onClick={function() { self.handleCancelResume(upload.bucketName, upload.fileName); }}
                          style={{ marginRight: '10px' }}
                        >
                          🗑️ Cancel & Start Fresh
                        </button>
                        <button 
                          className="retro-button retro-button-primary"
                          onClick={function() { self.handleResumeUpload(upload.bucketName, upload.fileName); }}
                          style={{ padding: '10px 20px', fontSize: '14px' }}
                        >
                          ▶️ Resume Upload (Select File)
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Help Text */}
                <div style={{
                  marginTop: '15px',
                  fontSize: '11px',
                  color: '#666666',
                  borderTop: '1px solid #CCCCCC',
                  paddingTop: '10px',
                  fontStyle: 'italic'
                }}>
                  💡 <strong>2006 Technology:</strong> TRUE resumable uploads using S3 multipart API!
                  I saved your UploadId and ETags in localStorage. When you re-select the file,
                  I'll skip the parts you already uploaded! Back in MY day, this was cutting-edge!
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Header - AWS Orange Glory (or Blood Red when bleeding) */}
        <header className={headerClass}>
          <h1 style={{ display: 'inline-block' }}>👻 The Phantom of the Console</h1>
          <button 
            className="retro-button"
            style={{ 
              float: 'right', 
              marginTop: '5px',
              backgroundColor: self.state.useClientSideAWS ? '#90EE90' : '#CCCCCC',
              color: self.state.useClientSideAWS ? '#006400' : '#666666',
              fontWeight: 'bold'
            }}
            onClick={self.openCredentialsModal}
          >
            {self.state.useClientSideAWS ? '🔐 AWS Connected' : '🔗 Connect AWS'}
          </button>
          <div className="tagline">
            <strong>S3 Made Easy:</strong> Manage • Upload • Share Securely | Powered by Kiro
            {self.state.useClientSideAWS && <span style={{ color: '#006400', marginLeft: '10px' }}>✅ Using your AWS credentials</span>}
            {!self.state.useClientSideAWS && <span style={{ color: '#8B0000', marginLeft: '10px' }}>👻 Demo Mode (Ghost Buckets)</span>}
          </div>
        </header>
        
        {/* Navigation */}
        <nav className="phantom-nav">
          <a 
            href="#buckets" 
            onClick={function(e) { 
              e.preventDefault(); 
              self.handleBackToBuckets(); 
            }}
            style={{ cursor: 'pointer' }}
          >
            My Buckets
          </a>
          <a 
            href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Documentation
          </a>
          <a 
            href="https://aws.amazon.com/pm/serv-s3/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            About S3
          </a>
          <button 
            className="retro-button"
            style={{ float: 'right', marginTop: '-2px', marginRight: '10px' }}
            onClick={self.toggleMute}
          >
            {self.state.audioMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
        </nav>
        
        {/* Main Content */}
        <main className="phantom-main">
          {/* USP Banner - S3 Made Easy */}
          {self.state.currentView === 'bucket-list' && !self.state.useClientSideAWS && (
            <div style={{
              background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)',
              border: '3px outset #FF9900',
              padding: '15px 20px',
              marginBottom: '15px',
              color: '#FFFFFF',
              textAlign: 'center',
              boxShadow: '5px 5px 0px #666666'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                🚀 S3 Made Easy - No AWS Account Required!
              </div>
              <div style={{ fontSize: '13px', marginBottom: '10px' }}>
                <strong>📦 Manage</strong> your buckets • <strong>📤 Upload</strong> files instantly • <strong>🔗 Share</strong> securely with temporary links
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>
                Try the demo now, or <button 
                  className="retro-button"
                  onClick={self.openCredentialsModal}
                  style={{ 
                    display: 'inline',
                    padding: '2px 8px',
                    fontSize: '11px',
                    backgroundColor: '#FFFFFF',
                    color: '#FF6600',
                    fontWeight: 'bold',
                    margin: '0 5px'
                  }}
                >
                  Connect Your AWS
                </button> to manage real buckets!
              </div>
            </div>
          )}
          
          <div className="section-header">
            📦 Your S3 Buckets
            <button 
              className="retro-button" 
              style={{ float: 'right', marginTop: '-3px' }}
              onClick={function() { self.playCrunch(); self.loadBuckets(); }}
            >
              🔄 Refresh
            </button>
            <button 
              className="retro-button retro-button-primary" 
              style={{ float: 'right', marginTop: '-3px', marginRight: '10px' }}
              onClick={self.openCreateBucketDialog}
            >
              ➕ Create Bucket
            </button>
          </div>
          
          {/* Status Messages */}
          {self.state.error && (
            <div className="status-box status-error">
              <button 
                className="retro-button"
                style={{ float: 'right' }}
                onClick={self.dismissError}
              >
                ✕ Dismiss
              </button>
              <strong>⚠️ ERROR:</strong> {self.state.error.message}
              <br />
              <small>Error Code: {self.state.error.code} | Service: {self.state.error.service}</small>
              <br />
              {(self.state.error.code === 'FileTooLarge' || self.state.error.code === 'CORSError') && self.state.lastUploadBucket && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#FFE4B5', border: '2px solid #FF8C00' }}>
                  <strong>💡 Solution:</strong> {self.state.error.code === 'CORSError' ? 'Reconfigure CORS with updated settings for multipart uploads!' : 'Configure CORS on your bucket to enable direct uploads for large files!'}
                  <br />
                  <button 
                    className="retro-button retro-button-primary"
                    onClick={self.handleConfigureCors}
                    disabled={self.state.configuringCors}
                    style={{ marginTop: '8px' }}
                  >
                    {self.state.configuringCors ? '⏳ Configuring...' : '🔧 Configure CORS on "' + self.state.lastUploadBucket + '"'}
                  </button>
                  <br />
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    This will allow your browser to upload files directly to S3, bypassing the 3MB limit.
                  </small>
                </div>
              )}
              {self.state.error.code !== 'FileTooLarge' && (
                <small style={{ color: '#666' }}>Click "Dismiss" to clear this error, or "Connect AWS" to add your credentials.</small>
              )}
            </div>
          )}
          
          {/* Uploading Indicator - Spooky Halloween Edition! */}
          {self.state.uploading && (
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)',
              border: '3px solid #FF6600',
              borderRadius: '0',
              marginBottom: '15px',
              textAlign: 'center',
              boxShadow: '0 0 20px rgba(255, 102, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Floating ghosts animation */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                fontSize: '30px',
                opacity: 0.3
              }}>
                <span style={{ position: 'absolute', left: '10%', animation: 'float 3s ease-in-out infinite' }}>👻</span>
                <span style={{ position: 'absolute', left: '30%', animation: 'float 4s ease-in-out infinite 0.5s' }}>🎃</span>
                <span style={{ position: 'absolute', left: '50%', animation: 'float 3.5s ease-in-out infinite 1s' }}>👻</span>
                <span style={{ position: 'absolute', left: '70%', animation: 'float 4.5s ease-in-out infinite 1.5s' }}>🎃</span>
                <span style={{ position: 'absolute', left: '90%', animation: 'float 3s ease-in-out infinite 2s' }}>👻</span>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  fontSize: '40px', 
                  marginBottom: '10px',
                  animation: 'pulse 1s ease-in-out infinite'
                }}>
                  👻 💀 🎃
                </div>
                <strong style={{ 
                  color: '#FF6600', 
                  fontSize: '18px',
                  textShadow: '0 0 10px rgba(255, 102, 0, 0.8)'
                }}>
                  🕸️ SUMMONING YOUR FILE TO THE CLOUD... 🕸️
                </strong>
                <br />
                <div style={{ 
                  color: '#FFFFFF', 
                  marginTop: '10px',
                  fontSize: '14px',
                  fontFamily: 'Courier New, monospace'
                }}>
                  "{self.state.uploadingFileName}"
                </div>
                <br />
                <small style={{ 
                  color: '#CCCCCC', 
                  marginTop: '10px', 
                  display: 'block',
                  fontStyle: 'italic'
                }}>
                  The spirits are carrying your bytes through the ether...
                  <br />
                  This ancient ritual may take a moment for large files.
                </small>
                
                {/* 2006-style loading bar with progress */}
                <div style={{
                  marginTop: '20px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '80%',
                    height: '30px',
                    margin: '0 auto',
                    background: '#000000',
                    border: '3px inset #666666',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Progress bar (shows actual progress if available) */}
                    {self.state.uploadProgress > 0 ? (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: self.state.uploadProgress + '%',
                        background: 'repeating-linear-gradient(90deg, #FF6600 0px, #FF6600 20px, #FF9900 20px, #FF9900 40px)',
                        transition: 'width 0.3s'
                      }} />
                    ) : (
                      /* Animated loading bar for indeterminate progress */
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%',
                        background: 'repeating-linear-gradient(90deg, #FF6600 0px, #FF6600 20px, #FF9900 20px, #FF9900 40px)',
                        animation: 'loading-bar 1.5s linear infinite'
                      }} />
                    )}
                  </div>
                  <div style={{
                    marginTop: '10px',
                    color: '#FF6600',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: 'Courier New, monospace'
                  }}>
                    {self.state.uploadProgress > 0 ? (
                      '⚡ UPLOADING: ' + self.state.uploadProgress + '% COMPLETE ⚡'
                    ) : (
                      <span>⚡ UPLOADING<span className="loading-dots"></span> ⚡</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Bucket Table or Bucket Contents */}
          {self.state.currentView === 'bucket-list' && (
            <BucketTable 
              buckets={self.state.buckets}
              loading={self.state.loading}
              onUpload={self.handleUpload}
              onUploadClick={self.handleUploadClick}
              onBrowse={self.handleBrowse}
              onDelete={self.handleDeleteBucket}
              onRefresh={self.loadBuckets}
              shakeActive={self.state.shakeActive}
            />
          )}
          
          {self.state.currentView === 'bucket-contents' && (
            <BucketContents 
              bucketName={self.state.selectedBucket}
              objects={self.state.bucketContents}
              loading={self.state.loadingContents}
              onBack={self.handleBackToBuckets}
              onShare={self.handleOpenShareDialog}
              onRefresh={function() { self.loadBucketContents(self.state.selectedBucket); }}
            />
          )}
          
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
        
        {/* Share Dialog */}
        <ShareDialog 
          visible={self.state.showShareDialog}
          fileName={self.state.shareDialogFile.key}
          bucketName={self.state.shareDialogFile.bucketName}
          fileKey={self.state.shareDialogFile.key}
          onClose={self.handleCloseShareDialog}
          onGenerate={self.handleGenerateShareLink}
          generatedUrl={self.state.shareDialogUrl}
          loading={self.state.shareDialogLoading}
        />
        
        {/* Ghost Agent - The Kiro Phantom */}
        <GhostAgent 
          visible={self.state.showGhost}
          message={self.state.ghostMessage}
          onClose={function() { self.setState({ showGhost: false }); }}
          onSpeak={self.handleGhostSpeak}
          audioEnabled={self.state.audioEnabled}
          onTriggerShake={self.triggerShake}
        />
      </div>
    );
  }
}

export default App;
