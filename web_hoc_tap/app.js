/* ============================================
   STUDY PLATFORM - Main Application Logic
   Firebase Firestore Integration
   ============================================ */

// ===== STATE MANAGEMENT =====
const AppState = {
    currentPage: 'home',
    currentSubjectId: null,
    currentTopicId: null,
    editingSubjectId: null,
    editingTopicId: null,
    editingNoteId: null,
    subjects: [],
    notes: [],
    confirmCallback: null,
    sidebarCollapsed: false,
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupEventListeners();
    updateGreeting();
    loadTheme();

    // Hide loading screen after max 1.5s regardless of Firebase status
    const hideLoading = () => {
        const ls = document.getElementById('loading-screen');
        if (ls && !ls.classList.contains('hidden')) {
            ls.classList.add('hidden');
        }
    };
    const loadingTimer = setTimeout(hideLoading, 1500);

    // Helper: wrap a promise with a timeout so it doesn't hang forever
    function withTimeout(promise, ms = 3000) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
        ]);
    }

    try {
        // Increase timeout to 10s for initial load
        await withTimeout(loadSubjects(), 10000);
        await withTimeout(loadNotes(), 10000);
        
        // Seed default data if specific subjects are missing
        const hasKTVXL = AppState.subjects.find(s => s.id === 'ky-thuat-vi-xu-ly');
        const hasDTTT1 = AppState.subjects.find(s => s.id === 'dien-tu-tuong-tu-1');
        
        if ((!hasKTVXL || !hasDTTT1) && typeof seedInitialData === 'function') {
            await seedInitialData();
            await loadSubjects();
        }
        
        updateStats();
    } catch (err) {
        console.warn('Firebase connection issue, running in offline mode:', err.message);
        // Fallback: load from localStorage
        AppState.subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
        AppState.notes = JSON.parse(localStorage.getItem('notes') || '[]');
        renderHomeSubjects();
        renderSubjects();
        renderNotes();
        updateStats();
        showToast('Chế độ offline - Chưa kết nối Firebase.', 'info');
    }

    clearTimeout(loadingTimer);
    hideLoading();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Sidebar
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileSidebar);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });

    // Theme
    document.getElementById('theme-toggle').addEventListener('change', toggleTheme);

    // Search
    document.getElementById('search-input').addEventListener('input', handleSearch);

    // Buttons - Add subject (PROTECTED)
    document.getElementById('btn-add-subject-home').addEventListener('click', () => AUTH.requireAuth(() => openSubjectModal()));
    document.getElementById('btn-add-subject').addEventListener('click', () => AUTH.requireAuth(() => openSubjectModal()));

    // Buttons - Subject detail
    document.getElementById('btn-back-subjects').addEventListener('click', () => navigateTo('subjects'));
    document.getElementById('btn-add-topic').addEventListener('click', () => AUTH.requireAuth(() => openTopicModal()));
    document.getElementById('btn-delete-subject').addEventListener('click', () => AUTH.requireAuth(handleDeleteSubject));

    // Buttons - Topic detail
    document.getElementById('btn-back-topics').addEventListener('click', () => {
        showSubjectDetail(AppState.currentSubjectId);
    });
    document.getElementById('btn-edit-topic').addEventListener('click', () => AUTH.requireAuth(handleEditTopic));
    document.getElementById('btn-delete-topic').addEventListener('click', () => AUTH.requireAuth(handleDeleteTopic));

    // Buttons - Notes (PROTECTED)
    document.getElementById('btn-add-note').addEventListener('click', () => AUTH.requireAuth(() => openNoteModal()));

    // Save buttons (PROTECTED)
    document.getElementById('btn-save-subject').addEventListener('click', () => AUTH.requireAuth(saveSubject));
    document.getElementById('btn-save-topic').addEventListener('click', () => AUTH.requireAuth(saveTopic));
    document.getElementById('btn-save-note').addEventListener('click', () => AUTH.requireAuth(saveNote));

    // Confirm
    document.getElementById('btn-confirm-action').addEventListener('click', () => {
        if (AppState.confirmCallback) {
            AppState.confirmCallback();
            closeModal('modal-confirm');
        }
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-footer .btn-ghost').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            if (modalId) closeModal(modalId);
        });
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('visible');
            }
        });
    });

    // Icon picker
    document.querySelectorAll('#icon-picker .icon-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#icon-picker .icon-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Color pickers
    document.querySelectorAll('#color-picker .color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#color-picker .color-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    document.querySelectorAll('#note-color-picker .color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#note-color-picker .color-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Editor toolbar
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => insertMarkdown(btn.dataset.format));
    });
}

