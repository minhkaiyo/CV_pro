/* src/environment/CloudSystem.js
   Procedural fractal clouds system using custom noise shader
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { Shaders } from '../shaders/OceanShaders.js';

export class CloudSystem {
  constructor(scene) {
    this.scene = scene;
    this.noiseTexture = this.generateNoiseTexture(256);

    this.material = new THREE.ShaderMaterial({
      vertexShader: Shaders.cloudVert,
      fragmentShader: Shaders.cloudFrag,
      uniforms: {
        texture: { value: this.noiseTexture },
        time: { value: 0 },
        sharp: { value: 0.9 },   // Cloud intensity multiplier
        cover: { value: 0.45 },  // Cloud coverage ratio (0 = clear, 1 = overcast)
        clouds: { value: 1.0 },  // Cloud overall opacity
        depth: { value: 0.0 }
      },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    // Create a large hemisphere dome for the clouds
    // SphereGeometry parameters: radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength
    this.geometry = new THREE.SphereGeometry(140000, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = -1000;
    
    this.scene.add(this.mesh);
  }

  generateNoiseTexture(size) {
    const dataSize = size * size;
    const data = new Uint8Array(4 * dataSize);

    for (let i = 0; i < dataSize * 4; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    return texture;
  }

  update(time) {
    this.material.uniforms.time.value = time;
  }

  setCloudDensity(cover, sharp, cloudsOpacity) {
    if (cover !== undefined) this.material.uniforms.cover.value = cover;
    if (sharp !== undefined) this.material.uniforms.sharp.value = sharp;
    if (cloudsOpacity !== undefined) this.material.uniforms.clouds.value = cloudsOpacity;
  }
}
