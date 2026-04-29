import os
import re

def process_raw_exam(input_path, output_path, exam_id, exam_title):
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = content.split('----------------------------------------')
    js_code = f"// ---- Build {exam_title} ----\n(function() {{\n    var html = '';\n\n"

    for q_idx, q_text in enumerate(questions):
        q_text = q_text.strip()
        if not q_text:
            continue
        
        # Extract Question Title (e.g. Câu 1 (1 điểm) or Câu 1)
        lines = q_text.split('\n')
        title = lines[0].strip()
        body_lines = lines[1:]

        # Create body HTML
        body_html = ""
        for line in body_lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect math definitions (containing =)
            if ' = ' in line and not line.startswith('a)') and not line.startswith('b)'):
                body_html += f"        math('{line}') +\n"
            elif re.match(r'^[a-d]\)', line):
                # Detected sub-part
                part_title = line[:2]
                part_content = line[2:].strip()
                body_html += f"        '<p class=\"sub-part\"><b>{part_title}</b> {part_content}</p>' +\n"
            else:
                body_html += f"        '<p>{line}</p>' +\n"
        
        # Clean up last plus sign
        if body_html.endswith(' +\n'):
            body_html = body_html[:-3] + '\n'

        js_code += f"    // {title}\n"
        js_code += f"    html += q('{title}',\n"
        js_code += body_html
        js_code += "    );\n\n"

    js_code += f"    examsData.push({{ id: '{exam_id}', title: '{exam_title}', html: html }});\n}})();\n"

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"✅ Đã tạo format thành công. Tham khảo kết quả trong file {output_path}")

if __name__ == "__main__":
    print('🌸 TRẢI NGHIỆM TẠO ĐỀ NHANH 🌸')
    # Default file names
    IN_FILE = "raw_exam.txt"
    OUT_FILE = "formatted_exam.js"
    
    if not os.path.exists(IN_FILE):
        print(f"Tạo file '{IN_FILE}' và dán nội dung chữ thô của đề vào đó, sau đó chạy lại script này!")
        with open(IN_FILE, 'w', encoding='utf-8') as f:
            f.write("Câu 1\n\nCho hệ thống...\ny(n) = x(n) + x(n-1)\n\na) Tìm H(z)\n")
    else:
        # Prompt details
        exam_id = input("Nhập ID đề (VD: mid-3-origin): ") or "new-exam-id"
        exam_title = input("Nhập Tên đề (VD: Đề Giữa Kỳ 3): ") or "Đề Tạo Mới"
        process_raw_exam(IN_FILE, OUT_FILE, exam_id, exam_title)
