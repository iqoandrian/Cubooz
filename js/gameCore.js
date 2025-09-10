// === Core Three.js Setup ===
export let scene, camera, renderer, cubeGroup;

// Inisialisasi scene
export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Kamera
  camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.z = 8; // Lebih dekat dari sebelumnya

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lampu
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  window.addEventListener("resize", onWindowResize);
}

// Render loop
export function animate() {
  requestAnimationFrame(animate);

  if (cubeGroup) {
    cubeGroup.rotation.y += 0.003;
    cubeGroup.rotation.x += 0.001;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}