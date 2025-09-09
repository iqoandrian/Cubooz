// === Logika game: start, level complete, game over, UI update ===
import { totalScore, timer, gameInterval, isGameOver, currentCubeSize, levels, currentLevelIndex } from './gameCore.js';
import { saveScoreToFirebase } from './firebase.js';

// === MULAI GAME ===
export function startGame() {
  isGameOver = false;
  timer = 120;
  updateUI();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(updateTimer, 1000);
}

// === UPDATE TIMER ===
function updateTimer() {
  timer--;
  updateUI();

  if (timer <= 0) gameOver(false);
}

// === LEVEL SELESAI ===
export function levelComplete() {
  isGameOver = true;
  clearInterval(gameInterval);

  const timeBonus = timer;
  totalScore += timeBonus;

  document.getElementById('level-score-breakdown').innerHTML =
    `Bonus Waktu: ${timeBonus} <br> Skor: ${totalScore}`;

  document.getElementById('level-complete-message').classList.remove("hidden");
}

// === GAME OVER ===
export function gameOver(isWin) {
  isGameOver = true;
  clearInterval(gameInterval);

  // Simpan skor ke Firebase
  saveScoreToFirebase(totalScore);

  if (isWin) {
    document.getElementById('final-score').innerText = `Skor Akhir: ${totalScore}`;
    document.getElementById('win-message').classList.remove("hidden");
  } else {
    document.getElementById('lose-score').innerText = `Skor Akhir: ${totalScore}`;
    document.getElementById('lose-message').classList.remove("hidden");
  }
}

// === UPDATE UI ===
export function updateUI() {
  document.getElementById('score-board').innerText = `Skor: ${totalScore}`;
  document.getElementById('timer').innerText = `Waktu: ${timer}`;
  document.getElementById('difficulty-display').innerText = 
    `Level: ${levels[currentLevelIndex]} (${currentCubeSize}x${currentCubeSize}x${currentCubeSize})`;
}