// ===== NAVIGATION =====
function navigateTo(page) {
    AppState.currentPage = page;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Show page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');

    // Refresh content
    if (page === 'home') renderHomeSubjects();
    if (page === 'subjects') renderSubjects();
    if (page === 'notes') renderNotes();
    if (page === 'progress') renderProgress();
}

// ===== SIDEBAR =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    AppState.sidebarCollapsed = sidebar.classList.contains('collapsed');
}
function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
}

// ===== THEME =====
function toggleTheme() {
    const isDark = document.getElementById('theme-toggle').checked;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').checked = true;
    }
}

// ===== GREETING =====
function updateGreeting() {
    const hour = new Date().getHours();
    let greet = 'Chào buổi sáng! ☀️';
    if (hour >= 12 && hour < 18) greet = 'Chào buổi chiều! 🌤️';
    if (hour >= 18 || hour < 5) greet = 'Chào buổi tối! 🌙';
    document.getElementById('greeting-text').textContent = greet;
}

// ===== FIREBASE DATA OPERATIONS =====

// --- Subjects ---
// --- Subjects (Realtime Update) ---
function loadSubjects() {
    return new Promise((resolve) => {
        subjectsRef.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            AppState.subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderHomeSubjects();
            renderSubjects();
            updateStats();
            resolve();
        }, (err) => {
            console.warn('Realtime Subjects Error:', err);
            AppState.subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
            renderHomeSubjects();
            renderSubjects();
            resolve();
        });
    });
}

async function saveSubject() {
    const name = document.getElementById('subject-name').value.trim();
    const desc = document.getElementById('subject-desc').value.trim();
    const icon = document.querySelector('#icon-picker .icon-option.active')?.dataset.icon || 'fa-book';
    const color = document.querySelector('#color-picker .color-option.active')?.dataset.color || '#2563eb';

    if (!name) {
        showToast('Vui lòng nhập tên môn học!', 'error');
        return;
    }

    const subjectData = {
        name,
        description: desc,
        icon,
        color,
        updatedAt: new Date().toISOString()
    };

    try {
        if (AppState.editingSubjectId) {
            await subjectsRef.doc(AppState.editingSubjectId).update(subjectData);
            showToast('Đã cập nhật môn học!', 'success');
        } else {
            subjectData.createdAt = new Date().toISOString();
            subjectData.topicCount = 0;
            await subjectsRef.add(subjectData);
            showToast('Đã thêm môn học mới!', 'success');
        }
    } catch (err) {
        // Fallback to localStorage
        if (AppState.editingSubjectId) {
            const idx = AppState.subjects.findIndex(s => s.id === AppState.editingSubjectId);
            if (idx >= 0) AppState.subjects[idx] = { ...AppState.subjects[idx], ...subjectData };
        } else {
            subjectData.id = 'local_' + Date.now();
            subjectData.createdAt = new Date().toISOString();
            subjectData.topicCount = 0;
            AppState.subjects.unshift(subjectData);
        }
        localStorage.setItem('subjects', JSON.stringify(AppState.subjects));
        showToast('Đã lưu (offline)!', 'info');
    }

    closeModal('modal-subject');
    await loadSubjects();
    updateStats();
}

async function deleteSubject(subjectId) {
    try {
        // Delete all topics in that subject
        const topicsSnap = await subjectsRef.doc(subjectId).collection('topics').get();
        const batch = db.batch();
        topicsSnap.forEach(doc => batch.delete(doc.ref));
        batch.delete(subjectsRef.doc(subjectId));
        await batch.commit();
        showToast('Đã xóa môn học!', 'success');
    } catch (err) {
        AppState.subjects = AppState.subjects.filter(s => s.id !== subjectId);
        localStorage.setItem('subjects', JSON.stringify(AppState.subjects));
        showToast('Đã xóa (offline)!', 'info');
    }
    await loadSubjects();
    updateStats();
    navigateTo('subjects');
}

// --- Topics ---
async function loadTopics(subjectId) {
    try {
        const snapshot = await subjectsRef.doc(subjectId).collection('topics').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        const localKey = `topics_${subjectId}`;
        return JSON.parse(localStorage.getItem(localKey) || '[]');
    }
}

