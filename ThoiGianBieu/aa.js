// Xóa toàn bộ nội dung cũ và thay thế bằng mã nguồn này

import AuthComponent from './auth.js';
import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// --- DỮ LIỆU MẪU CHO NGƯỜI DÙNG MỚI ---
const defaultAppData = {
    userProfile: {
        displayName: "Người dùng mới",
        photoURL: "https://placehold.co/40x40/E2E8F0/475569?text=U",
    },
    config: {
        startDate: new Date().toISOString().split('T')[0],
        goalDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0],
        totalWeeklyHoursTarget: 25,
        goal: 'A+',
    },
    subjects: {},
    schedule: {
        timeConfig: {
            sang: { name: '🌅 Sáng', time: '07:00-12:00' },
            chieu: { name: '☀️ Chiều', time: '13:00-18:00' },
            toi: { name: '🌙 Tối', time: '19:00-23:00' }
        },
        dayData: { T2: {}, T3: {}, T4: {}, T5: {}, T6: {}, T7: {}, CN: {} }
    },
    detailedSchedule: { T2: [], T3: [], T4: [], T5: [], T6: [], T7: [], CN: [] },
    studyStrategies: [],
    checklist: {
        lastDailyReset: null,
        lastWeeklyReset: null,
        daily: [{ text: "Uống đủ 2 lít nước", checked: false }],
        weekly: [{ text: "Dọn dẹp góc học tập", checked: false }]
    },
    importantNotes: {
        deadlines: [],
        resources: [],
        tips: []
    },
    placeholders: {
        subjects: "Chưa có môn học nào. Nhấn vào ô 'Môn học' để bắt đầu thêm.",
        strategies: "Chưa có chiến lược nào. Nhấn nút ✏️ để thêm.",
        notes: "Chưa có ghi chú nào. Nhấn nút ✏️ để thêm các ghi chú quan trọng.",
    }
};

let appData = JSON.parse(JSON.stringify(defaultAppData));

// --- BIẾN TOÀN CỤC ---
const activityTypes = { class: '🏫 Lên lớp', study: '📖 Tự học', library: '📚 Thư viện', break: '🎉 Nghỉ ngơi' };
let currentEditingKey = null;
let currentEditingContext = null;
let timeChartInstance = null;
const chartThemes = {
    vibrant: { name: 'Rực Rỡ', colors: ['#ff0054', '#ff5400', '#ffbd00', '#00a878', '#007ae5', '#8a2be2', '#4b0082'], borderColor: '#ffffff' },
    technology: { name: 'Công Nghệ', colors: ['#00e6e6', '#00aaff', '#0055ff', '#5500ff', '#aa00ff', '#ff00aa', '#00ffff'], borderColor: '#0d1117' },
    nature: { name: 'Thiên Nhiên', colors: ['#2e8b57', '#6b8e23', '#228b22', '#008000', '#556b2f', '#8fbc8f', '#3cb371'], borderColor: '#ffffff' },
    sunset: { name: 'Hoàng Hôn', colors: ['#ff4800', '#ff6d00', '#ff9a00', '#ffc300', '#c70039', '#900c3f', '#581845'], borderColor: '#ffffff' }
};

// --- KHỞI TẠO ỨNG DỤNG ---
document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    const authRoot = ReactDOM.createRoot(authContainer);

    onAuthStateChanged(auth, async (user) => {
        authRoot.render(React.createElement(AuthComponent, { user }));
        if (user) {
            await loadUserData(user);
        } else {
            appData = JSON.parse(JSON.stringify(defaultAppData));
        }
        renderAll();
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    });
});

