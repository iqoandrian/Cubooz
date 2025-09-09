// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyBA1wTT_iy6YTTlChLeCp5-5nVBvIR2SuA",
  authDomain: "cubooz-24d2c.firebaseapp.com",
  projectId: "cubooz-24d2c",
  storageBucket: "cubooz-24d2c.firebasestorage.app",
  messagingSenderId: "769025854290",
  appId: "1:769025854290:web:8567f44cdf19996596c88b",
  measurementId: "G-K0WHBVHZJH"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

// --- Game Variables ---
let scene, camera, renderer, cubeGroup, starfield;
let totalScore = 0, timer, gameInterval, destroyedThisLevel = 0;
let isGameOver = true, isMuted = false;
let particles = [];
let cubeSize = 3; // awal 3x3x3
let currentLevelIndex = 0;
const levelsPerCubeSize = 3; // 3 level per ukuran kubus
const difficulties = ["Mudah", "Sedang", "Sulit"];

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let synths = {};

// --- Firebase Login ---
document.getElementById("login-btn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(result => {
    currentUser = result.user;
    document.getElementById("login-message").classList.add("hidden");
    document.getElementById("start-message").classList.remove("hidden");
    document.getElementById("start-message").classList.add("flex");
  }).catch(err => console.error(err));
});

// --- Init Scene ---
initScene();
animate();

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 12;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);

  document.getElementById("mute-btn").addEventListener("click", toggleMute);
  document.getElementById("continue-btn").addEventListener("click", loadNextLevel);
  document.getElementById("start-btn").addEventListener("click", () => {
    document.getElementById("start-message").classList.add("hidden");
    document.getElementById("start-message").classList.remove("flex");
    initAudio();
    startGame();
  });
}

async function initAudio() {
  await Tone.start();
  synths.explosion = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination();
  synths.bomb = new Tone.MembraneSynth().toDestination();
  synths.time = new Tone.Synth().toDestination();
  synths.error = new Tone.Synth().toDestination();
}

// --- Game Flow ---
function startGame() {
  isGameOver = false;
  document.getElementById("game-ui").classList.remove("hidden");

  destroyedThisLevel = 0;
  timer = 120;
  updateUI();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(updateTimer, 1000);

  Tone.Transport.start();

  if (!starfield) createStarfield();
  createRubikCube();
}

function updateTimer() {
  timer--;
  updateUI();
  if (timer <= 0) gameOver(false);
}

function levelComplete() {
  isGameOver = true;
  clearInterval(gameInterval);
  Tone.Transport.stop();

  const timeBonus = timer;
  totalScore += timeBonus;

  document.getElementById("game-ui").classList.add("hidden");
  document.getElementById("level-score-breakdown").innerHTML =
    `Bonus Waktu: ${timeBonus} Poin<br>Total Skor: ${totalScore}`;
  document.getElementById("level-complete-message").classList.remove("hidden");
  document.getElementById("level-complete-message").classList.add("flex");
}

function loadNextLevel() {
  document.getElementById("level-complete-message").classList.add("hidden");

  currentLevelIndex++;
  if (currentLevelIndex % levelsPerCubeSize === 0) cubeSize++;

  if (cubeSize <= 6) { // batas maksimal 6x6x6
    startGame();
  } else {
    gameOver(true);
  }
}

function gameOver(isWin) {
  isGameOver = true;
  clearInterval(gameInterval);
  Tone.Transport.stop();
  document.getElementById("game-ui").classList.add("hidden");

  if (isWin) {
    document.getElementById("final-score").innerText = `Skor Akhir: ${totalScore}`;
    document.getElementById("win-message").classList.remove("hidden");
    document.getElementById("win-message").classList.add("flex");

    saveScore(totalScore);
  } else {
    document.getElementById("lose-score").innerText = `Skor Akhir: ${totalScore}`;
    document.getElementById("lose-message").classList.remove("hidden");
    document.getElementById("lose-message").classList.add("flex");

    saveScore(totalScore);
  }
}

function updateUI() {
  document.getElementById("score-board").innerText = `Skor: ${totalScore}`;
  document.getElementById("timer").innerText = `Waktu: ${timer}`;
  document.getElementById("difficulty-display").innerText =
    `Level: ${difficulties[currentLevelIndex % difficulties.length]} (${cubeSize}x${cubeSize}x${cubeSize})`;
}

// --- 3D Objects ---
function createStarfield() {
  const starCount = 2000;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    positions.push(THREE.MathUtils.randFloatSpread(200));
    positions.push(THREE.MathUtils.randFloatSpread(200));
    positions.push(THREE.MathUtils.randFloatSpread(200));
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
  starfield = new THREE.Points(starGeometry, starMaterial);
  scene.add(starfield);
}

