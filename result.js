function logout() {
  localStorage.removeItem('role');
  window.location.href = 'login.html';
}

window.onload = function () {
  const result = JSON.parse(localStorage.getItem('quizResult'));

  if (!result) {
    alert("No result found.");
    window.location.href = 'index.html';
    return;
  }

  const { questions, userAnswers, questionResults, totalScore } = result;

  const maxScore = questions.reduce((acc, q) => acc + q.score, 0);
  const percent = Math.round((totalScore / maxScore) * 100);

  let message = "";
  let status = "";

  if (percent >= 100) {
    message = "🏆 Topper! Full Marks!";
  } else if (percent >= 90) {
    message = "🎉 Excellent!";
  } else if (percent >= 35) {
    message = "✅ Passed!";
  } else {
    message = "❌ Failed!";
  }

  if (percent >= 35) {
    status = "Passed";
  } else {
    status = "Failed";
  }

  document.getElementById('resultMessage').textContent = message;
  document.getElementById('score').textContent = `${totalScore} / ${maxScore}`;
  document.getElementById('percent').textContent = `${percent}%`;
  document.getElementById('status').textContent = status;

  const list = document.getElementById('answerList');

  questions.forEach((q, i) => {
    const li = document.createElement('li');
    const correct = questionResults[i];
    li.className = correct ? 'correct' : 'incorrect';
    li.innerHTML = `
      Q${i + 1}: ${q.question}<br>
      <strong>Your Answer:</strong> ${userAnswers[i] || 'No Answer'}<br>
      <strong>Correct Answer:</strong> ${q.answer}<br>
      <strong>Score for this:</strong> ${correct ? q.score : 0}
    `;
    list.appendChild(li);
  });
};
