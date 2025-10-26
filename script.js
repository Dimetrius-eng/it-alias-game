// --- Наша база слів ---
const itTerms = [
    "Застосунок", "Мережа", "Пристрій", "Помилка", "Властивість", "Змінна",
    "Цикл", "Масив", "Алгоритм", "Компілятор", "Інтерпретатор", "Кодування",
    "Шифрування", "Дешифрування", "Користувач", "Інтерфейс", "Сховище",
    "Репозиторій", "Гілка", "Злиття", "Процесор", "Пам'ять", "Накопичувач",
    "Переглядач", "Посилання", "Сценарій", "Таблиця стилів", "Сервер", "Клієнт",
    "Запит", "Відповідь", "Хмара", "База даних", "Автентифікація", "Авторизація",
    "Резервне копіювання", "Відновлення", "Протокол", "Маршрутизатор",
    "Брандмауер", "Піксель", "Роздільна здатність", "Кеш", "Фреймворк",
    "Бібліотека", "Функція", "Аргумент", "Параметр", "Об'єкт", "Клас",
    "Спадкування", "Поліморфізм", "Інкапсуляція", "Абстракція", "Налагодження",
    "Термінал", "Консоль", "Хостинг", "Домен", "Синтаксис", "Семантика",
    "Розробник", "Програміст", "Тестувальник", "Аналітик", "Архітектура"
];

let availableWords = [];

// --- Змінні для гри ---
let team1Score = 0;
let team2Score = 0;
let team1Name = "Команда 1";
let team2Name = "Команда 2";
let currentTeam = 1; 
let roundScore = 0;
let roundTime = 60;
let timeLeft = 0;
let timerInterval;

// НОВІ ЗМІННІ: Для підрахунку раундів
let totalRounds = 5;
let currentRound = 0;

// --- Знаходимо елементи на HTML-сторінці ---

// Екрани
const screens = document.querySelectorAll('.screen');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const turnEndScreen = document.getElementById('turn-end-screen');
const gameOverScreen = document.getElementById('game-over-screen'); // Новий екран

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
const roundsInput = document.getElementById('rounds-input'); // Нове поле

// Кнопки
const startBtn = document.getElementById('start-btn');
const skipBtn = document.getElementById('skip-btn');
const correctBtn = document.getElementById('correct-btn');
const nextTurnBtn = document.getElementById('next-turn-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const newGameBtn = document.getElementById('new-game-btn'); // Нова кнопка

// Ігрові поля
const timerDisplay = document.getElementById('timer');
const roundCounterDisplay = document.getElementById('round-counter'); // Нове поле
const wordDisplay = document.getElementById('word-display');
const roundSummaryDisplay = document.getElementById('round-summary');
const nextTeamNameDisplay = document.getElementById('next-team-name');
const winnerMessageDisplay = document.getElementById('winner-message'); // Нові
const finalScoreSummaryDisplay = document.getElementById('final-score-summary'); // Нові

// --- Прив'язуємо функції до кнопок ---
startBtn.addEventListener('click', setupGame);
correctBtn.addEventListener('click', handleCorrect);
skipBtn.addEventListener('click', handleSkip);
nextTurnBtn.addEventListener('click', startRound);
resetGameBtn.addEventListener('click', resetGame);
newGameBtn.addEventListener('click', resetGame); // Кнопка "Нова гра" теж скидає гру

// --- Функції гри ---

function showScreen(screenToShow) {
    screens.forEach(screen => screen.classList.remove('active'));
    screenToShow.classList.add('active');
}

// 1. Налаштування гри
function setupGame() {
    team1Name = team1Input.value || "Команда 1";
    team2Name = team2Input.value || "Команда 2";
    roundTime = parseInt(timeInput.value, 10) || 60;
    totalRounds = parseInt(roundsInput.value, 10) || 5; // Зчитуємо кількість раундів

    team1Score = 0;
    team2Score = 0;
    currentTeam = 1;
    currentRound = 0; // Скидаємо лічильник раундів

    updateScoreboard();
    scoreboard.style.display = 'flex'; 

    startRound();
}

// 2. Початок нового раунду
function startRound() {
    roundScore = 0;
    timeLeft = roundTime;
    timerDisplay.textContent = timeLeft;
    
    // Збільшуємо раунд, ТІЛЬКИ якщо ходить перша команда
    if (currentTeam === 1) {
        currentRound++;
    }
    
    // Оновлюємо лічильник раундів
    roundCounterDisplay.textContent = `${currentRound} / ${totalRounds}`;
    
    // Виділяємо активну команду на табло
    if (currentTeam === 1) {
        document.getElementById('team1-display').classList.add('active-team');
        document.getElementById('team2-display').classList.remove('active-team');
    } else {
        document.getElementById('team1-display').classList.remove('active-team');
        document.getElementById('team2-display').classList.add('active-team');
    }

    availableWords = [...itTerms].sort(() => Math.random() - 0.5);

    nextWord();
    showScreen(gameScreen);
    startTimer();
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
        availableWords = [...itTerms].sort(() => Math.random() - 0.5);
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

    if (currentTeam === 1) {
        team1Score += roundScore;
    } else {
        team2Score += roundScore;
    }
    updateScoreboard();
    
    // --- ОСНОВНА ЗМІНА: ПЕРЕВІРКА НА КІНЕЦЬ ГРИ ---
    // Перевіряємо, чи це був хід Команди 2 І чи досягли ми ліміту раундів
    if (currentTeam === 2 && currentRound >= totalRounds) {
        showWinner(); // Якщо так - показуємо переможця
    } else {
        // Якщо ні - просто передаємо хід
        roundSummaryDisplay.textContent = `Ви заробили ${roundScore} балів!`;
        currentTeam = (currentTeam === 1) ? 2 : 1;
        const nextTeam = (currentTeam === 1) ? team1Name : team2Name;
        nextTeamNameDisplay.textContent = nextTeam;
        showScreen(turnEndScreen);
    }
}

// 8. Оновлення табло
function updateScoreboard() {
    team1NameDisplay.textContent = team1Name;
    team1ScoreDisplay.textContent = team1Score;
    team2NameDisplay.textContent = team2Name;
    team2ScoreDisplay.textContent = team2Score;
}

// 9. НОВА ФУНКЦІЯ: Показати переможця
function showWinner() {
    let winnerMsg = "";
    if (team1Score > team2Score) {
        winnerMsg = `🎉 Перемогла ${team1Name}! 🎉`;
    } else if (team2Score > team1Score) {
        winnerMsg = `🎉 Перемогла ${team2Name}! 🎉`;
    } else {
        winnerMsg = "Нічия! 🤝"; // Якщо рахунок рівний
    }
    
    winnerMessageDisplay.textContent = winnerMsg;
    finalScoreSummaryDisplay.textContent = `Фінальний рахунок: ${team1Name} (${team1Score}) - ${team2Name} (${team2Score})`;
    
    showScreen(gameOverScreen); // Показуємо екран завершення гри
}

// 10. Скидання гри
function resetGame() {
    team1Score = 0;
    team2Score = 0;
    currentTeam = 1;
    currentRound = 0;
    scoreboard.style.display = 'none'; 
    
    team1Input.value = "Команда 1";
    team2Input.value = "Команда 2";
    timeInput.value = 60;
    roundsInput.value = 5; // Скидаємо і поле раундів
    
    showScreen(startScreen); 
}

// --- Початковий стан при завантаженні ---
showScreen(startScreen); 
scoreboard.style.display = 'none';