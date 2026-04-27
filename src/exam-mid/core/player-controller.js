import * as THREE from "three";

export class PlayerController {
  constructor({ camera, controls, input, world, audio, config }) {
    this.camera = camera;
    this.controls = controls;
    this.input = input;
    this.world = world;
    this.audio = audio;
    this.config = config;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.eyeHeight = config.movement.standHeight;
    this.verticalVelocity = 0;
    this.isGrounded = false;
    this.wasGrounded = false;
    this.lastFootstepAt = 0;

    this.tmpForward = new THREE.Vector3();
    this.tmpRight = new THREE.Vector3();
    this.upAxis = new THREE.Vector3(0, 1, 0);
  }

  update(delta, timeMs) {
    if (!this.controls.isLocked) {
      this.wasGrounded = this.isGrounded;
      return;
    }

    this.audio.ensureReady();

    const targetHeight = this.input.isCrouching
      ? this.config.movement.crouchHeight
      : this.config.movement.standHeight;
    this.eyeHeight = THREE.MathUtils.lerp(
      this.eyeHeight,
      targetHeight,
      Math.min(1, delta * 12),
    );

    const groundDistance = this.world.getGroundDistance(this.camera);
    this.isGrounded = groundDistance <= this.eyeHeight + 0.08;

    if (this.isGrounded && this.verticalVelocity <= 0) {
      this.camera.position.y -= groundDistance - this.eyeHeight;
      this.verticalVelocity = 0;
    }

    if (!this.wasGrounded && this.isGrounded) {
      this.audio.playLanding();
    }

    if (
      this.input.consumeJump() &&
      this.isGrounded &&
      !this.input.isCrouching
    ) {
      this.verticalVelocity = this.config.movement.jumpForce;
      this.isGrounded = false;
      this.audio.playJump();
    }

    this.verticalVelocity -= this.config.movement.gravity * delta;
    this.camera.position.y += this.verticalVelocity * delta;

    this.applyPlanarMovement(delta);
    this.playStepIfNeeded(timeMs);

    this.wasGrounded = this.isGrounded;
  }

  applyPlanarMovement(delta) {
    this.velocity.x -= this.velocity.x * this.config.movement.friction * delta;
    this.velocity.z -= this.velocity.z * this.config.movement.friction * delta;

    this.direction.z =
      Number(this.input.moveForward) - Number(this.input.moveBackward);
    this.direction.x =
      Number(this.input.moveRight) - Number(this.input.moveLeft);
    this.direction.normalize();

    let speed = this.config.movement.walkSpeed;
    if (this.input.isCrouching) {
      speed = this.config.movement.crouchSpeed;
    } else if (
      this.input.isSprinting &&
      this.input.moveForward &&
      !this.input.moveBackward
    ) {
      speed = this.config.movement.sprintSpeed;
    }

    if (this.input.moveForward || this.input.moveBackward) {
      this.velocity.z -= this.direction.z * speed * delta;
    }
    if (this.input.moveLeft || this.input.moveRight) {
      this.velocity.x -= this.direction.x * speed * delta;
    }

    this.controls.getDirection(this.tmpForward);
    this.tmpForward.setY(0).normalize();
    this.tmpRight.copy(this.tmpForward).cross(this.upAxis).normalize();

    const forwardDistance = -this.velocity.z * delta;
    if (Math.abs(forwardDistance) > 0.0005) {
      const forwardDir =
        forwardDistance > 0
          ? this.tmpForward
          : this.tmpForward.clone().multiplyScalar(-1);

      if (
        !this.world.hasWallInDirection(
          this.camera,
          forwardDir,
          Math.abs(forwardDistance),
          this.eyeHeight,
        )
      ) {
        this.controls.moveForward(forwardDistance);
      } else {
        this.velocity.z = 0;
      }
    }

    const rightDistance = -this.velocity.x * delta;
    if (Math.abs(rightDistance) > 0.0005) {
      const rightDir =
        rightDistance > 0
          ? this.tmpRight
          : this.tmpRight.clone().multiplyScalar(-1);

      if (
        !this.world.hasWallInDirection(
          this.camera,
          rightDir,
          Math.abs(rightDistance),
          this.eyeHeight,
        )
      ) {
        this.controls.moveRight(rightDistance);
      } else {
        this.velocity.x = 0;
      }
    }
  }

  playStepIfNeeded(timeMs) {
    const planarSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (!this.isGrounded || planarSpeed <= 2) return;

    const stepInterval = this.input.isSprinting
      ? this.config.audio.footstepSprintIntervalMs
      : this.input.isCrouching
        ? this.config.audio.footstepCrouchIntervalMs
        : this.config.audio.footstepBaseIntervalMs;

    if (timeMs - this.lastFootstepAt > stepInterval) {
      this.audio.playFootstep(Math.min(2, planarSpeed / 20));
      this.lastFootstepAt = timeMs;
    }
  }
}
