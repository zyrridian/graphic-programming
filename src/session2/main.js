import * as THREE from 'three';

// Basic Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube Vertices
const vertices = new Float32Array([
    -1, -1, 1, // 0
    1, 1, 1, // 1
    -1, 1, 1, // 2
    1, -1, 1, // 3
    -1, -1, -1, // 4
    1, 1, -1, // 5
    -1, 1, -1, // 6
    1, -1, -1  // 7
]);

// Indices for each cube face
const indices = [
    0, 3, 1, 0, 1, 2, // Front
    4, 6, 5, 4, 5, 7, // Back
    2, 1, 5, 2, 5, 6, // Top
    0, 4, 7, 0, 7, 3, // Bottom
    0, 2, 6, 0, 6, 4, // Left
    3, 7, 5, 3, 5, 1  // Right
];

// Geometry
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geo.setIndex(indices);

// Material and Mesh
const mat = new THREE.MeshBasicMaterial({ color: 0x427208, wireframe: true });
const cube = new THREE.Mesh(geo, mat);
scene.add(cube);

camera.position.z = 5;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Rotation animation
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();