/* src/ship/ShipLoader.js
   Loads the ship model using MTLLoader and OBJLoader (Three.js JSM)
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export class ShipLoader {
  constructor(loadingManager) {
    this.manager = loadingManager;
  }

  loadShip() {
    return new Promise((resolve, reject) => {
      const mtlLoader = new MTLLoader(this.manager);
      mtlLoader.setPath('/models/BlackPearl/');

      mtlLoader.load('BlackPearl.mtl', (materials) => {
        materials.preload();

        // Ensure materials are set to double-sided so sails and details look solid
        for (const key in materials.materials) {
          materials.materials[key].side = THREE.DoubleSide;
          if (key.toLowerCase().includes('sail')) {
            materials.materials[key].color.setHex(0xeaeaea); // brighten sails slightly
          }
        }

        const objLoader = new OBJLoader(this.manager);
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/BlackPearl/');

        objLoader.load('BlackPearl.obj', (object) => {
          // Adjust ship base offset and shadow casting
          object.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Position the ship slightly up from its origin to sit nicely in the water
          object.position.y = 12.0; 

          resolve(object);
        }, undefined, (error) => {
          console.error('Lỗi khi tải file OBJ con tàu:', error);
          reject(error);
        });
      }, undefined, (error) => {
        console.error('Lỗi khi tải file MTL con tàu:', error);
        reject(error);
      });
    });
  }
}
