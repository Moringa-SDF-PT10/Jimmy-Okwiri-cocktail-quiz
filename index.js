const startBtn = document.getElementById('start-button');
const loadingScreen = document.getElementById('loading-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question');
const optionContainer = document.getElementById('option-container');
const cocktailImage = document.getElementById('cocktail-image');
const scoreDisplay = document.getElementById('game-score');
const timerDisplay = document.getElementById('game-timer');
const hintBtn = document.getElementById('hint-button');
const nextBtn = document.getElementById('next-button');
const restartBtn = document.getElementById('restart-button');
const menuBtn = document.getElementById('menu-button');
const totalScore = document.getElementById('total-score');
const totalTimeTaken = document.getElementById('total-time-taken');
const highScoreDisplay = document.getElementById('high-score');

let currentQuestion = {};
let currentOptions = [];
let score = 0;
let timePerQuestion = 15;
let timer;
let totalTime = 0;
let hintUsed = false;
let questionCount = 0;
const totalQuestions = 10;

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', handleNextQuestion);
hintBtn.addEventListener('click', showHint);
restartBtn.addEventListener('click', restartQuiz);
menuBtn.addEventListener('click', () => {
  resultScreen.classList.add('hidden');
  document.getElementById('home-screen').classList.remove('hidden');
});

function startQuiz() {
  score = 0;
  totalTime = 0;
  questionCount = 0;
  document.getElementById('home-screen').classList.add('hidden');
  loadingScreen.style.display = 'flex';
  loadQuestion();
}

async function loadQuestion() {
  if (questionCount >= totalQuestions) {
    showResults();
    return;
  }

  clearInterval(timer);
  resetState();
  loadingScreen.style.display = 'flex';
  quizScreen.classList.add('hidden');
  hintUsed = false;

  try {
    const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
    const data = await response.json();
    const drink = data.drinks[0];

    currentQuestion = {
      name: drink.strDrink,
      image: drink.strDrinkThumb,
      correctIngredients: getIngredients(drink),
      glass: drink.strGlass,
      category: drink.strCategory
    };

    questionCount++;
    generateQuestion();
  } catch (error) {
    questionText.textContent = 'Failed to load question.';
    console.error(error);
  }
}

function generateQuestion() {
  cocktailImage.src = currentQuestion.image;
  const allIngredients = [...currentQuestion.correctIngredients];
  while (allIngredients.length < 4) {
    allIngredients.push(getRandomIngredient());
  }

  const questionType = Math.random() < 0.5 ? 'ingredient' : 'glass';

  if (questionType === 'ingredient') {
    questionText.textContent = `Which of the following is NOT in ${currentQuestion.name}?`;
    renderOptions(allIngredients, currentQuestion.correctIngredients);
  } else {
    const glassOptions = [currentQuestion.glass, ...generateFakeGlasses()];
    questionText.textContent = `What glass is used for ${currentQuestion.name}?`;
    renderOptions(glassOptions, [currentQuestion.glass]);
  }

  startTimer();
  loadingScreen.style.display = 'none';
  quizScreen.classList.remove('hidden');
}

function renderOptions(options, correctAnswers) {
  optionContainer.innerHTML = '';
  const shuffledOptions = shuffleArray([...options]);
  shuffledOptions.forEach(option => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.textContent = option;
    btn.addEventListener('click', () => handleAnswer(btn, correctAnswers.includes(option)));
    optionContainer.appendChild(btn);
  });
}

function handleAnswer(button, isCorrect) {
  clearInterval(timer);
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    button.classList.add('correct');
    score++;
  } else {
    button.classList.add('wrong');
    const correctBtn = [...buttons].find(btn => currentQuestion.correctIngredients.includes(btn.textContent) || btn.textContent === currentQuestion.glass);
    if (correctBtn) correctBtn.classList.add('correct');
  }

  scoreDisplay.textContent = `Score: ${score}`;
  nextBtn.style.display = 'inline-block';
  totalTime += timePerQuestion - parseInt(timerDisplay.textContent.replace('Time: ', '').replace('s', ''));
}

function startTimer() {
  let timeLeft = timePerQuestion;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  timerDisplay.style.color = 'green';

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 5) {
      timerDisplay.style.color = 'red';
    }
    if (timeLeft <= 0) {
      clearInterval(timer);
      timerDisplay.textContent = 'Time: 0s';
      handleNextQuestion();
    }
  }, 1000);
}

function resetState() {
  nextBtn.style.display = 'none';
  optionContainer.innerHTML = '';
  hintBtn.disabled = false;
  hintBtn.style.display = 'inline-block';
}

function showHint() {
  if (hintUsed) return;
  const options = document.querySelectorAll('.option-btn');
  let removed = 0;

  options.forEach(option => {
    if (removed < 2 && !currentQuestion.correctIngredients.includes(option.textContent) && option.textContent !== currentQuestion.glass) {
      option.style.visibility = 'hidden';
      removed++;
    }
  });

  hintUsed = true;
  hintBtn.disabled = true;
}

function restartQuiz() {
  resultScreen.classList.add('hidden');
  score = 0;
  totalTime = 0;
  questionCount = 0;
  startQuiz();
}

function getIngredients(drink) {
  let ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    if (ing) ingredients.push(ing);
  }
  return ingredients;
}

function getRandomIngredient() {
  const commonIngredients = ['Vodka', 'Gin', 'Tequila', 'Whiskey', 'Rum', 'Orange Juice', 'Cranberry Juice', 'Lime', 'Mint', 'Triple Sec'];
  return commonIngredients[Math.floor(Math.random() * commonIngredients.length)];
}

function generateFakeGlasses() {
  const glassTypes = ['Highball glass', 'Martini Glass', 'Old-fashioned glass', 'Hurricane glass', 'Champagne flute', 'Collins Glass'];
  return shuffleArray(glassTypes.filter(g => g !== currentQuestion.glass)).slice(0, 3);
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function handleNextQuestion() {
  loadQuestion();
}

function showResults() {
  quizScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  totalScore.textContent = `Your Score: ${score}`;
  totalTimeTaken.textContent = `Total Time: ${totalTime} seconds`;

  const highScore = localStorage.getItem('highScore') || 0;
  if (score > highScore) {
    localStorage.setItem('highScore', score);
  }
  highScoreDisplay.textContent = `High Score: ${localStorage.getItem('highScore')}`;
}
