import sys

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Change Sidebar link
content = content.replace('onclick="openTopupModal()"', 'data-page="topup"')

# 2. Add page-topup section right after page-upgrade section
upgrade_end_str = '''            <div id="upgrade-pricing-container" style="margin-top: 40px;">
                <!-- Pricing cards will go here -->
            </div>
        </section>'''

topup_section = '''
        <!-- ===== TOPUP PAGE ===== -->
        <section id="page-topup" class="page" style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div class="page-header" style="margin-bottom: 30px; text-align: center;">
                <h1 style="font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 36px; color: var(--gray-800);"><i class="fas fa-coins" style="color: #eab308; margin-right: 8px;"></i> Nạp Điểm Ôn Luyện</h1>
                <p class="subtitle" style="font-size: 16px;">1 Điểm = 1 VNĐ. Chọn gói nạp để nhận thêm bonus!</p>
            </div>
            
            <div class="card" style="padding: 24px; border-radius: 16px; background: var(--bg-primary);">
                <div class="form-group" style="text-align: left;">
                    <label style="font-weight: 700; margin-bottom: 8px; display: block; color: var(--gray-800);">Số điểm muốn nạp</label>
                    <input type="number" id="page-topup-amount" class="form-control" min="2000" step="1000" value="50000" placeholder="Tối thiểu 2000" style="font-size: 18px; padding: 12px; border-radius: 12px;">
                    <div style="font-size:13px; color:var(--text-muted); margin-top:12px; background: var(--bg-hover); padding: 12px; border-radius: 8px;">
                        <div style="font-weight: 700; color: #10b981; margin-bottom: 4px;"><i class="fas fa-gift"></i> Tặng ngay Bonus:</div>
                        • Nạp từ <b>50.000</b>: +10% Điểm<br>
                        • Nạp từ <b>100.000</b>: +15% Điểm<br>
                        • Nạp từ <b>200.000</b>: +20% Điểm
                    </div>
                </div>
                
                <button class="btn btn-primary w-full" id="btn-page-generate-topup" style="margin-top: 20px; font-size: 16px; padding: 14px; border-radius: 12px;"><i class="fas fa-qrcode"></i> Tạo Mã Thanh Toán QR</button>
                
                <div id="page-topup-qr-container" style="display:none; margin-top:24px; padding: 24px; background: var(--bg-hover); border-radius: 16px; text-align: center; border: 1px solid var(--border-color);">
                    <img id="page-topup-qr-image" src="" alt="QR Code" style="max-width: 250px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 8px; font-size: 14px; color: var(--text-secondary);">Quét mã qua app ngân hàng hoặc chuyển khoản với nội dung:</div>
                    <div style="font-size: 20px; font-weight: 800; color: #ef4444; letter-spacing: 2px; margin-bottom: 16px; padding: 8px; background: #fff; border-radius: 8px; border: 1px dashed #ef4444; display: inline-block;" id="page-topup-transfer-code"></div>
                    <div style="font-size: 14px; color: var(--orange-500); font-weight: 700;"><i class="fas fa-spinner fa-spin"></i> Đang chờ thanh toán...</div>
                </div>
            </div>
        </section>'''

if upgrade_end_str in content:
    content = content.replace(upgrade_end_str, upgrade_end_str + topup_section)
else:
    print("Could not find upgrade_end_str")

# 3. Remove old topup modal
import re
modal_regex = re.compile(r'    <!-- ===== TOPUP POINTS MODAL ===== -->\n    <div id="modal-topup-points".*?    </div>\n', re.DOTALL)
content = modal_regex.sub('', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated index.html")
