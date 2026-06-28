window.addEventListener('error', function (event) {
    document.body.innerHTML += '<div style="background: white; padding: 20px; border: 5px solid red; color:red; z-index:9999; position:absolute; top:0; left: 0;"><b>RUNTIME ERROR:</b> ' + event.error.stack + '</div>';
});
window.addEventListener('unhandledrejection', function (event) {
    document.body.innerHTML += '<div style="background: white; padding: 20px; border: 5px solid red; color:red; z-index:9999; position:absolute; top:0; left: 0;"><b>PROMISE ERROR:</b> ' + event.reason + '</div>';
});

import { VirtualJoystick, ActionButton } from './utils';
import { CharacterControls } from './characterControls';
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import GUI from 'lil-gui';
import * as CANNON from 'cannon-es';
import { MapManager } from './mapManager';
const settings = {
    lightIntensity: 1,
    walkVelocity: 2,
    runVelocity: 5,
    toggleShadows: false,
    enableSkybox: false,
    enableAudio: false, // start false to avoid autoplay issues
    currentMapId: 'map1'
};

// SCENE
const scene = new THREE.Scene();
const defaultBgColor = new THREE.Color(0xa8def0);
scene.background = defaultBgColor;

// SKYBOX (Requirement Environment)
const cubeTextureLoader = new THREE.CubeTextureLoader();
let skyboxTexture: THREE.CubeTexture;
cubeTextureLoader.setPath('./textures/skybox/');
skyboxTexture = cubeTextureLoader.load([
    'posx.jpg', 'negx.jpg',
    'posy.jpg', 'negy.jpg',
    'posz.jpg', 'negz.jpg'
], (texture) => {
    if (settings.enableSkybox) {
        scene.background = texture;
    }
});

// PHYSICS WORLD (Requirement G)
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});
const physicsMaterial = new CANNON.Material('standard');
const physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
    friction: 0.4,
    restitution: 0.7 // bounce
});
world.addContactMaterial(physicsContactMaterial);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = -2.54;
camera.position.y = 1.58;
camera.position.z = 6.34;

// CSS SCREEN FLASH
const screenFlash = document.createElement('div');
screenFlash.style.position = 'absolute';
screenFlash.style.top = '0';
screenFlash.style.left = '0';
screenFlash.style.width = '100vw';
screenFlash.style.height = '100vh';
screenFlash.style.backgroundColor = 'black'; // Dark teleport vibe
screenFlash.style.opacity = '0';
screenFlash.style.pointerEvents = 'none';
screenFlash.style.transition = 'opacity 0.28s ease-out';
screenFlash.style.zIndex = '9999';
document.body.appendChild(screenFlash);

// AUDIO (Requirement Immersion)
const listener = new THREE.AudioListener();
camera.add(listener);

const bgmSound = new THREE.Audio(listener);
const punchSound = new THREE.Audio(listener);
const teleportSound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('./audio/bgm.mp3', function (buffer) {
    bgmSound.setBuffer(buffer);
    bgmSound.setLoop(true);
    bgmSound.setVolume(0.2);
    // Background music usually requires user interaction to play in modern browsers,
    // so we'll start it if enableAudio is true when they first click or via GUI.
});
audioLoader.load('./audio/punch.mp3', function (buffer) {
    punchSound.setBuffer(buffer);
    punchSound.setVolume(1.0);
});
audioLoader.load('./audio/teleport.wav', function (buffer) {
    teleportSound.setBuffer(buffer);
    teleportSound.setVolume(0.8);
});

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = settings.toggleShadows

// POST PROCESSING (Teleport Effect)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false;
glitchPass.goWild = true; // intense teleport vibe
composer.addPass(glitchPass);

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
// IMPORTANT: Change to right-click for rotating
orbitControls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN, // Panning is disabled, so this acts as 'NONE'
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
};
orbitControls.update();

// LIGHTS
let dirLight: THREE.DirectionalLight;
let ambientLight: THREE.AmbientLight;
light()

// Array to hold walk-able surfaces for raycasting
const environmentMeshes: THREE.Object3D[] = [];

// MAP MANAGER
const mapManager = new MapManager(scene, world, environmentMeshes, physicsMaterial);

mapManager.registerMap({
    id: 'map1',
    name: 'Dungeon',
    glbPath: 'models/dungeon.glb',
    spawnPoint: new THREE.Vector3(10.13, 0.40, 16.03),
    scale: 1,
});

