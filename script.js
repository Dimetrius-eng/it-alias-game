// --- Глобальні змінні ---
let allWords = []; 
let availableWords = [];

// --- Стан гри (те, що ми будемо зберігати) ---
let gameState = {
  team1Score: 0,
  team2Score: 0,
  team1Name: "Команда 1",
  team2Name: "Команда 2",
  currentTeam: 1, 
  roundTime: 60,
  totalRounds: 5,
  currentRound: 0,
  isGameInProgress: false,
  lastRoundScore: 0 // НОВЕ: Зберігаємо рахунок останнього раунду
};

// --- Змінні для раунду (не зберігаються) ---
let roundScore = 0;
let timeLeft = 0;
let timerInterval;

// --- Знаходимо елементи на HTML-сторінці ---
// (Тут нічого не змінилося)
// Екрани
const screens = document.querySelectorAll('.screen');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const turnEndScreen = document.getElementById('turn-end-screen');
const gameOverScreen = document.getElementById('game-over-screen');
// Табло
const scoreboard = document.getElementById('scoreboard');
const team1NameDisplay = document.getElementById('team1-name');
const team1ScoreDisplay = document.getElementById('team1-score');
const team2NameDisplay = document.getElementById('team2-name');
const team2ScoreDisplay = document.getElementById('team2-score');
// Налаштування
const team1Input = document.getElementById('team1-input');
const team2Input = document.getElementById('team2-input');
const timeInput = document.getElementById('time-input');
const roundsInput = document.getElementById('rounds-input'); 
// Кнопки
const continueBtn = document.getElementById('continue-btn'); 
const startBtn = document.getElementById('start-btn');
const skipBtn = document.getElementById('skip-btn');
const correctBtn = document.getElementById('correct-btn');
const nextTurnBtn = document.getElementById('next-turn-btn');
const resetGameBtn = document.getElementById('reset-game-btn'); 
const newGameBtn = document.getElementById('new-game-btn'); 
// Ігрові поля
const timerDisplay = document.getElementById('timer');
const roundCounterDisplay = document.getElementById('round-counter'); 
const wordDisplay = document.getElementById('word-display');
const roundSummaryDisplay = document.getElementById('round-summary');
const nextTeamNameDisplay = document.getElementById('next-team-name');
const winnerMessageDisplay = document.getElementById('winner-message'); 
const finalScoreSummaryDisplay = document.getElementById('final-score-summary');

// --- Прив'язуємо функції до кнопок ---
// (Тут нічого не змінилося)
startBtn.addEventListener('click', setupNewGame);
continueBtn.addEventListener('click', continueGame); 
correctBtn.addEventListener('click', handleCorrect);
skipBtn.addEventListener('click', handleSkip);
nextTurnBtn.addEventListener('click', startRound);
resetGameBtn.addEventListener('click', resetGame); 
newGameBtn.addEventListener('click', resetGame); 

// --- Робота зі сховищем (localStorage) ---
// (Тут нічого не змінилося)
const STORAGE_KEY = 'itAliasSavedGame';

function saveGameState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

function loadGameState() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    gameState = JSON.parse(savedData);
    return true; 
  }
  return false; 
}

function clearGameState() {
  localStorage.removeItem(STORAGE_KEY);
}

// --- Ініціалізація гри (Запуск) ---
// (Тут нічого не змінилося)
async function initializeApp() {
  startBtn.disabled = true;
  continueBtn.disabled = true;

  try {
    const response = await fetch('./words.json');
    if (!response.ok) {
      throw new Error('Не вдалося завантажити слова. Перевірте words.json');
    }
    allWords = await response.json();
    
    startBtn.disabled = false;
    console.log(`Завантажено ${allWords.length} слів.`);

  } catch (error) {
    console.error(error);
    wordDisplay.textContent = "Помилка завантаження слів. Спробуйте оновити сторінку.";
    return; 
  }

  if (loadGameState() && gameState.isGameInProgress) {
    continueBtn.style.display = 'block';
    continueBtn.disabled = false;
  }
  
  showScreen(startScreen); 
  scoreboard.style.display = 'none';
}

// --- Функції гри ---

function showScreen(screenToShow) {
  screens.forEach(screen => screen.classList.remove('active'));
  screenToShow.classList.add('active');
}

// 1. Налаштування НОВОЇ гри
function setupNewGame() {
  clearGameState(); 

  gameState.team1Name = team1Input.value || "Команда 1";
  gameState.team2Name = team2Input.value || "Команда 2";
  gameState.roundTime = parseInt(timeInput.value, 10) || 60;
  gameState.totalRounds = parseInt(roundsInput.value, 10) || 5; 
  
  gameState.team1Score = 0;
  gameState.team2Score = 0;
  gameState.currentTeam = 1;
  gameState.currentRound = 0;
  gameState.lastRoundScore = 0; // НОВЕ: Скидаємо рахунок раунду
  gameState.isGameInProgress = true; 

  updateScoreboard();
  scoreboard.style.display = 'flex'; 

  startRound();
}

