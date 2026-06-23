import { Check, X } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Chọn gói phù hợp với mục tiêu của bạn</h1>
          <p className="text-lg text-slate-600">Đầu tư vào sự nghiệp ngay hôm nay. Hủy bất cứ lúc nào.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Miễn phí</h3>
            <div className="text-4xl font-black text-slate-900 mb-6">0đ<span className="text-lg text-slate-500 font-medium">/tháng</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-slate-600"><Check className="w-5 h-5 text-green-500 mr-3 shrink-0"/> Phân tích ATS (1 lần/ngày)</li>
              <li className="flex items-center text-slate-600"><Check className="w-5 h-5 text-green-500 mr-3 shrink-0"/> Chấm điểm chi tiết cơ bản</li>
              <li className="flex items-center text-slate-400"><X className="w-5 h-5 mr-3 shrink-0"/> Sinh phiên bản CV tự động</li>
              <li className="flex items-center text-slate-400"><X className="w-5 h-5 mr-3 shrink-0"/> Giả lập HR & Dự đoán xác suất</li>
            </ul>
            <button className="w-full bg-slate-100 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition">Đăng ký miễn phí</button>
          </div>

          {/* Premium Tier */}
          <div className="bg-blue-600 rounded-3xl p-8 border border-blue-500 shadow-xl shadow-blue-200 flex flex-col relative transform scale-105">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-900 font-bold px-4 py-1 rounded-full text-sm">
              Phổ biến nhất
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Premium ⭐</h3>
            <div className="text-4xl font-black text-white mb-6">49.000đ<span className="text-lg text-blue-200 font-medium">/tháng</span></div>
            <ul className="space-y-4 mb-8 flex-1 text-white">
              <li className="flex items-center"><Check className="w-5 h-5 text-blue-200 mr-3 shrink-0"/> Phân tích ATS không giới hạn</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-blue-200 mr-3 shrink-0"/> Chấm điểm toàn diện 6 tiêu chí</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-blue-200 mr-3 shrink-0"/> Sinh tối đa 10 phiên bản CV/tháng</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-amber-400 mr-3 shrink-0"/> Giả lập HR & Dự đoán xác suất</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-blue-200 mr-3 shrink-0"/> Xuất file PDF / DOCX chuẩn</li>
            </ul>
            <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition">Nâng cấp Premium</button>
          </div>

          {/* B2B Tier */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">B2B (Đại học/Trung tâm)</h3>
            <div className="text-4xl font-black text-slate-900 mb-6">Liên hệ</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-slate-600"><Check className="w-5 h-5 text-green-500 mr-3 shrink-0"/> Mọi tính năng của Premium</li>
              <li className="flex items-center text-slate-600"><Check className="w-5 h-5 text-green-500 mr-3 shrink-0"/> Admin portal quản lý sinh viên</li>
              <li className="flex items-center text-slate-600"><Check className="w-5 h-5 text-green-500 mr-3 shrink-0"/> Tùy chỉnh Logo & Tên miền</li>
              <li className="flex items-center text-slate-600"><Check className="w-5 h-5 text-green-500 mr-3 shrink-0"/> API Endpoint tích hợp hệ thống</li>
            </ul>
            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">Nhận báo giá</button>
          </div>
        </div>
      </div>
    </div>
  );
}
