import * as THREE from "three";

// Basic Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6edf5);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const lights = {
  ambient: new THREE.AmbientLight(0xffffff, 0.3),
  hemisphere: new THREE.HemisphereLight(0xddeeff, 0x2f3a30, 0.55),
  directional: new THREE.DirectionalLight(0xffffff, 1.2),
  point: new THREE.PointLight(0x88aaff, 15, 15),
  spot: new THREE.SpotLight(0xff66cc, 12, 8, Math.PI / 5, 0.45),
};

lights.directional.position.set(3, 5, 2);
lights.directional.castShadow = true;
lights.directional.shadow.mapSize.width = 1024;
lights.directional.shadow.mapSize.height = 1024;
lights.directional.shadow.camera.near = 0.5;
lights.directional.shadow.camera.far = 20;
lights.directional.shadow.camera.left = -6;
lights.directional.shadow.camera.right = 6;
lights.directional.shadow.camera.top = 6;
lights.directional.shadow.camera.bottom = -6;

lights.point.position.set(2, 2, 2);
lights.spot.position.set(1.5, 3, 1);
lights.spot.castShadow = true;

scene.add(
  lights.ambient,
  lights.hemisphere,
  lights.directional,
  lights.point,
  lights.spot,
);

// Default Light States
lights.ambient.visible = false;
lights.hemisphere.visible = true;
lights.directional.visible = true;
lights.point.visible = false;
lights.spot.visible = false;

function createLightSwitchUI() {
  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.top = "12px";
  panel.style.left = "12px";
  panel.style.padding = "8px 10px";
  panel.style.borderRadius = "8px";
  panel.style.background = "rgba(255, 255, 255, 0.9)";
  panel.style.fontFamily = "Arial, sans-serif";
  panel.style.fontSize = "13px";
  panel.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
  panel.style.display = "grid";
  panel.style.gap = "6px";

  const title = document.createElement("strong");
  title.textContent = "Lights";
  panel.appendChild(title);

  const options = [
    { key: "ambient", label: "Ambient" },
    { key: "hemisphere", label: "Hemisphere" },
    { key: "directional", label: "Directional" },
    { key: "point", label: "Point" },
    { key: "spot", label: "Spot" },
  ];

  for (const option of options) {
    const row = document.createElement("label");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "6px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = lights[option.key].visible;
    checkbox.addEventListener("change", () => {
      lights[option.key].visible = checkbox.checked;
    });

    const text = document.createElement("span");
    text.textContent = option.label;

    row.append(checkbox, text);
    panel.appendChild(row);
  }

  document.body.appendChild(panel);
}

// Floor
const floor = new THREE.PlaneGeometry(100, 100, 10, 10);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const floorMesh = new THREE.Mesh(floor, floorMaterial);
floorMesh.receiveShadow = true;
floorMesh.position.set(0, -1, 0);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

// Box
const box = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const boxMesh = new THREE.Mesh(box, boxMaterial);
boxMesh.castShadow = true;

scene.add(boxMesh);

createLightSwitchUI();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  boxMesh.rotation.x += 0.01;
  boxMesh.rotation.y += 0.01;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
