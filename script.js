// 전역 변수 정의
const images = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg', 'image6.jpg', 'image7.jpg', 'image8.jpg', 'image9.jpg', 'image10.jpg', 'image11.jpg', 'image12.jpg'];
const cards = [...images, ...images]; // 쌍을 만들기 위해 이미지를 복제
let flippedCards = [];
let matchedPairs = 0; // 정확히 일치하는 카드 쌍의 수를 추적하는 변수
let totalPairs = images.length; // 전체 카드 쌍의 수
let stopwatchInterval;
let stopwatchSeconds = 0;
let gameStarted = false;

document.addEventListener('DOMContentLoaded', () => {
  updateStopwatch();
  createGameGrid(); // Create the game grid once when the page loads

  const startGameButton = document.getElementById('start-game-button');
  const restartButton = document.getElementById('restart-button');

  startGameButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', resetGame);
});

function createGameGrid() {
  const shuffledCards = shuffle(cards);
  const memoryGame = document.querySelector('.memory-game');

  shuffledCards.forEach((image) => {
    const newCard = createCard(image);
    newCard.addEventListener('click', flipCard);
    memoryGame.appendChild(newCard);
  });

  const gameClearMessage = document.querySelector('.game-clear-message');
  gameClearMessage.style.display = 'none';
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createCard(image) {
  const div = document.createElement('div');
  div.classList.add('card');
  const img = document.createElement('img');
  img.src = `images/${image}`;
  div.appendChild(img);
  return div;
}

function startGame() {
  resetStopwatch();
  startStopwatch();
  gameStarted = true;
}

function flipCard() {
  if (flippedCards.length < 2) {
    const card = this;
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      setTimeout(checkMatch, 500);
    }
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;

  if (card1.querySelector('img').src === card2.querySelector('img').src) {
    card1.removeEventListener('click', flipCard);
    card2.removeEventListener('click', flipCard);
    matchedPairs++;

    if (matchedPairs === totalPairs) {
      stopStopwatch();
      showGameClearMessage();
    }
  } else {
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
  }

  flippedCards = [];
}

function resetGame() {
  const memoryGame = document.querySelector('.memory-game');
  const gameClearMessage = document.querySelector('.game-clear-message');

  // Stop the stopwatch without starting it
  stopStopwatch();

  // Reset the stopwatch seconds to 0
  stopwatchSeconds = 0;

  // 이전 카드에서 이벤트 리스너 제거
  const existingCards = document.querySelectorAll('.card');
  existingCards.forEach(card => card.removeEventListener('click', flipCard));

  // 기존 카드 및 메시지 제거
  memoryGame.innerHTML = '';
  gameClearMessage.style.display = 'none';

  matchedPairs = 0; // 정확히 일치하는 카드 쌍의 수를 초기화
  updateStopwatch();

  if (gameStarted) {
    createGameGrid(); // Only recreate the game grid if the game has started
  }

  gameStarted = false; // Reset the game started flag
}

function showGameClearMessage() {
  const gameClearMessage = document.querySelector('.game-clear-message');
  const recordedTimeSpan = document.getElementById('recorded-time');
  recordedTimeSpan.textContent = formatTime(stopwatchSeconds);
  gameClearMessage.style.display = 'block';

  // Add this line to update the rankings after the game is cleared
  updateRankings();
}

function startStopwatch() {
  stopwatchInterval = setInterval(() => {
    stopwatchSeconds++;
    updateStopwatch();
  }, 1000);
}

function stopStopwatch() {
  clearInterval(stopwatchInterval);
}

function resetStopwatch() {
  stopwatchSeconds = 0;
  updateStopwatch();
}

function updateStopwatch() {
  const stopwatchSpan = document.getElementById('stopwatch');
  stopwatchSpan.textContent = formatTime(stopwatchSeconds);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

function saveToLocalStorage(userName, record) {
  let rankings = JSON.parse(sessionStorage.getItem('rankings')) || [];

  rankings.push({ userName, record });
  rankings.sort((a, b) => a.record - b.record);
  if (rankings.length > 5) {
    rankings.pop();
  }

  sessionStorage.setItem('rankings', JSON.stringify(rankings));
}

// Add this function to retrieve rankings from localStorage
function getRankings() {
  return JSON.parse(sessionStorage.getItem('rankings')) || [];
}

function registerRanking() {
  const userName = prompt('유저 이름 입력:');
  if (userName) {
    const recordedTime = formatTime(stopwatchSeconds);
    saveToLocalStorage(userName, stopwatchSeconds);
    updateRankings();
    alert(`랭킹 등록 완료!\n${userName}: ${recordedTime}`);
  }
}

function updateRankings() {
  const rankingsContainer = document.querySelector('.rankings');
  rankingsContainer.innerHTML = ''; // Clear existing rankings

  const rankings = getRankings();

  rankings.forEach((entry, index) => {
    const rank = index + 1;
    const { userName, record } = entry;
    const formattedRecord = formatTime(record);

    const rankElement = document.createElement('div');
    rankElement.textContent = `${rank}위: ${userName} ${formattedRecord}`;
    rankingsContainer.appendChild(rankElement);
  });
}