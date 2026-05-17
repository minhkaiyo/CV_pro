// ============================================================
// DSP Exam Prep - Script (Sakura Theme)
// ============================================================

// ---- Exam Data Store ----
var examsData = [];

function q(title, bodyHtml) {
    return '<div class="question"><h3>' + title + '</h3>' + bodyHtml + '</div>';
}

function math(latex) {
    return '<div class="math-content">\\[' + latex + '\\]</div>';
}

function imath(latex) {
    return '\\(' + latex + '\\)';
}

// ---- Build Exam 1 (Original) ----
(function() {
    var html = '';

    // Cau 1
    html += q('Question 1', 
        '<p>Given two sequences ' + imath('x_1(n)') + ', ' + imath('x_2(n)') + ' with finite length ' + imath('N = 4') + ':</p>' +
        math('x_1(n) = \\{2j,\\; -j,\\; 0,\\; j\\}') +
        math('x_2(n) = \\{0,\\; -j,\\; 1,\\; 2j\\}') +
        '<p class="sub-part"><b>a) (1.5 points)</b> Find ' + imath('y(n) = x_1(n) \\circledast_4 x_2(n)') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 points)</b> Find ' + imath('y_1(n) = x_1(n - 2023)_4 \\circledast_4 x_2(n - 2)_4') + '</p>'
    );

    // Cau 2
    html += q('Question 2 (1 point)',
        '<p>Given an ideal bandpass digital filter with cutoff frequencies ' + imath('\\dfrac{\\pi}{7}') + ' and ' + imath('\\dfrac{\\pi}{3}') + '.</p>' +
        '<p>Find the impulse response ' + imath('h(n)') + ' of the filter.</p>'
    );

    // Cau 3
    html += q('Question 3',
        '<p>Given sequence ' + imath('x(n)') + ' with finite length ' + imath('N = 4') + ':</p>' +
        math('x(n) = \\{2j,\\; -j,\\; 0,\\; j\\}') +
        '<p class="sub-part"><b>a) (1 point)</b> Compute the 4-point DFT of sequence ' + imath('x(n)') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 points)</b> Find ' + imath('x_1(n)') + ' as the 4-point IDFT of ' + imath('|\\text{Im}\\{X(k)\\}|') + '</p>'
    );

    // Cau 4
    html += q('Question 4 (1 point)',
        '<p>Given sequence ' + imath('x(n)') + ' with Fourier transform:</p>' +
        math('X(e^{j\\omega}) = \\frac{1}{1 + 0.5e^{-j\\omega}}') +
        '<p>Find the Fourier transform of the sequence:</p>' +
        math('x_1(n) = \\cos(5\\pi n) \\cdot x(n - 2)')
    );

    // Cau 5
    html += q('Question 5',
        '<p>Given an LTI system represented by the difference equation:</p>' +
        math('y(n) = -x(n+3) - 2x(n+1) + x(n) - x(n-1) + 2x(n-2) + x(n-4)') +
        '<p class="sub-part"><b>a) (1.5 points)</b> Compute the phase response ' + imath('\\arg\\{H(e^{j\\omega})\\}') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 points)</b> Compute ' + imath('\\displaystyle\\int_0^{2\\pi} |H(e^{j\\omega})|^2\\, d\\omega') + '</p>'
    );

    // Cau 6
    html += q('Question 6',
        '<p>Given a causal LTI system with input and output as follows:</p>' +
        math('x(n) = \\left(\\frac{1}{3}\\right)^n u(n) - \\left(\\frac{1}{4}\\right)^n u(n-1)') +
        math('y(n) = \\left(\\frac{1}{2}\\right)^n u(n)') +
        '<p class="sub-part"><b>a) (1 point)</b> Find the transfer function ' + imath('H(z)') + ' of the system</p>' +
        '<p class="sub-part"><b>b) (1 point)</b> Find the impulse response ' + imath('h(n)') + ' of the system</p>' +
        '<p class="sub-part"><b>c) (0.5 points)</b> Draw the Direct Form II realization diagram of the system</p>'
    );

    examsData.push({ id: 'mid-1-origin', title: 'Midterm Exam 1 (Original)', html: html });
})();

