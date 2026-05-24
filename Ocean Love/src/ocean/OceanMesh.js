/* src/ocean/OceanMesh.js
   Visible mesh and material manager for the FFT Ocean
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { Shaders } from '../shaders/OceanShaders.js';
import { CONFIG } from '../config.js';

export class OceanMesh {
  constructor(fftCompute, reflection) {
    this.fftCompute = fftCompute;
    this.reflection = reflection;

    // Create custom ShaderMaterial for ocean rendering
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_displacementMap: { value: this.fftCompute.displacementMapTarget.texture },
        u_normalMap: { value: this.fftCompute.normalMapTarget.texture },
        u_reflection: { value: this.reflection.texture.texture },
        u_mirrorMatrix: { value: this.reflection.textureMatrix },
        u_geometrySize: { value: this.fftCompute.resolution },
        u_size: { value: this.fftCompute.size },
        u_skyColor: { value: new THREE.Vector3(CONFIG.ocean.skyColor.r, CONFIG.ocean.skyColor.g, CONFIG.ocean.skyColor.b) },
        u_oceanColor: { value: new THREE.Vector3(CONFIG.ocean.oceanColor.r, CONFIG.ocean.oceanColor.g, CONFIG.ocean.oceanColor.b) },
        u_sunDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        u_exposure: { value: 0.15 }
      },
      vertexShader: Shaders.oceanSurfaceVert,
      fragmentShader: Shaders.oceanSurfaceFrag,
      side: THREE.FrontSide,
      transparent: false,
      wireframe: false
    });

    // Create 1x1 Plane geometry with defined subdivisions for the Projected Grid method
    // Resolution must match geometryResolution in config
    const geomRes = CONFIG.ocean.geometryResolution;
    this.geometry = new THREE.PlaneGeometry(1, 1, geomRes, geomRes);
    
    // Create the mesh and disable default frustum culling,
    // since vertex positions are overridden dynamically in screen-space
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;

    // Link the water mesh back to reflection for exclusion during rendering
    this.reflection.waterMesh = this.mesh;
  }

  updateUniforms(sunDir, skyColor, oceanColor, exposure) {
    if (sunDir) this.material.uniforms.u_sunDirection.value.copy(sunDir).normalize();
    if (skyColor) this.material.uniforms.u_skyColor.value.copy(skyColor);
    if (oceanColor) this.material.uniforms.u_oceanColor.value.copy(oceanColor);
    if (exposure !== undefined) this.material.uniforms.u_exposure.value = exposure;
    
    // Update target textures in case they were reallocated (though they are static here)
    this.material.uniforms.u_displacementMap.value = this.fftCompute.displacementMapTarget.texture;
    this.material.uniforms.u_normalMap.value = this.fftCompute.normalMapTarget.texture;
    this.material.uniforms.u_reflection.value = this.reflection.texture.texture;
  }
}
