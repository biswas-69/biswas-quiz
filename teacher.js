// Allow only logged-in teacher
if (localStorage.getItem('role') !== 'teacher') {
  alert('Access denied. Please login as teacher.');
  window.location.href = 'login.html';
}

// Logout handler
function logout() {
  localStorage.removeItem('role');
  window.location.href = 'login.html';
}

// ===== CATEGORY MANAGEMENT =====
const defaultCategories = ["Math", "Science", "English", "Nepali", "History", "Geography", "Computer", "Art", "Music", "Sports"];

function getCategories() {
  let cats = JSON.parse(localStorage.getItem('quizCategories'));
  if (!Array.isArray(cats) || cats.length === 0) {
    cats = [...defaultCategories];
    localStorage.setItem('quizCategories', JSON.stringify(cats));
  }
  return cats;
}

function saveCategories(cats) {
  localStorage.setItem('quizCategories', JSON.stringify(cats));
}

function renderCategoryManager() {
  const container = document.getElementById('categoryManagerContainer');
  container.innerHTML = '';

  const cats = getCategories();

  cats.forEach((cat, idx) => {
    const div = document.createElement('div');
    div.className = 'category-row';
    div.innerHTML = `
      <input type="text" class="category-name-input" value="${cat}" data-index="${idx}" />
      <button class="save-cat-btn" data-index="${idx}">💾</button>
      <button class="delete-cat-btn" data-index="${idx}">🗑️</button>
    `;
    container.appendChild(div);
  });

  const newDiv = document.createElement('div');
  newDiv.className = 'category-row new-category-row';
  newDiv.innerHTML = `
    <input type="text" id="newCategoryInput" placeholder="New category name..." />
    <button id="addCategoryBtn">➕ Add Category</button>
  `;
  container.appendChild(newDiv);

  document.querySelectorAll('.save-cat-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      const input = document.querySelector(`input.category-name-input[data-index="${idx}"]`);
      const newName = input.value.trim();
      if (!newName) return alert('Name cannot be empty.');
      editCategory(idx, newName);
    };
  });

  document.querySelectorAll('.delete-cat-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      if (confirm('Delete category and all related questions?')) {
        deleteCategory(idx);
      }
    };
  });

  document.getElementById('addCategoryBtn').onclick = () => {
    const newCatInput = document.getElementById('newCategoryInput');
    const newCatName = newCatInput.value.trim();
    if (!newCatName) return alert('Please enter a category name.');
    addCategory(newCatName);
    newCatInput.value = '';
  };
}

function addCategory(catName) {
  let cats = getCategories();
  if (cats.includes(catName)) return alert('Category already exists.');
  cats.push(catName);
  saveCategories(cats);
  renderCategoryManager();
  updateAllCategoryDropdowns();
}

function editCategory(index, newName) {
  let cats = getCategories();
  const oldName = cats[index];
  if (cats.includes(newName)) return alert('Already exists.');
  cats[index] = newName;
  saveCategories(cats);

  let questions = JSON.parse(localStorage.getItem('questionsByCategory') || '{}');
  if (questions[oldName]) {
    questions[newName] = questions[oldName];
    delete questions[oldName];
    localStorage.setItem('questionsByCategory', JSON.stringify(questions));
  }

  renderCategoryManager();
  renderQuestions();
  updateAllCategoryDropdowns();
}

function deleteCategory(index) {
  let cats = getCategories();
  const cat = cats[index];
  cats.splice(index, 1);
  saveCategories(cats);

  let questions = JSON.parse(localStorage.getItem('questionsByCategory') || '{}');
  delete questions[cat];
  localStorage.setItem('questionsByCategory', JSON.stringify(questions));

  renderCategoryManager();
  renderQuestions();
  updateAllCategoryDropdowns();
}

// ===== QUESTION MANAGEMENT =====

function addQuestionBlock(prefill = {}) {
  const container = document.getElementById('questionInputsContainer');
  const categories = getCategories();
  const block = document.createElement('div');
  block.classList.add('question-block');

  const optionsHtml = categories.map(cat =>
    `<option value="${cat}" ${prefill.category === cat ? 'selected' : ''}>${cat}</option>`
  ).join('');

  block.innerHTML = `
    <label>Category:</label>
    <select class="category">${optionsHtml}</select>

    <label>Question:</label>
    <input type="text" class="question" value="${prefill.question || ''}" required>

    <label>Options (comma separated):</label>
    <input type="text" class="options" value="${prefill.options ? prefill.options.join(', ') : ''}" required>

    <label>Correct Answer:</label>
    <input type="text" class="answer" value="${prefill.answer || ''}" required>

    <label>Score:</label>
    <input type="number" class="score" value="${prefill.score || ''}" required min="1">

    <label>Image URL (optional):</label>
    <input type="text" class="image" value="${prefill.image || ''}">

    <label>Audio URL (optional):</label>
    <input type="text" class="audio" value="${prefill.audio || ''}">

    <label>Video URL (optional):</label>
    <input type="text" class="video" value="${prefill.video || ''}">

    <button type="button" style="background: #dc3545; color: white; margin-top:10px;" onclick="this.parentElement.remove()">❌ Delete This Block</button>
  `;

  container.appendChild(block);
}

