/* src/config.js
   Global configurations for the Ocean Love experience
   Date: 2026-05-24
*/

export const CONFIG = {
  // FFT Ocean Settings
  ocean: {
    size: 250.0,
    wind: { x: 5.0, y: 5.0 },     // Gentle wind
    choppiness: 1.5,               // Gentle wave peaks
    geometryResolution: 256,
    geometrySize: 512,
    resolution: 512,              // FFT simulation grid size
    oceanColor: { r: 0.05, g: 0.15, b: 0.25 },
    skyColor: { r: 0.4, g: 0.5, b: 0.6 }
  },

  // Ship movement and float offset
  ship: {
    baseY: 10.0,
    smoothFactor: 0.03
  },

  // Flocking system for seagulls
  birds: {
    count: 20,
    separationRadius: 25.0,
    alignmentRadius: 60.0,
    cohesionRadius: 90.0,
    attractionToShip: 0.05,
    minHeight: 120,
    maxHeight: 280,
    speed: { min: 8.0, max: 18.0 }
  },

  // Camera settings
  camera: {
    orbitSpeed: 0.02,
    baseFov: 55,
    followFov: 65,
    swayIntensity: 0.15,
    swaySpeed: 0.4
  }
};
