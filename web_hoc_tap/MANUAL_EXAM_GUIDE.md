# 📝 Hướng Dẫn Sử Dụng Tính Năng "Tạo Đề Thủ Công"

## 🎯 Tổng Quan

Tính năng **Tạo Đề Thủ Công** cho phép bạn tự thiết kế bộ đề thi của riêng mình với giao diện trực quan và dễ sử dụng. Khác với AI Tạo Đề tự động, tính năng này cho bạn toàn quyền kiểm soát từng câu hỏi, đáp án và giải thích.

## 🚀 Cách Truy Cập

1. Đăng nhập vào tài khoản của bạn
2. Trong sidebar bên trái, tìm mục **"Quản lý đề"**
3. Click vào **"Tạo Đề Thủ Công"** (ngay dưới "AI Tạo Đề")

## 📋 Các Bước Tạo Đề Thi

### Bước 1: Nhập Thông Tin Đề Thi

Điền các thông tin cơ bản:
- **Tiêu đề đề thi** (bắt buộc): VD: "Đề thi giữa kỳ Xử lý tín hiệu số"
- **Môn học**: Chọn từ danh sách có sẵn (DSP, 8086, FPGA, IT, Math, Physics, Khác)
- **Độ khó**: Dễ / Trung bình / Khó
- **Thời gian làm bài**: Nhập số phút (mặc định 60 phút)

### Bước 2: Thêm Câu Hỏi

#### Loại câu hỏi hỗ trợ:

**1. Trắc nghiệm (4 đáp án)**
- Nhập nội dung câu hỏi
- Điền 4 đáp án A, B, C, D
- Chọn radio button bên cạnh đáp án đúng
- (Tùy chọn) Thêm giải thích cho đáp án

**2. Đúng / Sai**
- Nhập nội dung câu hỏi
- Chọn đáp án Đúng hoặc Sai
- (Tùy chọn) Thêm giải thích

#### Thêm câu hỏi vào đề:
- Click nút **"Thêm câu hỏi vào đề thi"** màu tím
- Câu hỏi sẽ xuất hiện trong danh sách bên phải
- Bạn có thể thêm không giới hạn số lượng câu hỏi

### Bước 3: Quản Lý Câu Hỏi

Trong danh sách câu hỏi bên phải, bạn có thể:
- **Chỉnh sửa**: Click icon bút chì để tải câu hỏi vào form
- **Xóa**: Click icon thùng rác để xóa câu hỏi
- Xem tổng số câu hỏi đã thêm

### Bước 4: Xem Trước & Lưu

**Xem trước đề thi:**
- Click nút **"Xem trước"** để xem toàn bộ đề thi
- Kiểm tra format, đáp án đúng được highlight màu xanh
- Có thể xuất PDF (đang phát triển)

**Lưu đề thi:**
- Click nút **"Lưu đề thi"** màu xanh
- Đề thi sẽ được lưu vào Firebase
- Có thể xem lại trong mục **"Đề đã tạo"**

## ✨ Tính Năng Nổi Bật

### 🎨 Giao Diện Sang Trọng
- Hero header với gradient tím/xanh
- Badges hiển thị tính năng: Tùy chỉnh hoàn toàn, Lưu tự động, Xuất PDF
- Animation mượt mà khi thêm/xóa câu hỏi

### 🔄 Chuyển Đổi Linh Hoạt
- Dễ dàng chuyển đổi giữa câu hỏi trắc nghiệm và đúng/sai
- Form tự động thay đổi theo loại câu hỏi

### 💾 Lưu Trữ An Toàn
- Tất cả đề thi được lưu trên Firebase Firestore
- Tự động gắn với tài khoản người dùng
- Có thể truy cập từ bất kỳ thiết bị nào

### 📱 Responsive Design
- Hoạt động tốt trên desktop, tablet và mobile
- Layout tự động điều chỉnh theo kích thước màn hình

## 🎯 Use Cases

