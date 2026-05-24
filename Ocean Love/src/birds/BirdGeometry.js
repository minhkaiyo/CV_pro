/* src/birds/BirdGeometry.js
   Creates procedurally generated seagull geometry and custom wing-flapping shader material
   Date: 2026-05-24
*/

import * as THREE from 'three';

export function createBirdGeometry() {
  const geometry = new THREE.BufferGeometry();

  // Vertex Positions for standard seagull shape
  const vertices = new Float32Array([
    // Body (0 = body vertices)
    0.0, 0.0, 10.0,    // 0: Beak
    0.0, 0.0, -12.0,   // 1: Tail
    -1.5, 0.0, 0.0,    // 2: Left Shoulder
    1.5, 0.0, 0.0,     // 3: Right Shoulder
    0.0, 2.0, 2.0,     // 4: Head top

    // Left Wing (wingSide = -1)
    -1.5, 0.0, 0.0,    // 5: Left Shoulder connection
    -10.0, 1.5, 1.0,   // 6: Left Elbow joint
    -20.0, 0.0, -1.0,  // 7: Left Wingtip

    // Right Wing (wingSide = 1)
    1.5, 0.0, 0.0,     // 8: Right Shoulder connection
    10.0, 1.5, 1.0,    // 9: Right Elbow joint
    20.0, 0.0, -1.0    // 10: Right Wingtip
  ]);

  // wingSide attributes: 0 for body, -1 for left wing, 1 for right wing
  const wingSides = new Float32Array([
    0.0, 0.0, 0.0, 0.0, 0.0,   // Body
    -1.0, -1.0, -1.0,          // Left Wing
    1.0, 1.0, 1.0              // Right Wing
  ]);

  // Faces (triangles)
  const indices = [
    // Body triangles
    0, 2, 4,
    0, 4, 3,
    0, 3, 2,
    1, 2, 3,
    1, 4, 2,
    1, 3, 4,

    // Left Wing triangles
    5, 6, 7,
    5, 7, 6,

    // Right Wing triangles
    8, 10, 9,
    8, 9, 10
  ];

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('wingSide', new THREE.BufferAttribute(wingSides, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export function createBirdMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `
      attribute float wingSide;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      uniform float uTime;
      uniform float uFlapSpeed;
      uniform float uFlapAngle;
      
      void main() {
        vec3 pos = position;
        vNormal = normalMatrix * normal;
        
        if (wingSide > 0.1) {
          // Pivot around Right Shoulder (x = 1.5)
          float angle = sin(uTime * uFlapSpeed) * uFlapAngle;
          float s = sin(angle);
          float c = cos(angle);
          
          float x = pos.x - 1.5;
          float y = pos.y;
          pos.x = x * c - y * s + 1.5;
          pos.y = x * s + y * c;
        } else if (wingSide < -0.1) {
          // Pivot around Left Shoulder (x = -1.5)
          float angle = -sin(uTime * uFlapSpeed) * uFlapAngle;
          float s = sin(angle);
          float c = cos(angle);
          
          float x = pos.x + 1.5;
          float y = pos.y;
          pos.x = x * c - y * s - 1.5;
          pos.y = x * s + y * c;
        }
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      uniform vec3 uColor;
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
        float diffuse = max(0.2, dot(normal, lightDir));
        
        vec3 finalColor = uColor * diffuse;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uFlapSpeed: { value: 9.0 },
      uFlapAngle: { value: 0.55 },
      uColor: { value: new THREE.Color(0.95, 0.95, 0.95) }
    },
    side: THREE.DoubleSide
  });
}
