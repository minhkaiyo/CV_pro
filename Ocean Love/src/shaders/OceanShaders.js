/* src/shaders/OceanShaders.js
   ES Module containing all FFT Ocean GLSL Shaders
   Date: 2026-05-24
*/

export const Shaders = {
  // Vertex shader used in all 2D simulation passes (spectrum, phase, FFT, normal calculation)
  simVertex: `
    varying vec2 vUV;
    void main() {
      vUV = position.xy * 0.5 + 0.5;
      gl_Position = vec4(position, 1.0);
    }
  `,

  // Stockham FFT subtransform fragment shader
  subtransform: `
    const float PI = 3.14159265359;
    uniform sampler2D u_input;
    uniform float u_transformSize;
    uniform float u_subtransformSize;
    varying vec2 vUV;
    
    vec2 multiplyComplex(vec2 a, vec2 b) {
      return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);
    }
    
    void main() {
      #ifdef HORIZONTAL
        float index = vUV.x * u_transformSize - 0.5;
      #else
        float index = vUV.y * u_transformSize - 0.5;
      #endif
      
      float evenIndex = floor(index / u_subtransformSize) * (u_subtransformSize * 0.5) + mod(index, u_subtransformSize * 0.5);
      
      #ifdef HORIZONTAL
        vec4 even = texture2D(u_input, vec2(evenIndex + 0.5, gl_FragCoord.y) / u_transformSize).rgba;
        vec4 odd = texture2D(u_input, vec2(evenIndex + u_transformSize * 0.5 + 0.5, gl_FragCoord.y) / u_transformSize).rgba;
      #else
        vec4 even = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + 0.5) / u_transformSize).rgba;
        vec4 odd = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + u_transformSize * 0.5 + 0.5) / u_transformSize).rgba;
      #endif
      
      float twiddleArgument = -2.0 * PI * (index / u_subtransformSize);
      vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));
      
      vec2 outputA = even.xy + multiplyComplex(twiddle, odd.xy);
      vec2 outputB = even.zw + multiplyComplex(twiddle, odd.zw);
      
      gl_FragColor = vec4(outputA, outputB);
    }
  `,

  // Initial wave frequency spectrum generation
  initialSpectrum: `
    const float PI = 3.14159265359;
    const float G = 9.81;
    const float KM = 370.0;
    const float CM = 0.23;
    
    uniform vec2 u_wind;
    uniform float u_resolution;
    uniform float u_size;
    
    float square(float x) { return x * x; }
    float omega(float k) { return sqrt(G * k * (1.0 + square(k / KM))); }
    float tanh(float x) { return (1.0 - exp(-2.0 * x)) / (1.0 + exp(-2.0 * x)); }
    
    void main() {
      vec2 coordinates = gl_FragCoord.xy - 0.5;
      float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;
      float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;
      vec2 K = (2.0 * PI * vec2(n, m)) / u_size;
      float k = length(K);
      float l_wind = length(u_wind);
      
      float Omega = 0.84;
      float kp = G * square(Omega / l_wind);
      float c = omega(k) / k;
      float cp = omega(kp) / kp;
      float Lpm = exp(-1.25 * square(kp / k));
      
      float gamma = 1.7;
      float sigma = 0.08 * (1.0 + 4.0 * pow(Omega, -3.0));
      float Gamma = exp(-square(sqrt(k / kp) - 1.0) / (2.0 * square(sigma)));
      float Jp = pow(gamma, Gamma);
      float Fp = Lpm * Jp * exp(-Omega / sqrt(10.0) * (sqrt(k / kp) - 1.0));
      
      float alphap = 0.006 * sqrt(Omega);
      float Bl = 0.5 * alphap * cp / c * Fp;
      
      float z0 = 0.000037 * square(l_wind) / G * pow(l_wind / cp, 0.9);
      float uStar = 0.41 * l_wind / log(10.0 / z0);
      float alpham = 0.01 * ((uStar < CM) ? (1.0 + log(uStar / CM)) : (1.0 + 3.0 * log(uStar / CM)));
      float Fm = exp(-0.25 * square(k / KM - 1.0));
      float Bh = 0.5 * alpham * CM / c * Fm * Lpm;
      
      float a0 = log(2.0) / 4.0;
      float am = 0.13 * uStar / CM;
      float Delta = tanh(a0 + 4.0 * pow(c / cp, 2.5) + am * pow(CM / c, 2.5));
      
      float cosPhi = dot(normalize(u_wind), normalize(K));
      float S = (1.0 / (2.0 * PI)) * pow(k, -4.0) * (Bl + Bh) * (1.0 + Delta * (2.0 * cosPhi * cosPhi - 1.0));
      
      float dk = 2.0 * PI / u_size;
      float h = sqrt(S / 2.0) * dk;
      
      if (K.x == 0.0 && K.y == 0.0) {
        h = 0.0;
      }
      gl_FragColor = vec4(h, 0.0, 0.0, 0.0);
    }
  `,

  // Evolution of wave phase over time delta
  phase: `
    const float PI = 3.14159265359;
    const float G = 9.81;
    const float KM = 370.0;
    varying vec2 vUV;
    
    uniform sampler2D u_phases;
    uniform float u_deltaTime;
    uniform float u_resolution;
    uniform float u_size;
    
    float omega(float k) { return sqrt(G * k * (1.0 + k * k / (KM * KM))); }
    
    void main() {
      vec2 coordinates = gl_FragCoord.xy - 0.5;
      float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;
      float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;
      vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;
      
      float phase = texture2D(u_phases, vUV).r;
      float deltaPhase = omega(length(waveVector)) * u_deltaTime;
      phase = mod(phase + deltaPhase, 2.0 * PI);
      
      gl_FragColor = vec4(phase, 0.0, 0.0, 0.0);
    }
  `,

  // Current wave spectrum synthesis
  spectrum: `
    const float PI = 3.14159265359;
    const float G = 9.81;
    const float KM = 370.0;
    varying vec2 vUV;
    
    uniform float u_size;
    uniform float u_resolution;
    uniform float u_choppiness;
    uniform sampler2D u_phases;
    uniform sampler2D u_initialSpectrum;
    
    vec2 multiplyComplex(vec2 a, vec2 b) {
      return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);
    }
    
    vec2 multiplyByI(vec2 z) {
      return vec2(-z[1], z[0]);
    }
    
    void main() {
      vec2 coordinates = gl_FragCoord.xy - 0.5;
      float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;
      float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;
      vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;
      
      float phase = texture2D(u_phases, vUV).r;
      vec2 phaseVector = vec2(cos(phase), sin(phase));
      
      vec2 h0 = texture2D(u_initialSpectrum, vUV).rg;
      vec2 h0Star = texture2D(u_initialSpectrum, vec2(1.0 - vUV + 1.0 / u_resolution)).rg;
      h0Star.y *= -1.0;
      
      vec2 h = multiplyComplex(h0, phaseVector) + multiplyComplex(h0Star, vec2(phaseVector.x, -phaseVector.y));
      vec2 hX = -multiplyByI(h * (waveVector.x / length(waveVector))) * u_choppiness;
      vec2 hZ = -multiplyByI(h * (waveVector.y / length(waveVector))) * u_choppiness;
      
      if (waveVector.x == 0.0 && waveVector.y == 0.0) {
        h = vec2(0.0);
        hX = vec2(0.0);
        hZ = vec2(0.0);
      }
      gl_FragColor = vec4(hX + multiplyByI(h), hZ);
    }
  `,

  // Deriving normal vectors from the computed displacement map
  normals: `
    varying vec2 vUV;
    uniform sampler2D u_displacementMap;
    uniform float u_resolution;
    uniform float u_size;
    
    void main() {
      float texel = 1.0 / u_resolution;
      float texelSize = u_size / u_resolution;
      
      vec3 center = texture2D(u_displacementMap, vUV).rgb;
      vec3 right = vec3(texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(texel, 0.0)).rgb - center;
      vec3 left = vec3(-texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(-texel, 0.0)).rgb - center;
      vec3 top = vec3(0.0, 0.0, -texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, -texel)).rgb - center;
      vec3 bottom = vec3(0.0, 0.0, texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, texel)).rgb - center;
      
      vec3 topRight = cross(right, top);
      vec3 topLeft = cross(top, left);
      vec3 bottomLeft = cross(left, bottom);
      vec3 bottomRight = cross(bottom, right);
      
      gl_FragColor = vec4(normalize(topRight + topLeft + bottomLeft + bottomRight), 1.0);
    }
  `,

  // Ocean Surface Rendering Shaders
  oceanSurfaceVert: `
    precision highp float;
    varying vec3 vWorldPosition;
    varying vec4 vReflectCoordinates;
    varying vec3 vCamPosition;
    
    uniform mat4 u_mirrorMatrix;
    uniform sampler2D u_displacementMap;
    uniform float u_geometrySize;
    uniform float u_size;
    
    // Projected grid plane intercept parameters
    const float infinite = 120000.0;
    const float screenScale = 1.2;
    const vec3 groundNormal = vec3(0.0, 1.0, 0.0);
    const float groundHeight = 0.0;
    
    vec3 interceptPlane(in vec3 source, in vec3 dir, in vec3 normal, float height) {
      float dist = (-height - dot(normal, source)) / dot(normal, dir);
      if (dist < 0.0) {
        return source + dir * dist;
      } else {
        return -(vec3(source.x, height, source.z) + vec3(dir.x, height, dir.z) * infinite);
      }
    }
    
    mat3 getRotation() {
      return mat3(
        viewMatrix[0].xyz,
        viewMatrix[1].xyz,
        viewMatrix[2].xyz
      );
    }
    
    vec3 getCameraPos(in mat3 rotation) {
      return -viewMatrix[3].xyz * rotation;
    }
    
    vec2 getImagePlan() {
      float focal = projectionMatrix[0].x;
      float aspect = projectionMatrix[1].y;
      return vec2((uv.x - 0.5) * screenScale * aspect, (uv.y - 0.5) * screenScale * focal);
    }
    
    vec3 getCamRay(in mat3 rotation, in vec2 screenUV) {
      return vec3(screenUV.x, screenUV.y, projectionMatrix[0].x) * rotation;
    }
    
    vec3 computeProjectedPosition() {
      mat3 cameraRotation = getRotation();
      vec3 camPos = getCameraPos(cameraRotation);
      vCamPosition = camPos;
      
      if (camPos.y < groundHeight) return vec3(0.0, 0.0, 0.0);
      
      vec2 screenUV = getImagePlan();
      vec3 ray = getCamRay(cameraRotation, screenUV);
      vec3 finalPos = interceptPlane(camPos, ray, groundNormal, groundHeight);
      
      float dist = length(finalPos);
      if (dist > infinite) {
        finalPos *= infinite / dist;
      }
      return finalPos;
    }
    
    void main() {
      vec3 screenPlaneWorldPos = computeProjectedPosition();
      
      // Calculate wave vertex displacement
      // Displacement texture scaling
      vec3 displacement = texture2D(u_displacementMap, screenPlaneWorldPos.xz * 0.002).rgb * (u_geometrySize / u_size);
      vec4 oceanfftWorldPosition = vec4(screenPlaneWorldPos + displacement, 1.0);
      
      vWorldPosition = oceanfftWorldPosition.xyz;
      vReflectCoordinates = u_mirrorMatrix * oceanfftWorldPosition;
      
      gl_Position = projectionMatrix * viewMatrix * oceanfftWorldPosition;
    }
  `,

  oceanSurfaceFrag: `
    precision highp float;
    varying vec3 vWorldPosition;
    varying vec4 vReflectCoordinates;
    varying vec3 vCamPosition;
    
    uniform sampler2D u_reflection;
    uniform sampler2D u_normalMap;
    uniform vec3 u_oceanColor;
    uniform vec3 u_skyColor;
    uniform vec3 u_sunDirection;
    uniform float u_exposure;
    
    vec3 hdr(vec3 color, float exposure) {
      return 1.0 - exp(-color * exposure);
    }
    
    void main() {
      vec3 normal = texture2D(u_normalMap, vWorldPosition.xz * 0.002).rgb;
      vec3 view = normalize(vCamPosition - vWorldPosition);
      
      // Specular reflection (Sun light highlight)
      vec3 specReflection = normalize(reflect(-u_sunDirection, normal));
      float specularFactor = pow(max(0.0, dot(view, specReflection)), 400.0) * 35.0;
      
      // Distortion for reflection map based on normal vectors
      vec3 distortion = 180.0 * normal * vec3(1.0, 0.0, 0.15);
      vec3 reflectionColor = texture2DProj(u_reflection, vReflectCoordinates.xyz + distortion).xyz;
      
      // Distance decay for normal details (smooths normal map at a distance to prevent aliasing)
      float distanceRatio = min(1.0, log(1.0 / length(vCamPosition - vWorldPosition) * 4000.0 + 1.0));
      distanceRatio *= distanceRatio;
      distanceRatio = distanceRatio * 0.7 + 0.3;
      normal = (distanceRatio * normal + vec3(0.0, 1.0 - distanceRatio, 0.0)) * 0.5;
      normal = normalize(normal);
      
      // Fresnel effect
      float fresnel = pow(1.0 - dot(normal, view), 3.0);
      
      // Subsurface scattering & water color mix
      vec3 sssColor = vec3(0.0, 0.25, 0.2) * max(0.0, dot(view, -u_sunDirection)) * pow(fresnel, 2.0);
      vec3 waterColor = mix(u_oceanColor, vec3(0.05, 0.25, 0.3), fresnel * 0.5) + sssColor;
      
      // Foam factor (rough estimation based on displacement height slope)
      float foamFactor = clamp(max(0.0, normal.y) * (1.0 - normal.y) * 4.5, 0.0, 1.0);
      vec3 foamColor = vec3(0.85, 0.92, 0.95) * foamFactor * 0.15;
      
      // Compute final color
      float skyFactor = (fresnel + 0.15) * 8.0;
      vec3 color = (skyFactor * u_skyColor + specularFactor + waterColor) * reflectionColor + waterColor * 0.4 + foamColor;
      
      // HDR Tone mapping
      color = hdr(color, u_exposure);
      
      // Horizon fading to blend with atmosphere
      float dist = length(vCamPosition - vWorldPosition);
      float fogAmount = clamp((dist - 15000.0) / 105000.0, 0.0, 1.0);
      color = mix(color, u_skyColor * 0.9, fogAmount);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Volumetric Procedural Cloud Dome Shader
  cloudVert: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  cloudFrag: `
    uniform float time;
    uniform float depth;
    uniform float sharp;
    uniform float cover;
    uniform float clouds;
    uniform sampler2D texture;
    varying vec2 vUv;
    
    vec3 noise3(vec2 p) {
      return texture2D(texture, p).xyz;
    }
    
    vec3 fNoise(vec2 uv) {
      vec3 f = vec3(0.0);
      float scale = 1.0;
      for (int i = 0; i < 5; i++) {
        scale *= 2.0;
        f += noise3(uv * scale) / scale;
      }
      return f;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Multi-layered speed fractal noise
      vec3 ff1 = fNoise(uv * 0.01 + time * 0.0001 * vec2(-1.0, 1.0));
      vec3 ff2 = fNoise(uv * 0.08 + time * 0.0004 * vec2(1.0, 0.7));
      
      float t = ff1.x * 0.88 + ff1.y * 0.12;
      t = t * 0.98 + ff2.x * 0.02;
      
      float o = clamp(length(uv * 2.0 - vec2(1.0)), 0.0, 1.0);
      o = 1.0 - o * o * o * o;
      o -= (1.0 - t) * 0.95;
      
      t = max(t - (1.0 - cover), 0.0);
      t = 1.0 - pow(1.0 - sharp, t);
      t = min(t * 1.8, 1.0);
      
      if (depth > 0.0) {
        if (o < 0.4 && t < 0.8) discard;
        gl_FragColor = vec4(gl_FragCoord.z, 1.0, 1.0, 1.0);
      } else {
        gl_FragColor = vec4(t, t, t, o * clouds);
      }
    }
  `
};
