//API
const API_URL = "https://www.thecocktaildb.com/api/json/v1/1";

// DOM Elements
const homeScreen = document.getElementById("home-screen");
const startScreenImage = document.getElementById("start-screen-image");
const startButton = document.getElementById("start-button");
const loadingScreen = document.getElementById("loading-screen");
const loadingText = document.getElementById("loading-text");
const quizScreen = document.getElementById("quiz-screen");
const gameTimer= document.getElementById("game-timer");
const gameScore = document.getElementById("game-score");
const cocktailImage = document.getElementById("cocktail-image");
const hintButton = document.getElementById("hint-button");
const nextButton = document.getElementById("next-button");
const resultScreen = document.getElementById("result-screen");
const totalScore = document.getElementById("total-score");
const totalTimeTaken = document.getElementById("total-time-taken");
const restartButton = document.getElementById("restart-button");
const menuButton = document.getElementById("menu-button");

const existingOptions = document.querySelector(".options-container");

// Glass Types
const GLASS_TYPES = [
    "Martini Glass",
    "Old Fashioned Glass (Rocks Glass)", 
    "Copper Mug",
    "Margarita Glass",
    "Wine Glass",
    "Hurricane Glass",
    "Beer Glass (Pint Glass)",
    "Highball Glass", 
    "Collins Glass",
    "Shot Glass",
    "Champagne Flute",
    "Coupe Glass"
  ];

let cocktails = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let secondsElapsed = 0;
let timeRemaining = 15;
let totalTime = 0;
let quizStartTime;
let questions = [];
let selectedMode = "api";
let hintUsed = false;

function setupQuiz() {
startButton.addEventListener("click", startQuiz);
hintButton.addEventListener("click", showHint);
nextButton.addEventListener("click", nextQuestion);
restartButton.addEventListener("click", restartQuiz);
menuButton.addEventListener("click", goToMainMenu);
}

// calling the questions
document.addEventListener("DOMContentLoaded", setupQuiz);

async function loadQuestions() {
    questions = await generateCocktailQuestion();
  }

// Start Quiz
function startQuiz() {
    homeScreen.style.display = "none";
    loadingScreen.style.display = "block";
    
    // Reset variables
    currentQuestionIndex = 0;
    score = 0;
    hintUsed = false;
    timeRemaining = 15;
    totalTime = 0;
    
    quizStartTime = Date.now();
    
    loadQuestions().then(() => {
      loadingScreen.style.display = "none";
      quizScreen.style.display = "block";
      startTimer();
      showQuestion();
    });
  }

  function showQuestion() {
    const question = questions[currentQuestionIndex];
    if (!question) {
      endQuiz();
      return;
    }

    // Reset hint
      hintUsed = false;
      timeRemaining = 15;
      updateTimer();
      startTimer();
      question.options.forEach(optionText => {
        optionButton.textContent = optionText;
        optionButton.addEventListener("click", () => selectAnswer(optionText));
        optionContainer.appendChild(optionButton);
      });
    
      // Append everything
      quizScreen.insertBefore(questionElement, document.querySelector(".quiz-footer"));
      quizScreen.insertBefore(optionsContainer, document.querySelector(".quiz-footer"));

      document.getElementById("hint-button").addEventListener("click", showHint);
      document.getElementById("next-button").addEventListener("click", nextQuestion);
    }

  async function fetchRandomCocktail() {
    const res = await fetch(`${API_URL}/random.php`);
    const data = await res.json();
    return data.drinks[0];
  }



