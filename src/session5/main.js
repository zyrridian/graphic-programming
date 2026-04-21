import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// Session 5 practical:
// - Transform fundamentals (position, rotation, scale)
// - Keyboard-based object movement
// - Real-time transform controls with GUI

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(5, 4, 8);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
const directional = new THREE.DirectionalLight(0xffffff, 1.2);
directional.position.set(5, 8, 4);
directional.castShadow = true;
scene.add(ambient, directional);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x8a8a8a }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(40, 40, 0xff0000, 0x00ff00);
scene.add(grid);

const axes = new THREE.AxesHelper(3);
scene.add(axes);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: 0x0a2dff }),
);
box.castShadow = true;
box.position.set(0, 1, 0);
scene.add(box);

const hud = document.createElement("div");
hud.style.position = "fixed";
hud.style.left = "12px";
hud.style.bottom = "12px";
hud.style.padding = "10px 12px";
hud.style.background = "rgba(0,0,0,0.55)";
hud.style.color = "white";
hud.style.fontFamily = "monospace";
hud.style.fontSize = "12px";
hud.style.lineHeight = "1.45";
hud.style.borderRadius = "8px";
hud.textContent = "WASD: geser X/Z | Q/E: naik/turun Y | R: reset";
document.body.appendChild(hud);

const params = {
  posX: box.position.x,
  posY: box.position.y,
  posZ: box.position.z,
  rotX: box.rotation.x,
  rotY: box.rotation.y,
  rotZ: box.rotation.z,
  scaleX: box.scale.x,
  scaleY: box.scale.y,
  scaleZ: box.scale.z,
  autoRotate: true,
  reset() {
    // Keep reset logic in one place so GUI and keyboard can reuse it.
    box.position.set(0, 1, 0);
    box.rotation.set(0, 0, 0);
    box.scale.set(1, 1, 1);
    syncParamsFromObject();
    refreshGuiDisplay();
  },
};

const gui = new GUI({ title: "Pertemuan 5 - Transform" });
const positionFolder = gui.addFolder("Position");
const rotationFolder = gui.addFolder("Rotation");
const scaleFolder = gui.addFolder("Scale");

const controllers = [];

controllers.push(
  positionFolder
    .add(params, "posX", -10, 10, 0.1)
    .name("x")
    .onChange((value) => {
      box.position.x = value;
    }),
);
controllers.push(
  positionFolder
    .add(params, "posY", 0, 10, 0.1)
    .name("y")
    .onChange((value) => {
      box.position.y = value;
    }),
);
controllers.push(
  positionFolder
    .add(params, "posZ", -10, 10, 0.1)
    .name("z")
    .onChange((value) => {
      box.position.z = value;
    }),
);

controllers.push(
  rotationFolder
    .add(params, "rotX", -Math.PI, Math.PI, 0.01)
    .name("x")
    .onChange((value) => {
      box.rotation.x = value;
    }),
);
controllers.push(
  rotationFolder
    .add(params, "rotY", -Math.PI, Math.PI, 0.01)
    .name("y")
    .onChange((value) => {
      box.rotation.y = value;
    }),
);
controllers.push(
  rotationFolder
    .add(params, "rotZ", -Math.PI, Math.PI, 0.01)
    .name("z")
    .onChange((value) => {
      box.rotation.z = value;
    }),
);

controllers.push(
  scaleFolder
    .add(params, "scaleX", 0.2, 4, 0.1)
    .name("x")
    .onChange((value) => {
      box.scale.x = value;
    }),
);
controllers.push(
  scaleFolder
    .add(params, "scaleY", 0.2, 4, 0.1)
    .name("y")
    .onChange((value) => {
      box.scale.y = value;
    }),
);
controllers.push(
  scaleFolder
    .add(params, "scaleZ", 0.2, 4, 0.1)
    .name("z")
    .onChange((value) => {
      box.scale.z = value;
    }),
);

gui.add(params, "autoRotate").name("autoRotate");
gui.add(params, "reset").name("reset");
positionFolder.open();

const keyboard = {
  w: false,
  a: false,
  s: false,
  d: false,
  q: false,
  e: false,
};

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key in keyboard) {
    keyboard[key] = true;
  }

  if (key === "r") {
    params.reset();
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key in keyboard) {
    keyboard[key] = false;
  }
});

function syncParamsFromObject() {
  // Keep GUI values in sync with keyboard and animation updates.
  params.posX = box.position.x;
  params.posY = box.position.y;
  params.posZ = box.position.z;
  params.rotX = box.rotation.x;
  params.rotY = box.rotation.y;
  params.rotZ = box.rotation.z;
  params.scaleX = box.scale.x;
  params.scaleY = box.scale.y;
  params.scaleZ = box.scale.z;
}

function refreshGuiDisplay() {
  for (const controller of controllers) {
    controller.updateDisplay();
  }
}

function updateKeyboardControl(deltaTime) {
  // Multiply by deltaTime to keep motion frame-rate independent.
  const speed = 4 * deltaTime;

  if (keyboard.a) box.position.x -= speed;
  if (keyboard.d) box.position.x += speed;
  if (keyboard.w) box.position.z -= speed;
  if (keyboard.s) box.position.z += speed;
  if (keyboard.q) box.position.y += speed;
  if (keyboard.e) box.position.y -= speed;

  // Prevent the object from going below the floor.
  box.position.y = Math.max(0.5, box.position.y);
}

const clock = new THREE.Clock();

function animate() {
  const deltaTime = clock.getDelta();
  updateKeyboardControl(deltaTime);

  if (params.autoRotate) {
    box.rotation.y += deltaTime * 0.8;
  }

  syncParamsFromObject();
  refreshGuiDisplay();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(animate);
