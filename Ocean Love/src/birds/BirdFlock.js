/* src/birds/BirdFlock.js
   Simulates flock of seagulls using Boid flocking algorithm and handles hover/click raycasting
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { createBirdGeometry, createBirdMaterial } from './BirdGeometry.js';
import { CONFIG } from '../config.js';

export class BirdFlock {
  constructor(scene, camera, shipObject) {
    this.scene = scene;
    this.camera = camera;
    this.shipObject = shipObject;

    this.birdsGroup = new THREE.Group();
    this.scene.add(this.birdsGroup);

    this.birds = [];
    this.spawnBirds(CONFIG.birds.count);

    // Setup Raycaster for bird hover/click
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredBird = null;
    this.onClickCallbacks = [];

    this.initEvents();
  }

  spawnBirds(count) {
    const geom = createBirdGeometry();

    for (let i = 0; i < count; i++) {
      const mat = createBirdMaterial();
      
      // Give each bird slightly unique flapping offsets
      mat.uniforms.uFlapSpeed.value = 8.0 + Math.random() * 3.0;
      mat.uniforms.uFlapAngle.value = 0.45 + Math.random() * 0.2;

      const mesh = new THREE.Mesh(geom, mat);
      
      // Starting positions (spread around the sky above the ship)
      const radius = 250 + Math.random() * 300;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = CONFIG.birds.minHeight + Math.random() * (CONFIG.birds.maxHeight - CONFIG.birds.minHeight);
      const z = Math.sin(angle) * radius;

      mesh.position.set(x, y, z);
      mesh.scale.setScalar(1.2 + Math.random() * 0.6); // size variations

      this.birdsGroup.add(mesh);

      // Create boid physics representation
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 10
      ).normalize().multiplyScalar(CONFIG.birds.speed.min + Math.random() * 5.0);

      this.birds.push({
        mesh: mesh,
        material: mat,
        velocity: velocity,
        position: mesh.position,
        flapOffset: Math.random() * 10.0
      });
    }
  }

  initEvents() {
    const onPointerMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.birdsGroup.children);

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        const boid = this.birds.find(b => b.mesh === intersectedMesh);
        
        if (boid && this.hoveredBird !== boid) {
          if (this.hoveredBird) {
            this.hoveredBird.material.uniforms.uColor.value.setHex(0xefefef);
          }
          this.hoveredBird = boid;
          boid.material.uniforms.uColor.value.setHex(0xffdd55);
          document.body.style.cursor = 'pointer';
        }
      } else {
        if (this.hoveredBird) {
          this.hoveredBird.material.uniforms.uColor.value.setHex(0xefefef);
          this.hoveredBird = null;
        }
        document.body.style.cursor = 'default';
      }
    };

    const onPointerDown = () => {
      if (this.hoveredBird) {
        this.onClickCallbacks.forEach(cb => cb(this.hoveredBird));
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
  }

  onBirdClick(callback) {
    this.onClickCallbacks.push(callback);
  }

  update(dt) {
    const time = performance.now() * 0.001;

    const conf = CONFIG.birds;
    const shipPos = this.shipObject ? this.shipObject.position : new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < this.birds.length; i++) {
      const boid = this.birds[i];

      boid.material.uniforms.uTime.value = time + boid.flapOffset;

      const pos = boid.position;
      const vel = boid.velocity;

      const steerSeparation = new THREE.Vector3();
      const steerAlignment = new THREE.Vector3();
      const steerCohesion = new THREE.Vector3();
      let separationCount = 0;
      let flockCenter = new THREE.Vector3();
      let flockVel = new THREE.Vector3();
      let flockCount = 0;

      for (let j = 0; j < this.birds.length; j++) {
        if (i === j) continue;
        const other = this.birds[j];
        const dist = pos.distanceTo(other.position);

        if (dist < conf.separationRadius) {
          const diff = pos.clone().sub(other.position).normalize().divideScalar(dist);
          steerSeparation.add(diff);
          separationCount++;
        }

        if (dist < conf.cohesionRadius) {
          flockCenter.add(other.position);
          flockVel.add(other.velocity);
          flockCount++;
        }
      }

      if (separationCount > 0) {
        steerSeparation.divideScalar(separationCount).normalize();
      }

      if (flockCount > 0) {
        flockCenter.divideScalar(flockCount);
        steerCohesion.add(flockCenter.clone().sub(pos)).normalize();

        flockVel.divideScalar(flockCount);
        steerAlignment.copy(flockVel).normalize();
      }

      const toShip = shipPos.clone().sub(pos);
      toShip.y = 0;
      const distToShip = toShip.length();
      
      const steerShip = new THREE.Vector3();
      if (distToShip > 600) {
        steerShip.copy(toShip).normalize().multiplyScalar(0.2);
      } else {
        steerShip.set(-toShip.z, 0, toShip.x).normalize().multiplyScalar(0.15);
        steerShip.add(toShip.normalize().multiplyScalar(0.05));
      }

      const acceleration = new THREE.Vector3();
      acceleration.add(steerSeparation.multiplyScalar(0.45));
      acceleration.add(steerAlignment.multiplyScalar(0.2));
      acceleration.add(steerCohesion.multiplyScalar(0.15));
      acceleration.add(steerShip.multiplyScalar(conf.attractionToShip));

      vel.add(acceleration).normalize();

      const currentSpeed = conf.speed.min + (i % 5);
      vel.multiplyScalar(currentSpeed);

      if (pos.y < conf.minHeight) {
        vel.y += (conf.minHeight - pos.y) * 0.15;
      } else if (pos.y > conf.maxHeight) {
        vel.y -= (pos.y - conf.maxHeight) * 0.15;
      }

      pos.addScaledVector(vel, dt);

      const targetLook = pos.clone().add(vel);
      boid.mesh.lookAt(targetLook);
    }
  }
}
