import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class TextureGenerator {
  static createSmokeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(200, 200, 200, 1)');
    gradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.5)');
    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
  }

  static createExplosionTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
  }

  static createRainTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    const gradient = context.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, 'rgba(150, 200, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(150, 200, 255, 0)');

    context.fillStyle = gradient;
    context.fillRect(14, 0, 4, 128);

    return new THREE.CanvasTexture(canvas);
  }

  static createMagicTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    // Star shape
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, 128, 128);

    context.beginPath();
    context.moveTo(64, 10);
    context.quadraticCurveTo(64, 64, 118, 64);
    context.quadraticCurveTo(64, 64, 64, 118);
    context.quadraticCurveTo(64, 64, 10, 64);
    context.quadraticCurveTo(64, 64, 64, 10);
    context.closePath();

    context.fillStyle = 'rgba(200, 100, 255, 1)';
    context.fill();

    // Inner bright core
    context.beginPath();
    context.arc(64, 64, 8, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.fill();

    return new THREE.CanvasTexture(canvas);
  }
}

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
camera.position.y = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x111111);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;

const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
scene.add(gridHelper);

const particleCount = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = [];
const lifetimes = [];
const maxLifetimes = [];
const sizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

  velocities.push(new THREE.Vector3(0, 0, 0));
  lifetimes.push(Math.random());
  maxLifetimes.push(1.0);
  sizes[i] = 1.0;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const textures = {
  smoke: TextureGenerator.createSmokeTexture(),
  explosion: TextureGenerator.createExplosionTexture(),
  rain: TextureGenerator.createRainTexture(),
  magic: TextureGenerator.createMagicTexture()
};

const material = new THREE.PointsMaterial({
  size: 5,
  map: textures.smoke,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: false,
  color: 0xffffff
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

let currentEffect = 'smoke';

function resetParticle(index, effectType) {
  const i3 = index * 3;
  lifetimes[index] = 0;

  if (effectType === 'smoke') {
    // Spawn near bottom center
    positions[i3] = (Math.random() - 0.5) * 5;
    positions[i3 + 1] = -10 + (Math.random() - 0.5) * 2;
    positions[i3 + 2] = (Math.random() - 0.5) * 5;

    velocities[index].set(
      (Math.random() - 0.5) * 0.1,
      Math.random() * 0.1 + 0.05,
      (Math.random() - 0.5) * 0.1
    );
    maxLifetimes[index] = 2.0 + Math.random() * 2.0;
  }
  else if (effectType === 'explosion') {
    positions[i3] = 0;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;

    // Burst outwards spherically
    const phi = Math.acos(-1 + (2 * index) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;

    const speed = Math.random() * 0.8 + 0.2;
    velocities[index].set(
      Math.cos(theta) * Math.sin(phi) * speed,
      Math.cos(phi) * speed,
      Math.sin(theta) * Math.sin(phi) * speed
    );
    maxLifetimes[index] = 0.5 + Math.random() * 1.5;
  }
  else if (effectType === 'rain') {
    // Spawn high up and spread over a wide area
    positions[i3] = (Math.random() - 0.5) * 80;
    positions[i3 + 1] = 40 + Math.random() * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 80;

    velocities[index].set(
      0,
      - (Math.random() * 0.5 + 0.5),
      0
    );
    maxLifetimes[index] = 2.0;
  }
  else if (effectType === 'magic') {
    // Swirling orbit around the center
    const radius = 5 + Math.random() * 25;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 20;

    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = height;
    positions[i3 + 2] = Math.sin(angle) * radius;

    velocities[index].set(0, 0, 0);
    maxLifetimes[index] = 3.0 + Math.random() * 2.0;
  }
}

function updateParticles(deltaTime) {
  const positionsAttr = geometry.attributes.position;
  const posArray = positionsAttr.array;

  for (let i = 0; i < particleCount; i++) {
    lifetimes[i] += deltaTime;

    if (lifetimes[i] > maxLifetimes[i]) {
      resetParticle(i, currentEffect);
    }

    const i3 = i * 3;
    const lifeRatio = lifetimes[i] / maxLifetimes[i];

    if (currentEffect === 'smoke') {
      posArray[i3] += velocities[i].x;
      posArray[i3 + 1] += velocities[i].y;
      posArray[i3 + 2] += velocities[i].z;
      // Drift slightly as it rises
      velocities[i].x += (Math.random() - 0.5) * 0.01;
      velocities[i].z += (Math.random() - 0.5) * 0.01;
    }
    else if (currentEffect === 'explosion') {
      posArray[i3] += velocities[i].x;
      posArray[i3 + 1] += velocities[i].y;
      posArray[i3 + 2] += velocities[i].z;
      // Apply drag and gravity
      velocities[i].multiplyScalar(0.95);
      velocities[i].y -= 0.005;
    }
    else if (currentEffect === 'rain') {
      posArray[i3] += velocities[i].x;
      posArray[i3 + 1] += velocities[i].y;
      posArray[i3 + 2] += velocities[i].z;
    }
    else if (currentEffect === 'magic') {
      // Calculate polar coordinates for rotation
      const x = posArray[i3];
      const z = posArray[i3 + 2];
      const radius = Math.sqrt(x * x + z * z);
      const currentAngle = Math.atan2(z, x);

      const newAngle = currentAngle + 0.02;

      posArray[i3] = Math.cos(newAngle) * radius;
      posArray[i3 + 2] = Math.sin(newAngle) * radius;
      // Float up and down slightly based on lifetime
      posArray[i3 + 1] += Math.sin(lifetimes[i] * 5 + i) * 0.05;
    }
  }

  positionsAttr.needsUpdate = true;
}

function setEffect(effectType) {
  currentEffect = effectType;
  material.map = textures[effectType];

  if (effectType === 'smoke') {
    material.size = 15;
    material.blending = THREE.NormalBlending;
    material.opacity = 0.5;
    material.color.setHex(0xffffff);
    scene.fog.color.setHex(0x111111);
    renderer.setClearColor(0x111111);
  } else if (effectType === 'explosion') {
    material.size = 8;
    material.blending = THREE.AdditiveBlending;
    material.opacity = 1.0;
    material.color.setHex(0xffffff);
    scene.fog.color.setHex(0x000000);
    renderer.setClearColor(0x000000);
  } else if (effectType === 'rain') {
    material.size = 3;
    material.blending = THREE.AdditiveBlending;
    material.opacity = 0.6;
    material.color.setHex(0x88ccff);
    scene.fog.color.setHex(0x0a1020);
    renderer.setClearColor(0x0a1020);
  } else if (effectType === 'magic') {
    material.size = 10;
    material.blending = THREE.AdditiveBlending;
    material.opacity = 0.8;
    material.color.setHex(0xaa88ff);
    scene.fog.color.setHex(0x100a20);
    renderer.setClearColor(0x100a20);
  }

  material.needsUpdate = true;

  // Reset all particles to form the new effect
  for (let i = 0; i < particleCount; i++) {
    lifetimes[i] = Math.random() * maxLifetimes[i];
    resetParticle(i, currentEffect);
    if (effectType === 'explosion') {
      lifetimes[i] = 0;
    }
  }
}

// UI Controls
const buttons = document.querySelectorAll('#controls button');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    setEffect(button.getAttribute('data-type'));
  });
});

// Initialize first effect
setEffect('smoke');

// Render Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  controls.update();
  updateParticles(deltaTime);

  if (currentEffect === 'magic') {
    particles.rotation.y += 0.001;
  } else {
    particles.rotation.y = 0;
  }

  renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
