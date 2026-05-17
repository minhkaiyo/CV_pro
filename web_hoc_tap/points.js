// ============================================
// POINTS SYSTEM & ACCOUNT TIERS LOGIC
// ============================================

const PointsSystem = {
    balance: 0,
    tier: 'free',
    
    init() {
        if (!AUTH.isAuth()) return;
        const user = AUTH.getUser();
        
        // Listen to points balance real-time
        db.collection('users').doc(user.uid).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                this.balance = data.points_balance || 0;
                this.tier = data.account_tier || 'free';
                this.updateUI();
                
                // Check tier expiry
                this.checkTierExpiry(data);
            }
        });

        // Setup UI Listeners
        const btnGenerateTopup = document.getElementById('btn-page-generate-topup');
        if (btnGenerateTopup) {
            btnGenerateTopup.addEventListener('click', () => this.generateTopupQR());
        }
    },

    updateUI() {
        // Update any points display elements
        const pointsDisplays = document.querySelectorAll('.user-points-display');
        pointsDisplays.forEach(el => {
            el.innerHTML = `<i class="fas fa-coins" style="color:#eab308"></i> ${this.balance.toLocaleString()} Đ`;
        });

        const tierDisplays = document.querySelectorAll('.user-tier-badge');
        tierDisplays.forEach(el => {
            if (this.tier === 'pro') {
                el.innerHTML = '<i class="fas fa-gem"></i> PRO';
                el.className = 'user-tier-badge pro';
            } else if (this.tier === 'plus') {
                el.innerHTML = '<i class="fas fa-star"></i> PLUS';
                el.className = 'user-tier-badge plus';
            } else {
                el.innerHTML = 'FREE';
                el.className = 'user-tier-badge free';
            }
        });
    },

    checkTierExpiry(data) {
        if (data.account_tier !== 'free' && data.tier_expires_at) {
            const expiry = data.tier_expires_at.toDate();
            if (new Date() > expiry) {
                db.collection('users').doc(AUTH.getUser().uid).update({
                    account_tier: 'free',
                    tier_expires_at: null
                });
                showToast('Gói tài khoản đã hết hạn. Trở về gói Free.', 'info');
            }
        }
    },

    // --- TOPUP LOGIC ---
    generateTopupQR() {
        if (!AUTH.isAuth()) {
            showToast('Vui lòng đăng nhập để nạp điểm!', 'error');
            return;
        }

        const amountInput = document.getElementById('page-topup-amount');
        if (!amountInput) return;
        
        const price = parseInt(amountInput.value);
        if (isNaN(price) || price < 2000) {
            showToast('Số điểm nạp tối thiểu là 2000!', 'error');
            return;
        }

        const user = AUTH.getUser();
        const code = `DOL${user.uid.substring(0,6).toUpperCase()}${Math.floor(Date.now() / 1000)}`;
        
        const qrImg = document.getElementById('page-topup-qr-image');
        const transferCode = document.getElementById('page-topup-transfer-code');
        const container = document.getElementById('page-topup-qr-container');
        
        // MB Bank standard format
        // Template: https://img.vietqr.io/image/970422-0563036120-compact2.png?amount={price}&addInfo={code}&accountName=PHAM%20VAN%20MINH
        qrImg.src = `https://img.vietqr.io/image/970422-0563036120-compact2.png?amount=${price}&addInfo=${code}&accountName=PHAM%20VAN%20MINH`;
        transferCode.textContent = code;
        
        container.style.display = 'block';
        document.getElementById('btn-page-generate-topup').style.display = 'none';

        // Start polling
        this.startPaymentPolling(code, price);
    },

    async startPaymentPolling(code, price) {
        let attempts = 0;
        const maxAttempts = 120; // 10 minutes at 5s interval
        
        const poll = async () => {
            if (attempts >= maxAttempts) {
                document.querySelector('#topup-qr-container div:last-child').innerHTML = '<i class="fas fa-times-circle" style="color:#ef4444"></i> Giao dịch hết hạn. Vui lòng tạo lại.';
                return;
            }
            
            try {
                const res = await fetch(`/api/check-payment?code=${code}&price=${price}`);
                const data = await res.json();
                
                if (data.paid) {
                    await this.processTopupSuccess(data.transaction, price);
                } else {
                    attempts++;
                    setTimeout(poll, 5000);
                }
            } catch (err) {
                console.warn('Polling error:', err);
                attempts++;
                setTimeout(poll, 5000);
            }
        };
        
        poll();
    },

    async processTopupSuccess(transaction, price) {
        document.querySelector('#topup-qr-container div:last-child').innerHTML = '<i class="fas fa-check-circle" style="color:#10b981"></i> Thanh toán thành công! Đang cộng điểm...';
        
        const user = AUTH.getUser();
        
        // Calculate bonus
        let bonus = 0;
        if (price >= 500000) bonus = 125000;
        else if (price >= 200000) bonus = 40000;
        else if (price >= 100000) bonus = 15000;
        else if (price >= 50000) bonus = 5000;
        
        const totalAdd = price + bonus;

        try {
            // Ideally this should be a Vercel Serverless function to prevent client-side manipulation.
            // For MVP, we do it client-side inside a transaction if we must, but let's do a secure batch write.
            const userRef = db.collection('users').doc(user.uid);
            const txRef = userRef.collection('point_transactions').doc(transaction.id.toString());
            
            // Check if transaction already processed
            const txSnap = await txRef.get();
            if (txSnap.exists) {
                showToast('Giao dịch đã được xử lý trước đó.', 'info');
                closeModal('modal-topup-points');
                return;
            }

            // Transaction
            await db.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);
                const currentBalance = userDoc.data().points_balance || 0;
                const newBalance = currentBalance + totalAdd;

                t.update(userRef, {
                    points_balance: newBalance,
                    total_points_earned: firebase.firestore.FieldValue.increment(totalAdd)
                });

                t.set(txRef, {
                    type: 'topup',
                    amount: totalAdd,
                    base_amount: price,
                    bonus: bonus,
                    description: `Nạp ${price.toLocaleString()} VNĐ qua MB Bank`,
                    reference: transaction.id,
                    balance_after: newBalance,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            showToast(`Nạp thành công ${totalAdd.toLocaleString()} điểm!`, 'success');
            setTimeout(() => closeModal('modal-topup-points'), 1500);

        } catch (e) {
            console.error('Lỗi khi cộng điểm:', e);
            showToast('Có lỗi xảy ra khi cộng điểm. Vui lòng liên hệ Admin.', 'error');
        }
    },

    // --- SPEND LOGIC ---
    async deductPoints(amount, description) {
        if (!AUTH.isAuth()) return false;
        if (amount <= 0) return true; // Free action

        const user = AUTH.getUser();
        const userRef = db.collection('users').doc(user.uid);

        try {
            return await db.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);
                const balance = userDoc.data().points_balance || 0;

                if (balance < amount) {
                    throw new Error("INSUFFICIENT_FUNDS");
                }

                const newBalance = balance - amount;
                t.update(userRef, {
                    points_balance: newBalance,
                    total_points_spent: firebase.firestore.FieldValue.increment(amount)
                });

                const txRef = userRef.collection('point_transactions').doc();
                t.set(txRef, {
                    type: 'spend',
                    amount: -amount,
                    description: description,
                    balance_after: newBalance,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                return true;
            });
        } catch (e) {
            if (e.message === "INSUFFICIENT_FUNDS") {
                showToast(`Không đủ điểm. Cần ${amount.toLocaleString()} Đ. Vui lòng nạp thêm!`, 'error');
                openTopupModal();
                return false;
            }
            console.error("Deduct points error:", e);
            return false;
        }
    }
};

function openTopupModal() {
    if (!AUTH.isAuth()) {
        AUTH.requireUser(() => openTopupModal());
        return;
    }
    
    // Reset UI
    const qrContainer = document.getElementById('page-topup-qr-container');
    const btnGenerate = document.getElementById('btn-page-generate-topup');
    
    if (qrContainer) qrContainer.style.display = 'none';
    if (btnGenerate) btnGenerate.style.display = 'block';
    
    // Navigate to topup page
    if (typeof navigateTo === 'function') {
        navigateTo('topup');
    }
}

// Hook into App init
document.addEventListener('DOMContentLoaded', () => {
    // Listen for auth state to init points
    firebase.auth().onAuthStateChanged((user) => {
        if (user) PointsSystem.init();
    });
});
