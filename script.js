let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let questionResults = [];
let totalScore = 0;
let timer;
let timeLeft = 30;
let selectedCategory = "";


function logout() {
  localStorage.removeItem('role');
  window.location.href = 'login.html';
}

// Start Quiz
function startQuiz() {
  selectedCategory = document.getElementById('categorySelect').value;
  const allData = JSON.parse(localStorage.getItem('questionsByCategory') || '{}');

  if (!allData[selectedCategory] || allData[selectedCategory].length === 0) {
    alert("No questions available in this category.");
    return;
  }

  questions = allData[selectedCategory];
  currentQuestionIndex = 0;
  userAnswers = new Array(questions.length).fill(null);
  questionResults = new Array(questions.length).fill(false);
  totalScore = 0;

  document.getElementById('categorySelector').style.display = 'none';
  document.getElementById('quizArea').style.display = 'block';
  loadQuestion(currentQuestionIndex);
  startTimer();
}

// Load a specific question
function loadQuestion(index) {
  resetTimer();

  const q = questions[index];

  document.getElementById('questionNumber').textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById('questionText').textContent = q.question;

  const img = document.getElementById('questionImage');
  if (q.image) {
    img.src = q.image;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  const optionsDiv = document.getElementById('optionsContainer');
  optionsDiv.innerHTML = '';
  q.options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.className = 'option-btn';
    btn.onclick = () => selectOption(option);
    if (userAnswers[index] === option) {
      btn.classList.add('selected');
    }
    optionsDiv.appendChild(btn);
  });
}

// Option selection
function selectOption(option) {
  userAnswers[currentQuestionIndex] = option;

  const q = questions[currentQuestionIndex];
  const correct = option === q.answer;
  questionResults[currentQuestionIndex] = correct;

  if (correct) {
    questionResults[currentQuestionIndex] = true;
  } else {
    questionResults[currentQuestionIndex] = false;
  }

  loadQuestion(currentQuestionIndex); // refresh button styles
}

// Navigation
function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
  } else {
    finishQuiz();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion(currentQuestionIndex);
  }
}

// Timer
function startTimer() {
  clearInterval(timer);
  timeLeft = 30;
  document.getElementById('timer').textContent = `⏱️ ${timeLeft}`;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `⏱️ ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 30;
  document.getElementById('timer').textContent = `⏱️ ${timeLeft}`;
  startTimer();
}

// End Quiz
function finishQuiz() {
  clearInterval(timer);
  totalScore = 0;

  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.answer) {
      totalScore += q.score;
    }
  });

  const resultData = {
    questions,
    userAnswers,
    questionResults,
    totalScore
  };

  localStorage.setItem('quizResult', JSON.stringify(resultData));
  window.location.href = 'result.html';
}

// On load: populate categories
window.onload = () => {
  const select = document.getElementById('categorySelect');
  const data = JSON.parse(localStorage.getItem('questionsByCategory') || '{}');

  if (Object.keys(data).length === 0) {
    select.innerHTML = "<option disabled>No categories found</option>";
  } else {
    Object.keys(data).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
  }

  document.getElementById('quizArea').style.display = 'none';
};