// 2. Продовження гри
function continueGame() {
  // (Тут нічого не змінилося)
  updateScoreboard();
  scoreboard.style.display = 'flex'; 
  
  team1Input.value = gameState.team1Name;
  team2Input.value = gameState.team2Name;
  timeInput.value = gameState.roundTime;
  roundsInput.value = gameState.totalRounds;

  showRoundSummary(); 
}

// 3. Початок нового раунду
function startRound() {
  // (Тут нічого не змінилося)
  roundScore = 0; // Це локальна змінна, все правильно
  timeLeft = gameState.roundTime;
  timerDisplay.textContent = timeLeft;
  
  if (gameState.currentTeam === 1) {
    gameState.currentRound++;
  }
  
  roundCounterDisplay.textContent = `${gameState.currentRound} / ${gameState.totalRounds}`;
  
  if (gameState.currentTeam === 1) {
    document.getElementById('team1-display').classList.add('active-team');
    document.getElementById('team2-display').classList.remove('active-team');
  } else {
    document.getElementById('team1-display').classList.remove('active-team');
    document.getElementById('team2-display').classList.add('active-team');
  }

  availableWords = [...allWords].sort(() => Math.random() - 0.5);

  nextWord();
  showScreen(gameScreen);
  startTimer();
  
  saveGameState(); 
}

// 4. Запуск таймера
// (Тут нічого не змінилося)
function startTimer() {
  clearInterval(timerInterval); 
  
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endRound(); 
    }
  }, 1000);
}

// 5. Показати наступне слово
// (Тут нічого не змінилося)
function nextWord() {
  if (availableWords.length === 0) {
    availableWords = [...allWords].sort(() => Math.random() - 0.5);
  }
  
  const newWord = availableWords.pop(); 
  wordDisplay.textContent = newWord;
}

// 6. Натискання "Зараховано"
// (Тут нічого не змінилося)
function handleCorrect() {
  roundScore++; 
  nextWord();
}

// 7. Натискання "Пропустити"
// (Тут нічого не змінилося)
function handleSkip() {
  nextWord();
}

// 8. Кінець раунду
function endRound() {
  clearInterval(timerInterval); 

  if (gameState.currentTeam === 1) {
    gameState.team1Score += roundScore;
  } else {
    gameState.team2Score += roundScore;
  }
  
  gameState.lastRoundScore = roundScore; // НОВЕ: Зберігаємо рахунок раунду в gameState
  
  updateScoreboard();
  
  if (gameState.currentTeam === 2 && gameState.currentRound >= gameState.totalRounds) {
    gameState.isGameInProgress = false; 
    showWinner();
    clearGameState(); 
  } else {
    gameState.currentTeam = (gameState.currentTeam === 1) ? 2 : 1;
    showRoundSummary();
    saveGameState(); // Зберігаємо прогрес (включно з lastRoundScore)
  }
}

// 9. Допоміжна функція
function showRoundSummary() {
  // ЗМІНА: Беремо рахунок зі збереженого gameState, а не з тимчасової змінної
  roundSummaryDisplay.textContent = `Ви заробили ${gameState.lastRoundScore} балів!`;
  const nextTeam = (gameState.currentTeam === 1) ? gameState.team1Name : gameState.team2Name;
  nextTeamNameDisplay.textContent = nextTeam;
  showScreen(turnEndScreen);
}

// 10. Оновлення табло
// (Тут нічого не змінилося)
function updateScoreboard() {
  team1NameDisplay.textContent = gameState.team1Name;
  team1ScoreDisplay.textContent = gameState.team1Score;
  team2NameDisplay.textContent = gameState.team2Name;
  team2ScoreDisplay.textContent = gameState.team2Score;
}

// 11. Показати переможця
// (Тут нічого не змінилося)
function showWinner() {
  let winnerMsg = "";
  if (gameState.team1Score > gameState.team2Score) {
    winnerMsg = `🎉 Перемогла ${gameState.team1Name}! 🎉`;
  } else if (gameState.team2Score > gameState.team1Score) {
    winnerMsg = `🎉 Перемогла ${gameState.team2Name}! 🎉`;
  } else {
    winnerMsg = "Нічия! 🤝"; 
  }
  
  winnerMessageDisplay.textContent = winnerMsg;
  finalScoreSummaryDisplay.textContent = `Фінальний рахунок: ${gameState.team1Name} (${gameState.team1Score}) - ${gameState.team2Name} (${gameState.team2Score})`;
  
  showScreen(gameOverScreen); 
}

// 12. Скидання гри
function resetGame() {
  gameState.isGameInProgress = false; 
  clearGameState(); 
  
  scoreboard.style.display = 'none'; 
  continueBtn.style.display = 'none'; 
  
  team1Input.value = "Команда 1";
  team2Input.value = "Команда 2";
  timeInput.value = 60;
  roundsInput.value = 5; 
  
  // НОВЕ: Скидаємо локальний стан, оскільки gameState і так очищено
  gameState.lastRoundScore = 0; 
  
  showScreen(startScreen); 
}

// --- ЗАПУСК ДОДАТКУ ---
initializeApp();