mapManager.registerMap({
    id: 'map2',
    name: 'Field',
    glbPath: 'models/collision-world.glb',
    spawnPoint: new THREE.Vector3(20, 2, 20),
    scale: 1,
    setup: (scene, world, envMeshes, physMat, manager) => {
        const textureLoader = new THREE.TextureLoader();
        const grassColor = textureLoader.load("./textures/terrain/grasslight-big.jpg");
        grassColor.wrapS = grassColor.wrapT = THREE.RepeatWrapping;
        grassColor.repeat.set(20, 20); // Grass usually looks better tiled more

        const geometry = new THREE.PlaneGeometry(80, 80, 512, 512);
        const material = new THREE.MeshStandardMaterial({
            map: grassColor
        });

        const floor = new THREE.Mesh(geometry, material);
        floor.receiveShadow = true;
        floor.rotation.x = - Math.PI / 2;
        scene.add(floor);
        envMeshes.push(floor);
        manager.trackObject(floor);

        // Physics floor body
        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({ mass: 0, material: physMat });
        floorBody.addShape(floorShape);
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        world.addBody(floorBody);
        manager.trackBody(floorBody);
    }
});

mapManager.loadMap(settings.currentMapId).then((config) => {
    if (characterControls) {
        characterControls.model.position.copy(config.spawnPoint);
        characterControls.model.rotation.y = Math.PI; // Face forward (away from camera)
        characterControls.syncCamera();
    }
});

// GUI (Requirement E)
const gui = new GUI();
gui.add(settings, 'lightIntensity', 0, 3).name('Light Intensity').onChange((v: number) => {
    if (dirLight) dirLight.intensity = v;
});
gui.add(settings, 'walkVelocity', 1, 10).name('Walk Speed').onChange((v: number) => {
    if (characterControls) characterControls.walkVelocity = v;
});
gui.add(settings, 'runVelocity', 1, 20).name('Run Speed').onChange((v: number) => {
    if (characterControls) characterControls.runVelocity = v;
});
gui.add(settings, 'toggleShadows').name('Enable Shadows').onChange((v: boolean) => {
    renderer.shadowMap.enabled = v;
    scene.traverse((child: any) => {
        if (child.material) {
            child.material.needsUpdate = true;
        }
    });
});
gui.add(settings, 'enableSkybox').name('Enable Skybox').onChange((v: boolean) => {
    if (v) {
        scene.background = skyboxTexture;
    } else {
        scene.background = defaultBgColor;
    }
});
gui.add(settings, 'enableAudio').name('Enable Audio (BGM)').onChange((v: boolean) => {
    if (v) {
        if (!bgmSound.isPlaying && bgmSound.buffer) bgmSound.play();
    } else {
        if (bgmSound.isPlaying) bgmSound.pause();
    }
});
export function triggerTeleportEffect(onPeak: () => void) {
    // START TELEPORT EFFECT
    glitchPass.enabled = true;
    screenFlash.style.opacity = '1';

    // Play Teleport Audio
    if (teleportSound.buffer) {
        if (teleportSound.isPlaying) teleportSound.stop();
        teleportSound.play();
    }

    // Animate FOV warp
    let warpInterval = setInterval(() => {
        camera.fov = Math.min(camera.fov + 10, 150);
        camera.updateProjectionMatrix();
    }, 16);

    setTimeout(() => {
        clearInterval(warpInterval);

        onPeak();

        // END TELEPORT EFFECT
        glitchPass.enabled = false;
        screenFlash.style.opacity = '0';

        // Snap FOV back
        camera.fov = 45;
        camera.updateProjectionMatrix();
    }, 300); // Wait 300ms for glitch/flash to peak
}

gui.add(settings, 'currentMapId', ['map1', 'map2']).name('Select Map').onChange((v: string) => {
    triggerTeleportEffect(() => {
        mapManager.loadMap(v).then((config) => {
            if (characterControls) {
                characterControls.model.position.copy(config.spawnPoint);
                playerBody.position.copy(config.spawnPoint as any);
                playerVelocityY = 0;

                // Reset camera instantly for the new map
                characterControls.model.rotation.y = Math.PI;
                characterControls.cameraTarget.set(config.spawnPoint.x, config.spawnPoint.y + 1, config.spawnPoint.z);
                characterControls.camera.position.set(-2.54 + config.spawnPoint.x, 1.58 + config.spawnPoint.y, 6.34 + config.spawnPoint.z);
                characterControls.orbitControl.target.copy(characterControls.cameraTarget);

                // Reposition dummies near the new spawn point
                dummies.forEach((dummy, idx) => {
                    const offset = new THREE.Vector3(Math.cos(idx) * 2, 2, Math.sin(idx) * 2);
                    const spawn = config.spawnPoint.clone().add(offset);
                    dummy.body.position.copy(spawn as any);
                    dummy.body.velocity.set(0, 0, 0);
                });
            }
        });
    });
});

