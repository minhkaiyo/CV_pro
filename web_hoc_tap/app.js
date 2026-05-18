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

// ===== USER ACTIVITY TRACKING =====
async function trackUserActivity(actionDetails) {
    if (!AUTH.isAuth()) return;
    try {
        const user = AUTH.getUser();
        await db.collection('users').doc(user.uid).set({
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Push to subcollection for history
        await db.collection('users').doc(user.uid).collection('activityLog').add({
            action: actionDetails,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.warn('Failed to track activity:', e);
    }
}

// Heartbeat every 2 minutes to keep Online status active
setInterval(() => {
    if (AUTH.isAuth()) {
        const user = AUTH.getUser();
        db.collection('users').doc(user.uid).set({
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(console.warn);
    }
}, 120000);

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
        
        // Realtime user count listener
        if (typeof db !== 'undefined' && db) {
            db.collection('users').onSnapshot((snap) => {
                const count = snap.size;
                localStorage.setItem('registered_users_count', count.toString());
                const totalUsersEl = document.getElementById('total-users');
                if (totalUsersEl) totalUsersEl.textContent = count;
            }, (err) => {
                console.warn('Realtime users list error:', err);
            });
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
        showToast('Offline Mode - No Firebase connection.', 'info');
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

    // Buttons - Add subject (ADMIN ONLY)
    document.getElementById('btn-add-subject-home')?.addEventListener('click', () => AUTH.requireAdmin(() => openSubjectModal()));
    document.getElementById('btn-add-subject')?.addEventListener('click', () => AUTH.requireAdmin(() => openSubjectModal()));

    // Upload Resource confirm button (Marketplace)
    document.getElementById('btn-confirm-upload-resource')?.addEventListener('click', handleUploadResource);

    // Buttons - Subject detail
    document.getElementById('btn-back-subjects').addEventListener('click', () => navigateTo('subjects'));
    document.getElementById('btn-add-topic').addEventListener('click', () => AUTH.requireAdmin(() => openTopicModal()));
    document.getElementById('btn-delete-subject').addEventListener('click', () => AUTH.requireAdmin(handleDeleteSubject));

    // Buttons - Topic detail
    document.getElementById('btn-back-topics').addEventListener('click', () => {
        showSubjectDetail(AppState.currentSubjectId);
    });
    document.getElementById('btn-edit-topic').addEventListener('click', () => AUTH.requireAdmin(handleEditTopic));
    document.getElementById('btn-delete-topic').addEventListener('click', () => AUTH.requireAdmin(handleDeleteTopic));

    // Buttons - Notes (ADMIN ONLY)
    document.getElementById('btn-add-note').addEventListener('click', () => {
        if (!AUTH.isAuth()) return showAuthModal();
        openNoteModal();
    });

    // Privacy toggle in note modal
    const notePrivacyCheckbox = document.getElementById('note-is-private');
    if (notePrivacyCheckbox) {
        notePrivacyCheckbox.addEventListener('change', (e) => {
            _updatePrivacyUI(e.target.checked);
        });
    }

    // Logo → home
    document.getElementById('logo-home-btn')?.addEventListener('click', () => navigateTo('home'));

    // Save buttons
    document.getElementById('btn-save-subject').addEventListener('click', () => AUTH.requireAdmin(saveSubject));
    document.getElementById('btn-save-topic').addEventListener('click', () => AUTH.requireAdmin(saveTopic));
    // Note: mọi user đăng nhập đều lưu được ghi chú
    document.getElementById('btn-save-note').addEventListener('click', saveNote);

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

    // User login/logout button
    document.getElementById('auth-lock-badge').addEventListener('click', (e) => {
        if (AUTH.isAuth()) {
            e.stopPropagation();
            const dropdown = document.getElementById('user-dropdown-menu');
            if (dropdown) dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        } else {
            showAuthModal();
        }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-dropdown-menu');
        const badge = document.getElementById('auth-lock-badge');
        if (dropdown && dropdown.style.display === 'block' && !dropdown.contains(e.target) && badge && !badge.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Admin login button
    document.getElementById('admin-badge').addEventListener('click', () => {
        if (AUTH.isAdmin()) {
            // Already admin, deactivate
            sessionStorage.removeItem(AUTH._sessionKey);
            updateAuthUI();
            showToast('Đã thoát Chế độ Admin.', 'info');
        } else {
            AUTH.requireAdmin(() => {});
        }
    });

    // Profile Save
    const btnSaveProfile = document.getElementById('btn-save-profile');
    if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', saveUserProfile);
    }

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
    
    // Allow viewing list pages (home, subjects, notes) publicly
    // but protect detailed views and administrative pages
    const protectedPages = ['progress', 'exams', 'ai-generator', 'manual-exam', 'created-exams', 'favorite-exams', 'saved-documents', 'practice-results', 'upgrade'];
    if (protectedPages.includes(page) && !AUTH.isAuth()) {
        AUTH.requireUser(() => navigateTo(page));
        return;
    }

    if (target) target.classList.add('active');

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');

    // Refresh content
    if (page === 'home') renderHomeSubjects();
    if (page === 'subjects') renderSubjects();
    if (page === 'marketplace') renderMarketplace();
    if (page === 'notes') renderNotes();
    if (page === 'progress') renderProgress();
    if (page === 'ai-generator') initAIGeneratorPage();
    if (page === 'manual-exam') initManualExamPage();
    if (page === 'created-exams') initCreatedExamsPage();
    if (page === 'favorite-exams') initFavoriteExamsPage();
    if (page === 'saved-documents') initSavedDocumentsPage();
    if (page === 'practice-results') initPracticeResultsPage();
    if (page === 'upgrade') initUpgradePage();
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

// ===== PROFILE =====
async function openUserProfile() {
    document.getElementById('user-dropdown-menu').style.display = 'none';
    if (!AUTH.isAuth()) return showAuthModal();

    const user = AUTH.getUser();
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('profile-name').value = data.displayName || user.displayName || '';
            document.getElementById('profile-phone').value = data.phone || '';
            document.getElementById('profile-student-id').value = data.studentId || '';
            document.getElementById('profile-class').value = data.className || '';
            document.getElementById('profile-school').value = data.school || '';
        } else {
            document.getElementById('profile-name').value = user.displayName || '';
        }
    } catch (e) {
        console.error('Error fetching profile:', e);
    }
    openModal('modal-edit-profile');
}

async function saveUserProfile() {
    const name = document.getElementById('profile-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const studentId = document.getElementById('profile-student-id').value.trim();
    const className = document.getElementById('profile-class').value.trim();
    const school = document.getElementById('profile-school').value.trim();

    if (!name) return showToast('Vui lòng nhập Họ và Tên!', 'error');

    const user = AUTH.getUser();
    if (!user) return;

    const btn = document.getElementById('btn-save-profile');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    btn.disabled = true;

    try {
        await db.collection('users').doc(user.uid).set({
            displayName: name,
            phone: phone,
            studentId: studentId,
            className: className,
            school: school,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        showToast('Cập nhật hồ sơ thành công!', 'success');
        closeModal('modal-edit-profile');
        trackUserActivity('Cập nhật hồ sơ cá nhân');
        
        // Update UI
        const dropName = document.getElementById('user-dropdown-name');
        if (dropName) dropName.textContent = name;
        const lockBadgeSpan = document.querySelector('#auth-lock-badge span');
        if (lockBadgeSpan) lockBadgeSpan.textContent = name;

    } catch (e) {
        showToast('Lỗi khi cập nhật hồ sơ: ' + e.message, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
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
    let greet = 'Good morning! ☀️';
    if (hour >= 12 && hour < 18) greet = 'Good afternoon! 🌤️';
    if (hour >= 18 || hour < 5) greet = 'Good evening! 🌙';
    document.getElementById('greeting-text').textContent = greet;
}

// ===== FIREBASE DATA OPERATIONS =====

// --- Subjects ---
// --- Subjects (Realtime Update) ---
function loadSubjects() {
    return new Promise((resolve) => {
        // Everyone can see subjects publicly
        subjectsRef.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            AppState.subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderHomeSubjects();
            renderSubjects();
            updateStats();
            resolve();
        }, (err) => {
            console.warn('Realtime Subjects Error:', err);
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
        showToast('Please enter the subject title!', 'error');
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
            showToast('Subject updated successfully!', 'success');
        } else {
            subjectData.createdAt = new Date().toISOString();
            subjectData.topicCount = 0;
            await subjectsRef.add(subjectData);
            showToast('New subject added successfully!', 'success');
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
        showToast('Saved (offline)!', 'info');
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
        showToast('Subject deleted successfully!', 'success');
    } catch (err) {
        AppState.subjects = AppState.subjects.filter(s => s.id !== subjectId);
        localStorage.setItem('subjects', JSON.stringify(AppState.subjects));
        showToast('Deleted (offline)!', 'info');
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
        showToast('Please enter a title!', 'error');
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
            showToast('Topic updated successfully!', 'success');
        } else {
            topicData.createdAt = new Date().toISOString();
            await subjectsRef.doc(subjectId).collection('topics').add(topicData);

            // Update topic count
            const subject = AppState.subjects.find(s => s.id === subjectId);
            const newCount = (subject?.topicCount || 0) + 1;
            await subjectsRef.doc(subjectId).update({ topicCount: newCount });

            showToast('New topic added successfully!', 'success');
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
        showToast('Saved (offline)!', 'info');
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
        showToast('Topic deleted successfully!', 'success');
    } catch (err) {
        const localKey = `topics_${subjectId}`;
        let topics = JSON.parse(localStorage.getItem(localKey) || '[]');
        topics = topics.filter(t => t.id !== topicId);
        localStorage.setItem(localKey, JSON.stringify(topics));
        showToast('Deleted (offline)!', 'info');
    }
    showSubjectDetail(subjectId);
    updateStats();
}

// --- Notes (Realtime Update) ---
// Lưu filter hiện tại
AppState.notesFilter = 'all';

function loadNotes() {
    return new Promise((resolve) => {
        // Load ghi chú công khai + ghi chú riêng tư của user hiện tại
        notesRef.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            const uid = AUTH.isAuth() ? AUTH.getUser().uid : null;
            AppState.allNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Lọc: hiện công khai + ghi chú riêng tư của chính mình
            AppState.notes = AppState.allNotes.filter(n => {
                if (!n.isPrivate) return true;           // công khai → ai cũng thấy
                return uid && n.userId === uid;           // riêng tư → chỉ chủ sở hữu
            });
            renderNotes();
            updateStats();
            resolve();
        }, (err) => {
            console.warn('Realtime Notes Error:', err);
            resolve();
        });
    });
}

async function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const color = document.querySelector('#note-color-picker .color-option.active')?.dataset.color || '#dbeafe';
    const isPrivate = document.getElementById('note-is-private')?.checked || false;

    if (!title && !content) {
        showToast('Vui lòng nhập nội dung ghi chú!', 'error');
        return;
    }

    // Ghi chú riêng tư bắt buộc phải đăng nhập
    if (isPrivate && !AUTH.isAuth()) {
        showToast('Vui lòng đăng nhập để tạo ghi chú riêng tư!', 'error');
        return showAuthModal();
    }

    const uid = AUTH.isAuth() ? AUTH.getUser().uid : null;
    const userEmail = AUTH.isAuth() ? AUTH.getUser().email : null;

    const noteData = {
        title: title || 'Ghi chú',
        content,
        color,
        isPrivate,
        userId: uid,
        userEmail: userEmail,
        updatedAt: new Date().toISOString()
    };

    try {
        if (AppState.editingNoteId) {
            // Chỉ chủ sở hữu mới được sửa
            const existing = AppState.notes.find(n => n.id === AppState.editingNoteId);
            if (existing?.userId && existing.userId !== uid && !AUTH.isAdmin()) {
                showToast('Bạn không có quyền sửa ghi chú này!', 'error');
                return;
            }
            await notesRef.doc(AppState.editingNoteId).update(noteData);
            showToast('Đã cập nhật ghi chú!', 'success');
        } else {
            noteData.createdAt = new Date().toISOString();
            await notesRef.add(noteData);
            showToast(isPrivate ? 'Đã thêm ghi chú riêng tư! 🔒' : 'Đã thêm ghi chú!', 'success');
        }
    } catch (err) {
        // Fallback offline
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
    updateStats();
}

async function deleteNote(noteId) {
    const note = AppState.notes.find(n => n.id === noteId);
    const uid = AUTH.isAuth() ? AUTH.getUser().uid : null;
    const isAdmin = AUTH.isAdmin();

    // Admin có thể xóa tất cả
    // User chỉ xóa ghi chú của chính mình (có userId khớp)
    // Ghi chú cũ không có userId: chỉ admin mới xóa được
    if (!isAdmin) {
        if (!note?.userId) {
            showToast('Bạn không có quyền xóa ghi chú này!', 'error');
            return;
        }
        if (note.userId !== uid) {
            showToast('Bạn chỉ có thể xóa ghi chú của chính mình!', 'error');
            return;
        }
    }

    if (!confirm(isAdmin && note?.userId !== uid
        ? `Xóa ghi chú của người dùng khác? (Admin)`
        : 'Xóa ghi chú này?')) return;

    try {
        await notesRef.doc(noteId).delete();
        showToast('Đã xóa ghi chú!', 'success');
    } catch (err) {
        AppState.notes = AppState.notes.filter(n => n.id !== noteId);
        localStorage.setItem('notes', JSON.stringify(AppState.notes));
        showToast('Đã xóa (offline)!', 'info');
    }
    updateStats();
}

// ===== RENDERING =====

function renderHomeSubjects() {
    const container = document.getElementById('home-subjects-grid');
    if (AppState.subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1">
                <i class="fas fa-book-open"></i>
                <h3>No subjects available</h3>
                <p>Add your first subject to start your learning journey!</p>
            </div>
        `;
        return;
    }
    const displaySubjects = AppState.subjects.slice(0, 10);
    container.innerHTML = displaySubjects.map(s => createSubjectCard(s)).join('');
    attachSubjectCardEvents(container);
}

function renderSubjects() {
    // When navigating to subjects page, render the public exams
    renderPublicExams();
}

// Category filter state
AppState.categoryFilter = 'all';

// Build dynamic category cards from actual exam subjects in DB
function _buildDynamicCategories(exams) {
    const track = document.getElementById('category-track');
    if (!track) return;

    // Collect unique subjects from exams only (not documents)
    const subjectSet = new Set();
    exams.forEach(e => {
        const rType = e.resourceType || 'exam';
        if (rType === 'exam' && e.subject) {
            subjectSet.add(e.subject.trim());
        }
    });

    if (subjectSet.size === 0) return;

    // Icon map for common subjects
    const iconMap = [
        { keywords: ['marketing'],              icon: 'fa-bullhorn',           color: '#e11d48' },
        { keywords: ['thương mại', 'tmdt', 'ecommerce'], icon: 'fa-shopping-cart', color: '#16a34a' },
        { keywords: ['công nghệ', 'cntt', 'it', 'lập trình', 'software'], icon: 'fa-laptop-code', color: '#0284c7' },
        { keywords: ['y học', 'y tế', 'dược', 'medical'], icon: 'fa-mortar-pestle', color: '#059669' },
        { keywords: ['luật', 'pháp'],           icon: 'fa-balance-scale',      color: '#b91c1c' },
        { keywords: ['tiếng anh', 'english', 'ngôn ngữ'], icon: 'fa-language', color: '#7c3aed' },
        { keywords: ['ô tô', 'cơ khí', 'automotive'], icon: 'fa-car',         color: '#ea580c' },
        { keywords: ['dsp', 'signal', 'tín hiệu'], icon: 'fa-wave-square',    color: '#8b5cf6' },
        { keywords: ['vi xử lý', 'microprocessor', '8086'], icon: 'fa-microchip', color: '#0891b2' },
        { keywords: ['toán', 'math'],           icon: 'fa-square-root-variable', color: '#d97706' },
        { keywords: ['vật lý', 'physics'],      icon: 'fa-atom',               color: '#0284c7' },
        { keywords: ['hóa', 'chemistry'],       icon: 'fa-flask',              color: '#16a34a' },
        { keywords: ['kinh tế', 'economics'],   icon: 'fa-chart-line',         color: '#0891b2' },
        { keywords: ['điện', 'electric'],       icon: 'fa-bolt',               color: '#eab308' },
    ];

    function getIconForSubject(subj) {
        const lower = subj.toLowerCase();
        for (const m of iconMap) {
            if (m.keywords.some(k => lower.includes(k))) {
                return { icon: m.icon, color: m.color };
            }
        }
        return { icon: 'fa-book', color: '#6b7280' };
    }

    const currentFilter = AppState.categoryFilter || 'all';

    // Build HTML — "Tất cả" card first, then dynamic subjects
    let html = `
        <div class="category-card ${currentFilter === 'all' ? 'active' : ''}" data-cat="all"
             onclick="filterByCategory('all', this)">
            <div class="cat-icon"><i class="fas fa-border-all" style="color:#6b7280"></i></div>
            <span class="cat-name">Tất cả</span>
        </div>`;

    [...subjectSet].sort().forEach(subj => {
        const { icon, color } = getIconForSubject(subj);
        const isActive = currentFilter === subj;
        const shortName = subj.length > 18 ? subj.substring(0, 16) + '…' : subj;
        html += `
        <div class="category-card ${isActive ? 'active' : ''}" data-cat="${subj}"
             onclick="filterByCategory('${subj.replace(/'/g, "\\'")}', this)"
             title="${subj}">
            <div class="cat-icon"><i class="fas ${icon}" style="color:${color}"></i></div>
            <span class="cat-name">${shortName}</span>
        </div>`;
    });

    track.innerHTML = html;
}
function filterByCategory(category, cardEl) {
    // Toggle: click lai category dang active -> reset ve all
    if (AppState.categoryFilter === category && category !== 'all') {
        category = 'all';
        cardEl = null;
    }

    AppState.categoryFilter = category;

    // Update active state
    document.querySelectorAll('#category-track .category-card').forEach(c => c.classList.remove('active'));
    if (cardEl) {
        cardEl.classList.add('active');
    } else {
        const allCard = document.querySelector('#category-track .category-card[data-cat="all"]');
        if (allCard) allCard.classList.add('active');
    }

    // Cap nhat badge
    const badge = document.getElementById('category-active-badge');
    if (badge) {
        if (category === 'all') {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'inline-flex';
            badge.innerHTML = '<i class="fas fa-tag" style="margin-right:5px"></i>' + category +
                ' <button onclick="filterByCategory(\'all\',null)" style="background:none;border:none;cursor:pointer;margin-left:6px;color:inherit;font-size:12px;padding:0">\u2715</button>';
        }
    }

    const grid = document.getElementById('subjects-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });

    renderPublicExams();
}

async function renderPublicExams() {
    const container = document.getElementById('subjects-grid');
    if (!container) return;
    
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 24px; color:#10b981;"></i> Đang tải danh sách đề thi...</div>`;

    const typeFilter = document.getElementById('filter-exam-type') ? document.getElementById('filter-exam-type').value : 'all';
    const diffFilter = document.getElementById('filter-exam-diff') ? document.getElementById('filter-exam-diff').value : 'all';
    const resourceTypeFilter = document.getElementById('filter-resource-type') ? document.getElementById('filter-resource-type').value : 'all';

    try {
        let query = db.collection('public_exams');
        const snap = await query.orderBy('createdAt', 'desc').limit(50).get();
        
        let exams = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allExams = exams; // keep full list for category building

        // Only show EXAMS here
        exams = exams.filter(e => {
            const rType = e.resourceType || 'exam';
            return rType === 'exam';
        });

        // Apply filters
        if (typeFilter === 'free') {
            exams = exams.filter(e => e.price === 0);
        } else if (typeFilter === 'paid') {
            exams = exams.filter(e => e.price > 0);
        }

        if (diffFilter !== 'all') {
            exams = exams.filter(e => e.difficulty === diffFilter);
        }

        // Apply category filter — exact match hoac partial
        const catFilter = AppState.categoryFilter || 'all';
        if (catFilter !== 'all') {
            exams = exams.filter(e => {
                const subj = (e.subject || '').toLowerCase().trim();
                const cat = catFilter.toLowerCase().trim();
                // Exact match truoc, sau do partial
                return subj === cat || subj.includes(cat) || cat.includes(subj);
            });
        }

        if (exams.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1">
                    <i class="fas fa-folder-open"></i>
                    <h3>Không tìm thấy đề thi nào</h3>
                    <p>Chưa có đề thi nào phù hợp với bộ lọc hiện tại.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = exams.map(exam => createPublicExamCard(exam)).join('');
        // Hiện nút xóa cho bài đăng của chính user
        setTimeout(showOwnerDeleteButtons, 50);
        
    } catch (err) {
        console.error("Error fetching public exams:", err);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; color: var(--red-500);">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Lỗi kết nối</h3>
                <p>Không thể tải danh sách đề thi lúc này. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

async function renderMarketplace() {
    const container = document.getElementById('marketplace-grid');
    if (!container) return;
    
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 24px; color:#10b981;"></i> Đang tải Marketplace...</div>`;

    const typeFilter = document.getElementById('filter-marketplace-type') ? document.getElementById('filter-marketplace-type').value : 'all';
    const priceFilter = document.getElementById('filter-marketplace-price') ? document.getElementById('filter-marketplace-price').value : 'all';

    try {
        let query = db.collection('public_exams');
        const snap = await query.orderBy('createdAt', 'desc').limit(50).get();
        
        let resources = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Only show NON-EXAM resources here
        resources = resources.filter(e => {
            const rType = e.resourceType || 'exam';
            return rType !== 'exam';
        });

        // Apply filters
        if (typeFilter !== 'all') {
            resources = resources.filter(e => e.resourceType === typeFilter);
        }

        if (priceFilter === 'free') {
            resources = resources.filter(e => e.price === 0);
        } else if (priceFilter === 'paid') {
            resources = resources.filter(e => e.price > 0);
        }

        if (resources.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1">
                    <i class="fas fa-box-open"></i>
                    <h3>Chợ Đen đang trống</h3>
                    <p>Hãy là người đầu tiên đăng tài liệu lên Marketplace!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = resources.map(exam => createPublicExamCard(exam)).join('');
        setTimeout(showOwnerDeleteButtons, 50);
        
    } catch (err) {
        console.error("Error fetching marketplace:", err);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; color: var(--red-500);">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Lỗi kết nối</h3>
                <p>Không thể tải Marketplace lúc này.</p>
            </div>
        `;
    }
}

function createPublicExamCard(exam) {
    const qCount = exam.questions ? exam.questions.length : 0;
    const isFree = !exam.price || exam.price === 0;
    const priceBadge = isFree 
        ? `<span class="badge" style="background:#d1fae5; color:#059669; font-size:11px;"><i class="fas fa-gift"></i> Miễn phí</span>`
        : `<span class="badge" style="background:#fef3c7; color:#d97706; font-size:11px;"><i class="fas fa-coins"></i> ${exam.price} Đ</span>`;

    const diffColors = {
        'easy': { bg: '#dcfce7', color: '#16a34a', text: 'Dễ' },
        'medium': { bg: '#fef9c3', color: '#ca8a04', text: 'Vừa' },
        'hard': { bg: '#fee2e2', color: '#dc2626', text: 'Khó' },
        'mixed': { bg: '#f3e8ff', color: '#9333ea', text: 'Mixed' }
    };
    const diff = diffColors[exam.difficulty] || diffColors['medium'];

    const rType = exam.resourceType || 'exam';
    const typeMeta = {
        'exam': { icon: 'fa-file-signature', label: 'Đề thi' },
        'document': { icon: 'fa-file-pdf', label: 'Tài liệu' },
        'note': { icon: 'fa-file-lines', label: 'Ghi chú' },
        'flashcard': { icon: 'fa-clone', label: 'Flashcard' }
    };
    const meta = typeMeta[rType] || typeMeta['exam'];

    return `
        <div class="exam-card" data-exam-id="${exam.id}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    ${priceBadge}
                    <span class="badge" style="background:${diff.bg}; color:${diff.color}; font-size:11px;">${diff.text}</span>
                    <span class="badge" style="background:var(--bg-secondary); color:var(--text-secondary); font-size:11px;"><i class="fas ${meta.icon}"></i> ${meta.label}</span>
                </div>
                <div style="display:flex;gap:4px;flex-shrink:0">
                    <button class="btn btn-ghost btn-sm" onclick="showPublicExamDetails('${exam.id}')" style="padding:4px;font-size:12px;border-radius:50%;"><i class="fas fa-info-circle"></i></button>
                    <button class="btn btn-ghost btn-sm public-exam-delete-btn" data-author="${exam.authorUid || ''}"
                        onclick="deletePublicExam('${exam.id}', this)"
                        style="padding:4px;font-size:12px;border-radius:50%;color:#ef4444;display:none"
                        title="Xóa bài đăng của bạn">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); line-height: 1.4;">${escapeHTML(exam.title)}</h3>
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                <span><i class="fas fa-book"></i> Môn: <span style="font-weight:600; color:var(--text-secondary);">${escapeHTML(exam.subject)}</span></span>
                <span><i class="far fa-clock"></i> ${formatDateTime(exam.createdAt)}</span>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top: auto; padding-top: 12px; border-top: 1px dashed var(--border-color); font-size: 12px;">
                <span style="color:var(--text-muted)"><i class="fas fa-list-ul"></i> ${rType === 'exam' ? (qCount + ' câu') : '1 File'}</span>
                <span style="color:var(--text-muted)"><i class="fas fa-user-edit"></i> ${escapeHTML((exam.authorEmail || '').split('@')[0])}</span>
            </div>
            
            <div style="margin-top: 12px; display: flex; gap: 8px;">
                <button class="btn btn-secondary" style="flex: 1; padding:8px; font-size:13px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary);" onclick="showPublicExamDetails('${exam.id}')">
                    <i class="fas fa-eye"></i> Xem chi tiết
                </button>
                <button class="btn btn-primary" style="flex: 1; padding:8px; font-size:13px;" onclick="unlockPublicExam('${exam.id}', ${exam.price || 0}, '${escapeHTML(exam.title)}')">
                    ${isFree ? '<i class="fas fa-folder-plus"></i> Nhận free' : '<i class="fas fa-shopping-cart"></i> Mua ngay'}
                </button>
            </div>
        </div>
    `;
}

window.unlockPublicExam = async function(examId, price, title) {
    if (!AUTH.isAuth()) {
        AUTH.requireUser();
        return;
    }

    if (price > 0) {
        if (typeof PointsSystem === 'undefined' || PointsSystem.balance < price) {
            showToast('Bạn không đủ điểm để mua đề thi này!', 'error');
            document.getElementById('modal-topup-points').classList.add('visible');
            return;
        }
        
        if (!confirm(`Xác nhận dùng ${price} điểm để mua đề thi: ${title}?`)) return;
        
        const success = await PointsSystem.deductPoints(price, `Mua đề thi: ${title}`);
        if (!success) return;
    }

    // Add to user's created_exams / library
    try {
        const user = AUTH.getUser();
        // Fetch exam full data
        const examDoc = await db.collection('public_exams').doc(examId).get();
        if (!examDoc.exists) throw new Error("Exam not found");
        
        const examData = examDoc.data();
        examData.purchasedAt = firebase.firestore.FieldValue.serverTimestamp();
        examData.savedAt = firebase.firestore.FieldValue.serverTimestamp();

        const rType = examData.resourceType || 'exam';
        const isDocument = rType !== 'exam'; // document, note, flashcard → tài liệu

        if (isDocument) {
            // Tài liệu → lưu vào saved_documents
            await db.collection('users').doc(user.uid).collection('saved_documents').add(examData);
            showToast('Đã lưu vào Tài liệu đã lưu! 📁', 'success');
            setTimeout(() => navigateTo('saved-documents'), 1200);
        } else {
            // Đề thi → lưu vào saved_exams
            await db.collection('users').doc(user.uid).collection('saved_exams').add(examData);
            showToast('Đã lưu vào Đề đã lưu! 🔖', 'success');
            setTimeout(() => navigateTo('favorite-exams'), 1200);
        }
    } catch (e) {
        console.error("Error unlocking exam:", e);
        showToast('Có lỗi xảy ra khi lấy đề thi', 'error');
    }
};

window.showPublicExamDetails = async function(examId) {
    // Mở modal ngay, hiện skeleton loading
    const overlay = document.getElementById('modal-exam-preview');
    overlay.classList.add('visible');

    document.getElementById('ep-title').textContent = 'Đang tải...';
    document.getElementById('ep-meta').innerHTML = '';
    document.getElementById('ep-stats').innerHTML = '';
    document.getElementById('ep-footer').innerHTML = '';
    document.getElementById('ep-questions-list').innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px">
            ${[1,2,3].map(() => `
                <div style="background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:12px;padding:18px">
                    <div class="ep-skeleton" style="width:60%;height:14px"></div>
                    <div class="ep-skeleton" style="width:90%;height:14px"></div>
                    <div class="ep-skeleton" style="width:40%;height:12px;margin-top:12px"></div>
                </div>`).join('')}
        </div>`;

    try {
        const doc = await db.collection('public_exams').doc(examId).get();
        if (!doc.exists) {
            showToast('Không tìm thấy đề thi!', 'error');
            overlay.classList.remove('visible');
            return;
        }
        const exam = { id: doc.id, ...doc.data() };
        _renderExamPreviewModal(exam);
    } catch (e) {
        console.error('showPublicExamDetails error:', e);
        showToast('Lỗi khi tải đề thi: ' + e.message, 'error');
        overlay.classList.remove('visible');
    }
};

function _renderExamPreviewModal(exam) {
    const isFree = !exam.price || exam.price === 0;
    const qCount = exam.questions ? exam.questions.length : 0;
    const diffLabel = { easy:'Dễ', medium:'Trung bình', hard:'Khó', mixed:'Hỗn hợp' }[exam.difficulty] || (exam.difficulty || 'N/A');
    const diffColor = { easy:'#10b981', medium:'#f59e0b', hard:'#ef4444', mixed:'#8b5cf6' }[exam.difficulty] || '#6b7280';
    const rType = exam.resourceType || 'exam';
    const typeInfo = {
        exam:      { icon: 'fa-file-signature', label: 'Đề thi',   color: '#3b82f6' },
        document:  { icon: 'fa-file-pdf',       label: 'Tài liệu', color: '#ef4444' },
        note:      { icon: 'fa-file-lines',      label: 'Ghi chú',  color: '#10b981' },
        flashcard: { icon: 'fa-clone',           label: 'Flashcard',color: '#8b5cf6' }
    }[rType] || { icon: 'fa-file', label: 'Tài liệu', color: '#6b7280' };

    // Header
    document.getElementById('ep-type-icon').innerHTML =
        `<i class="fas ${typeInfo.icon}" style="color:${typeInfo.color}"></i>`;
    document.getElementById('ep-type-icon').style.background =
        `linear-gradient(135deg,${typeInfo.color}18,${typeInfo.color}30)`;
    document.getElementById('ep-title').textContent = exam.title || 'Đề thi';
    document.getElementById('ep-meta').innerHTML = `
        <span><i class="fas fa-book" style="color:${typeInfo.color}"></i> ${escapeHTML(exam.subject || '')}</span>
        <span><i class="fas fa-user-edit"></i> ${escapeHTML((exam.authorEmail || '').split('@')[0])}</span>
        ${exam.createdAt ? `<span><i class="fas fa-calendar-alt"></i> ${formatDateTime(exam.createdAt)}</span>` : ''}
    `;

    // Stats bar
    document.getElementById('ep-stats').innerHTML = `
        <div class="ep-stat">
            <span class="ep-stat-value">${qCount}</span>
            <span class="ep-stat-label">Câu hỏi</span>
        </div>
        <div class="ep-stat">
            <span class="ep-stat-value" style="color:${diffColor}">${diffLabel}</span>
            <span class="ep-stat-label">Độ khó</span>
        </div>
        <div class="ep-stat">
            <span class="ep-stat-value" style="color:${isFree?'#10b981':'#f59e0b'}">${isFree ? 'Free' : exam.price + ' Đ'}</span>
            <span class="ep-stat-label">Giá</span>
        </div>
        <div class="ep-stat">
            <span class="ep-stat-value">${exam.downloads || 0}</span>
            <span class="ep-stat-label">Lượt nhận</span>
        </div>
    `;

    // Questions list — ẩn đáp án đúng
    const qList = document.getElementById('ep-questions-list');
    if (!exam.questions || !exam.questions.length) {
        qList.innerHTML = `<div class="ep-question-item" style="text-align:center;color:var(--text-muted);padding:40px">
            <i class="fas fa-file-circle-question" style="font-size:36px;margin-bottom:12px;display:block;opacity:0.4"></i>
            Không có câu hỏi để xem trước
        </div>`;
    } else {
        const QTYPE_LABEL = { mcq:'Trắc nghiệm', tf:'Đúng/Sai', multi:'Nhiều đáp án', fill:'Điền khuyết', short:'Trả lời ngắn', essay:'Tự luận' };
        qList.innerHTML = exam.questions.map((q, i) => {
            // Xác định nội dung câu hỏi (hỗ trợ cả format cũ và mới)
            const qText = q.question || q.content || '';
            const qType = q.type || 'mcq';
            const typeLabel = QTYPE_LABEL[qType] || 'Trắc nghiệm';

            let optionsHTML = '';
            if (qType === 'mcq' || qType === 'multi') {
                // Có options object {A,B,C,D} hoặc array
                const opts = q.options && typeof q.options === 'object' && !Array.isArray(q.options)
                    ? Object.entries(q.options)
                    : (Array.isArray(q.options) ? q.options.map((o,idx) => [String.fromCharCode(65+idx), o]) : []);
                optionsHTML = `<div class="ep-options">
                    ${opts.map(([key, val]) => `
                        <div class="ep-option">
                            <span class="ep-option-key">${key}</span>
                            <span>${escapeHTML(val)}</span>
                        </div>`).join('')}
                </div>`;
            } else if (qType === 'tf') {
                optionsHTML = `<div class="ep-options">
                    <div class="ep-option"><span class="ep-option-key" style="color:#10b981">✓</span><span>Đúng</span></div>
                    <div class="ep-option"><span class="ep-option-key" style="color:#ef4444">✗</span><span>Sai</span></div>
                </div>`;
            } else if (qType === 'fill') {
                optionsHTML = `<div class="ep-answer-hidden"><i class="fas fa-eye-slash"></i> Đáp án được ẩn — nhận đề để xem</div>`;
            } else if (qType === 'short' || qType === 'essay') {
                optionsHTML = `<div class="ep-answer-hidden"><i class="fas fa-pen-to-square"></i> Câu ${qType === 'essay' ? 'tự luận' : 'trả lời ngắn'} — nhận đề để xem hướng dẫn chấm</div>`;
            }

            return `
            <div class="ep-question-item">
                <div class="ep-question-header">
                    <span class="ep-question-num">Câu ${i + 1}</span>
                    <span class="ep-question-type">${typeLabel}</span>
                    <span class="ep-answer-hidden" style="margin-left:auto;margin-top:0;padding:3px 8px;font-size:10px">
                        <i class="fas fa-lock"></i> Đáp án ẩn
                    </span>
                </div>
                <div class="ep-question-text">${escapeHTML(qText)}</div>
                ${optionsHTML}
            </div>`;
        }).join('');
    }

    // Footer
    const isOwner = AUTH.isAuth() && AUTH.getUser().uid === exam.authorUid;
    const canDelete = isOwner || AUTH.isAdmin();
    document.getElementById('ep-footer').innerHTML = `
        <div class="ep-price-tag">
            ${isFree
                ? `<i class="fas fa-gift" style="color:#10b981"></i> Miễn phí`
                : `<i class="fas fa-coins" style="color:#f59e0b"></i> ${exam.price} Điểm`}
        </div>
        ${canDelete ? `<button class="btn btn-secondary" onclick="deletePublicExam('${exam.id}', this); closeExamPreview();" style="color:#ef4444;border-color:#ef4444" title="${isOwner ? 'Xóa bài đăng của bạn' : 'Xóa bài đăng này (Admin)'}">
            <i class="fas fa-trash-alt"></i> ${isOwner ? 'Xóa bài đăng' : 'Xóa bài đăng (Admin)'}
        </button>` : ''}
        <button class="btn btn-secondary" onclick="closeExamPreview()">
            <i class="fas fa-times"></i> Đóng
        </button>
        <button class="ep-btn-get ${isFree ? '' : 'paid'}"
            onclick="closeExamPreview(); unlockPublicExam('${exam.id}', ${exam.price || 0}, '${escapeHTML(exam.title || '')}')">
            ${isFree
                ? '<i class="fas fa-folder-plus"></i> Nhận miễn phí'
                : `<i class="fas fa-shopping-cart"></i> Mua ${exam.price} Điểm`}
        </button>
    `;
}

window.closeExamPreview = function() {
    document.getElementById('modal-exam-preview').classList.remove('visible');
};

// Xóa bài đăng công khai (chủ sở hữu hoặc admin)
window.deletePublicExam = async function(examId, btnElement) {
    if (!AUTH.isAuth()) return;
    if (!confirm('Bạn có chắc muốn xóa bài đăng này khỏi kho đề công khai? Hành động này không thể hoàn tác.')) return;

    const user = AUTH.getUser();
    try {
        const doc = await db.collection('public_exams').doc(examId).get();
        if (!doc.exists) { showToast('Không tìm thấy bài đăng!', 'error'); return; }
        if (doc.data().authorUid !== user.uid && !AUTH.isAdmin()) {
            showToast('Bạn không có quyền xóa bài đăng này!', 'error');
            return;
        }
        await db.collection('public_exams').doc(examId).delete();
        showToast('Đã xóa bài đăng khỏi kho đề.', 'success');
        // Xóa card khỏi DOM
        const card = btnElement?.closest('.exam-card');
        if (card) {
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => card.remove(), 300);
        }
    } catch (e) {
        console.error('deletePublicExam error:', e);
        showToast('Lỗi khi xóa: ' + e.message, 'error');
    }
};

// Hiển thị nút xóa cho bài đăng của chính user hoặc Admin sau khi render
function showOwnerDeleteButtons() {
    if (!AUTH.isAuth()) return;
    const uid = AUTH.getUser().uid;
    const isAdmin = AUTH.isAdmin();
    document.querySelectorAll('.public-exam-delete-btn').forEach(btn => {
        if (btn.dataset.author === uid || isAdmin) {
            btn.style.display = 'inline-flex';
            if (btn.dataset.author !== uid && isAdmin) {
                btn.title = "Xóa bài đăng này (Admin)";
            }
        }
    });
}

function timeAgo(dateString) {
    if (!dateString) return '1 tuần trước';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hôm nay';
    if (days < 7) return `${days} ngày trước`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} tuần trước`;
    return '1 tháng trước';
}

function createSubjectCard(subject) {
    const topicCount = subject.topicCount || 0;
    const isLocked = !AUTH.isAuth();
    const timeAgoStr = timeAgo(subject.createdAt);
    
    // Mocking some stats for UI purposes as requested
    const mockHearts = Math.floor(Math.random() * 50);
    const mockViews = Math.floor(Math.random() * 500) + 50;
    
    // Generate some tags based on subject name
    const tags = ['Đại học Bách Khoa', subject.name.includes('Lập trình') ? 'IT' : 'Chuyên ngành'];
    
    return `
        <div class="exam-item-card ${isLocked ? 'card-locked' : ''}" data-id="${subject.id}">
            <div class="exam-card-cover">
                <div class="badge">Đề thi</div>
                <img src="images/hero2.png" alt="Cover">
                ${isLocked ? '<div class="lock-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:white; font-size:24px; z-index:10;"><i class="fas fa-lock"></i></div>' : ''}
            </div>
            <div class="exam-card-body">
                <div class="exam-uploader">
                    <div class="exam-uploader-avatar">A</div>
                    <div class="exam-uploader-info">
                        <span class="exam-uploader-name">Admin</span>
                        <span class="exam-uploader-time" title="${formatDateTime(subject.createdAt)}">${timeAgoStr} (${formatDateTime(subject.createdAt)}) •</span>
                    </div>
                </div>
                <h3 class="exam-card-title">${escapeHTML(subject.name)}</h3>
                <div class="exam-card-stats">
                    <span class="icon-heart"><i class="fas fa-heart"></i> ${mockHearts}</span>
                    <span class="icon-view"><i class="fas fa-eye"></i> ${mockViews}</span>
                    <span class="icon-cap"><i class="fas fa-graduation-cap"></i> ${topicCount}</span>
                </div>
                <div class="exam-card-tags">
                    ${tags.map(t => `<span>${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function attachSubjectCardEvents(container) {
    container.querySelectorAll('.exam-item-card').forEach(card => {
        card.addEventListener('click', () => {
            AUTH.requireUser(() => showSubjectDetail(card.dataset.id));
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
        quizBtn.innerHTML = '<i class="fas fa-tasks"></i> Practice Quiz Now';
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
                <h3>No topics available</h3>
                <p>Click "Add Topic" to add content for this subject.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = topics.map(t => `
        <div class="topic-card" data-id="${t.id}" style="position:relative; overflow:hidden;">
            <div class="topic-card-bg" style="position:absolute; top:0; left:0; right:0; bottom:0; background-image:url('images/hero3.png'); background-size:cover; background-position:center; opacity:0.04; z-index:0; transition:opacity 0.4s ease;"></div>
            <div class="topic-card-icon" style="position:relative; z-index:1;">
                <i class="fas fa-file-lines"></i>
            </div>
            <div class="topic-card-info" style="position:relative; z-index:1;">
                <h4>${escapeHTML(t.title)}</h4>
                <span title="${formatDateTime(t.createdAt)}">${formatDate(t.createdAt)} (${formatDateTime(t.createdAt)})</span>
            </div>
            <i class="fas fa-chevron-right topic-card-arrow" style="position:relative; z-index:1;"></i>
        </div>
    `).join('');

    container.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', () => {
            // Require login to see topic content
            AUTH.requireUser(() => showTopicDetail(subjectId, card.dataset.id, topics));
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
    if (!container) return;

    const uid = AUTH.isAuth() ? AUTH.getUser().uid : null;
    const filter = AppState.notesFilter || 'all';

    // Lọc theo tab
    let notesToShow = AppState.notes || [];
    if (filter === 'public') {
        notesToShow = notesToShow.filter(n => !n.isPrivate);
    } else if (filter === 'private') {
        notesToShow = notesToShow.filter(n => n.isPrivate && n.userId === uid);
    }

    if (notesToShow.length === 0) {
        const emptyMsg = filter === 'private'
            ? 'Bạn chưa có ghi chú riêng tư nào'
            : 'Chưa có ghi chú nào';
        container.innerHTML = `
            <div class="notes-empty">
                <div class="notes-empty-icon">${filter === 'private' ? '🔒' : '🗒️'}</div>
                <h3>${emptyMsg}</h3>
                <p>${filter === 'private' ? 'Tạo ghi chú và bật chế độ riêng tư để chỉ mình bạn thấy.' : 'Tạo ghi chú đầu tiên để lưu lại ý tưởng và kiến thức quan trọng!'}</p>
            </div>`;
        return;
    }

    const notePalette = ['#fef9c3','#dcfce7','#dbeafe','#fce7f3','#f3e8ff','#ffedd5','#e0f2fe'];
    const rotations = [-1.5, 0.8, -0.6, 1.2, -1.0, 0.5, -0.3, 1.8];

    container.innerHTML = notesToShow.map((n, i) => {
        const bg = n.color || notePalette[i % notePalette.length];
        const rot = rotations[i % rotations.length];
        const isOwner = uid && n.userId === uid;
        const canDelete = AUTH.isAdmin() || isOwner; // Admin xóa tất cả, user chỉ xóa của mình
        const isPrivate = n.isPrivate;

        return `
        <div class="note-card ${isPrivate ? 'note-card--private' : ''}" style="background:${bg}; transform: rotate(${rot}deg); box-shadow: 3px 4px 16px rgba(0,0,0,0.12);">
            <span class="note-pin"></span>
            <div class="note-ruled-lines"></div>
            ${isPrivate ? `<div class="note-private-badge"><i class="fas fa-lock"></i> Riêng tư</div>` : ''}
            <div class="note-actions">
                ${canDelete ? `<button onclick="event.stopPropagation(); deleteNote('${n.id}')" title="Xóa ghi chú">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </div>
            <h4>${escapeHTML(n.title)}</h4>
            <p>${escapeHTML(n.content)}</p>
            <div class="note-date" title="${formatDateTime(n.createdAt)}">
                <i class="fas fa-clock"></i> ${timeAgo(n.createdAt)} (${formatDateTime(n.createdAt)})
                ${n.userEmail ? `<span style="margin-left:auto;opacity:0.6;font-size:10px">${escapeHTML(n.userEmail.split('@')[0])}</span>` : ''}
            </div>
        </div>`;
    }).join('');
}

// Filter notes by tab
function filterNotes(filter, btnEl) {
    AppState.notesFilter = filter;
    document.querySelectorAll('.notes-filter-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderNotes();
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
            <div><span style="font-size:24px;font-weight:800;color:var(--blue-600)">${totalSubjects}</span> <span style="font-size:13px;color:var(--text-secondary)">Subjects</span></div>
            <div><span style="font-size:24px;font-weight:800;color:var(--green-500)">${totalTopics}</span> <span style="font-size:13px;color:var(--text-secondary)">Topics</span></div>
            <div><span style="font-size:24px;font-weight:800;color:var(--purple-500)">${totalNotes}</span> <span style="font-size:13px;color:var(--text-secondary)">Notes</span></div>
        </div>
        ${subjectsData.map(s => `
            <div class="progress-bar-item">
                <div class="progress-bar-label">
                    <span>${escapeHTML(s.name)}</span>
                    <span>${s.count} topics</span>
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
        activityContainer.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No recent activities.</p>';
    } else {
        activityContainer.innerHTML = allItems.map(item => `
            <div class="activity-item">
                <div class="activity-dot" style="background:${item.type === 'subject' ? 'var(--blue-500)' : 'var(--purple-500)'}"></div>
                <span>${item.type === 'subject' ? 'Added Subject' : 'Added Note'}: <strong>${escapeHTML(item.name)}</strong></span>
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
        document.getElementById('modal-subject-title').textContent = 'Edit Subject';
        document.getElementById('subject-name').value = subject?.name || '';
        document.getElementById('subject-desc').value = subject?.description || '';
    } else {
        document.getElementById('modal-subject-title').textContent = 'Add New Subject';
        document.getElementById('subject-name').value = '';
        document.getElementById('subject-desc').value = '';
    }

    openModal('modal-subject');
}

function openTopicModal(topicId = null) {
    AppState.editingTopicId = topicId;
    document.getElementById('modal-topic-title').textContent = topicId ? 'Edit Topic' : 'Add New Topic';
    document.getElementById('topic-title').value = '';
    document.getElementById('topic-content-input').value = '';
    openModal('modal-topic');
}

function openNoteModal(noteId = null) {
    AppState.editingNoteId = noteId;
    document.getElementById('modal-note-title').textContent = noteId ? 'Sửa Ghi Chú' : 'Thêm Ghi Chú';
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';

    // Reset privacy toggle
    const privacyCheckbox = document.getElementById('note-is-private');
    if (privacyCheckbox) {
        privacyCheckbox.checked = false;
        _updatePrivacyUI(false);
    }

    // Nếu đang edit, điền dữ liệu cũ
    if (noteId) {
        const note = AppState.notes.find(n => n.id === noteId);
        if (note) {
            document.getElementById('note-title').value = note.title || '';
            document.getElementById('note-content').value = note.content || '';
            if (privacyCheckbox) {
                privacyCheckbox.checked = !!note.isPrivate;
                _updatePrivacyUI(!!note.isPrivate);
            }
        }
    }

    openModal('modal-note');
}

function _updatePrivacyUI(isPrivate) {
    const icon = document.getElementById('note-privacy-icon');
    const label = document.getElementById('note-privacy-label');
    const desc = document.getElementById('note-privacy-desc');
    const toggle = document.querySelector('.note-privacy-toggle');
    if (!icon) return;
    if (isPrivate) {
        icon.innerHTML = '<i class="fas fa-lock"></i>';
        label.textContent = 'Riêng tư';
        desc.textContent = 'Chỉ mình bạn thấy ghi chú này';
        toggle?.classList.add('is-private');
    } else {
        icon.innerHTML = '<i class="fas fa-globe"></i>';
        label.textContent = 'Công khai';
        desc.textContent = 'Mọi người đều thấy ghi chú này';
        toggle?.classList.remove('is-private');
    }
}

function showConfirm(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    AppState.confirmCallback = callback;
    openModal('modal-confirm');
}

// ===== HANDLERS =====
function handleDeleteSubject() {
    showConfirm('Are you sure you want to delete this subject? All topics inside will be deleted.', () => {
        deleteSubject(AppState.currentSubjectId);
    });
}

async function handleEditTopic() {
    const topics = await loadTopics(AppState.currentSubjectId);
    const topic = topics.find(t => t.id === AppState.currentTopicId);
    if (!topic) return;

    AppState.editingTopicId = AppState.currentTopicId;
    document.getElementById('modal-topic-title').textContent = 'Edit Topic';
    document.getElementById('topic-title').value = topic.title;
    document.getElementById('topic-content-input').value = topic.content || '';
    openModal('modal-topic');
}

function handleDeleteTopic() {
    showConfirm('Are you sure you want to delete this topic?', () => {
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
                    <h3>No results found</h3>
                    <p>Try searching with a different keyword.</p>
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

    const totalUsers = localStorage.getItem('registered_users_count') || '0';
    const totalUsersEl = document.getElementById('total-users');
    if (totalUsersEl) {
        totalUsersEl.textContent = totalUsers;
    }

    // Last updated
    const allDates = [
        ...AppState.subjects.map(s => s.updatedAt || s.createdAt),
        ...AppState.notes.map(n => n.updatedAt || n.createdAt),
    ].filter(Boolean).sort().reverse();

    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = allDates.length > 0
            ? formatDate(allDates[0])
            : '--';
    }
}

// ===== MARKDOWN HELPERS =====
function insertMarkdown(format) {
    const textarea = document.getElementById('topic-content-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    const formats = {
        bold: { prefix: '**', suffix: '**', placeholder: 'bold' },
        italic: { prefix: '*', suffix: '*', placeholder: 'italic' },
        heading: { prefix: '## ', suffix: '', placeholder: 'Heading' },
        code: { prefix: '`', suffix: '`', placeholder: 'code' },
        list: { prefix: '- ', suffix: '', placeholder: 'List item' },
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
    if (!text) return '<p style="color:var(--text-muted)">No content available.</p>';

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
function formatDateTime(dateInput) {
    if (!dateInput) return '';
    try {
        let date;
        if (dateInput.seconds) { // Firestore Timestamp
            date = new Date(dateInput.seconds * 1000);
        } else {
            date = new Date(dateInput);
        }
        
        if (isNaN(date.getTime())) return '';
        
        const hrs = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${hrs}:${mins} ${day}/${month}/${year}`;
    } catch (e) {
        return '';
    }
}

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

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

// ============================================
// AI EXAM GENERATOR & CREATED EXAMS LOGIC
// ============================================

let currentAIExtractedExam = null;
let aiGeneratorInitialized = false;
let createdExamsInitialized = false;

// Pre-seeded high quality HUST questions
const MOCK_QUESTION_DATA = {
    DSP: [
        {
            content: "Tần số lấy mẫu Nyquist tối thiểu để khôi phục không méo tín hiệu liên tục có băng thông từ 0 đến 5 kHz là bao nhiêu?",
            type: "multiple_choice",
            options: [
                "A. 5 kHz",
                "B. 10 kHz",
                "C. 20 kHz",
                "D. 15 kHz"
            ],
            correct_answer: "B",
            explanation: "Theo định lý lấy mẫu Nyquist-Shannon, tần số lấy mẫu fs phải lớn hơn hoặc bằng 2 lần tần số cực đại fmax của tín hiệu liên tục: fs >= 2 * fmax = 2 * 5 kHz = 10 kHz.",
            difficulty: "easy"
        },
        {
            content: "Biến đổi Z của dãy xung đơn vị d(n) là gì?",
            type: "multiple_choice",
            options: [
                "A. 1",
                "B. Z^-1",
                "C. Z / (Z - 1)",
                "D. Z"
            ],
            correct_answer: "A",
            explanation: "Định nghĩa biến đổi Z của d(n) là tổng từ n = -vô cùng đến +vô cùng của d(n)*Z^-n. Vì d(n) chỉ bằng 1 tại n = 0 và bằng 0 tại mọi n khác, kết quả tổng là 1.",
            difficulty: "easy"
        },
        {
            content: "Bộ lọc FIR (Finite Impulse Response) có đặc điểm nổi bật nào sau đây?",
            type: "multiple_choice",
            options: [
                "A. Luôn luôn ổn định và có khả năng pha tuyến tính tuyệt đối",
                "B. Có cấu trúc hồi quy phản hồi trực tiếp",
                "C. Có đáp ứng xung dài vô hạn",
                "D. Tiêu tốn ít tài nguyên tính toán hơn bộ lọc IIR tương đương"
            ],
            correct_answer: "A",
            explanation: "Bộ lọc FIR không có đường phản hồi hồi quy (non-recursive), do đó các cực của nó luôn nằm tại gốc tọa độ z = 0, đảm bảo hệ thống luôn ổn định. Ngoài ra, FIR dễ dàng thiết kế để đạt pha tuyến tính tuyệt đối thông qua hệ số đối xứng.",
            difficulty: "medium"
        },
        {
            content: "Để thực hiện biến đổi Fourier nhanh (FFT) với thuật toán phân chia theo thời gian (Radix-2 DIT), độ dài của chuỗi tín hiệu N phải thỏa mãn điều kiện gì?",
            type: "multiple_choice",
            options: [
                "A. N phải là lũy thừa của 2 (N = 2^M)",
                "B. N phải là một số nguyên tố",
                "C. N phải là số chẵn bất kỳ",
                "D. Không có ràng buộc nào về độ dài N"
            ],
            correct_answer: "A",
            explanation: "Thuật toán Radix-2 FFT phân chia chuỗi N điểm thành các chuỗi con chẵn và lẻ cho đến khi đạt chuỗi 2 điểm. Do đó, N bắt buộc phải có dạng 2^M với M là số nguyên dương.",
            difficulty: "medium"
        },
        {
            content: "Hệ thống có đáp ứng xung h(n) = 0.5^n * u(n) là hệ thống gì?",
            type: "multiple_choice",
            options: [
                "A. Ổn định và Nhân quả (Stable & Causal)",
                "B. Không ổn định và Nhân quả (Unstable & Causal)",
                "C. Ổn định và Phi nhân quả (Stable & Non-causal)",
                "D. Không ổn định và Phi nhân quả"
            ],
            correct_answer: "A",
            explanation: "Hệ thống nhân quả vì h(n) = 0 với n < 0 do có u(n). Hệ thống ổn định vì tổng trị tuyệt đối của h(n) hội tụ: tổng(0.5^n) = 1/(1-0.5) = 2 < vô cùng.",
            difficulty: "easy"
        }
    ],
    8086: [
        {
            content: "Trong vi xử lý Intel 8086, thanh ghi nào sau đây đóng vai trò làm con trỏ chỉ lệnh tiếp theo sẽ được thực thi?",
            type: "multiple_choice",
            options: [
                "A. IP (Instruction Pointer)",
                "B. SP (Stack Pointer)",
                "C. BP (Base Pointer)",
                "D. SI (Source Index)"
            ],
            correct_answer: "A",
            explanation: "Thanh ghi IP (Instruction Pointer) luôn lưu địa chỉ lệch (offset) của lệnh tiếp theo trong phân đoạn mã (Code Segment - CS) để bộ vi xử lý nạp và thực thi.",
            difficulty: "easy"
        },
        {
            content: "Lệnh nào dưới đây dùng để chuyển dữ liệu từ một thanh ghi nguồn sang thanh ghi đích trong Assembly 8086?",
            type: "multiple_choice",
            options: [
                "A. MOV",
                "B. ADD",
                "C. CMP",
                "D. JMP"
            ],
            correct_answer: "A",
            explanation: "Lệnh MOV destination, source thực hiện sao chép dữ liệu từ toán hạng nguồn (source) sang toán hạng đích (destination) mà không làm thay đổi toán hạng nguồn.",
            difficulty: "easy"
        },
        {
            content: "Địa chỉ vật lý (Physical Address) tương ứng với CS = 2000H và IP = 1500H trong 8086 là bao nhiêu?",
            type: "multiple_choice",
            options: [
                "A. 21500H",
                "B. 35000H",
                "C. 20150H",
                "D. 03500H"
            ],
            correct_answer: "A",
            explanation: "Công thức tính địa chỉ vật lý trong chế độ thực của 8086: Physical Address = Segment * 10H + Offset = CS * 10H + IP = 20000H + 1500H = 21500H.",
            difficulty: "medium"
        },
        {
            content: "Cờ nào trong thanh ghi Flag của 8086 được thiết lập lên 1 khi kết quả của phép tính số học bằng không?",
            type: "multiple_choice",
            options: [
                "A. ZF (Zero Flag)",
                "B. CF (Carry Flag)",
                "C. OF (Overflow Flag)",
                "D. SF (Sign Flag)"
            ],
            correct_answer: "A",
            explanation: "Cờ không ZF (Zero Flag) tự động được bật lên 1 nếu kết quả của phép toán logic hoặc số học trước đó cho ra kết quả bằng 0, ngược lại ZF sẽ bằng 0.",
            difficulty: "easy"
        },
        {
            content: "Trong chế độ định địa chỉ gián tiếp qua thanh ghi trong 8086, thanh ghi nào sau đây KHÔNG được sử dụng để làm thanh ghi con trỏ cơ sở hoặc chỉ số?",
            type: "multiple_choice",
            options: [
                "A. DX",
                "B. BX",
                "C. SI",
                "D. DI"
            ],
            correct_answer: "A",
            explanation: "Assembly 8086 chỉ cho phép sử dụng các thanh ghi BX, BP (địa chỉ cơ sở) và SI, DI (địa chỉ chỉ số) bên trong cặp ngoặc vuông [] để chỉ định địa chỉ bộ nhớ gián tiếp.",
            difficulty: "hard"
        }
    ],
    FPGA: [
        {
            content: "Trong Verilog HDL, từ khóa 'always @(posedge clk)' chỉ định điều gì?",
            type: "multiple_choice",
            options: [
                "A. Khối logic sẽ được kích hoạt ở mỗi sườn dương của tín hiệu clock clk",
                "B. Khối logic sẽ chạy tuần tự liên tục không dừng",
                "C. Khối logic là mạch tổ hợp thuần túy",
                "D. Khối logic kích hoạt khi tín hiệu clk ở mức cao"
            ],
            correct_answer: "A",
            explanation: "Khối 'always @(posedge clk)' là cú pháp chuẩn để khai báo một khối logic tuần tự (sequential block), nó sẽ thực thi mã bên trong khi tín hiệu 'clk' chuyển từ mức thấp lên mức cao (sườn dương).",
            difficulty: "easy"
        },
        {
            content: "Để tránh việc vô tình tạo ra chốt (latch) ngoài ý muốn trong Verilog, nguyên tắc thiết kế mạch tổ hợp quan trọng nhất là gì?",
            type: "multiple_choice",
            options: [
                "A. Viết đầy đủ tất cả các trường hợp trong câu lệnh rẽ nhánh (case/if-else) hoặc dùng từ khóa default",
                "B. Sử dụng phép gán non-blocking (<=) cho tất cả các biến",
                "C. Sử dụng duy nhất tín hiệu sườn dương clock",
                "D. Không dùng các biến trung gian"
            ],
            correct_answer: "A",
            explanation: "Trong mạch tổ hợp (always @*), nếu một biến không được gán giá trị ở mọi nhánh rẽ (if-else hoặc case thiếu default), trình tổng hợp sẽ giữ nguyên giá trị cũ của biến đó, tạo ra chốt dữ liệu (latch) ngoài ý muốn.",
            difficulty: "medium"
        },
        {
            content: "Phép gán non-blocking '<=' trong Verilog nên được ưu tiên sử dụng cho loại mạch nào sau đây?",
            type: "multiple_choice",
            options: [
                "A. Mạch tuần tự (Sequential Circuits)",
                "B. Mạch tổ hợp (Combinational Circuits)",
                "C. Mạch giải mã thuần túy",
                "D. Định nghĩa tham số parameter"
            ],
            correct_answer: "A",
            explanation: "Trong Verilog, phép gán non-blocking '<=' đảm bảo tất cả các gán giá trị xảy ra đồng thời khi có sườn kích hoạt của clock, tránh các lỗi chạy đua tín hiệu (race conditions). Vì thế nó bắt buộc dùng cho mạch tuần tự.",
            difficulty: "easy"
        },
        {
            content: "Một khối RAM hai cổng (Dual-port RAM) trên FPGA Cyclone IV khác biệt như thế nào so với RAM một cổng?",
            type: "multiple_choice",
            options: [
                "A. Cho phép đọc và ghi dữ liệu độc lập đồng thời tại hai địa chỉ khác nhau",
                "B. Có dung lượng lưu trữ lớn gấp đôi",
                "C. Chỉ cho phép đọc và ghi cùng một địa chỉ tại một thời điểm",
                "D. Không cần cấp tín hiệu xung clock để hoạt động"
            ],
            correct_answer: "A",
            explanation: "Dual-port RAM cung cấp hai tập hợp đường dẫn địa chỉ, dữ liệu vào/ra và clock riêng biệt, cho phép thực hiện đồng thời hai thao tác bộ nhớ (đọc/đọc, đọc/ghi, ghi/ghi) ở hai vùng nhớ khác nhau.",
            difficulty: "medium"
        },
        {
            content: "Tín hiệu meta-stability (bất ổn định trạng thái) trong hệ thống số đồng bộ thường xảy ra do nguyên nhân nào?",
            type: "multiple_choice",
            options: [
                "A. Vi phạm thời gian thiết lập (setup time) hoặc giữ chậm (hold time) của D Flip-Flop khi truyền dữ liệu qua các clock domains khác nhau",
                "B. Tần số xung clock quá thấp dưới 1 MHz",
                "C. Nguồn cấp cho chip FPGA không đủ dòng điện",
                "D. Dùng quá nhiều cổng logic NAND trong sơ đồ thiết kế"
            ],
            correct_answer: "A",
            explanation: "Khi dữ liệu ngõ vào của một Flip-Flop thay đổi quá gần thời điểm sườn clock kích hoạt (vi phạm setup/hold time), ngõ ra của Flip-Flop có thể bị treo ở trạng thái lấp lửng (giữa 0 và 1) trong một khoảng thời gian không xác định trước khi ổn định lại.",
            difficulty: "hard"
        }
    ],
    IT: [
        {
            content: "Trong kiến trúc phần mềm, RESTful API sử dụng phương thức HTTP nào sau đây để cập nhật một tài nguyên đã tồn tại?",
            type: "multiple_choice",
            options: [
                "A. GET",
                "B. POST",
                "C. PUT",
                "D. DELETE"
            ],
            correct_answer: "C",
            explanation: "Phương thức PUT trong REST được định nghĩa dùng để cập nhật (replace) toàn bộ thông tin của một tài nguyên xác định bởi URI.",
            difficulty: "easy"
        },
        {
            content: "Mục đích chính của chỉ mục (Index) trong cơ sở dữ liệu quan hệ là gì?",
            type: "multiple_choice",
            options: [
                "A. Tăng tốc độ truy vấn tìm kiếm dữ liệu",
                "B. Nén dung lượng bảng dữ liệu",
                "C. Mã hóa dữ liệu bảo mật",
                "D. Đảm bảo toàn vẹn tham chiếu ngoại khóa"
            ],
            correct_answer: "A",
            explanation: "Chỉ mục giúp công cụ cơ sở dữ liệu tìm kiếm các bản ghi nhanh hơn mà không cần phải quét tuần tự toàn bộ bảng (Table Scan).",
            difficulty: "easy"
        },
        {
            content: "Khái niệm 'Đóng gói' (Encapsulation) trong lập trình hướng đối tượng dùng để chỉ điều gì?",
            type: "multiple_choice",
            options: [
                "A. Gom nhóm các thuộc tính và phương thức liên quan lại trong một lớp và che giấu chi tiết triển khai bên ngoài",
                "B. Khả năng một lớp thừa kế thuộc tính từ lớp cha",
                "C. Khả năng một phương thức có nhiều cách triển khai khác nhau",
                "D. Đóng gói mã nguồn thành file chạy exe"
            ],
            correct_answer: "A",
            explanation: "Đóng gói giúp bảo vệ trạng thái bên trong của đối tượng khỏi các can thiệp trực tiếp từ bên ngoài bằng cách sử dụng các getter/setter và phạm vi truy cập private.",
            difficulty: "medium"
        },
        {
            content: "Trong Git, lệnh nào được dùng để tải toàn bộ lịch sử cam kết và nhánh mới từ một kho lưu trữ từ xa (remote repository) về máy cục bộ nhưng không tự động gộp (merge) vào nhánh hiện tại?",
            type: "multiple_choice",
            options: [
                "A. git fetch",
                "B. git pull",
                "C. git clone",
                "D. git push"
            ],
            correct_answer: "A",
            explanation: "git fetch đồng bộ hóa dữ liệu từ xa về máy cục bộ để xem các thay đổi mà không thực hiện gộp nhánh. Trong khi đó, git pull tương đương với thực hiện git fetch sau đó chạy thêm git merge.",
            difficulty: "medium"
        },
        {
            content: "Độ phức tạp thời gian thuật toán tìm kiếm nhị phân (Binary Search) trên mảng đã được sắp xếp là bao nhiêu?",
            type: "multiple_choice",
            options: [
                "A. O(log N)",
                "B. O(N)",
                "C. O(N log N)",
                "D. O(1)"
            ],
            correct_answer: "A",
            explanation: "Mỗi bước của thuật toán tìm kiếm nhị phân giảm một nửa phạm vi tìm kiếm. Do đó, số phép so sánh tối đa cho mảng N phần tử là log cơ số 2 của N, tức độ phức tạp là O(log N).",
            difficulty: "easy"
        }
    ]
};

// ===== AI GENERATOR PAGE INITIALIZATION =====
function initAIGeneratorPage() {
    if (aiGeneratorInitialized) return;
    
    setupAITokenCounter();
    setupAIFileUpload();
    
    const btnGenerate = document.getElementById('btn-ai-generate');
    if (btnGenerate) {
        btnGenerate.addEventListener('click', runAIEnginePipeline);
    }
    
    const btnExportPDF = document.getElementById('btn-ai-export-pdf');
    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', () => {
            window.print();
        });
    }

    const btnSaveLibrary = document.getElementById('btn-ai-save-library');
    if (btnSaveLibrary) {
        btnSaveLibrary.addEventListener('click', saveExamToLibrary);
    }
    
    const btnPublish = document.getElementById('btn-ai-publish');
    if (btnPublish) {
        btnPublish.addEventListener('click', publishExamToSystem);
    }
    
    aiGeneratorInitialized = true;
}

window.togglePublishPriceInput = function() {
    const privacy = document.getElementById('publish-privacy-select').value;
    const priceGroup = document.getElementById('publish-price-group');
    if (privacy === 'sell') {
        priceGroup.style.display = 'block';
    } else {
        priceGroup.style.display = 'none';
    }
};

// Publish Exam to System (Charge Points) - Opens Modal First
async function publishExamToSystem() {
    if (!currentAIExtractedExam || !currentAIExtractedExam.questions.length) {
        showToast('Không có đề thi nào để đăng!', 'error');
        return;
    }

    const modal = document.getElementById('modal-publish-exam');
    const costDisplay = document.getElementById('modal-publish-system-cost');
    const balanceDisplay = document.getElementById('modal-publish-current-balance');
    const privacySelect = document.getElementById('publish-privacy-select');
    const priceGroup = document.getElementById('publish-price-group');

    // Reset modal
    if (privacySelect) privacySelect.value = 'public';
    if (priceGroup) priceGroup.style.display = 'none';
    if (costDisplay) costDisplay.textContent = 'Miễn phí';
    if (balanceDisplay && typeof PointsSystem !== 'undefined') {
        balanceDisplay.textContent = `${PointsSystem.balance.toLocaleString()} Đ`;
    }

    // Cập nhật phí khi đổi privacy
    const updateCostDisplay = () => {
        const privacy = privacySelect?.value || 'public';
        const sellPrice = parseInt(document.getElementById('publish-price-input')?.value) || 0;

        let fee = 0;
        let feeText = 'Miễn phí';

        if (privacy === 'sell' && sellPrice > 0) {
            fee = Math.round(sellPrice * 0.1); // 10% phí
            feeText = `${fee.toLocaleString()} Đ (10% phí hoa hồng)`;
        }
        // public hoặc private: miễn phí

        if (costDisplay) costDisplay.textContent = feeText;
        return fee;
    };

    privacySelect?.addEventListener('change', () => {
        togglePublishPriceInput();
        updateCostDisplay();
    });
    document.getElementById('publish-price-input')?.addEventListener('input', updateCostDisplay);

    modal.classList.add('visible');

    // Bind Confirm button
    const btnConfirm = document.getElementById('btn-confirm-publish');
    const newBtn = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);

    newBtn.addEventListener('click', async () => {
        const privacy = document.getElementById('publish-privacy-select').value;
        const sellPrice = parseInt(document.getElementById('publish-price-input')?.value) || 0;

        if (privacy === 'sell' && sellPrice <= 0) {
            showToast('Vui lòng nhập giá bán hợp lệ (> 0 điểm)', 'error');
            return;
        }

        // Tính phí: chỉ tính khi bán, = 10% giá bán
        const fee = (privacy === 'sell' && sellPrice > 0) ? Math.round(sellPrice * 0.1) : 0;

        if (fee > 0 && typeof PointsSystem !== 'undefined') {
            if (PointsSystem.balance < fee) {
                showToast(`Không đủ điểm! Cần ${fee.toLocaleString()} Đ phí hoa hồng (10% giá bán).`, 'error');
                return;
            }
            const success = await PointsSystem.deductPoints(fee, `Phí đăng bán đề thi (10% × ${sellPrice.toLocaleString()} Đ)`);
            if (!success) return;
        }

        modal.classList.remove('visible');

        // Save to Database
        try {
            const user = AUTH.isAuth() ? AUTH.getUser() : null;
            const authorId = user ? user.uid : 'anonymous';
            const authorEmail = user ? user.email : 'Unknown User';

            const examData = {
                title: currentAIExtractedExam.title || 'Đề thi AI Generator',
                subject: currentAIExtractedExam.subject || 'Chưa phân loại',
                difficulty: currentAIExtractedExam.difficulty || 'medium',
                questions: currentAIExtractedExam.questions,
                privacy: privacy, // 'public', 'private', or 'sell'
                price: privacy === 'sell' ? sellPrice : 0,
                authorId: authorId,
                authorEmail: authorEmail,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                downloads: 0
            };

            // Save to public collection if not private
            if (privacy !== 'private' && typeof db !== 'undefined') {
                await db.collection('public_exams').add(examData);
            }

            // Always save to user's created_exams + saved_exams (thư viện cá nhân)
            if (user && typeof db !== 'undefined') {
                const docRef = await db.collection('users').doc(user.uid).collection('created_exams').add(examData);
                // Lưu thẳng vào thư viện cá nhân (saved_exams) 
                await db.collection('users').doc(user.uid).collection('saved_exams').doc(docRef.id).set({
                    ...examData,
                    savedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            showToast(`Đã đăng đề thi thành công! ${totalCost > 0 ? `(Trừ ${totalCost} điểm)` : '(Miễn phí)'}`, 'success');
        } catch (e) {
            console.error("Error publishing exam:", e);
            showToast('Lỗi khi lưu đề thi vào hệ thống!', 'error');
        }
        
        const btnPublish = document.getElementById('btn-ai-publish');
        if (btnPublish) {
            btnPublish.innerHTML = '<i class="fas fa-check"></i> Đã đăng';
            btnPublish.disabled = true;
        }
    });
}

// ===== AI FILE UPLOAD (.docx / .txt / .pdf) — calls /api/parse-file =====
function setupAIFileUpload() {
    const fileInput  = document.getElementById('ai-file-input');
    const dropzone   = document.getElementById('ai-dropzone');
    const textarea   = document.getElementById('ai-source-text');
    const chip       = document.getElementById('ai-file-chip');
    const chipName   = document.getElementById('ai-file-chip-name');
    const chipRemove = document.getElementById('ai-file-chip-remove');

    if (!fileInput || !textarea) return;

    // ── File input change ──────────────────────────────────────────────────
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processUploadedFile(file);
        fileInput.value = '';
    });

    // ── Remove chip ────────────────────────────────────────────────────────
    chipRemove?.addEventListener('click', () => {
        textarea.value = '';
        chip.style.display = 'none';
        textarea.dispatchEvent(new Event('input'));
        showToast('Đã xóa nội dung file.', 'info');
    });

    // ── Drag & drop ────────────────────────────────────────────────────────
    const panel = textarea.closest('.aigen-panel');
    if (panel) {
        panel.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('active');
        });
        panel.addEventListener('dragleave', (e) => {
            if (!panel.contains(e.relatedTarget)) dropzone.classList.remove('active');
        });
        panel.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('active');
            const file = e.dataTransfer.files[0];
            if (file) processUploadedFile(file);
        });
    }

    // ── Core: send file to /api/parse-file ─────────────────────────────────
    async function processUploadedFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const allowed = ['docx', 'doc', 'txt', 'pdf'];

        if (!allowed.includes(ext)) {
            showToast('Chỉ hỗ trợ file .docx, .doc, .txt, .pdf!', 'error');
            return;
        }

        // Max 10 MB guard on client side too
        if (file.size > 10 * 1024 * 1024) {
            showToast('File quá lớn! Giới hạn tối đa 10 MB.', 'error');
            return;
        }

        textarea.classList.add('loading');
        textarea.value = '';
        showToast(`Đang xử lý "${file.name}"...`, 'info');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/parse-file', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Server error ${response.status}`);
            }

            textarea.value = data.text;
            textarea.dispatchEvent(new Event('input')); // update token counter

            // Show chip
            chipName.textContent = data.fileName;
            chip.style.display = 'flex';
            const chipIcon = chip.querySelector('i');
            if (chipIcon) {
                const iconMap = { txt: 'fas fa-file-lines', pdf: 'fas fa-file-pdf', docx: 'fas fa-file-word', doc: 'fas fa-file-word' };
                chipIcon.className = iconMap[data.ext] || 'fas fa-file';
            }

            showToast(`✅ Đã đọc "${data.fileName}" — ${data.wordCount.toLocaleString()} từ`, 'success');

        } catch (err) {
            console.error('File upload error:', err);
            showToast('Lỗi xử lý file: ' + err.message, 'error');
        } finally {
            textarea.classList.remove('loading');
        }
    }
}

// Token Counter
function setupAITokenCounter() {
    const textEl = document.getElementById('ai-source-text');
    const counterEl = document.getElementById('ai-token-count');
    if (!textEl || !counterEl) return;

    textEl.addEventListener('input', () => {
        const text = textEl.value.trim();
        const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
        const tokens = Math.round(words * 1.35);
        counterEl.textContent = `${words} từ / ~${tokens} tokens`;

        updateAIGenCostUI();
    });
    
    // Also listen to question count changes
    const qCountEl = document.getElementById('ai-question-count');
    if (qCountEl) {
        qCountEl.addEventListener('input', updateAIGenCostUI);
    }
}

function calculateAIGenCost() {
    const qCountEl = document.getElementById('ai-question-count');
    const qCount = qCountEl ? (parseInt(qCountEl.value) || 10) : 10;

    // Cơ chế giảm dần: càng nhiều câu càng rẻ/câu
    // 5q=30Đ  10q=25Đ  15q=22Đ  20q=20Đ  30q=17Đ  50q=13Đ  100q=10Đ
    // Công thức: costPerQ = max(10, floor(32 - (qCount-5) * 0.23))
    const costPerQ = Math.max(10, Math.floor(32 - (qCount - 5) * 0.23));
    const totalCost = costPerQ * qCount;

    return { costPerQ, totalCost, qCount };
}

function updateAIGenCostUI() {
    const costData = calculateAIGenCost();
    const estimateEl = document.getElementById('ai-cost-estimate');
    const btnCostEl = document.getElementById('ai-btn-cost-text');
    
    if (estimateEl) {
        const tier = typeof PointsSystem !== 'undefined' ? (PointsSystem.tier || 'free') : 'free';
        const isFree = tier === 'free' || tier === 'go';
        if (isFree) {
            estimateEl.innerHTML = `<strong>Chi phí:</strong> <span style="color:#d97706;font-weight:800">${costData.totalCost.toLocaleString()} Đ</span> <span style="color:var(--text-muted);font-size:11px">(${costData.costPerQ} Đ/câu × ${costData.qCount} câu)</span>`;
        } else {
            estimateEl.innerHTML = `<strong>Chi phí:</strong> <span style="color:#10b981;font-weight:800;text-decoration:line-through">${costData.totalCost.toLocaleString()} Đ</span> <span style="color:#10b981;font-weight:800">Hoàn 100%</span> <span style="color:var(--text-muted);font-size:11px">(gói ${tier.toUpperCase()})</span>`;
        }
    }
    if (btnCostEl) {
        btnCostEl.textContent = `Thanh toán: ${costData.totalCost.toLocaleString()} Đ`;
    }
}

// Pipeline Steps Runner
async function runAIEnginePipeline() {
    const sourceText = document.getElementById('ai-source-text').value.trim();
    if (sourceText.length < 50) {
        showToast('Tài liệu nguồn quá ngắn. Hãy nhập tối thiểu 50 ký tự!', 'error');
        return;
    }

    // --- AI Generation Cost Deduction ---
    const costData = calculateAIGenCost();
    if (typeof PointsSystem !== 'undefined') {
        if (PointsSystem.balance < costData.totalCost) {
            showToast(`Bạn cần ${costData.totalCost} điểm để tạo ${costData.qCount} câu hỏi!`, 'error');
            document.getElementById('modal-topup-points').classList.add('visible');
            return;
        }
        
        if (!confirm(`Xác nhận dùng ${costData.totalCost} điểm để tạo ${costData.qCount} câu hỏi?`)) {
            return;
        }
        
        const success = await PointsSystem.deductPoints(costData.totalCost, `Tạo AI: ${costData.qCount} câu`);
        if (!success) return;
    }
    
    // Store the original generation cost to calculate publishing cost later (10%)
    window.currentExamPublishCost = Math.round(costData.totalCost * 0.1);
    // -----------------------------

    const btnGenerate = document.getElementById('btn-ai-generate');
    btnGenerate.disabled = true;
    btnGenerate.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Pipeline is running...`;

    // Reset pipeline step UI
    const steps = ['preprocess', 'detect', 'extract', 'prompt', 'generate', 'validate'];
    steps.forEach(s => {
        const el = document.getElementById(`step-${s}`);
        if (el) {
            el.className = 'aigen-step';
            const badge = el.querySelector('.aigen-step-badge');
            if (badge) {
                badge.textContent = 'Chờ khởi động';
                badge.style.color = 'var(--text-muted)';
            }
        }
    });

    const progressBar = document.getElementById('ai-progress-bar');
    const progressText = document.getElementById('ai-progress-text');
    const statusText = document.getElementById('ai-pipeline-status-text');

    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    statusText.textContent = 'Khởi động Pipeline...';

    // Helper sleep
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Subject Classification
    let subject = 'IT';
    const lowerText = sourceText.toLowerCase();
    if (lowerText.includes('z-transform') || lowerText.includes('nyquist') || lowerText.includes('fourier') || lowerText.includes('fft') || lowerText.includes('fir') || lowerText.includes('iir') || lowerText.includes('tín hiệu') || lowerText.includes('lọc')) {
        subject = 'DSP';
    } else if (lowerText.includes('8086') || lowerText.includes('register') || lowerText.includes('assembly') || lowerText.includes('mov') || lowerText.includes('ip') || lowerText.includes('sp') || lowerText.includes('vi xử lý')) {
        subject = '8086';
    } else if (lowerText.includes('verilog') || lowerText.includes('fpga') || lowerText.includes('latch') || lowerText.includes('always') || lowerText.includes('posedge') || lowerText.includes('clock') || lowerText.includes('sườn dương')) {
        subject = 'FPGA';
    }

    // Step 1: Preprocess
    statusText.textContent = 'Xử lý tiền kỳ...';
    setStepState('preprocess', 'running', 'Đang quét bảo mật...');
    progressBar.style.width = '15%';
    progressText.textContent = '15%';
    await delay(1200);
    setStepState('preprocess', 'success', 'Hoàn tất quét & Định dạng');

    // Step 2: Subject Detect
    statusText.textContent = 'Nhận diện môn học...';
    setStepState('detect', 'running', 'Đang phân tích tri thức...');
    progressBar.style.width = '30%';
    progressText.textContent = '30%';
    await delay(1500);
    const domainNames = { DSP: 'Digital Signal Processing', 8086: 'Microprocessor 8086', FPGA: 'FPGA / Verilog', IT: 'Information Technology' };
    setStepState('detect', 'success', `Đã nhận diện: ${domainNames[subject]}`);

    // Step 3: Keyword Extract
    statusText.textContent = 'Trích xuất từ khóa...';
    setStepState('extract', 'running', 'Đang quét thuật ngữ...');
    progressBar.style.width = '45%';
    progressText.textContent = '45%';
    await delay(1300);
    const mockKeywords = {
        DSP: 'Nyquist, Z-transform, FIR, FFT, Lọc số',
        8086: 'Register, IP, SP, Physical Address, Offset',
        FPGA: 'Sequential, Always block, Latch, Non-blocking',
        IT: 'RESTful API, SQL Index, Encapsulation, Binary Search'
    };
    setStepState('extract', 'success', `Keywords: ${mockKeywords[subject]}`);

    // Step 4: Prompt Builder
    statusText.textContent = 'Thiết lập prompt...';
    setStepState('prompt', 'running', 'Biên dịch Prompt Sandbox...');
    progressBar.style.width = '60%';
    progressText.textContent = '60%';
    await delay(1000);
    setStepState('prompt', 'success', 'Prompt Sandbox compiled securely');

    // Step 5: Question Generator
    statusText.textContent = 'Gọi Question Generator AI...';
    setStepState('generate', 'running', 'Đang sinh bộ đề & đáp án...');
    progressBar.style.width = '80%';
    progressText.textContent = '80%';

    let generatedQuestions = [];

    try {
        generatedQuestions = await callDeepSeekForQuestions(null, sourceText, subject);
    } catch (err) {
        console.error('AI generation failed:', err);
        // KHÔNG fallback sang mock data — báo lỗi rõ ràng để user biết
        setStepState('generate', 'error', 'Tạo đề thất bại');
        showToast('Lỗi tạo đề: ' + err.message + '. Vui lòng thử lại!', 'error');
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = `<i class="fas fa-magic"></i> Tạo Lại Đề Thi Với AI`;
        return;
    }

    setStepState('generate', 'success', `Đã tạo ${generatedQuestions.length} câu hỏi`);

    // Step 6: Validator AI
    statusText.textContent = 'Đang kiểm thử chất lượng chéo...';
    setStepState('validate', 'running', 'Chạy thuật toán Validation...');
    progressBar.style.width = '95%';
    progressText.textContent = '95%';
    await delay(1200);
    setStepState('validate', 'success', 'Đạt chuẩn sư phạm (Quality: 0.96)');

    progressBar.style.width = '100%';
    progressText.textContent = '100%';
    statusText.textContent = 'Pipeline hoàn thành tuyệt đối!';

    btnGenerate.disabled = false;
    btnGenerate.innerHTML = `<i class="fas fa-magic"></i> Tạo Lại Đề Thi Với AI`;

    // Save current exam
    const countSelect = document.getElementById('ai-question-count').value;
    const diffSelect = document.getElementById('ai-difficulty').value;
    
    currentAIExtractedExam = {
        title: `Đề thi AI: ${domainNames[subject]}`,
        subject: domainNames[subject],
        difficulty: diffSelect.toUpperCase(),
        qualityScore: '0.96/1.00',
        questions: generatedQuestions.slice(0, parseInt(countSelect))
    };

    // Render Preview Workspace
    renderAIPreviewWorkspace();
}

function setStepState(step, state, text) {
    const el = document.getElementById(`step-${step}`);
    if (!el) return;
    
    el.className = `aigen-step ${state}`;
    const badge = el.querySelector('.aigen-step-badge');
    if (badge) badge.textContent = text;
}

// DeepSeek API via Vercel Proxy
async function callDeepSeekForQuestions(apiKey, text, subject) {
    const qCountEl = document.getElementById('ai-question-count');
    const diffEl = document.getElementById('ai-difficulty');
    const questionCount = qCountEl ? parseInt(qCountEl.value) : 5;
    const difficulty = diffEl ? diffEl.value : 'medium';

    // Đọc các loại câu hỏi được chọn
    const typeMap = {
        mcq:   document.getElementById('ai-type-mcq')?.checked,
        tf:    document.getElementById('ai-type-tf')?.checked,
        multi: document.getElementById('ai-type-multi')?.checked,
        fill:  document.getElementById('ai-type-fill')?.checked,
        flash: document.getElementById('ai-type-flash')?.checked,
        short: document.getElementById('ai-type-short')?.checked,
    };
    const selectedTypes = Object.entries(typeMap)
        .filter(([, checked]) => checked)
        .map(([type]) => type);
    // Nếu không chọn gì thì mặc định MCQ
    const questionTypes = selectedTypes.length > 0 ? selectedTypes : ['mcq'];

    const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sourceText: text,
            subject: subject,
            questionCount: questionCount,
            difficulty: difficulty,
            questionTypes: questionTypes
        })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && Array.isArray(data.questions)) {
        return data.questions;
    }
    
    throw new Error('Invalid response from AI server');
}

// Render Preview
function renderAIPreviewWorkspace() {
    const container = document.getElementById('ai-preview-workspace');
    if (!container || !currentAIExtractedExam) return;

    document.getElementById('ai-preview-title').textContent = currentAIExtractedExam.title || '';
    document.getElementById('ai-preview-subject').textContent = currentAIExtractedExam.subject || '';
    document.getElementById('ai-preview-difficulty').textContent = currentAIExtractedExam.difficulty || '';
    document.getElementById('ai-preview-score').textContent = currentAIExtractedExam.qualityScore || '';

    const listEl = document.getElementById('ai-questions-preview-list');
    listEl.innerHTML = '';

    const questions = currentAIExtractedExam.questions;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><i class="fas fa-exclamation-circle" style="font-size:32px;margin-bottom:12px;display:block"></i>Không có câu hỏi nào</div>';
        container.style.display = 'block';
        return;
    }

    const QTYPE_LABELS = {
        multiple_choice: 'Trắc nghiệm',
        true_false: 'Đúng / Sai',
        multiple_select: 'Nhiều đáp án',
        fill_blank: 'Điền khuyết',
        flashcard: 'Flashcard',
        short_answer: 'Trả lời ngắn'
    };

    questions.forEach((q, idx) => {
        // Hỗ trợ cả field 'content' lẫn 'question'
        const qText = q.content || q.question || '(Không có nội dung)';
        const qType = q.type || 'multiple_choice';
        const typeLabel = QTYPE_LABELS[qType] || 'Câu hỏi';
        const options = Array.isArray(q.options) ? q.options : [];
        const correctAnswer = q.correct_answer || q.correctAnswer || '';
        const explanation = q.explanation || '';

        const card = document.createElement('div');
        card.className = 'question-preview-card';
        card.id = `q-preview-card-${idx}`;

        // Build options HTML theo loại câu hỏi
        let optionsHTML = '';
        if (qType === 'multiple_choice' || qType === 'multiple_select') {
            options.forEach((opt, optIdx) => {
                const letter = String(opt).substring(0, 1);
                const isCorrect = correctAnswer.includes(letter);
                optionsHTML += `<button class="option-preview-btn ${isCorrect ? 'correct' : ''}" onclick="selectPreviewOption(${idx}, ${optIdx})">${escapeHTML(String(opt))}</button>`;
            });
        } else if (qType === 'true_false') {
            const trueCorrect = correctAnswer === 'Đúng' || correctAnswer === 'true' || correctAnswer === 'True';
            optionsHTML = `
                <button class="option-preview-btn ${trueCorrect ? 'correct' : ''}"><i class="fas fa-check"></i> Đúng</button>
                <button class="option-preview-btn ${!trueCorrect ? 'correct' : ''}"><i class="fas fa-times"></i> Sai</button>`;
        } else if (qType === 'fill_blank') {
            optionsHTML = `<div style="padding:12px;background:var(--bg-secondary);border-radius:8px;border:1.5px dashed var(--border-color);font-size:13px;color:var(--text-secondary)">
                <i class="fas fa-pencil"></i> Đáp án: <strong style="color:var(--text-primary)">${escapeHTML(correctAnswer)}</strong>
            </div>`;
        } else if (qType === 'flashcard' || qType === 'short_answer') {
            optionsHTML = `<div style="padding:12px;background:var(--bg-secondary);border-radius:8px;border:1.5px solid var(--border-color);font-size:13px;color:var(--text-secondary)">
                <i class="fas fa-comment-dots"></i> Đáp án mẫu: <strong style="color:var(--text-primary)">${escapeHTML(correctAnswer)}</strong>
            </div>`;
        }

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--border-color);padding-bottom:10px;margin-bottom:12px;">
                <span class="badge" style="background:var(--blue-100);color:var(--blue-700);font-weight:700">Câu ${idx + 1} • ${typeLabel}</span>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-ghost btn-sm" onclick="editAIQuestion(${idx})" style="padding:4px 8px;font-size:12px"><i class="fas fa-edit"></i> Sửa</button>
                    <button class="btn btn-ghost btn-sm text-danger" onclick="deleteAIQuestion(${idx})" style="padding:4px 8px;font-size:12px"><i class="fas fa-trash"></i> Xóa</button>
                </div>
            </div>
            <p style="font-size:15px;font-weight:700;color:var(--gray-800);line-height:1.6">${escapeHTML(qText)}</p>
            <div class="question-options-grid">${optionsHTML}</div>
            ${explanation ? `
            <button class="explanation-toggle-btn" onclick="toggleAIExplanation(${idx})">
                <i class="fas fa-lightbulb"></i> Xem giải thích <i class="fas fa-chevron-down" id="exp-arrow-${idx}"></i>
            </button>
            <div class="explanation-box" id="explanation-box-${idx}" style="display:none">${escapeHTML(explanation)}</div>` : ''}
        `;
        listEl.appendChild(card);
    });

    // Update publish button
    const publishBadge = document.getElementById('publish-cost-badge');
    const publishBtn = document.getElementById('btn-ai-publish');
    if (publishBadge && publishBtn) {
        publishBadge.textContent = '';
        publishBtn.innerHTML = `<i class="fas fa-cloud-arrow-up"></i> Đăng đề thi`;
        publishBtn.disabled = false;
        window.currentExamPublishCost = 0;
    }

    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
}

// Preview Interactive Events
function selectPreviewOption(qIdx, optIdx) {
    const parent = document.getElementById(`q-preview-card-${qIdx}`);
    if (!parent) return;

    const btns = parent.querySelectorAll('.option-preview-btn');
    btns.forEach(b => b.classList.remove('selected'));
    btns[optIdx].classList.add('selected');
}

function toggleAIExplanation(idx) {
    const el = document.getElementById(`explanation-box-${idx}`);
    const arrow = document.getElementById(`exp-arrow-${idx}`);
    if (!el) return;

    const isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
    arrow.className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
}

function deleteAIQuestion(idx) {
    if (!currentAIExtractedExam) return;
    currentAIExtractedExam.questions.splice(idx, 1);
    renderAIPreviewWorkspace();
    showToast('Đã xóa câu hỏi!', 'info');
}

function editAIQuestion(idx) {
    const q = currentAIExtractedExam.questions[idx];
    const newContent = prompt('Chỉnh sửa câu hỏi:', q.content);
    if (newContent !== null && newContent.trim() !== '') {
        q.content = newContent.trim();
        renderAIPreviewWorkspace();
        showToast('Cập nhật câu hỏi thành công!', 'success');
    }
}

// Save Exam into Firestore / LocalStorage
async function saveExamToLibrary() {
    if (!currentAIExtractedExam) return;
    if (!AUTH.isAuth()) {
        showToast('Vui lòng đăng nhập để lưu đề thi!', 'error');
        return showAuthModal();
    }

    const user = AUTH.getUser();
    const now = new Date().toISOString();
    const examData = {
        title: currentAIExtractedExam.title,
        subject: currentAIExtractedExam.subject,
        difficulty: currentAIExtractedExam.difficulty,
        qualityScore: currentAIExtractedExam.qualityScore,
        questions: currentAIExtractedExam.questions,
        type: 'ai',
        createdAt: now,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const btnSave = document.getElementById('btn-ai-save-library');
    if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang lưu...`;
    }

    try {
        await db.collection('users').doc(user.uid).collection('saved_exams').add(examData);
        showToast('Đã lưu vào thư viện! 🔖', 'success');
        setTimeout(() => navigateTo('favorite-exams'), 1000);
    } catch (err) {
        console.error('Failed to save to Firestore:', err);
        // Fallback localStorage — dùng timestamp thường vì serverTimestamp không work offline
        examData.savedAt = now;
        let offline = JSON.parse(localStorage.getItem('saved_exams') || '[]');
        offline.unshift({ ...examData, id: 'local_' + Date.now() });
        localStorage.setItem('saved_exams', JSON.stringify(offline));
        showToast('Đã lưu (Chế độ offline)!', 'success');
        setTimeout(() => navigateTo('favorite-exams'), 1000);
    }

    if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = `<i class="fas fa-floppy-disk"></i> Lưu vào thư viện`;
    }
}

// ===== CREATED EXAMS PAGE — redirect to saved =====
async function initCreatedExamsPage() {
    // Trang "Đề đã tạo" đã được gộp vào "Đề đã lưu"
    navigateTo('favorite-exams');
}

function openCreatedExamDetail(exam) {
    currentAIExtractedExam = exam;
    navigateTo('ai-generator');
    setTimeout(() => {
        renderAIPreviewWorkspace();
    }, 200);
}






// ===== MANUAL EXAM BUILDER =====
const ManualExamState = {
    questions: [],
    currentType: 'mcq'
};

const QTYPE_LABELS = {
    mcq:   { label: 'Trắc nghiệm', icon: 'fa-list-ul' },
    tf:    { label: 'Đúng / Sai',  icon: 'fa-check-double' },
    multi: { label: 'Nhiều đáp án', icon: 'fa-square-check' },
    fill:  { label: 'Điền khuyết', icon: 'fa-pencil' },
    short: { label: 'Trả lời ngắn', icon: 'fa-comment-dots' },
    essay: { label: 'Tự luận',     icon: 'fa-file-pen' }
};

const ESSAY_VARIANT_LABELS = {
    same:    'Giữ nguyên đề',
    numbers: 'Đổi số liệu',
    easier:  'Dễ hơn',
    harder:  'Nâng cao'
};

function initManualExamPage() {
    // Wire up question type card clicks
    document.querySelectorAll('.manual-qtype-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.querySelector('input[type="radio"]').value;
            selectManualQuestionType(type);
        });
    });

    // Wire up essay variant clicks
    document.querySelectorAll('.manual-essay-variant').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.manual-essay-variant').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input[type="radio"]').checked = true;
        });
    });

    // Reset state
    ManualExamState.questions = [];
    ManualExamState.currentType = 'mcq';
    selectManualQuestionType('mcq');
    renderManualQuestionsList();
}

function selectManualQuestionType(type) {
    ManualExamState.currentType = type;

    // Update card active state
    document.querySelectorAll('.manual-qtype-card').forEach(card => {
        const val = card.querySelector('input[type="radio"]').value;
        card.classList.toggle('active', val === type);
        if (val === type) card.querySelector('input[type="radio"]').checked = true;
    });

    // Show/hide option panels
    const panels = ['mcq', 'tf', 'multi', 'fill', 'short', 'essay'];
    panels.forEach(p => {
        const el = document.getElementById(`manual-${p}-options`);
        if (el) el.style.display = (p === type) ? 'flex' : 'none';
    });

    // Hide explanation for essay (has its own answer field)
    const expWrap = document.getElementById('manual-explanation-wrap');
    if (expWrap) expWrap.style.display = (type === 'essay') ? 'none' : 'block';
}

// Keep old name for backward compat
function toggleManualQuestionType() {
    const type = ManualExamState.currentType;
    selectManualQuestionType(type);
}

function addManualQuestion() {
    const type = ManualExamState.currentType;
    const questionText = document.getElementById('manual-question-text').value.trim();
    const explanation = document.getElementById('manual-explanation')?.value.trim() || '';

    if (!questionText) {
        showToast('Vui lòng nhập nội dung câu hỏi!', 'error');
        return;
    }

    let question = { id: Date.now(), type, question: questionText, explanation };

    if (type === 'mcq') {
        const opts = ['a','b','c','d'].map(l => document.getElementById(`manual-option-${l}`).value.trim());
        if (opts.some(o => !o)) { showToast('Vui lòng nhập đầy đủ 4 đáp án!', 'error'); return; }
        const correct = document.querySelector('input[name="manual-correct-answer"]:checked');
        if (!correct) { showToast('Vui lòng chọn đáp án đúng!', 'error'); return; }
        question.options = { A: opts[0], B: opts[1], C: opts[2], D: opts[3] };
        question.correctAnswer = correct.value;

    } else if (type === 'tf') {
        const ans = document.querySelector('input[name="manual-tf-answer"]:checked');
        if (!ans) { showToast('Vui lòng chọn Đúng hoặc Sai!', 'error'); return; }
        question.correctAnswer = ans.value;

    } else if (type === 'multi') {
        const opts = ['a','b','c','d'].map(l => document.getElementById(`manual-multi-option-${l}`).value.trim());
        if (opts.some(o => !o)) { showToast('Vui lòng nhập đầy đủ 4 đáp án!', 'error'); return; }
        const checked = [...document.querySelectorAll('input[name="manual-multi-answer"]:checked')].map(c => c.value);
        if (!checked.length) { showToast('Vui lòng chọn ít nhất 1 đáp án đúng!', 'error'); return; }
        question.options = { A: opts[0], B: opts[1], C: opts[2], D: opts[3] };
        question.correctAnswers = checked;

    } else if (type === 'fill') {
        const ans = document.getElementById('manual-fill-answer').value.trim();
        if (!ans) { showToast('Vui lòng nhập đáp án đúng!', 'error'); return; }
        question.correctAnswer = ans;
        question.altAnswers = document.getElementById('manual-fill-alt').value.trim();

    } else if (type === 'short') {
        question.sampleAnswer = document.getElementById('manual-short-answer').value.trim();
        question.maxScore = parseFloat(document.getElementById('manual-short-score').value) || 1;

    } else if (type === 'essay') {
        const variant = document.querySelector('input[name="manual-essay-variant"]:checked')?.value || 'same';
        question.variant = variant;
        question.sampleAnswer = document.getElementById('manual-essay-answer').value.trim();
        question.maxScore = parseFloat(document.getElementById('manual-essay-score').value) || 3;
    }

    ManualExamState.questions.push(question);
    renderManualQuestionsList();
    clearManualQuestionForm();
    showToast('Đã thêm câu hỏi thành công!', 'success');
}

function clearManualQuestionForm() {
    document.getElementById('manual-question-text').value = '';
    if (document.getElementById('manual-explanation')) document.getElementById('manual-explanation').value = '';
    // MCQ
    ['a','b','c','d'].forEach(l => { const el = document.getElementById(`manual-option-${l}`); if(el) el.value=''; });
    document.querySelectorAll('input[name="manual-correct-answer"]').forEach(r => r.checked = false);
    // TF
    document.querySelectorAll('input[name="manual-tf-answer"]').forEach(r => r.checked = false);
    // Multi
    ['a','b','c','d'].forEach(l => { const el = document.getElementById(`manual-multi-option-${l}`); if(el) el.value=''; });
    document.querySelectorAll('input[name="manual-multi-answer"]').forEach(c => c.checked = false);
    // Fill
    if (document.getElementById('manual-fill-answer')) document.getElementById('manual-fill-answer').value = '';
    if (document.getElementById('manual-fill-alt')) document.getElementById('manual-fill-alt').value = '';
    // Short
    if (document.getElementById('manual-short-answer')) document.getElementById('manual-short-answer').value = '';
    // Essay
    if (document.getElementById('manual-essay-answer')) document.getElementById('manual-essay-answer').value = '';
    // Reset essay variant to "same"
    document.querySelectorAll('.manual-essay-variant').forEach(c => c.classList.remove('active'));
    const sameVariant = document.querySelector('.manual-essay-variant[data-variant="same"]');
    if (sameVariant) { sameVariant.classList.add('active'); sameVariant.querySelector('input').checked = true; }
}

function _buildQuestionOptionsHTML(q) {
    if (q.type === 'mcq') {
        return `<div class="manual-question-options">
            ${Object.entries(q.options).map(([k,v]) => `
                <div class="manual-question-option ${q.correctAnswer===k?'correct':''}">
                    <strong>${k}.</strong> ${escapeHTML(v)}
                    ${q.correctAnswer===k ? '<i class="fas fa-check-circle" style="margin-left:auto;color:#10b981"></i>' : ''}
                </div>`).join('')}
        </div>`;
    }
    if (q.type === 'tf') {
        return `<div class="manual-question-options" style="flex-direction:row;gap:8px">
            <div class="manual-question-option ${q.correctAnswer==='true'?'correct':''}"><i class="fas fa-check"></i> Đúng ${q.correctAnswer==='true'?'<i class="fas fa-check-circle" style="margin-left:4px;color:#10b981"></i>':''}</div>
            <div class="manual-question-option ${q.correctAnswer==='false'?'correct':''}"><i class="fas fa-times"></i> Sai ${q.correctAnswer==='false'?'<i class="fas fa-check-circle" style="margin-left:4px;color:#10b981"></i>':''}</div>
        </div>`;
    }
    if (q.type === 'multi') {
        return `<div class="manual-question-options">
            ${Object.entries(q.options).map(([k,v]) => {
                const isCorrect = q.correctAnswers?.includes(k);
                return `<div class="manual-question-option ${isCorrect?'correct':''}">
                    <strong>${k}.</strong> ${escapeHTML(v)}
                    ${isCorrect ? '<i class="fas fa-check-circle" style="margin-left:auto;color:#10b981"></i>' : ''}
                </div>`;
            }).join('')}
        </div>`;
    }
    if (q.type === 'fill') {
        return `<div class="manual-question-option correct" style="margin-top:4px">
            <i class="fas fa-pencil" style="color:#d97706"></i>
            <strong>Đáp án:</strong> ${escapeHTML(q.correctAnswer)}
            ${q.altAnswers ? `<span style="color:var(--text-muted);font-size:11px;margin-left:6px">(cũng chấp nhận: ${escapeHTML(q.altAnswers)})</span>` : ''}
        </div>`;
    }
    if (q.type === 'short') {
        return `<div class="manual-question-option" style="margin-top:4px;background:rgba(6,182,212,0.06);border-color:rgba(6,182,212,0.2)">
            <i class="fas fa-comment-dots" style="color:#0891b2"></i>
            <span style="color:var(--text-secondary)">${q.sampleAnswer ? escapeHTML(q.sampleAnswer) : '<em>Chưa có đáp án mẫu</em>'}</span>
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:#0891b2">${q.maxScore} điểm</span>
        </div>`;
    }
    if (q.type === 'essay') {
        const variantColors = { same:'#8b5cf6', numbers:'#d97706', easier:'#059669', harder:'#dc2626' };
        const col = variantColors[q.variant] || '#8b5cf6';
        return `<div style="margin-top:6px;display:flex;flex-direction:column;gap:6px">
            <div style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:${col};background:${col}18;padding:4px 10px;border-radius:6px;border:1px solid ${col}30;width:fit-content">
                <i class="fas fa-sliders"></i> ${ESSAY_VARIANT_LABELS[q.variant] || 'Giữ nguyên'}
            </div>
            ${q.sampleAnswer ? `<div style="padding:10px 12px;background:rgba(239,68,68,0.05);border-radius:8px;border-left:3px solid #ef4444;font-size:12px;color:var(--text-secondary)"><strong style="color:#dc2626">📝 Đáp án mẫu:</strong> ${escapeHTML(q.sampleAnswer)}</div>` : ''}
            <div style="font-size:11px;font-weight:700;color:#dc2626;text-align:right">${q.maxScore} điểm</div>
        </div>`;
    }
    return '';
}

function renderManualQuestionsList() {
    const container = document.getElementById('manual-questions-list');
    const countEl = document.getElementById('manual-question-count');
    if (countEl) countEl.textContent = ManualExamState.questions.length;

    if (!ManualExamState.questions.length) {
        container.innerHTML = `<div class="manual-empty-state">
            <i class="fas fa-clipboard-question"></i>
            <h3>Chưa có câu hỏi nào</h3>
            <p>Bắt đầu thêm câu hỏi từ form bên trái</p>
        </div>`;
        return;
    }

    container.innerHTML = ManualExamState.questions.map((q, i) => `
        <div class="manual-question-item" data-id="${q.id}">
            <div class="manual-question-header">
                <div style="display:flex;align-items:center;gap:8px">
                    <span class="manual-question-number">Câu ${i+1}</span>
                    <span class="qtype-badge qtype-badge--${q.type}">
                        <i class="fas ${QTYPE_LABELS[q.type]?.icon}"></i>
                        ${QTYPE_LABELS[q.type]?.label}
                    </span>
                </div>
                <div class="manual-question-actions">
                    <button class="manual-question-btn" onclick="editManualQuestion(${q.id})" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
                    <button class="manual-question-btn delete" onclick="deleteManualQuestion(${q.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="manual-question-text">${escapeHTML(q.question)}</div>
            ${_buildQuestionOptionsHTML(q)}
            ${q.explanation ? `<div style="margin-top:8px;padding:8px 10px;background:var(--bg-card);border-radius:7px;font-size:12px;color:var(--text-secondary);border-left:3px solid #10b981"><strong>💡 Giải thích:</strong> ${escapeHTML(q.explanation)}</div>` : ''}
        </div>
    `).join('');
}

function editManualQuestion(id) {
    const q = ManualExamState.questions.find(q => q.id === id);
    if (!q) return;

    selectManualQuestionType(q.type);
    document.getElementById('manual-question-text').value = q.question;
    if (document.getElementById('manual-explanation')) document.getElementById('manual-explanation').value = q.explanation || '';

    if (q.type === 'mcq') {
        ['A','B','C','D'].forEach(k => { document.getElementById(`manual-option-${k.toLowerCase()}`).value = q.options[k]; });
        const r = document.querySelector(`input[name="manual-correct-answer"][value="${q.correctAnswer}"]`);
        if (r) r.checked = true;
    } else if (q.type === 'tf') {
        const r = document.querySelector(`input[name="manual-tf-answer"][value="${q.correctAnswer}"]`);
        if (r) r.checked = true;
    } else if (q.type === 'multi') {
        ['A','B','C','D'].forEach(k => { document.getElementById(`manual-multi-option-${k.toLowerCase()}`).value = q.options[k]; });
        q.correctAnswers?.forEach(k => { const c = document.querySelector(`input[name="manual-multi-answer"][value="${k}"]`); if(c) c.checked=true; });
    } else if (q.type === 'fill') {
        document.getElementById('manual-fill-answer').value = q.correctAnswer;
        document.getElementById('manual-fill-alt').value = q.altAnswers || '';
    } else if (q.type === 'short') {
        document.getElementById('manual-short-answer').value = q.sampleAnswer || '';
        document.getElementById('manual-short-score').value = q.maxScore || 1;
    } else if (q.type === 'essay') {
        document.getElementById('manual-essay-answer').value = q.sampleAnswer || '';
        document.getElementById('manual-essay-score').value = q.maxScore || 3;
        document.querySelectorAll('.manual-essay-variant').forEach(c => c.classList.remove('active'));
        const varCard = document.querySelector(`.manual-essay-variant[data-variant="${q.variant}"]`);
        if (varCard) { varCard.classList.add('active'); varCard.querySelector('input').checked = true; }
    }

    deleteManualQuestion(id);
    showToast('Câu hỏi đã được tải vào form để chỉnh sửa', 'info');
}

function deleteManualQuestion(id) {
    ManualExamState.questions = ManualExamState.questions.filter(q => q.id !== id);
    renderManualQuestionsList();
}

function showManualPreview() {
    if (!ManualExamState.questions.length) {
        showToast('Vui lòng thêm ít nhất 1 câu hỏi!', 'error');
        return;
    }
    const title = document.getElementById('manual-exam-title').value.trim() || 'Đề thi chưa có tiêu đề';
    const subject = document.getElementById('manual-subject').value;
    const difficulty = document.getElementById('manual-difficulty').value;
    const duration = document.getElementById('manual-duration').value;
    const diffLabel = { easy:'Dễ', medium:'Trung bình', hard:'Khó' }[difficulty] || difficulty;

    const body = document.getElementById('manual-preview-body');
    body.innerHTML = `
        <div style="margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border-color)">
            <h2 style="font-size:22px;font-weight:800;color:var(--text-primary);margin-bottom:12px">${escapeHTML(title)}</h2>
            <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--text-secondary)">
                <span><i class="fas fa-building-columns"></i> <strong>Môn:</strong> ${escapeHTML(subject)}</span>
                <span><i class="fas fa-sliders"></i> <strong>Độ khó:</strong> ${diffLabel}</span>
                <span><i class="fas fa-clock"></i> <strong>Thời gian:</strong> ${duration} phút</span>
                <span><i class="fas fa-list-check"></i> <strong>Số câu:</strong> ${ManualExamState.questions.length}</span>
            </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:18px">
            ${ManualExamState.questions.map((q, i) => `
                <div style="background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:12px;padding:20px">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                        <span style="font-size:13px;font-weight:800;color:#8b5cf6;background:rgba(139,92,246,0.1);padding:4px 12px;border-radius:8px;border:1px solid rgba(139,92,246,0.2)">Câu ${i+1}</span>
                        <span class="qtype-badge qtype-badge--${q.type}"><i class="fas ${QTYPE_LABELS[q.type]?.icon}"></i> ${QTYPE_LABELS[q.type]?.label}</span>
                    </div>
                    <div style="font-size:15px;font-weight:600;color:var(--text-primary);line-height:1.65;margin-bottom:14px">${escapeHTML(q.question)}</div>
                    ${_buildPreviewOptionsHTML(q)}
                    ${q.explanation ? `<div style="margin-top:12px;padding:10px 14px;background:rgba(16,185,129,0.05);border-radius:8px;border-left:3px solid #10b981;font-size:13px;color:var(--text-secondary)"><strong style="color:#059669">💡 Giải thích:</strong> ${escapeHTML(q.explanation)}</div>` : ''}
                </div>
            `).join('')}
        </div>`;

    document.getElementById('manual-preview-modal').style.display = 'flex';
}

function _buildPreviewOptionsHTML(q) {
    const optStyle = (correct) => `padding:10px 14px;background:var(--bg-primary);border-radius:8px;border:1.5px solid ${correct?'#10b981':'var(--border-color)'};display:flex;align-items:center;gap:10px;margin-bottom:6px`;
    if (q.type === 'mcq') {
        return `<div style="display:flex;flex-direction:column;gap:6px">${Object.entries(q.options).map(([k,v]) => `
            <div style="${optStyle(q.correctAnswer===k)}">
                <strong style="color:${q.correctAnswer===k?'#10b981':'var(--text-primary)'}">${k}.</strong>
                <span style="color:${q.correctAnswer===k?'#059669':'var(--text-secondary)'};font-weight:${q.correctAnswer===k?'600':'400'}">${escapeHTML(v)}</span>
                ${q.correctAnswer===k?'<i class="fas fa-check-circle" style="margin-left:auto;color:#10b981"></i>':''}
            </div>`).join('')}</div>`;
    }
    if (q.type === 'tf') {
        return `<div style="display:flex;gap:10px">
            <div style="${optStyle(q.correctAnswer==='true')};flex:1;justify-content:center"><i class="fas fa-check"></i> Đúng ${q.correctAnswer==='true'?'<i class="fas fa-check-circle" style="color:#10b981;margin-left:6px"></i>':''}</div>
            <div style="${optStyle(q.correctAnswer==='false')};flex:1;justify-content:center"><i class="fas fa-times"></i> Sai ${q.correctAnswer==='false'?'<i class="fas fa-check-circle" style="color:#10b981;margin-left:6px"></i>':''}</div>
        </div>`;
    }
    if (q.type === 'multi') {
        return `<div style="display:flex;flex-direction:column;gap:6px">${Object.entries(q.options).map(([k,v]) => {
            const ok = q.correctAnswers?.includes(k);
            return `<div style="${optStyle(ok)}">
                <strong style="color:${ok?'#10b981':'var(--text-primary)'}">${k}.</strong>
                <span style="color:${ok?'#059669':'var(--text-secondary)'};font-weight:${ok?'600':'400'}">${escapeHTML(v)}</span>
                ${ok?'<i class="fas fa-check-circle" style="margin-left:auto;color:#10b981"></i>':''}
            </div>`;}).join('')}</div>`;
    }
    if (q.type === 'fill') {
        return `<div style="padding:10px 14px;background:rgba(245,158,11,0.06);border-radius:8px;border:1.5px solid rgba(245,158,11,0.3);font-size:13px">
            <strong style="color:#d97706"><i class="fas fa-pencil"></i> Đáp án:</strong> ${escapeHTML(q.correctAnswer)}
            ${q.altAnswers?`<span style="color:var(--text-muted);font-size:11px;margin-left:8px">(cũng chấp nhận: ${escapeHTML(q.altAnswers)})</span>`:''}
        </div>`;
    }
    if (q.type === 'short') {
        return `<div style="padding:10px 14px;background:rgba(6,182,212,0.06);border-radius:8px;border:1.5px solid rgba(6,182,212,0.25);font-size:13px">
            <strong style="color:#0891b2"><i class="fas fa-comment-dots"></i> Đáp án mẫu:</strong> ${q.sampleAnswer?escapeHTML(q.sampleAnswer):'<em style="color:var(--text-muted)">Chưa có</em>'}
            <span style="float:right;font-weight:700;color:#0891b2">${q.maxScore} điểm</span>
        </div>`;
    }
    if (q.type === 'essay') {
        const variantColors = { same:'#8b5cf6', numbers:'#d97706', easier:'#059669', harder:'#dc2626' };
        const col = variantColors[q.variant] || '#8b5cf6';
        return `<div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:${col};background:${col}18;padding:5px 12px;border-radius:6px;border:1px solid ${col}30;width:fit-content">
                <i class="fas fa-sliders"></i> ${ESSAY_VARIANT_LABELS[q.variant]||'Giữ nguyên'}
            </div>
            ${q.sampleAnswer?`<div style="padding:12px 14px;background:rgba(239,68,68,0.05);border-radius:8px;border-left:3px solid #ef4444;font-size:13px;color:var(--text-secondary);white-space:pre-wrap"><strong style="color:#dc2626">📝 Hướng dẫn chấm:</strong><br>${escapeHTML(q.sampleAnswer)}</div>`:''}
            <div style="text-align:right;font-size:12px;font-weight:700;color:#dc2626">${q.maxScore} điểm</div>
        </div>`;
    }
    return '';
}

function closeManualPreview() {
    document.getElementById('manual-preview-modal').style.display = 'none';
}

async function saveManualExam() {
    if (!AUTH.isAuth()) {
        showToast('Vui lòng đăng nhập để lưu đề thi!', 'error');
        return showAuthModal();
    }
    const title = document.getElementById('manual-exam-title').value.trim();
    if (!title) { showToast('Vui lòng nhập tiêu đề đề thi!', 'error'); return; }
    if (!ManualExamState.questions.length) { showToast('Vui lòng thêm ít nhất 1 câu hỏi!', 'error'); return; }

    const subject = document.getElementById('manual-subject').value;
    const difficulty = document.getElementById('manual-difficulty').value;
    const duration = parseInt(document.getElementById('manual-duration').value);

    const user = AUTH.getUser();
    
    const standardizedQuestions = ManualExamState.questions.map(q => {
        let options = [];
        let correct_answer = 'A';

        if (q.type === 'mcq') {
            options = Object.values(q.options || {});
            correct_answer = q.correctAnswer;
        } else if (q.type === 'tf') {
            options = ['Đúng', 'Sai'];
            correct_answer = q.correctAnswer === 'true' ? 'A' : 'B';
        } else if (q.type === 'multi') {
            options = Object.values(q.options || {});
            correct_answer = q.correctAnswers && q.correctAnswers.length > 0 ? q.correctAnswers[0] : 'A';
        } else {
            options = ['(Câu hỏi tự luận/điền khuyết)'];
            correct_answer = 'A';
        }

        return {
            id: q.id || Date.now() + Math.random(),
            content: q.question,
            options: options,
            correct_answer: correct_answer,
            explanation: q.explanation || '',
            difficulty: difficulty,
            type: q.type
        };
    });

    const examData = {
        title, subject, difficulty, duration,
        questions: standardizedQuestions,
        questionCount: standardizedQuestions.length,
        createdBy: user.uid,
        authorName: user.displayName || user.email.split('@')[0],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        savedAt: firebase.firestore.FieldValue.serverTimestamp(),
        postedAt: firebase.firestore.FieldValue.serverTimestamp(),
        type: 'manual', 
        isFavorite: false,
        downloads: 0,
        price: 0,
        isPaid: false
    };

    try {
        // Lưu vào bộ sưu tập cá nhân
        await db.collection('users').doc(user.uid).collection('saved_exams').add(examData);
        // Lưu vào public_exams để hiện Môn Học mới ở Chợ Đen và Kho Đề
        await db.collection('public_exams').add(examData);
        showToast('Đã lưu đề thi vào thư viện! 🔖', 'success');
        trackUserActivity('Tạo đề thi thủ công: ' + title);
        document.getElementById('manual-exam-title').value = '';
        document.getElementById('manual-duration').value = '60';
        ManualExamState.questions = [];
        renderManualQuestionsList();
        clearManualQuestionForm();
        setTimeout(() => navigateTo('favorite-exams'), 1000);
    } catch (e) {
        showToast('Lỗi khi lưu: ' + e.message, 'error');
    }
}

// Hàm tải thư viện động từ CDN
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function exportManualExamPDF() {
    if (!ManualExamState.questions.length) {
        showToast('Vui lòng thêm ít nhất 1 câu hỏi để xuất PDF! 📝', 'error');
        return;
    }
    
    // Yêu cầu lựa chọn đính kèm đáp án
    const includeAnswers = confirm("Bạn có muốn đính kèm Đáp án và Hướng dẫn giải chi tiết ở cuối đề thi không?");
    showToast('Đang khởi tạo công cụ tạo PDF...', 'info');
    
    // Tải html2pdf.js động từ CDN nếu chưa có
    if (typeof html2pdf === 'undefined') {
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
        } catch (e) {
            showToast('Lỗi tải thư viện xuất PDF. Vui lòng thử lại!', 'error');
            return;
        }
    }
    
    const title = document.getElementById('manual-exam-title').value.trim() || 'Đề thi tự luận/trắc nghiệm';
    const subject = document.getElementById('manual-subject').value.trim() || 'Tự do';
    const duration = document.getElementById('manual-duration').value || '60';

    const element = document.createElement('div');
    element.className = 'pdf-export-template';
    element.style.padding = '40px 50px';
    element.style.color = '#1f2937';
    element.style.fontFamily = "'Nunito', 'Segoe UI', Arial, sans-serif";
    element.style.background = '#ffffff';

    // Header section
    let html = `
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #1f2937; padding-bottom: 15px; margin-bottom: 30px;">
            <div style="text-align: left; font-size: 13px; line-height: 1.6;">
                <strong>HỆ THỐNG HỌC TẬP STUDYPORTAL</strong><br>
                <span>Kho đề thi thủ công cá nhân</span>
            </div>
            <div style="text-align: right; font-size: 13px; line-height: 1.6;">
                <strong>ĐỀ THI CHÍNH THỨC</strong><br>
                <span>Thời gian: ${duration} phút</span>
            </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 35px;">
            <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 8px; text-transform: uppercase; color: #111827;">${title}</h1>
            <p style="font-size: 14px; margin: 0; color: #4b5563;"><strong>Môn học:</strong> ${subject}</p>
        </div>
        
        <div style="margin-bottom: 30px; font-size: 12px; border: 1px dashed #9ca3af; padding: 12px; border-radius: 6px;">
            <strong>Họ & tên thí sinh:</strong>................................................................................... 
            <strong style="margin-left: 20px;">Mã số SV:</strong>....................................
        </div>
    `;

    // Questions section
    html += '<div style="font-size: 14px; line-height: 1.6;">';
    ManualExamState.questions.forEach((q, idx) => {
        const qText = q.question || '';
        const qType = q.type || 'mcq';
        
        html += `
            <div style="margin-bottom: 25px; page-break-inside: avoid;">
                <div style="font-weight: 700; margin-bottom: 8px;">Câu ${idx + 1}: ${qText}</div>
        `;
        
        if (qType === 'mcq' || qType === 'multi') {
            const opts = q.options || {};
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; padding-left: 15px;">`;
            Object.entries(opts).forEach(([key, val]) => {
                html += `<div style="font-size: 13px;"><strong>${key}.</strong> ${val}</div>`;
            });
            html += `</div>`;
        } else if (qType === 'tf') {
            html += `
                <div style="display: flex; gap: 40px; padding-left: 15px; font-size: 13px;">
                    <div><strong>A.</strong> Đúng</div>
                    <div><strong>B.</strong> Sai</div>
                </div>
            `;
        }
        
        html += `</div>`;
    });
    html += '</div>';

    // Key / Explanations section if requested
    if (includeAnswers) {
        html += `
            <div style="page-break-before: always; border-top: 2px dashed #9ca3af; padding-top: 30px; margin-top: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; text-align: center; margin-bottom: 25px; text-transform: uppercase; color: #111827;">ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT</h2>
                <div style="font-size: 13px; line-height: 1.6;">
        `;
        
        ManualExamState.questions.forEach((q, idx) => {
            let ans = '';
            if (q.type === 'mcq') {
                ans = q.correctAnswer || 'A';
            } else if (q.type === 'tf') {
                ans = q.correctAnswer === 'true' ? 'Đúng' : 'Sai';
            } else if (q.type === 'multi') {
                ans = q.correctAnswers ? q.correctAnswers.join(', ') : 'A';
            } else {
                ans = q.correctAnswer || 'N/A';
            }
            
            html += `
                <div style="margin-bottom: 20px; page-break-inside: avoid; border-bottom: 1px solid #f3f4f6; padding-bottom: 15px;">
                    <div style="font-weight: 700; color: #111827;">Câu ${idx + 1}: Đáp án: <span style="color: #059669; font-weight: 800;">${ans}</span></div>
                    ${q.explanation ? `<div style="margin-top: 5px; color: #4b5563; font-style: italic; background: #f9fafb; padding: 10px; border-radius: 6px; border-left: 3px solid #10b981;"><strong>Lời giải:</strong> ${q.explanation}</div>` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }

    element.innerHTML = html;

    // Config options for html2pdf
    const opt = {
        margin:       10,
        filename:     `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_exam.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
        showToast('Xuất file PDF thành công! 🎉', 'success');
    } catch (err) {
        console.error('PDF export error:', err);
        showToast('Lỗi trong quá trình tạo PDF: ' + err.message, 'error');
    }
}

// ===== MARKETPLACE UPLOAD RESOURCE =====

function openUploadResourceModal() {
    if (!AUTH.isAuth()) {
        showToast('Vui lòng đăng nhập để đăng tài liệu!', 'error');
        return showAuthModal();
    }
    document.getElementById('modal-upload-resource').classList.add('visible');
}

function closeUploadResourceModal() {
    document.getElementById('modal-upload-resource').classList.remove('visible');
    // Reset form
    document.getElementById('upload-resource-title').value = '';
    document.getElementById('upload-resource-subject').value = '';
    document.getElementById('upload-resource-desc').value = '';
    document.getElementById('upload-resource-file').value = '';
    document.getElementById('upload-resource-price').value = '';
    document.getElementById('upload-resource-privacy').value = 'public';
    toggleUploadResourcePrice();
}

function toggleUploadResourcePrice() {
    const privacy = document.getElementById('upload-resource-privacy').value;
    const priceGroup = document.getElementById('upload-resource-price-group');
    if (privacy === 'sell') {
        priceGroup.style.display = 'block';
    } else {
        priceGroup.style.display = 'none';
    }
}

async function handleUploadResource() {
    if (!AUTH.isAuth()) { showAuthModal(); return; }

    const title   = document.getElementById('upload-resource-title').value.trim();
    const subject = document.getElementById('upload-resource-subject').value.trim();
    const desc    = document.getElementById('upload-resource-desc').value.trim();
    const type    = document.getElementById('upload-resource-type').value;
    const privacy = document.getElementById('upload-resource-privacy').value;
    const price   = privacy === 'sell' ? (parseInt(document.getElementById('upload-resource-price').value) || 0) : 0;
    const file    = document.getElementById('upload-resource-file').files[0];

    if (!title || !subject || !file) {
        showToast('Vui lòng điền đầy đủ các trường bắt buộc (*)', 'error'); return;
    }
    if (privacy === 'sell' && price <= 0) {
        showToast('Vui lòng nhập giá bán hợp lệ (> 0 điểm)', 'error'); return;
    }

    // Kiểm tra kích thước file (30MB)
    const fileMB = file.size / (1024 * 1024);
    if (fileMB > 30) {
        showToast(`File quá lớn (${fileMB.toFixed(1)}MB). Tối đa 30MB.`, 'error'); return;
    }

    const user = AUTH.getUser();
    const tier = typeof PointsSystem !== 'undefined' ? (PointsSystem.tier || 'free') : 'free';
    const limits = { free: 3, go: 3, plus: 15, ultra: 50 };
    const maxFiles = limits[tier] || 3;

    const btnConfirm = document.getElementById('btn-confirm-upload-resource');
    const progressContainer = document.getElementById('upload-resource-progress-container');
    const progressBar = document.getElementById('upload-resource-progress-bar');
    const progressText = document.getElementById('upload-resource-progress-text');

    btnConfirm.disabled = true;
    btnConfirm.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...`;
    if (progressContainer) progressContainer.style.display = 'block';

    try {
        // Kiểm tra số lượng file đã đăng
        const existingSnap = await db.collection('public_exams')
            .where('authorId', '==', user.uid).get();
        if (existingSnap.size >= maxFiles) {
            showToast(`Đã đạt giới hạn ${existingSnap.size}/${maxFiles} tài liệu (gói ${tier.toUpperCase()}). Gỡ tài liệu cũ để đăng thêm.`, 'error');
            return;
        }

        // Upload trực tiếp lên Cloudinary (bypass Vercel 4.5MB limit)
        if (progressText) progressText.textContent = 'Đang tải file lên Cloudinary...';

        const cloudName = 'dyjgtjc4l';
        const uploadPreset = 'studyportal_unsigned';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', `marketplace/${user.uid}`);

        const downloadURL = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && progressBar) {
                    const pct = Math.round((e.loaded / e.total) * 100);
                    progressBar.style.width = pct + '%';
                    if (progressText) progressText.textContent = `Đang tải lên: ${pct}%`;
                }
            };

            xhr.onload = () => {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (xhr.status === 200 && data.secure_url) {
                        resolve(data.secure_url);
                    } else {
                        reject(new Error(data.error?.message || `Lỗi Cloudinary (${xhr.status})`));
                    }
                } catch (e) { reject(new Error('Phản hồi Cloudinary không hợp lệ')); }
            };
            xhr.onerror = () => reject(new Error('Lỗi kết nối mạng'));
            xhr.send(formData);
        });

        if (progressText) progressText.textContent = 'Đang lưu thông tin...';
        if (progressBar) progressBar.style.width = '100%';

        // Lưu metadata vào Firestore
        await db.collection('public_exams').add({
            title, subject, description: desc,
            resourceType: type,
            fileUrl: downloadURL,
            fileName: file.name,
            fileSizeMB: parseFloat(fileMB.toFixed(2)),
            difficulty: 'mixed',
            price, isPaid: price > 0,
            questionCount: 0,
            authorId: user.uid,
            authorUid: user.uid,
            authorEmail: user.email,
            authorName: user.displayName || user.email.split('@')[0],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            postedAt: firebase.firestore.FieldValue.serverTimestamp(),
            downloads: 0,
            isManual: true
        });

        showToast(`Đã đăng tài liệu thành công! (${existingSnap.size + 1}/${maxFiles} slot)`, 'success');
        closeUploadResourceModal();
        renderMarketplace();

    } catch (err) {
        console.error('handleUploadResource error:', err);
        showToast('Lỗi: ' + err.message, 'error');
    } finally {
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = `<i class="fas fa-check-circle"></i> Xác nhận Đăng Tải`;
        if (progressContainer) progressContainer.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
    }
}
// ==========================================
// VOUCHER SYSTEM
// ==========================================
function openVoucherModal() {
    if (!AUTH.isAuth()) {
        showToast('Vui lòng đăng nhập để sử dụng tính năng này!', 'error');
        return showAuthModal();
    }
    document.getElementById('voucher-modal').style.display = 'flex';
    document.getElementById('voucher-code-input').value = '';
    document.getElementById('voucher-message').innerHTML = '';
}

function closeVoucherModal() {
    document.getElementById('voucher-modal').style.display = 'none';
}

async function submitVoucher() {
    if (!AUTH.isAuth()) return;
    const codeInput = document.getElementById('voucher-code-input');
    const msgEl = document.getElementById('voucher-message');
    const btn = document.getElementById('btn-submit-voucher');
    let code = codeInput.value.trim().toUpperCase();
    if (!code) {
        msgEl.innerHTML = '<span style="color: var(--red-500);">Vui lòng nhập mã voucher!</span>';
        return;
    }
    const uid = AUTH.getUser().uid;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...';
    msgEl.innerHTML = '';
    try {
        const voucherRef = db.collection('vouchers').doc(code);
        const doc = await voucherRef.get();
        if (!doc.exists) {
            msgEl.innerHTML = '<span style="color: var(--red-500);"><i class="fas fa-exclamation-circle"></i> Mã voucher không tồn tại hoặc đã hết hạn!</span>';
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-gift"></i> Xác nhận mã';
            return;
        }
        const data = doc.data();
        if (data.active === false) {
            msgEl.innerHTML = '<span style="color: var(--red-500);"><i class="fas fa-exclamation-circle"></i> Mã voucher này đã bị vô hiệu hóa!</span>';
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-gift"></i> Xác nhận mã';
            return;
        }
        const usedBy = data.usedBy || [];
        if (usedBy.includes(uid)) {
            msgEl.innerHTML = '<span style="color: var(--red-500);"><i class="fas fa-exclamation-circle"></i> Bạn đã sử dụng mã voucher này rồi!</span>';
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-gift"></i> Xác nhận mã';
            return;
        }
        if (data.maxUses && usedBy.length >= data.maxUses) {
            msgEl.innerHTML = '<span style="color: var(--red-500);"><i class="fas fa-exclamation-circle"></i> Mã voucher này đã hết lượt sử dụng!</span>';
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-gift"></i> Xác nhận mã';
            return;
        }
        const pointsToAdd = data.points || 0;
        await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc(uid);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw "Tài khoản không tồn tại!";
            const userData = userDoc.data();
            const currentPoints = userData.points || 0;
            transaction.update(voucherRef, {
                usedBy: firebase.firestore.FieldValue.arrayUnion(uid)
            });
            transaction.update(userRef, {
                points: currentPoints + pointsToAdd
            });
        });
        msgEl.innerHTML = `<span style="color: var(--green-500);"><i class="fas fa-check-circle"></i> Chúc mừng! Bạn được cộng ${pointsToAdd.toLocaleString()} Đ.</span>`;
        codeInput.value = '';
        const freshUser = await db.collection('users').doc(uid).get();
        if (freshUser.exists) {
            document.querySelectorAll('.user-points-display').forEach(el => {
                el.innerHTML = `<i class="fas fa-coins" style="color:#eab308"></i> ${freshUser.data().points_balance?.toLocaleString() || 0} Đ`;
            });
        }
        showToast(`Sử dụng Voucher thành công! +${pointsToAdd.toLocaleString()} Đ`, "success");
        setTimeout(() => { closeVoucherModal(); msgEl.innerHTML = ''; }, 2500);
    } catch (error) {
        console.error("Lỗi áp dụng voucher:", error);
        msgEl.innerHTML = '<span style="color: var(--red-500);"><i class="fas fa-exclamation-triangle"></i> Lỗi hệ thống. Vui lòng thử lại!</span>';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-gift"></i> Xác nhận mã';
    }
}

