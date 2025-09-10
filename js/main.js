// === Entry Point ===
import { initScene } from './gameCore.js';
import { login, loadLeaderboard } from './firebase.js';
import { startGame } from './gameLogic.js';

initScene();
loadLeaderboard();

// Tombol login Google
document.getElementById('login-btn').addEventListener('click', async () => {
  await login();
  startGame();
  loadLeaderboard();
});