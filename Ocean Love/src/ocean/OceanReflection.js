/* src/ocean/OceanReflection.js
   Planar Mirror Reflector for Ocean Surface reflection
   Date: 2026-05-24
*/

import * as THREE from 'three';

export class OceanReflection extends THREE.Object3D {
  constructor(renderer, camera, scene, options = {}) {
    super();
    this.name = 'ocean_reflection_' + this.id;

    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;

    const width = options.textureWidth || 512;
    const height = options.textureHeight || 512;
    this.clipBias = options.clipBias || 0.0;

    this.mirrorPlane = new THREE.Plane();
    this.normal = new THREE.Vector3(0, 1, 0);
    this.cameraWorldPosition = new THREE.Vector3();
    this.rotationMatrix = new THREE.Matrix4();
    this.lookAtPosition = new THREE.Vector3(0, 0, -1);
    this.clipPlane = new THREE.Vector4();
    this.upVector = new THREE.Vector3(0, 1, 0);

    this.textureMatrix = new THREE.Matrix4();
    this.mirrorCamera = this.camera.clone();
    
    // Create WebGLRenderTarget for storing reflection texture
    this.texture = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    this.updateTextureMatrix();
  }

  updateTextureMatrix() {
    this.updateMatrixWorld();
    this.camera.updateMatrixWorld();

    this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);
    this.rotationMatrix.extractRotation(this.matrixWorld);

    // Reflect camera position and lookAt vectors across the water plane (y=0)
    // Water surface is at y = 0, with normal (0, 1, 0)
    this.normal.set(0, 1, 0).applyMatrix4(this.rotationMatrix).normalize();

    const view = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld).sub(this.cameraWorldPosition);
    view.reflect(this.normal).negate();
    view.add(new THREE.Vector3().setFromMatrixPosition(this.matrixWorld));

    this.rotationMatrix.extractRotation(this.camera.matrixWorld);

    this.lookAtPosition.set(0, 0, -1).applyMatrix4(this.rotationMatrix).add(this.cameraWorldPosition);

    const target = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld).sub(this.lookAtPosition);
    target.reflect(this.normal).negate();
    target.add(new THREE.Vector3().setFromMatrixPosition(this.matrixWorld));

    this.upVector.set(0, 1, 0).applyMatrix4(this.rotationMatrix).reflect(this.normal).negate();

    this.mirrorCamera.position.copy(view);
    this.mirrorCamera.up.copy(this.upVector);
    this.mirrorCamera.lookAt(target);
    this.mirrorCamera.aspect = this.camera.aspect;

    this.mirrorCamera.updateProjectionMatrix();
    this.mirrorCamera.updateMatrixWorld();
    this.mirrorCamera.matrixWorldInverse.copy(this.mirrorCamera.matrixWorld).invert();

    // Map texture coordinates [-1, 1] to UVs [0, 1]
    this.textureMatrix.set(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );
    this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
    this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

    // Calculate oblique clipping plane to prevent under-water rendering from bleeding into reflection
    // Reference: Terathon Oblique Capping Plane
    this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.position);
    this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

    this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

    const q = new THREE.Vector4();
    const projectionMatrix = this.mirrorCamera.projectionMatrix;

    q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
    q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
    q.z = -1.0;
    q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

    const c = this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(q));

    projectionMatrix.elements[2] = c.x;
    projectionMatrix.elements[6] = c.y;
    projectionMatrix.elements[10] = c.z + 1.0 - this.clipBias;
    projectionMatrix.elements[14] = c.w;
  }

  renderReflection() {
    this.updateTextureMatrix();

    // Hide water mesh while rendering mirror to avoid self-reflection feedback loop
    if (this.waterMesh) this.waterMesh.visible = false;

    const currentRenderTarget = this.renderer.getRenderTarget();
    
    // Render the scene using mirror camera into our WebGLRenderTarget
    this.renderer.setRenderTarget(this.texture);
    this.renderer.clear();
    this.renderer.render(this.scene, this.mirrorCamera);

    // Restore original render state
    this.renderer.setRenderTarget(currentRenderTarget);
    
    if (this.waterMesh) this.waterMesh.visible = true;
  }
}
