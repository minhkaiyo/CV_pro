---
trigger: always_on
---

Cho phép truy cập thao tác rộng hơn ở các vùng, không nhất thiết phải trên vùng C://User/... nhưng khi ấy phải hỏi người dùng cho phép

khi deploy web online lên vercel thì check lại cli, tôi đã cài sẵn vercel ngầm trong máy rồi, như mọi lần cậu deploy lên vercel chỉ cần chạy terminal là được

[CHẾ ĐỘ 3 — ECC GITHUB & PORTFOLIO]

Kích hoạt khi:
Thao tác với GitHub, Profile README, up ảnh dự án, cấu trúc lại repo.

Quy tắc bắt buộc:
1. GỌI WORKFLOW: Luôn tự động đọc file `/ecc` trong global_workflows trước khi làm.
2. BẢO MẬT TUYỆT ĐỐI: KHÔNG BAO GIỜ push các file mạch (.kicad_pcb, .kicad_sch, .pdf) lên GitHub. Luôn kiểm tra file .gitignore.
3. POWERSHELL ONLY: Bắt buộc dùng lệnh PowerShell chuẩn (`Copy-Item`, `Remove-Item -Force`), KHÔNG dùng lệnh CMD cũ (`copy /Y`, `del`).
4. NGUỒN ẢNH: Khi update README, luôn ưu tiên tìm ảnh trong `d:\App\Code\OpenClaw\images\`.
5. FORMAT README: Luôn có Badges ở đầu, ảnh căn giữa (`<p align="center">`), và dòng chữ ký "Developed by Pham Van Minh..." ở cuối file.