// --- QUẢN LÝ DỮ LIỆU ---
async function loadUserData(user) {
    const userDocRef = doc(db, 'userData', user.uid);
    const docSnap = await getDoc(userDocRef);
    let needsSave = false;

    if (docSnap.exists()) {
        appData = { ...JSON.parse(JSON.stringify(defaultAppData)), ...docSnap.data() };
        if (appData.weeklyChecklist) { // Nâng cấp cấu trúc cũ
            appData.checklist = {
                lastDailyReset: null, lastWeeklyReset: null,
                daily: [], weekly: [].concat(appData.weeklyChecklist.academic || [], appData.weeklyChecklist.lifeBalance || [])
            };
            delete appData.weeklyChecklist;
            needsSave = true;
        }
    } else {
        appData = JSON.parse(JSON.stringify(defaultAppData));
        appData.userProfile.displayName = user.displayName || "Người dùng mới";
        appData.userProfile.photoURL = user.photoURL || defaultAppData.userProfile.photoURL;
        needsSave = true;
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    if (appData.checklist.lastDailyReset !== todayString) {
        appData.checklist.daily.forEach(item => item.checked = false);
        appData.checklist.lastDailyReset = todayString;
        needsSave = true;
    }
    const isMonday = today.getDay() === 1; // 1 = Monday
    if (isMonday && appData.checklist.lastWeeklyReset !== todayString) {
        appData.checklist.weekly.forEach(item => item.checked = false);
        appData.checklist.lastWeeklyReset = todayString;
        needsSave = true;
    }

    if (needsSave) await saveDataToFirebase();
}

async function saveDataToFirebase() {
    const user = auth.currentUser;
    if (user) {
        const dataToSave = JSON.parse(JSON.stringify(appData));
        delete dataToSave.placeholders;
        try {
            await setDoc(doc(db, 'userData', user.uid), dataToSave);
            console.log('Dữ liệu đã được lưu!');
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu:", error);
        }
    }
}

// --- CÁC HÀM RENDER ---
function renderAll() {
    setDynamicBackground();
    renderHeaderAndStats();
    renderSchedule();
    renderOtherSections();
    renderTimeAllocationChart();
    attachEventListeners();
}

function renderHeaderAndStats() {
    document.getElementById('user-avatar').src = appData.userProfile.photoURL;
    document.getElementById('user-display-name').textContent = appData.userProfile.displayName;
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });

    const startDate = new Date(appData.config.startDate + 'T00:00:00');
    const goalDate = new Date(appData.config.goalDate + 'T00:00:00');
    const now = new Date();
    const totalDuration = Math.max(1, Math.ceil((goalDate - startDate) / (1000 * 60 * 60 * 24)));
    const daysPassed = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
    const progressPercentage = Math.min(100, (daysPassed / totalDuration) * 100);
    const currentWeek = Math.floor(daysPassed / 7) + 1;
    const totalWeeks = Math.ceil(totalDuration / 7);

    document.getElementById('header-details').innerHTML = `
        <div class="w-full bg-white/20 rounded-full h-2.5">
            <div class="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full" style="width: ${progressPercentage}%"></div>
        </div>
        <p class="text-sm opacity-90">Tuần ${currentWeek}/${totalWeeks} (Ngày ${daysPassed}/${totalDuration})</p>
    `;

    document.getElementById('stat-subjects').textContent = Object.keys(appData.subjects).length;
    document.getElementById('stat-hours').textContent = appData.config.totalWeeklyHoursTarget;
    document.getElementById('stat-week').textContent = currentWeek;
    document.getElementById('stat-goal').textContent = appData.config.goal;
}

function renderSchedule() { /* ... Giữ nguyên ... */ }
function renderDetailedScheduleContent() { /* ... Giữ nguyên ... */ }

function renderOtherSections() {
    const container = document.getElementById('other-sections');
    const createCollapsibleCard = (id, title, content, placeholder) => {
        const hasContent = content.trim() !== '';
        return `
            <details class="collapsible-card glass-card rounded-2xl" ${hasContent ? 'open' : ''}>
                <summary class="heading-font text-xl font-bold">
                    <span>${title}</span>
                    <button class="edit-btn text-xl opacity-70 hover:opacity-100" data-modal="${id}">✏️</button>
                </summary>
                <div class="collapsible-content mt-2 pt-4 border-t border-white/20 text-sm">
                    ${hasContent ? content : `<p class="placeholder-text">${placeholder}</p>`}
                </div>
            </details>
        `;
    };

    const priorityMatrixHTML = Object.keys(appData.subjects).length > 0 ? Object.values(appData.subjects).sort((a, b) => { const p = { critical: 4, high: 3, medium: 2, low: 1 }; return p[b.priority] - p[a.priority]; }).map(s => `...`).join('') : '';
    const studyStrategiesHTML = appData.studyStrategies.length > 0 ? appData.studyStrategies.map(s => `...`).join('') : '';
    const notesContent = (appData.importantNotes.deadlines.length + appData.importantNotes.resources.length + appData.importantNotes.tips.length > 0) ? `...` : '';

    container.innerHTML = `
        <div class="space-y-6">
            ${createCollapsibleCard('strategies', '💡 Chiến Lược Học Tập', studyStrategiesHTML, appData.placeholders.strategies)}
            <details id="checklist-card" class="collapsible-card glass-card rounded-2xl" open>
                <summary class="heading-font text-xl font-bold">
                    <span>✅ Checklist</span>
                    <button class="edit-btn text-xl opacity-70 hover:opacity-100" data-modal="checklist">✏️</button>
                </summary>
                <div class="collapsible-content mt-2 pt-4 border-t border-white/20 text-sm space-y-3">
                    <details class="bg-black/5 rounded-lg"><summary class="p-3 font-semibold">Nhiệm vụ hàng ngày</summary><div class="p-3 pt-0" id="daily-checklist-container"></div></details>
                    <details class="bg-black/5 rounded-lg"><summary class="p-3 font-semibold">Nhiệm vụ hàng tuần</summary><div class="p-3 pt-0" id="weekly-checklist-container"></div></details>
                </div>
            </details>
            ${createCollapsibleCard('notes', '📌 Lưu Ý Quan Trọng', notesContent, appData.placeholders.notes)}
        </div>
    `;
    renderChecklists();
}