function createRubikCube(difficulty) {
    if (cubeGroup) scene.remove(cubeGroup);
    particles.forEach(p => scene.remove(p.mesh));
    particles = [];

    // 🔥 tentukan ukuran kubus sesuai level
    const size = currentCubeSize; // 3,4,5 dst
    const spacing = 1.1, cubeSize = 1;
    const offset = (size - 1) * spacing / 2;
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    // 🎯 atur kamera supaya jarak pas
    const baseDistance = 6; 
    camera.position.z = baseDistance + size * 2;

    cubeGroup = new THREE.Group();

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        const cube = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x111827 }));
        cube.position.set(i * spacing - offset, j * spacing - offset, k * spacing - offset);
        cube.isSolved = false;
        cube.greenFaceIndex = Math.floor(Math.random() * 6);

        const rand = Math.random();
        if (rand < 0.05) cube.type = "bomb";
        else if (rand < 0.10) cube.type = "time";
        else cube.type = "normal";

        const mat = (cube.type === "bomb")
          ? new THREE.MeshStandardMaterial({ color: 0xef4444 })
          : (cube.type === "time")
            ? new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
            : new THREE.MeshStandardMaterial({ color: 0x22c55e });

        cube.material = Array(6).fill(new THREE.MeshStandardMaterial({ color: 0x111827 }));
        cube.material[cube.greenFaceIndex] = mat;

        cubeGroup.add(cube);
      }
    }
  }
  cubeGroup.scale.setScalar(Math.min(window.innerWidth, window.innerHeight) / 600);
  scene.add(cubeGroup);
}

// --- Interactions ---
function handleCubeHit(clickedCube, faceIndex) {
  if (isGameOver || clickedCube.isSolved) return;

  if (faceIndex === clickedCube.greenFaceIndex) {
    totalScore += 2;
    switch (clickedCube.type) {
      case "time": timer += 5; playSound("time"); destroyCube(clickedCube); break;
      case "bomb": playSound("bomb"); destroyCube(clickedCube); break;
      default: playSound("explosion"); destroyCube(clickedCube); break;
    }
  } else {
    totalScore -= 1;
    playSound("error");
  }
  updateUI();
}

function destroyCube(cube) {
  if (cube.isSolved) return;
  cube.isSolved = true;
  destroyedThisLevel++;
  createExplosion(cube.getWorldPosition(new THREE.Vector3()), cube.material[cube.greenFaceIndex].color);
  cubeGroup.remove(cube);

  if (destroyedThisLevel === cubeSize * cubeSize * cubeSize) levelComplete();
}

function createExplosion(position, color) {
  const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const particleMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: true });
  for (let i = 0; i < 20; i++) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
    particle.position.copy(position);
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5
    );
    particles.push({ mesh: particle, velocity, lifetime: 1.0 });
    scene.add(particle);
  }
}

function playSound(type) {
  if (isMuted || !synths[type]) return;
  if (type === "time") synths.time.triggerAttackRelease("C5", "0.5s");
  else if (type === "error") synths.error.triggerAttackRelease("C2", "0.1s");
  else synths[type].triggerAttackRelease("8n");
}

function toggleMute() {
  isMuted = !isMuted;
  const unmutedIcon = document.getElementById("unmuted-icon");
  const mutedIcon = document.getElementById("muted-icon");
  if (isMuted) {
    Tone.Destination.volume.value = -Infinity;
    unmutedIcon.classList.add("hidden");
    mutedIcon.classList.remove("hidden");
  } else {
    Tone.Destination.volume.value = 0;
    unmutedIcon.classList.remove("hidden");
    mutedIcon.classList.add("hidden");
  }
}

// --- Event Handlers ---
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
  if (isGameOver) return;
  isDragging = false;
  previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onPointerMove(event) {
  if (!isGameOver && cubeGroup) {
    const dx = event.clientX - previousMousePosition.x;
    const dy = event.clientY - previousMousePosition.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      isDragging = true;
      cubeGroup.rotation.y += dx * 0.005;
      cubeGroup.rotation.x += dy * 0.005;
    }
    previousMousePosition = { x: event.clientX, y: event.clientY };
  }
}

function onPointerUp(event) {
  if (!isDragging && !isGameOver) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubeGroup.children);
    if (intersects.length > 0) {
      handleCubeHit(intersects[0].object, intersects[0].face.materialIndex);
    }
  }
  isDragging = false;
}

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);

  if (cubeGroup && !isDragging && !isGameOver) {
    cubeGroup.rotation.y += 0.0005;
    cubeGroup.rotation.x += 0.0002;
  }
  if (starfield) starfield.rotation.y += 0.0001;

  particles.forEach((p, i) => {
    p.mesh.position.add(p.velocity);
    p.velocity.multiplyScalar(0.95);
    p.velocity.y -= 0.002;
    p.lifetime -= 0.016;
    p.mesh.material.opacity = Math.max(0, p.lifetime);
    if (p.lifetime <= 0) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  });

  renderer.render(scene, camera);
}

// --- Firestore Leaderboard ---
async function saveScore(score) {
  if (!currentUser) return;
  await db.collection("leaderboard").doc(currentUser.uid).set({
    name: currentUser.displayName,
    score,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  loadLeaderboard();
}

async function loadLeaderboard() {
  const snapshot = await db.collection("leaderboard")
    .orderBy("score", "desc")
    .limit(10)
    .get();

  let html = "<h2 class='text-xl font-bold mb-2'>Leaderboard</h2><ol>";
  snapshot.forEach(doc => {
    const data = doc.data();
    html += `<li>${data.name}: ${data.score}</li>`;
  });
  html += "</ol>";

  document.getElementById("leaderboard").innerHTML = html;
}