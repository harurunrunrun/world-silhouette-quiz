/* SPDX-License-Identifier: MIT */
(() => {
  'use strict';

  const DATA = window.COUNTRY_DATA || [];
  const REGION_OPTIONS = [
    ['world', 'Worldwide'],
    ['Africa', 'Africa'],
    ['Asia', 'Asia'],
    ['Europe', 'Europe'],
    ['North America', 'North America & Caribbean'],
    ['South America', 'South America'],
    ['Oceania', 'Oceania']
  ];
  const QUESTION_COUNT = 10;

  const el = {
    setup: document.getElementById('setupView'),
    quiz: document.getElementById('quizView'),
    result: document.getElementById('resultView'),
    regionGrid: document.getElementById('regionGrid'),
    summary: document.getElementById('selectionSummary'),
    start: document.getElementById('startButton'),
    questionNumber: document.getElementById('questionNumber'),
    settingLabel: document.getElementById('quizSettingLabel'),
    score: document.getElementById('scoreValue'),
    progress: document.getElementById('progressBar'),
    shape: document.getElementById('shapePath'),
    answers: document.getElementById('answers'),
    feedback: document.getElementById('feedback'),
    next: document.getElementById('nextButton'),
    finalScore: document.getElementById('finalScore'),
    resultMessage: document.getElementById('resultMessage'),
    review: document.getElementById('review'),
    retry: document.getElementById('retryButton'),
    home: document.getElementById('homeButton')
  };

  const state = {
    coverage: 'standard',
    region: 'world',
    questions: [],
    index: 0,
    score: 0,
    locked: false,
    history: []
  };

  function shuffle(items) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function activePool() {
    return DATA.filter(country => {
      const coverageMatch = state.coverage === 'expanded' || country.group === 'standard';
      const regionMatch = state.region === 'world' || country.region === state.region;
      return coverageMatch && regionMatch;
    });
  }

  function regionLabel() {
    return REGION_OPTIONS.find(([id]) => id === state.region)?.[1] || 'Worldwide';
  }

  function coverageLabel() {
    return state.coverage === 'expanded' ? 'Expanded mode' : 'Standard mode';
  }

  function updateSummary() {
    const pool = activePool();
    el.summary.innerHTML = `<strong>${coverageLabel()} · ${regionLabel()}</strong><br>10 questions from ${pool.length} ${pool.length === 1 ? 'entry' : 'entries'}`;
    document.querySelectorAll('.region-btn').forEach(button => {
      const region = button.dataset.region;
      const count = DATA.filter(c => (state.coverage === 'expanded' || c.group === 'standard') && (region === 'world' || c.region === region)).length;
      button.querySelector('small').textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
    });
  }

  function buildRegionButtons() {
    REGION_OPTIONS.forEach(([id, label], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'region-btn';
      button.dataset.region = id;
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.innerHTML = `${label}<small></small>`;
      button.addEventListener('click', () => {
        state.region = id;
        document.querySelectorAll('.region-btn').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        updateSummary();
      });
      el.regionGrid.appendChild(button);
    });
  }

  function show(view) {
    [el.setup, el.quiz, el.result].forEach(node => node.classList.remove('is-active'));
    view.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function makeQuestionSet() {
    const pool = activePool();
    const extras = shuffle(pool.filter(c => c.group === 'expanded'));
    const standard = shuffle(pool.filter(c => c.group === 'standard'));
    let selected = [];

    if (state.coverage === 'expanded' && extras.length) {
      const guaranteed = state.region === 'world' ? Math.min(2, extras.length) : 1;
      selected = extras.slice(0, guaranteed);
    }
    selected = selected.concat(standard.slice(0, QUESTION_COUNT - selected.length));
    if (selected.length < QUESTION_COUNT) {
      selected = selected.concat(extras.slice(selected.filter(c => c.group === 'expanded').length, QUESTION_COUNT - selected.length));
    }
    return shuffle(selected).slice(0, QUESTION_COUNT);
  }

  function squaredDistance(a, b) {
    let total = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const d = a[i] - b[i];
      total += d * d;
    }
    return total / Math.max(n, 1);
  }

  function geographicDistance(a, b) {
    const toRad = degrees => degrees * Math.PI / 180;
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const dLat = lat2 - lat1;
    const dLon = toRad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function areaDifference(a, b) {
    return Math.abs(Math.log(Math.max(a.area, 0.01) / Math.max(b.area, 0.01)));
  }

  function weightedPick(ranked, used, temperature) {
    const available = ranked.filter(item => !used.has(item.country.id));
    if (!available.length) return null;
    const limit = Math.min(available.length, Math.max(10, Math.ceil(activePool().length * 0.22)));
    const shortlist = available.slice(0, limit);
    const weights = shortlist.map((_, rank) => {
      const jitter = 0.72 + Math.random() * 0.56;
      return Math.exp(-rank / temperature) * jitter;
    });
    let cursor = Math.random() * weights.reduce((sum, value) => sum + value, 0);
    for (let i = 0; i < shortlist.length; i++) {
      cursor -= weights[i];
      if (cursor <= 0) return shortlist[i].country;
    }
    return shortlist[shortlist.length - 1].country;
  }

  function optionsFor(correct) {
    const pool = activePool().filter(country => country.id !== correct.id);
    const metrics = pool.map(country => ({
      country,
      geo: geographicDistance(correct, country),
      area: areaDifference(correct, country),
      shape: squaredDistance(correct.v, country.v)
    }));

    const rankings = {
      geo: metrics.slice().sort((a, b) => a.geo - b.geo),
      area: metrics.slice().sort((a, b) => a.area - b.area),
      shape: metrics.slice().sort((a, b) => a.shape - b.shape)
    };

    const geoRank = new Map(rankings.geo.map((item, rank) => [item.country.id, rank]));
    const areaRank = new Map(rankings.area.map((item, rank) => [item.country.id, rank]));
    const shapeRank = new Map(rankings.shape.map((item, rank) => [item.country.id, rank]));
    const blendWeights = {
      geo: 0.32 + Math.random() * 0.22,
      area: 0.32 + Math.random() * 0.22,
      shape: 0.1 + Math.random() * 0.16
    };
    rankings.blend = metrics.map(item => ({
      ...item,
      blend: geoRank.get(item.country.id) * blendWeights.geo
        + areaRank.get(item.country.id) * blendWeights.area
        + shapeRank.get(item.country.id) * blendWeights.shape
        + Math.random() * 2.5
    })).sort((a, b) => a.blend - b.blend);

    // Every question includes a geographically plausible option and a similarly
    // sized option. The third strategy and all picks are randomized each time.
    const third = Math.random() < 0.5 ? 'shape' : 'blend';
    const strategies = shuffle(['geo', 'area', third]);
    const used = new Set([correct.id]);
    const distractors = [];
    strategies.forEach(strategy => {
      const pick = weightedPick(rankings[strategy], used, 4.2 + Math.random() * 3.6);
      if (pick) {
        used.add(pick.id);
        distractors.push(pick);
      }
    });

    while (distractors.length < 3) {
      const fallback = weightedPick(rankings.blend, used, 8);
      if (!fallback) break;
      used.add(fallback.id);
      distractors.push(fallback);
    }
    return shuffle([correct, ...distractors]);
  }

  function startQuiz() {
    state.questions = makeQuestionSet();
    state.index = 0;
    state.score = 0;
    state.history = [];
    state.locked = false;
    el.settingLabel.textContent = `${coverageLabel()} / ${regionLabel()}`;
    show(el.quiz);
    renderQuestion();
  }

  function renderQuestion() {
    const correct = state.questions[state.index];
    state.locked = false;
    el.questionNumber.textContent = `${state.index + 1} / ${QUESTION_COUNT}`;
    el.score.textContent = String(state.score);
    el.progress.style.width = `${(state.index / QUESTION_COUNT) * 100}%`;
    el.shape.setAttribute('d', correct.path);
    el.feedback.textContent = '';
    el.feedback.className = 'feedback';
    el.next.classList.remove('is-visible');
    el.next.textContent = state.index === QUESTION_COUNT - 1 ? 'View results' : 'Next question';
    el.answers.replaceChildren();

    optionsFor(correct).forEach((country, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer';
      button.dataset.id = country.id;
      button.innerHTML = `<span class="answer-key">${i + 1}</span><span>${country.name}</span>`;
      button.addEventListener('click', () => answer(country.id));
      el.answers.appendChild(button);
    });

    const first = el.answers.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  }

  function answer(selectedId) {
    if (state.locked) return;
    state.locked = true;
    const correct = state.questions[state.index];
    const selected = DATA.find(c => c.id === selectedId);
    const isCorrect = selectedId === correct.id;
    if (isCorrect) state.score++;

    el.answers.querySelectorAll('.answer').forEach(button => {
      button.disabled = true;
      if (button.dataset.id === correct.id) button.classList.add('is-correct');
      if (button.dataset.id === selectedId && !isCorrect) button.classList.add('is-wrong');
    });

    el.feedback.textContent = isCorrect
      ? `Correct: ${correct.name}`
      : `Incorrect. The correct answer is ${correct.name}.`;
    el.feedback.className = `feedback ${isCorrect ? 'ok' : 'bad'}`;
    el.next.classList.add('is-visible');
    state.history.push({ correct, selected, isCorrect });
    el.score.textContent = String(state.score);
    el.progress.style.width = `${((state.index + 1) / QUESTION_COUNT) * 100}%`;
    el.next.focus({ preventScroll: true });
  }

  function nextQuestion() {
    if (!state.locked) return;
    if (state.index >= QUESTION_COUNT - 1) {
      renderResult();
      return;
    }
    state.index++;
    renderQuestion();
  }

  function resultText(score) {
    if (score === 10) return 'Perfect score. You identified even the fine details of each outline.';
    if (score >= 8) return 'Excellent result. You distinguished countries with very similar outlines.';
    if (score >= 5) return 'You answered more than half correctly. Review the missed silhouettes and try again.';
    return 'Compare the outline features carefully and try again.';
  }

  function renderResult() {
    el.finalScore.textContent = String(state.score);
    el.resultMessage.textContent = `${coverageLabel()} · ${regionLabel()}: ${resultText(state.score)}`;
    const misses = state.history.filter(item => !item.isCorrect);
    if (!misses.length) {
      el.review.innerHTML = '<h3>Review</h3><div class="review-item">No incorrect answers.</div>';
    } else {
      el.review.innerHTML = `<h3>Review</h3><div class="review-list">${misses.map(item =>
        `<div class="review-item">Your answer: ${item.selected.name}<br>Correct answer: <strong>${item.correct.name}</strong> (${item.correct.regionName})</div>`
      ).join('')}</div>`;
    }
    show(el.result);
  }

  document.querySelectorAll('input[name="coverage"]').forEach(input => {
    input.addEventListener('change', event => {
      state.coverage = event.target.value;
      updateSummary();
    });
  });
  el.start.addEventListener('click', startQuiz);
  el.next.addEventListener('click', nextQuestion);
  el.retry.addEventListener('click', startQuiz);
  el.home.addEventListener('click', () => show(el.setup));

  document.addEventListener('keydown', event => {
    if (!el.quiz.classList.contains('is-active')) return;
    if (!state.locked && ['1', '2', '3', '4'].includes(event.key)) {
      const button = el.answers.querySelectorAll('.answer')[Number(event.key) - 1];
      if (button) button.click();
    } else if (state.locked && event.key === 'Enter') {
      el.next.click();
    }
  });

  buildRegionButtons();
  updateSummary();
})();
