/* src/main.js
   Application Orchestrator - Integrates all modular subsystems for the Ocean Love cinematic 3D experience
   Date: 2026-05-24
*/

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { FFTOceanCompute } from './ocean/FFTOceanCompute.js';
import { OceanReflection } from './ocean/OceanReflection.js';
import { OceanMesh } from './ocean/OceanMesh.js';
import { ShipLoader } from './ship/ShipLoader.js';
import { ShipPhysics } from './ship/ShipPhysics.js';
import { SkySystem } from './environment/SkySystem.js';
import { CloudSystem } from './environment/CloudSystem.js';
import { EnvDetails } from './environment/EnvDetails.js';
import { DayNightCycle } from './environment/DayNightCycle.js';
import { CameraManager } from './camera/CameraManager.js';
import { BirdFlock } from './birds/BirdFlock.js';
import { PostProcessing } from './postprocessing/PostProcessing.js';
import { AudioSystem } from './audio/AudioSystem.js';
import { MinimalUI } from './ui/MinimalUI.js';

class Application {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    this.initLoadingManager();
    this.initCore();
    this.initEnvironment();
    this.initOcean();
    this.initShip();
    this.initBirds();
    this.initAudioAndUI();
    this.initPostProcessing();

    this.onWindowResize();
    window.addEventListener('resize', () => this.onWindowResize());

    this.animate();
  }

  initLoadingManager() {
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      if (this.ui) {
        this.ui.updateProgress(progress, 'Đang tải tài nguyên...');
      }
    };
    this.loadingManager.onLoad = () => {
      if (this.ui) {
        this.ui.updateProgress(100, 'Đã hoàn tất.');
      }
    };
    this.loadingManager.onError = (url) => {
      console.warn('Lỗi khi tải asset:', url);
    };
  }

  initCore() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xff7e5f, 0.000025);

    this.camera = new THREE.PerspectiveCamera(CONFIG.camera.baseFov, window.innerWidth / window.innerHeight, 0.5, 1000000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1.0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.getContext().getExtension('OES_texture_float');
    this.renderer.getContext().getExtension('OES_texture_float_linear');

    this.container.appendChild(this.renderer.domElement);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.dirLight.position.set(-0.7, 0.25, -1.0).normalize();
    this.scene.add(this.dirLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);
  }

  initEnvironment() {
    this.skySystem = new SkySystem(this.scene);
    this.skySystem.updateSun(2.0, 180.0); // Default sunset

    this.cloudSystem = new CloudSystem(this.scene);
    this.envDetails = new EnvDetails(this.scene, this.loadingManager);
  }

  initOcean() {
    this.fftCompute = new FFTOceanCompute(this.renderer, {
      resolution: CONFIG.ocean.resolution,
      size: CONFIG.ocean.size,
      choppiness: CONFIG.ocean.choppiness,
      windX: CONFIG.ocean.wind.x,
      windY: CONFIG.ocean.wind.y
    });

    this.reflection = new OceanReflection(this.renderer, this.camera, this.scene, {
      textureWidth: 512,
      textureHeight: 512,
      clipBias: 0.0
    });
    this.scene.add(this.reflection);

    this.oceanMesh = new OceanMesh(this.fftCompute, this.reflection);
    this.scene.add(this.oceanMesh.mesh);
  }

  initShip() {
    this.shipGroup = new THREE.Group();
    this.scene.add(this.shipGroup);

    const loader = new ShipLoader(this.loadingManager);
    loader.loadShip().then((shipModel) => {
      this.shipModel = shipModel;
      this.shipGroup.add(shipModel);
      this.addShipLanterns();
    });

    this.shipPhysics = new ShipPhysics(this.renderer, this.fftCompute);
    this.cameraManager = new CameraManager(this.camera, this.renderer.domElement, this.shipGroup);
  }

  addShipLanterns() {
    const createLantern = (pos) => {
      const light = new THREE.PointLight(0xffaa44, 1.2, 80, 1.5);
      light.position.copy(pos);
      
      const bulbGeom = new THREE.SphereGeometry(1.5, 8, 8);
      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffbb66 });
      const bulb = new THREE.Mesh(bulbGeom, bulbMat);
      light.add(bulb);

      this.shipGroup.add(light);

      gsap.to(light, {
        intensity: 0.7 + Math.random() * 0.8,
        duration: 0.15 + Math.random() * 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'rough'
      });
    };

    createLantern(new THREE.Vector3(0, 32, -45));
    createLantern(new THREE.Vector3(0, 24, 45));
    createLantern(new THREE.Vector3(0, 55, 2));
  }

  initBirds() {
    this.birdsFlock = new BirdFlock(this.scene, this.camera, this.shipGroup);
    this.birdsFlock.onBirdClick((bird) => {
      this.cameraManager.followBird(bird);
    });
  }

  initAudioAndUI() {
    this.audioSystem = new AudioSystem(this.camera);
    this.audioSystem.loadSound();

    this.dayNightCycle = new DayNightCycle(
      this.scene,
      this.dirLight,
      this.ambientLight,
      this.skySystem,
      this.cloudSystem,
      this.oceanMesh
    );

    this.ui = new MinimalUI(this.dayNightCycle, this.audioSystem, this.cameraManager);
  }

  initPostProcessing() {
    this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);
  }

  onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.postProcessing.resize(w, h);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();
    const cappedDt = Math.min(dt, 0.1);
    const totalTime = this.clock.getElapsedTime();

    this.fftCompute.update(cappedDt);
    this.reflection.renderReflection();

    if (this.shipPhysics && this.shipModel) {
      this.shipPhysics.update(this.shipGroup, cappedDt);
    }

    this.cloudSystem.update(totalTime);
    this.envDetails.update(totalTime, this.dayNightCycle.currentMode);

    if (this.birdsFlock) {
      this.birdsFlock.update(cappedDt);
    }

    if (this.cameraManager) {
      this.cameraManager.update(cappedDt);
    }

    this.postProcessing.render(cappedDt);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Application();
});
