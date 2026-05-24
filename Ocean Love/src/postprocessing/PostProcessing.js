/* src/postprocessing/PostProcessing.js
   Cinematic Post-Processing pipeline using Three.js EffectComposer (Bloom, Vignette, Grading)
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    const size = new THREE.Vector2();
    renderer.getSize(size);
    
    this.composer = new EffectComposer(this.renderer);

    this.initPasses(size);
  }

  initPasses(size) {
    // 1. Basic Scene render pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 2. Bloom pass for soft glowing lighting reflections
    this.bloomPass = new UnrealBloomPass(size, 0.45, 0.65, 0.82);
    this.composer.addPass(this.bloomPass);

    // 3. Vignette + Film Grain ShaderPass for classic cinema dreamscape mood
    const vignetteShader = {
      uniforms: {
        tDiffuse: { value: null },
        offset: { value: 0.95 },
        darkness: { value: 1.15 },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float offset;
        uniform float darkness;
        uniform float uTime;
        varying vec2 vUv;
        
        // Pseudo-random noise for subtle film grain
        float noise(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          
          vec2 uv = vUv - vec2(0.5);
          float d = length(uv);
          float vign = smoothstep(offset, offset - 0.4, d * darkness);
          texel.rgb *= vign;
          
          float grain = (noise(vUv * (uTime + 1.0)) - 0.5) * 0.024;
          texel.rgb += vec3(grain);
          
          gl_FragColor = texel;
        }
      `
    };

    this.vignettePass = new ShaderPass(vignetteShader);
    this.composer.addPass(this.vignettePass);

    // 4. Output pass (Color space correction)
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  resize(width, height) {
    this.composer.setSize(width, height);
  }

  render(dt) {
    this.vignettePass.uniforms.uTime.value += dt;
    this.composer.render();
  }
}