async function saveTopic() {
    const title = document.getElementById('topic-title').value.trim();
    const content = document.getElementById('topic-content-input').value.trim();

    if (!title) {
        showToast('Vui lòng nhập tiêu đề!', 'error');
        return;
    }

    const topicData = {
        title,
        content,
        updatedAt: new Date().toISOString()
    };

    const subjectId = AppState.currentSubjectId;

    try {
        if (AppState.editingTopicId) {
            await subjectsRef.doc(subjectId).collection('topics').doc(AppState.editingTopicId).update(topicData);
            showToast('Đã cập nhật bài viết!', 'success');
        } else {
            topicData.createdAt = new Date().toISOString();
            await subjectsRef.doc(subjectId).collection('topics').add(topicData);

            // Update topic count
            const subject = AppState.subjects.find(s => s.id === subjectId);
            const newCount = (subject?.topicCount || 0) + 1;
            await subjectsRef.doc(subjectId).update({ topicCount: newCount });

            showToast('Đã thêm bài viết mới!', 'success');
        }
    } catch (err) {
        const localKey = `topics_${subjectId}`;
        let topics = JSON.parse(localStorage.getItem(localKey) || '[]');
        if (AppState.editingTopicId) {
            const idx = topics.findIndex(t => t.id === AppState.editingTopicId);
            if (idx >= 0) topics[idx] = { ...topics[idx], ...topicData };
        } else {
            topicData.id = 'local_' + Date.now();
            topicData.createdAt = new Date().toISOString();
            topics.unshift(topicData);
        }
        localStorage.setItem(localKey, JSON.stringify(topics));
        showToast('Đã lưu (offline)!', 'info');
    }

    closeModal('modal-topic');
    showSubjectDetail(subjectId);
    updateStats();
}

async function deleteTopic(subjectId, topicId) {
    try {
        await subjectsRef.doc(subjectId).collection('topics').doc(topicId).delete();
        const subject = AppState.subjects.find(s => s.id === subjectId);
        const newCount = Math.max((subject?.topicCount || 1) - 1, 0);
        await subjectsRef.doc(subjectId).update({ topicCount: newCount });
        showToast('Đã xóa bài viết!', 'success');
    } catch (err) {
        const localKey = `topics_${subjectId}`;
        let topics = JSON.parse(localStorage.getItem(localKey) || '[]');
        topics = topics.filter(t => t.id !== topicId);
        localStorage.setItem(localKey, JSON.stringify(topics));
        showToast('Đã xóa (offline)!', 'info');
    }
    showSubjectDetail(subjectId);
    updateStats();
}

// --- Notes ---
// --- Notes (Realtime Update) ---
function loadNotes() {
    return new Promise((resolve) => {
        notesRef.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            AppState.notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderNotes();
            updateStats();
            resolve();
        }, (err) => {
            console.warn('Realtime Notes Error:', err);
            AppState.notes = JSON.parse(localStorage.getItem('notes') || '[]');
            renderNotes();
            resolve();
        });
    });
}

async function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const color = document.querySelector('#note-color-picker .color-option.active')?.dataset.color || '#dbeafe';

    if (!title && !content) {
        showToast('Vui lòng nhập nội dung!', 'error');
        return;
    }

    const noteData = {
        title: title || 'Ghi chú',
        content,
        color,
        updatedAt: new Date().toISOString()
    };

    try {
        if (AppState.editingNoteId) {
            await notesRef.doc(AppState.editingNoteId).update(noteData);
            showToast('Đã cập nhật ghi chú!', 'success');
        } else {
            noteData.createdAt = new Date().toISOString();
            await notesRef.add(noteData);
            showToast('Đã thêm ghi chú!', 'success');
        }
    } catch (err) {
        if (AppState.editingNoteId) {
            const idx = AppState.notes.findIndex(n => n.id === AppState.editingNoteId);
            if (idx >= 0) AppState.notes[idx] = { ...AppState.notes[idx], ...noteData };
        } else {
            noteData.id = 'local_' + Date.now();
            noteData.createdAt = new Date().toISOString();
            AppState.notes.unshift(noteData);
        }
        localStorage.setItem('notes', JSON.stringify(AppState.notes));
        showToast('Đã lưu (offline)!', 'info');
    }

    closeModal('modal-note');
    await loadNotes();
    updateStats();
}

