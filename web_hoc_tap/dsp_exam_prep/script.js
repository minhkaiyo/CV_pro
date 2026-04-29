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
    html += q('Câu 1', 
        '<p>Cho hai dãy ' + imath('x_1(n)') + ', ' + imath('x_2(n)') + ' có chiều dài hữu hạn ' + imath('N = 4') + ':</p>' +
        math('x_1(n) = \\{2j,\\; -j,\\; 0,\\; j\\}') +
        math('x_2(n) = \\{0,\\; -j,\\; 1,\\; 2j\\}') +
        '<p class="sub-part"><b>a) (1.5 điểm)</b> Tìm ' + imath('y(n) = x_1(n) \\circledast_4 x_2(n)') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 điểm)</b> Tìm ' + imath('y_1(n) = x_1(n - 2023)_4 \\circledast_4 x_2(n - 2)_4') + '</p>'
    );

    // Cau 2
    html += q('Câu 2 (1 điểm)',
        '<p>Cho bộ lọc số thông dải lý tưởng với tần số cắt ' + imath('\\dfrac{\\pi}{7}') + ' và ' + imath('\\dfrac{\\pi}{3}') + '.</p>' +
        '<p>Tìm đáp ứng xung ' + imath('h(n)') + ' của bộ lọc.</p>'
    );

    // Cau 3
    html += q('Câu 3',
        '<p>Cho dãy ' + imath('x(n)') + ' có chiều dài hữu hạn ' + imath('N = 4') + ':</p>' +
        math('x(n) = \\{2j,\\; -j,\\; 0,\\; j\\}') +
        '<p class="sub-part"><b>a) (1 điểm)</b> Tính DFT 4 điểm của dãy ' + imath('x(n)') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 điểm)</b> Tìm ' + imath('x_1(n)') + ' là IDFT 4 điểm của ' + imath('|\\text{Im}\\{X(k)\\}|') + '</p>'
    );

    // Cau 4
    html += q('Câu 4 (1 điểm)',
        '<p>Cho dãy ' + imath('x(n)') + ' có biến đổi Fourier:</p>' +
        math('X(e^{j\\omega}) = \\frac{1}{1 + 0.5e^{-j\\omega}}') +
        '<p>Tìm biến đổi Fourier của dãy:</p>' +
        math('x_1(n) = \\cos(5\\pi n) \\cdot x(n - 2)')
    );

    // Cau 5
    html += q('Câu 5',
        '<p>Cho hệ thống LTI được biểu diễn bởi phương trình sai phân:</p>' +
        math('y(n) = -x(n+3) - 2x(n+1) + x(n) - x(n-1) + 2x(n-2) + x(n-4)') +
        '<p class="sub-part"><b>a) (1.5 điểm)</b> Tính đáp ứng pha ' + imath('\\arg\\{H(e^{j\\omega})\\}') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 điểm)</b> Tính ' + imath('\\displaystyle\\int_0^{2\\pi} |H(e^{j\\omega})|^2\\, d\\omega') + '</p>'
    );

    // Cau 6
    html += q('Câu 6',
        '<p>Cho hệ thống LTI nhân quả với đầu vào, đầu ra như sau:</p>' +
        math('x(n) = \\left(\\frac{1}{3}\\right)^n u(n) - \\left(\\frac{1}{4}\\right)^n u(n-1)') +
        math('y(n) = \\left(\\frac{1}{2}\\right)^n u(n)') +
        '<p class="sub-part"><b>a) (1 điểm)</b> Tìm hàm truyền đạt ' + imath('H(z)') + ' của hệ thống</p>' +
        '<p class="sub-part"><b>b) (1 điểm)</b> Tìm đáp ứng xung ' + imath('h(n)') + ' của hệ thống</p>' +
        '<p class="sub-part"><b>c) (0.5 điểm)</b> Vẽ sơ đồ dạng trực tiếp loại II thực hiện hệ thống</p>'
    );

    examsData.push({ id: 'mid-1-origin', title: 'Đề Giữa Kỳ 1 (Đề Gốc)', html: html });
})();