### 1. Giáo Viên / Giảng Viên
- Tạo đề thi cho lớp học
- Tùy chỉnh độ khó phù hợp với từng lớp
- Thêm giải thích chi tiết cho học sinh

### 2. Sinh Viên
- Tự tạo đề ôn tập
- Chia sẻ đề thi với bạn bè
- Lưu trữ ngân hàng câu hỏi cá nhân

### 3. Ôn Thi Chứng Chỉ
- Tạo bộ đề mô phỏng
- Luyện tập theo chủ đề
- Theo dõi tiến độ học tập

## 🔐 Bảo Mật

- **Yêu cầu đăng nhập**: Chỉ người dùng đã đăng nhập mới có thể tạo đề
- **Dữ liệu riêng tư**: Mỗi đề thi được gắn với UID của người tạo
- **Firestore Rules**: Bảo vệ dữ liệu ở tầng database

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: HTML5, CSS3 (Custom Design System), Vanilla JavaScript
- **Backend**: Firebase Firestore
- **Hosting**: Vercel
- **Icons**: Font Awesome 6.5.1
- **Fonts**: Nunito, Dancing Script, Playfair Display

## 📊 Cấu Trúc Dữ Liệu

```javascript
{
  title: "Tiêu đề đề thi",
  subject: "DSP",
  difficulty: "medium",
  duration: 60,
  questions: [
    {
      id: 1234567890,
      type: "mcq",
      question: "Nội dung câu hỏi",
      options: {
        A: "Đáp án A",
        B: "Đáp án B",
        C: "Đáp án C",
        D: "Đáp án D"
      },
      correctAnswer: "A",
      explanation: "Giải thích đáp án"
    }
  ],
  questionCount: 10,
  createdBy: "user_uid",
  createdAt: Timestamp,
  type: "manual",
  isFavorite: false
}
```

## 🎨 Theme Colors

- **Primary Purple**: `#8b5cf6` - Màu chủ đạo của tính năng
- **Success Green**: `#10b981` - Đáp án đúng, nút lưu
- **Info Blue**: `#3b82f6` - Thông tin phụ
- **Danger Red**: `#ef4444` - Nút xóa, cảnh báo

## 🚧 Tính Năng Đang Phát Triển

- [ ] Xuất PDF với format đẹp
- [ ] Import câu hỏi từ file Excel/CSV
- [ ] Chia sẻ đề thi với người khác
- [ ] Tạo đề thi ngẫu nhiên từ ngân hàng câu hỏi
- [ ] Thống kê độ khó của đề thi
- [ ] Hỗ trợ thêm loại câu hỏi: Điền khuyết, Nối câu

## 💡 Tips & Tricks

1. **Viết câu hỏi rõ ràng**: Tránh câu hỏi mơ hồ, dễ gây nhầm lẫn
2. **Thêm giải thích**: Giúp người làm bài hiểu rõ tại sao đáp án đó đúng
3. **Cân bằng độ khó**: Mix các câu dễ, trung bình, khó trong một đề
4. **Kiểm tra kỹ**: Luôn xem trước đề thi trước khi lưu
5. **Đặt tên có ý nghĩa**: Tiêu đề đề thi nên rõ ràng, dễ tìm kiếm

## 🐛 Báo Lỗi

Nếu gặp lỗi hoặc có góp ý, vui lòng liên hệ:
- **Email**: minhkaiyo@gmail.com
- **Phone**: 0563 036 120

## 📝 Changelog

### Version 1.0.0 (2026-05-17)
- ✨ Ra mắt tính năng Tạo Đề Thủ Công
- 🎨 Giao diện sang trọng với theme tím/xanh
- 📝 Hỗ trợ 2 loại câu hỏi: Trắc nghiệm và Đúng/Sai
- 💾 Tích hợp Firebase Firestore
- 👁️ Chức năng xem trước đề thi
- 🔐 Bảo mật với authentication

---

**Chúc bạn tạo đề thi thành công! 🎉**
