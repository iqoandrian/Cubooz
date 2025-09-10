import { scene } from "./gameCore.js";

export let cubeGroup;

export function createRubikCube(size = 3) {
  if (cubeGroup) scene.remove(cubeGroup);

  cubeGroup = new THREE.Group();

  const spacing = 1.1;
  const cubeSize = 1;
  const offset = (size - 1) * spacing / 2;
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        const material = new THREE.MeshStandardMaterial({ color: 0x22c55e });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(i * spacing - offset, j * spacing - offset, k * spacing - offset);
        cubeGroup.add(cube);
      }
    }
  }

  console.log("Rubik cube dibuat:", size, "x", size, "x", size);
}