// ---- Build Exam 1 Practice ----
(function() {
    var html = '';

    html += q('Câu 1',
        '<p>Cho hai dãy ' + imath('x_1(n)') + ', ' + imath('x_2(n)') + ' có chiều dài hữu hạn ' + imath('N = 4') + ':</p>' +
        math('x_1(n) = \\{-j,\\; 2j,\\; 0,\\; -2j\\}') +
        math('x_2(n) = \\{1,\\; j,\\; -1,\\; -j\\}') +
        '<p class="sub-part"><b>a) (1.5 điểm)</b> Tìm ' + imath('y(n) = x_1(n) \\circledast_4 x_2(n)') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 điểm)</b> Tìm ' + imath('y_1(n) = x_1(n - 2024)_4 \\circledast_4 x_2(n - 3)_4') + '</p>'
    );

    html += q('Câu 2 (1 điểm)',
        '<p>Cho bộ lọc số thông dải lý tưởng với tần số cắt ' + imath('\\dfrac{\\pi}{5}') + ' và ' + imath('\\dfrac{\\pi}{2}') + '.</p>' +
        '<p>Tìm đáp ứng xung ' + imath('h(n)') + ' của bộ lọc.</p>'
    );

    html += q('Câu 3',
        '<p>Cho dãy ' + imath('x(n)') + ' có chiều dài hữu hạn ' + imath('N = 4') + ':</p>' +
        math('x(n) = \\{-j,\\; 2j,\\; 0,\\; -2j\\}') +
        '<p class="sub-part"><b>a) (1 điểm)</b> Tính DFT 4 điểm của dãy ' + imath('x(n)') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 điểm)</b> Tìm ' + imath('x_1(n)') + ' là IDFT 4 điểm của ' + imath('|\\text{Re}\\{X(k)\\}|') + '</p>'
    );

    html += q('Câu 4 (1 điểm)',
        '<p>Cho dãy ' + imath('x(n)') + ' có biến đổi Fourier:</p>' +
        math('X(e^{j\\omega}) = \\frac{1}{1 - 0.7e^{-j\\omega}}') +
        '<p>Tìm biến đổi Fourier của dãy:</p>' +
        math('x_1(n) = \\sin(3\\pi n) \\cdot x(n - 4)')
    );

    html += q('Câu 5',
        '<p>Cho hệ thống LTI được biểu diễn bởi phương trình sai phân:</p>' +
        math('y(n) = 2x(n+2) + x(n+1) - x(n) + x(n-1) - 2x(n-2)') +
        '<p class="sub-part"><b>a) (1.5 điểm)</b> Tính đáp ứng pha ' + imath('\\arg\\{H(e^{j\\omega})\\}') + '</p>' +
        '<p class="sub-part"><b>b) (0.5 điểm)</b> Tính ' + imath('\\displaystyle\\int_0^{2\\pi} |H(e^{j\\omega})|^2\\, d\\omega') + '</p>'
    );

    html += q('Câu 6',
        '<p>Cho hệ thống LTI nhân quả với đầu vào, đầu ra như sau:</p>' +
        math('x(n) = \\left(\\frac{1}{4}\\right)^n u(n) + \\left(\\frac{1}{2}\\right)^n u(n-1)') +
        math('y(n) = \\left(\\frac{1}{3}\\right)^n u(n)') +
        '<p class="sub-part"><b>a) (1 điểm)</b> Tìm hàm truyền đạt ' + imath('H(z)') + ' của hệ thống</p>' +
        '<p class="sub-part"><b>b) (1 điểm)</b> Tìm đáp ứng xung ' + imath('h(n)') + ' của hệ thống</p>' +
        '<p class="sub-part"><b>c) (0.5 điểm)</b> Vẽ sơ đồ dạng trực tiếp loại II thực hiện hệ thống</p>'
    );

    examsData.push({ id: 'mid-1-practice', title: 'Đề Giữa Kỳ 1 (Luyện Tập Củng Cố)', html: html });
})();