async function deleteNote(noteId) {
    try {
        await notesRef.doc(noteId).delete();
        showToast('Đã xóa ghi chú!', 'success');
    } catch (err) {
        AppState.notes = AppState.notes.filter(n => n.id !== noteId);
        localStorage.setItem('notes', JSON.stringify(AppState.notes));
        showToast('Đã xóa (offline)!', 'info');
    }
    await loadNotes();
    updateStats();
}

// ===== RENDERING =====

function renderHomeSubjects() {
    const container = document.getElementById('home-subjects-grid');
    if (AppState.subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1">
                <i class="fas fa-book-open"></i>
                <h3>Chưa có môn học nào</h3>
                <p>Hãy thêm môn học đầu tiên để bắt đầu hành trình học tập!</p>
            </div>
        `;
        return;
    }
    container.innerHTML = AppState.subjects.map(s => createSubjectCard(s)).join('');
    attachSubjectCardEvents(container);
}

function renderSubjects() {
    const container = document.getElementById('subjects-grid');
    if (AppState.subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1">
                <i class="fas fa-folder-open"></i>
                <h3>Danh sách trống</h3>
                <p>Nhấn "Thêm môn học mới" để bắt đầu.</p>
            </div>
        `;
        return;
    }
    container.innerHTML = AppState.subjects.map(s => createSubjectCard(s)).join('');
    attachSubjectCardEvents(container);
}

function createSubjectCard(subject) {
    const topicCount = subject.topicCount || 0;
    const date = subject.createdAt ? formatDate(subject.createdAt) : '';
    return `
        <div class="subject-card" data-id="${subject.id}" style="--card-color: ${subject.color}">
            <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${subject.color};border-radius:16px 16px 0 0"></div>
            <div class="subject-card-icon" style="background:${subject.color}15;color:${subject.color}">
                <i class="fas ${subject.icon || 'fa-book'}"></i>
            </div>
            <h3>${escapeHTML(subject.name)}</h3>
            <p>${escapeHTML(subject.description || 'Chưa có mô tả')}</p>
            <div class="subject-card-meta">
                <span><i class="fas fa-file-alt"></i> ${topicCount} bài viết</span>
                <span><i class="fas fa-calendar"></i> ${date}</span>
            </div>
        </div>
    `;
}

function attachSubjectCardEvents(container) {
    container.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            showSubjectDetail(card.dataset.id);
        });
    });
}

async function showSubjectDetail(subjectId) {
    AppState.currentSubjectId = subjectId;
    const subject = AppState.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    document.getElementById('detail-subject-name').textContent = subject.name;
    document.getElementById('detail-subject-desc').textContent = subject.description || '';

    // Tích hợp nút trắc nghiệm cho môn Vi xử lý
    const actionsContainer = document.querySelector('#page-subject-detail .page-actions');
    const existingQuizBtn = document.getElementById('btn-quiz-special');
    if (existingQuizBtn) existingQuizBtn.remove();

    if (subjectId === 'ky-thuat-vi-xu-ly') {
        const quizBtn = document.createElement('a');
        quizBtn.id = 'btn-quiz-special';
        quizBtn.href = 'Ky_thuat_vi_xu_ly/index.html';
        quizBtn.target = '_blank';
        quizBtn.className = 'btn btn-secondary';
        quizBtn.innerHTML = '<i class="fas fa-tasks"></i> Luyện trắc nghiệm ngay';
        quizBtn.style.backgroundColor = '#2563eb';
        quizBtn.style.color = 'white';
        quizBtn.style.textDecoration = 'none';
        quizBtn.style.display = 'inline-flex';
        quizBtn.style.alignItems = 'center';
        quizBtn.style.gap = '8px';
        actionsContainer.prepend(quizBtn);
    }

    // Show page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-subject-detail').classList.add('active');

    // Load topics
    const topics = await loadTopics(subjectId);
    const container = document.getElementById('topics-list');

    if (topics.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-pen-fancy"></i>
                <h3>Chưa có bài viết</h3>
                <p>Nhấn "Thêm bài viết" để bổ sung nội dung cho môn học này.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = topics.map(t => `
        <div class="topic-card" data-id="${t.id}">
            <div class="topic-card-icon">
                <i class="fas fa-file-lines"></i>
            </div>
            <div class="topic-card-info">
                <h4>${escapeHTML(t.title)}</h4>
                <span>${formatDate(t.createdAt)}</span>
            </div>
            <i class="fas fa-chevron-right topic-card-arrow"></i>
        </div>
    `).join('');

    container.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', () => {
            showTopicDetail(subjectId, card.dataset.id, topics);
        });
    });
}

