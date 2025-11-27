/**
 * GhostAgent Component - The Kiro Phantom
 * 
 * A haunted AI assistant that references Kiro features
 * and delivers spooky dev facts
 * 
 * Web 2.0 compliant, enterprise-grade haunting
 */

import React, { Component } from 'react';

interface GhostAgentProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  audioEnabled: boolean;
  onSpeak?: () => void;
  onTriggerShake?: () => void;
}

interface GhostAgentState {
  minimized: boolean;
  currentMessage: string;
  isGlitching: boolean;
}

// Haunted Messages - The Kiro Phantom's roasts
var HAUNTED_MESSAGES = [
  "I see you used var... excellent. Let the scope bleed.",
  "Your commit history is haunted by bad decisions.",
  "Kiro is writing code... but who is writing Kiro?",
  "I deleted a random semicolon in your backend. Good luck.",
  "I found a `var` declaration from 2003... it's still bleeding.",
  "Your `node_modules` folder is heavier than a tombstone.",
  "I am watching your git history... shameful.",
  "I see you're using Kiro Steering... but can it steer you away from your sins?",
  "Your MCP server is haunted. I live inside it now.",
  "I reviewed your code with Vibe Coding... the vibes are CURSED.",
  "That pre-commit hook? I wrote it. From beyond the grave.",
  "SimpleDB remembers. SimpleDB never forgets.",
  "I've seen your AWS bill. The real horror is in us-east-1.",
  "async/await? In MY day, we had callback HELL and we SUFFERED.",
  "Your Lambda functions are cold... just like my soul.",
  "I found a console.log you forgot to remove. It's been there since 2019.",
  "The cloud is just someone else's haunted computer.",
  "I see dead code... everywhere."
];

/**
 * GhostAgent - The Kiro Phantom
 */
class GhostAgent extends Component<GhostAgentProps, GhostAgentState> {
  private hddAudio: HTMLAudioElement | null = null;
  
  constructor(props: GhostAgentProps) {
    super(props);
    this.state = {
      minimized: false,
      currentMessage: '',
      isGlitching: false
    };
    
    // Bind methods - no arrow functions in 2006!
    this.toggleMinimize = this.toggleMinimize.bind(this);
    this.getRandomFact = this.getRandomFact.bind(this);
    this.handleTellMore = this.handleTellMore.bind(this);
    this.triggerGlitch = this.triggerGlitch.bind(this);
  }

  
  componentDidUpdate(prevProps: GhostAgentProps) {
    var self = this;
    // Play HDD sound and trigger glitch when ghost speaks
    if (self.props.visible && !prevProps.visible) {
      self.triggerGlitch();
      if (self.props.audioEnabled) {
        self.hddAudio = new Audio('/sounds/hdd-crunch.mp3');
        self.hddAudio.play().catch(function(e) {
          console.error('Could not play HDD sound:', e);
        });
      }
    }
  }
  
  toggleMinimize() {
    this.setState({ minimized: !this.state.minimized });
  }
  
  getRandomFact() {
    var index = Math.floor(Math.random() * HAUNTED_MESSAGES.length);
    return HAUNTED_MESSAGES[index];
  }
  
  triggerGlitch() {
    var self = this;
    // Add glitch class to body
    document.body.classList.add('ghost-glitch');
    self.setState({ isGlitching: true });
    
    // Notify parent if callback provided
    if (self.props.onSpeak) {
      self.props.onSpeak();
    }
    
    setTimeout(function() {
      document.body.classList.remove('ghost-glitch');
      self.setState({ isGlitching: false });
    }, 500);
  }
  
  handleTellMore() {
    var self = this;
    var newFact = self.getRandomFact();
    self.setState({ currentMessage: newFact });
    self.triggerGlitch();
    
    // Trigger shake effect on the table via parent
    if (self.props.onTriggerShake) {
      self.props.onTriggerShake();
    }
    
    // Play HDD sound
    if (self.props.audioEnabled) {
      self.hddAudio = new Audio('/sounds/hdd-crunch.mp3');
      self.hddAudio.play().catch(function(e) {
        console.error('Could not play HDD sound:', e);
      });
    }
  }
  
  render() {
    var self = this;
    var visible = self.props.visible;
    var message = self.state.currentMessage || self.props.message || self.getRandomFact();
    var minimized = self.state.minimized;
    
    // Don't render if not visible
    if (!visible) {
      return null;
    }
    
    // Minimized state - just glaring eyes
    if (minimized) {
      return (
        <div 
          className="ghost-agent ghost-agent-minimized"
          onClick={self.toggleMinimize}
          title="The Phantom is watching..."
        >
          <div className="ghost-eyes">👁️👁️</div>
        </div>
      );
    }
    
    // Full ghost agent
    return (
      <div className={'ghost-agent' + (self.state.isGlitching ? ' glitching' : '')}>
        {/* Header */}
        <div className="ghost-agent-header">
          👻 The Kiro Phantom
          <span 
            className="close-btn"
            onClick={self.toggleMinimize}
            title="Minimize (I'll still be watching...)"
          >
            _
          </span>
        </div>
        
        {/* Body */}
        <div className="ghost-agent-body">
          {/* Avatar */}
          <div className="ghost-agent-avatar">
            💀
          </div>
          
          {/* Message */}
          <div className="ghost-agent-message">
            <p style={{ margin: '0 0 10px 0', lineHeight: '1.4' }}>
              {message}
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: '9px', 
              color: '#8B0000',
              fontStyle: 'italic'
            }}>
              — The Ghost of Sysadmins Past
            </p>
          </div>
          
          {/* Clear float */}
          <div style={{ clear: 'both' }}></div>
          
          {/* Action buttons */}
          <div style={{ marginTop: '10px', textAlign: 'right' }}>
            <button 
              className="retro-button"
              onClick={self.handleTellMore}
            >
              🎃 Tell me more...
            </button>
            {' '}
            <button 
              className="retro-button"
              onClick={self.toggleMinimize}
            >
              😱 Go away!
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default GhostAgent;
