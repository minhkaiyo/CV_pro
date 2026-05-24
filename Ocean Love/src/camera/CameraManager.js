/* src/camera/CameraManager.js
   Cinematic camera controller with smooth spherical coordinates, breathing sway, and follow mode
   Date: 2026-05-24
*/

import * as THREE from 'three';
import gsap from 'gsap';
import { CONFIG } from '../config.js';

export class CameraManager {
  constructor(camera, domElement, targetObject) {
    this.camera = camera;
    this.domElement = domElement;
    this.targetObject = targetObject; // The ship or focal point

    this.mode = 'cinematic';
    this.followedBird = null;

    // Custom Spherical Coordinates for Cinematic Orbit
    this.spherical = {
      radius: 950.0,
      theta: Math.PI * 0.15, // horizontal angle
      phi: Math.PI * 0.42,    // vertical angle
      
      // Target values for interpolation
      targetRadius: 950.0,
      targetTheta: Math.PI * 0.15,
      targetPhi: Math.PI * 0.42
    };

    // Limits
    this.limits = {
      minRadius: 350.0,
      maxRadius: 2200.0,
      minPhi: Math.PI * 0.22, // prevent looking directly down
      maxPhi: Math.PI * 0.48  // prevent going below water line
    };

    // Interaction states
    this.isPointerDown = false;
    this.previousPointerPosition = { x: 0, y: 0 };
    this.idleTime = 0.0;

    // Current camera lookAt target (lerps towards targetObject position)
    this.lookAtTarget = new THREE.Vector3(0, 45, 0);

    this.initEvents();
  }

  initEvents() {
    const onPointerDown = (e) => {
      this.isPointerDown = true;
      this.previousPointerPosition.x = e.clientX;
      this.previousPointerPosition.y = e.clientY;
      this.idleTime = 0.0;
    };

    const onPointerMove = (e) => {
      if (!this.isPointerDown) return;

      const deltaX = e.clientX - this.previousPointerPosition.x;
      const deltaY = e.clientY - this.previousPointerPosition.y;

      this.previousPointerPosition.x = e.clientX;
      this.previousPointerPosition.y = e.clientY;

      const sens = 0.0035;
      this.spherical.targetTheta -= deltaX * sens;
      this.spherical.targetPhi -= deltaY * sens;

      this.spherical.targetPhi = Math.max(this.limits.minPhi, Math.min(this.limits.maxPhi, this.spherical.targetPhi));
      this.idleTime = 0.0;
    };

    const onPointerUp = () => {
      this.isPointerDown = false;
    };

    const onWheel = (e) => {
      const zoomSpeed = 1.8;
      this.spherical.targetRadius += e.deltaY * zoomSpeed;
      this.spherical.targetRadius = Math.max(this.limits.minRadius, Math.min(this.limits.maxRadius, this.spherical.targetRadius));
      this.idleTime = 0.0;
    };

    this.domElement.addEventListener('pointerdown', onPointerDown);
    this.domElement.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    this.domElement.addEventListener('wheel', onWheel, { passive: true });
  }

  followBird(bird) {
    if (this.mode === 'follow' && this.followedBird === bird) return;
    this.mode = 'follow';
    this.followedBird = bird;

    gsap.to(this.camera, {
      fov: CONFIG.camera.followFov,
      duration: 2.0,
      ease: 'power2.out',
      onUpdate: () => this.camera.updateProjectionMatrix()
    });

    if (this.autoReturnTimer) clearTimeout(this.autoReturnTimer);
    this.autoReturnTimer = setTimeout(() => {
      this.returnToCinematic();
    }, 11000);
  }

  returnToCinematic() {
    if (this.mode !== 'follow') return;
    this.mode = 'cinematic';
    this.followedBird = null;

    gsap.to(this.camera, {
      fov: CONFIG.camera.baseFov,
      duration: 2.5,
      ease: 'power2.inOut',
      onUpdate: () => this.camera.updateProjectionMatrix()
    });
  }

  update(dt) {
    const time = performance.now() * 0.001;

    if (this.mode === 'cinematic') {
      this.idleTime += dt;

      if (this.idleTime > 6.0) {
        this.spherical.targetTheta += 0.02 * dt;
      }

      const lerpFactor = 0.04;
      this.spherical.radius += (this.spherical.targetRadius - this.spherical.radius) * lerpFactor;
      this.spherical.theta += (this.spherical.targetTheta - this.spherical.theta) * lerpFactor;
      this.spherical.phi += (this.spherical.targetPhi - this.spherical.phi) * lerpFactor;

      const offset = new THREE.Vector3();
      offset.x = this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
      offset.y = this.spherical.radius * Math.cos(this.spherical.phi);
      offset.z = this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);

      const targetPos = new THREE.Vector3();
      if (this.targetObject) {
        targetPos.copy(this.targetObject.position);
      }
      targetPos.y = Math.max(5.0, targetPos.y);

      this.lookAtTarget.lerp(targetPos.clone().add(new THREE.Vector3(0, 40, 0)), 0.05);

      const rawCamPos = this.lookAtTarget.clone().add(offset);
      this.camera.position.copy(rawCamPos);

      const swayAmp = CONFIG.camera.swayIntensity;
      const swaySpeed = CONFIG.camera.swaySpeed;
      const swayOffset = new THREE.Vector3(
        Math.sin(time * swaySpeed) * 12.0 * swayAmp,
        Math.cos(time * swaySpeed * 0.8) * 8.0 * swayAmp,
        Math.sin(time * swaySpeed * 1.2) * 12.0 * swayAmp
      );
      this.camera.position.add(swayOffset);

      this.camera.lookAt(this.lookAtTarget);
      this.camera.rotation.z += Math.sin(time * 0.5) * 0.005;

    } else if (this.mode === 'follow' && this.followedBird) {
      const birdPos = this.followedBird.position;
      const birdVel = this.followedBird.velocity.clone().normalize();

      const camTargetPos = birdPos.clone()
        .sub(birdVel.multiplyScalar(150.0))
        .add(new THREE.Vector3(0, 50, 0));

      this.camera.position.lerp(camTargetPos, 0.06);
      
      const lookTarget = birdPos.clone().add(this.followedBird.velocity.clone().multiplyScalar(4.0));
      this.lookAtTarget.lerp(lookTarget, 0.06);
      
      this.camera.lookAt(this.lookAtTarget);
      
      const turnAmount = -this.followedBird.velocity.x * 0.015;
      this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, turnAmount, 0.06);
    }
  }
}
