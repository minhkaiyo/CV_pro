
/* =============================================
   exam-keys.js — Exam Access Key System v2
   Features:
   - Public / Private key visibility per key
   - Users can request access to private keys
   - Admin notification panel for pending requests
   - Admin can approve per-user OR make public
   ============================================= */

const EXAM_NAMES = {
    dsp: 'Digital Signal Processing',
    vxl: 'Microprocessors'
};

const ExamKeys = {
    _keys: [],
    _userAccess: [],      // keys this user has been granted
    _requests: [],        // all requests (admin view)
    _pendingExamId: null,
    _pendingExamUrl: null,
    _pendingKeyId: null,  // for request-key modal

    // --- Random 12-char key ---
    generateKey() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let k = '';
        for (let i = 0; i < 12; i++) k += chars.charAt(Math.floor(Math.random() * chars.length));
        return k;
    },

    init() {
        // Listen to all exam keys
        examKeysRef.orderBy('createdAt', 'desc').onSnapshot(snap => {
            this._keys = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            this.renderPublicKeyList();
            this.renderAdminKeyList();
        });

        // Listen to this user's granted access
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                userKeyAccessRef.where('userId', '==', user.uid).onSnapshot(snap => {
                    this._userAccess = snap.docs.map(d => d.data().keyId);
                    this.renderPublicKeyList();
                });
            } else {
                this._userAccess = [];
                this.renderPublicKeyList();
            }
        });

        // Admin: listen to key requests
        keyRequestsRef.orderBy('createdAt', 'desc').onSnapshot(snap => {
            this._requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (AUTH.isAdmin()) {
                this.renderAdminNotifications();
            }
        });

        // Auto-refresh Admin User List every 3s if modal is open
        setInterval(() => {
            const modal = document.getElementById('modal-user-manager');
            if (modal && modal.classList.contains('visible') && AUTH.isAdmin()) {
                // To avoid disrupting the admin (e.g. while they are clicking), we'll do a soft refresh
                // But since the current implementation re-renders the whole table, it's fine for now.
                this.renderAdminUserList(true);
            }
        }, 3000);

        // Admin: listen to new automated payments
        userKeyAccessRef.orderBy('grantedAt', 'desc').limit(1).onSnapshot(snap => {
            if (AUTH.isAdmin() && !snap.empty) {
                const doc = snap.docs[0].data();
                if (doc.transaction && (Date.now() - new Date(doc.grantedAt).getTime() < 15000)) {
                    showToast(`💰 Payment: ${doc.userName} (${doc.userEmail}) paid ${parseInt(doc.transaction.amount).toLocaleString('en-US')} VND via ${doc.transaction.account}!`, 'success');
                }
            }
        });

        this._bindEvents();
    },

    _bindEvents() {
        // FAB
        document.getElementById('btn-show-exam-keys')?.addEventListener('click', () => {
            document.getElementById('exam-key-panel').classList.toggle('visible');
        });
        document.getElementById('btn-close-key-panel')?.addEventListener('click', () => {
            document.getElementById('exam-key-panel').classList.remove('visible');
        });

        // Admin notification bell
        document.getElementById('admin-notif-btn')?.addEventListener('click', () => {
            document.getElementById('admin-notif-panel').classList.toggle('visible');
            this.renderAdminNotifications();
        });
        document.getElementById('btn-close-notif-panel')?.addEventListener('click', () => {
            document.getElementById('admin-notif-panel').classList.remove('visible');
        });

        // Verify key
        document.getElementById('btn-verify-exam-key')?.addEventListener('click', () => this.verifyKey());
        document.getElementById('exam-key-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.verifyKey();
        });

        // Hint link
        document.getElementById('exam-key-hint-link')?.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('modal-exam-key').classList.remove('visible');
            navigateTo('home');
            setTimeout(() => document.getElementById('exam-key-panel').classList.add('visible'), 300);
        });

        // Exam cards
        document.querySelectorAll('.exam-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleExamCardClick(card.dataset.examId, card.dataset.examUrl);
            });
        });

        // Admin key manager
        document.getElementById('btn-open-key-manager')?.addEventListener('click', () => {
            AUTH.requireAdmin(() => {
                document.getElementById('exam-key-panel').classList.remove('visible');
                document.getElementById('modal-key-manager').classList.add('visible');
                this.renderAdminKeyList();
            });
        });

        // Admin User manager
        document.getElementById('btn-open-user-manager')?.addEventListener('click', () => {
            AUTH.requireAdmin(() => {
                document.getElementById('exam-key-panel').classList.remove('visible');
                document.getElementById('modal-user-manager').classList.add('visible');
                this.renderAdminUserList();
            });
        });

        document.getElementById('admin-user-search')?.addEventListener('input', () => {
            this.renderAdminUserList();
        });
        document.getElementById('btn-generate-key')?.addEventListener('click', () => this.createKey());

        // Modal close buttons
        document.querySelectorAll('[data-modal="modal-exam-key"],[data-modal="modal-key-manager"],[data-modal="modal-request-key"]').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal-overlay').classList.remove('visible');
                if (this._pollingInterval) clearInterval(this._pollingInterval);
            });
        });

        // Send key request
        document.getElementById('btn-send-key-request')?.addEventListener('click', () => this.sendKeyRequest());
    },

    handleExamCardClick(examId, examUrl) {
        AUTH.requireUser(() => {
            this._pendingExamId = examId;
            this._pendingExamUrl = examUrl;
            const name = EXAM_NAMES[examId] || examId;
            document.getElementById('exam-key-prompt').textContent = `Enter the 12-character key to unlock: "${name}"`;
            document.getElementById('exam-key-input').value = '';
            document.getElementById('exam-key-error').style.display = 'none';
            document.getElementById('modal-exam-key').classList.add('visible');
            setTimeout(() => document.getElementById('exam-key-input').focus(), 200);
        });
    },

    verifyKey() {
        const input = document.getElementById('exam-key-input').value.trim().toUpperCase();
        const errEl = document.getElementById('exam-key-error');
        const user = AUTH.getUser();

        if (input.length !== 12) {
            errEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Key code must be exactly 12 characters!';
            errEl.style.display = 'block';
            return;
        }

        const match = this._keys.find(k => k.key === input && k.examId === this._pendingExamId);
        if (!match) {
            errEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Incorrect key code!';
            errEl.style.display = 'block';
            document.getElementById('exam-key-input').classList.add('shake');
            setTimeout(() => document.getElementById('exam-key-input').classList.remove('shake'), 500);
            return;
        }

        // Key found — check visibility
        if (match.visibility === 'public' || AUTH.isAdmin() || this._userAccess.includes(match.id)) {
            // Access granted
            document.getElementById('modal-exam-key').classList.remove('visible');
            showToast('Unlocked successfully!', 'success');
            setTimeout(() => window.open(this._pendingExamUrl, '_blank'), 500);
        } else {
            // Key is private and user not granted
            errEl.innerHTML = '<i class="fas fa-lock"></i> This key is private. You have not been granted access yet.';
            errEl.style.display = 'block';
        }
    },

    // --- Admin: Create Key ---
    async createKey() {
        const examId = document.getElementById('key-exam-select').value;
        const price = parseInt(document.getElementById('key-price-input').value) || 10000;
        const key = this.generateKey();
        try {
            await examKeysRef.add({
                examId,
                key,
                price,
                visibility: 'private', // default private
                createdAt: new Date().toISOString()
            });
            showToast(`New key generated (Private): ${key}`, 'success');
        } catch (e) {
            showToast('Error: ' + e.message, 'error');
        }
    },

    async updatePrice(docId, price) {
        const p = parseInt(price) || 0;
        try {
            await examKeysRef.doc(docId).update({ price: p });
            showToast(`Price updated to ${p.toLocaleString()} VNĐ!`, 'success');
        } catch (e) {
            showToast('Error: ' + e.message, 'error');
        }
    },

    // --- Admin: Delete Key ---
    async deleteKey(docId) {
        try {
            await examKeysRef.doc(docId).delete();
            // Also delete associated access grants
            const snap = await userKeyAccessRef.where('keyId', '==', docId).get();
            for (const d of snap.docs) await d.ref.delete();
            showToast('Key deleted.', 'info');
        } catch (e) {
            showToast('Error: ' + e.message, 'error');
        }
    },

    // --- Admin: Toggle Visibility ---
    async setVisibility(docId, visibility) {
        try {
            await examKeysRef.doc(docId).update({ visibility });
            showToast(visibility === 'public' ? '🌐 Key is now public!' : '🔒 Key is now private!', 'success');
        } catch (e) {
            showToast('Error: ' + e.message, 'error');
        }
    },

    // --- Admin: Approve Individual Request ---
    async approveRequest(requestId, userId, keyId) {
        try {
            // Grant access
            await userKeyAccessRef.add({ userId, keyId, grantedAt: new Date().toISOString() });
            // Update request status
            await keyRequestsRef.doc(requestId).update({ status: 'approved' });
            showToast('Access granted to the user!', 'success');
        } catch (e) {
            showToast('Error: ' + e.message, 'error');
        }
    },

    // --- Admin: Reject Request ---
    async rejectRequest(requestId) {
        try {
            await keyRequestsRef.doc(requestId).update({ status: 'rejected' });
            showToast('Request rejected.', 'info');
        } catch (e) {
            showToast('Error: ' + e.message, 'error');
        }
    },

    // --- User: Send Key Request ---
    async sendKeyRequest() {
        const user = AUTH.getUser();
        if (!user) { showToast('You need to sign in!', 'error'); return; }

        const keyId = this._pendingKeyId;
        const examId = this._pendingExamId;
        const note = document.getElementById('request-note').value.trim();
        const statusEl = document.getElementById('request-key-status');

        // Check if already requested
        const existing = this._requests.find(r => r.userId === user.uid && r.keyId === keyId && r.status === 'pending');
        if (existing) {
            statusEl.innerHTML = '<span style="color:#f59e0b">⏳ You have already submitted a request. Please wait for Admin approval.</span>';
            statusEl.style.display = 'block';
            return;
        }

        try {
            await keyRequestsRef.add({
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || user.email.split('@')[0],
                examId,
                keyId,
                examName: EXAM_NAMES[examId] || examId,
                note,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            statusEl.innerHTML = '<span style="color:#22c55e">✅ Request submitted successfully! The admin will review it shortly.</span>';
            statusEl.style.display = 'block';
            document.getElementById('btn-send-key-request').disabled = true;
            showToast('Request sent to admin!', 'success');
        } catch (e) {
            showToast('Error: ' + e.message, 'error');
        }
    },

    // --- Render Public Key Panel ---
    renderPublicKeyList() {
        const container = document.getElementById('exam-key-list');
        if (!container) return;

        if (this._keys.length === 0) {
            container.innerHTML = '<p style="padding:16px;text-align:center;color:var(--text-secondary);font-size:13px">No key codes available.</p>';
            return;
        }

        const grouped = {};
        this._keys.forEach(k => {
            if (!grouped[k.examId]) grouped[k.examId] = [];
            grouped[k.examId].push(k);
        });

        let html = '';
        for (const [examId, keys] of Object.entries(grouped)) {
            const name = EXAM_NAMES[examId] || examId;
            html += `<div class="key-group">
                <div class="key-group-title"><i class="fas fa-book"></i> ${name}</div>
                ${keys.map(k => {
                    const isPublic = k.visibility === 'public';
                    const hasAccess = this._userAccess.includes(k.id);
                    const isAdmin = AUTH.isAdmin();

                    if (isPublic || isAdmin || hasAccess) {
                        return `<div class="key-item">
                            <div style="display:flex;align-items:center;gap:8px">
                                <span class="key-visibility-dot ${isPublic ? 'dot-public' : 'dot-private'}" title="${isPublic ? 'Public' : 'Private'}"></span>
                                <code class="key-code">${k.key}</code>
                            </div>
                            <button class="btn-copy-key" onclick="navigator.clipboard.writeText('${k.key}');showToast('Copied!','success')" title="Copy">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>`;
                    } else {
                        // Private key — show request button
                        const user = AUTH.getUser();
                        const alreadyRequested = this._requests.some(r => r.userId === user?.uid && r.keyId === k.id && r.status === 'pending');
                        return `<div class="key-item key-item-locked">
                            <div style="display:flex;align-items:center;gap:8px">
                                <span class="key-visibility-dot dot-private" title="Private"></span>
                                <span style="font-size:12px;color:var(--text-secondary);letter-spacing:1px">••••••••••••</span>
                            </div>
                            ${alreadyRequested
                                ? `<button class="btn-request-key" style="background:var(--orange-500); padding: 4px 10px; font-size: 11px; margin-top:0;" onclick="ExamKeys.openRequestModal('${k.id}','${k.examId}')">
                                    <i class="fas fa-hourglass-half"></i> Chờ duyệt (Nạp Mở Ngay)
                                </button>`
                                : `<button class="btn-request-key" onclick="ExamKeys.openRequestModal('${k.id}','${k.examId}')">
                                    <i class="fas fa-key"></i> Mở khóa
                                </button>`
                            }
                        </div>`;
                    }
                }).join('')}
            </div>`;
        }
        container.innerHTML = html;
    },

    openRequestModal(keyId, examId) {
        const user = AUTH.getUser();
        if (!user) { AUTH.requireUser(() => this.openRequestModal(keyId, examId)); return; }
        
        this._pendingKeyId = keyId;
        this._pendingExamId = examId;

        const key = this._keys.find(k => k.id === keyId);
        const price = key?.price || 10000;
        
        // Update price display text
        document.getElementById('payment-price-text').textContent = price.toLocaleString('en-US') + ' Điểm';
        
        // Show current points balance
        if (typeof PointsSystem !== 'undefined') {
            document.getElementById('current-balance-display').textContent = PointsSystem.balance.toLocaleString('en-US');
        }

        // Bind Pay with points
        document.getElementById('btn-pay-with-points').onclick = async () => {
            const btn = document.getElementById('btn-pay-with-points');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            if (PointsSystem.balance < price) {
                showToast(`Không đủ điểm! Bạn cần ${price.toLocaleString()} điểm để mở khóa đề thi.`, 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-unlock"></i> Thanh toán & Mở khóa';
                
                // Close current modal and open topup modal
                closeModal('modal-request-key');
                setTimeout(() => openTopupModal(), 500);
                return;
            }

            // Deduct points
            const success = await PointsSystem.deductPoints(price, `Mở khóa đề thi ${this._pendingKeyId}`);
            if (success) {
                // Grant access in Firebase
                await userKeyAccessRef.add({ 
                    userId: user.uid, 
                    userEmail: user.email,
                    userName: user.displayName || user.email.split('@')[0],
                    keyId: this._pendingKeyId, 
                    grantedAt: new Date().toISOString(),
                    transaction: `Points_Unlock_${Date.now()}`
                });

                showToast('Thanh toán thành công! Đã mở khóa đề thi.', 'success');
                closeModal('modal-request-key');
                this.loadAdminKeys();
                
                // Open exam immediately
                if (key && key.url) {
                    window.open(key.url, '_blank');
                } else if (this._pendingExamUrl) {
                    window.open(this._pendingExamUrl, '_blank');
                }
            } else {
                showToast('Lỗi trừ điểm. Vui lòng thử lại.', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-unlock"></i> Thanh toán & Mở khóa';
            }
        };

        openModal('modal-request-key');
    },

    // --- Admin: Render Key List with visibility toggle ---
    renderAdminKeyList() {
        const container = document.getElementById('admin-key-list');
        if (!container) return;

        if (this._keys.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);font-size:13px;padding:12px">No key codes available.</p>';
            return;
        }

        container.innerHTML = this._keys.map(k => {
            const isPublic = k.visibility === 'public';
            const price = k.price || 10000;
            return `<div class="admin-key-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding:10px 0;">
                <div style="flex:1">
                    <code style="font-size:14px;font-weight:700;letter-spacing:1px">${k.key}</code>
                    <span style="font-size:11px;color:var(--text-secondary);margin-left:6px">${EXAM_NAMES[k.examId] || k.examId}</span>
                    <div style="margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                        <button class="btn-toggle-vis ${isPublic ? 'vis-public' : 'vis-private'}"
                            onclick="AUTH.requireAdmin(()=>ExamKeys.setVisibility('${k.id}','${isPublic ? 'private' : 'public'}'))" style="padding:4px 8px;font-size:11px">
                            <i class="fas ${isPublic ? 'fa-globe' : 'fa-lock'}"></i>
                            ${isPublic ? 'Public' : 'Private'}
                        </button>
                        <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px;">
                            <span style="color:var(--text-secondary)">Price (VND):</span>
                            <input type="number" value="${price}" step="1000" min="0" 
                                style="width:85px; padding:2px 6px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-primary); font-size:12px;"
                                onchange="AUTH.requireAdmin(()=>ExamKeys.updatePrice('${k.id}', this.value))">
                        </div>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="AUTH.requireAdmin(()=>ExamKeys.deleteKey('${k.id}'))" style="padding:4px 8px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
        }).join('');
    },

    // --- Admin: Render User List ---
    async renderAdminUserList(isSilent = false) {
        const container = document.getElementById('admin-user-list');
        if (!container) return;
        if (!isSilent) container.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu người dùng...</td></tr>';
        
        try {
            const usersSnap = await db.collection('users').get();
            const accessSnap = await userKeyAccessRef.get();
            
            const accesses = accessSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const searchQ = (document.getElementById('admin-user-search')?.value || '').toLowerCase();
            
            let html = '';
            usersSnap.docs.forEach(doc => {
                const u = doc.data();
                const uId = doc.id;
                
                if (searchQ && !((u.email||'').toLowerCase().includes(searchQ) || (u.displayName||'').toLowerCase().includes(searchQ))) return;
                
                const userAccesses = accesses.filter(a => a.userId === uId);
                const keysHtml = userAccesses.map(a => {
                    const k = this._keys.find(key => key.id === a.keyId);
                    return `<div style="background:var(--blue-50);border:1px solid var(--blue-200);border-radius:4px;padding:4px 8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-family:monospace;color:var(--blue-800);font-size:11px;">${k ? k.key : 'Khóa không xác định'}</span>
                        <button class="btn-icon" style="color:var(--red-500);font-size:10px" onclick="AUTH.requireAdmin(()=>ExamKeys.revokeUserKey('${a.id}'))" title="Thu hồi Khóa"><i class="fas fa-times"></i></button>
                    </div>`;
                }).join('') || '<span style="color:var(--text-secondary);font-size:11px">Chưa có mã khóa</span>';

                const loginTime = u.lastLoginAt?.toDate ? u.lastLoginAt.toDate().toLocaleString('vi-VN') : 'Chưa từng';
                const createdTime = u.createdAt?.toDate ? u.createdAt.toDate().toLocaleString('vi-VN') : 'Không rõ';
                const isBanned = u.banned === true;
                
                // Determine Online status based on lastActive (within 5 minutes)
                let isOnline = false;
                if (u.lastActive && u.lastActive.toDate) {
                    const diff = Date.now() - u.lastActive.toDate().getTime();
                    if (diff < 5 * 60 * 1000) isOnline = true;
                }
                const statusHtml = isOnline 
                    ? `<span style="color:#10b981; font-size:10px; border:1px solid currentColor; padding:2px 4px; border-radius:4px; margin-left:4px"><i class="fas fa-circle"></i> Online</span>`
                    : `<span style="color:#64748b; font-size:10px; border:1px solid currentColor; padding:2px 4px; border-radius:4px; margin-left:4px"><i class="far fa-circle"></i> Offline</span>`;

                html += `<tr style="border-bottom: 1px solid var(--border-color); ${isBanned ? 'opacity: 0.6; background: #fee2e2;' : ''}">
                    <td style="padding: 10px;">
                        <div style="font-weight:600;color:var(--text-primary);font-size:13px">${u.displayName || 'Khách (Chưa có tên)'} ${isBanned ? '<span style="color:var(--red-500);font-size:10px;border:1px solid currentColor;padding:2px 4px;border-radius:4px;margin-left:4px">ĐÃ BỊ KHÓA</span>' : ''} ${statusHtml}</div>
                        <div style="font-size:11px;color:var(--text-secondary)">${u.email || 'Không có Email'}</div>
                        <div style="font-size:10px;color:var(--orange-500);margin-top:2px">Tham gia: ${createdTime}</div>
                        <div style="display:flex; gap:4px; margin-top:6px;">
                            <button class="btn btn-secondary btn-sm" onclick="AUTH.requireAdmin(()=>ExamKeys.viewUserHistory('${uId}', '${(u.displayName || u.email).replace(/'/g, "\\'")}'))" style="padding:2px 6px; font-size:10px;"><i class="fas fa-history"></i> Lịch sử</button>
                            <button class="btn btn-ghost btn-sm" onclick="AUTH.requireAdmin(()=>ExamKeys.viewUserProfile('${uId}'))" style="padding:2px 6px; font-size:10px; border:1px solid var(--border-color)"><i class="fas fa-id-card"></i> Hồ sơ</button>
                        </div>
                    </td>
                    <td style="padding: 10px; font-size:11px; color:var(--text-secondary);">
                        <div><i class="fas fa-clock"></i> Đăng nhập: ${loginTime}</div>
                        <div><i class="fas fa-network-wired"></i> IP: ${u.lastIpAddress || 'Không rõ'}</div>
                        <div style="max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${u.userAgent || ''}"><i class="fas fa-desktop"></i> ${u.userAgent || 'Thiết bị không rõ'}</div>
                    </td>
                    <td style="padding: 10px; vertical-align:top;">
                        ${keysHtml}
                    </td>
                    <td style="padding: 10px; text-align: center; vertical-align:middle;">
                        <button class="btn ${isBanned ? 'btn-secondary' : 'btn-danger'} btn-sm" onclick="AUTH.requireAdmin(()=>ExamKeys.toggleUserBan('${uId}', ${!isBanned}))" style="padding:4px 8px; font-size:11px;">
                            <i class="fas ${isBanned ? 'fa-user-check' : 'fa-user-slash'}"></i> ${isBanned ? 'Unban' : 'Ban'}
                        </button>
                    </td>
                </tr>`;
            });
            
            if (!html) html = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-secondary)">No users found.</td></tr>';
            container.innerHTML = html;
            
        } catch(e) {
            container.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--red-500)">Error: ${e.message}</td></tr>`;
        }
    },

    async revokeUserKey(accessId) {
        if (!confirm('Are you sure you want to revoke this key access?')) return;
        try {
            await userKeyAccessRef.doc(accessId).delete();
            showToast('Key access revoked.', 'info');
            this.renderAdminUserList();
        } catch(e) { showToast('Error: '+e.message, 'error'); }
    },

    async toggleUserBan(userId, ban) {
        if (!confirm(ban ? 'Are you sure you want to BAN this user? They will be locked out.' : 'Are you sure you want to UNBAN this user?')) return;
        try {
            await db.collection('users').doc(userId).update({ banned: ban });
            if (ban) {
                const snap = await userKeyAccessRef.where('userId', '==', userId).get();
                for(const d of snap.docs) {
                    await d.ref.delete();
                }
            }
            showToast(`User account ${ban ? 'banned and keys revoked' : 'restored'}.`, 'info');
            this.renderAdminUserList();
        } catch(e) { showToast('Error: '+e.message, 'error'); }
    },

    async viewUserProfile(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            if (!doc.exists) {
                showToast('User not found!', 'error');
                return;
            }
            const u = doc.data();
            document.getElementById('admin-profile-name').textContent = u.displayName || 'Chưa cập nhật';
            document.getElementById('admin-profile-email').textContent = u.email || 'Không rõ';
            document.getElementById('admin-profile-phone').textContent = u.phone || 'Chưa cập nhật';
            document.getElementById('admin-profile-student-id').textContent = u.studentId || 'Chưa cập nhật';
            document.getElementById('admin-profile-class').textContent = u.className || 'Chưa cập nhật';
            document.getElementById('admin-profile-school').textContent = u.school || 'Chưa cập nhật';
            openModal('modal-admin-user-profile');
        } catch (e) {
            showToast('Lỗi khi tải hồ sơ: ' + e.message, 'error');
        }
    },

    async viewUserHistory(userId, userName) {
        const container = document.getElementById('user-history-list');
        document.getElementById('history-user-name').textContent = userName;
        openModal('modal-user-history');
        
        container.innerHTML = '<div style="text-align:center;padding:20px"><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử...</div>';

        try {
            const snap = await db.collection('users').doc(userId).collection('activityLog')
                                 .orderBy('timestamp', 'desc').limit(50).get();
            
            if (snap.empty) {
                container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px">Người dùng này chưa có hoạt động nào được ghi nhận.</div>';
                return;
            }

            container.innerHTML = snap.docs.map(doc => {
                const d = doc.data();
                const time = d.timestamp?.toDate ? d.timestamp.toDate().toLocaleString('vi-VN') : 'Không rõ thời gian';
                return `<div style="border-bottom:1px solid var(--border-color); padding:10px 0; display:flex; align-items:flex-start; gap:12px;">
                    <div style="color:var(--blue-500); margin-top:2px"><i class="fas fa-check-circle"></i></div>
                    <div>
                        <div style="font-size:13px; font-weight:600; color:var(--text-primary)">${d.action}</div>
                        <div style="font-size:11px; color:var(--text-secondary); margin-top:4px"><i class="far fa-clock"></i> ${time}</div>
                    </div>
                </div>`;
            }).join('');

        } catch (e) {
            console.error('Error loading history:', e);
            container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--red-500);font-size:13px">Lỗi khi tải lịch sử: ' + e.message + '</div>';
        }
    },

    // --- Admin: Render Notification Panel ---
    renderAdminNotifications() {
        const container = document.getElementById('admin-notif-list');
        const countBadge = document.getElementById('admin-notif-count');
        if (!container) return;

        const pending = this._requests.filter(r => r.status === 'pending');

        // Update badge count
        if (pending.length > 0) {
            countBadge.textContent = pending.length;
            countBadge.style.display = 'flex';
        } else {
            countBadge.style.display = 'none';
        }

        if (this._requests.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);font-size:13px;padding:20px">No requests available.</p>';
            return;
        }

        container.innerHTML = this._requests.map(req => {
            const key = this._keys.find(k => k.id === req.keyId);
            const statusColor = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' }[req.status] || '#94a3b8';
            const statusLabel = { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' }[req.status];
            return `<div class="notif-item ${req.status === 'pending' ? 'notif-pending' : ''}">
                <div class="notif-item-info">
                    <div style="font-weight:700;font-size:13px">${req.userName}</div>
                    <div style="font-size:11px;color:var(--text-secondary)">${req.userEmail}</div>
                    <div style="font-size:12px;margin-top:3px">Requested key: <strong>${key?.key || '???'}</strong> — ${req.examName}</div>
                    ${req.note ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:2px;font-style:italic">"${req.note}"</div>` : ''}
                    <div style="font-size:11px;color:${statusColor};margin-top:4px;font-weight:700">${statusLabel}</div>
                </div>
                ${req.status === 'pending' ? `
                    <div class="notif-item-actions">
                        <button class="btn-notif-approve" onclick="ExamKeys.approveRequest('${req.id}','${req.userId}','${req.keyId}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn-notif-public" onclick="ExamKeys.setVisibility('${req.keyId}','public')">
                            <i class="fas fa-globe"></i> Make Public
                        </button>
                        <button class="btn-notif-reject" onclick="ExamKeys.rejectRequest('${req.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>` : ''}
            </div>`;
        }).join('');
    },

    // Re-render notifications when admin state changes
    refreshForAdmin() {
        if (AUTH.isAdmin()) this.renderAdminNotifications();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ExamKeys.init();
});
