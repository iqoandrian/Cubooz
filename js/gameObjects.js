// === Bikin objek game: starfield, ledakan, cube ===
import { scene, particles } from './gameCore.js';

// === STARFIELD ===
export function createStarfield() {
  const starCount = 2000;
  const starGeometry = new THREE.BufferGeometry();
  const positions = [];

  // Random posisi bintang
  for (let i = 0; i < starCount; i++) {
    positions.push(THREE.MathUtils.randFloatSpread(200));
    positions.push(THREE.MathUtils.randFloatSpread(200));
    positions.push(THREE.MathUtils.randFloatSpread(200));
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ size: 0.1 });
  const starfield = new THREE.Points(starGeometry, starMaterial);
  scene.add(starfield);
  return starfield;
}

// === LEDAKAN PARTIKEL ===
export function createExplosion(position, color) {
  const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const particleMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: true });

  // Spawn beberapa partikel
  for (let i = 0; i < 25; i++) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.copy(position);

    // Random arah gerak partikel
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5
    );

    // Simpan ke array untuk di-update nanti
    particles.push({ mesh: particle, velocity, lifetime: 1.0 });
    scene.add(particle);
  }
}