import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Enemy } from './Enemy';

export class FlamingoAI extends Enemy {
    public isBird: boolean = true;
    public mixer: THREE.AnimationMixer;
    private hasAutoNightTriggered: boolean = false;

    constructor(mesh: THREE.Object3D, body: CANNON.Body, mixer: THREE.AnimationMixer) {
        super(mesh, body);
        this.mixer = mixer;
    }

    public update(delta: number, playerPos?: THREE.Vector3, isNight?: boolean, inSafeZone?: boolean): void {
        if (this.mixer) this.mixer.update(delta);

        if (playerPos) {
            const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);

            // --- Auto Night Trigger ---
            if (!this.hasAutoNightTriggered && dir.length() < 2.0 && !isNight) {
                this.hasAutoNightTriggered = true;
                const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
                document.dispatchEvent(tabEvent);
            }

            if (inSafeZone || !isNight) {
                this.body.velocity.x = 0;
                this.body.velocity.z = 0;
            } else {
                dir.y = 0; // ignore vertical difference for pathfinding

                if (dir.length() > 1.5) {
                    dir.normalize();
                    const speed = 4;
                    this.body.velocity.x = dir.x * speed;
                    this.body.velocity.z = dir.z * speed;

                    // Use lookAt to easily face the player!
                    this.mesh.lookAt(new THREE.Vector3(playerPos.x, this.mesh.position.y, playerPos.z));
                } else {
                    this.body.velocity.x = 0;
                    this.body.velocity.z = 0;
                }
            }
        }

        // Sync mesh position, birds have offset
        this.mesh.position.set(this.body.position.x, this.body.position.y - 0.5, this.body.position.z);
    }
}
