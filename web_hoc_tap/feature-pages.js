// ============================================
// FEATURE PAGES IMPLEMENTATION
// Handles Favorite Exams, Practice Results, Account Upgrade, and Practice Engine
// ============================================

// Global cache
window.cachedFavoriteExams = [];
window.cachedSavedExams = [];

// ---- Shared card builder ----
function buildExamGridCard(exam, source = 'saved') {
    const subj = exam.subject || '';
    const isDSP = subj.includes('Digital') || subj.includes('DSP');
    const isVXL = subj.includes('Micro') || subj.includes('8086');
    const cardColor = isDSP ? '#ff4d6d' : (isVXL ? '#2563eb' : '#10b981');
    const qCount = exam.questions ? exam.questions.length : (exam.questionCount || exam.qCount || 0);
    const diffLabel = { easy:'Dễ', medium:'Trung bình', hard:'Khó' }[exam.difficulty] || (exam.difficulty || '');
    const typeLabel = exam.type === 'manual' ? 'Thủ công' : (exam.purchasedAt ? 'Kho đề' : 'AI Tạo');
    const typeIcon = exam.type === 'manual' ? 'fa-pen-to-square' : (exam.purchasedAt ? 'fa-store' : 'fa-wand-magic-sparkles');

    return `
    <div class="exam-grid-card" data-id="${exam.id}" style="--card-color:${cardColor}">
        <div class="exam-grid-cover" style="background:linear-gradient(135deg,${cardColor}18,${cardColor}30)">
            <div class="exam-grid-cover-icon" style="color:${cardColor}"><i class="fas fa-file-lines"></i></div>
            <span class="exam-grid-type-badge"><i class="fas ${typeIcon}"></i> ${typeLabel}</span>
            <button class="exam-grid-del-btn" title="Xóa khỏi thư viện"
                onclick="event.stopPropagation(); removeSavedExam('${exam.id}', this)">
                <i class="fas fa-trash-alt"></i>
            </button>
            <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${cardColor}"></div>
        </div>
        <div class="exam-grid-body">
            <h3 class="exam-grid-title">${escapeHTML(exam.title || 'Đề thi')}</h3>
            <div class="exam-grid-meta">
                <span class="exam-grid-tag" style="color:${cardColor};background:${cardColor}18;border-color:${cardColor}30">${escapeHTML(subj)}</span>
                <span class="exam-grid-tag">${diffLabel}</span>
                <span class="exam-grid-tag"><i class="fas fa-list-ol"></i> ${qCount} câu</span>
            </div>
            <div class="exam-grid-actions">
                <button class="exam-grid-practice-btn" style="background:${cardColor}"
                    onclick="event.stopPropagation(); startPracticeEngine('${exam.id}', 'saved')">
                    <i class="fas fa-play"></i> Luyện tập
                </button>
            </div>
        </div>
    </div>`;
}

// --- SAVED EXAMS LOGIC ---

