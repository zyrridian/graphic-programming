import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { GAME_CONFIG } from "./core/config.js";
import { createSceneApp, bindResize } from "./core/scene.js";
import { World } from "./core/world.js";
import { AudioManager } from "./core/audio.js";
import { InputManager } from "./core/input.js";
import { PlayerController } from "./core/player-controller.js";
import { bindCrosshair, bindPointerLock } from "./core/ui.js";

const { scene, camera, renderer } = createSceneApp(GAME_CONFIG);

const controls = new PointerLockControls(camera, document.body);
const world = new World(scene, GAME_CONFIG);
const audio = new AudioManager(GAME_CONFIG);
const input = new InputManager(document);
const player = new PlayerController({
  camera,
  controls,
  input,
  world,
  audio,
  config: GAME_CONFIG,
});

world.loadMap(GAME_CONFIG.world.mapPath);

bindCrosshair("#crosshair");
bindPointerLock(controls, audio);
bindResize(camera, renderer);

let previousTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  const delta = (time - previousTime) / 1000;

  player.update(delta, time);

  previousTime = time;
  renderer.render(scene, camera);
}

animate();
