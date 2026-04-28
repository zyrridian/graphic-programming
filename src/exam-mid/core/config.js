const base = import.meta.env.BASE_URL;

export const GAME_CONFIG = {
  scene: {
    backgroundColor: 0x87ceeb,
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    initialHeight: 1.6,
  },
  movement: {
    standHeight: 1.6,
    crouchHeight: 1.0,
    gravity: 24,
    jumpForce: 8.5,
    walkSpeed: 40,
    sprintSpeed: 62,
    crouchSpeed: 24,
    friction: 10,
    footProbeHeights: [0.25, 0.95],
    wallCollisionDistance: 0.45,
  },
  audio: {
    ambientPath: `${base}src/exam-mid/assets/audio/ambient.ogg`,
    ambientVolume: 0.2,
    footstepBaseIntervalMs: 280,
    footstepSprintIntervalMs: 180,
    footstepCrouchIntervalMs: 420,
  },
  world: {
    mapPath: `${base}src/exam-mid/killhouse.glb`,
  },
};
