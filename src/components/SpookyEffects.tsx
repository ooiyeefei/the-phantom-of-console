/**
 * SpookyEffects Component - The Horror Engine
 * 
 * Triggers visual and audio effects when errors occur
 * Screen tearing, blood dripping, and other haunted delights
 * 
 * Web 2.0 compliant terror
 */

import React, { Component } from 'react';

interface SpookyEffectsProps {
  error: any;
}

interface SpookyEffectsState {
  showBlood: boolean;
  glitching: boolean;
}

/**
 * SpookyEffects - Making errors entertaining since 2006
 */
class SpookyEffects extends Component<SpookyEffectsProps, SpookyEffectsState> {
  private errorAudio: HTMLAudioElement | null = null;
  private glitchTimeout: NodeJS.Timeout | null = null;
  private bloodTimeout: NodeJS.Timeout | null = null;
  
  constructor(props: SpookyEffectsProps) {
    super(props);
    this.state = {
      showBlood: false,
      glitching: false
    };
  }
  
  componentDidUpdate(prevProps: SpookyEffectsProps) {
    var self = this;
    
    // Trigger effects when a new error occurs
    if (self.props.error && self.props.error !== prevProps.error) {
      self.triggerHorror();
    }
  }
  
  componentWillUnmount() {
    // Clean up timeouts
    if (this.glitchTimeout) clearTimeout(this.glitchTimeout);
    if (this.bloodTimeout) clearTimeout(this.bloodTimeout);
  }
  
  /**
   * Trigger all the horror effects!
   */
  triggerHorror() {
    var self = this;
    
    // Play error sound
    self.errorAudio = new Audio('/sounds/error.mp3');
    self.errorAudio.play().catch(function(e) {
      console.error('Could not play error sound:', e);
    });
    
    // Trigger screen glitch
    self.setState({ glitching: true });
    document.body.classList.add('glitch-intense');
    
    self.glitchTimeout = setTimeout(function() {
      document.body.classList.remove('glitch-intense');
      self.setState({ glitching: false });
    }, 2000);
    
    // Trigger blood drip
    self.setState({ showBlood: true });
    
    self.bloodTimeout = setTimeout(function() {
      self.setState({ showBlood: false });
    }, 2000);
  }
  
  render() {
    var self = this;
    
    return (
      <div>
        {/* Scanlines overlay - CRT monitor effect */}
        <div className="scanlines"></div>
        
        {/* Blood drip effect */}
        {self.state.showBlood && (
          <div className="blood-drip"></div>
        )}
      </div>
    );
  }
}

export default SpookyEffects;