function showTopicDetail(subjectId, topicId, topics) {
    AppState.currentTopicId = topicId;
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    document.getElementById('detail-topic-title').textContent = topic.title;
    document.getElementById('topic-content').innerHTML = renderMarkdown(topic.content || '');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-topic-detail').classList.add('active');
}

function renderNotes() {
    const container = document.getElementById('notes-grid');
    if (AppState.notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <i class="fas fa-sticky-note"></i>
                <h3>Chưa có ghi chú</h3>
                <p>Tạo ghi chú nhanh để không quên các ý tưởng quan trọng!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.notes.map(n => `
        <div class="note-card" style="background:${n.color || '#dbeafe'}">
            <div class="note-actions">
                <button onclick="event.stopPropagation(); deleteNote('${n.id}')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <h4>${escapeHTML(n.title)}</h4>
            <p>${escapeHTML(n.content)}</p>
            <div class="note-date">${formatDate(n.createdAt)}</div>
        </div>
    `).join('');
}

function renderProgress() {
    const statsContainer = document.getElementById('progress-stats');
    const activityContainer = document.getElementById('recent-activity');

    const totalSubjects = AppState.subjects.length;
    const totalTopics = AppState.subjects.reduce((sum, s) => sum + (s.topicCount || 0), 0);
    const totalNotes = AppState.notes.length;

    // Calculate progress bars
    const maxTopics = Math.max(totalTopics, 10);
    const subjectsData = AppState.subjects.slice(0, 6).map(s => ({
        name: s.name,
        count: s.topicCount || 0,
        color: s.color || '#2563eb',
        percent: Math.round(((s.topicCount || 0) / maxTopics) * 100)
    }));

    statsContainer.innerHTML = `
        <div style="margin-bottom:16px;display:flex;gap:24px;">
            <div><span style="font-size:24px;font-weight:800;color:var(--blue-600)">${totalSubjects}</span> <span style="font-size:13px;color:var(--text-secondary)">Môn học</span></div>
            <div><span style="font-size:24px;font-weight:800;color:var(--green-500)">${totalTopics}</span> <span style="font-size:13px;color:var(--text-secondary)">Bài viết</span></div>
            <div><span style="font-size:24px;font-weight:800;color:var(--purple-500)">${totalNotes}</span> <span style="font-size:13px;color:var(--text-secondary)">Ghi chú</span></div>
        </div>
        ${subjectsData.map(s => `
            <div class="progress-bar-item">
                <div class="progress-bar-label">
                    <span>${escapeHTML(s.name)}</span>
                    <span>${s.count} bài viết</span>
                </div>
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" style="width:${s.percent}%;background:linear-gradient(90deg,${s.color},${s.color}cc)"></div>
                </div>
            </div>
        `).join('')}
    `;

    // Recent activity
    const allItems = [
        ...AppState.subjects.map(s => ({ type: 'subject', name: s.name, date: s.createdAt })),
        ...AppState.notes.map(n => ({ type: 'note', name: n.title, date: n.createdAt })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    if (allItems.length === 0) {
        activityContainer.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Chưa có hoạt động nào.</p>';
    } else {
        activityContainer.innerHTML = allItems.map(item => `
            <div class="activity-item">
                <div class="activity-dot" style="background:${item.type === 'subject' ? 'var(--blue-500)' : 'var(--purple-500)'}"></div>
                <span>${item.type === 'subject' ? 'Thêm môn học' : 'Thêm ghi chú'}: <strong>${escapeHTML(item.name)}</strong></span>
                <span class="activity-time">${formatDate(item.date)}</span>
            </div>
        `).join('');
    }
}

// ===== MODALS =====
function openModal(id) {
    document.getElementById(id).classList.add('visible');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('visible');
    AppState.editingSubjectId = null;
    AppState.editingTopicId = null;
    AppState.editingNoteId = null;
}

function openSubjectModal(subjectId = null) {
    AppState.editingSubjectId = subjectId;
    const modal = document.getElementById('modal-subject');

    if (subjectId) {
        const subject = AppState.subjects.find(s => s.id === subjectId);
        document.getElementById('modal-subject-title').textContent = 'Chỉnh sửa môn học';
        document.getElementById('subject-name').value = subject?.name || '';
        document.getElementById('subject-desc').value = subject?.description || '';
    } else {
        document.getElementById('modal-subject-title').textContent = 'Thêm môn học mới';
        document.getElementById('subject-name').value = '';
        document.getElementById('subject-desc').value = '';
    }

    openModal('modal-subject');
}

function openTopicModal(topicId = null) {
    AppState.editingTopicId = topicId;
    document.getElementById('modal-topic-title').textContent = topicId ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới';
    document.getElementById('topic-title').value = '';
    document.getElementById('topic-content-input').value = '';
    openModal('modal-topic');
}

function openNoteModal(noteId = null) {
    AppState.editingNoteId = noteId;
    document.getElementById('modal-note-title').textContent = noteId ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới';
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    openModal('modal-note');
}

function showConfirm(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    AppState.confirmCallback = callback;
    openModal('modal-confirm');
}

// ===== HANDLERS =====
function handleDeleteSubject() {
    showConfirm('Bạn có chắc chắn muốn xóa môn học này? Tất cả bài viết bên trong sẽ bị xóa.', () => {
        deleteSubject(AppState.currentSubjectId);
    });
}

async function handleEditTopic() {
    const topics = await loadTopics(AppState.currentSubjectId);
    const topic = topics.find(t => t.id === AppState.currentTopicId);
    if (!topic) return;

    AppState.editingTopicId = AppState.currentTopicId;
    document.getElementById('modal-topic-title').textContent = 'Chỉnh sửa bài viết';
    document.getElementById('topic-title').value = topic.title;
    document.getElementById('topic-content-input').value = topic.content || '';
    openModal('modal-topic');
}

function handleDeleteTopic() {
    showConfirm('Bạn có chắc chắn muốn xóa bài viết này?', () => {
        deleteTopic(AppState.currentSubjectId, AppState.currentTopicId);
    });
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        renderHomeSubjects();
        renderSubjects();
        return;
    }

    const filtered = AppState.subjects.filter(s =>
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
    );

    const containers = ['home-subjects-grid', 'subjects-grid'];
    containers.forEach(cId => {
        const container = document.getElementById(cId);
        if (!container) return;
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <i class="fas fa-search"></i>
                    <h3>Không tìm thấy kết quả</h3>
                    <p>Thử tìm kiếm với từ khóa khác.</p>
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(s => createSubjectCard(s)).join('');
            attachSubjectCardEvents(container);
        }
    });
}

// ===== STATS =====
function updateStats() {
    const totalSubjects = AppState.subjects.length;
    const totalTopics = AppState.subjects.reduce((sum, s) => sum + (s.topicCount || 0), 0);
    const totalNotes = AppState.notes.length;

    document.getElementById('total-subjects').textContent = totalSubjects;
    document.getElementById('total-topics').textContent = totalTopics;
    document.getElementById('total-notes').textContent = totalNotes;

    // Last updated
    const allDates = [
        ...AppState.subjects.map(s => s.updatedAt || s.createdAt),
        ...AppState.notes.map(n => n.updatedAt || n.createdAt),
    ].filter(Boolean).sort().reverse();

    document.getElementById('last-updated').textContent = allDates.length > 0
        ? formatDate(allDates[0])
        : '--';
}

// ===== MARKDOWN HELPERS =====
function insertMarkdown(format) {
    const textarea = document.getElementById('topic-content-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    const formats = {
        bold: { prefix: '**', suffix: '**', placeholder: 'in đậm' },
        italic: { prefix: '*', suffix: '*', placeholder: 'in nghiêng' },
        heading: { prefix: '## ', suffix: '', placeholder: 'Tiêu đề' },
        code: { prefix: '`', suffix: '`', placeholder: 'code' },
        list: { prefix: '- ', suffix: '', placeholder: 'Mục danh sách' },
        link: { prefix: '[', suffix: '](url)', placeholder: 'link text' },
    };

    const f = formats[format];
    if (!f) return;

    const text = selected || f.placeholder;
    const replacement = f.prefix + text + f.suffix;
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = start + f.prefix.length;
    textarea.selectionEnd = start + f.prefix.length + text.length;
}

function renderMarkdown(text) {
    if (!text) return '<p style="color:var(--text-muted)">Chưa có nội dung.</p>';

    let html = escapeHTML(text);

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    // Remove double br inside block elements
    html = html.replace(/<br><(h1|h2|h3|ul|li|pre|blockquote)/g, '<$1');
    html = html.replace(/<\/(h1|h2|h3|ul|li|pre|blockquote)><br>/g, '</$1>');

    return html;
}

// ===== UTILITIES =====
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3200);
}



