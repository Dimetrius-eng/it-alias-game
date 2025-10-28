// --- Глобальні змінні ---
let allWords = []; // Сюди завантажимо слова з JSON
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
  isGameInProgress: false // Чи гра вже почалася?
};

// --- Змінні для раунду (не зберігаються) ---
let roundScore = 0;
let timeLeft = 0;
let timerInterval;

// --- Знаходимо елементи на HTML-сторінці ---

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
const continueBtn = document.getElementById('continue-btn'); // НОВА
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
startBtn.addEventListener('click', setupNewGame);
continueBtn.addEventListener('click', continueGame); // НОВА
correctBtn.addEventListener('click', handleCorrect);
skipBtn.addEventListener('click', handleSkip);
nextTurnBtn.addEventListener('click', startRound);
resetGameBtn.addEventListener('click', resetGame); 
newGameBtn.addEventListener('click', resetGame); 

// --- НОВІ ФУНКЦІЇ: Робота зі сховищем (localStorage) ---

// Ключ для збереження в localStorage
const STORAGE_KEY = 'itAliasSavedGame';

function saveGameState() {
  // Зберігаємо поточний стан гри в localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

function loadGameState() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    // Якщо дані є, завантажуємо їх у нашу змінну gameState
    gameState = JSON.parse(savedData);
    return true; // Є збережена гра
  }
  return false; // Немає збереженої гри
}

function clearGameState() {
  localStorage.removeItem(STORAGE_KEY);
}

// --- НОВА ФУНКЦІЯ: Ініціалізація гри (Запуск) ---

async function initializeApp() {
  // 1. Вимикаємо кнопки, поки не завантажимо слова
  startBtn.disabled = true;
  continueBtn.disabled = true;

  // 2. Завантажуємо слова з JSON
  try {
    const response = await fetch('./words.json');
    if (!response.ok) {
      throw new Error('Не вдалося завантажити слова. Перевірте words.json');
    }
    allWords = await response.json();
    
    // 3. Слова завантажено - вмикаємо кнопку "Нова гра"
    startBtn.disabled = false;
    console.log(`Завантажено ${allWords.length} слів.`);

  } catch (error) {
    console.error(error);
    // Якщо сталася помилка (навіть офлайн, але sw.js не спрацював)
    // Ми не можемо почати гру.
    wordDisplay.textContent = "Помилка завантаження слів. Спробуйте оновити сторінку.";
    return; // Зупиняємо ініціалізацію
  }

  // 4. Перевіряємо, чи є збережена гра
  if (loadGameState() && gameState.isGameInProgress) {
    // Якщо є, показуємо кнопку "Продовжити"
    continueBtn.style.display = 'block';
    continueBtn.disabled = false;
  }
  
  // 5. Показуємо стартовий екран
  showScreen(startScreen); 
  scoreboard.style.display = 'none';
}

// --- Функції гри (ОНОВЛЕНІ) ---

function showScreen(screenToShow) {
  screens.forEach(screen => screen.classList.remove('active'));
  screenToShow.classList.add('active');
}

// 1. Налаштування НОВОЇ гри
function setupNewGame() {
  clearGameState(); // Скидаємо старе збереження

  // Встановлюємо нові налаштування
  gameState.team1Name = team1Input.value || "Команда 1";
  gameState.team2Name = team2Input.value || "Команда 2";
  gameState.roundTime = parseInt(timeInput.value, 10) || 60;
  gameState.totalRounds = parseInt(roundsInput.value, 10) || 5; 
  
  // Скидаємо рахунки
  gameState.team1Score = 0;
  gameState.team2Score = 0;
  gameState.currentTeam = 1;
  gameState.currentRound = 0;
  gameState.isGameInProgress = true; // Гра почалася!

  updateScoreboard();
  scoreboard.style.display = 'flex'; 

  startRound();
}

// НОВА ФУНКЦІЯ: Продовження гри
function continueGame() {
  // Ми вже завантажили стан гри в `initializeApp`
  // Тож нам просто треба оновити табло і перейти до екрану
  
  updateScoreboard();
  scoreboard.style.display = 'flex';
  
  // Відновлюємо налаштування на стартовому екрані (про всяк випадок)
  team1Input.value = gameState.team1Name;
  team2Input.value = gameState.team2Name;
  timeInput.value = gameState.roundTime;
  roundsInput.value = gameState.totalRounds;

  // Вирішуємо, куди йти:
  // Якщо ми зупинились на екрані "Кінець раунду"
  showRoundSummary(); // Показуємо екран "Наступний хід..."
}

