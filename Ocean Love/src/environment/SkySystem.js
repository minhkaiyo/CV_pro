/* src/environment/SkySystem.js
   Procedural Sky Dome using Three.js Sky (Preetham model) for atmospheric rendering
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export class SkySystem {
  constructor(scene) {
    this.scene = scene;

    // Create standard Three.js Sky object
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);
    this.scene.add(this.sky);

    // Initial parameters
    const uniforms = this.sky.material.uniforms;
    uniforms['turbidity'].value = 10;
    uniforms['rayleigh'].value = 2;
    uniforms['mieCoefficient'].value = 0.005;
    uniforms['mieDirectionalG'].value = 0.8;

    this.sun = new THREE.Vector3();
  }

  updateSun(elevation, azimuth) {
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);

    this.sun.setFromSphericalCoords(1, phi, theta);
    this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
  }
}
