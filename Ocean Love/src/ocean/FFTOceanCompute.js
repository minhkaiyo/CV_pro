/* src/ocean/FFTOceanCompute.js
   GPU-based FFT Simulation computation wrapper (ported to modern Three.js)
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { Shaders } from '../shaders/OceanShaders.js';

export class FFTOceanCompute {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.changed = true;
    this.initial = true;

    // Simulation options
    this.resolution = options.resolution || 512;
    this.size = options.size || 250.0;
    this.choppiness = options.choppiness !== undefined ? options.choppiness : 1.5;
    this.windX = options.windX !== undefined ? options.windX : 5.0;
    this.windY = options.windY !== undefined ? options.windY : 5.0;

    this.deltaTime = 0.0;
    this.pingPhase = true;

    // Create orthographic camera and quad scene for rendering 2D simulation passes
    this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.simScene = new THREE.Scene();
    this.simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.simScene.add(this.simQuad);

    // Framebuffers (RenderTargets) setup
    const floatType = THREE.FloatType;
    const baseParams = {
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      depthBuffer: false,
      type: floatType
    };

    const nearestClampParams = {
      ...baseParams,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping
    };

    const nearestRepeatParams = {
      ...baseParams,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    };

    const linearRepeatParams = {
      ...baseParams,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    };

    // Allocate render targets for step data
    this.initialSpectrumTarget = new THREE.WebGLRenderTarget(this.resolution, this.resolution, nearestRepeatParams);
    this.spectrumTarget = new THREE.WebGLRenderTarget(this.resolution, this.resolution, nearestClampParams);
    this.pingPhaseTarget = new THREE.WebGLRenderTarget(this.resolution, this.resolution, nearestClampParams);
    this.pongPhaseTarget = new THREE.WebGLRenderTarget(this.resolution, this.resolution, nearestClampParams);
    this.pingTransformTarget = new THREE.WebGLRenderTarget(this.resolution, this.resolution, nearestClampParams);
    this.pongTransformTarget = new THREE.WebGLRenderTarget(this.resolution, this.resolution, nearestClampParams);
    
    // Outputs sampled by the main ocean surface material
    this.displacementMapTarget = new THREE.WebGLRenderTarget(this.resolution, this.resolution, linearRepeatParams);
    this.normalMapTarget = new THREE.WebGLRenderTarget(this.resolution, this.resolution, linearRepeatParams);

    this.initSimulationShaders();
    this.generateSeedPhaseTexture();
  }

  initSimulationShaders() {
    // 1. Horizontal Stockham FFT transform
    this.horizontalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_input: { value: null },
        u_transformSize: { value: this.resolution },
        u_subtransformSize: { value: 0.0 }
      },
      vertexShader: Shaders.simVertex,
      fragmentShader: '#define HORIZONTAL\n' + Shaders.subtransform,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending
    });

    // 2. Vertical Stockham FFT transform
    this.verticalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_input: { value: null },
        u_transformSize: { value: this.resolution },
        u_subtransformSize: { value: 0.0 }
      },
      vertexShader: Shaders.simVertex,
      fragmentShader: Shaders.subtransform,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending
    });

    // 3. Initial Phillips Spectrum Creation
    this.initialSpectrumMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_wind: { value: new THREE.Vector2(this.windX, this.windY) },
        u_resolution: { value: this.resolution },
        u_size: { value: this.size }
      },
      vertexShader: Shaders.simVertex,
      fragmentShader: Shaders.initialSpectrum,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending
    });

    // 4. Wave Phase Evolution
    this.phaseMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_phases: { value: null },
        u_deltaTime: { value: 0.0 },
        u_resolution: { value: this.resolution },
        u_size: { value: this.size }
      },
      vertexShader: Shaders.simVertex,
      fragmentShader: Shaders.phase,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending
    });

    // 5. Current Height Spectrum
    this.spectrumMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_size: { value: this.size },
        u_resolution: { value: this.resolution },
        u_choppiness: { value: this.choppiness },
        u_phases: { value: null },
        u_initialSpectrum: { value: null }
      },
      vertexShader: Shaders.simVertex,
      fragmentShader: Shaders.spectrum,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending
    });

    // 6. Normal Map Calculation
    this.normalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_displacementMap: { value: null },
        u_resolution: { value: this.resolution },
        u_size: { value: this.size }
      },
      vertexShader: Shaders.simVertex,
      fragmentShader: Shaders.normals,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending
    });
  }

  generateSeedPhaseTexture() {
    // Generate initial random phases in float values [0, 2*PI]
    const phaseArray = new Float32Array(this.resolution * this.resolution * 4);
    for (let i = 0; i < this.resolution; i++) {
      for (let j = 0; j < this.resolution; j++) {
        phaseArray[i * this.resolution * 4 + j * 4] = Math.random() * 2.0 * Math.PI;
        phaseArray[i * this.resolution * 4 + j * 4 + 1] = 0.0;
        phaseArray[i * this.resolution * 4 + j * 4 + 2] = 0.0;
        phaseArray[i * this.resolution * 4 + j * 4 + 3] = 0.0;
      }
    }

    this.pingPhaseTexture = new THREE.DataTexture(phaseArray, this.resolution, this.resolution, THREE.RGBAFormat, THREE.FloatType);
    this.pingPhaseTexture.minFilter = THREE.NearestFilter;
    this.pingPhaseTexture.magFilter = THREE.NearestFilter;
    this.pingPhaseTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.pingPhaseTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.pingPhaseTexture.needsUpdate = true;
  }

  renderInitialSpectrum() {
    this.simQuad.material = this.initialSpectrumMaterial;
    this.initialSpectrumMaterial.uniforms.u_wind.value.set(this.windX, this.windY);
    this.initialSpectrumMaterial.uniforms.u_size.value = this.size;

    this.renderer.setRenderTarget(this.initialSpectrumTarget);
    this.renderer.clear();
    this.renderer.render(this.simScene, this.simCamera);
  }

  renderWavePhase() {
    this.simQuad.material = this.phaseMaterial;
    if (this.initial) {
      this.phaseMaterial.uniforms.u_phases.value = this.pingPhaseTexture;
      this.initial = false;
    } else {
      this.phaseMaterial.uniforms.u_phases.value = this.pingPhase ? this.pingPhaseTarget.texture : this.pongPhaseTarget.texture;
    }
    this.phaseMaterial.uniforms.u_deltaTime.value = this.deltaTime;
    this.phaseMaterial.uniforms.u_size.value = this.size;

    const outputTarget = this.pingPhase ? this.pongPhaseTarget : this.pingPhaseTarget;
    this.renderer.setRenderTarget(outputTarget);
    this.renderer.clear();
    this.renderer.render(this.simScene, this.simCamera);

    this.pingPhase = !this.pingPhase;
  }

  renderSpectrum() {
    this.simQuad.material = this.spectrumMaterial;
    this.spectrumMaterial.uniforms.u_initialSpectrum.value = this.initialSpectrumTarget.texture;
    this.spectrumMaterial.uniforms.u_phases.value = this.pingPhase ? this.pingPhaseTarget.texture : this.pongPhaseTarget.texture;
    this.spectrumMaterial.uniforms.u_choppiness.value = this.choppiness;
    this.spectrumMaterial.uniforms.u_size.value = this.size;

    this.renderer.setRenderTarget(this.spectrumTarget);
    this.renderer.clear();
    this.renderer.render(this.simScene, this.simCamera);
  }

  renderSpectrumFFT() {
    const iterations = Math.log2(this.resolution) * 2;
    let subtransformProgram = this.horizontalMaterial;

    let frameBuffer;
    let inputBuffer;

    for (let i = 0; i < iterations; i++) {
      if (i === 0) {
        inputBuffer = this.spectrumTarget.texture;
        frameBuffer = this.pingTransformTarget;
      } else if (i === iterations - 1) {
        inputBuffer = (iterations % 2 === 0) ? this.pingTransformTarget.texture : this.pongTransformTarget.texture;
        frameBuffer = this.displacementMapTarget;
      } else if (i % 2 === 1) {
        inputBuffer = this.pingTransformTarget.texture;
        frameBuffer = this.pongTransformTarget;
      } else {
        inputBuffer = this.pongTransformTarget.texture;
        frameBuffer = this.pingTransformTarget;
      }

      if (i === iterations / 2) {
        subtransformProgram = this.verticalMaterial;
      }

      this.simQuad.material = subtransformProgram;
      subtransformProgram.uniforms.u_input.value = inputBuffer;
      subtransformProgram.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations / 2) + 1));

      this.renderer.setRenderTarget(frameBuffer);
      this.renderer.clear();
      this.renderer.render(this.simScene, this.simCamera);
    }
  }

  renderNormalMap() {
    this.simQuad.material = this.normalMaterial;
    this.normalMaterial.uniforms.u_size.value = this.size;
    this.normalMaterial.uniforms.u_displacementMap.value = this.displacementMapTarget.texture;

    this.renderer.setRenderTarget(this.normalMapTarget);
    this.renderer.clear();
    this.renderer.render(this.simScene, this.simCamera);
  }

  update(dt) {
    this.deltaTime = dt;

    const currentRenderTarget = this.renderer.getRenderTarget();

    if (this.changed) {
      this.renderInitialSpectrum();
      this.changed = false;
    }

    this.renderWavePhase();
    this.renderSpectrum();
    this.renderSpectrumFFT();
    this.renderNormalMap();

    // Reset render target back to screen canvas
    this.renderer.setRenderTarget(currentRenderTarget);
  }
}