// ---- Build Exam 1 Practice ----
(function() {
    var html = '';

    html += q('Question 1',
        '<p>Given two sequences ' + imath('x_1(n)') + ', ' + imath('x_2(n)') + ' with finite length ' + imath('N = 4') + ':</p>' +
        math('x_1(n) = \\{-j,\\; 2j,\\; 0,\\; -2j\\}') +
        math('x_2(n) = \\{1,\\; j,\\; -1,\\; -j\\}') +
        '<p class="sub-part"><b>a) (1.5 points)</b> Find ' + imath('y(n) = x_1(n) \\circledast_4 x_2(n)') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 points)</b> Find ' + imath('y_1(n) = x_1(n - 2024)_4 \\circledast_4 x_2(n - 3)_4') + '</p>'
    );

    html += q('Question 2 (1 point)',
        '<p>Given an ideal bandpass digital filter with cutoff frequencies ' + imath('\\dfrac{\\pi}{5}') + ' and ' + imath('\\dfrac{\\pi}{2}') + '.</p>' +
        '<p>Find the impulse response ' + imath('h(n)') + ' of the filter.</p>'
    );

    html += q('Question 3',
        '<p>Given sequence ' + imath('x(n)') + ' with finite length ' + imath('N = 4') + ':</p>' +
        math('x(n) = \\{-j,\\; 2j,\\; 0,\\; -2j\\}') +
        '<p class="sub-part"><b>a) (1 point)</b> Compute the 4-point DFT of sequence ' + imath('x(n)') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 points)</b> Find ' + imath('x_1(n)') + ' as the 4-point IDFT of ' + imath('|\\text{Re}\\{X(k)\\}|') + '</p>'
    );

    html += q('Question 4 (1 point)',
        '<p>Given sequence ' + imath('x(n)') + ' with Fourier transform:</p>' +
        math('X(e^{j\\omega}) = \\frac{1}{1 - 0.7e^{-j\\omega}}') +
        '<p>Find the Fourier transform of the sequence:</p>' +
        math('x_1(n) = \\sin(3\\pi n) \\cdot x(n - 4)')
    );

    html += q('Question 5',
        '<p>Given an LTI system represented by the difference equation:</p>' +
        math('y(n) = 2x(n+2) + x(n+1) - x(n) + x(n-1) - 2x(n-2)') +
        '<p class="sub-part"><b>a) (1.5 points)</b> Compute the phase response ' + imath('\\arg\\{H(e^{j\\omega})\\}') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 points)</b> Compute ' + imath('\\displaystyle\\int_0^{2\\pi} |H(e^{j\\omega})|^2\\, d\\omega') + '</p>'
    );

    html += q('Question 6',
        '<p>Given a causal LTI system with input and output as follows:</p>' +
        math('x(n) = \\left(\\frac{1}{4}\\right)^n u(n) + \\left(\\frac{1}{2}\\right)^n u(n-1)') +
        math('y(n) = \\left(\\frac{1}{3}\\right)^n u(n)') +
        '<p class="sub-part"><b>a) (1 point)</b> Find the transfer function ' + imath('H(z)') + ' of the system</p>' +
        '<p class="sub-part"><b>b) (1 point)</b> Find the impulse response ' + imath('h(n)') + ' of the system</p>' +
        '<p class="sub-part"><b>c) (0.5 points)</b> Draw the Direct Form II realization diagram of the system</p>'
    );

    examsData.push({ id: 'mid-1-practice', title: 'Midterm Exam 1 (Practice Set)', html: html });
})();


