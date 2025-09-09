// === Global Vars & Scene Setup ===

// Variabel utama untuk scene
export let scene, camera, renderer, cubeGroup, starfield;

// Variabel gameplay
export let totalScore = 0, timer, gameInterval, destroyedThisLevel = 0;
export let isGameOver = true, isMuted = false;

// Partikel ledakan
export let particles = [];

// Difficulty settings
export const levels = ['Mudah','Sedang','Sulit'];
export let currentLevelIndex = 0;
export let currentCubeSize = 3; // start dari 3x3x3

// Raycasting untuk deteksi klik
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
export { raycaster, mouse };

// === INIT SCENE ===
export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Kamera lebih dekat biar cube jelas
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10; // kalau terlalu jauh, turunin nilai ini

  // Renderer WebGL
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Cahaya
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Resize listener
  window.addEventListener('resize', onWindowResize);
}

// === UPDATE RENDER KETIKA WINDOW RESIZE ===
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}