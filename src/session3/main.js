import * as THREE from 'three';

// Basic Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting (for Lambert & Phong materials)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Load textures
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

const tex1 = loader.load('https://picsum.photos/512/512?random=1');
const tex2 = loader.load('https://picsum.photos/512/512?random=2');
const tex3 = loader.load('https://picsum.photos/512/512?random=3');
const tex4 = loader.load('https://picsum.photos/512/512?random=4');
const tex5 = loader.load('https://picsum.photos/512/512?random=5');
const tex6 = loader.load('https://picsum.photos/512/512?random=6');

// Shape 1: Box
const geo1 = new THREE.BoxGeometry(1, 1, 1);
const mat1 = new THREE.MeshBasicMaterial({ map: tex1 });
const mesh1 = new THREE.Mesh(geo1, mat1);
mesh1.position.set(-4, 0, 0);
scene.add(mesh1);

// Shape 2: Sphere
const geo2 = new THREE.SphereGeometry(0.6, 32, 32);
const mat2 = new THREE.MeshLambertMaterial({ map: tex2 });
const mesh2 = new THREE.Mesh(geo2, mat2);
mesh2.position.set(-2.5, 0, 0);
scene.add(mesh2);

// Shape 3: Cylinder
const geo3 = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const mat3 = new THREE.MeshPhongMaterial({ map: tex3, bumpMap: tex3, bumpScale: 0.9 });
const mesh3 = new THREE.Mesh(geo3, mat3);
mesh3.position.set(-1, 0, 0);
scene.add(mesh3);

// Shape 4: Cone
const geo4 = new THREE.ConeGeometry(0.5, 1, 32);
const mat4 = new THREE.MeshStandardMaterial({ map: tex4 });
const mesh4 = new THREE.Mesh(geo4, mat4);
mesh4.position.set(0.5, 0, 0);
scene.add(mesh4);

// Shape 5: Torus
const geo5 = new THREE.TorusGeometry(0.4, 0.2, 16, 100);
const mat5 = new THREE.MeshToonMaterial({ map: tex5 });
const mesh5 = new THREE.Mesh(geo5, mat5);
mesh5.position.set(2, 0, 0);
scene.add(mesh5);

// Shape 6: Plane
const geo6 = new THREE.PlaneGeometry(1, 1);
const mat6 = new THREE.MeshPhysicalMaterial({ map: tex6, side: THREE.DoubleSide });
const mesh6 = new THREE.Mesh(geo6, mat6);
mesh6.position.set(3.5, 0, 0);
scene.add(mesh6);

camera.position.z = 6;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const meshes = [mesh1, mesh2, mesh3, mesh4, mesh5, mesh6];
    meshes.forEach(m => {
        m.rotation.x += 0.01;
        m.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

animate();