const emoteParams = {
    playDance: () => { if (characterControls) characterControls.playEmote('Dance'); },
    playDeath: () => { if (characterControls) characterControls.playEmote('Death'); },
    playNo: () => { if (characterControls) characterControls.playEmote('No'); },
    playSitting: () => { if (characterControls) characterControls.playEmote('Sitting'); },
    playThumbsUp: () => { if (characterControls) characterControls.playEmote('ThumbsUp'); },
    playWave: () => { if (characterControls) characterControls.playEmote('Wave'); },
    playYes: () => { if (characterControls) characterControls.playEmote('Yes'); },
};
const emoteFolder = gui.addFolder('Emotes');
emoteFolder.add(emoteParams, 'playDance').name('Dance');
emoteFolder.add(emoteParams, 'playDeath').name('Death');
emoteFolder.add(emoteParams, 'playNo').name('No');
emoteFolder.add(emoteParams, 'playSitting').name('Sitting');
emoteFolder.add(emoteParams, 'playThumbsUp').name('ThumbsUp');
emoteFolder.add(emoteParams, 'playWave').name('Wave');
emoteFolder.add(emoteParams, 'playYes').name('Yes');

// PARTICLE SYSTEM (Requirement F)
class ParticleSystem {
    particles: THREE.Mesh[] = [];
    scene: THREE.Scene;
    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }
    spawn(position: THREE.Vector3) {
        for (let i = 0; i < 20; i++) {
            const geom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const mat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff0000 });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.copy(position);
            mesh.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    Math.random() * 10,
                    (Math.random() - 0.5) * 10
                ),
                life: 1.0
            };
            this.scene.add(mesh);
            this.particles.push(mesh);
        }
    }
    update(delta: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.userData.life -= delta;
            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
                continue;
            }
            p.position.addScaledVector(p.userData.velocity, delta);
            p.userData.velocity.y -= 9.8 * delta; // gravity
        }
    }
}
const particleSystem = new ParticleSystem(scene);

// INTERACTABLE DUMMIES (Requirement G - Basic Physics/Collision)
const dummies: { mesh: THREE.Object3D, body: CANNON.Body, mixer?: THREE.AnimationMixer, isBird?: boolean }[] = [];
let enemyModel: THREE.Group;
let enemyAnimations: THREE.AnimationClip[];
let playerVelocityY = 0;
let isGrounded = false;

// 1. Spawn Box (Static Physics)
function spawnBox(x: number, z: number) {
    const geom = new THREE.BoxGeometry(1, 2, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const dummyMesh = new THREE.Mesh(geom, mat);
    dummyMesh.castShadow = true;
    dummyMesh.receiveShadow = true;
    scene.add(dummyMesh);

    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
    const dummyBody = new CANNON.Body({
        mass: 10,
        position: new CANNON.Vec3(x, 5, z),
        material: physicsMaterial
    });
    dummyBody.addShape(shape);
    world.addBody(dummyBody);

    dummies.push({ mesh: dummyMesh, body: dummyBody, isBird: false });
}

// 2. Spawn Flamingo (Hovering AI)
function spawnFlamingo(x: number, z: number) {
    if (!enemyModel) return;

    // Wrap in a group to preserve any initial rotation from the GLTF
    const dummyMesh = new THREE.Group();
    const flamingo = SkeletonUtils.clone(enemyModel) as THREE.Group;
    dummyMesh.add(flamingo);
    scene.add(dummyMesh);

    const mixer = new THREE.AnimationMixer(flamingo);
    if (enemyAnimations.length > 0) {
        mixer.clipAction(enemyAnimations[0]).play();
    }

    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const dummyBody = new CANNON.Body({
        mass: 5,
        position: new CANNON.Vec3(x, 3, z), // Hover at Y=3
        material: physicsMaterial,
        fixedRotation: true
    });
    dummyBody.addShape(shape);
    dummyBody.linearDamping = 0.5;
    dummyBody.linearFactor = new CANNON.Vec3(1, 0, 1); // Lock Y-axis physics
    world.addBody(dummyBody);

    dummies.push({ mesh: dummyMesh, body: dummyBody, mixer, isBird: true });
}

new GLTFLoader().load('models/Flamingo.glb', function (gltf) {
    enemyModel = gltf.scene;
    // Flamingos are quite large by default in Three.js, scale them down
    enemyModel.scale.set(0.015, 0.015, 0.015);
    enemyModel.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    enemyAnimations = gltf.animations;

    // Spawn a flock!
    spawnFlamingo(2, 2);
    // spawnFlamingo(-2, -3);
    // spawnFlamingo(5, 0);
    // spawnFlamingo(-5, 4);
    // spawnFlamingo(6, -5);
});
spawnBox(-4, 0);
spawnBox(4, 2);


// MODEL WITH ANIMATIONS
var characterControls: CharacterControls
let flashLight: THREE.SpotLight;

new GLTFLoader().load('models/RobotExpressive.glb', function (gltf) {
    const model = gltf.scene;
    // RobotExpressive model is large, scale it down
    model.scale.set(0.25, 0.25, 0.25);

    // FLASHLIGHT
    flashLight = new THREE.SpotLight(0xffffee, 5, 25, Math.PI / 5, 0.5, 1);
    flashLight.position.set(0, 7, 0.5); // Position on top of head
    flashLight.target.position.set(0, 3, 10); // Pointing forward
    flashLight.castShadow = true;
    flashLight.visible = false; // Off by default
    model.add(flashLight);
    model.add(flashLight.target);
    model.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    scene.add(model);

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map()
    gltfAnimations.forEach((a: THREE.AnimationClip) => {
        animationsMap.set(a.name, mixer.clipAction(a))
    })

    characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, 'Idle')
});

