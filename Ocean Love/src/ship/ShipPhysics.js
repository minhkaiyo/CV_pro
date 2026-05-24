/* src/ship/ShipPhysics.js
   Aligns the ship position and rotation with FFT waves by reading displacement target
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class ShipPhysics {
  constructor(renderer, fftCompute) {
    this.renderer = renderer;
    this.fftCompute = fftCompute;

    // Buffer for reading 3 pixels (Center, Right, Forward) to calculate height and normals
    // Each pixel is RGBA Float = 4 floats. 3 pixels * 4 = 12 floats.
    this.pixelBuffer = new Float32Array(12);

    this.shipHeight = 0.0;
    this.targetPitch = 0.0;
    this.targetRoll = 0.0;
    this.currentPitch = 0.0;
    this.currentRoll = 0.0;
  }

  update(ship, dt) {
    if (!ship) return;

    const res = this.fftCompute.resolution;
    const halfRes = Math.floor(res / 2);
    const offset = 4; // Offset in pixels for slope calculation

    // Read 3 pixels: Center (halfRes, halfRes), Right (halfRes + offset, halfRes), Forward (halfRes, halfRes + offset)
    const currentRenderTarget = this.renderer.getRenderTarget();
    
    // Read Center
    this.renderer.readRenderTargetPixels(
      this.fftCompute.displacementMapTarget,
      halfRes, halfRes, 1, 1,
      this.pixelBuffer.subarray(0, 4)
    );

    // Read Right
    this.renderer.readRenderTargetPixels(
      this.fftCompute.displacementMapTarget,
      halfRes + offset, halfRes, 1, 1,
      this.pixelBuffer.subarray(4, 8)
    );

    // Read Forward
    this.renderer.readRenderTargetPixels(
      this.fftCompute.displacementMapTarget,
      halfRes, halfRes + offset, 1, 1,
      this.pixelBuffer.subarray(8, 12)
    );

    // Restore render target
    this.renderer.setRenderTarget(currentRenderTarget);

    // Extract displacement heights (Y component is green/G coordinate = index 1)
    const hCenter = this.pixelBuffer[1];
    const hRight = this.pixelBuffer[5];
    const hForward = this.pixelBuffer[9];

    // Smooth wave height scaling
    const targetHeight = CONFIG.ship.baseY + hCenter * 1.0;
    this.shipHeight += (targetHeight - this.shipHeight) * 0.05;
    ship.position.y = this.shipHeight;

    // Calculate slope for rotation
    const worldStep = (offset / res) * CONFIG.ocean.size;

    // Gradient vectors
    const dhDx = (hRight - hCenter) / worldStep;
    const dhDz = (hForward - hCenter) / worldStep;

    // Determine target pitch (rotation around X) and roll (rotation around Z)
    this.targetPitch = Math.atan2(dhDz, 1.0) * 0.6;
    this.targetRoll = -Math.atan2(dhDx, 1.0) * 0.6;

    // Apply smooth interpolation (lerping) to rotation to prevent any sudden jitter
    const lerpFactor = CONFIG.ship.smoothFactor;
    this.currentPitch += (this.targetPitch - this.currentPitch) * lerpFactor;
    this.currentRoll += (this.targetRoll - this.currentRoll) * lerpFactor;

    // Set rotation on the ship group
    ship.rotation.x = this.currentPitch;
    ship.rotation.z = this.currentRoll;

    // Add gentle idle rocking
    const time = performance.now() * 0.001;
    ship.rotation.x += Math.sin(time * 0.6) * 0.015;
    ship.rotation.z += Math.cos(time * 0.5) * 0.02;
  }
}
