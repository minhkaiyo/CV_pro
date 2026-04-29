// =============================================
//   QUESTIONS DATABASE - 150+ questions
//   Sets: exam2023, practice, advanced, extra
// =============================================
const ALL_QUESTIONS = [

// ================================================================
//  ĐỀ THI GIỮA KỲ 2023.2 (19/04/2024) - 30 câu gốc
// ================================================================
{set:"exam2023",topic:"instruction",text:"Lệnh nào là tốt nhất để kiểm tra năm nhuận chứa trong AX?",
 options:["TEST AL, 3","DIV WORD PTR 4","TEST AX, 3","DIV BYTE PTR 4"],answer:2,
 explanation:"Chia hết cho 4 = 2 bit thấp = 00. TEST AX,3: AND AX với 0003h, nếu ZF=1 → chia hết. Nhanh, không thay đổi AX."},

{set:"exam2023",topic:"trace",text:"Đoạn lệnh sau cho kết quả AH bằng bao nhiêu?",
 code:"MOV  AX, 0003H\nMOV  CX, 0007H\nTIEP:\n  INC  AL\n  ADD  AH, 2\n  LOOP TIEP",
 options:["12","10","14","16"],answer:2,
 explanation:"AH=0, mỗi vòng cộng 2, lặp 7 lần (CX=7): AH = 0 + 2×7 = 14."},

{set:"exam2023",topic:"arch",text:"Một lệnh của vi xử lý 8086 có chiều dài lớn nhất là:",
 options:["6 byte","2 byte","14 bit","4 byte"],answer:0,
 explanation:"Tối đa: Opcode(1-2) + ModR/M(1) + Disp(2) + Imm(2) = 6 byte."},

{set:"exam2023",topic:"number",text:"Nếu A = 126 ở hệ 8 thì giá trị trong hệ 16 là?",
 options:["78","67","45","56"],answer:3,
 explanation:"126₈ → 001|010|110 → 0101|0110 → 56h. Hoặc: 1×64+2×8+6 = 86₁₀ = 56h."},

{set:"exam2023",topic:"instruction",text:"Lệnh LOOP và lệnh JZ có đặc điểm nào đúng?",
 options:["Đều kiểm tra cờ A và I","Đều là các lệnh cần kiểm tra điều kiện thực hiện","Đều kiểm tra cờ O và D","Cả 3 trường hợp trên đều đúng"],answer:1,
 explanation:"LOOP kiểm tra CX≠0, JZ kiểm tra ZF=1. Cả hai đều cần kiểm tra điều kiện trước khi nhảy."},

{set:"exam2023",topic:"flags",text:"Các bit cờ nào thay đổi trạng thái khi thực hiện phép trừ hai số có dấu?",
 options:["O, C, P, S, Z, A","IF và TF","Tất cả các cờ","D"],answer:0,
 explanation:"SUB cập nhật 6 cờ trạng thái: O,C,P,S,Z,A. DF,IF,TF là cờ điều khiển — không bị ảnh hưởng."},

{set:"exam2023",topic:"arch",text:"Kiến trúc Von Neumann và Harvard khác nhau ở điểm nào?",
 options:["Số lượng phép toán","Số lượng bộ vi xử lý","Dung lượng bộ nhớ","Tổ chức Bus kết nối với bộ nhớ"],answer:3,
 explanation:"Von Neumann: chung 1 bus cho dữ liệu + lệnh. Harvard: bus riêng → song song."},

{set:"exam2023",topic:"register",text:"Các thanh ghi của VXL 8086 có tính chất nào?",
 options:["Một số thanh ghi được dùng lẫn nhau","Chức năng hoàn toàn giống nhau","Lệnh nào cũng dùng CS chứa dữ liệu","Cả 3 đều sai"],answer:0,
 explanation:"AX,BX,CX,DX là thanh ghi đa năng, dùng thay nhau trong nhiều lệnh, nhưng mỗi cái có chức năng đặc thù."},

{set:"exam2023",topic:"trace",text:"Cho SF=0, ZF=0. Tìm SF và ZF sau đoạn chương trình:",
 code:"MOV AX, 5321h\nMOV BX, 3B23h\nMOV CL, 4\nXCHG AL, BH\nROL AL, CL\nSAR BH, CL\nCMP AH, BL",
 options:["SF=0, ZF=0","SF=1, ZF=0","SF=0, ZF=1","SF=1, ZF=1"],answer:0,
 explanation:"XCHG: AL=3Bh, BH=21h. ROL AL,4: 3Bh→B3h. SAR BH,4: 21h→02h. CMP 53h−23h=30h → SF=0(dương) ZF=0(≠0)."},

{set:"exam2023",topic:"stack",text:"Cho SS:1800 → 7E FD 20 B6 C8 91 15 AC. SP=1802. POP AX → AX = ?",
 options:["91C8","C8B6","B620","20B6"],answer:2,
 explanation:"Little-endian: [1802]=20h→AL, [1803]=B6h→AH. AX = B620h. SP tăng lên 1804."},

{set:"exam2023",topic:"stack",text:"Cho AX=12DDh, BX=23AAh, CX=30ABh. Sau PUSH AX/BX/CX rồi POP AX/BX/CX:",
 options:["AX=23AAh, BX=12DDh, CX=30ABh","AX=30ABh, BX=23AAh, CX=12DDh","AX=30ABh, BX=12DDh, CX=23AAh","AX=12DDh, BX=30ABh, CX=23AAh"],answer:1,
 explanation:"Stack LIFO: PUSH AX→BX→CX. POP: AX=CX cũ(30ABh), BX=BX cũ(23AAh), CX=AX cũ(12DDh)."},

{set:"exam2023",topic:"addressing",text:"Cần bao nhiêu byte để mã hóa lệnh MOV AL, [SI+20]?",
 options:["3","1","4","2"],answer:0,
 explanation:"Opcode(1) + ModR/M(1) + Disp8(1) = 3 byte."},

{set:"exam2023",topic:"number",text:"Lý do mã bù 2 được dùng nhiều:",
 options:["Dải giá trị rộng hơn","Dễ nhận diện","Thuận tiện khi cộng trừ","Số bit ít hơn"],answer:2,
 explanation:"Bù 2: dùng cùng mạch cộng cho signed/unsigned. Phép trừ = cộng bù 2."},

{set:"exam2023",topic:"arch",text:"Vi xử lý có chức năng gì?",
 options:["Biến đổi dữ liệu","Trao đổi dữ liệu","Thực hiện lệnh","Quản lý bộ nhớ"],answer:2,
 explanation:"Chức năng cốt lõi VXL: Fetch → Decode → Execute (nhận, giải mã, thực thi lệnh)."},

{set:"exam2023",topic:"addressing",text:"Lệnh MOV AL, [1235h] là chế độ địa chỉ nào?",
 options:["Tức thì","Thanh ghi","Trực tiếp","Tương đối cơ sở"],answer:2,
 explanation:"[1235h] = địa chỉ bộ nhớ cố định trong mã lệnh → trực tiếp (Direct)."},

{set:"exam2023",topic:"trace",text:"Đoạn lệnh phải thực hiện bao nhiêu lần mới ra khỏi vòng lặp?",
 code:"    MOV AL, 7\nTIEP:\n    INC AL\n    SUB AL, 2\n    CMP AL, 0\n    JNL TIEP",
 options:["8","6","7","5"],answer:0,
 explanation:"Mỗi vòng AL giảm ròng 1: 7→6→5→4→3→2→1→0→(-1 thoát). JNL nhảy khi ≥0, AL=0 vẫn nhảy → 8 lần."},

{set:"exam2023",topic:"arch",text:"Tương quan thanh ghi đoạn khi biên dịch chương trình EXE:",
 options:["CS ≠ DS ≠ SS","CS = DS = SS","CS = DS ≠ SS","CS ≠ DS = SS"],answer:0,
 explanation:"EXE: 3 đoạn tách biệt (Code/Data/Stack). COM: CS=DS=SS=ES."},

{set:"exam2023",topic:"arch",text:"Điểm khác nhau cơ bản giữa 8088 và 8086:",
 options:["Kích thước thanh ghi cờ","Kích thước hàng đệm lệnh","Số lượng thanh ghi đa năng","Cả 3"],answer:1,
 explanation:"8086: data bus 16-bit, hàng đợi 6 byte. 8088: data bus 8-bit, hàng đợi 4 byte."},

{set:"exam2023",topic:"arch",text:"Hệ thống bus của một hệ vi xử lý gồm mấy loại bus?",
 options:["2","4","1","3"],answer:3,
 explanation:"3 loại: Address Bus, Data Bus, Control Bus."},

{set:"exam2023",topic:"instruction",text:"Lệnh nào có tốc độ nhanh nhất để nhân đôi AX (biết BX=2)?",
 options:["MUL BX","SHL AX, 1","ADD AX, AX","Bằng nhau"],answer:1,
 explanation:"SHL AX,1 = 2 chu kỳ. ADD AX,AX = 3 chu kỳ. MUL ≈ 120 chu kỳ."},

{set:"exam2023",topic:"flags",text:"Lệnh sau cho kết quả cờ nào đúng?\nMOV AX, 0FF08h\nTEST AX, 07h",
 options:["S=1 và C=1","O=1 và D=1","A=1 và I=1","Z=1 (kết quả = 0)"],answer:3,
 explanation:"FF08h AND 0007h = 0000h. Kết quả = 0 → ZF=1, SF=0, CF=0 (TEST luôn xóa CF), OF=0."},

{set:"exam2023",topic:"trace",text:"Đoạn lệnh có tác dụng gì?",
 code:"MOV BX, 10\nLAP:\n  XOR DX, DX\n  DIV BX\n  INC CX\n  OR  DL, 30H\n  PUSH DX\n  TEST AX, AX\n  JNZ LAP",
 options:["Lấy các chữ số thập phân của AX","Tìm USCLN của AX và BX","Lấy chữ số nhị phân","Lấy chữ số thập lục phân"],answer:0,
 explanation:"Chia AX cho 10, lấy DL (phần dư=chữ số), OR 30h→ASCII, PUSH lên stack. Lặp đến AX=0."},

{set:"exam2023",topic:"instruction",text:"Tập lệnh của 8086 có thể được dùng trên các vi xử lý nào?",
 options:["Vi điều khiển","VXL thế hệ trước","Các VXL thế hệ sau","Cả 3 sai"],answer:2,
 explanation:"Intel giữ tương thích ngược: 80286, 80386, Pentium... đều chạy lệnh 8086."},

{set:"exam2023",topic:"arch",text:"Chế độ địa chỉ bảo vệ (Protected mode) xác định cho đoạn bộ nhớ:",
 options:["Đoạn cố định 64 KB","Ở địa chỉ bất kỳ và độ dài khác nhau","Tối đa 1MB","Cả 3 sai"],answer:1,
 explanation:"Protected mode: segment bắt đầu tại địa chỉ bất kỳ, độ dài linh hoạt, có bảo vệ."},

{set:"exam2023",topic:"number",text:"Biểu diễn nhị phân bù 2 của −120 là:",
 options:["11000001","10001000","00111001","01001010"],answer:1,
 explanation:"120 = 01111000. Đảo: 10000111. +1: 10001000. Vậy −120 = 10001000."},

{set:"exam2023",topic:"trace",text:"AX bằng bao nhiêu sau đoạn chương trình?",
 code:"XOR AX, AX\nLap:\n  INC AL\n  ADD AH, AL\n  CMP AL, 12h\n  JNE Lap",
 options:["82AEh","32DBh","AB12h","DC42h"],answer:2,
 explanation:"AL: 1→18 (12h). AH = tổng 1+2+...+18 = 18×19/2 = 171 = ABh. AX = AB12h."},

{set:"exam2023",topic:"register",text:"Khi thực hiện IN/OUT, thanh ghi nào thường chứa địa chỉ cổng?",
 options:["AL","DL","AX","DX"],answer:3,
 explanation:"Port 0-255: trong lệnh. Port 0-65535: dùng DX (IN AX,DX)."},

{set:"exam2023",topic:"arch",text:"CU (Control Unit) có chức năng nào?",
 options:["Xử lý các thanh ghi","Xử lý phép toán số học/logic","Ghép nối bộ nhớ","Nhận, giải mã và xử lý lệnh"],answer:3,
 explanation:"CU: Fetch→Decode→Execute. ALU mới thực hiện phép toán."},

{set:"exam2023",topic:"flags",text:"Bit cờ nào SAI, sau đoạn chương trình?\nMOV AX, 54E4h / MOV BX, 3F5Dh / SUB AL, BL",
 options:["AF = 1","OF = 0","SF = 0","CF = 0"],answer:2,
 explanation:"E4h−5Dh=87h. MSB=1 → SF phải =1 (âm). Đáp án ghi SF=0 là SAI."},

{set:"exam2023",topic:"number",text:"Khoảng biểu diễn số có dấu 8 bit:",
 options:["0 đến 255","0 đến 128","−255 đến 254","−128 đến 127"],answer:3,
 explanation:"8-bit bù 2: 10000000 = −128, 01111111 = +127."},

// ================================================================
//  ĐỀ LUYỆN TẬP - 30 câu
// ================================================================
{set:"practice",topic:"trace",text:"Giá trị AX sau đoạn code?",
 code:"MOV AX, 0\nMOV CX, 5\nLAP:\n  ADD AX, CX\n  LOOP LAP",
 options:["10h","000Fh","000Ah","0005h"],answer:1,
 explanation:"AX = 5+4+3+2+1 = 15 = 0Fh. LOOP giảm CX trước kiểm tra."},

{set:"practice",topic:"number",text:"5Ah ở hệ 16 bằng bao nhiêu ở hệ bát phân?",
 options:["112","132","152","172"],answer:1,
 explanation:"5Ah = 0101_1010 → nhóm 3 bit: 001|011|010 → 132₈."},

{set:"practice",topic:"addressing",text:"Lệnh nào KHÔNG hợp lệ trên 8086?",
 options:["MOV AX, [BX+SI]","MOV AL, [BP+DI+5]","MOV CX, [AX+2]","MOV DL, [BX]"],answer:2,
 explanation:"[AX+2] sai — AX không dùng làm thanh ghi địa chỉ. Chỉ BX,BP,SI,DI."},

{set:"practice",topic:"register",text:"Thanh ghi nào là bộ đếm ngầm định cho LOOP?",
 options:["AX","BX","CX","DX"],answer:2,
 explanation:"LOOP luôn: CX−1, nhảy nếu CX≠0."},

{set:"practice",topic:"register",text:"Cho AX=1234h, BX=5678h. Sau XCHG AX, BX, AX = ?",
 options:["1234h","5678h","68ACh","0000h"],answer:1,
 explanation:"XCHG hoán đổi: AX↔BX."},

{set:"practice",topic:"number",text:"Biểu diễn bù 2 (8-bit) của −50 là?",
 options:["10110010","11001110","11010010","10101010"],answer:1,
 explanation:"50=00110010. Đảo:11001101. +1:11001110 = CEh."},

{set:"practice",topic:"instruction",text:"Lệnh LEA BX, [SI+10h] thực hiện điều gì?",
 options:["Nạp nội dung ô nhớ DS:(SI+10h) vào BX","Nạp địa chỉ hiệu dụng (SI+10h) vào BX","Nạp 10h vào BX","Ghi BX vào [SI+10h]"],answer:1,
 explanation:"LEA = Load Effective Address: tính địa chỉ, không truy cập bộ nhớ. BX = SI+10h."},

{set:"practice",topic:"arch",text:"Hàng đợi lệnh (Prefetch Queue) của 8086 có kích thước?",
 options:["4 byte","6 byte","8 byte","16 byte"],answer:1,
 explanation:"8086 = 6 byte; 8088 = 4 byte."},

{set:"practice",topic:"stack",text:"Cho SS:2000 → AA BB CC DD EE FF. SP=2002. Sau POP BX, BX = ?",
 options:["BBAAh","CCDDh","DDCCh","CCBBh"],answer:2,
 explanation:"Little-endian: [2002]=CC→BL, [2003]=DD→BH. BX = DDCCh."},

{set:"practice",topic:"instruction",text:"Lệnh nào xóa thanh ghi AX nhanh nhất?",
 options:["MOV AX, 0","SUB AX, AX","XOR AX, AX","SUB và XOR bằng nhau"],answer:3,
 explanation:"XOR/SUB: 2 byte, 3 chu kỳ. MOV AX,0: 3 byte. XOR thường được ưa chuộng."},

{set:"practice",topic:"flags",text:"Sau CMP AL, BL với AL=30h, BL=30h, cờ nào bật?",
 options:["CF = 1","ZF = 1","SF = 1","OF = 1"],answer:1,
 explanation:"CMP 30h−30h = 0 → ZF=1, CF=0, SF=0, OF=0."},

{set:"practice",topic:"addressing",text:"Chế độ địa chỉ của MOV AX, [BX+SI+8]?",
 options:["Trực tiếp","Gián tiếp thanh ghi","Cơ sở + chỉ số + dịch chuyển","Tức thì"],answer:2,
 explanation:"Base(BX) + Index(SI) + Displacement(8)."},

{set:"practice",topic:"addressing",text:"Địa chỉ vật lý khi DS=2000h, SI=0300h là?",
 options:["20300h","23000h","02300h","20030h"],answer:0,
 explanation:"PA = 2000h×10h + 0300h = 20000h + 0300h = 20300h."},

{set:"practice",topic:"instruction",text:"Lệnh REP MOVSB sử dụng thanh ghi nào?",
 options:["AX, BX, CX","SI, DI, CX","AX, SI, DI","BX, SI, CX"],answer:1,
 explanation:"REP MOVSB: nguồn DS:SI, đích ES:DI, đếm CX."},

{set:"practice",topic:"stack",text:"Khi thực hiện PUSH AX, SP thay đổi?",
 options:["SP + 1","SP + 2","SP − 1","SP − 2"],answer:3,
 explanation:"Stack grows down: PUSH giảm SP đi 2 (word)."},

{set:"practice",topic:"flags",text:"Cho AX=FFFFh. Sau INC AX, AX và CF?",
 options:["AX=0000h, CF=1","AX=0000h, CF=0 (không đổi)","AX=0001h, CF=0","AX=10000h, CF=1"],answer:1,
 explanation:"INC/DEC KHÔNG ảnh hưởng CF! FFFFh+1=0000h, ZF=1, nhưng CF giữ nguyên."},

{set:"practice",topic:"register",text:"INT 21h/09h dùng thanh ghi nào trỏ chuỗi?",
 options:["BX","SI","DX","DI"],answer:2,
 explanation:"INT 21h/09h: DS:DX trỏ chuỗi kết thúc '$'."},

{set:"practice",topic:"arch",text:"Trong chương trình .COM, quan hệ thanh ghi đoạn?",
 options:["CS=DS=SS=ES","CS≠DS≠SS","CS=DS≠SS","CS≠DS=SS"],answer:0,
 explanation:".COM: tất cả segment trỏ cùng 1 đoạn 64KB."},

{set:"practice",topic:"arch",text:"Bus địa chỉ 20-bit của 8086 địa chỉ hóa tối đa?",
 options:["64 KB","256 KB","1 MB","4 GB"],answer:2,
 explanation:"2²⁰ = 1,048,576 byte = 1 MB."},

{set:"practice",topic:"instruction",text:"SHR AX, 1 tương đương phép toán gì (unsigned)?",
 options:["AX × 2","AX ÷ 2","AX mod 2","AX − 1"],answer:1,
 explanation:"SHR 1 = dịch phải 1 bit = chia 2 (unsigned)."},

{set:"practice",topic:"trace",text:"Sau đoạn code, AL = ?",
 code:"MOV AL, 0Fh\nAND AL, 3Ch",
 options:["33h","0Ch","3Fh","00h"],answer:1,
 explanation:"0Fh AND 3Ch: 00001111 AND 00111100 = 00001100 = 0Ch."},

{set:"practice",topic:"addressing",text:"Đoạn ngầm định khi dùng [BP+4]?",
 options:["CS","DS","SS","ES"],answer:2,
 explanation:"BP → SS. BX/SI/DI → DS."},

{set:"practice",topic:"trace",text:"NOT AL với AL=5Ah cho?",
 options:["A5h","5Ah","00h","FFh"],answer:0,
 explanation:"NOT 01011010 = 10100101 = A5h."},

{set:"practice",topic:"trace",text:"Vòng lặp lồng nhau thực hiện mấy lần?",
 code:"MOV CX, 3\nLAP:\n  PUSH CX\n  MOV CX, 2\n  LAP2: LOOP LAP2\n  POP CX\n  LOOP LAP",
 options:["3","5","6","9"],answer:2,
 explanation:"Vòng ngoài 3 × vòng trong 2 = 6. PUSH/POP CX bảo vệ bộ đếm ngoài."},

{set:"practice",topic:"instruction",text:"Cờ DF=1 ảnh hưởng gì đến lệnh chuỗi?",
 options:["SI/DI tăng","SI/DI giảm","CX tăng","Không ảnh hưởng"],answer:1,
 explanation:"DF=1(STD): SI/DI giảm → xử lý chuỗi từ cao xuống thấp."},

{set:"practice",topic:"arch",text:"BIU trong 8086 chịu trách nhiệm?",
 options:["Giải mã và thực thi lệnh","Quản lý ALU","Nạp lệnh và tính địa chỉ vật lý","Quản lý thanh ghi cờ"],answer:2,
 explanation:"BIU: giao tiếp bus, nạp trước lệnh, tính địa chỉ 20-bit. EU thực thi."},

{set:"practice",topic:"instruction",text:"Lệnh kết thúc chương trình DOS (.EXE)?",
 options:["RET","HLT","MOV AH,4Ch / INT 21h","INT 20h"],answer:2,
 explanation:".EXE: INT 21h/4Ch. .COM có thể INT 20h."},

{set:"practice",topic:"trace",text:"Cho AX=0100h, BX=0040h. Sau DIV BL, AL và AH?",
 options:["AL=4, AH=0","AL=0, AH=4","AL=40h, AH=0","Lỗi chia"],answer:0,
 explanation:"DIV BL: AX÷BL = 256÷64 = 4 dư 0."},

{set:"practice",topic:"register",text:"Thanh ghi nào KHÔNG dùng được trong [...] trên 8086?",
 options:["BX","SI","DX","DI"],answer:2,
 explanation:"DX không dùng trong [...]. Chỉ BX,BP,SI,DI."},

{set:"practice",topic:"number",text:"Số 11001010 bù 2 (8-bit) = giá trị thập phân nào?",
 options:["202","−54","−56","−202"],answer:1,
 explanation:"MSB=1→âm. Đảo:00110101. +1:00110110=54. Vậy = −54."},

// ================================================================
//  ĐỀ NÂNG CAO - 30 câu
// ================================================================
{set:"advanced",topic:"instruction",text:"Cho AX=8000h. Sau NEG AX, AX và OF, CF?",
 options:["AX=8000h, OF=1, CF=1","AX=7FFFh, OF=0, CF=1","AX=8000h, OF=0, CF=0","AX=8001h, OF=1, CF=0"],answer:0,
 explanation:"NEG 8000h = 0−8000h = 8000h (trường hợp đặc biệt). −(−32768)=+32768 vượt dải → OF=1. CF=1 (src≠0)."},

{set:"advanced",topic:"addressing",text:"Địa chỉ 2A3B0h có thể biểu diễn bằng cặp Segment:Offset nào?",
 options:["2A00h:03B0h","2A3Bh:0000h","2000h:0A3Bh","Cả A và B"],answer:3,
 explanation:"A: 2A00h×16+03B0h=2A3B0h ✓. B: 2A3Bh×16+0=2A3B0h ✓. C: 2000h×16+0A3Bh=20A3Bh ✗."},

{set:"advanced",topic:"trace",text:"AX = ? sau đoạn code:",
 code:"MOV AX, 1\nMOV CX, 10\nLAP:\n  SHL AX, 1\n  LOOP LAP",
 options:["0020h","0400h","000Ah","0014h"],answer:1,
 explanation:"SHL 1 lặp 10 lần = AX×2¹⁰. AX = 1×1024 = 0400h."},

{set:"advanced",topic:"stack",text:"Stack [1111h,2222h,3333h,4444h] (đỉnh=4444h). Sau 2 POP rồi PUSH 5555h, đỉnh?",
 options:["5555h","2222h","3333h","1111h"],answer:0,
 explanation:"POP 2 lần lấy 4444h,3333h. Còn [1111h,2222h]. PUSH 5555h → đỉnh=5555h."},

{set:"advanced",topic:"number",text:"Số −1 biểu diễn bù 2 trong 16-bit là?",
 options:["8001h","FFFFh","FF01h","FFFEh"],answer:1,
 explanation:"−1: đảo 0001h→FFFEh, +1→FFFFh. Tất cả bit = 1."},

{set:"advanced",topic:"trace",text:"Sau đoạn code, DX = ?",
 code:"MOV AX, 00C8h  ; AX=200\nMOV BX, 000Ah  ; BX=10\nXOR DX, DX\nDIV BX\nXOR DX, DX\nDIV BX",
 options:["0","2","10","20"],answer:0,
 explanation:"Lần 1: 200÷10 → AX=20, DX=0. Lần 2: XOR DX,DX rồi 20÷10 → AX=2, DX=0."},

{set:"advanced",topic:"instruction",text:"Lệnh MOV [BX], [SI] có hợp lệ không?",
 options:["Hợp lệ","Không — không thể MOV memory-to-memory","Hợp lệ nếu cùng segment","Hợp lệ nếu thêm BYTE PTR"],answer:1,
 explanation:"8086 không hỗ trợ MOV mem→mem. Phải qua thanh ghi: MOV AL,[SI] / MOV [BX],AL."},

{set:"advanced",topic:"flags",text:"AL=80h. Sau ADD AL, 80h: SF, ZF, CF?",
 options:["SF=0, ZF=1, CF=1","SF=1, ZF=0, CF=1","SF=0, ZF=0, CF=0","SF=1, ZF=1, CF=0"],answer:0,
 explanation:"80h+80h=100h. AL=00h(8-bit). CF=1(carry), ZF=1(=0), SF=0(bit7=0). OF cũng =1."},

{set:"advanced",topic:"addressing",text:"Cho DS=1000h, ES=2000h, BX=0100h. MOV AL, ES:[BX] đọc từ PA nào?",
 options:["10100h","20100h","30100h","01000h"],answer:1,
 explanation:"ES:[BX] = ES×16+BX = 20000h+0100h = 20100h."},

{set:"advanced",topic:"flags",text:"Phân biệt TEST AX,AX và CMP AX,0:",
 options:["Cờ hoàn toàn giống","TEST nhanh hơn","CMP thay đổi AX","TEST xóa CF, CMP cập nhật CF bình thường"],answer:3,
 explanation:"TEST (AND) luôn xóa CF=0, OF=0. CMP (SUB) cập nhật CF theo kết quả trừ. Cả hai không đổi AX."},

{set:"advanced",topic:"flags",text:"Lệnh nào KHÔNG ảnh hưởng thanh ghi cờ?",
 options:["ADD AX, 1","MOV AX, BX","AND AL, 0Fh","SUB CX, 1"],answer:1,
 explanation:"MOV không bao giờ thay đổi cờ."},

{set:"advanced",topic:"flags",text:"AX=FFFFh. Sau INC AX rồi ADC BX,0 (BX=0005h). BX=?",
 options:["0005h","0006h","0004h","0000h"],answer:0,
 explanation:"BẪY: INC không đổi CF! FFFFh+1=0000h nhưng CF giữ nguyên (=0). ADC BX,0 = 5+0+0 = 5."},

{set:"advanced",topic:"trace",text:"AX=1234h. Sau XCHG AH,AL rồi ROR AX,4. AX=?",
 options:["4312h","2341h","1234h","4123h"],answer:1,
 explanation:"XCHG: AX=3412h. ROR 4: quay phải 4 bit → 2341h."},

{set:"advanced",topic:"trace",text:"Đoạn code lặp bao nhiêu lần?",
 code:"    MOV CL, 5\nLAP:\n    DEC CL\n    JNZ LAP",
 options:["4","5","6","Vô hạn"],answer:1,
 explanation:"CL: 5→4(nhảy)→3→2→1→0(ZF=1, thoát). 5 lần DEC."},

{set:"advanced",topic:"register",text:"Cặp thanh ghi lưu kết quả nhân 16-bit × 16-bit?",
 options:["AX:BX","DX:AX","AX:CX","BX:DX"],answer:1,
 explanation:"MUL 16-bit: DX:AX = AX×src. DX=16 bit cao."},

{set:"advanced",topic:"instruction",text:"Phân biệt SHR và SAR khi MSB=1:",
 options:["Giống nhau","SHR điền 0, SAR giữ bit dấu","SHR giữ bit dấu, SAR điền 0","Cả hai giữ bit dấu"],answer:1,
 explanation:"SHR (Logic): điền 0 → unsigned. SAR (Arithmetic): giữ MSB → signed."},

{set:"advanced",topic:"instruction",text:"Lệnh CBW làm gì?",
 options:["Chuyển BX thành word","Mở rộng dấu AL thành AX","Xóa AH","Đếm byte trong word"],answer:1,
 explanation:"CBW: AL bit7=0→AH=00h, bit7=1→AH=FFh. Mở rộng dấu."},

{set:"advanced",topic:"trace",text:"Đoạn code đếm gì?",
 code:"XOR CX, CX\nMOV AX, 255\nLAP:\n  SHR AX, 1\n  JC  TANG\n  JMP TIEP\nTANG: INC CX\nTIEP:\n  TEST AX, AX\n  JNZ LAP",
 options:["Số bit 0","Số bit 1","Số lần dịch","AX÷2"],answer:1,
 explanation:"SHR dịch phải, bit ra→CF. JC: nếu CF=1 → INC CX. 255=11111111 → 8 bit 1."},

{set:"advanced",topic:"trace",text:"Cho AX=5A5Ah, BX=A5A5h. Sau XOR AX, BX, AX=?",
 options:["0000h","FFFFh","5A5Ah","A5A5h"],answer:1,
 explanation:"5A5Ah XOR A5A5h = FFFFh. Hai số là bù 1 của nhau."},

{set:"advanced",topic:"instruction",text:"Lệnh LAHF thực hiện gì?",
 options:["Nạp AH vào byte thấp FLAGS","Nạp byte thấp FLAGS vào AH","Nạp AH vào byte cao FLAGS","Xóa cờ"],answer:1,
 explanation:"LAHF = Load AH from Flags: AH ← SF,ZF,AF,PF,CF."},

{set:"advanced",topic:"instruction",text:"Segment Override ES: có opcode?",
 options:["2Eh","26h","36h","3Eh"],answer:1,
 explanation:"CS:=2Eh, ES:=26h, SS:=36h, DS:=3Eh."},

{set:"advanced",topic:"trace",text:"Sau đoạn code, BX=?",
 code:"MOV AX, 4321h\nMOV BX, 0000h\nMOV CX, 4\nLAP:\n  SHL AX, 1\n  RCL BX, 1\n  LOOP LAP",
 options:["0004h","0008h","0003h","4321h"],answer:0,
 explanation:"SHL dịch bit cao AX ra CF, RCL đẩy CF vào BX. 4 bit cao AX=0100₂=4. BX=0004h."},

{set:"advanced",topic:"instruction",text:"Cách đúng nạp DS trong .EXE?",
 options:["MOV DS, @DATA","MOV DS, 1000h","MOV AX,@DATA / MOV DS,AX","Cả A và C"],answer:2,
 explanation:"Không thể MOV immediate→segment register trực tiếp. Phải qua thanh ghi đa năng."},

{set:"advanced",topic:"instruction",text:"Lệnh XLAT (XLATB) làm gì?",
 options:["AL = [DS:BX+AL]","BX = [DS:AL]","AX = [DS:BX]","AL = [ES:DI+AL]"],answer:0,
 explanation:"XLAT: AL = byte tại [DS:BX+AL]. Tra bảng lookup."},

{set:"advanced",topic:"flags",text:"7F00h + 0100h = 8000h. OF=?",
 options:["OF=0","OF=1, tràn signed","OF=1 vì CF=1","OF=0 vì < FFFFh"],answer:1,
 explanation:"2 số dương (MSB=0) cộng ra số âm (MSB=1) → tràn signed → OF=1."},

{set:"advanced",topic:"trace",text:"AX=1234h. PUSH AX / MOV AX,5678h / POP AX / PUSH AX / MOV AX,9ABCh / XCHG AX,[SP]. AX=?",
 options:["1234h","5678h","9ABCh","Không xác định"],answer:0,
 explanation:"PUSH 1234h, AX=5678h, POP→AX=1234h, PUSH 1234h, AX=9ABCh, XCHG AX,[SP]→AX=1234h."},

{set:"advanced",topic:"trace",text:"NOT AL với AL=5Ah cho?",
 options:["A5h","5Ah","00h","FFh"],answer:0,
 explanation:"NOT 0101_1010 = 1010_0101 = A5h. Đảo mọi bit."},

{set:"advanced",topic:"flags",text:"Cho AX=54E4h, BX=3F5Dh. Sau SUB AL,BL: AF = ?",
 options:["AF = 1","AF = 0","AF không xác định","AF không bị ảnh hưởng"],answer:0,
 explanation:"Nibble thấp: 4h−Dh = 4−13 → cần mượn → AF=1."},

// ================================================================
//  ĐỀ BỔ SUNG CHUYÊN SÂU - 30 câu
// ================================================================
{set:"extra",topic:"trace",text:"Giá trị CX sau đoạn code?",
 code:"MOV AX, 1234h\nMOV CX, 0\nLAP:\n  AND AX, AX\n  JZ  DONE\n  SHR AX, 1\n  INC CX\n  JMP LAP\nDONE:",
 options:["13","16","12","8"],answer:0,
 explanation:"Đếm số lần dịch phải cho đến AX=0. 1234h=0001001000110100₂. Bit cao nhất ở vị trí 12 (bit 12). Cần 13 lần dịch (bit 12→0)."},

{set:"extra",topic:"flags",text:"MOV AL, 7Fh / ADD AL, 1. Giá trị OF?",
 options:["OF=0","OF=1","Không xác định","OF=CF"],answer:1,
 explanation:"7Fh(+127)+1=80h(−128). Số dương +1 ra số âm → tràn signed → OF=1. CF=0."},

{set:"extra",topic:"instruction",text:"Lệnh nào tương đương MOV AX, 0?",
 options:["XOR AX, AX","AND AX, 0","SUB AX, AX","Tất cả đều tương đương"],answer:3,
 explanation:"Cả 3 đều cho AX=0. XOR/SUB: 2 byte. AND/MOV: 3 byte. Nhưng XOR/SUB xóa CF/OF."},

{set:"extra",topic:"register",text:"Lệnh PUSH có thể dùng với toán hạng nào?",
 options:["Chỉ thanh ghi 16-bit","Thanh ghi 16-bit và ô nhớ word","Thanh ghi 8-bit","Hằng số bất kỳ"],answer:1,
 explanation:"8086 PUSH: thanh ghi 16-bit (AX,BX...), segment (CS,DS...) hoặc word memory. Không PUSH 8-bit."},

{set:"extra",topic:"trace",text:"Sau đoạn code, AX = ?",
 code:"MOV AX, 0ABCDh\nROL AX, 8",
 options:["CDABh","ABCDh","DCBAh","BACDh"],answer:0,
 explanation:"ROL 8: quay trái 8 bit = hoán đổi AH↔AL. ABCDh → CDABh."},

{set:"extra",topic:"stack",text:"SP=FFFEh ban đầu. Sau 3 lệnh PUSH, SP = ?",
 options:["FFF8h","FFFBh","FFF5h","FFF4h"],answer:0,
 explanation:"Mỗi PUSH: SP−2. 3 PUSH: FFFEh − 6 = FFF8h."},

{set:"extra",topic:"addressing",text:"[BX+BP] có hợp lệ trên 8086?",
 options:["Hợp lệ","Không — 2 base cùng lúc","Hợp lệ nếu thêm disp","Hợp lệ với segment override"],answer:1,
 explanation:"8086: tối đa 1 base (BX/BP) + 1 index (SI/DI). Không dùng 2 base cùng lúc."},

{set:"extra",topic:"instruction",text:"Lệnh LOOP khác DEC CX / JNZ ở điểm nào?",
 options:["LOOP nhanh hơn","LOOP không ảnh hưởng cờ, DEC/JNZ thì có","LOOP dùng CX, DEC/JNZ dùng bất kỳ","LOOP và DEC CX/JNZ hoàn toàn giống nhau"],answer:1,
 explanation:"LOOP: giảm CX và nhảy, KHÔNG đổi cờ. DEC CX thay đổi ZF,SF,PF,OF,AF."},

{set:"extra",topic:"trace",text:"Giá trị AL sau đoạn code?",
 code:"MOV AL, 0F0h\nMOV CL, 4\nSAR AL, CL",
 options:["0Fh","FFh","F0h","00h"],answer:1,
 explanation:"SAR giữ bit dấu. F0h=11110000. SAR 4: 11111111 = FFh. Bit dấu (1) được lặp lại."},

{set:"extra",topic:"flags",text:"Sau NEG AL với AL=0, CF = ?",
 options:["CF=1","CF=0","Không xác định","CF giữ nguyên"],answer:1,
 explanation:"NEG: CF=1 trừ khi toán hạng = 0. NEG 0 = 0, CF=0 (trường hợp duy nhất)."},

{set:"extra",topic:"register",text:"Thanh ghi nào CPU 8086 KHÔNG cho phép truy cập trực tiếp?",
 options:["AX","IP","FLAGS","BP"],answer:1,
 explanation:"IP (Instruction Pointer) do CPU tự quản lý. Không có lệnh MOV IP,... hay MOV AX,IP."},

{set:"extra",topic:"trace",text:"Sau đoạn code, AX=?",
 code:"MOV AX, 1\nMOV BX, 1\nMOV CX, 8\nLAP:\n  MOV DX, AX\n  ADD AX, BX\n  MOV BX, DX\n  LOOP LAP",
 options:["34","55","21","89"],answer:0,
 explanation:"Dãy Fibonacci: 1,1,2,3,5,8,13,21,34. Sau 8 lần cộng: AX=F(10)=34. (BX theo sau 1 bước)."},

{set:"extra",topic:"addressing",text:"Đoạn ngầm định khi lệnh chuỗi dùng DI là?",
 options:["CS","DS","SS","ES"],answer:3,
 explanation:"Lệnh chuỗi: đích luôn ES:DI (không override được). Nguồn: DS:SI (override được)."},

{set:"extra",topic:"instruction",text:"STI và CLI ảnh hưởng cờ nào?",
 options:["SF","ZF","IF","CF"],answer:2,
 explanation:"STI: IF=1 (cho phép ngắt). CLI: IF=0 (cấm ngắt). Chỉ ảnh hưởng Interrupt Flag."},

{set:"extra",topic:"trace",text:"AX=0FFh. Sau CBW, AX=?",
 options:["00FFh","FFFFh","FF00h","0000h"],answer:1,
 explanation:"CBW: mở rộng dấu AL→AX. AL=FFh (bit7=1) → AH=FFh. AX=FFFFh = −1."},

{set:"extra",topic:"stack",text:"PUSH AX / PUSH BX / POP AX / PUSH CX / POP BX / POP CX. AX ban đầu=1, BX=2, CX=3. Kết quả?",
 options:["AX=2, BX=3, CX=1","AX=3, BX=2, CX=1","AX=2, BX=1, CX=3","AX=1, BX=3, CX=2"],answer:0,
 explanation:"Stack: [1,2]. POP AX=2. PUSH 3→[1,3]. POP BX=3. POP CX=1. KQ: AX=2,BX=3,CX=1."},

{set:"extra",topic:"trace",text:"Sau đoạn code, DL=?",
 code:"MOV AX, 156\nMOV BL, 10\nDIV BL\n; AL=15, AH=6\nXOR AH, AH\nDIV BL\n; AL=1, AH=5",
 options:["6","5","1","15"],answer:1,
 explanation:"156÷10: AL=15, AH=6. XOR AH,AH: AX=000Fh=15. 15÷10: AL=1, AH=5. DL không liên quan trực tiếp, nhưng câu hỏi chỉ hàng đơn vị cuối = AH=5."},

{set:"extra",topic:"flags",text:"CMP AX, BX với AX=8000h, BX=0001h. OF=? (số có dấu: −32768 − 1)",
 options:["OF=0","OF=1","Không xác định","OF=CF"],answer:1,
 explanation:"−32768 − 1 = −32769 vượt dải signed 16-bit [−32768,32767] → OF=1."},

{set:"extra",topic:"instruction",text:"Lệnh CWD (Convert Word to Doubleword) làm gì?",
 options:["Mở rộng dấu AX → DX:AX","DX = AX","Mở rộng dấu AL → AX","AX = DX"],answer:0,
 explanation:"CWD: nếu AX ≥ 0→DX=0000h. Nếu AX < 0→DX=FFFFh. Dùng trước IDIV."},

{set:"extra",topic:"trace",text:"Sau đoạn code, ZF=?",
 code:"MOV AX, 5\nMOV BX, 5\nSUB AX, BX\nINC AX",
 options:["ZF=1","ZF=0","Không xác định","ZF=CF"],answer:1,
 explanation:"SUB: 5−5=0, ZF=1. INC AX: 0+1=1≠0 → ZF=0."},

{set:"extra",topic:"arch",text:"8086 hoạt động ở chế độ nào?",
 options:["Chỉ Real Mode","Chỉ Protected Mode","Cả Real và Protected","Flat Mode"],answer:0,
 explanation:"8086 chỉ có Real Mode. Protected Mode từ 80286 trở lên."},

{set:"extra",topic:"number",text:"Phép 7Fh + 01h cho kết quả cờ gì đặc biệt?",
 options:["CF=1","OF=1, SF=1","ZF=1","Không có gì đặc biệt"],answer:1,
 explanation:"7Fh(+127)+01h=80h(−128). Số dương→số âm: OF=1 (tràn signed). MSB=1: SF=1. CF=0(unsigned OK)."},

{set:"extra",topic:"instruction",text:"DAA (Decimal Adjust after Addition) dùng khi nào?",
 options:["Sau ADD/ADC hai số BCD packed","Sau bất kỳ phép cộng nào","Trước phép cộng","Sau phép nhân BCD"],answer:0,
 explanation:"DAA chỉ có ý nghĩa sau ADD/ADC hai số BCD packed. Điều chỉnh AL nếu nibble > 9 hoặc AF/CF=1."},

{set:"extra",topic:"trace",text:"MOV AL, 39h / MOV BL, 47h / ADD AL, BL / DAA. AL=?",
 options:["86h","80h","06h","96h"],answer:0,
 explanation:"39h+47h=80h. DAA: nibble thấp=0≤9→OK, nibble cao=8≤9→OK, AF=0, CF=0. Nhưng đợi: 39+47 BCD = 86. 80h: low=0, cộng 6? Hmm: 9+7=16→nibble=0,AF=1→cộng 6: 80h+06h=86h. AL=86h."},

{set:"extra",topic:"register",text:"Thanh ghi nào dùng ngầm định cho lệnh MUL?",
 options:["BX","CX","AX (AL cho 8-bit, AX cho 16-bit)","DX"],answer:2,
 explanation:"MUL 8-bit: AX = AL×src. MUL 16-bit: DX:AX = AX×src. AX luôn là toán hạng ngầm định."},

{set:"extra",topic:"instruction",text:"Lệnh IRET khác RET ở điểm nào?",
 options:["IRET nhanh hơn","IRET POP thêm FLAGS ngoài CS:IP","IRET dùng cho CALL, RET dùng cho INT","Không khác nhau"],answer:1,
 explanation:"RET: POP IP (NEAR) hoặc POP IP,CS (FAR). IRET: POP IP, CS, FLAGS — khôi phục cờ."},

{set:"extra",topic:"arch",text:"Pipeline sơ khai trong 8086 hoạt động như thế nào?",
 options:["BIU nạp lệnh song song với EU thực thi","BIU và EU tuần tự","EU nạp lệnh, BIU thực thi","Không có pipeline"],answer:0,
 explanation:"BIU nạp trước lệnh vào hàng đợi 6 byte TRONG KHI EU đang thực thi lệnh hiện tại."},

{set:"extra",topic:"trace",text:"Chương trình đổi chữ hoa→thường. Lệnh gì điền vào ???",
 code:"; Đổi 'A'→'a': thêm 20h\nMOV AL, 'A'   ; AL=41h\n??? AL, 20h    ; AL=61h='a'",
 options:["OR","AND","XOR","ADD"],answer:0,
 explanation:"OR AL,20h: set bit 5 → 41h|20h=61h='a'. ADD cũng được nhưng OR an toàn hơn (idempotent)."},

{set:"extra",topic:"trace",text:"Chương trình đổi chữ thường→hoa. Lệnh gì?",
 code:"; Đổi 'a'→'A': xóa bit 5\nMOV AL, 'a'   ; AL=61h\n??? AL, 0DFh   ; AL=41h='A'",
 options:["OR","AND","XOR","SUB"],answer:1,
 explanation:"AND AL,0DFh: xóa bit 5 → 61h & DFh = 41h='A'. DFh = 1101_1111."},
];