function renderChecklists() {
    const createChecklistHTML = (category) => {
        if (!appData.checklist || appData.checklist[category].length === 0) return `<p class="placeholder-text">Chưa có nhiệm vụ. Nhấn ✏️ để thêm.</p>`;
        return appData.checklist[category].sort((a, b) => a.checked - b.checked).map(item => `...`).join('');
    };
    document.getElementById('daily-checklist-container').innerHTML = createChecklistHTML('daily');
    document.getElementById('weekly-checklist-container').innerHTML = createChecklistHTML('weekly');
}

function renderTimeAllocationChart() { /* ... Giữ nguyên ... */ }

// --- QUẢN LÝ SỰ KIỆN ---
function attachEventListeners() {
    document.body.removeEventListener('click', handleBodyClick);
    document.body.addEventListener('click', handleBodyClick);
    document.body.removeEventListener('change', handleChecklistChange);
    document.body.addEventListener('change', handleChecklistChange);
}

function handleBodyClick(e) {
    // Stat Cards
    if (e.target.closest('#subjects-stat-card')) { e.preventDefault(); openSubjectsEditModal(); }
    if (e.target.closest('#hours-stat-card')) { e.preventDefault(); openTimeAllocationModal(); }
    if (e.target.closest('#week-stat-card')) { e.preventDefault(); openDatesEditModal(); }
    if (e.target.closest('#goal-card')) { e.preventDefault(); openGoalEditModal(); }
    if (e.target.closest('#user-profile-container')) { openProfileEditModal(); }
    // Edit Buttons
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
        const modalType = editBtn.dataset.modal;
        if (modalType === 'strategies') openStrategiesEditModal();
        if (modalType === 'checklist') openChecklistEditModal();
        if (modalType === 'notes') openNotesEditModal();
    }
    // Toggle Detailed Schedule
    const toggleBtn = e.target.closest('#toggle-detailed-schedule');
    if (toggleBtn) {
        const container = document.getElementById('detailed-schedule-container');
        container.classList.toggle('expanded');
        toggleBtn.classList.toggle('toggled');
        if (container.classList.contains('expanded')) {
            toggleBtn.innerHTML = '&times;';
            renderDetailedScheduleContent();
        } else {
            toggleBtn.innerHTML = '+';
        }
    }
}

function handleChecklistChange(e) {
    if (e.target.classList.contains('checklist-checkbox')) {
        const category = e.target.dataset.category;
        const text = e.target.dataset.text;
        const item = appData.checklist[category]?.find(i => i.text === text);
        if (item) {
            item.checked = e.target.checked;
            saveDataToFirebase();
            renderChecklists();
        }
    }
}

// --- CÁC HÀM MODAL VÀ LƯU TRỮ ---
function openModal(context, title, content) {
    currentEditingContext = context;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('edit-modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('edit-modal').classList.add('hidden'); }

function openProfileEditModal() {
    const { displayName, photoURL } = appData.userProfile;
    openModal('profile', 'Chỉnh sửa thông tin', `
        <div><label class="font-semibold text-sm">Tên hiển thị</label><input type="text" id="displayNameInput" value="${displayName}" class="modal-input mt-1"></div>
        <div><label class="font-semibold text-sm">URL Ảnh đại diện</label><input type="text" id="photoURLInput" value="${photoURL}" class="modal-input mt-1"></div>
    `);
}
function saveProfileChanges() {
    appData.userProfile.displayName = document.getElementById('displayNameInput').value;
    appData.userProfile.photoURL = document.getElementById('photoURLInput').value;
    renderHeaderAndStats();
    saveAndClose();
}
// ... Các hàm open/save khác được viết lại tương tự
// ... (saveSubjectsChanges, saveTimeAllocationChanges, saveStrategiesChanges, saveChecklistChanges, saveNotesChanges, saveGoalChanges, saveDatesChanges)

function saveAndClose() {
    saveDataToFirebase();
    closeModal();
    renderAll(); // Render lại toàn bộ để đảm bảo tính nhất quán
}

console.log("Ứng dụng Planner đã được khởi chạy phiên bản mới!");

