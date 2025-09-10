// === Import modul dasar ===
import { initScene, animate, scene } from "./gameCore.js";
import { createRubikCube, cubeGroup } from "./gameObjects.js";

// === Inisialisasi scene & render loop ===
initScene();
animate();

// === Buat cube pertama (3x3x3) ===
createRubikCube(3); // 3x3x3
scene.add(cubeGroup);

console.log("✅ Cube dibuat:", cubeGroup.children.length, "objek");