// Lưu đề vào saved_exams (dùng chung cho mọi nguồn)
async function saveExamToSavedCollection(examData, examId = null) {
    if (!AUTH.isAuth()) { AUTH.requireUser(); return false; }
    const user = AUTH.getUser();
    try {
        const ref = examId
            ? db.collection('users').doc(user.uid).collection('saved_exams').doc(examId)
            : db.collection('users').doc(user.uid).collection('saved_exams').doc();
        await ref.set({
            ...examData,
            savedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error('saveExamToSavedCollection error:', e);
        return false;
    }
}

// Xóa đề khỏi saved_exams
async function removeSavedExam(examId, btnElement) {
    if (!AUTH.isAuth()) return;
    
    // Tìm tên đề để hiển thị trong confirm
    const exam = window.cachedSavedExams?.find(e => e.id === examId);
    const title = exam?.title ? `"${exam.title}"` : 'này';
    
    if (!confirm(`Xóa đề thi ${title} khỏi thư viện của bạn?\n\nHành động này không thể hoàn tác.`)) return;
    
    const user = AUTH.getUser();
    const btn = btnElement;
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
    
    try {
        await db.collection('users').doc(user.uid).collection('saved_exams').doc(examId).delete();
        
        // Cập nhật cache
        window.cachedSavedExams = (window.cachedSavedExams || []).filter(e => e.id !== examId);
        window.cachedFavoriteExams = window.cachedSavedExams;
        
        showToast('Đã xóa khỏi thư viện.', 'info');
        
        const card = btn?.closest('.exam-grid-card');
        if (card) {
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
                card.remove();
                const remaining = document.querySelectorAll('#favorite-exams-grid .exam-grid-card').length;
                if (remaining === 0) initFavoriteExamsPage();
            }, 300);
        }
    } catch (e) {
        console.error('removeSavedExam error:', e);
        showToast('Lỗi khi xóa: ' + e.message, 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-trash-alt"></i>'; }
    }
}

// Giữ lại toggleFavoriteExam để tương thích với code cũ (nút ❤️ ở kho đề)
async function toggleFavoriteExam(examId, btnElement) {
    if (!AUTH.isAuth()) { AUTH.requireUser(); return; }
    const user = AUTH.getUser();
    const docRef = db.collection('users').doc(user.uid).collection('saved_exams').doc(examId);
    const icon = btnElement?.querySelector('i');
    try {
        const snap = await docRef.get();
        if (snap.exists) {
            await docRef.delete();
            if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
            showToast('Đã xóa khỏi thư viện.', 'info');
        } else {
            // Fetch full data
            let exam = window.cachedCreatedExams?.find(e => e.id === examId)
                     || window.cachedSavedExams?.find(e => e.id === examId);
            if (!exam || !exam.questions) {
                const s = await db.collection('users').doc(user.uid).collection('created_exams').doc(examId).get();
                if (s.exists) exam = { id: s.id, ...s.data() };
            }
            if (!exam) { showToast('Không tìm thấy dữ liệu đề thi!', 'error'); return; }
            await docRef.set({ ...exam, id: examId, savedAt: firebase.firestore.FieldValue.serverTimestamp() });
            if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
            if (btnElement) btnElement.style.color = '#3b82f6';
            showToast('Đã lưu vào thư viện! 🔖', 'success');
        }
    } catch (e) {
        console.error('toggleFavoriteExam error:', e);
        showToast('Lỗi khi cập nhật thư viện.', 'error');
    }
}

async function checkFavoriteExamsStatus(exams) {
    if (!AUTH.isAuth()) return;
    const user = AUTH.getUser();
    try {
        const snap = await db.collection('users').doc(user.uid).collection('saved_exams').get();
        const savedIds = snap.docs.map(d => d.id);
        document.querySelectorAll('.btn-favorite-toggle').forEach(btn => {
            const id = btn.dataset.examId;
            const icon = btn.querySelector('i');
            if (savedIds.includes(id)) {
                icon?.classList.remove('far');
                icon?.classList.add('fas');
            }
        });
    } catch (e) { console.error('checkFavoriteExamsStatus error:', e); }
}

async function initFavoriteExamsPage() {
    const grid = document.getElementById('favorite-exams-grid');
    if (!grid) return;

    if (!AUTH.isAuth()) {
        grid.innerHTML = `<div class="exam-grid-empty"><i class="fas fa-lock"></i><h3>Đăng nhập để xem thư viện đề thi</h3></div>`;
        return;
    }

    grid.innerHTML = `<div class="exam-grid-loading"><i class="fas fa-spinner fa-spin"></i> Đang tải thư viện...</div>`;

    const user = AUTH.getUser();
    try {
        const snap = await db.collection('users').doc(user.uid).collection('saved_exams').orderBy('savedAt', 'desc').get();
        window.cachedSavedExams = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.cachedFavoriteExams = window.cachedSavedExams; // backward compat

        if (!window.cachedSavedExams.length) {
            grid.innerHTML = `
                <div class="exam-grid-empty">
                    <i class="fas fa-bookmark" style="color:var(--blue-300)"></i>
                    <h3>Thư viện trống</h3>
                    <p>Lưu đề thi từ AI Tạo Đề, Tạo Thủ Công hoặc Kho Đề vào đây.</p>
                    <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap">
                        <button class="btn btn-primary" onclick="navigateTo('ai-generator')" style="background:#f59e0b;border:none"><i class="fas fa-wand-magic-sparkles"></i> AI Tạo Đề</button>
                        <button class="btn btn-secondary" onclick="navigateTo('subjects')"><i class="fas fa-store"></i> Kho Đề</button>
                    </div>
                </div>`;
            return;
        }

        grid.innerHTML = window.cachedSavedExams.map(exam => buildExamGridCard(exam, 'saved')).join('');
    } catch (e) {
        console.error('initFavoriteExamsPage error:', e);
        grid.innerHTML = `<div class="exam-grid-empty"><i class="fas fa-exclamation-triangle" style="color:#ef4444"></i><p>Lỗi khi tải dữ liệu.</p></div>`;
    }
}

// --- PRACTICE RESULTS ---
async function initPracticeResultsPage() {
    const container = document.getElementById('practice-results-content');
    if (!container) return;

    if (!AUTH.isAuth()) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-lock"></i><p>Đăng nhập để xem kết quả luyện tập</p></div>';
        return;
    }

    container.innerHTML = '<div style="text-align:center; padding:40px;"><i class="fas fa-spinner fa-spin text-primary" style="font-size:24px;"></i> Đang tải dữ liệu...</div>';

    const user = AUTH.getUser();
    try {
        const snap = await db.collection('users').doc(user.uid).collection('practice_results').orderBy('completedAt', 'desc').get();
        const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line" style="font-size: 48px; color: var(--text-muted);"></i>
                    <h3 style="margin-top: 16px;">Chưa có dữ liệu luyện tập</h3>
                    <p>Hoàn thành ít nhất một đề thi để xem thống kê tiến độ.</p>
                </div>`;
            return;
        }

        // Tính toán Stats
        const totalTests = results.length;
        const avgScore = results.reduce((acc, curr) => acc + curr.score_percent, 0) / totalTests;
        
        // Môn tốt nhất
        const subjectStats = {};
        results.forEach(r => {
            if (!subjectStats[r.subject]) subjectStats[r.subject] = { total: 0, count: 0 };
            subjectStats[r.subject].total += r.score_percent;
            subjectStats[r.subject].count += 1;
        });
        
        let bestSubject = '-';
        let highestAvg = -1;
        for (const [sub, data] of Object.entries(subjectStats)) {
            const avg = data.total / data.count;
            if (avg > highestAvg) {
                highestAvg = avg;
                bestSubject = sub;
            }
        }

        let html = `
        <div style="display:flex; gap:24px; margin-bottom:24px; flex-wrap:wrap;">
            <div class="stat-card" style="flex:1; min-width:200px; background:var(--card-bg); padding:20px; border-radius:12px; box-shadow:var(--shadow-sm); border:1px solid var(--border-color);">
                <div style="color:var(--text-secondary); font-size:14px; margin-bottom:8px;">Tổng số bài đã làm</div>
                <div style="font-size:32px; font-weight:800; color:var(--gray-800);">${totalTests}</div>
            </div>
            <div class="stat-card" style="flex:1; min-width:200px; background:var(--card-bg); padding:20px; border-radius:12px; box-shadow:var(--shadow-sm); border:1px solid var(--border-color);">
                <div style="color:var(--text-secondary); font-size:14px; margin-bottom:8px;">Điểm trung bình</div>
                <div style="font-size:32px; font-weight:800; color:#10b981;">${(avgScore / 10).toFixed(1)} <span style="font-size:14px; color:var(--text-muted); font-weight:400;">/10</span></div>
            </div>
            <div class="stat-card" style="flex:1; min-width:200px; background:var(--card-bg); padding:20px; border-radius:12px; box-shadow:var(--shadow-sm); border:1px solid var(--border-color);">
                <div style="color:var(--text-secondary); font-size:14px; margin-bottom:8px;">Môn tốt nhất</div>
                <div style="font-size:24px; font-weight:800; color:#3b82f6; margin-top:6px; display:-webkit-box; -webkit-line-clamp:1; overflow:hidden;">${bestSubject}</div>
            </div>
        </div>

        <div style="background:var(--card-bg); border-radius:12px; box-shadow:var(--shadow-sm); border:1px solid var(--border-color); overflow:hidden;">
            <div style="padding:16px 20px; border-bottom:1px solid var(--border-color); background:var(--bg-secondary); font-weight:700;">Lịch sử làm bài gần đây</div>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr style="border-bottom:1px solid var(--border-color); color:var(--text-secondary); font-size:13px;">
                            <th style="padding:12px 20px;">Ngày</th>
                            <th style="padding:12px 20px;">Đề thi</th>
                            <th style="padding:12px 20px;">Môn</th>
                            <th style="padding:12px 20px;">Kết quả</th>
                            <th style="padding:12px 20px;">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody style="font-size:14px;">
        `;

        html += results.map(r => {
            const date = r.completedAt ? r.completedAt.toDate().toLocaleDateString('vi-VN') : 'N/A';
            const score10 = (r.score_percent / 10).toFixed(1);
            let badgeColor = score10 >= 8 ? '#065f46; background:#d1fae5' : (score10 >= 5 ? '#92400e; background:#fef3c7' : '#991b1b; background:#fee2e2');
            
            const minutes = Math.floor(r.time_spent_seconds / 60);
            const seconds = r.time_spent_seconds % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            return `
                <tr style="border-bottom:1px solid var(--border-color); transition:background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                    <td style="padding:16px 20px; color:var(--text-secondary);">${date}</td>
                    <td style="padding:16px 20px; font-weight:600; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${r.exam_title}">${r.exam_title}</td>
                    <td style="padding:16px 20px;"><span class="badge" style="background:#f3f4f6; color:#4b5563;">${r.subject}</span></td>
                    <td style="padding:16px 20px;">
                        <span class="badge" style="color:${badgeColor.split(';')[0]}; background:${badgeColor.split(':')[1]}">
                            ${r.correct_answers}/${r.total_questions} (${score10}/10)
                        </span>
                    </td>
                    <td style="padding:16px 20px;">${timeStr}</td>
                </tr>
            `;
        }).join('');

        html += `</tbody></table></div></div>`;
        container.innerHTML = html;

    } catch (e) {
        console.error('Lỗi khi tải kết quả:', e);
        container.innerHTML = '<div class="empty-state"><p class="text-danger">Lỗi khi tải dữ liệu kết quả.</p></div>';
    }
}

// --- UPGRADE PAGE ---
function initUpgradePage() {
    const container = document.getElementById('upgrade-pricing-container');
    if (!container) return;
    
    // Check points and auth state first
    const isAuth = AUTH.isAuth();
    const currentTier = typeof PointsSystem !== 'undefined' ? PointsSystem.tier : 'free';

    container.innerHTML = `
        <div style="display:flex; gap:24px; justify-content:center; flex-wrap:wrap; margin-bottom:40px;">
            <!-- GO Tier -->
            <div style="flex:1; max-width:320px; background:var(--card-bg); border-radius:16px; padding:32px; border:1px solid var(--border-color); display:flex; flex-direction:column; opacity: ${currentTier === 'go' || currentTier === 'free' ? '1' : '0.8'}">
                <h3 style="font-size:24px; font-weight:700; margin:0; color:var(--gray-800);">GO</h3>
                <div style="font-size:36px; font-weight:800; margin:16px 0;">0đ <span style="font-size:14px; font-weight:400; color:var(--text-secondary);">/tháng</span></div>
                <p style="color:var(--text-secondary); font-size:14px; margin-bottom:24px;">Gói cơ bản cho sinh viên</p>
                <ul style="list-style:none; padding:0; margin:0 0 32px 0; font-size:14px; flex:1;">
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Mất phí 2000Đ/lần tạo đề AI</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Tối đa 10 câu / đề</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Lưu đề yêu thích</li>
                    <li style="margin-bottom:12px; color:var(--text-muted);"><i class="fas fa-times" style="margin-right:8px;"></i> Không hỗ trợ xuất PDF</li>
                    <li style="margin-bottom:12px; color:var(--text-muted);"><i class="fas fa-times" style="margin-right:8px;"></i> Không thống kê nâng cao</li>
                </ul>
                <button class="btn btn-secondary w-full" disabled>${currentTier === 'go' || currentTier === 'free' ? 'Đang Sử Dụng' : 'Gói Mặc Định'}</button>
            </div>

            <!-- PLUS Tier -->
            <div style="flex:1; max-width:320px; background:var(--card-bg); border-radius:16px; padding:32px; border:2px solid #3b82f6; position:relative; display:flex; flex-direction:column; transform:scale(1.05); box-shadow:0 20px 40px rgba(59,130,246,0.15);">
                <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#3b82f6; color:#fff; padding:4px 16px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase;">Phổ Biến</div>
                <h3 style="font-size:24px; font-weight:700; margin:0; color:#3b82f6;">PLUS</h3>
                <div style="font-size:36px; font-weight:800; margin:16px 0;">50.000đ <span style="font-size:14px; font-weight:400; color:var(--text-secondary);">/tháng</span></div>
                <p style="color:var(--text-secondary); font-size:14px; margin-bottom:24px;">Phù hợp để ôn thi giữa kì & cuối kì</p>
                <ul style="list-style:none; padding:0; margin:0 0 32px 0; font-size:14px; flex:1;">
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Miễn phí <b>20 lần</b> Tạo đề AI</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Tối đa <b>20 câu</b> / đề</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Lưu 50 đề yêu thích</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Hỗ trợ xuất PDF chuyên nghiệp</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> +5% Bonus nạp điểm</li>
                </ul>
                <button class="btn btn-primary w-full" style="background:#3b82f6; border-color:#3b82f6;" 
                    ${currentTier === 'plus' ? 'disabled' : ''} 
                    onclick="upgradeAccount('plus', 50000)">
                    ${currentTier === 'plus' ? 'Đang Sử Dụng' : 'Nâng Cấp Bằng 50K Điểm'}
                </button>
            </div>

            <!-- ULTRA Tier -->
            <div style="flex:1; max-width:320px; background:var(--card-bg); border-radius:16px; padding:32px; border:1px solid #8b5cf6; display:flex; flex-direction:column;">
                <h3 style="font-size:24px; font-weight:700; margin:0; color:#8b5cf6;">ULTRA</h3>
                <div style="font-size:36px; font-weight:800; margin:16px 0;">100.000đ <span style="font-size:14px; font-weight:400; color:var(--text-secondary);">/tháng</span></div>
                <p style="color:var(--text-secondary); font-size:14px; margin-bottom:24px;">Không giới hạn tính năng & tốc độ</p>
                <ul style="list-style:none; padding:0; margin:0 0 32px 0; font-size:14px; flex:1;">
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> <b>Không giới hạn</b> Tạo đề AI</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Ưu tiên AI Engine (Tốc độ x2)</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Lưu vô hạn đề yêu thích</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> Thống kê nâng cao</li>
                    <li style="margin-bottom:12px;"><i class="fas fa-check text-success" style="margin-right:8px;"></i> +10% Bonus nạp điểm</li>
                </ul>
                <button class="btn btn-primary w-full" style="background:#8b5cf6; border-color:#8b5cf6;" 
                    ${currentTier === 'ultra' ? 'disabled' : ''} 
                    onclick="upgradeAccount('ultra', 100000)">
                    ${currentTier === 'ultra' ? 'Đang Sử Dụng' : 'Nâng Cấp Bằng 100K Điểm'}
                </button>
            </div>
        </div>
    `;
}

function upgradeAccount(tier, cost) {
    if (!AUTH.isAuth()) {
        AUTH.requireUser(() => navigateTo('upgrade'));
        return;
    }

    if (PointsSystem.balance < cost) {
        showToast(`Không đủ điểm! Bạn cần ${cost.toLocaleString()} điểm để nâng cấp. Vui lòng nạp thêm.`, 'error');
        openTopupModal();
        return;
    }

    if (confirm(`Bạn có chắc chắn muốn dùng ${cost.toLocaleString()} Điểm để nâng cấp lên gói ${tier.toUpperCase()} không?`)) {
        PointsSystem.deductPoints(cost, `Nâng cấp gói tài khoản ${tier.toUpperCase()} 30 ngày`).then(success => {
            if (success) {
                const user = AUTH.getUser();
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);

                db.collection('users').doc(user.uid).update({
                    account_tier: tier,
                    tier_expires_at: expiryDate
                }).then(() => {
                    PointsSystem.tier = tier;
                    PointsSystem.updateUI();
                    showToast(`Chúc mừng! Bạn đã nâng cấp thành công gói ${tier.toUpperCase()}.`, 'success');
                    initUpgradePage();
                });
            }
        });
    }
}

// --- FULL PRACTICE ENGINE ---

let practiceState = {
    examData: null,
    currentIndex: 0,
    answers: [], // store user selected index
    timerSeconds: 0,
    timerInterval: null
};

function startPracticeEngine(examId, source = 'created') {
    if (!AUTH.isAuth()) {
        AUTH.requireUser();
        return;
    }
    
    // Find exam
    let exam = null;
    if (source === 'created') exam = window.cachedCreatedExams?.find(e => e.id === examId);
    else if (source === 'favorite') exam = window.cachedFavoriteExams?.find(e => e.id === examId);
    else if (source === 'saved') exam = window.cachedSavedExams?.find(e => e.id === examId)
                                     || window.cachedFavoriteExams?.find(e => e.id === examId);

    if (!exam || !exam.questions || exam.questions.length === 0) {
        showToast('Lỗi: Không tìm thấy dữ liệu đề thi!', 'error');
        return;
    }

    // Initialize State
    practiceState.examData = exam;
    practiceState.currentIndex = 0;
    practiceState.answers = new Array(exam.questions.length).fill(null);
    practiceState.timerSeconds = 0;

    // UI Setup
    document.getElementById('practice-engine-overlay').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Build Navigation Grid
    const navGrid = document.getElementById('practice-nav-grid');
    navGrid.innerHTML = exam.questions.map((q, idx) => `
        <button id="prac-nav-btn-${idx}" class="prac-nav-btn" 
            style="width:36px; height:36px; border-radius:50%; border:1px solid var(--border-color); background:var(--bg-secondary); color:var(--text-secondary); cursor:pointer; transition:0.2s;"
            onclick="goToPracticeQuestion(${idx})">
            ${idx + 1}
        </button>
    `).join('');

    renderPracticeQuestion();
    
    // Start Timer
    const timerEl = document.getElementById('practice-timer');
    timerEl.textContent = '00:00';
    if (practiceState.timerInterval) clearInterval(practiceState.timerInterval);
    practiceState.timerInterval = setInterval(() => {
        practiceState.timerSeconds++;
        const m = Math.floor(practiceState.timerSeconds / 60).toString().padStart(2, '0');
        const s = (practiceState.timerSeconds % 60).toString().padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
    }, 1000);
}

function renderPracticeQuestion() {
    const q = practiceState.examData.questions[practiceState.currentIndex];
    const container = document.getElementById('practice-question-container');
    const selectedAnswer = practiceState.answers[practiceState.currentIndex];

    // Helper alphabet A, B, C, D
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
            <span class="badge" style="background:var(--blue-100); color:var(--blue-700)">Câu ${practiceState.currentIndex + 1} / ${practiceState.examData.questions.length}</span>
            <span class="badge" style="background:var(--gray-200); color:var(--gray-700)">${q.difficulty === 'hard' ? 'Khó' : (q.difficulty === 'medium' ? 'Trung bình' : 'Dễ')}</span>
        </div>
        <h3 style="margin-top:0; color:var(--gray-800); line-height:1.5;">${q.content}</h3>
        <div style="margin-top:24px; display:flex; flex-direction:column; gap:12px;">
            ${q.options.map((opt, idx) => {
                const isChecked = selectedAnswer === alphabet[idx];
                const borderStyle = isChecked ? 'border:2px solid #3b82f6; background:#eff6ff;' : 'border:1px solid var(--border-color); background:var(--card-bg);';
                
                return `
                <label style="display:flex; align-items:center; gap:16px; padding:16px; border-radius:12px; cursor:pointer; transition:all 0.2s; ${borderStyle}">
                    <input type="radio" name="prac_q" value="${alphabet[idx]}" ${isChecked ? 'checked' : ''} onchange="selectPracticeAnswer('${alphabet[idx]}')" style="width:20px; height:20px; cursor:pointer;">
                    <span style="font-size:15px; ${isChecked ? 'font-weight:600; color:#1e3a8a;' : 'color:var(--gray-700);'}">${opt}</span>
                </label>
                `;
            }).join('')}
        </div>
    `;

    // Update Nav Buttons Styles
    document.querySelectorAll('.prac-nav-btn').forEach((btn, idx) => {
        if (idx === practiceState.currentIndex) {
            btn.style.border = '2px solid #3b82f6';
            btn.style.boxShadow = '0 0 0 3px #bfdbfe';
        } else {
            btn.style.border = practiceState.answers[idx] ? 'none' : '1px solid var(--border-color)';
            btn.style.boxShadow = 'none';
        }
        
        if (practiceState.answers[idx]) {
            btn.style.background = '#3b82f6';
            btn.style.color = '#fff';
            btn.style.fontWeight = '700';
        } else {
            btn.style.background = 'var(--bg-secondary)';
            btn.style.color = 'var(--text-secondary)';
            btn.style.fontWeight = '400';
        }
    });

    // Update Prev/Next/Submit visibility
    document.getElementById('btn-practice-prev').disabled = practiceState.currentIndex === 0;
    
    const isLast = practiceState.currentIndex === practiceState.examData.questions.length - 1;
    document.getElementById('btn-practice-next').style.display = isLast ? 'none' : 'block';
    document.getElementById('btn-practice-submit').style.display = isLast ? 'block' : 'none';
}

function selectPracticeAnswer(val) {
    practiceState.answers[practiceState.currentIndex] = val;
    renderPracticeQuestion(); // Re-render to show selection styling
}

function goToPracticeQuestion(idx) {
    practiceState.currentIndex = idx;
    renderPracticeQuestion();
}

// Add global events for Practice Nav
document.addEventListener('DOMContentLoaded', () => {
    const btnPrev = document.getElementById('btn-practice-prev');
    const btnNext = document.getElementById('btn-practice-next');
    const btnSubmit = document.getElementById('btn-practice-submit');
    const btnExit = document.getElementById('btn-practice-exit');

    if (btnPrev) btnPrev.addEventListener('click', () => goToPracticeQuestion(practiceState.currentIndex - 1));
    if (btnNext) btnNext.addEventListener('click', () => goToPracticeQuestion(practiceState.currentIndex + 1));
    if (btnSubmit) btnSubmit.addEventListener('click', submitPracticeExam);
    
    if (btnExit) {
        btnExit.addEventListener('click', () => {
            if (confirm("Thoát luyện tập? Tiến trình hiện tại sẽ không được lưu.")) {
                closePracticeEngine();
            }
        });
    }
});

function closePracticeEngine() {
    document.getElementById('practice-engine-overlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    clearInterval(practiceState.timerInterval);
}

async function submitPracticeExam() {
    // Check if any unanswered
    const unanswered = practiceState.answers.filter(a => a === null).length;
    if (unanswered > 0) {
        if (!confirm(`Bạn còn ${unanswered} câu chưa làm. Bạn có chắc chắn muốn nộp bài?`)) return;
    }

    clearInterval(practiceState.timerInterval);
    const btnSubmit = document.getElementById('btn-practice-submit');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang chấm...';

    // Calculate score
    let correctCount = 0;
    const answerDetails = [];
    
    practiceState.examData.questions.forEach((q, idx) => {
        const userAns = practiceState.answers[idx];
        const isCorrect = userAns === q.correct_answer;
        if (isCorrect) correctCount++;
        
        answerDetails.push({
            qIdx: idx,
            selected: userAns,
            correct: q.correct_answer,
            isCorrect: isCorrect
        });
    });

    const scorePercent = (correctCount / practiceState.examData.questions.length) * 100;

    // Save to Firestore
    const user = AUTH.getUser();
    try {
        await db.collection('users').doc(user.uid).collection('practice_results').add({
            exam_id: practiceState.examData.id,
            exam_title: practiceState.examData.title,
            subject: practiceState.examData.subject,
            total_questions: practiceState.examData.questions.length,
            correct_answers: correctCount,
            score_percent: scorePercent,
            time_spent_seconds: practiceState.timerSeconds,
            answers: answerDetails,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast('Nộp bài thành công!', 'success');
        
        // Show review screen
        showPracticeReviewScreen(correctCount, scorePercent, answerDetails);

    } catch (e) {
        console.error('Lỗi khi lưu kết quả:', e);
        showToast('Chấm điểm thành công nhưng không thể lưu vào máy chủ.', 'warning');
        showPracticeReviewScreen(correctCount, scorePercent, answerDetails);
    }
}

function showPracticeReviewScreen(correctCount, scorePercent, answerDetails) {
    const container = document.getElementById('practice-question-container');
    const navGrid = document.getElementById('practice-nav-grid');
    const totalQ = practiceState.examData.questions.length;
    const score10 = (scorePercent / 10).toFixed(1);

    // Hide control buttons
    document.getElementById('btn-practice-prev').style.display = 'none';
    document.getElementById('btn-practice-next').style.display = 'none';
    document.getElementById('btn-practice-submit').style.display = 'none';

    // Render Stats
    container.innerHTML = `
        <div style="text-align:center; padding:32px 0;">
            <i class="fas fa-trophy" style="font-size:48px; color:#eab308; margin-bottom:16px;"></i>
            <h2 style="font-size:28px; margin:0; color:var(--gray-800);">Hoàn Thành Bài Thi</h2>
            <div style="font-size:48px; font-weight:900; color:#10b981; margin:16px 0;">${score10} <span style="font-size:20px; color:var(--text-muted); font-weight:400">/ 10 Điểm</span></div>
            <p style="color:var(--text-secondary); font-size:16px;">Số câu đúng: <b>${correctCount}/${totalQ}</b> | Thời gian: <b>${Math.floor(practiceState.timerSeconds/60)}:${(practiceState.timerSeconds%60).toString().padStart(2,'0')}</b></p>
            <button class="btn btn-primary" style="margin-top:24px;" onclick="closePracticeEngine(); navigateTo('practice-results');"><i class="fas fa-chart-bar"></i> Xem Bảng Thống Kê</button>
        </div>
        <hr style="border:none; border-top:1px solid var(--border-color); margin:32px 0;">
        <h3 style="margin-bottom:24px;">Chi tiết đáp án:</h3>
        <div id="review-questions-list" style="display:flex; flex-direction:column; gap:32px;"></div>
    `;

    // Render Review List
    const reviewList = document.getElementById('review-questions-list');
    let reviewHtml = '';

    practiceState.examData.questions.forEach((q, idx) => {
        const detail = answerDetails[idx];
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        let optionsHtml = q.options.map((opt, oIdx) => {
            const letter = alphabet[oIdx];
            let style = 'border:1px solid var(--border-color); background:var(--card-bg);';
            let icon = '';
            
            if (letter === detail.correct) {
                // Đáp án đúng luôn tô màu xanh
                style = 'border:2px solid #10b981; background:#d1fae5; color:#065f46; font-weight:bold;';
                icon = '<i class="fas fa-check-circle" style="color:#10b981"></i> ';
            } else if (letter === detail.selected && !detail.isCorrect) {
                // Đáp án sai user chọn tô màu đỏ
                style = 'border:2px solid #ef4444; background:#fee2e2; color:#991b1b; text-decoration:line-through;';
                icon = '<i class="fas fa-times-circle" style="color:#ef4444"></i> ';
            }

            return `<div style="padding:12px 16px; border-radius:8px; margin-bottom:8px; ${style}">${icon}${opt}</div>`;
        }).join('');

        reviewHtml += `
            <div style="background:var(--bg-secondary); padding:20px; border-radius:12px; border:1px solid var(--border-color);">
                <div style="display:flex; gap:12px; align-items:flex-start;">
                    <div style="background:${detail.isCorrect ? '#10b981' : '#ef4444'}; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; flex-shrink:0;">${idx+1}</div>
                    <div style="flex:1;">
                        <h4 style="margin:0 0 16px 0; line-height:1.5;">${q.content}</h4>
                        ${optionsHtml}
                        <div style="margin-top:16px; padding:12px; background:var(--blue-50); border-left:4px solid var(--blue-500); border-radius:4px; font-size:14px; color:var(--blue-800);">
                            <strong>Giải thích:</strong> ${q.explanation || 'Không có giải thích cho câu này.'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    reviewList.innerHTML = reviewHtml;

    // Remove Navigation grid since review shows all
    navGrid.innerHTML = '';
}
