/* src/audio/AudioSystem.js
   Cinematic Web Audio setup using Three.js native AudioListener and Positional Audio
   Date: 2026-05-24
*/

import * as THREE from 'three';

export class AudioSystem {
  constructor(camera) {
    this.camera = camera;
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);

    this.audioLoader = new THREE.AudioLoader();
    this.ambientSound = null;
    this.isMuted = true;
    this.isLoaded = false;
  }

  loadSound(onProgress) {
    return new Promise((resolve) => {
      // Create global ambient sound
      this.ambientSound = new THREE.Audio(this.listener);

      // Load wave sound loop
      this.audioLoader.load(
        '/sound/waves.mp3',
        (buffer) => {
          this.ambientSound.setBuffer(buffer);
          this.ambientSound.setLoop(true);
          this.ambientSound.setVolume(0.4);
          this.isLoaded = true;
          resolve();
        },
        onProgress,
        (err) => {
          console.warn('Lỗi khi tải file âm thanh:', err);
          resolve();
        }
      );
    });
  }

  toggle() {
    if (!this.isLoaded || !this.ambientSound) return false;

    if (this.isMuted) {
      if (this.listener.context.state === 'suspended') {
        this.listener.context.resume();
      }
      this.ambientSound.play();
      this.isMuted = false;
    } else {
      this.ambientSound.pause();
      this.isMuted = true;
    }

    return !this.isMuted;
  }

  startAfterInteraction() {
    if (!this.isLoaded || !this.ambientSound) return;

    if (this.isMuted) {
      if (this.listener.context.state === 'suspended') {
        this.listener.context.resume();
      }
      this.ambientSound.play();
      this.isMuted = false;
      return true;
    }
    return false;
  }
}