// Get ingredients from a cocktail object
function extractIngredients(cocktail) {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}`];
      if (ingredient) ingredients.push(ingredient);
    }
    return ingredients;
  }
  
  // Generate multiple choice options
  function getUniqueGlassOptions(correctGlass) {
    const incorrectGlasses = GLASS_TYPES.filter(g => g !== correctGlass);
    const selected = [];
  
    while (selected.length < 3 && incorrectGlasses.length > 0) {
      const randomIndex = Math.floor(Math.random() * incorrectGlasses.length);
      selected.push(incorrectGlasses.splice(randomIndex, 1)[0]);
    }
  
    return [...selected, correctGlass].sort(() => Math.random() - 0.5);
  }
  
  // Generate a quiz question from cocktail data
  async function generateCocktailQuestion() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const drink = data.drinks[0];
  
      const name = drink.strDrink;
      const glass = drink.strGlass;
      const ingredients = extractIngredients(drink);
  
      const questions = [];
  
      // Question 1: What ingredients are in [Cocktail Name]?
      const shuffledIngredients = [...ingredients].sort(() => Math.random() - 0.5);
      const fakeIngredients = ["Salt", "Sugar", "Milk", "Soda Water", "Coffee", "Tomato Juice", "Butter"];
      const allOptions = [...shuffledIngredients.slice(0, 2), ...fakeIngredients.slice(0, 2)];
      const mixedOptions = allOptions.sort(() => Math.random() - 0.5);
  
      questions.push({
        type: "ingredients",
        question: `Which of the following is used in a ${name}?`,
        options: mixedOptions,
        correctAnswer: shuffledIngredients[0],
      });
  
      // Question 2: What glass is typically used for ${name}?
      questions.push({
        type: "glass",
        question: `What glass is typically used for a ${name}?`,
        options: getUniqueGlassOptions(glass),
        correctAnswer: glass,
      });
  
      // Question 3: What is the name of this cocktail? (Reverse)
      const fakeNames = ["Sunset Breeze", "Velvet Hammer", "Twisted Lemon", "Tropical Kiss"];
      const nameOptions = [...fakeNames.slice(0, 3), name].sort(() => Math.random() - 0.5);
  
      questions.push({
        type: "name",
        question: `Which cocktail contains these ingredients: ${ingredients.slice(0, 3).join(', ')}?`,
        options: nameOptions,
        correctAnswer: name,
      });
  
      return questions;
    } catch (error) {
      console.error("Error fetching cocktail data:", error);
      return [];
    }
  }



  //Start timer
function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
      timeRemaining--;
      updateTimer();
      
      if (timeRemaining <= 0) {
        clearInterval(timer);
        timeUp();
      }
    }, 1000);
  }
  
  // timer display
  function updateTimer() {
    gameTimer.textContent = `Time: ${timeRemaining}s`;
    if (timeRemaining <= 5) {
      gameTimer.style.color = 'red';
    } else {
      gameTimer.style.color = 'green';
    }
  }
  
  // Handle time up
  function timeUp() {
    const options = document.querySelectorAll('.option-button');
    options.forEach(option => {
      option.disabled = true;
    });
    nextButton.style.display = 'block';
  }
  
  // Handle answer selection
  function selectAnswer(selectedAnswer) {
    clearInterval(gameTimer);
    const question = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option-btn');
    
    options.forEach(option => {
      option.disabled = true;
      
      if (option.textContent === question.correctAnswer) {
        option.classList.add('correct');
      } else if (option.textContent === selectedAnswer && selectedAnswer !== question.correctAnswer) {
        option.classList.add('wrong');
      }
    });
    
    if (selectedAnswer === question.correctAnswer) {
      score += hintUsed ? 5 : 10; // removes points if hint option is used
    }
    
    gameScore.textContent = `Score: ${score}`;
    nextButton.style.display = 'block';
  }
  
  // Show hint
  function showHint() {
    if (hintUsed) return;
    
    const question = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option-btn');
    
    // Remove two incorrect options
    let removed = 0;
    options.forEach(option => {
      if (removed < 2 && 
          option.textContent !== question.correctAnswer && 
          !option.classList.contains('disabled-hint')) {
        option.style.visibility = 'hidden';
        option.classList.add('disabled-hint');
        removed++;
      }
    });
    
    hintUsed = true;
  }
  
  // Next question
  function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }
  
  // Show results
  function showResults() {
    totalTimeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
    totalScore.textContent = `Final score: ${score}/${questions.length * 10}`;
    totalTimeTaken.textContent = `Total time: ${totalTime} seconds`;
    
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
  }
  
  // Restart the questions
  function restartQuiz() {
    startQuiz();
  }
  
  // Go to main menu
  function goToMainMenu() {
    resultScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
  }

