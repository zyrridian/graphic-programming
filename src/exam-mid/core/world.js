import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class World {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.map = null;

    this.wallRaycaster = new THREE.Raycaster();
    this.groundRaycaster = new THREE.Raycaster();
  }

  loadMap(path) {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => {
      this.map = gltf.scene;
      this.scene.add(this.map);
    });
  }

  hasWallInDirection(camera, direction, distance, eyeHeight) {
    if (!this.map) return false;

    const flatDirection = direction.clone().setY(0).normalize();
    const feetY = camera.position.y - eyeHeight;
    const checkDistance = this.config.movement.wallCollisionDistance + distance;

    for (const probeHeight of this.config.movement.footProbeHeights) {
      const origin = new THREE.Vector3(
        camera.position.x,
        feetY + probeHeight,
        camera.position.z,
      );
      this.wallRaycaster.set(origin, flatDirection);
      this.wallRaycaster.far = checkDistance;

      const hits = this.wallRaycaster.intersectObject(this.map, true);
      if (hits.length > 0 && hits[0].distance < checkDistance) {
        return true;
      }
    }

    return false;
  }

  getGroundDistance(camera) {
    if (!this.map) return Infinity;

    this.groundRaycaster.set(camera.position, new THREE.Vector3(0, -1, 0));
    const hits = this.groundRaycaster.intersectObject(this.map, true);
    if (hits.length === 0) return Infinity;

    return hits[0].distance;
  }
}