function updateAllCategoryDropdowns() {
  const categories = getCategories();
  document.querySelectorAll('.question-block select.category').forEach(select => {
    const current = select.value;
    select.innerHTML = categories.map(cat =>
      `<option value="${cat}" ${cat === current ? 'selected' : ''}>${cat}</option>`
    ).join('');
  });
}

function clearQuestionForm() {
  const container = document.getElementById('questionInputsContainer');
  container.innerHTML = '';
  addQuestionBlock();
}

document.getElementById('questionsForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const blocks = document.querySelectorAll('.question-block');
  let data = JSON.parse(localStorage.getItem('questionsByCategory') || '{}');
  let added = 0;

  blocks.forEach(block => {
    const cat = block.querySelector('.category').value;
    const q = block.querySelector('.question').value.trim();
    const opts = block.querySelector('.options').value.trim().split(',').map(o => o.trim()).filter(o => o);
    const ans = block.querySelector('.answer').value.trim();
    const score = parseInt(block.querySelector('.score').value);
    const img = block.querySelector('.image').value.trim();
    const audio = block.querySelector('.audio').value.trim();
    const video = block.querySelector('.video').value.trim();

    if (!q || opts.length < 2 || !ans || isNaN(score) || score < 1) return;

    if (!data[cat]) data[cat] = [];
    data[cat].push({ question: q, options: opts, answer: ans, score, image: img, audio, video });
    added++;
  });

  if (added === 0) return alert('Please complete at least one valid question.');
  localStorage.setItem('questionsByCategory', JSON.stringify(data));
  alert(`${added} question(s) saved.`);
  clearQuestionForm();
  renderQuestions();
});

function renderQuestions() {
  const list = document.getElementById('questionList');
  list.innerHTML = '';
  const data = JSON.parse(localStorage.getItem('questionsByCategory') || '{}');

  Object.keys(data).forEach(category => {
    const panel = document.createElement('div');
    panel.classList.add('category-panel');

    const header = document.createElement('div');
    header.classList.add('category-header');
    header.textContent = category;

    const body = document.createElement('div');
    body.classList.add('category-body');
    body.style.display = 'none';

    header.addEventListener('click', () => {
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    });

    data[category].forEach((q, idx) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question-entry';
      let mediaHtml = '';
      if (q.image) mediaHtml += `<br><img src="${q.image}" style="max-width: 200px;">`;
      if (q.audio) mediaHtml += `<br><audio controls src="${q.audio}"></audio>`;
      if (q.video) mediaHtml += `<br><video controls src="${q.video}" style="max-width: 300px;"></video>`;

      qDiv.innerHTML = `
        <strong>Q${idx + 1}:</strong> ${q.question}<br>
        <em>Options:</em> ${q.options.join(', ')}<br>
        <em>Answer:</em> ${q.answer} | <em>Score:</em> ${q.score}
        ${mediaHtml}
        <br>
        <button onclick="editQuestion('${category}', ${idx})">✏️ Edit</button>
        <button onclick="deleteQuestion('${category}', ${idx})">🗑️ Delete</button>
      `;
      body.appendChild(qDiv);
    });

    panel.appendChild(header);
    panel.appendChild(body);
    list.appendChild(panel);
  });
}

function deleteQuestion(category, index) {
  let data = JSON.parse(localStorage.getItem('questionsByCategory') || '{}');
  if (!data[category]) return;
  data[category].splice(index, 1);
  if (data[category].length === 0) delete data[category];
  localStorage.setItem('questionsByCategory', JSON.stringify(data));
  renderQuestions();
  alert('Question deleted successfully.');
}

function editQuestion(category, index) {
  let data = JSON.parse(localStorage.getItem('questionsByCategory') || '{}');
  if (!data[category]) return;
  const q = data[category][index];
  data[category].splice(index, 1);
  if (data[category].length === 0) delete data[category];
  localStorage.setItem('questionsByCategory', JSON.stringify(data));
  renderQuestions();
  addQuestionBlock({
    category,
    question: q.question,
    options: q.options,
    answer: q.answer,
    score: q.score,
    image: q.image,
    audio: q.audio,
    video: q.video
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// On load
window.onload = () => {
  clearQuestionForm();
  renderCategoryManager();
  renderQuestions();
};
