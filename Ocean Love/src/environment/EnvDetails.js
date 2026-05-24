/* src/environment/EnvDetails.js
   Manages distant islands, silhouette mountains, bioluminescent fish stars
   Date: 2026-05-24
*/

import * as THREE from 'three';

export class EnvDetails {
  constructor(scene, loadingManager) {
    this.scene = scene;
    this.manager = loadingManager;
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.mountainMaterial = null;
    this.mountainMeshes = [];
    this.starField = null;

    this.initMountains();
    this.initStars();
  }

  initMountains() {
    this.textureLoader.load('/img/mountains.png', (texture) => {
      texture.generateMipmaps = false;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      this.mountainMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false
      });

      const addMountain = (size) => {
        // Large cylinder mapping the mountain silhouette texture
        const cylinderGeom = new THREE.CylinderGeometry(size, size, 35000, 32, 1, true);
        const mesh = new THREE.Mesh(cylinderGeom, this.mountainMaterial);
        mesh.position.y = 10000;
        this.scene.add(mesh);
        this.mountainMeshes.push(mesh);
      };

      // Add two layers of mountains at different depths
      addMountain(130000);
      addMountain(160000);
    });

    // Add a black cylinder under the water level to prevent skybox bleeding
    const blockingCylinderGeom = new THREE.CylinderGeometry(160000, 160000, 150000, 32, 1, true);
    const blockingMaterial = new THREE.MeshBasicMaterial({
      color: 0x010307,
      side: THREE.BackSide,
      depthWrite: false
    });
    const blockingCylinder = new THREE.Mesh(blockingCylinderGeom, blockingMaterial);
    blockingCylinder.position.y = -80000;
    this.scene.add(blockingCylinder);
  }

  initStars() {
    const starCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const r = 100000 + Math.random() * 20000;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 10000;
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      sizes[i] = Math.random() * 8.0 + 2.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom shader material for twinkling stars
    this.starMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / -mvPosition.z);
          vAlpha = 0.2 + 0.8 * sin(uTime * 2.0 + position.x * 0.01 + position.y * 0.02);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        uniform vec3 uColor;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          if (length(center) > 0.5) discard;
          gl_FragColor = vec4(uColor, vAlpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(1.0, 1.0, 1.0) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.starField = new THREE.Points(geometry, this.starMaterial);
    this.starField.visible = false;
    this.scene.add(this.starField);
  }

  update(time, currentEnvMode) {
    if (this.starField) {
      this.starMaterial.uniforms.uTime.value = time;

      if (currentEnvMode === 'night') {
        this.starField.visible = true;
        this.starMaterial.uniforms.uColor.value.setHex(0xaaccff);
      } else {
        this.starField.visible = false;
      }
    }
  }
}