// CONTROL KEYS & MOUSE
const keysPressed: { [key: string]: boolean } = {}

let isNight = false;
let smoothedCameraDist = -1;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        event.preventDefault(); // Stop browser from focusing UI elements

        const willBeNight = !isNight;
        if (willBeNight && bgmSound) bgmSound.setVolume(0); // Drop music instantly when going to night

        triggerTeleportEffect(() => {
            isNight = willBeNight;
            if (isNight) {
                // Night mode
                ambientLight.intensity = 0.3;
                ambientLight.color.setHex(0x555577); // Lighter blue tint
                dirLight.intensity = 0.3;
                dirLight.color.setHex(0x9999bb); // Brighter Moonlight
                scene.background = new THREE.Color(0x0a0a1a); // Slightly brighter night sky
            } else {
                // Day mode
                ambientLight.intensity = 0.7;
                ambientLight.color.setHex(0xffffff);
                dirLight.intensity = settings.lightIntensity; // Restore GUI setting
                dirLight.color.setHex(0xffffff);
                scene.background = settings.enableSkybox ? skyboxTexture : defaultBgColor;
                if (bgmSound) bgmSound.setVolume(0.2); // Restore music after transition to day
            }
        });
        return;
    }

    if (event.key.toLowerCase() === 'f') {
        if (flashLight) {
            flashLight.visible = !flashLight.visible;
        }
    }

    if (event.key === ' ') jumpBtn.pressDown();
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle()
    } else {
        (keysPressed as any)[event.key.toLowerCase()] = true
    }
}, false);
document.addEventListener('keyup', (event) => {
    if (event.key === ' ') jumpBtn.releaseUp();
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false);

// VIRTUAL UI
const virtualJoystick = new VirtualJoystick(keysPressed);
const jumpBtn = new ActionButton('JUMP', '50px', '50px', 'Space', () => {
    keysPressed[' '] = true;
    setTimeout(() => keysPressed[' '] = false, 100);
});
const atkBtn = new ActionButton('ATK', '150px', '100px', 'Click', () => {
    performAttack();
});

// PLAYER PHYSICS BODY
const playerShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
const playerBody = new CANNON.Body({
    mass: 0,
    type: CANNON.Body.KINEMATIC,
    position: new CANNON.Vec3(0, 1, 0),
    material: physicsMaterial
});
world.addBody(playerBody);

function performAttack() {
    // Autoplay policy: start BGM on first interaction if enabled
    if (settings.enableAudio && !bgmSound.isPlaying && bgmSound.buffer) {
        bgmSound.play();
    }

    if (characterControls) {
        characterControls.attack();

        // Play punch sound
        if (punchSound.buffer) {
            if (punchSound.isPlaying) punchSound.stop();
            punchSound.play();
        }

        // Apply physics impulse to dummies within range
        const attackRange = 2.5;
        for (let i = dummies.length - 1; i >= 0; i--) {
            const dummy = dummies[i];
            const dist = dummy.mesh.position.distanceTo(characterControls.model.position);
            if (dist < attackRange) {
                // Hit!
                particleSystem.spawn(dummy.mesh.position);

                // Physics impulse to launch the box away from the player
                const forceDir = new THREE.Vector3().subVectors(dummy.mesh.position, characterControls.model.position);
                forceDir.y = 1; // launch upwards slightly
                forceDir.normalize();

                const impulseForce = 150; // strong punch
                const impulse = new CANNON.Vec3(forceDir.x * impulseForce, forceDir.y * impulseForce, forceDir.z * impulseForce);
                // Apply impulse off-center to cause tumbling
                dummy.body.applyImpulse(impulse, new CANNON.Vec3(0, -0.5, 0));
            }
        }
    }
}

// ATTACK MECHANIC (Left Click)
document.addEventListener('mousedown', (event) => {
    // Only allow punching if the user clicked directly on the game canvas
    if (event.target !== renderer.domElement) return;

    if (event.button === 0) { // Left click
        atkBtn.pressDown();
        performAttack();
    }
}, false);

document.addEventListener('mouseup', (event) => {
    if (event.button === 0) atkBtn.releaseUp();
}, false);


const clock = new THREE.Clock();

// DEBUG UI
const debugPos = document.createElement('div');
debugPos.style.position = 'absolute';
debugPos.style.top = '10px';
debugPos.style.left = '10px';
debugPos.style.color = 'white';
debugPos.style.background = 'rgba(0,0,0,0.5)';
debugPos.style.padding = '10px';
debugPos.style.fontFamily = 'monospace';
debugPos.style.zIndex = '100';
document.body.appendChild(debugPos);

// ANIMATE
function animate() {
    let mixerUpdateDelta = clock.getDelta();

    // Update Virtual UI
    virtualJoystick.updateVisuals();

    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);

        const pos = characterControls.model.position;
        debugPos.innerHTML = `Player: x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)}<br>Camera: x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(2)}, z: ${camera.position.z.toFixed(2)}`;

        // Sync player physical body with velocity for realistic pushing forces
        if (mixerUpdateDelta > 0) {
            playerBody.velocity.x = (characterControls.model.position.x - playerBody.position.x) / mixerUpdateDelta;
            playerBody.velocity.z = (characterControls.model.position.z - playerBody.position.z) / mixerUpdateDelta;
        }

        // Raycast down to find floor height
        const raycaster = new THREE.Raycaster(
            new THREE.Vector3(characterControls.model.position.x, characterControls.model.position.y + 1.0, characterControls.model.position.z),
            new THREE.Vector3(0, -1, 0)
        );
        const intersects = raycaster.intersectObjects(environmentMeshes, true);
        let floorY = -100;
        if (intersects.length > 0) {
            floorY = intersects[0].point.y;
        }

        // Apply Gravity & Jumping
        if (characterControls.model.position.y <= floorY + 0.1 && playerVelocityY <= 0) {
            isGrounded = true;
            characterControls.model.position.y = floorY;
            playerVelocityY = 0;
        } else {
            isGrounded = false;
            playerVelocityY -= 30 * mixerUpdateDelta; // Gravity
        }

        if (isGrounded && keysPressed[' ']) {
            playerVelocityY = 15; // Jump strength
            isGrounded = false;
            if (characterControls) characterControls.jump();
        }

        characterControls.model.position.y += playerVelocityY * mixerUpdateDelta;

        playerBody.position.x = characterControls.model.position.x;
        playerBody.position.y = characterControls.model.position.y + 1; // center offset
        playerBody.position.z = characterControls.model.position.z;

        // Check for fall out of bounds
        if (characterControls.model.position.y < -15) {
            const config = mapManager.maps.get(settings.currentMapId);
            if (config) {
                characterControls.model.position.copy(config.spawnPoint);
                playerBody.position.copy(config.spawnPoint as any);
                playerVelocityY = 0;
                playerBody.velocity.set(0, 0, 0);
            }
        }

        // Sync camera strictly with final physics position
        characterControls.syncCamera();
    }

    // Step Physics World
    world.step(1 / 60, mixerUpdateDelta, 3);

    // AI & Sync Meshes with Physics Bodies
    for (const dummy of dummies) {
        if (dummy.mixer) dummy.mixer.update(mixerUpdateDelta);

        // Check if player is in safe zone (near the building at 20, 20)
        let inSafeZone = false;
        if (characterControls && characterControls.model) {
            const px = characterControls.model.position.x;
            const pz = characterControls.model.position.z;
            if (px > 5 && pz > 5) {
                inSafeZone = true;
            }
        }

        // Pathfinding AI for Flamingos
        if (dummy.isBird && characterControls && characterControls.model) {
            if (inSafeZone) {
                dummy.body.velocity.x = 0;
                dummy.body.velocity.z = 0;
            } else {
                const playerPos = characterControls.model.position;
                const dummyPos = dummy.mesh.position;
                const dir = new THREE.Vector3().subVectors(playerPos, dummyPos);
                dir.y = 0; // ignore vertical difference for pathfinding

                if (dir.length() > 1.5) {
                    dir.normalize();
                    const speed = 4;
                    dummy.body.velocity.x = dir.x * speed;
                    dummy.body.velocity.z = dir.z * speed;

                    // Use lookAt to easily face the player!
                    dummy.mesh.lookAt(new THREE.Vector3(playerPos.x, dummy.mesh.position.y, playerPos.z));
                } else {
                    dummy.body.velocity.x = 0;
                    dummy.body.velocity.z = 0;
                }
            }
        }

        // Hopping AI for Boxes
        if (!dummy.isBird && characterControls && characterControls.model) {
            if (Math.abs(dummy.body.velocity.y) < 0.5) {
                const playerPos = characterControls.model.position;
                const dummyPos = dummy.mesh.position;
                const dist = dummyPos.distanceTo(playerPos);

                if (dist > 2 && dist < 15) {
                    const dir = new THREE.Vector3().subVectors(playerPos, dummyPos).normalize();
                    dummy.body.velocity.x = dir.x * 3;
                    dummy.body.velocity.z = dir.z * 3;
                    dummy.body.velocity.y = 5; // Hop!
                }
            }
        }

        if (dummy.isBird) {
            dummy.mesh.position.set(dummy.body.position.x, dummy.body.position.y - 0.5, dummy.body.position.z);
        } else {
            dummy.mesh.position.copy(dummy.body.position as any);
            dummy.mesh.quaternion.copy(dummy.body.quaternion as any);
        }
    }

    particleSystem.update(mixerUpdateDelta);
    orbitControls.update()

    // Camera collision detection (prevent walls from blocking the player)
    const originalCameraPos = camera.position.clone();
    if (characterControls && characterControls.model) {
        const targetPos = characterControls.cameraTarget;
        const dir = new THREE.Vector3().subVectors(originalCameraPos, targetPos);
        const maxDist = dir.length();
        dir.normalize();

        let targetDist = maxDist;

        const raycaster = new THREE.Raycaster(targetPos, dir, 0, maxDist);
        // Intersect only with environment meshes (walls/floor)
        const intersects = raycaster.intersectObjects(environmentMeshes, true);

        // Filter out gates and small objects from camera collision to prevent jitter
        const validIntersects = intersects.filter(hit => {
            let obj: THREE.Object3D | null = hit.object;
            while (obj) {
                const name = obj.name.toLowerCase();
                if (name.includes('gate') || name.includes('enemie') || name.includes('boss') ||
                    name.includes('guard') || name.includes('weapon') || name.includes('hand') ||
                    name.includes('body') || name.includes('shield') || name.includes('arm') ||
                    name.includes('leg') || name.includes('head') || name.includes('sword') || name.includes('spear') || name.includes('Shield_Spaers ') || name.includes('Chest_Bot') || name.includes('Chest_Top')) {
                    return false;
                }
                obj = obj.parent;
            }
            return true;
        });

        if (validIntersects.length > 0) {
            const margin = 0.2; // Move slightly in front of the wall to avoid clipping
            targetDist = Math.max(0, validIntersects[0].distance - margin);
        }

        if (smoothedCameraDist === -1) smoothedCameraDist = targetDist;

        // Smoothly lerp the distance. Zoom in faster (0.5) to avoid clipping, zoom out smoother (0.15)
        const lerpSpeed = targetDist < smoothedCameraDist ? 0.5 : 0.15;
        smoothedCameraDist += (targetDist - smoothedCameraDist) * lerpSpeed;

        camera.position.copy(targetPos).add(dir.multiplyScalar(smoothedCameraDist));
    }

    composer.render();

    // Restore camera position so OrbitControls doesn't lose the desired zoom distance
    camera.position.copy(originalCameraPos);

    requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);



function light() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffffff, settings.lightIntensity);
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
}