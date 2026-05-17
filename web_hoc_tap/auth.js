
/* =============================================
   auth.js — Hybrid Authentication Module
   1. Firebase Auth: For users to login and VIEW content
   2. Admin Auth: Password "minhmoon" for EDITING content
   ============================================= */

const AUTH = {
    _user: null,
    // SHA-256 hash of "minhmoon"
    _adminHash: 'c53ba87b3f4019e4b31bc4b90ffdc858e68213d8f696efaa26aeb8944fdc0769',
    _sessionKey: '__ht_admin_session',
    
    init() {
        firebase.auth().onAuthStateChanged(async (user) => {
            this._user = user;
            updateAuthUI();
            
            // Re-render data
            if (typeof loadSubjects === 'function') loadSubjects();
            if (typeof loadNotes === 'function') loadNotes();

            // Track login activity for Admin Audits
            if (user && typeof db !== 'undefined' && db) {
                try {
                    const docSnap = await db.collection('users').doc(user.uid).get();
                    if (docSnap.exists && docSnap.data().banned) {
                        this.logout();
                        this.showError('Tài khoản của bạn đã bị khóa bởi Quản trị viên!');
                        return;
                    }

                    let ip = 'Unknown';
                    try {
                        const res = await fetch('https://api.ipify.org?format=json');
                        const ipData = await res.json();
                        ip = ipData.ip || 'Unknown';
                    } catch (ipErr) {
                        console.warn('IP lookup API failed, falling back to Unknown:', ipErr);
                    }
                    
                    const updateData = {
                        email: user.email,
                        displayName: user.displayName || user.email.split('@')[0],
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastIpAddress: ip,
                        userAgent: navigator.userAgent
                    };
                    
                    if (!docSnap.exists) {
                        updateData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                        updateData.points_balance = 3000;
                        updateData.account_tier = 'free';
                    } else if (!docSnap.data().createdAt) {
                        updateData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    }

                    await db.collection('users').doc(user.uid).set(updateData, { merge: true });
                } catch (err) {
                    console.warn('Silent tracking error:', err);
                }
            }
        });
        this.setupListeners();
    },

    setupListeners() {
        // Form switching
        const switchSignup = document.getElementById('switch-to-signup');
        const switchLogin = document.getElementById('switch-to-login');
        if (switchSignup) {
            switchSignup.onclick = (e) => {
                e.preventDefault();
                document.getElementById('auth-form-login').style.display = 'none';
                document.getElementById('auth-form-signup').style.display = 'block';
                document.getElementById('auth-modal-title').innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
            };
        }
        if (switchLogin) {
            switchLogin.onclick = (e) => {
                e.preventDefault();
                document.getElementById('auth-form-login').style.display = 'block';
                document.getElementById('auth-form-signup').style.display = 'none';
                document.getElementById('auth-modal-title').innerHTML = '<i class="fas fa-user-circle"></i> Sign In';
            };
        }

        // Login Actions
        document.getElementById('btn-auth-login')?.addEventListener('click', () => this.handleEmailLogin());
        document.getElementById('btn-auth-signup')?.addEventListener('click', () => this.handleEmailSignup());
        document.getElementById('btn-auth-google')?.addEventListener('click', () => this.handleGoogleLogin());
    },

    // --- Firebase User Auth ---
    async handleEmailLogin() {
        const email = document.getElementById('auth-email').value.trim();
        const pw = document.getElementById('auth-password').value;
        if (!email || !pw) { this.showError('Please fill in all fields!'); return; }
        try {
            await firebase.auth().signInWithEmailAndPassword(email, pw);
            document.getElementById('modal-auth').classList.remove('visible');
        } catch (e) { this.showError(this.mapError(e.code)); }
    },

    async handleEmailSignup() {
        const email = document.getElementById('signup-email').value.trim();
        const pw = document.getElementById('signup-password').value;
        if (!email || pw.length < 6) { this.showError('Valid email and password >= 6 characters are required!'); return; }
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, pw);
            const user = userCredential.user;
            if (typeof db !== 'undefined' && db) {
                const docRef = db.collection('users').doc(user.uid);
                const doc = await docRef.get();
                if (!doc.exists) {
                    await docRef.set({
                        email: user.email,
                        points_balance: 3000,
                        account_tier: 'free',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
            document.getElementById('modal-auth').classList.remove('visible');
        } catch (e) { 
            if (e.code === 'auth/network-request-failed' || !window.navigator.onLine) {
                let localUsers = parseInt(localStorage.getItem('registered_users_count') || '0');
                localStorage.setItem('registered_users_count', (localUsers + 1).toString());
                const totalUsersEl = document.getElementById('total-users');
                if (totalUsersEl) totalUsersEl.textContent = (localUsers + 1).toString();
            }
            this.showError(this.mapError(e.code)); 
        }
    },

    async handleGoogleLogin() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const userCredential = await firebase.auth().signInWithPopup(provider);
            const user = userCredential.user;
            if (typeof db !== 'undefined' && db) {
                const docRef = db.collection('users').doc(user.uid);
                const doc = await docRef.get();
                if (!doc.exists) {
                    await docRef.set({
                        email: user.email,
                        points_balance: 3000,
                        account_tier: 'free',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    await docRef.set({ lastActive: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
                }
            }
            document.getElementById('modal-auth').classList.remove('visible');
        } catch (e) { this.showError(this.mapError(e.code)); }
    },

    logout() {
        firebase.auth().signOut();
        sessionStorage.removeItem(this._sessionKey);
    },

    // --- Admin Privilege Logic ---
    async hash(input) {
        const data = new TextEncoder().encode(input);
        const buf = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async verifyAdmin(password) {
        const h = await this.hash(password);
        if (h === this._adminHash) {
            sessionStorage.setItem(this._sessionKey, 'true');
            return true;
        }
        return false;
    },

    isAdmin() {
        return sessionStorage.getItem(this._sessionKey) === 'true';
    },

    isAuth() {
        return !!this._user;
    },

    getUser() {
        return this._user;
    },

    // Gate for viewing content
    requireUser(callback) {
        if (this.isAuth()) callback();
        else showAuthModal(callback);
    },

    // Gate for editing content (Admin Only)
    requireAdmin(callback) {
        if (this.isAdmin()) {
            callback();
        } else {
            this.showAdminPasswordPrompt(callback);
        }
    },

    showAdminPasswordPrompt(callback) {
        // We reuse the auth modal but for admin password
        const modal = document.getElementById('modal-auth');
        const loginForm = document.getElementById('auth-form-login');
        const signupForm = document.getElementById('auth-form-signup');
        
        // Hide normal forms, show a simple password input
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        
        const adminFormId = 'auth-form-admin-check';
        let adminForm = document.getElementById(adminFormId);
        if (!adminForm) {
            adminForm = document.createElement('div');
            adminForm.id = adminFormId;
            adminForm.innerHTML = `
                <p style="font-size:13px;color:var(--text-secondary);margin-bottom:15px">Verify Administrator privileges to make changes.</p>
                <div class="form-group">
                    <label>Admin Password</label>
                    <input type="password" id="admin-pass-input" placeholder="Enter admin password...">
                </div>
                <button class="btn btn-primary w-full" id="btn-admin-verify">Verify Admin</button>
                <p class="auth-switch-text"><a href="#" id="back-to-user-auth">Back to user Sign In</a></p>
            `;
            modal.querySelector('.modal-body').appendChild(adminForm);
            
            document.getElementById('btn-admin-verify').onclick = async () => {
                const pw = document.getElementById('admin-pass-input').value;
                if (await this.verifyAdmin(pw)) {
                    modal.classList.remove('visible');
                    updateAuthUI();
                    showToast('Admin privileges activated!', 'success');
                    if (callback) callback();
                } else {
                    this.showError('Incorrect admin password!');
                }
            };

            document.getElementById('back-to-user-auth').onclick = (e) => {
                e.preventDefault();
                adminForm.style.display = 'none';
                loginForm.style.display = 'block';
                document.getElementById('auth-modal-title').innerHTML = '<i class="fas fa-user-circle"></i> Sign In';
            };
        }
        
        adminForm.style.display = 'block';
        document.getElementById('auth-modal-title').innerHTML = '<i class="fas fa-shield-alt"></i> Admin Mode';
        modal.classList.add('visible');
        setTimeout(() => document.getElementById('admin-pass-input').focus(), 200);
    },

    showError(msg) {
        const errEl = document.getElementById('auth-error');
        errEl.textContent = msg;
        errEl.style.display = 'block';
    },

    mapError(code) {
        switch (code) {
            case 'auth/user-not-found': return 'Tài khoản này không tồn tại!';
            case 'auth/wrong-password': return 'Mật khẩu không chính xác!';
            case 'auth/email-already-in-use': return 'Email này đã được đăng ký sử dụng bởi một tài khoản khác!';
            case 'auth/invalid-email': return 'Địa chỉ email không hợp lệ!';
            case 'auth/weak-password': return 'Mật khẩu quá yếu (yêu cầu tối thiểu phải có 6 ký tự)!';
            case 'auth/too-many-requests': return 'Tài khoản tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau!';
            default: return 'Lỗi hệ thống: ' + code;
        }
    }
};

function showAuthModal(pendingCallback) {
    const modal = document.getElementById('modal-auth');
    document.getElementById('auth-form-login').style.display = 'block';
    document.getElementById('auth-form-signup').style.display = 'none';
    if (document.getElementById('auth-form-admin-check')) {
        document.getElementById('auth-form-admin-check').style.display = 'none';
    }
    document.getElementById('auth-error').style.display = 'none';
    modal.classList.add('visible');
    window.__authPendingCallback = pendingCallback;
}

function updateAuthUI() {
    const user = AUTH.getUser();
    const isAdmin = AUTH.isAdmin();
    const lockBadge = document.getElementById('auth-lock-badge');
    const adminBadge = document.getElementById('admin-badge');
    const greeting = document.getElementById('greeting-text');

    // --- User badge ---
    if (lockBadge) {
        if (user) {
            const displayName = user.displayName || user.email.split('@')[0];
            lockBadge.innerHTML = `<i class="fas fa-user"></i> <span>${displayName}</span>`;
            lockBadge.className = 'auth-badge auth-unlocked';
            lockBadge.title = 'Tài khoản của tôi';
            const dropName = document.getElementById('user-dropdown-name');
            if (dropName) dropName.textContent = displayName;
        } else {
            lockBadge.innerHTML = '<i class="fas fa-lock"></i> <span>Đăng nhập</span>';
            lockBadge.className = 'auth-badge auth-locked';
            lockBadge.title = 'Click to sign in';
            // Also hide the dropdown if it was somehow open
            const dropdown = document.getElementById('user-dropdown-menu');
            if (dropdown) dropdown.style.display = 'none';
        }
    }

    // --- Admin badge ---
    if (adminBadge) {
        const textSpan = document.getElementById('admin-badge-text');
        if (isAdmin) {
            if (textSpan) textSpan.innerHTML = 'Admin Mode (Active) ✓';
            adminBadge.style.background = 'var(--blue-100)';
            adminBadge.title = 'Click to disable Admin mode';
        } else {
            if (textSpan) textSpan.innerHTML = 'Chế độ Admin';
            adminBadge.style.background = 'transparent';
            adminBadge.title = 'Click to login as Admin';
        }
    }

    // --- Greeting ---
    if (greeting) {
        if (user) {
            greeting.textContent = 'Welcome, ' + (user.displayName || user.email.split('@')[0]) + '! 👋';
        } else {
            greeting.textContent = 'Good morning!';
        }
    }

    // Toggle Admin-only UI elements
    const adminUI = document.querySelectorAll('.admin-only');
    adminUI.forEach(el => el.style.display = isAdmin ? 'flex' : 'none');

    // Hiện tab "Của tôi" và nút thêm ghi chú khi đăng nhập
    const privateTab = document.querySelector('.notes-filter-private');
    if (privateTab) privateTab.style.display = user ? 'inline-flex' : 'none';

    // Nút thêm ghi chú: mọi user đăng nhập đều dùng được
    const btnAddNote = document.getElementById('btn-add-note');
    if (btnAddNote) btnAddNote.style.display = user ? 'inline-flex' : 'none';

    // Cập nhật tier badge
    const tierBadge = document.getElementById('user-dropdown-points');
    if (tierBadge && typeof PointsSystem !== 'undefined') {
        const tier = PointsSystem.tier || 'free';
        tierBadge.textContent = tier.toUpperCase();
        tierBadge.className = `user-tier-badge ${tier}`;
    }

    // Refresh views
    if (typeof renderHomeSubjects === 'function') renderHomeSubjects();
    if (typeof renderSubjects === 'function') renderSubjects();
    if (typeof renderNotes === 'function') renderNotes();

document.addEventListener('DOMContentLoaded', () => AUTH.init());