// ---- Build Exam 2 (Original) ----
(function() {
    var html = '';

    // Cau 1
    html += q('Câu 1',
        '<p>Cho hai dãy ' + imath('x_1(n)') + ', ' + imath('x_2(n)') + ' có chiều dài hữu hạn ' + imath('N = 4') + ':</p>' +
        math('x_1(n) = \\{j,\\; -2j,\\; 0,\\; 1\\}') +
        math('x_2(n) = \\{0,\\; -j,\\; 1,\\; 2j\\}') +
        '<p class="sub-part"><b>a)</b> Tính ' + imath('y(n) = x_1(n) \\circledast_4 x_2(n)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Tính ' + imath('y_1(n) = x_1(n - 2023)_4 \\circledast_4 x_2(-n + 1)_4') + '</p>'
    );

    // Cau 2
    html += q('Câu 2',
        '<p>Cho bộ lọc số thông dải lý tưởng với tần số cắt ' + imath('\\omega_1 = \\dfrac{\\pi}{6}') + ' và ' + imath('\\omega_2 = \\dfrac{\\pi}{3}') + '.</p>' +
        '<p>Tìm đáp ứng xung ' + imath('h(n)') + ' của bộ lọc.</p>'
    );

    // Cau 3
    html += q('Câu 3',
        '<p>Cho dãy:</p>' +
        math('x(n) = \\{2j,\\; -2j,\\; 0,\\; 1\\}') +
        '<p class="sub-part"><b>a)</b> Tính DFT 4 điểm của dãy ' + imath('x(n)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Tính DFT 8 điểm của dãy:</p>' +
        math('x_1(n) = \\{2j,\\; 1,\\; 0,\\; -2j,\\; j,\\; 1,\\; 0,\\; -2j\\}')
    );

    // Cau 4
    html += q('Câu 4',
        '<p>Cho:</p>' +
        math('h(n) = \\sin\\!\\left(\\frac{\\pi n}{2} - \\frac{\\pi}{2}\\right) \\cdot u(n-1)') +
        '<p class="sub-part"><b>a)</b> Tìm ' + imath('H(z)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Hệ thống có ổn định không?</p>'
    );

    // Cau 5
    html += q('Câu 5',
        '<p>Cho hệ thống:</p>' +
        math('y(n) = x(n+3) - 2x(n+1) + x(n) - x(n-1) + 2x(n-2) - x(n-4)') +
        '<p>Tính ' + imath('|H(e^{j\\omega})|') + ' và ' + imath('\\arg\\{H(e^{j\\omega})\\}') + ' tại ' + imath('\\omega = \\dfrac{\\pi}{4}') + '</p>'
    );

    // Cau 6
    html += q('Câu 6',
        '<p>Tính ' + imath('x(n)') + ' từ DFT sau:</p>' +
        math('\\tilde{X}(k) = \\cos\\!\\left(\\frac{10\\pi k}{21}\\right) + \\sin\\!\\left(\\frac{10\\pi k}{21}\\right)')
    );

    examsData.push({ id: 'mid-2-origin', title: 'Đề Giữa Kỳ 2 (Đề Gốc)', html: html });
})();

// ---- Build Exam 2 Practice ----
(function() {
    var html = '';

    html += q('Câu 1',
        '<p>Cho hai dãy ' + imath('x_1(n)') + ', ' + imath('x_2(n)') + ' có chiều dài hữu hạn ' + imath('N = 4') + ':</p>' +
        math('x_1(n) = \\{-j,\\; 3j,\\; 2,\\; 0\\}') +
        math('x_2(n) = \\{1,\\; 0,\\; j,\\; -j\\}') +
        '<p class="sub-part"><b>a)</b> Tính ' + imath('y(n) = x_1(n) \\circledast_4 x_2(n)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Tính ' + imath('y_1(n) = x_1(n - 2024)_4 \\circledast_4 x_2(-n + 2)_4') + '</p>'
    );

    html += q('Câu 2',
        '<p>Cho bộ lọc số thông dải lý tưởng với tần số cắt ' + imath('\\omega_1 = \\dfrac{\\pi}{8}') + ' và ' + imath('\\omega_2 = \\dfrac{\\pi}{4}') + '.</p>' +
        '<p>Tìm đáp ứng xung ' + imath('h(n)') + ' của bộ lọc.</p>'
    );

    html += q('Câu 3',
        '<p>Cho dãy:</p>' +
        math('x(n) = \\{1,\\; -j,\\; 2j,\\; -1\\}') +
        '<p class="sub-part"><b>a)</b> Tính DFT 4 điểm của dãy ' + imath('x(n)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Tính DFT 8 điểm của dãy:</p>' +
        math('x_1(n) = \\{1,\\; -j,\\; 2j,\\; -1,\\; j,\\; 1,\\; -2j,\\; 0\\}')
    );

    html += q('Câu 4',
        '<p>Cho:</p>' +
        math('h(n) = \\cos\\!\\left(\\frac{\\pi n}{2} + \\frac{\\pi}{4}\\right) \\cdot u(n)') +
        '<p class="sub-part"><b>a)</b> Tìm ' + imath('H(z)') + '</p>' +
        '<p class="sub-part"><b>b)</b> Hệ thống có ổn định không?</p>'
    );

    html += q('Câu 5',
        '<p>Cho hệ thống:</p>' +
        math('y(n) = 2x(n+2) - x(n+1) + x(n) + x(n-1) - 2x(n-3)') +
        '<p>Tính ' + imath('|H(e^{j\\omega})|') + ' và ' + imath('\\arg\\{H(e^{j\\omega})\\}') + ' tại ' + imath('\\omega = \\dfrac{\\pi}{3}') + '</p>'
    );

    html += q('Câu 6',
        '<p>Tính ' + imath('x(n)') + ' từ DFT sau:</p>' +
        math('\\tilde{X}(k) = \\cos\\!\\left(\\frac{6\\pi k}{15}\\right) - \\sin\\!\\left(\\frac{6\\pi k}{15}\\right)')
    );

    examsData.push({ id: 'mid-2-practice', title: 'Đề Giữa Kỳ 2 (Luyện Tập Củng Cố)', html: html });
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
        examBox.innerHTML  = '<p class="placeholder-msg">Không tìm thấy đề thi.</p>';
        answerBox.innerHTML = '';
        return;
    }

    // LEFT: inject exam HTML
    examBox.innerHTML = examsData[idx].html;

    // Add copy button into each .question-header (or wrap h3 first)
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
        copyBtn.innerHTML = '📋 Sao chép';
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
        var title = h3 ? h3.textContent.trim() : ('Câu ' + (i + 1));
        var saved = savedAnswers['q' + i] || '';
        answerFragments.push(buildAnswerBlock(i, title, saved));
    });
    answerBox.innerHTML = answerFragments.length
        ? answerFragments.join('')
        : '<p class="placeholder-msg">Nhập đáp án bên dưới mỗi câu.</p>';

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
        '<label class="answer-input-label" for="answer-ta-' + qi + '">Nhập đáp án thô (hỗ trợ LaTeX \\(...\\) hoặc \\[...\\]):</label>' +
        '<textarea class="answer-input-area" id="answer-ta-' + qi + '" data-qi="' + qi + '" ' +
            'placeholder="Ví dụ: y(n) = \\( \\delta(n) \\), hoặc gõ văn bản thông thường...">' +
            escaped +
        '</textarea>' +
        '<div class="answer-preview empty" id="preview-' + qi + '">' +
            (savedValue && savedValue.trim() ? '' : 'Preview đáp án sẽ hiện ở đây...') +
        '</div>' +
    '</div>';
}

function updatePreview(rawText, previewEl) {
    if (!previewEl) return;
    if (!rawText || !rawText.trim()) {
        previewEl.innerHTML = 'Preview đáp án sẽ hiện ở đây...';
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
    var text = (questionEl.innerText || questionEl.textContent || '').replace(/📋 Sao chép/g,'').trim();
    if (!navigator.clipboard) {
        showToast('Trình duyệt không hỗ trợ sao chép tự động.');
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        btn.innerHTML = '✅ Đã sao chép!';
        btn.classList.add('copied');
        showToast('Đã sao chép câu hỏi!');
        setTimeout(function() {
            btn.innerHTML = '📋 Sao chép';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(function() {
        showToast('Không sao chép được. Bôi đen và Ctrl+C nhé!');
    });
}

function saveAllAnswers() {
    var key = currentExamKey();
    if (!key) return;
    var data = {};
    document.querySelectorAll('.answer-input-area').forEach(function(ta) {
        data['q' + ta.getAttribute('data-qi')] = ta.value;
    });
    localStorage.setItem(key, JSON.stringify(data));
    showToast('Đã lưu tất cả đáp án! 💾');
}

function clearAllAnswers() {
    if (!confirm('Bạn có chắc muốn xóa hết đáp án?')) return;
    var key = currentExamKey();
    if (key) localStorage.removeItem(key);
    document.querySelectorAll('.answer-input-area').forEach(function(ta) { ta.value = ''; });
    document.querySelectorAll('.answer-preview').forEach(function(p) {
        p.innerHTML = 'Preview đáp án sẽ hiện ở đây...';
        p.classList.add('empty');
    });
    showToast('Đã xóa tất cả đáp án.');
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


