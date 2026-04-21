import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";
import { FlyControls } from "three/examples/jsm/controls/FlyControls.js";

// Session 6 practical:
// - Background scene with skybox
// - Manual keyboard camera movement
// - Built-in camera controls (Orbit, FirstPerson, Fly)

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 0.45);
const sun = new THREE.DirectionalLight(0xffffff, 1.15);
sun.position.set(8, 12, 5);
sun.castShadow = true;
scene.add(ambient, sun);

const grid = new THREE.GridHelper(80, 80, 0xff0000, 0x00ff00);
scene.add(grid);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({
    color: 0x7f93aa,
    metalness: 0.05,
    roughness: 0.9,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 1.8, 1.8),
  new THREE.MeshStandardMaterial({ color: 0xaa1a1a }),
);
box.position.set(0, 0.9, 0);
box.castShadow = true;
scene.add(box);

// Public skybox textures from official Three.js examples.
const skybox = new THREE.CubeTextureLoader().load([
  "https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/negz.jpg",
]);
scene.background = skybox;

const label = document.createElement("div");
label.style.position = "fixed";
label.style.top = "12px";
label.style.left = "12px";
label.style.padding = "10px 12px";
label.style.background = "rgba(0,0,0,0.6)";
label.style.color = "white";
label.style.fontFamily = "monospace";
label.style.fontSize = "12px";
label.style.lineHeight = "1.45";
label.style.borderRadius = "8px";
document.body.appendChild(label);

const modeNames = {
  manual: "MANUAL KEYBOARD",
  orbit: "ORBIT CONTROLS",
  firstPerson: "FIRST PERSON CONTROLS",
  fly: "FLY CONTROLS",
};

const keyboard = {
  w: false,
  a: false,
  s: false,
  d: false,
  q: false,
  e: false,
};

let mode = "manual";

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.enabled = false;

const firstPerson = new FirstPersonControls(camera, renderer.domElement);
firstPerson.lookSpeed = 0.08;
firstPerson.movementSpeed = 7;
firstPerson.enabled = false;

const fly = new FlyControls(camera, renderer.domElement);
fly.movementSpeed = 8;
fly.rollSpeed = 0.8;
fly.dragToLook = true;
fly.autoForward = false;
fly.enabled = false;

function updateLabel() {
  label.innerHTML =
    `Mode: ${modeNames[mode]}<br>` +
    "1: Manual | 2: Orbit | 3: FirstPerson | 4: Fly<br>" +
    "Manual keys: WASD (X/Z), Q/E (Y)";
}

function setMode(nextMode) {
  mode = nextMode;

  orbit.enabled = mode === "orbit";
  firstPerson.enabled = mode === "firstPerson";
  fly.enabled = mode === "fly";

  // Re-focus on the target object when switching back to non-FPS modes.
  if (mode === "manual" || mode === "orbit") {
    camera.lookAt(box.position);
  }

  updateLabel();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key in keyboard) {
    keyboard[key] = true;
  }

  if (key === "1") setMode("manual");
  if (key === "2") setMode("orbit");
  if (key === "3") setMode("firstPerson");
  if (key === "4") setMode("fly");
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key in keyboard) {
    keyboard[key] = false;
  }
});

function updateManualControl(deltaTime) {
  // Delta-based speed keeps movement consistent across devices.
  const speed = 6 * deltaTime;

  if (keyboard.w) camera.position.z -= speed;
  if (keyboard.s) camera.position.z += speed;
  if (keyboard.a) camera.position.x -= speed;
  if (keyboard.d) camera.position.x += speed;
  if (keyboard.q) camera.position.y += speed;
  if (keyboard.e) camera.position.y -= speed;

  camera.lookAt(box.position);
}

const clock = new THREE.Clock();

function animate() {
  const deltaTime = clock.getDelta();

  box.rotation.y += deltaTime * 0.5;

  if (mode === "manual") {
    updateManualControl(deltaTime);
  } else if (mode === "orbit") {
    orbit.update();
  } else if (mode === "firstPerson") {
    firstPerson.update(deltaTime);
  } else if (mode === "fly") {
    fly.update(deltaTime);
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  firstPerson.handleResize();
});

setMode("manual");
renderer.setAnimationLoop(animate);
