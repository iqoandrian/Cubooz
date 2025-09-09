// === Kontrol user: drag & klik cube ===
import { raycaster, mouse, cubeGroup } from './gameCore.js';
import { handleCubeHit } from './gameLogic.js';

let previousMousePosition = { x: 0, y: 0 };
let isDragging = false;

export function initControls(renderer, camera) {
  // Klik awal
  renderer.domElement.addEventListener('pointerdown', e => {
    isDragging = false;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Gerakin cube kalau drag
  renderer.domElement.addEventListener('pointermove', e => {
    if (cubeGroup) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        cubeGroup.rotation.y += deltaX * 0.005;
        cubeGroup.rotation.x += deltaY * 0.005;
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  });

  // Klik untuk hancurin cube
  renderer.domElement.addEventListener('pointerup', e => {
    const dx = Math.abs(e.clientX - previousMousePosition.x);
    const dy = Math.abs(e.clientY - previousMousePosition.y);

    // Kalau klik kecil (bukan drag)
    if (dx < 5 && dy < 5 && cubeGroup) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cubeGroup.children, true);

      if (intersects.length > 0) {
        const cube = intersects[0].object.parent; // ambil parent cube
        handleCubeHit(cube, intersects[0].face.materialIndex);
      }
    }
  });
}