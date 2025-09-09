// === Firebase Setup ===
// Import modul dari Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- Konfigurasi Firebase ---
// Ganti dengan config project kamu
const firebaseConfig = {
  apiKey: "AIzaSyBA1wTT_iy6YTTlChLeCp5-5nVBvIR2SuA",
  authDomain: "cubooz-24d2c.firebaseapp.com",
  projectId: "cubooz-24d2c",
  storageBucket: "cubooz-24d2c.firebasestorage.app",
  messagingSenderId: "769025854290",
  appId: "1:769025854290:web:8567f44cdf19996596c88b",
  measurementId: "G-K0WHBVHZJH"
};

// Init Firebase App
const app = initializeApp(firebaseConfig);

// Init Auth + Firestore
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// === LOGIN GOOGLE ===
export async function login() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Sembunyiin pesan start, munculin UI game
  document.getElementById('start-message').classList.add("hidden");
  document.getElementById('game-ui').classList.remove("hidden");

  return user;
}

// === SAVE SKOR KE FIRESTORE ===
export async function saveScoreToFirebase(score) {
  if (!auth.currentUser) return; // kalau belum login, skip

  await addDoc(collection(db, "leaderboard"), {
    name: auth.currentUser.displayName,
    score: score,
    timestamp: Date.now()
  });
}

// === LOAD LEADERBOARD DARI FIRESTORE ===
export async function loadLeaderboard() {
  const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
  const snapshot = await getDocs(q);

  const list = document.getElementById('leaderboard');
  list.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.name} - ${data.score}`;
    list.appendChild(li);
  });
}