// ---- Build Exam 2 (Original) ----
(function() {
    var html = '';

    // Cau 1
    html += q('Question 1',
        '<p>Given two sequences ' + imath('x_1(n)') + ', ' + imath('x_2(n)') + ' with finite length ' + imath('N = 4') + ':</p>' +
        math('x_1(n) = \\{j,\\; -2j,\\; 0,\\; 1\\}') +
        math('x_2(n) = \\{0,\\; -j,\\; 1,\\; 2j\\}') +
        '<p class="sub-part"><b>a)</b> Compute ' + imath('y(n) = x_1(n) \\circledast_4 x_2(n)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Compute ' + imath('y_1(n) = x_1(n - 2023)_4 \\circledast_4 x_2(-n + 1)_4') + '</p>'
    );

    // Cau 2
    html += q('Question 2',
        '<p>Given an ideal bandpass digital filter with cutoff frequencies ' + imath('\\omega_1 = \\dfrac{\\pi}{6}') + ' and ' + imath('\\omega_2 = \\dfrac{\\pi}{3}') + '.</p>' +
        '<p>Find the impulse response ' + imath('h(n)') + ' of the filter.</p>'
    );

    // Cau 3
    html += q('Question 3',
        '<p>Given sequence:</p>' +
        math('x(n) = \\{2j,\\; -2j,\\; 0,\\; 1\\}') +
        '<p class="sub-part"><b>a)</b> Compute the 4-point DFT of sequence ' + imath('x(n)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Compute the 8-point DFT of sequence:</p>' +
        math('x_1(n) = \\{2j,\\; 1,\\; 0,\\; -2j,\\; j,\\; 1,\\; 0,\\; -2j\\}')
    );

    // Cau 4
    html += q('Question 4',
        '<p>Given:</p>' +
        math('h(n) = \\sin\\!\\left(\\frac{\\pi n}{2} - \\frac{\\pi}{2}\\right) \\cdot u(n-1)') +
        '<p class="sub-part"><b>a)</b> Find ' + imath('H(z)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Is the system stable?</p>'
    );

    // Cau 5
    html += q('Question 5',
        '<p>Given system:</p>' +
        math('y(n) = x(n+3) - 2x(n+1) + x(n) - x(n-1) + 2x(n-2) - x(n-4)') +
        '<p>Compute ' + imath('|H(e^{j\\omega})|') + ' and ' + imath('\\arg\\{H(e^{j\\omega})\\}') + ' at ' + imath('\\omega = \\dfrac{\\pi}{4}') + '</p>'
    );

    // Cau 6
    html += q('Question 6',
        '<p>Compute ' + imath('x(n)') + ' from the following DFT:</p>' +
        math('\\tilde{X}(k) = \\cos\\!\\left(\\frac{10\\pi k}{21}\\right) + \\sin\\!\\left(\\frac{10\\pi k}{21}\\right)')
    );

    examsData.push({ id: 'mid-2-origin', title: 'Midterm Exam 2 (Original)', html: html });
})();

// ---- Build Exam 2 Practice ----
(function() {
    var html = '';

    html += q('Question 1',
        '<p>Given two sequences ' + imath('x_1(n)') + ', ' + imath('x_2(n)') + ' with finite length ' + imath('N = 4') + ':</p>' +
        math('x_1(n) = \\{-j,\\; 3j,\\; 2,\\; 0\\}') +
        math('x_2(n) = \\{1,\\; 0,\\; j,\\; -j\\}') +
        '<p class="sub-part"><b>a)</b> Compute ' + imath('y(n) = x_1(n) \\circledast_4 x_2(n)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Compute ' + imath('y_1(n) = x_1(n - 2024)_4 \\circledast_4 x_2(-n + 2)_4') + '</p>'
    );

    html += q('Question 2',
        '<p>Given an ideal bandpass digital filter with cutoff frequencies ' + imath('\\omega_1 = \\dfrac{\\pi}{8}') + ' and ' + imath('\\omega_2 = \\dfrac{\\pi}{4}') + '.</p>' +
        '<p>Find the impulse response ' + imath('h(n)') + ' of the filter.</p>'
    );

    html += q('Question 3',
        '<p>Given sequence:</p>' +
        math('x(n) = \\{1,\\; -j,\\; 2j,\\; -1\\}') +
        '<p class="sub-part"><b>a)</b> Compute the 4-point DFT of sequence ' + imath('x(n)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Compute the 8-point DFT of sequence:</p>' +
        math('x_1(n) = \\{1,\\; -j,\\; 2j,\\; -1,\\; j,\\; 1,\\; -2j,\\; 0\\}')
    );

    html += q('Question 4',
        '<p>Given:</p>' +
        math('h(n) = \\cos\\!\\left(\\frac{\\pi n}{2} + \\frac{\\pi}{4}\\right) \\cdot u(n)') +
        '<p class="sub-part"><b>a)</b> Find ' + imath('H(z)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Is the system stable?</p>'
    );

    html += q('Question 5',
        '<p>Given system:</p>' +
        math('y(n) = 2x(n+2) - x(n+1) + x(n) + x(n-1) - 2x(n-3)') +
        '<p>Compute ' + imath('|H(e^{j\\omega})|') + ' and ' + imath('\\arg\\{H(e^{j\\omega})\\}') + ' at ' + imath('\\omega = \\dfrac{\\pi}{3}') + '</p>'
    );

    html += q('Question 6',
        '<p>Compute ' + imath('x(n)') + ' from the following DFT:</p>' +
        math('\\tilde{X}(k) = \\cos\\!\\left(\\frac{6\\pi k}{15}\\right) - \\sin\\!\\left(\\frac{6\\pi k}{15}\\right)')
    );

    examsData.push({ id: 'mid-2-practice', title: 'Midterm Exam 2 (Practice Set)', html: html });
})();


// ============================================================
// UI Logic
// ============================================================

function currentExamKey() {
    var select = document.getElementById('exam-select');
    var idx = parseInt(select.value, 10);
    if (isNaN(idx) || idx < 0 || idx >= examsData.length) return null;
    return 'answers_' + examsData[idx].id;
}

function switchTab(tab) { /* final tab reserved */ }

function initSelectBox() {
    var select = document.getElementById('exam-select');
    select.innerHTML = '';
    for (var i = 0; i < examsData.length; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.textContent = examsData[i].title;
        select.appendChild(opt);
    }
}

function renderExam() {
    var select   = document.getElementById('exam-select');
    var idx      = parseInt(select.value, 10);
    var examBox  = document.getElementById('exam-content');
    var answerBox = document.getElementById('answer-content');

    if (isNaN(idx) || idx < 0 || idx >= examsData.length) {
        examBox.innerHTML  = '<p class="placeholder-msg">Exam sheet not found.</p>';
        answerBox.innerHTML = '';
        return;
    }

    // LEFT: inject exam HTML
    examBox.innerHTML = examsData[idx].html;

    // Add copy button into each .question-header
    var questions = examBox.querySelectorAll('.question');
    questions.forEach(function(q, i) {
        var h3 = q.querySelector('h3');
        if (!h3) return;
        var header = q.querySelector('.question-header');
        if (!header) {
            header = document.createElement('div');
            header.className = 'question-header';
            h3.parentNode.insertBefore(header, h3);
            header.appendChild(h3);
        }
        var copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        (function(capturedQ, capturedBtn) {
            capturedBtn.addEventListener('click', function() {
                copyQuestion(capturedQ, capturedBtn);
            });
        })(q, copyBtn);
        header.appendChild(copyBtn);
    });

    // RIGHT: build answer blocks
    var savedKey = currentExamKey();
    var savedAnswers = {};
    try { savedAnswers = JSON.parse(localStorage.getItem(savedKey) || '{}'); } catch(e) {}

    var answerFragments = [];
    questions.forEach(function(q, i) {
        var h3 = q.querySelector('h3');
        var title = h3 ? h3.textContent.trim() : ('Question ' + (i + 1));
        var saved = savedAnswers['q' + i] || '';
        answerFragments.push(buildAnswerBlock(i, title, saved));
    });
    answerBox.innerHTML = answerFragments.length
        ? answerFragments.join('')
        : '<p class="placeholder-msg">Enter your answers below each question.</p>';

    // Attach textarea listeners for live preview + init pre-saved
    answerBox.querySelectorAll('.answer-input-area').forEach(function(ta) {
        var qi = ta.getAttribute('data-qi');
        var preview = document.getElementById('preview-' + qi);
        ta.addEventListener('input', function() { updatePreview(ta.value, preview); });
        if (ta.value.trim()) updatePreview(ta.value, preview);
    });

    // Typeset left panel
    typesetElement(examBox);
}

function buildAnswerBlock(qi, title, savedValue) {
    var escaped = (savedValue || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    return '<div class="answer-block" id="answer-block-' + qi + '">' +
        '<div class="answer-block-title">' + title + '</div>' +
        '<label class="answer-input-label" for="answer-ta-' + qi + '">Enter raw answers (supports LaTeX \\(...\\) or \\[...\\]):</label>' +
        '<textarea class="answer-input-area" id="answer-ta-' + qi + '" data-qi="' + qi + '" ' +
            'placeholder="Example: y(n) = \\( \\delta(n) \\), or type normal text...">' +
            escaped +
        '</textarea>' +
        '<div class="answer-preview empty" id="preview-' + qi + '">' +
            (savedValue && savedValue.trim() ? '' : 'Answer preview will appear here...') +
        '</div>' +
    '</div>';
}

function updatePreview(rawText, previewEl) {
    if (!previewEl) return;
    if (!rawText || !rawText.trim()) {
        previewEl.innerHTML = 'Answer preview will appear here...';
        previewEl.classList.add('empty');
        return;
    }
    previewEl.classList.remove('empty');
    // Preserve LaTeX, convert newlines
    var lines = rawText.split('\n');
    var html = lines.map(function(line) {
        return '<p style="margin:3px 0">' + (line.trim() || '&nbsp;') + '</p>';
    }).join('');
    previewEl.innerHTML = html;
    typesetElement(previewEl);
}

function copyQuestion(questionEl, btn) {
    var text = (questionEl.innerText || questionEl.textContent || '').replace(/📋 Copy/g,'').trim();
    if (!navigator.clipboard) {
        showToast('Your browser does not support automatic clipboard copying.');
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        btn.innerHTML = '✅ Copied!';
        btn.classList.add('copied');
        showToast('Question copied to clipboard!');
        setTimeout(function() {
            btn.innerHTML = '📋 Copy';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(function() {
        showToast('Failed to copy. Please manually select and press Ctrl+C!');
    });
}

// Auto-save answers on typing
function saveAllAnswers() {
    var key = currentExamKey();
    if (!key) return;
    var data = {};
    document.querySelectorAll('.answer-input-area').forEach(function(ta) {
        data['q' + ta.getAttribute('data-qi')] = ta.value;
    });
    localStorage.setItem(key, JSON.stringify(data));
    showToast('All answers saved successfully! 💾');
}

function clearAllAnswers() {
    if (!confirm('Are you sure you want to clear all answers?')) return;
    var key = currentExamKey();
    if (key) localStorage.removeItem(key);
    document.querySelectorAll('.answer-input-area').forEach(function(ta) { ta.value = ''; });
    document.querySelectorAll('.answer-preview').forEach(function(p) {
        p.innerHTML = 'Answer preview will appear here...';
        p.classList.add('empty');
    });
    showToast('All answers cleared.');
}

function typesetElement(el) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([el]).catch(function(e) { console.warn('MathJax:', e.message); });
    }
}

function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(window._toast);
    window._toast = setTimeout(function() { t.classList.add('hidden'); }, 2500);
}

// ============================================================
// Sakura Petal Animation
// ============================================================
function spawnPetal() {
    var c = document.getElementById('sakura-container');
    if (!c) return;
    var p = document.createElement('div');
    p.className = 'petal';
    var size = Math.random() * 10 + 8;
    var dur  = Math.random() * 7 + 7;
    p.style.width  = size + 'px';
    p.style.height = (size * 1.4) + 'px';
    p.style.left   = (Math.random() * 100) + 'vw';
    p.style.animationDuration = dur + 's';
    p.style.animationDelay   = '-' + (Math.random() * 8) + 's';
    c.appendChild(p);
    setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); spawnPetal(); }, dur * 1000);
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    for (var i = 0; i < 30; i++) spawnPetal();
    initSelectBox();
    renderExam();

    // Auto-save answers on typing (debounced 1.2s)
    var answerBox = document.getElementById('answer-content');
    if (answerBox) {
        answerBox.addEventListener('input', function(e) {
            if (e.target && e.target.classList.contains('answer-input-area')) {
                clearTimeout(window._autoSave);
                window._autoSave = setTimeout(saveAllAnswers, 1200);
            }
        });
    }
});
