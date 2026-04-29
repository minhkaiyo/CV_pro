const SEED_SUBJECTS = [
    {
        id: 'ky-thuat-vi-xu-ly',
        name: 'Kỹ thuật vi xử lý',
        description: 'Tổng hợp kiến thức về kiến trúc máy tính, tập lệnh 8086 và lập trình Assembly.',
        icon: 'fa-microchip',
        color: '#2563eb',
        topics: [
            {
                id: 'cau-truc-assembly-8086',
                title: 'Cấu trúc chương trình Assembly 8086',
                content: `## 📋 Tổng quan

Một chương trình Assembly 8086 chuẩn gồm 4 phần chính:

### 1. Khai báo Model bộ nhớ
\`\`\`assembly
.model small
\`\`\`
- **small**: Sử dụng 1 segment cho code (64KB) và 1 segment cho data (64KB).
- Các loại khác: \`tiny\`, \`medium\`, \`compact\`, \`large\`, \`huge\`.

### 2. Khai báo Stack
\`\`\`assembly
.stack 100h
\`\`\`
- Dành **256 byte** (100h) cho ngăn xếp.
- Stack dùng để lưu tạm dữ liệu, địa chỉ trả về khi gọi hàm.

### 3. Khai báo dữ liệu (.data)
\`\`\`assembly
.data
    msg DB 'Hello World$'    ; Chuỗi kết thúc bằng $
    num DW 1234h             ; Biến 16-bit (Word)
    arr DB 10 DUP(0)         ; Mảng 10 phần tử, khởi tạo = 0
\`\`\`
**Các kiểu dữ liệu:**
| Từ khóa | Kích thước | Ý nghĩa |
|---------|-----------|---------|
| DB | 1 byte | Define Byte |
| DW | 2 byte | Define Word |
| DD | 4 byte | Define Doubleword |

### 4. Phần code (.code)
\`\`\`assembly
.code
main proc
    mov ax, @data     ; Nạp địa chỉ segment data
    mov ds, ax        ; Đưa vào thanh ghi DS

    ; ... code xử lý ...

    mov ah, 4Ch       ; Hàm thoát chương trình
    int 21h           ; Gọi ngắt DOS
main endp
end main
\`\`\`

### 5. Ngắt DOS quan trọng (INT 21h)
| AH | Chức năng | Tham số |
|----|-----------|---------|
| 01h | Nhập 1 ký tự | AL = ký tự nhập |
| 02h | In 1 ký tự | DL = ký tự cần in |
| 09h | In chuỗi | DX = địa chỉ chuỗi (kết thúc $) |
| 0Ah | Nhập chuỗi | DX = địa chỉ buffer |
| 4Ch | Thoát chương trình | AL = mã lỗi |`
            },
            {
                id: 'lenh-in-chuoi-int21h',
                title: 'Lệnh in chuỗi và ngắt INT 21h',
                content: `## 🖨️ In chuỗi ra màn hình

### Cú pháp cơ bản
\`\`\`assembly
mov ah, 09h      ; Chọn hàm 09h: In chuỗi
lea dx, msg      ; LEA = Load Effective Address
int 21h          ; Gọi ngắt hệ thống DOS
\`\`\`

### Giải thích chi tiết từng dòng

**Dòng 1: \`mov ah, 09h\`**
- Thanh ghi **AH** chứa số hiệu hàm cần gọi.
- **09h** = hàm in chuỗi ký tự ra màn hình console.
- Quy ước: AH luôn được đặt trước khi gọi INT 21h.

**Dòng 2: \`lea dx, msg\`**
- **LEA** (Load Effective Address) nạp **địa chỉ** của biến \`msg\` vào DX.
- Tương đương: \`mov dx, OFFSET msg\`.
- DX phải chỉ đến byte đầu tiên của chuỗi.

**Dòng 3: \`int 21h\`**
- **INT** (Interrupt) gọi ngắt mềm số 21h (ngắt DOS).
- DOS sẽ đọc AH để biết cần thực hiện hàm nào.
- Sau đó đọc DX để biết chuỗi nằm ở đâu.
- In từng ký tự cho đến khi gặp dấu **$**.

### ⚠️ Lưu ý quan trọng
1. Chuỗi **PHẢI** kết thúc bằng ký tự \`$\` (mã ASCII 24h).
2. Ký tự \`$\` **KHÔNG** được in ra màn hình.
3. Nếu quên dấu \`$\`, chương trình sẽ in rác cho đến khi tình cờ gặp byte 24h trong bộ nhớ.

### Ví dụ hoàn chỉnh
\`\`\`assembly
.model small
.stack 100h
.data
    msg DB 'Hello, Assembly!', 0Dh, 0Ah, '$'
    ;        Nội dung chuỗi  | CR | LF | Kết thúc
    ; 0Dh = Carriage Return (về đầu dòng)
    ; 0Ah = Line Feed (xuống dòng mới)
.code
main proc
    mov ax, @data
    mov ds, ax

    mov ah, 09h
    lea dx, msg
    int 21h

    mov ah, 4Ch
    int 21h
main endp
end main
\`\`\``
            },
            {
                id: 'thuat-toan-dao-chuoi',
                title: 'Thuật toán đảo ngược chuỗi (String Reverse)',
                content: `## 🔄 Đảo ngược chuỗi bằng Stack

### 1. Ý tưởng thuật toán
Sử dụng cơ chế **LIFO (Last In First Out)** của ngăn xếp (Stack):
1. Đọc từng ký tự của chuỗi gốc → **PUSH** vào Stack.
2. **POP** từng ký tự ra → tự động có thứ tự ngược lại.

> Ví dụ: Đưa "ABC" vào Stack → lấy ra được "CBA".

### 2. Các thanh ghi quan trọng
| Thanh ghi | Chức năng |
|-----------|-----------|
| **SI** (Source Index) | Trỏ vào chuỗi nguồn (chuỗi gốc) |
| **DI** (Destination Index) | Trỏ vào vùng nhớ đích (chuỗi đảo) |
| **CX** (Counter) | Đếm số ký tự / số vòng lặp |
| **AL** | Lưu tạm từng ký tự đang xử lý |

### 3. Code mẫu chi tiết (như bài 1_1.asm)
\`\`\`assembly
; ====== BƯỚC 1: PUSH từng ký tự vào Stack ======
    lea si, chuoi_goc    ; SI trỏ vào đầu chuỗi
    mov cx, do_dai       ; CX = số ký tự

push_loop:
    mov al, [si]         ; Đọc 1 ký tự tại vị trí SI
    push ax              ; Đẩy vào Stack (lưu ý: push 16-bit)
    inc si               ; Dịch SI sang ký tự tiếp theo
    loop push_loop       ; CX--, nếu CX≠0 thì lặp lại

; ====== BƯỚC 2: POP ra → chuỗi đảo ngược ======
    lea di, chuoi_dao    ; DI trỏ vào vùng đích
    mov cx, do_dai       ; Reset CX

pop_loop:
    pop ax               ; Lấy ký tự từ Stack
    mov [di], al         ; Ghi vào vùng đích
    inc di               ; Dịch DI sang vị trí tiếp
    loop pop_loop        ; Lặp cho đến hết
\`\`\`

### 4. Minh họa quá trình
Giả sử chuỗi gốc là **"HELLO"**:

**Bước PUSH (đưa vào Stack):**
\`\`\`
Push 'H' → Stack: [H]
Push 'E' → Stack: [H, E]
Push 'L' → Stack: [H, E, L]
Push 'L' → Stack: [H, E, L, L]
Push 'O' → Stack: [H, E, L, L, O]  ← đỉnh Stack
\`\`\`

**Bước POP (lấy ra):**
\`\`\`
Pop → 'O'   Chuỗi đảo: "O"
Pop → 'L'   Chuỗi đảo: "OL"
Pop → 'L'   Chuỗi đảo: "OLL"
Pop → 'E'   Chuỗi đảo: "OLLE"
Pop → 'H'   Chuỗi đảo: "OLLEH"  ✅
\`\`\``
            }
        ]
    },
    {
        id: 'dien-tu-tuong-tu-1',
        name: 'Điện tử tương tự 1',
        description: 'Tổng quan về Transistor BJT, phân biệt các sơ đồ mạch khuếch đại: Emitter chung (EC), Base chung (BC), Collector chung (CC).',
        icon: 'fa-bolt',
        color: '#f59e0b',
        topics: [
            {
                id: 'tong-quan-3-mach-bjt',
                title: 'Tổng quan 3 kiểu mạch khuếch đại BJT: EC, BC, CC',
                content: `## ⚡ Các cấu hình mạch khuếch đại Transistor
Transistor lưỡng cực (BJT) có 3 cực: **B** (Base), **C** (Collector), **E** (Emitter). Tùy thuộc vào việc cực nào được dùng làm cực **chân chung** cho cả tín hiệu vào (Input) và ra (Output), ta có 3 kiểu mạch khuếch đại:

![Các cấu hình mạch khuếch đại](/bjt-amplifiers.png)

1. **Mạch Emitter chung (EC/CE):** Cực E được nối mass AC. Tín hiệu vào B, ra C.
2. **Mạch Base chung (BC/CB):** Cực B được nối mass AC. Tín hiệu vào E, ra C.
3. **Mạch Collector chung (CC/CE):** Cực C được nối Vcc (giống mass AC). Tín hiệu vào B, ra E.

### 📊 Bảng so sánh tổng quát

| Đặc tính | Emitter Chung (EC) | Base Chung (BC) | Collector Chung (CC) |
| :--- | :--- | :--- | :--- |
| **Tín hiệu vào** | Cực B | Cực E | Cực B |
| **Tín hiệu ra** | Cực C | Cực C | Cực E |
| **Biến đổi góc pha** | **Đảo pha (180°)** | Đồng pha (0°) | Đồng pha (0°) |
| **Hệ số KĐ Điện áp ($A_v$)** | Lớn | Lớn | Xấp xỉ 1 ($< 1$) |
| **Hệ số KĐ Dòng điện ($A_i$)** | Lớn ($≈ \beta$) | Xấp xỉ 1 ($< 1$) | Lớn ($≈ \beta$) |
| **Trở kháng vào ($R_{in}$)** | Trung bình (vài kΩ) | Rất Thấp (< 100Ω) | Rất Cao (vài chục kΩ) |
| **Trở kháng ra ($R_{out}$)**| Trung bình - Cao | Rất Cao | Rất Thấp |
| **Ứng dụng** | KĐ âm tần, KĐ điện áp chung | Khuếch đại cao tần (RF) | Mạch đệm (Buffer), KĐ dòng |

Được sử dụng phổ biến nhất trên thực tế là **mạch EC** nhờ khả năng khuếch đại cả dòng và áp, giúp công suất ở ngõ ra đạt giá trị lớn nhất.`
            },
            {
                id: 'chi-tiet-mach-ec',
                title: 'Mạch khuếch đại Emitter Chung (EC)',
                content: `## 🔌 Mạch Khuếch đại Emitter Chung (EC - Common Emitter)

Đây là mạch được ứng dụng nhiều nhất trong kỹ thuật điện tử vì có hệ số khuếch đại công suất lớn nhất.

### 1. Đặc điểm cốt lõi:
- **Nguyên lý:** Tín hiệu xoay chiều nhỏ ở đầu vào ($v_{in}$) đưa vào Base sẽ làm biến đổi dòng Base ($i_b$), dẫn tới biến đổi cực lớn dòng Collector ($i_c = \beta \cdot i_b$), từ đó làm sụt áp trên điện trở tải $R_C$ tạo thành điện áp ở ngõ ra.
- **Tính đảo pha:** Đây là tính năng đặc trưng nhất. Khi tín hiệu đầu vào tăng, điện áp đầu ra sẽ giảm. Độ lệch pha giữa $V_{in}$ và $V_{out}$ là **180 độ**.

### 2. Các thông số chính:
1. **Trở kháng vào ($R_{in}$):** Điện trở tĩnh nhìn từ Base vào (thường phụ thuộc vào điện trở phân cực và r_pi của BJT). Nằm ở mức **trung bình** (vài $k\Omega$).
2. **Trở kháng ra ($R_{out}$):** Chịu ảnh hưởng chính ở điện trở cực thu $R_C$. Nằm mức **trung bình** đến **cao** (khoảng vài $10 k\Omega$).
3. **Khuếch đại:** Khuếch đại tốt cả về dòng điện ($A_i$) và điện áp ($A_v$) nên **Hệ số khuếch đại công suất Rất Lớn**.

### 3. Nhược điểm - Hiệu ứng Miller:
Tụ ký sinh $C_{bc}$ giữa cực Base và Collector trong mạch EC sẽ bị khuếch đại lên gấp nhiều lần ($1 + A_v$). Điều này làm tăng điện dung đầu vào tương đương, làm giảm tần số cắt cao (giảm băng thông) của mạch, do đó nó không quá thích hợp cho sóng siêu cao tần ngẫu nhiên.`
            },
            {
                id: 'chi-tiet-mach-bc-c',
                title: 'Mạch Base Chung (BC) và Collector Chung (CC)',
                content: `## 📡 Mạch Khuếch đại Base Chung (BC)
- Mạch này giữ cho tín hiệu cực B cố định với mass AC.
- **Tính chất đặc biệt:** Không có hiện tượng đảo pha. ($V_{out}$ đồng pha cực tính với $V_{in}$).
- **Ưu điểm về tần số:** Nhờ cấu trúc nền chung, tụ ký sinh $C_{bc}$ không chịu hiệu ứng Miller như ở mạch EC, vì vậy mạch BC thường xuyên được ứng dụng trong các thiết bị **công nghệ cao tần (RF / Radio Frequency)** hoặc ăng-ten.
- **Trở kháng:** Vào rất thấp, ra rất cao. Vì vậy nó còn dùng để phối hợp trở kháng (từ Tải thấp -> Nguồn cao).

---

## 🛡️ Mạch Khuếch đại Collector Chung (CC - Emitter Follower)
- Mạch lấy điện áp ra từ cực E.
- Gọi là **Emitter Follower (Bộ phát lặp)** vì điện áp đầu ra $V_e$ hầu như "đi theo" hoặc "bám vào" điện áp đầu vào $V_b$ ($V_e = V_b - 0.7V$).
- **Không khuếch đại điện áp** ($A_v \approx 1$).
- **Tính chất:** Đồng pha với $V_{in}$.

### Ứng dụng xuất sắc làm "Mạch Đệm" (Buffer):
- Trở kháng vào **RẤT CAO** $\Rightarrow$ Không làm suy hao hoặc không hút quá mức tín hiệu dòng điện từ các tầng hay cảm biến đằng trước nó.
- Trở kháng ra **RẤT THẤP** $\Rightarrow$ Cung cấp được dòng điện "siêu mạnh" giúp điều khiển cho các mạch tải năng lượng lớn (như loa, động cơ công suất).`
            }
        ]
    }
];

async function seedInitialData() {
    console.log('🌱 Đang khởi tạo dữ liệu ban đầu...');

    for (const subject of SEED_SUBJECTS) {
        const { topics, ...subjectData } = subject;
        subjectData.createdAt = new Date().toISOString();
        subjectData.topicCount = topics.length;

        try {
            // 1. Lưu môn học
            await db.collection('subjects').doc(subject.id).set(subjectData);

            // 2. Lưu các bài viết vào subcollection 'topics'
            for (const topic of topics) {
                const topicData = {
                    title: topic.title,
                    content: topic.content,
                    createdAt: new Date().toISOString()
                };
                await db.collection('subjects').doc(subject.id)
                        .collection('topics').doc(topic.id).set(topicData);
            }
            console.log('✅ Đã tạo môn: ' + subject.name);
        } catch (error) {
            console.error('❌ Lỗi khi tạo ' + subject.name + ':', error);
        }
    }
    showToast('Đã khởi tạo kiến thức môn Vi xử lý!', 'success');
}
