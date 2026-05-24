/* src/environment/DayNightCycle.js
   Manages smooth transitions between sunset, night, and dawn environments
   Date: 2026-05-24
*/

import * as THREE from 'three';
import gsap from 'gsap';

export class DayNightCycle {
  constructor(scene, dirLight, ambientLight, skySystem, cloudSystem, oceanMesh) {
    this.scene = scene;
    this.dirLight = dirLight;
    this.ambientLight = ambientLight;
    this.skySystem = skySystem;
    this.cloudSystem = cloudSystem;
    this.oceanMesh = oceanMesh;

    this.currentMode = 'sunset';

    // Parameters for environment states
    this.states = {
      sunset: {
        elevation: 2.0,
        azimuth: 180.0,
        dirLightColor: new THREE.Color(1.0, 0.65, 0.4),
        dirLightIntensity: 2.2,
        ambientColor: new THREE.Color(0.2, 0.15, 0.25),
        ambientIntensity: 0.5,
        fogColor: new THREE.Color(0.8, 0.45, 0.35),
        fogDensity: 0.000025,
        oceanColor: new THREE.Vector3(0.08, 0.12, 0.18),
        skyColor: new THREE.Vector3(1.0, 0.5, 0.35),
        exposure: 0.14,
        cloudCover: 0.4,
        cloudSharp: 0.88,
        cloudOpacity: 0.85
      },
      night: {
        elevation: -12.0,
        azimuth: 180.0,
        dirLightColor: new THREE.Color(0.5, 0.65, 0.9),
        dirLightIntensity: 0.6,
        ambientColor: new THREE.Color(0.04, 0.06, 0.12),
        ambientIntensity: 0.2,
        fogColor: new THREE.Color(0.03, 0.06, 0.12),
        fogDensity: 0.00003,
        oceanColor: new THREE.Vector3(0.01, 0.02, 0.04),
        skyColor: new THREE.Vector3(0.05, 0.08, 0.15),
        exposure: 0.08,
        cloudCover: 0.35,
        cloudSharp: 0.92,
        cloudOpacity: 0.55
      },
      dawn: {
        elevation: 10.0,
        azimuth: 45.0,
        dirLightColor: new THREE.Color(1.0, 0.8, 0.65),
        dirLightIntensity: 1.8,
        ambientColor: new THREE.Color(0.15, 0.2, 0.3),
        ambientIntensity: 0.6,
        fogColor: new THREE.Color(0.65, 0.68, 0.78),
        fogDensity: 0.00002,
        oceanColor: new THREE.Vector3(0.06, 0.14, 0.22),
        skyColor: new THREE.Vector3(0.65, 0.75, 0.88),
        exposure: 0.12,
        cloudCover: 0.5,
        cloudSharp: 0.85,
        cloudOpacity: 0.9
      }
    };

    // Keep track of sun coordinates for lerping
    this.currentSun = {
      elevation: this.states.sunset.elevation,
      azimuth: this.states.sunset.azimuth
    };

    // Apply initial state
    this.applyState(this.states.sunset, false);
  }

  applyState(state, animate = true, duration = 8.0) {
    if (!animate) {
      // Direct assignment
      this.currentSun.elevation = state.elevation;
      this.currentSun.azimuth = state.azimuth;
      this.skySystem.updateSun(state.elevation, state.azimuth);

      this.dirLight.position.copy(this.skySystem.sun).normalize();
      this.dirLight.color.copy(state.dirLightColor);
      this.dirLight.intensity = state.dirLightIntensity;

      this.ambientLight.color.copy(state.ambientColor);
      this.ambientLight.intensity = state.ambientIntensity;

      this.scene.fog.color.copy(state.fogColor);
      this.scene.fog.density = state.fogDensity;

      if (this.oceanMesh) {
        this.oceanMesh.updateUniforms(
          this.skySystem.sun,
          state.skyColor,
          state.oceanColor,
          state.exposure
        );
      }

      this.cloudSystem.setCloudDensity(state.cloudCover, state.cloudSharp, state.cloudOpacity);
      return;
    }

    // Smooth transition using GSAP
    gsap.killTweensOf(this.currentSun);
    gsap.killTweensOf(this.dirLight.color);
    gsap.killTweensOf(this.dirLight);
    gsap.killTweensOf(this.ambientLight.color);
    gsap.killTweensOf(this.ambientLight);
    gsap.killTweensOf(this.scene.fog.color);
    gsap.killTweensOf(this.scene.fog);
    
    const tl = gsap.timeline({ defaults: { duration: duration, ease: 'power2.inOut' } });

    // Transition sun coordinates
    tl.to(this.currentSun, {
      elevation: state.elevation,
      azimuth: state.azimuth,
      onUpdate: () => {
        this.skySystem.updateSun(this.currentSun.elevation, this.currentSun.azimuth);
        this.dirLight.position.copy(this.skySystem.sun).normalize();
        if (this.oceanMesh) {
          this.oceanMesh.material.uniforms.u_sunDirection.value.copy(this.skySystem.sun).normalize();
        }
      }
    }, 0);

    // Light colors and intensities
    tl.to(this.dirLight.color, { r: state.dirLightColor.r, g: state.dirLightColor.g, b: state.dirLightColor.b }, 0);
    tl.to(this.dirLight, { intensity: state.dirLightIntensity }, 0);

    // Ambient light
    tl.to(this.ambientLight.color, { r: state.ambientColor.r, g: state.ambientColor.g, b: state.ambientColor.b }, 0);
    tl.to(this.ambientLight, { intensity: state.ambientIntensity }, 0);

    // Fog
    tl.to(this.scene.fog.color, { r: state.fogColor.r, g: state.fogColor.g, b: state.fogColor.b }, 0);
    tl.to(this.scene.fog, { density: state.fogDensity }, 0);

    // Ocean shader uniforms
    if (this.oceanMesh) {
      const uniforms = this.oceanMesh.material.uniforms;
      tl.to(uniforms.u_skyColor.value, { r: state.skyColor.r, g: state.skyColor.g, b: state.skyColor.b }, 0);
      tl.to(uniforms.u_oceanColor.value, { r: state.oceanColor.r, g: state.oceanColor.g, b: state.oceanColor.b }, 0);
      tl.to(uniforms.u_exposure, { value: state.exposure }, 0);
    }

    // Cloud system uniforms
    const cloudUniforms = this.cloudSystem.material.uniforms;
    tl.to(cloudUniforms.cover, { value: state.cloudCover }, 0);
    tl.to(cloudUniforms.sharp, { value: state.cloudSharp }, 0);
    tl.to(cloudUniforms.clouds, { value: state.cloudOpacity }, 0);
  }

  transitionTo(mode) {
    if (mode === this.currentMode) return;
    this.currentMode = mode;

    const state = this.states[mode];
    if (state) {
      this.applyState(state, true, 8.0);
    }
  }
}
