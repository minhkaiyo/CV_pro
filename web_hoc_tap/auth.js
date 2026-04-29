// =============================================
// auth.js — Security Module for HocTap Portal
// Password is NEVER stored in plain text
// Only SHA-256 hash is stored (irreversible)
// Session expires after 30 min or tab close
// =============================================

const AUTH = {
    // SHA-256 hash of the admin password — cannot be reversed
    _h: 'c53ba87b3f4019e4b31bc4b90ffdc858e68213d8f696efaa26aeb8944fdc0769',
    _sessionKey: '__ht_auth',
    _ttl: 30 * 60 * 1000, // 30 minutes
    _locked: true,

    // Hash input using Web Crypto API (SHA-256)
    async hash(input) {
        const data = new TextEncoder().encode(input);
        const buf = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Verify password
    async verify(input) {
        const h = await this.hash(input);
        return h === this._h;
    },

    // Login — returns true/false
    async login(input) {
        const ok = await this.verify(input);
        if (ok) {
            const session = { t: Date.now(), v: await this.hash(Date.now().toString() + this._h) };
            sessionStorage.setItem(this._sessionKey, JSON.stringify(session));
            this._locked = false;
        }
        return ok;
    },

    // Check if currently authenticated
    isAuth() {
        try {
            const raw = sessionStorage.getItem(this._sessionKey);
            if (!raw) return false;
            const session = JSON.parse(raw);
            if (Date.now() - session.t > this._ttl) {
                this.logout();
                return false;
            }
            this._locked = false;
            return true;
        } catch { return false; }
    },

    // Refresh session timer (call on each edit action)
    refresh() {
        if (!this.isAuth()) return;
        const raw = sessionStorage.getItem(this._sessionKey);
        if (raw) {
            const session = JSON.parse(raw);
            session.t = Date.now();
            sessionStorage.setItem(this._sessionKey, JSON.stringify(session));
        }
    },

    // Logout
    logout() {
        sessionStorage.removeItem(this._sessionKey);
        this._locked = true;
        updateAuthUI();
    },

    // Gate: require auth before action, show modal if not authenticated
    async requireAuth(callback) {
        if (this.isAuth()) {
            this.refresh();
            callback();
        } else {
            showAuthModal(callback);
        }
    }
};

// ===== AUTH UI =====
function showAuthModal(pendingCallback) {
    const modal = document.getElementById('modal-auth');
    const input = document.getElementById('auth-password');
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('btn-auth-submit');

    input.value = '';
    errEl.style.display = 'none';
    modal.classList.add('visible');
    setTimeout(() => input.focus(), 100);

    // Store callback
    window.__authPendingCallback = pendingCallback;

    // Remove old listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', handleAuthSubmit);
    input.onkeydown = (e) => { if (e.key === 'Enter') handleAuthSubmit(); };
}

async function handleAuthSubmit() {
    const input = document.getElementById('auth-password');
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('btn-auth-submit');
    const pw = input.value.trim();

    if (!pw) { errEl.textContent = 'Vui lòng nhập mật khẩu!'; errEl.style.display = 'block'; return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xác thực...';

    const ok = await AUTH.login(pw);

    if (ok) {
        document.getElementById('modal-auth').classList.remove('visible');
        updateAuthUI();
        if (typeof showToast === 'function') showToast('Đã xác thực thành công!', 'success');
        if (window.__authPendingCallback) {
            window.__authPendingCallback();
            window.__authPendingCallback = null;
        }
    } else {
        errEl.textContent = 'Sai mật khẩu! Vui lòng thử lại.';
        errEl.style.display = 'block';
        input.value = '';
        input.focus();
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-unlock"></i> Xác thực';
}

function updateAuthUI() {
    const isAuth = AUTH.isAuth();
    const lockBadge = document.getElementById('auth-lock-badge');
    if (lockBadge) {
        lockBadge.innerHTML = isAuth
            ? '<i class="fas fa-unlock" style="color:var(--green-500)"></i> <span>Đã mở khóa</span>'
            : '<i class="fas fa-lock"></i> <span>Đã khóa</span>';
        lockBadge.className = 'auth-badge ' + (isAuth ? 'auth-unlocked' : 'auth-locked');
    }
}

// Init auth state on load
document.addEventListener('DOMContentLoaded', () => {
    AUTH.isAuth(); // check session
    updateAuthUI();
});
