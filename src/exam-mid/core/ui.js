export function bindCrosshair(crosshairSelector = "#crosshair") {
  const crosshair = document.querySelector(crosshairSelector);
  if (!crosshair) return;

  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === document.body) {
      crosshair.classList.add("active");
    } else {
      crosshair.classList.remove("active");
    }
  });
}

export function bindPointerLock(controls, audioManager) {
  document.body.addEventListener("click", () => {
    audioManager.ensureReady();
    controls.lock();
  });

  document.addEventListener("mousedown", (event) => {
    if (event.button === 0 && controls.isLocked) {
      audioManager.ensureReady();
      audioManager.playGunfire();
    }
  });
}