// 2. Початок нового раунду
function startRound() {
  roundScore = 0;
  timeLeft = gameState.roundTime;
  timerDisplay.textContent = timeLeft;
  
  // Збільшуємо раунд, ТІЛЬКИ якщо ходить перша команда
  if (gameState.currentTeam === 1) {
    gameState.currentRound++;
  }
  
  // Оновлюємо лічильник раундів
  roundCounterDisplay.textContent = `${gameState.currentRound} / ${gameState.totalRounds}`;
  
  // Виділяємо активну команду на табло
  if (gameState.currentTeam === 1) {
    document.getElementById('team1-display').classList.add('active-team');
    document.getElementById('team2-display').classList.remove('active-team');
  } else {
    document.getElementById('team1-display').classList.remove('active-team');
    document.getElementById('team2-display').classList.add('active-team');
  }

  // Беремо слова з `allWords` (які завантажили з JSON)
  availableWords = [...allWords].sort(() => Math.random() - 0.5);

  nextWord();
  showScreen(gameScreen);
  startTimer();
  
  // Зберігаємо стан на випадок, якщо гра закриється під час раунду
  saveGameState(); 
}

// 3. Запуск таймера
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

// 4. Показати наступне слово
function nextWord() {
  if (availableWords.length === 0) {
    // Якщо слова скінчились, беремо їх заново
    availableWords = [...allWords].sort(() => Math.random() - 0.5);
  }
  
  const newWord = availableWords.pop(); 
  wordDisplay.textContent = newWord;
}

// 5. Натискання "Зараховано"
function handleCorrect() {
  roundScore++; 
  nextWord();
}

// 6. Натискання "Пропустити"
function handleSkip() {
  nextWord();
}

// 7. Кінець раунду
function endRound() {
  clearInterval(timerInterval); 

  if (gameState.currentTeam === 1) {
    gameState.team1Score += roundScore;
  } else {
    gameState.team2Score += roundScore;
  }
  updateScoreboard();
  
  // Перевірка на кінець гри
  if (gameState.currentTeam === 2 && gameState.currentRound >= gameState.totalRounds) {
    gameState.isGameInProgress = false; // Гра завершена
    showWinner();
    clearGameState(); // Очищуємо збережену гру
  } else {
    // Якщо ні - просто передаємо хід
    gameState.currentTeam = (gameState.currentTeam === 1) ? 2 : 1;
    showRoundSummary();
    saveGameState(); // Зберігаємо прогрес (хто ходить наступним)
  }
}

// НОВА ДОПОМІЖНА ФУНКЦІЯ (для "Продовжити гру")
function showRoundSummary() {
  roundSummaryDisplay.textContent = `Ви заробили ${roundScore} балів!`;
  const nextTeam = (gameState.currentTeam === 1) ? gameState.team1Name : gameState.team2Name;
  nextTeamNameDisplay.textContent = nextTeam;
  showScreen(turnEndScreen);
}

// 8. Оновлення табло
function updateScoreboard() {
  team1NameDisplay.textContent = gameState.team1Name;
  team1ScoreDisplay.textContent = gameState.team1Score;
  team2NameDisplay.textContent = gameState.team2Name;
  team2ScoreDisplay.textContent = gameState.team2Score;
}

// 9. Показати переможця
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

// 10. Скидання гри
function resetGame() {
  gameState.isGameInProgress = false; // Гра не йде
  clearGameState(); // Очищуємо збереження
  
  scoreboard.style.display = 'none'; 
  continueBtn.style.display = 'none'; // Ховаємо кнопку "Продовжити"
  
  // Скидаємо поля вводу
  team1Input.value = "Команда 1";
  team2Input.value = "Команда 2";
  timeInput.value = 60;
  roundsInput.value = 5; 
  
  showScreen(startScreen); 
}

// --- ЗАПУСК ДОДАТКУ ---
// Замість старих `showScreen(startScreen)` тощо,
// ми запускаємо нашу нову головну функцію `initializeApp`
initializeApp();
