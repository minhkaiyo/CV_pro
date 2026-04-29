import google.generativeai as genai
import sys
import io

# Fix Unicode
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

api_key = "AIzaSyCQvVNUAtyDztAj4JXrYuS355TNnxSKc4c"
genai.configure(api_key=api_key)

print(f"--- Đang liệt kê toàn bộ model khả dụng cho Key của bạn ---")


try:
    available_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            available_models.append(m.name)
            print(f"- {m.name}")
    
    if available_models:
        # Lấy model đầu tiên trong danh sách để test
        target_model = available_models[0]
        print(f"\n--- Thử chat với model: {target_model} ---")
        model = genai.GenerativeModel(target_model)
        response = model.generate_content("Xin chào!")
        print("Kết quả:")
        print(response.text)
    else:
        print("Không tìm thấy model nào hỗ trợ generateContent.")
        
except Exception as e:
    print(f"Lỗi: {e}")
