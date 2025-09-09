// === Cube Logic (klik, hancurin, bom) ===
import { scene, cubeGroup, particles, totalScore } from './gameCore.js';
import { createExplosion } from './gameObjects.js';
import { updateUI, levelComplete } from './gameLogic.js';

// Simpan cube yang udah dihancurin
let destroyedThisLevel = 0;
export const totalCubes = 3 * 3 * 3; // default, nanti bisa dinamis

// === HANDLE CUBE HIT ===
export function handleCubeHit(clickedCube, faceIndex) {
  if (clickedCube.isSolved) return;

  // Cek apakah klik di sisi hijau (special face)
  if (faceIndex === clickedCube.greenFaceIndex) {
    switch (clickedCube.type) {
      case 'time':
        window.timer += 5; // bonus waktu
        destroyCube(clickedCube);
        break;
      case 'bomb':
        detonateBomb(clickedCube); // ledakin sekitar
        break;
      default:
        destroyCube(clickedCube);
        break;
    }
  } else {
    // Kalau salah klik (bukan sisi hijau) -> penalti skor
    window.totalScore -= 1;
  }

  updateUI();
}

// === HANCURIN CUBE ===
export function destroyCube(cube) {
  if (cube.isSolved) return;
  cube.isSolved = true;

  destroyedThisLevel++;

  // Efek ledakan partikel
  const color = cube.material[cube.greenFaceIndex].color;
  createExplosion(cube.getWorldPosition(new THREE.Vector3()), color);

  // Remove cube dari group
  cubeGroup.remove(cube);

  window.totalScore += 2;

  // Kalau semua cube hancur → level selesai
  if (destroyedThisLevel >= totalCubes) {
    levelComplete();
  }
}

// === LEDAKAN BOM ===
export function detonateBomb(bombCube) {
  destroyCube(bombCube);

  const { i, j, k } = bombCube.gridPos;
  const cubesToDestroy = [];

  // Cari cube di sekitar bom (1 blok radius)
  cubeGroup.children.forEach(targetCube => {
    if (targetCube.isSolved) return;
    const { i: ti, j: tj, k: tk } = targetCube.gridPos;
    const dist = Math.max(Math.abs(i - ti), Math.abs(j - tj), Math.abs(k - tk));
    if (dist === 1) cubesToDestroy.push(targetCube);
  });

  // Delay sedikit biar keliatan efek chain reaction
  cubesToDestroy.forEach((target, index) => {
    setTimeout(() => {
      destroyCube(target);
    }, 100 * index);
  });
}